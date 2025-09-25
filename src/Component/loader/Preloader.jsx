"use client"


import { useState, useEffect } from "react"

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsComplete(true)
          setTimeout(() => {
            setHidden(true)
            if (onComplete) onComplete()
          }, 500)
          return 100
        }
        // ✅ Bigger increment (faster load)
        const increment = Math.random() * 8 + 5 // 5–13 per tick
        return Math.min(prev + increment, 100)
      })
    }, 60) // ✅ tick every 60ms

    return () => clearInterval(interval)
  }, [onComplete])

  if (hidden) return null

  return (
    <div
      className={`preloader-container ${isComplete ? "fade-out" : ""}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "97vh",
        backgroundColor: "#ffffff", // ✅ white background
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        transition: "opacity 0.5s ease-out",
        opacity: isComplete ? 0 : 1,
      }}
    >
      {/* Percentage Display */}
      <div
        style={{
          fontSize: "48px",
          fontWeight: "300",
          color: "#ff0000", // ✅ red text
          marginBottom: "30px",
          fontFamily: "Arial, sans-serif",
          textShadow: "0 0 20px rgba(255, 0, 0, 0.5)", // ✅ red glow
          letterSpacing: "2px",
        }}
      >
        {Math.floor(progress)}%
      </div>

      {/* Loading Text */}
      <div
        style={{
          marginTop: "-20px",
          fontSize: "19px",
          color: "rgba(255, 0, 0, 0.7)", // ✅ red text
          fontFamily: "Arial, sans-serif",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        Loading...
      </div>

      <style jsx>{`
        .fade-out {
          opacity: 0 !important;
        }

        @media (max-width: 768px) {
          .preloader-container div:first-child {
            font-size: 36px !important;
          }
        }

        @media (max-width: 480px) {
          .preloader-container div:first-child {
            font-size: 28px !important;
          }
        }
      `}</style>
    </div>
  )
}
