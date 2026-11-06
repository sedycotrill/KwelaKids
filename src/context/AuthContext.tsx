
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

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Tracks whether a newer auth event occurred while getSession was running
    const authEventVersion = useRef(0);

    useEffect(() => {
        let isMounted = true;

        const syncSession = async () => {
            const versionAtStart = authEventVersion.current;

            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                // Do not overwrite a newer SIGNED_IN / SIGNED_OUT event
                if (
                    !isMounted ||
                    versionAtStart !== authEventVersion.current
                ) {
                    return;
                }

                setSession(data.session);
                setUser(data.session?.user ?? null);
            } catch (error) {
                console.error("Session check failed:", error);

                if (
                    !isMounted ||
                    versionAtStart !== authEventVersion.current
                ) {
                    return;
                }

                setSession(null);
                setUser(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Subscribe before restoring the session
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

        // Initial session restoration
        void syncSession();

        // Recheck session when a page is restored from browser history
        const handlePageShow = () => {
            void syncSession();
        };

        window.addEventListener("pageshow", handlePageShow);

        return () => {
            isMounted = false;

            subscription.unsubscribe();

            window.removeEventListener(
                "pageshow",
                handlePageShow
            );
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

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider."
        );
    }

    return context;
}
