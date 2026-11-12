
import {
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { AudioProvider } from "./context/AudioContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import AlphabetChampionshipSummary from "./pages/logged-in/alphabet/alphabetchampionshipsummary";

// =========================================================
// AUTHENTICATION PAGES
// =========================================================

import SignIn from "./pages/user/signin";
import SignUp from "./pages/user/signup";
import TermsAndConditionsPage from "./pages/user/termsandcondition";
import OtpPage from "./pages/user/otp";
import ForgotPassword from "./pages/user/forgotpassword";
import ResetPassword from "./pages/user/resetpassword";

// =========================================================
// LOGGED-IN PAGES
// =========================================================

import CategoriesPage from "./pages/logged-in/categories/CategoriesPage";

import AlphabetPage from "./pages/logged-in/alphabet/alphabet";
import AlphabetTutorial from "./pages/logged-in/alphabet/alphabettutorial";
import AlphabetTutorial2 from "./pages/logged-in/alphabet/alphabettutorial2";
import AlphabetComplete from "./pages/logged-in/alphabet/alphabetcomplete";
import AlphabetChampionship from "./pages/logged-in/alphabet/alphabetchampionship";

import NumbersPage from "./pages/logged-in/numbers/numbers";
import NumbersTutorial from "./pages/logged-in/numbers/numberstutorial";

import GreetingsPage from "./pages/logged-in/greetings/greetings";
import GreetingsTutorial from "./pages/logged-in/greetings/greetingstutorial";

// =========================================================
// DEFAULT ROUTE
// =========================================================

function DefaultRoute() {
    const { session, loading } = useAuth();

    // Wait for Supabase to restore the previous session.
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

    // Existing session: continue to the application.
    if (session) {
        return (
            <Navigate
                to="/categories"
                replace
            />
        );
    }

    // No session: send the user to sign-in.
    return (
        <Navigate
            to="/signin"
            replace
        />
    );
}

// =========================================================
// APP
// =========================================================

function App() {
    return (
        <AudioProvider>
            <LanguageProvider>
                <AuthProvider>

                    <Routes>

                        {/* Default Route */}
                        <Route
                            path="/"
                            element={<DefaultRoute />}
                        />

                        {/* Public Routes */}

                        <Route
                            path="/signin"
                            element={
                                <PublicOnlyRoute>
                                    <SignIn />
                                </PublicOnlyRoute>
                            }
                        />

                        <Route
                            path="/signup"
                            element={
                                <PublicOnlyRoute>
                                    <SignUp />
                                </PublicOnlyRoute>
                            }
                        />

                        <Route
                            path="/termsandcondition"
                            element={<TermsAndConditionsPage />}
                        />

                        <Route
                            path="/otp"
                            element={<OtpPage />}
                        />

                        <Route
                            path="/forgotpassword"
                            element={<ForgotPassword />}
                        />

                        <Route
                            path="/resetpassword"
                            element={<ResetPassword />}
                        />

                        {/* Protected Routes */}

                        <Route element={<ProtectedRoute />}>

                            {/* Categories */}

                            <Route
                                path="/categories"
                                element={<CategoriesPage />}
                            />

                            {/* Alphabet */}

                            <Route
                                path="/alphabet"
                                element={<AlphabetPage />}
                            />

                            <Route
                                path="/alphabettutorial"
                                element={<AlphabetTutorial />}
                            />

                            <Route
                                path="/alphabettutorial2"
                                element={<AlphabetTutorial2 />}
                            />

                            <Route
                                path="/alphabetcomplete"
                                element={<AlphabetComplete />}
                            />

                            <Route
                                path="/championshipsummary"
                                element={<AlphabetChampionshipSummary />}
                            />

                            <Route
                                path="/championship"
                                element={<AlphabetChampionship />}
                            />

                            {/* Numbers */}

                            <Route
                                path="/numbers"
                                element={<NumbersPage />}
                            />

                            <Route
                                path="/numberstutorial"
                                element={<NumbersTutorial />}
                            />

                            {/* Greetings */}

                            <Route
                                path="/greetings"
                                element={<GreetingsPage />}
                            />

                            <Route
                                path="/greetingstutorial"
                                element={<GreetingsTutorial />}
                            />

                        </Route>

                        {/* Unknown Routes */}

                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="/"
                                    replace
                                />
                            }
                        />

                    </Routes>

                </AuthProvider>
            </LanguageProvider>
        </AudioProvider>
    );
}

export default App;
