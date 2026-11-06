
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { session, loading } = useAuth();
    const location = useLocation();

    // Wait until Supabase finishes checking the session
    if (loading) {
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

    // Redirect unauthenticated users to Sign In
    if (!session) {
        return (
            <Navigate
                to="/signin"
                replace
                state={{ from: location }}
            />
        );
    }

    // Allow authenticated users to access the requested page
    return <Outlet />;
}
