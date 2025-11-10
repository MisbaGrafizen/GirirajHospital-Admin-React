// "use client";

// import React from "react";
// import { Col, Row } from "reactstrap";
// import Widgets1 from "../../Common/CommonWidgets/Widgets1";
// import {
//   MessageSquare,
//   Star,
//   AlertCircle,
//   Activity,
//   TrendingUp,
//   ClipboardList,
//   User,
//   Timer,
// } from "lucide-react";

// const WidgetsWrapper = ({ kpis, totals }) => {
//   // --- KPIs ---
//   const totalFeedback = kpis?.totalFeedback || 0;
//   const avgRating = kpis?.averageRating?.value?.toFixed(1) || "0.0";
//   const responseRate =
//     kpis?.responseRate?.percent != null ? kpis.responseRate.percent : "—";
//   const openIssues = kpis?.openIssues || 0;
//   const npsRating = kpis?.npsRating?.value?.toFixed(1) || "0.0";
//   const totalConcern = kpis?.totalConcern || 0;

//   // --- Totals ---
//   const totalRoleUsers = totals?.totalRoleUsers || 0;
//   const totalTAT = totals?.totalTAT || 0;

//   console.log("📊 KPIs:", kpis);
//   console.log("👥 Totals:", totals);

//   const widgets = [
//     {
//       title: "Total Feedback",
//       gros: totalFeedback,
//       total: totalFeedback,
//       color: "primary",
//       icon: <MessageSquare className="w-5 text-[#7366ff] h-5" />,
//     },
//     {
//       title: "Average Rating",
//       gros: avgRating,
//       total: avgRating,
//       color: "warning",
//       icon: <Star className="w-5 text-[#ffaa06] h-5" />,
//     },
//     {
//       title: "Open Issues",
//       gros: openIssues,
//       total: openIssues,
//       color: "warning",
//       icon: <AlertCircle className="w-5 text-[#ffaa06] h-5" />,
//     },
//     {
//       title: "Response Rate",
//       gros: responseRate,
//       total: responseRate + "%",
//       color: "success",
//       icon: <Activity className="w-5 text-[#55ba4a] h-5" />,
//     },
//     {
//       title: "NPS Rating",
//       gros: npsRating,
//       total: npsRating,
//       color: "info",
//       icon: <TrendingUp className="w-5 h-5" />,
//     },
//     {
//       title: "Total Concerns",
//       gros: totalConcern,
//       total: totalConcern,
//       color: "secondary",
//       icon: <ClipboardList className="w-5 text-[#f83164] h-5" />,
//     },
//     {
//       title: "Total TAT",
//       gros: totalTAT,
//       total: totalTAT,
//       color: "info",
//       icon: <Timer className="w-5 h-5" />,
//     },
//     {
//       title: "Total Users",
//       gros: totalRoleUsers,
//       total: totalRoleUsers,
//       color: "danger",
//       icon: <User className="w-5 text-[#ffaa06] h-5" />,
//     },
//   ];

//   return (
//     <Row className="gx-3 gy-1">
//       {widgets.map((widget, index) => (
//         <Col key={index} className="mx-auto md77:!block" xs="6" md="4" lg="3">
//           <Widgets1 data={widget} />
//         </Col>
//       ))}
//     </Row>
//   );
// };

// export default WidgetsWrapper;


"use client";

import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import Widgets1 from "../../Common/CommonWidgets/Widgets1";
import {
  MessageSquare,
  Star,
  AlertCircle,
  Activity,
  TrendingUp,
  ClipboardList,
  User,
  Timer,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const WidgetsWrapper = ({ kpis, totals }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(null);

  // --- KPIs ---
  const totalFeedback = kpis?.totalFeedback || 0;
  const avgRating = kpis?.averageRating?.value?.toFixed(1) || "0.0";
  const responseRate =
    kpis?.responseRate?.percent != null ? kpis.responseRate.percent : "—";
  const openIssues = kpis?.openIssues || 0;
  const npsRating = kpis?.npsRating?.value?.toFixed(1) || "0.0";
  const totalConcern = kpis?.totalConcern || 0;

  // --- Totals ---
  const totalRoleUsers = totals?.totalRoleUsers || 0;
  const totalTAT = totals?.totalTAT || 5; // example total solved issues
  const totalTATHours = totals?.totalTATHours || 23;
  const totalTATMinutes = totals?.totalTATMinutes || 42;

  const handleWidgetClick = (type) => {
    switch (type) {
      case "feedback":
        navigate("/ipd-opd-list");
        break;
      case "avgRating":
        setShowPopup("avgRating");
        break;
      case "responseRate":
        setShowPopup("responseRate");
        break;
      case "openIssues":
        navigate("/open-issues");
        break;
      case "concerns":
        navigate("/dashboards/complain-all-list");
        break;
      case "tat":
        setShowPopup("tat");
        break;
      case "users":
        navigate("/user-all-list");
        break;
      default:
        break;
    }
  };

  const widgets = [
    {
      title: "Total Feedback",
      gros: totalFeedback,
      total: totalFeedback,
      color: "primary",
      icon: <MessageSquare className="w-5 text-[#7366ff] h-5" />,
      action: () => handleWidgetClick("feedback"),
    },
        {
      title: "Total Concerns",
      gros: totalConcern,
      total: totalConcern,
      color: "secondary",
      icon: <ClipboardList className="w-5 text-[#f83164] h-5" />,
      action: () => handleWidgetClick("concerns"),
    },

    {
      title: "Total TAT",
      gros: totalTAT,
      total: `${totalTATHours}h ${totalTATMinutes}m`,
      color: "info",
      icon: <Timer className="w-5 h-5" />,
      action: () => handleWidgetClick("tat"),
    },
        {
      title: "Total Users",
      gros: totalRoleUsers,
      total: totalRoleUsers,
      color: "danger",
      icon: <User className="w-5 text-[#ffaa06] h-5" />,
      action: () => handleWidgetClick("users"),
    },
        {
      title: "Open Issues",
      gros: openIssues,
      total: openIssues,
      color: "warning",
      icon: <AlertCircle className="w-5 text-[#ffaa06] h-5" />,
      action: () => handleWidgetClick("openIssues"),
    },
        {
      title: "Response Rate",
      gros: responseRate,
      total: responseRate + "%",
      color: "success",
      icon: <Activity className="w-5 text-[#55ba4a] h-5" />,
      action: () => handleWidgetClick("responseRate"),
    },
    {
      title: "Average Rating",
      gros: avgRating,
      total: avgRating,
      color: "warning",
      icon: <Star className="w-5 text-[#ffaa06] h-5" />,
      action: () => handleWidgetClick("avgRating"),
    },


    {
      title: "NPS Rating",
      gros: npsRating,
      total: npsRating,
      color: "info",
      icon: <TrendingUp className="w-5 h-5" />,
      action: () => navigate("/reports/nps-all-list"),
    },


  ];

  // 🧠 Smart Summary for TAT
  const tatSummary = `
Total ${totalTAT} complaints resolved.
Average turnaround time: ${totalTATHours} hours ${totalTATMinutes} minutes.
${totalTATHours < 30
    ? "Performance is within optimal limits — excellent team efficiency."
    : "Resolution time exceeded benchmark — consider reviewing process delays."}
`;

  return (
    <>
      {/* KPI Cards */}
      <Row className="gx-3 gy-1">
        {widgets.map((widget, index) => (
          <Col key={index} xs="6" md="4" lg="3">
            <div onClick={widget.action} className="cursor-pointer">
              <Widgets1 data={widget} />
            </div>
          </Col>
        ))}
      </Row>

      {/* Popups */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPopup(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
              >
                <XCircle className="w-6 h-6" />
              </button>

              {/* Dynamic Modal Title */}
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                {showPopup === "avgRating"
                  ? "Average Rating Details"
                  : showPopup === "responseRate"
                  ? "Response Rate Overview"
                  : "Turnaround Time (TAT) Summary"}
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {showPopup === "avgRating"
                  ? "Average Rating represents patient satisfaction across feedback submissions. Higher values indicate better service quality."
                  : showPopup === "responseRate"
                  ? "Response Rate shows how many patients submitted feedback out of total possible. Aim for 80%+ for excellent engagement."
                  : "Turnaround Time (TAT) measures how fast complaints or issues are resolved, helping monitor service performance."}
              </p>

              {/* Data / Summary */}
              <div className="mt-2 text-center">
                {showPopup === "tat" ? (
                  <>
                    <p className="text-4xl font-bold text-blue-600 mb-2">
                      {totalTATHours}h {totalTATMinutes}m
                    </p>
                    <p className="text-gray-700 text-sm whitespace-pre-line">
                      {tatSummary}
                    </p>
                  </>
                ) : (
                  <p className="text-4xl font-bold text-red-600">
                    {showPopup === "avgRating"
                      ? avgRating
                      : `${responseRate}%`}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WidgetsWrapper;
