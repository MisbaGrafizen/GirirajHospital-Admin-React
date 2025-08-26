import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get("authToken");

  console.log("Checking auth token:", token);

  if (!token) {
    console.warn("No auth token found. Redirecting to login.");
    return <Navigate to="/create-account" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
