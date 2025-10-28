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

// import React, { useEffect, useRef } from "react";
// import { motion, useAnimation } from "framer-motion";
// import logo1 from "../../../public/imges/GirirajFeedBackLogo.jpg";

// const Preloader = ({
//   logo = logo1,
//   color = "#ef4444", 
//   onFinish,
// }) => {
//   const lineRef = useRef(null);
//   const logoControls = useAnimation();

//   useEffect(() => {
    
//     const pathLength = 2000;          // longer to match full screen width
//     const totalDuration = 2000;       // 2 seconds
//     let progress = 0;

//     const interval = setInterval(() => {
//       progress += 0.02;
//       if (lineRef.current) {
//         lineRef.current.style.strokeDasharray = `${pathLength}`;
//         lineRef.current.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
//       }
//     }, (totalDuration / 50));

//     // logo shows after 1 s
//     const logoTimer = setTimeout(() => {
//       logoControls.start({
//         opacity: 1,
//         scale: 1,
//         transition: { duration: 0.6, ease: "easeOut", type: "spring" },
//       });
//     }, 1000);

//     // remove after 2 s
//     const endTimer = setTimeout(() => {
//       if (onFinish) onFinish();
//     }, 2000);

//     return () => {
//       clearInterval(interval);
//       clearTimeout(logoTimer);
//       clearTimeout(endTimer);
//     };
//   }, [logoControls, onFinish]);

//   // heartbeat waveform stretched to screen width
//   const pathData = `
//     M 0 50
//     L 100 50
//     L 120 35
//     L 140 50
//     L 160 50
//     L 180 30
//     L 200 55
//     L 220 50
//     L 240 50
//     L 260 25
//     L 280 50
//     L 300 50
//     L 320 40
//     L 340 50
//     L 360 50
//     L 380 35
//     L 400 50
//     L 420 50
//     L 440 30
//     L 460 55
//     L 480 50
//     L 500 50
//     L 520 25
//     L 540 50
//     L 560 50
//     L 580 40
//     L 600 50
//     L 620 50
//     L 640 35
//     L 660 50
//     L 680 50
//     L 700 30
//     L 720 55
//     L 740 50
//     L 760 50
//     L 780 25
//     L 800 50
//     L 820 50
//     L 840 40
//     L 860 50
//     L 880 50
//     L 900 35
//     L 920 50
//     L 940 50
//     L 960 30
//     L 980 55
//     L 1000 50
//   `;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
//       {/* SVG fills entire width */}
//       <svg
//         ref={lineRef}
//         viewBox="0 0 1000 100"
//         preserveAspectRatio="none"
//         className="w-screen h-32 absolute top-1/2 -translate-y-1/2"
//       >
//         <path
//           d={pathData}
//           fill="none"
//           stroke={color}
//           strokeWidth="3"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>

//       {/* Logo animation */}
//       <motion.img
//         src={logo}
//         alt="Logo"
//         initial={{ opacity: 0, scale: 0.5 }}
//         animate={logoControls}
//         className="w-40 h-40 object-contain z-10"
//       />
//     </div>
//   );
// };

// export default Preloader;
