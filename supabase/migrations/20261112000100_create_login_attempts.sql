
-- =========================================================
-- LOGIN SECURITY
-- Account lockout: 3 failed attempts, 60-second cooldown
-- IP protection: 20 failed attempts, 15-minute window
-- =========================================================


-- =========================================================
-- 1. ACCOUNT LOGIN ATTEMPTS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.login_attempts (
    email_hash TEXT PRIMARY KEY
        CHECK (email_hash ~ '^[0-9a-f]{64}$'),

    failed_attempts INTEGER NOT NULL DEFAULT 0
        CHECK (failed_attempts >= 0),

    locked_until TIMESTAMPTZ,

    last_failed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 2. IP LOGIN ATTEMPTS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.login_ip_attempts (
    ip_hash TEXT PRIMARY KEY
        CHECK (ip_hash ~ '^[0-9a-f]{64}$'),

    failed_attempts INTEGER NOT NULL DEFAULT 0
        CHECK (failed_attempts >= 0),

    window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    blocked_until TIMESTAMPTZ,

    last_failed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE public.login_attempts
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.login_ip_attempts
    ENABLE ROW LEVEL SECURITY;


-- No direct access from browser clients.

REVOKE ALL ON TABLE public.login_attempts
    FROM PUBLIC, anon, authenticated;

REVOKE ALL ON TABLE public.login_ip_attempts
    FROM PUBLIC, anon, authenticated;


-- =========================================================
-- 4. CHECK LOGIN LOCK STATUS
-- =========================================================
-- Called before Supabase Auth verifies the password.
--
-- Expired account locks are cleared.
-- Expired IP windows are reset.
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_login_lock_status(
    p_email_hash TEXT,
    p_ip_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email_failed_attempts INTEGER := 0;
    v_email_locked_until TIMESTAMPTZ := NULL;

    v_ip_failed_attempts INTEGER := 0;
    v_ip_blocked_until TIMESTAMPTZ := NULL;

    v_now TIMESTAMPTZ := NOW();
BEGIN

    -- Validate the account hash.

    IF p_email_hash IS NULL
       OR p_email_hash !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Invalid email hash';
    END IF;


    -- Ensure an account record exists.

    INSERT INTO public.login_attempts (
        email_hash
    )
    VALUES (
        p_email_hash
    )
    ON CONFLICT (email_hash) DO NOTHING;


    -- Lock the account row while checking its state.

    SELECT
        failed_attempts,
        locked_until
    INTO
        v_email_failed_attempts,
        v_email_locked_until
    FROM public.login_attempts
    WHERE email_hash = p_email_hash
    FOR UPDATE;


    -- Clear an expired account lock.

    IF v_email_locked_until IS NOT NULL
       AND v_email_locked_until <= v_now THEN

        UPDATE public.login_attempts
        SET
            failed_attempts = 0,
            locked_until = NULL,
            updated_at = v_now
        WHERE email_hash = p_email_hash;

        v_email_failed_attempts := 0;
        v_email_locked_until := NULL;

    END IF;


    -- Check IP protection when an IP hash is available.

    IF p_ip_hash IS NOT NULL THEN

        IF p_ip_hash !~ '^[0-9a-f]{64}$' THEN
            RAISE EXCEPTION 'Invalid IP hash';
        END IF;


        INSERT INTO public.login_ip_attempts (
            ip_hash
        )
        VALUES (
            p_ip_hash
        )
        ON CONFLICT (ip_hash) DO NOTHING;


        SELECT
            failed_attempts,
            blocked_until
        INTO
            v_ip_failed_attempts,
            v_ip_blocked_until
        FROM public.login_ip_attempts
        WHERE ip_hash = p_ip_hash
        FOR UPDATE;


        -- Reset an expired 15-minute IP window.

        IF EXISTS (
            SELECT 1
            FROM public.login_ip_attempts
            WHERE ip_hash = p_ip_hash
              AND window_started_at <= v_now - INTERVAL '15 minutes'
        ) THEN

            UPDATE public.login_ip_attempts
            SET
                failed_attempts = 0,
                window_started_at = v_now,
                blocked_until = NULL,
                updated_at = v_now
            WHERE ip_hash = p_ip_hash;

            v_ip_failed_attempts := 0;
            v_ip_blocked_until := NULL;

        END IF;

    END IF;


    RETURN JSONB_BUILD_OBJECT(
        'failed_attempts',
            COALESCE(v_email_failed_attempts, 0),

        'locked_until',
            v_email_locked_until,

        'ip_failed_attempts',
            COALESCE(v_ip_failed_attempts, 0),

        'ip_blocked_until',
            v_ip_blocked_until
    );

END;
$$;


-- =========================================================
-- 5. RECORD A FAILED LOGIN
-- =========================================================
-- Account:
--   Third failed attempt activates a 60-second lock.
--
-- IP:
--   Twentieth failed attempt within 15 minutes activates
--   a 15-minute IP block.
-- =========================================================

CREATE OR REPLACE FUNCTION public.record_login_failure(
    p_email_hash TEXT,
    p_ip_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_status JSONB;

    v_email_failed_attempts INTEGER;
    v_email_locked_until TIMESTAMPTZ;

    v_ip_failed_attempts INTEGER := 0;
    v_ip_blocked_until TIMESTAMPTZ := NULL;

    v_now TIMESTAMPTZ := NOW();
BEGIN

    -- Validate and refresh expired lock/window state.
    -- This also obtains row locks for the affected records.

    v_status := public.get_login_lock_status(
        p_email_hash,
        p_ip_hash
    );


    v_email_locked_until :=
        NULLIF(v_status ->> 'locked_until', '')::TIMESTAMPTZ;


    -- Do not increment an account that is already locked.

    IF v_email_locked_until IS NOT NULL
       AND v_email_locked_until > v_now THEN
        RETURN v_status;
    END IF;


    -- Increment the account failure count.

    UPDATE public.login_attempts
    SET
        failed_attempts = failed_attempts + 1,

        last_failed_at = v_now,

        locked_until = CASE
            WHEN failed_attempts + 1 >= 3
                THEN v_now + INTERVAL '60 seconds'
            ELSE NULL
        END,

        updated_at = v_now

    WHERE email_hash = p_email_hash

    RETURNING
        failed_attempts,
        locked_until

    INTO
        v_email_failed_attempts,
        v_email_locked_until;


    -- Increment the IP failure count when available.

    IF p_ip_hash IS NOT NULL THEN

        SELECT
            failed_attempts,
            blocked_until
        INTO
            v_ip_failed_attempts,
            v_ip_blocked_until
        FROM public.login_ip_attempts
        WHERE ip_hash = p_ip_hash
        FOR UPDATE;


        -- Do not increment an already blocked IP.

        IF v_ip_blocked_until IS NULL
           OR v_ip_blocked_until <= v_now THEN

            UPDATE public.login_ip_attempts
            SET
                failed_attempts = failed_attempts + 1,

                last_failed_at = v_now,

                blocked_until = CASE
                    WHEN failed_attempts + 1 >= 20
                        THEN v_now + INTERVAL '15 minutes'
                    ELSE NULL
                END,

                updated_at = v_now

            WHERE ip_hash = p_ip_hash

            RETURNING
                failed_attempts,
                blocked_until

            INTO
                v_ip_failed_attempts,
                v_ip_blocked_until;

        END IF;

    END IF;


    RETURN JSONB_BUILD_OBJECT(
        'failed_attempts',
            COALESCE(v_email_failed_attempts, 0),

        'locked_until',
            v_email_locked_until,

        'ip_failed_attempts',
            COALESCE(v_ip_failed_attempts, 0),

        'ip_blocked_until',
            v_ip_blocked_until
    );

END;
$$;


-- =========================================================
-- 6. RESET LOGIN ATTEMPTS AFTER SUCCESSFUL LOGIN
-- =========================================================

CREATE OR REPLACE FUNCTION public.reset_login_attempts(
    p_email_hash TEXT,
    p_ip_hash TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN

    DELETE FROM public.login_attempts
    WHERE email_hash = p_email_hash;


    IF p_ip_hash IS NOT NULL THEN

        DELETE FROM public.login_ip_attempts
        WHERE ip_hash = p_ip_hash;

    END IF;

END;
$$;


-- =========================================================
-- 7. RESTRICT RPC ACCESS
-- =========================================================
-- Only the Edge Function's service-role client may call
-- these functions.
-- =========================================================

REVOKE ALL ON FUNCTION public.get_login_lock_status(TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.record_login_failure(TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.reset_login_attempts(TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;


GRANT EXECUTE ON FUNCTION public.get_login_lock_status(TEXT, TEXT)
    TO service_role;

GRANT EXECUTE ON FUNCTION public.record_login_failure(TEXT, TEXT)
    TO service_role;

GRANT EXECUTE ON FUNCTION public.reset_login_attempts(TEXT, TEXT)
    TO service_role;


-- =========================================================
-- END OF MIGRATION
-- =========================================================
