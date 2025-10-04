import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");   // ✅ matches LoginPage
  const loginType = localStorage.getItem("loginType"); // ✅ matches LoginPage

  console.log('loginType', loginType)
  console.log('token', token)

  if (!token || !loginType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
