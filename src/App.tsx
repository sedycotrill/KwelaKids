
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/user/signin";
import SignUp from "./pages/user/signup";
import CategoriesPage from "./pages/logged-in/categories/CategoriesPage";
import { AudioProvider } from "./context/AudioContext"; // 1. Import ang AudioProvider

function App() {
  return (
    // 2. I-wrap ang buong Routes sa loob ng AudioProvider
    <AudioProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Routes>
    </AudioProvider>
  );
}
export default App;


