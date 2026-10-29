import { Routes, Route, Navigate } from "react-router-dom";
import { AudioProvider } from "./context/AudioContext"; // 1. Import ang AudioProvider
import SignIn from "./pages/user/signin";
import SignUp from "./pages/user/signup";

function App() {
  return (
    // 2. I-wrap ang buong Routes sa loob ng AudioProvider
    <AudioProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </AudioProvider>
  );
}

export default App;