
import { Navigate, Outlet, useLocation } from "react-router-dom";

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
// PROTECTED ROUTE
// =========================================================

export default function ProtectedRoute() {
    const { session, loading } = useAuth();
    const location = useLocation();

    // Wait until Supabase finishes restoring the session.
    if (loading) {
        return <AuthLoadingScreen />;
    }

    // No authenticated session: redirect to sign-in.
    if (!session) {
        return (
            <Navigate
                to="/signin"
                replace
                state={{ from: location }}
            />
        );
    }

    // Authenticated: allow access to the requested page.
    return <Outlet />;
}
