

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
import SuperAdminDashboard from "./pages/adminDashboard/SuperAdminDashboard";
import UserLoginPage from "./pages/UserLoginPage";
import IpdFeedbackDetails from "./pages/reportsMain/IpdFeedbackDetails";



function App() {

    const location = useLocation();

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
          <Route path="/dashboard" element={<DashBoard />} />
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
          <Route path="/dashboards/super-dashboard" element={<SuperAdminDashboard />} />

          <Route path="/" element={<LoginPage />} />
          <Route path="/role-login" element={<UserLoginPage />} />

        </Routes>
      </div>
    </>
  );
}

export default App;
