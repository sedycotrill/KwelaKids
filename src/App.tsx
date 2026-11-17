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
import AlphabetChampionshipHistory from "./pages/logged-in/alphabet/alphabetchampionshiphistory";

// NUMBERS PAGES (Itinugma sa mga pangalan ng file sa folder)
import NumbersPage from "./pages/logged-in/numbers/numbers";
import NumbersTutorial from "./pages/logged-in/numbers/numberstutorial";
import NumbersTutorial2 from "./pages/logged-in/numbers/numberstutorial2";
import NumbersComplete from "./pages/logged-in/numbers/numbercomplete";
import NumbersChampionship from "./pages/logged-in/numbers/numberchampionship";
import NumbersChampionshipHistory from "./pages/logged-in/numbers/numberchampionshiphistory";
import NumbersChampionshipSummary from "./pages/logged-in/numbers/numberchampionshipsummary";


// GREETINGS PAGES
import GreetingsPage from "./pages/logged-in/greetings/greetings";
import GreetingsTutorial from "./pages/logged-in/greetings/greetingstutorial";
import GreetingsTutorial2 from "./pages/logged-in/greetings/greetingstutorial2";
import GreetingsComplete from "./pages/logged-in/greetings/greetingscomplete";
import GreetingsChampionship from "./pages/logged-in/greetings/greetingschampionship";
import GreetingsChampionshipSummary from "./pages/logged-in/greetings/greetingschampionshipsummary";
import GreetingsChampionshipHistory from "./pages/logged-in/greetings/greetingschampionshiphistory";

// =========================================================
// DEFAULT ROUTE
// =========================================================

function DefaultRoute() {
    const { session, loading } = useAuth();

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

    if (session) {
        return (
            <Navigate
                to="/categories"
                replace
            />
        );
    }

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
                                path="/championshiphistory"
                                element={<AlphabetChampionshipHistory />}
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

                            <Route
                                path="/numberstutorial2"
                                element={<NumbersTutorial2 />}
                            />

                            <Route
                                path="/numbercomplete"
                                element={<NumbersComplete />}
                            />

                            <Route
                                path="/numberscomplete"
                                element={<NumbersComplete />}
                            />

                            <Route
                                path="/numberchampionship"
                                element={<NumbersChampionship />}
                            />

                            <Route
                                path="/numberchampionshipsummary"
                                element={<NumbersChampionshipSummary />}
                            />

                            <Route
                                path="/numberchampionshiphistory"
                                element={<NumbersChampionshipHistory />}
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

                            <Route
                                path="/greetingstutorial2"
                                element={<GreetingsTutorial2 />}
                            />

                            <Route
                                path="/greetingscomplete"
                                element={<GreetingsComplete />}
                            />

                            <Route
                                path="/greetingschampionship"
                                element={<GreetingsChampionship />}
                            />

                            <Route
                                path="/greetingschampionshipsummary"
                                element={<GreetingsChampionshipSummary />}
                            />

                            <Route
                                path="/greetingschampionshiphistory"
                                element={<GreetingsChampionshipHistory />}
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