import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");   // ✅ matches LoginPage
  const userType = localStorage.getItem("userType"); // ✅ matches LoginPage

  console.log('userType', userType)
  console.log('token', token)

  if (!token || !userType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
