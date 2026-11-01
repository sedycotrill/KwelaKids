import { Routes, Route, Navigate } from "react-router-dom";
import { AudioProvider } from "./context/AudioContext"; // 1. Import ang AudioProvider
import SignIn from "./pages/user/signin";
import SignUp from "./pages/user/signup";
import TermsAndConditionsPage from "./pages/user/termsandcondition";
import OtpPage from "./pages/user/otp";
import ForgotPassword from "./pages/user/forgotpassword"; 
import ResetPassword from "./pages/user/resetpassword"; 
import CategoriesPage from "./pages/logged-in/categories/CategoriesPage";
import AlphabetPage from "./pages/logged-in/categories/alphabet"; 
import AlphabetTutorial from "./pages/logged-in/categories/alphabettutorial";

function App() {
  return (
    // 2. I-wrap ang buong Routes sa loob ng AudioProvider
    <AudioProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/termsandcondition" element={<TermsAndConditionsPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/alphabet" element={<AlphabetPage />} /> 
        <Route path="/alphabettutorial" element={<AlphabetTutorial />} />
      </Routes>
    </AudioProvider>
  );
}
export default App;


