import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login"; // Adjust path if different
import SignUp from "./components/SignUp"; // Adjust path if different
import UserDashboard from "./components/UserDashboard"; // Adjust path if different
import AdminDashboard from "./components/AdminDashboard"; // Adjust path if different

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/reset-password" element={<ResetPassword />} /> {/* Placeholder for reset password page */}
      </Routes>
    </Router>
  );
}

// Placeholder for ResetPassword component (to be implemented)
const ResetPassword = () => {
  return <div>Reset Password Page (Implement this component)</div>;
};

export default App;