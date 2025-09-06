// "use client"



// import type  from "react"
// import React ,{ useState } from "react"
// import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
// import logo from "../../public/imges/logo.svg"
// import { useNavigate } from "react-router-dom"

// export default function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false)
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [rememberMe, setRememberMe] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const navigate = useNavigate();

//   const handleSubmit = () => {
//     // e.preventDefault()
//     // setIsLoading(true)
//     navigate("/heroSection");

//     // // Simulate login process
//     // setTimeout(() => {
//     //   setIsLoading(false)
//     //   console.log("Login attempt:", { email, password, rememberMe })
//     // }, 2000)
//   }

//   return (
//     <div className="min-h-screen font-Poppins  bg-gradient-to-br from-[#d05353cc] via-[#a60e0e] to-[#570606] flex items-center justify-center p-4">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 opacity-10">
//         <div
//           className="absolute inset-0"
//           style={{
//             backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
//                            radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
//             backgroundSize: "50px 50px",
//           }}
//         ></div>
//       </div>

//       {/* Main Container */}
//       <div className="relative w-full max-w-md">
//         {/* Floating Elements */}
//         <div className="absolute -top-4 -left-4 w-20 h-20 bg-pink-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
//         <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-cyan-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>

//         {/* Login Card */}
//         <div className="bg-white/20 backdrop-blur-[50px] rounded-3xl p-8 shadow-2xl border border-white/20">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-[130px] h- ">
//               <img src={logo} />
//             </div>
//             <h1 className="text-3xl font-bold text-white mb-">Welcome Back</h1>
//             <p className="text-gray-300">Sign in to your account</p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email Field */}
//             <div className="space-y-2">
//               {/* <label htmlFor="email" className="text-sm font-medium text-gray-200 block">
//                 Email Address
//               </label> */}
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-transparent transition-all duration-300 hover:bg-white/10"
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div className="space-y-2">
//               {/* <label htmlFor="password" className="text-sm font-medium text-gray-200 block">
//                 Password
//               </label> */}
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-transparent transition-all duration-300 hover:bg-white/10"
//                   placeholder="Enter your password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
//                 >
//                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Remember Me */}
//             <div className="flex items-center px-[10px] justify-between">
//               <label className="flex items-center cursor-pointer group">
//                 <div className="relative">
//                   <input
//                     type="checkbox"
//                     checked={rememberMe}
//                     onChange={(e) => setRememberMe(e.target.checked)}
//                     className="sr-only"
//                   />
//                   <div
//                     className={`w-5 h-5 rounded-md border-2 transition-all duration-200 ${
//                       rememberMe
//                         ? "bg-gradient-to-r from-[#ff2e2e] to-[#ac0606] "
//                         : "border-gray-400 "
//                     }`}
//                   >
//                     {rememberMe && (
//                       <svg
//                         className="w-4 h-4 text-white absolute top-0.5 left-0.5"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                 </div>
//                 <span className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors duration-200">
//                   Remember me
//                 </span>
//               </label>

           
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-4 px-6 bg-gradient-to-r from-[#af3535] to-[#6d0101] text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center">
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                   Signing in...
//                 </div>
//               ) : (
//                 "Sign In"
//               )}
//             </button>
//           </form>

//           {/* Footer */}
//           {/* <div className="mt-8 text-center">
//             <p className="text-gray-400 text-sm">
//               {"Don't have an account? "}
//               <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
//                 Sign up here
//               </button>
//             </p>
//           </div> */}
//         </div>

//         {/* Bottom Decoration */}
//         <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full opacity-50"></div>
//       </div>
//     </div>
//   )
// }

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
      const res = await fetch("https://server.grafizen.in/api/v2/icon/auth/admin/login", {
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

      navigate("/heroSection")
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
      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-[50px] rounded-3xl p-8 shadow-2xl border border-white/20 z-10">
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
