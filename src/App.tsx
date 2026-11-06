
import { Routes, Route, Navigate } from "react-router-dom";

import { AudioProvider } from "./context/AudioContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

// Authentication pages
import SignIn from "./pages/user/signin";
import SignUp from "./pages/user/signup";
import TermsAndConditionsPage from "./pages/user/termsandcondition";
import OtpPage from "./pages/user/otp";
import ForgotPassword from "./pages/user/forgotpassword";
import ResetPassword from "./pages/user/resetpassword";

// Logged-in pages
import CategoriesPage from "./pages/logged-in/categories/CategoriesPage";

import AlphabetPage from "./pages/logged-in/alphabet/alphabet";
import AlphabetTutorial from "./pages/logged-in/alphabet/alphabettutorial";
import AlphabetComplete from "./pages/logged-in/alphabet/alphabetcomplete";
import AlphabetQuiz from "./pages/logged-in/alphabet/alphabetquiz";

import NumbersPage from "./pages/logged-in/numbers/numbers";
import NumbersTutorial from "./pages/logged-in/numbers/numberstutorial";

import GreetingsPage from "./pages/logged-in/greetings/greetings";
import GreetingsTutorial from "./pages/logged-in/greetings/greetingstutorial";

function App() {
    return (
        <AudioProvider>
            <LanguageProvider>
                <AuthProvider>

                    <Routes>

                        {/* Default Route */}
                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to="/signin"
                                    replace
                                />
                            }
                        />

                        {/* Public Routes */}
                        <Route
                            path="/signin"
                            element={<SignIn />}
                        />

                        <Route
                            path="/signup"
                            element={<SignUp />}
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
                                path="/alphabetcomplete"
                                element={<AlphabetComplete />}
                            />

                            <Route
                                path="/alphabetquiz"
                                element={<AlphabetQuiz />}
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
