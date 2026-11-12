
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

// =========================================================
// AUTH CONTEXT TYPE
// =========================================================

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
};

// =========================================================
// CONTEXT
// =========================================================

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

type AuthProviderProps = {
    children: ReactNode;
};

// =========================================================
// AUTH PROVIDER
// =========================================================

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Tracks authentication events to prevent stale session
    // initialization from overwriting newer auth changes.
    const authEventVersion = useRef(0);

    useEffect(() => {
        let isMounted = true;

        // -------------------------------------------------
        // LISTEN FOR AUTHENTICATION CHANGES
        // -------------------------------------------------

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, currentSession) => {
                authEventVersion.current += 1;

                if (!isMounted) return;

                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setLoading(false);
            }
        );

        // -------------------------------------------------
        // RESTORE EXISTING SESSION
        // -------------------------------------------------

        const restoreSession = async () => {
            const versionAtStart = authEventVersion.current;

            try {
                const { data, error } =
                    await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                // Ignore outdated results if an auth event
                // occurred while getSession() was running.
                if (
                    !isMounted ||
                    versionAtStart !== authEventVersion.current
                ) {
                    return;
                }

                const restoredSession = data.session;

                setSession(restoredSession);
                setUser(restoredSession?.user ?? null);

            } catch (error) {
                console.error(
                    "Session restoration failed:",
                    error
                );

                if (
                    !isMounted ||
                    versionAtStart !== authEventVersion.current
                ) {
                    return;
                }

                setSession(null);
                setUser(null);

            } finally {
                // Only finish initialization if no newer auth
                // event has superseded this session lookup.
                if (
                    isMounted &&
                    versionAtStart === authEventVersion.current
                ) {
                    setLoading(false);
                }
            }
        };

        void restoreSession();

        // -------------------------------------------------
        // CLEANUP
        // -------------------------------------------------

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// =========================================================
// AUTH HOOK
// =========================================================

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider."
        );
    }

    return context;
}
