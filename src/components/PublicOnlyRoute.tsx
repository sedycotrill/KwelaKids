
import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// =========================================================
// LOADING SCREEN
// =========================================================

function AuthLoadingScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />

                <p className="text-sm font-medium text-slate-600">
                    Checking your account...
                </p>
            </div>
        </div>
    );
}

// =========================================================
// PUBLIC ONLY ROUTE
// =========================================================

type PublicOnlyRouteProps = {
    children: ReactNode;
};

export default function PublicOnlyRoute({
    children,
}: PublicOnlyRouteProps) {
    const { session, loading } = useAuth();

    // Do not display the public page until authentication
    // restoration has finished.
    if (loading) {
        return <AuthLoadingScreen />;
    }

    // Existing authenticated user: go to categories.
    if (session) {
        return (
            <Navigate
                to="/categories"
                replace
            />
        );
    }

    // No existing session: allow access.
    return <>{children}</>;
}
