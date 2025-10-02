"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import logo from "../../public/imges/GirirajFeedBackLogo.jpg";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../helper/notification";
import { ApiPost } from "../helper/axios";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState(""); // email OR username
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedIdentifier = localStorage.getItem("savedIdentifier");
    const savedRemember = localStorage.getItem("rememberMe") === "true";
    if (savedRemember && savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  // 🔑 Save Auth Data (works for admin & role-user)
  const saveAuthData = ({ user, tokens, token, permissions, loginType }) => {
    const accessToken = tokens?.access?.token || token;
    const refreshToken = tokens?.refresh?.token || "";

    if (!accessToken || !user) return;

    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", user?._id);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userType", loginType); // "admin" or "roleUser"
    localStorage.setItem("rights", JSON.stringify(user?.roleId || []));

    if (permissions) {
      localStorage.setItem("permissions", JSON.stringify(permissions));
    }

    if (user?.companyId) {
      localStorage.setItem(
        "selectedCompanyId",
        user?.companyId?._id || user?.companyId
      );
      localStorage.setItem(
        "selectedCompanyName",
        user?.companyId?.firmName || ""
      );
    }

    if (rememberMe) {
      localStorage.setItem("savedIdentifier", identifier);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("savedIdentifier");
      localStorage.setItem("rememberMe", "false");
    }
  };

  // 🚀 Handle Login
  // 🚀 Handle Login
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    // 1️⃣ Try Admin login
    try {
      const res = await ApiPost("/auth/admin/login", {
        email: identifier,
        password,
      });

      const { user, tokens } = res.data;
      saveAuthData({ user, tokens, loginType: "admin" }); 
      console.log("✅ Admin login success");

      await requestNotificationPermission();
      navigate("/dashboards/super-dashboard");
      return; 
    } catch (adminError) {
      console.warn("Admin login failed, trying role-user...");
    }

    // 2️⃣ Try Role-User login
    try {
      const res = await ApiPost("/auth/role-user/login", {
        identifier,
        password,
      });

      const { user, token, permissions } = res.data;  // ✅ FIXED
      saveAuthData({ user, token, permissions, loginType: "roleUser" }); // 🔥 stored immediately
      console.log("✅ Role-User login success");

      await requestNotificationPermission();
      navigate("/dashboards/super-dashboard");
      return;
    } catch (userError) {
      throw new Error("Incorrect email/username or password");
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bs-giri font-Poppins flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating Blobs */}
      <div className="absolute -top-4 -left-4 w-20 h-20 bg-pink-500 rounded-full opacity-20 blur-xl animate-pulse" />
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-cyan-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000" />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-[50px] rounded-3xl p-6 shadow-2xl border border-white/20 z-10">
        <div className="text-center mb-8">
          <img src={logo} alt="logo" className="mx-auto rounded-[8px] w-32" />
          <h1 className="text-3xl font-bold text-white mt-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 text-sm bg-red-600/30 text-red-200 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email / Username */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter email or username"
              required
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-1 focus:ring-white hover:bg-white/10 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-1 focus:ring-white hover:bg-white/10 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Remember me */}
          <label className="flex items-center cursor-pointer text-sm text-gray-200">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-5 h-5 mr-3 border-2 rounded-md flex items-center justify-center ${
                rememberMe ? "bg-white" : "border-gray-400"
              }`}
            >
              {rememberMe && (
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-6 h-6 text-red-500"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  />
                </svg>
              )}
            </span>
            Remember me
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-gradient-to-r text-[20px] from-[#af3535] to-[#6d0101] rounded-xl text-white font-semibold shadow-lg transform hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
