"use client"

import React, { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import logo from "../../public/imges/GirirajFeedBackLogo.jpg"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail")
    const savedRemember = localStorage.getItem("rememberMe") === "true"
    if (savedRemember && savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("https://server.grafizen.in/api/v2/giriraj/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const { message } = await res.json()
        throw new Error(message || "Login failed")
      }

      const { token } = await res.json()

      if (rememberMe) {
        localStorage.setItem("authToken", token)
        localStorage.setItem("savedEmail", email)
        localStorage.setItem("rememberMe", "true")
      } else {
        sessionStorage.setItem("authToken", token)
        localStorage.removeItem("savedEmail")
        localStorage.setItem("rememberMe", "false")
      }

      navigate("/dashboards/super-dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bs-giri font-Poppins  flex items-center justify-center p-4 relative">

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
      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-[50px] rounded-3xl p-4 md77:p-6 md11:p-8 shadow-2xl border border-white/20 z-10">
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
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-1 focus:ring-white hover:bg-white/10 transition"
            />
          </div>

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
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <label className="flex items-center cursor-pointer text-sm text-gray-200 ">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-5 h-5 mr-3 border-2 rounded-md flex items-center justify-center ${
                rememberMe
                  ? "bg-white"
                  : "border-gray-400"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-gradient-to-r text-[20px] from-[#af3535] to-[#6d0101] rounded-xl text-white font-semibold shadow-lg transform hover:scale-[1.02] focus:ring-2 focus:ring-offset-2  disabled:opacity-50"
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
  )
}
