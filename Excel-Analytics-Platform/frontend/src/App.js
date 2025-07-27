import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

// Component to handle token-based navigation
const TokenHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token") || localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        localStorage.setItem("token", token); // Store the token
        navigate(decoded.user.role === "admin" ? "/admin" : "/dashboard");
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  return null; // This component doesn’t render anything
};

function App() {
  return (
    <Router>
      <TokenHandler /> {/* Handle token from Google callback or local storage */}
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