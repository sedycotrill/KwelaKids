import { Routes, Route, Navigate } from "react-router-dom";
import { AudioProvider } from "./context/AudioContext";
import { LanguageProvider } from "./context/LanguageContext"; // I-import ang LanguageProvider

import SignIn from "./pages/user/signin";
import SignUp from "./pages/user/signup";
import TermsAndConditionsPage from "./pages/user/termsandcondition";
import OtpPage from "./pages/user/otp";
import ForgotPassword from "./pages/user/forgotpassword";
import ResetPassword from "./pages/user/resetpassword";

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
      <LanguageProvider> {/* I-wrap dito para maabot ng buong app */}
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/termsandcondition" element={<TermsAndConditionsPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />

          <Route path="/categories" element={<CategoriesPage />} />

          <Route path="/alphabet" element={<AlphabetPage />} />
          <Route path="/alphabettutorial" element={<AlphabetTutorial />} />
          <Route path="/alphabetcomplete" element={<AlphabetComplete />} />
          <Route path="/alphabetquiz" element={<AlphabetQuiz />} />

          <Route path="/numbers" element={<NumbersPage />} />
          <Route path="/numberstutorial" element={<NumbersTutorial />} />

          <Route path="/greetings" element={<GreetingsPage />} />
          <Route path="/greetingstutorial" element={<GreetingsTutorial />} />
        </Routes>
      </LanguageProvider>
    </AudioProvider>
  );
}

export default App;