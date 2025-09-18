"use client"

import React, { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import logo from "../../public/imges/GirirajFeedBackLogo.jpg" // keep your path
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function UserLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")         // role user logs in with USERNAME
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Pre-fill username when "Remember me" is on
  useEffect(() => {
    // mark this route as a role user login (optional, if your app reads it)
    localStorage.setItem("loginType", "user")

    const savedUsername = localStorage.getItem("savedUsername")
    const savedRemember = localStorage.getItem("rememberMe") === "true"
    if (savedRemember && savedUsername) {
      setUsername(savedUsername)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/v2/giriraj/auth/role-user/login",
        { name: username, password }
      )

      const { token, user, permissions } = data || {}
      if (!token || !user) {
        throw new Error("Login failed: missing token or user.")
      }

      // Persist auth + role info
      localStorage.setItem("authToken", token)
      localStorage.setItem("userType", "roleUser") // <-- key for ProtectedRoute checks
      localStorage.setItem("user", JSON.stringify(user?._id))
      localStorage.setItem("rights", JSON.stringify(user?.roleId || [])) // your existing structure
      if (permissions) {
        // if backend also returns granular permission keys (e.g. ["opd.view", "ipd.view"])
        localStorage.setItem("permissions", JSON.stringify(permissions))
      }
      if (user?.companyId) {
        localStorage.setItem("selectedCompanyId", user?.companyId?._id || user?.companyId)
        localStorage.setItem("selectedCompanyName", user?.companyId?.firmName || "")
      }

      // Remember me (only username is saved for convenience)
      if (rememberMe) {
        localStorage.setItem("savedUsername", username)
        localStorage.setItem("rememberMe", "true")
      } else {
        localStorage.removeItem("savedUsername")
        localStorage.setItem("rememberMe", "false")
      }

       navigate("/dashboards/super-dashboard")
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-[50px] rounded-3xl p-8 shadow-2xl border border-white/20 z-10">
        <div className="text-center mb-8">
          <img src={logo} alt="logo" className="mx-auto rounded-[8px] w-32" />
          <h1 className="text-3xl font-bold text-white mt-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your role account</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 text-sm bg-red-600/30 text-red-200 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-300 focus:ring-1 focus:ring-white hover:bg-white/10 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-300 focus:ring-1 focus:ring-white hover:bg-white/10 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Remember me */}
          <label className="flex items-center cursor-pointer text-sm text-gray-200 select-none">
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
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-500">
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

          {/* Switch to Admin login link (optional) */}
          <p className="text-center text-sm text-gray-200">
            Admin?{" "}
            <a href="/" className="underline">
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
