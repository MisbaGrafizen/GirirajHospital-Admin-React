import React, { useEffect } from "react";
import "../src/App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import ScrollToTop from "./Component/Scrooltop";
import Cookies from "js-cookie";

// Pages
import DashBoard from "./pages/dashBoard/DashBoard";
import OpdFeedBack from "./pages/reportsMain/OPDFeedbackDashboard";
import IPDFeedbackDashboard from "./pages/reportsMain/IPDFeedbackDashboard";
import ComplaintManagementDashboard from "./pages/complaintManagement/ComplaintManagementDashboard";
import ComplaintViewPage from "./pages/complaintManagement/ComplaintViewPage";
import NpsDashboard from "./pages/NpsFolder/NpsDashboard";
import ExecutiveReport from "./pages/executive/ExecutiveReport";
import FeedbackDetails from "./pages/reportsMain/FeedbackDetails";
import RoleManage from "./pages/roleModule/RoleManage";
import UserManageMent from "./pages/roleModule/UserManageMent";
import LoginPage from "./pages/LoginPage";
import UserLoginPage from "./pages/UserLoginPage";
import IpdFeedbackDetails from "./pages/reportsMain/IpdFeedbackDetails";
import EmailManagement from "./pages/EmailManagement";
import ChatPage from "./pages/chatappPage/ChatPage";
import IpdAllList from "./pages/reportsMain/allListPages/IpdAllList.jsx";
import OpdAllList from "./pages/reportsMain/allListPages/OpdAllList.jsx";
import ComplainAllList from "./pages/reportsMain/allListPages/ComplainAllList.jsx";
import NpsAllList from "./pages/reportsMain/allListPages/NpsAllList.jsx";
import BedCreate from "./pages/bedCreate/BedCreate.jsx";
import TATAllList from "./pages/reportsMain/allListPages/TATAllList.jsx";

import socket from "./socket/index.js";
import PrivateRoute from "./Component/PrivateRoute.jsx"; // ✅ import

function App() {
  const location = useLocation();

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const showNotification = (title, body) => {
      if (Notification.permission === "granted") {
        new Notification(title, { body, icon: "/images/feedbacklogo.png" });
      }
    };

    // 🔴 Clear old listeners
    socket.off("ipd:new");
    socket.off("opd:new");
    socket.off("ipd:complaint");

    // ✅ Register once
    socket.on("ipd:new", (data) => {
      showNotification("🩺 New IPD Patient", `${data.patientName} (Bed ${data.bedNo})`);
    });

    socket.on("opd:new", (data) => {
      showNotification("🩺 New OPD Patient", `${data.patientName}`);
    });

    socket.on("ipd:complaint", (data) => {
      showNotification("📝 New Complaint", `${data.patientName} added a complaint.`);
    });

    return () => {
      socket.off("ipd:new");
      socket.off("opd:new");
      socket.off("ipd:complaint");
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <div className="w-100 ease-soft-spring font-Poppins h-[100%] !bg-[#F6FAFB] duration-1000">
        <Routes>
          {/* ✅ Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/role-login" element={<UserLoginPage />} />

          {/* ✅ Private Routes */}
          <Route
            path="/dashboards/super-dashboard"
            element={<PrivateRoute><DashBoard /></PrivateRoute>}
          />
          <Route
            path="/dashboards/opd-feedback"
            element={<PrivateRoute><OpdFeedBack /></PrivateRoute>}
          />
          <Route
            path="/dashboards/ipd-feedback"
            element={<PrivateRoute><IPDFeedbackDashboard /></PrivateRoute>}
          />
          <Route
            path="/dashboards/complaint-dashboard"
            element={<PrivateRoute><ComplaintManagementDashboard /></PrivateRoute>}
          />
          <Route
            path="/complaint-details"
            element={<PrivateRoute><ComplaintViewPage /></PrivateRoute>}
          />
          <Route
            path="/dashboards/nps-dashboard"
            element={<PrivateRoute><NpsDashboard /></PrivateRoute>}
          />
          <Route
            path="/dashboards/executive-report"
            element={<PrivateRoute><ExecutiveReport /></PrivateRoute>}
          />
          <Route
            path="/feedback-details"
            element={<PrivateRoute><FeedbackDetails /></PrivateRoute>}
          />
          <Route
            path="/ipd-feedback-details"
            element={<PrivateRoute><IpdFeedbackDetails /></PrivateRoute>}
          />
          <Route
            path="/dashboards/role-manage"
            element={<PrivateRoute><RoleManage /></PrivateRoute>}
          />
          <Route
            path="/dashboards/user-manage"
            element={<PrivateRoute><UserManageMent /></PrivateRoute>}
          />
          <Route
            path="/dashboards/bed-manage"
            element={<PrivateRoute><BedCreate /></PrivateRoute>}
          />

          <Route
            path="/dashboards/ipd-all-list"
            element={<PrivateRoute><IpdAllList /></PrivateRoute>}
          />
          <Route
            path="/dashboards/opd-all-list"
            element={<PrivateRoute><OpdAllList /></PrivateRoute>}
          />
          <Route
            path="/dashboards/complain-all-list"
            element={<PrivateRoute><ComplainAllList /></PrivateRoute>}
          />
          <Route
            path="/dashboards/nps-all-list"
            element={<PrivateRoute><NpsAllList /></PrivateRoute>}
          />
          <Route
            path="/dashboards/tat-all-list"
            element={<PrivateRoute><TATAllList /></PrivateRoute>}
          />
          <Route
            path="/mail"
            element={<PrivateRoute><EmailManagement /></PrivateRoute>}
          />
          {/* <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} /> */}
        </Routes>
      </div>
    </>
  );
}

export default App;
