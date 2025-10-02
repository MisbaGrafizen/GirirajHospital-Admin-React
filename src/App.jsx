

import React, { useEffect, useState } from "react";
import "../src/App.css";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import ScrollToTop from "./Component/Scrooltop";

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
import { listenForMessages, requestNotificationPermission } from "./helper/notification";
import ChatPage from "./pages/chatappPage/ChatPage";
import socket from "./socket/index.js";
import IpdAllList from "./pages/reportsMain/allListPages/IpdAllList.jsx";
import OpdAllList from "./pages/reportsMain/allListPages/OpdAllList.jsx";
import ComplainAllList from "./pages/reportsMain/allListPages/ComplainAllList.jsx";
import NpsAllList from "./pages/reportsMain/allListPages/NpsAllList.jsx";
import BedCreate from "./pages/bedCreate/BedCreate.jsx";
import TATAllList from "./pages/reportsMain/allListPages/TATAllList.jsx";



function App() {

      const location = useLocation();

  //     useEffect(() => {
  //   requestNotificationPermission();
  //   listenForMessages();
  // }, []);

    useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/images/feedbacklogo.png" });
    }
  };

  // 🔴 Always clear old listeners first
  socket.off("ipd:new");
  socket.off("opd:new");
  socket.off("ipd:complaint");

  // ✅ Register once
  socket.on("ipd:new", (data) => {
    console.log("📩 ipd:new", data);
    showNotification("🩺 New IPD Patient", `${data.patientName} (Bed ${data.bedNo})`);
  });

  socket.on("opd:new", (data) => {
    console.log("📩 opd:new", data);
    showNotification("🩺 New OPD Patient", `${data.patientName}`);
  });

  socket.on("ipd:complaint", (data) => {
    console.log("📩 ipd:complaint", data);
    showNotification("📝 New Complaint", `${data.patientName} added a complaint.`);
  });

  return () => {
    // Cleanup on unmount
    socket.off("ipd:new");
    socket.off("opd:new");
    socket.off("ipd:complaint");
  };
}, []);





  useEffect(() => {
    if (location.pathname === "/") {
      localStorage.setItem("loginType", "admin"); // full access
    } else if (location.pathname === "/role-login") {
      localStorage.setItem("loginType", "user"); // permission-based
    }
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <div className="w-100 ease-soft-spring font-Poppins h-[100%]  !bg-[#F6FAFB]  duration-1000 ">
        <Routes>
          <Route path="/dashboards/super-dashboard" element={<DashBoard />} />
          <Route path="/dashboards/opd-feedback" element={<OpdFeedBack />} />
          <Route path="/dashboards/ipd-feedback" element={<IPDFeedbackDashboard />} />
          <Route path="/dashboards/complaint-dashboard" element={<ComplaintManagementDashboard />} />
          <Route path="/complaint-details" element={<ComplaintViewPage />} />
          <Route path="/dashboards/nps-dashboard" element={<NpsDashboard />} />
          <Route path="/dashboards/executive-report" element={<ExecutiveReport />} />
          <Route path="/feedback-details" element={<FeedbackDetails />} />  
          <Route path="/ipd-feedback-details" element={<IpdFeedbackDetails />} />
          <Route path="/dashboards/role-manage" element={<RoleManage />} />
          <Route path="/dashboards/user-manage" element={<UserManageMent />} />
          <Route path="/dashboards/bed-manage" element={<BedCreate />} />




          <Route path="/dashboards/ipd-all-list" element={<IpdAllList />} />
          <Route path="/dashboards/opd-all-list" element={<OpdAllList />} />
          <Route path="/dashboards/complain-all-list" element={<ComplainAllList />} />
          <Route path="/dashboards/nps-all-list" element={<NpsAllList />} />
          <Route path="/dashboards/tat-all-list" element={<TATAllList />} />




          <Route path="/mail" element={<EmailManagement />} />
          {/* <Route path="/chat" element={<ChatPage />} /> */}



          <Route path="/" element={<LoginPage />} />
          <Route path="/role-login" element={<UserLoginPage />} />

        </Routes>
      </div>
    </>
  );
}

export default App;
