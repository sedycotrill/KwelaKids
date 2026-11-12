
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// =========================================================
// ENVIRONMENT
// =========================================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY"
)!;

const LOGIN_ATTEMPT_HMAC_SECRET = Deno.env.get(
    "LOGIN_ATTEMPT_HMAC_SECRET"
)!;


// =========================================================
// ADMIN CLIENT
// =========================================================
// This client is only used inside the Edge Function.
// Never expose the service-role key to the browser.
// =========================================================

const adminClient = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);


// =========================================================
// CORS
// =========================================================

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};


// =========================================================
// RESPONSE HELPER
// =========================================================

function jsonResponse(
    body: Record<string, unknown>,
    status = 200
): Response {
    return new Response(
        JSON.stringify(body),
        {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        }
    );
}


// =========================================================
// HMAC SHA-256
// =========================================================
// Do not use a plain SHA-256 email hash.
// Emails are guessable, so a server-only HMAC secret
// protects the identifiers stored in the database.
// =========================================================

async function createHmacHash(
    value: string
): Promise<string> {

    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(LOGIN_ATTEMPT_HMAC_SECRET),
        {
            name: "HMAC",
            hash: "SHA-256",
        },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(value)
    );

    return Array.from(
        new Uint8Array(signature)
    )
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}


// =========================================================
// CLIENT IP
// =========================================================
// Use an address supplied by the hosting proxy.
// Do not accept an IP address from the request body.
// =========================================================

function getClientIp(req: Request): string | null {

    const directIp =
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-real-ip");

    if (directIp) {
        return directIp.trim();
    }

    const forwardedFor = req.headers.get("x-forwarded-for");

    if (forwardedFor) {
        const addresses = forwardedFor
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);

        // The final address is used as the proxy-appended
        // client address. Confirm this header behavior for
        // your deployed hosting configuration.
        return addresses.length
            ? addresses[addresses.length - 1]
            : null;
    }

    return null;
}


// =========================================================
// READ LOCK STATUS
// =========================================================

async function getLoginStatus(
    emailHash: string,
    ipHash: string | null
) {

    const { data, error } = await adminClient.rpc(
        "get_login_lock_status",
        {
            p_email_hash: emailHash,
            p_ip_hash: ipHash,
        }
    );

    if (error) {
        console.error(
            "Unable to check login lock status:",
            error.message
        );

        throw new Error("LOGIN_STATUS_CHECK_FAILED");
    }

    return data as {
        failed_attempts: number;
        locked_until: string | null;
        ip_failed_attempts: number;
        ip_blocked_until: string | null;
    };
}


// =========================================================
// RECORD FAILED LOGIN
// =========================================================

async function recordFailedLogin(
    emailHash: string,
    ipHash: string | null
) {

    const { data, error } = await adminClient.rpc(
        "record_login_failure",
        {
            p_email_hash: emailHash,
            p_ip_hash: ipHash,
        }
    );

    if (error) {
        console.error(
            "Unable to record failed login:",
            error.message
        );

        throw new Error("LOGIN_ATTEMPT_RECORD_FAILED");
    }

    return data as {
        failed_attempts: number;
        locked_until: string | null;
        ip_failed_attempts: number;
        ip_blocked_until: string | null;
    };
}


// =========================================================
// RESET FAILED LOGIN
// =========================================================

async function resetFailedLogin(
    emailHash: string,
    ipHash: string | null
) {

    const { error } = await adminClient.rpc(
        "reset_login_attempts",
        {
            p_email_hash: emailHash,
            p_ip_hash: ipHash,
        }
    );

    if (error) {
        // Authentication has already succeeded.
        // Log this issue, but do not discard the valid session.
        console.error(
            "Unable to reset login attempts:",
            error.message
        );
    }
}


// =========================================================
// MAIN HANDLER
// =========================================================

Deno.serve(async (req: Request) => {

    // -----------------------------------------------------
    // CORS preflight
    // -----------------------------------------------------

    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders,
        });
    }

    if (req.method !== "POST") {
        return jsonResponse(
            {
                success: false,
                code: "METHOD_NOT_ALLOWED",
                message: "Method not allowed.",
            },
            405
        );
    }


    // -----------------------------------------------------
    // Check required environment variables
    // -----------------------------------------------------

    if (
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY ||
        !SUPABASE_SERVICE_ROLE_KEY ||
        !LOGIN_ATTEMPT_HMAC_SECRET
    ) {
        console.error("Missing login function environment variables.");

        return jsonResponse(
            {
                success: false,
                code: "SERVER_CONFIGURATION_ERROR",
                message: "Login service is unavailable.",
            },
            500
        );
    }


    try {

        // -------------------------------------------------
        // Read request body
        // -------------------------------------------------

        const body = await req.json();

        const email =
            typeof body.email === "string"
                ? body.email.trim().toLowerCase()
                : "";

        const password =
            typeof body.password === "string"
                ? body.password
                : "";


        if (!email || !password) {
            return jsonResponse(
                {
                    success: false,
                    code: "MISSING_CREDENTIALS",
                    message: "Email and password are required.",
                },
                400
            );
        }


        // Basic input-size protection.

        if (
            email.length > 320 ||
            password.length > 1024
        ) {
            return jsonResponse(
                {
                    success: false,
                    code: "INVALID_REQUEST",
                    message: "Invalid login request.",
                },
                400
            );
        }


        // -------------------------------------------------
        // Create private identifiers
        // -------------------------------------------------

        const emailHash = await createHmacHash(
            `email:${email}`
        );

        const clientIp = getClientIp(req);

        const ipHash = clientIp
            ? await createHmacHash(`ip:${clientIp}`)
            : null;


        // -------------------------------------------------
        // Check account and IP restrictions
        // -------------------------------------------------

        const currentStatus = await getLoginStatus(
            emailHash,
            ipHash
        );


        if (
            currentStatus.locked_until &&
            new Date(currentStatus.locked_until).getTime() > Date.now()
        ) {
            return jsonResponse(
                {
                    success: false,
                    code: "ACCOUNT_LOCKED",
                    lockedUntil: currentStatus.locked_until,
                    message:
                        "Too many failed password attempts. Please try again later.",
                },
                429
            );
        }


        if (
            currentStatus.ip_blocked_until &&
            new Date(currentStatus.ip_blocked_until).getTime() > Date.now()
        ) {
            return jsonResponse(
                {
                    success: false,
                    code: "IP_RATE_LIMITED",
                    lockedUntil: currentStatus.ip_blocked_until,
                    message:
                        "Too many sign-in attempts from this network. Please try again later.",
                },
                429
            );
        }


        // -------------------------------------------------
        // Verify credentials using Supabase Auth
        // -------------------------------------------------
        // Password verification remains entirely within
        // Supabase Auth. We do not store or compare passwords.
        // -------------------------------------------------

        const authResponse = await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );


        // -------------------------------------------------
        // Handle unsuccessful authentication
        // -------------------------------------------------

        if (!authResponse.ok) {

            // Do not count infrastructure failures or
            // Supabase Auth rate-limit responses as a
            // wrong-password attempt.

            if (
                authResponse.status === 429 ||
                authResponse.status >= 500
            ) {
                return jsonResponse(
                    {
                        success: false,
                        code: "AUTH_TEMPORARILY_UNAVAILABLE",
                        message:
                            "Sign-in is temporarily unavailable. Please try again.",
                    },
                    authResponse.status === 429 ? 429 : 503
                );
            }


            // Count credential rejection responses.

            if (
                authResponse.status === 400 ||
                authResponse.status === 401
            ) {

                const updatedStatus = await recordFailedLogin(
                    emailHash,
                    ipHash
                );


                // Third failed account attempt.

                if (updatedStatus.locked_until) {
                    return jsonResponse(
                        {
                            success: false,
                            code: "ACCOUNT_LOCKED",
                            lockedUntil: updatedStatus.locked_until,
                            message:
                                "Too many failed password attempts. Please try again later.",
                        },
                        429
                    );
                }


                // IP limit reached.

                if (updatedStatus.ip_blocked_until) {
                    return jsonResponse(
                        {
                            success: false,
                            code: "IP_RATE_LIMITED",
                            lockedUntil: updatedStatus.ip_blocked_until,
                            message:
                                "Too many sign-in attempts from this network. Please try again later.",
                        },
                        429
                    );
                }


                // Keep credential errors generic.
                // Do not reveal whether an email exists.

                return jsonResponse(
                    {
                        success: false,
                        code: "INVALID_CREDENTIALS",
                        message: "Invalid email or password.",
                        failedAttempts:
                            updatedStatus.failed_attempts,
                    },
                    401
                );
            }


            // Other Auth errors are not counted as
            // wrong-password attempts.

            console.error(
                "Unexpected Supabase Auth response:",
                authResponse.status
            );

            return jsonResponse(
                {
                    success: false,
                    code: "AUTH_REQUEST_FAILED",
                    message:
                        "Unable to sign in right now. Please try again.",
                },
                502
            );
        }


        // -------------------------------------------------
        // Successful authentication
        // -------------------------------------------------

        const authData = await authResponse.json();


        if (
            !authData.access_token ||
            !authData.refresh_token
        ) {
            console.error(
                "Supabase Auth returned an incomplete session."
            );

            return jsonResponse(
                {
                    success: false,
                    code: "INVALID_AUTH_RESPONSE",
                    message:
                        "Unable to establish your session.",
                },
                502
            );
        }


        // Reset account and IP failure records.

        await resetFailedLogin(
            emailHash,
            ipHash
        );


        // -------------------------------------------------
        // Return session to the frontend
        // -------------------------------------------------

        return jsonResponse({
            success: true,

            access_token: authData.access_token,

            refresh_token: authData.refresh_token,

            expires_in: authData.expires_in,

            expires_at: authData.expires_at,

            token_type: authData.token_type,

            user: authData.user,
        });

    } catch (error) {

        console.error(
            "Login function error:",
            error instanceof Error
                ? error.message
                : "Unknown error"
        );

        return jsonResponse(
            {
                success: false,
                code: "LOGIN_SERVICE_ERROR",
                message:
                    "Something went wrong. Please try again.",
            },
            500
        );
    }

});
