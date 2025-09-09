

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



function App() {

  return (
    <>
      <ScrollToTop />
      <div className="w-100 ease-soft-spring font-Poppins h-[100%]  !bg-[#F6FAFB]  duration-1000 ">
        <Routes>
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/opd-feedback" element={<OpdFeedBack />} />
          <Route path="/ipd-feedback" element={<IPDFeedbackDashboard />} />
          <Route path="/complaint-dashboard" element={<ComplaintManagementDashboard />} />
          <Route path="/complaint-details" element={<ComplaintViewPage />} />
          <Route path="/nps-dashboard" element={<NpsDashboard />} />
          <Route path="/executive-report" element={<ExecutiveReport />} />
          <Route path="/feedback-details" element={<FeedbackDetails />} />
          <Route path="/role-manage" element={<RoleManage />} />
          <Route path="/user-manage" element={<UserManageMent />} />
          <Route path="/super-dashboard" element={<SuperAdminDashboard />} />

          <Route path="/" element={<LoginPage />} />










        </Routes>
      </div>
    </>
  );
}

export default App;
