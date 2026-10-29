
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/user/signin";
import SignUp from "./pages/user/signup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
export default App;
