import React, { useEffect } from "react";
import "../src/App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import ScrollToTop from "./Component/Scrooltop";
import PrivateRoute from "./Component/PrivateRoute.jsx";
import { subscribeToCentrifugo } from "./utils/centrifugoClient";

// import all your pages below...
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
import IpdAllList from "./pages/reportsMain/allListPages/IpdAllList.jsx";
import OpdAllList from "./pages/reportsMain/allListPages/OpdAllList.jsx";
import ComplainAllList from "./pages/reportsMain/allListPages/ComplainAllList.jsx";
import NpsAllList from "./pages/reportsMain/allListPages/NpsAllList.jsx";
import BedCreate from "./pages/bedCreate/BedCreate.jsx";
import TATAllList from "./pages/reportsMain/allListPages/TATAllList.jsx";
import PushNotification from "./pages/bedCreate/PushNotification.jsx";
import NotesAdd from "./pages/notesPage/NotesAdd.jsx";
import TodoPage from "./pages/notesPage/TodoPage.jsx";

function App() {
  const location = useLocation();

  // useEffect(() => {
  //   // Ask for notification permission
  //   if (Notification.permission !== "granted") {
  //     Notification.requestPermission().then((perm) =>
  //       console.log("🔔 Permission:", perm)
  //     );
  //   }

  //   // Show notification
  //   const showNotification = (title, body) => {
  //     if (Notification.permission === "granted") {
  //       new Notification(title, {
  //         body,
  //         icon: "/images/feedbacklogo.png",
  //       });
  //     }
  //   };

  //   // Subscribe to Centrifugo channels
  //   const subs = [
  //     subscribeToCentrifugo("hospital-doctor_service", (data) => {
  //       console.log("🩺 Doctor Service Data:", data);
  //       showNotification("New Doctor Alert", `${data.patientName} - ${data.message}`);
  //     }),
  //     subscribeToCentrifugo("hospital-ipd_feedback", (data) => {
  //       showNotification("New IPD Feedback", `${data.patientName} - ${data.message}`);
  //     }),
  //     subscribeToCentrifugo("hospital-opd_feedback", (data) => {
  //       showNotification("New OPD Feedback", `${data.patientName} - ${data.message}`);
  //     }),
  //     subscribeToCentrifugo("hospital-complaints", (data) => {
  //       showNotification("📝 Complaint Registered", `${data.patientName} - ${data.department}`);
  //     }),
  //   ];

  //   return () => subs.forEach((s) => s.unsubscribe());
  // }, []);


  useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then((perm) =>
      console.log("🔔 Permission:", perm)
    );
  }

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/images/feedbacklogo.png",
      });
    }
  };

  const subs = [
    subscribeToCentrifugo("hospital-all", (data) => {
      showNotification(data.title, data.message);
    }),
    subscribeToCentrifugo("hospital-doctor_service", (data) => {
      showNotification(data.title, data.message);
    }),
  ];

  return () => subs.forEach((s) => s.unsubscribe());
}, []);

  return (
    <>
      <ScrollToTop />
      <div className="w-100 font-Poppins bg-[#F6FAFB] h-[100%]">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/role-login" element={<UserLoginPage />} />

          {/* Private */}
          <Route path="/dashboards/super-dashboard" element={<PrivateRoute><DashBoard /></PrivateRoute>} />
          <Route path="/dashboards/opd-feedback" element={<PrivateRoute><OpdFeedBack /></PrivateRoute>} />
          <Route path="/dashboards/ipd-feedback" element={<PrivateRoute><IPDFeedbackDashboard /></PrivateRoute>} />
          <Route path="/dashboards/complaint-dashboard" element={<PrivateRoute><ComplaintManagementDashboard /></PrivateRoute>} />
          <Route path="/complaint-details" element={<PrivateRoute><ComplaintViewPage /></PrivateRoute>} />
          <Route path="/dashboards/nps-dashboard" element={<PrivateRoute><NpsDashboard /></PrivateRoute>} />
          <Route path="/dashboards/executive-report" element={<PrivateRoute><ExecutiveReport /></PrivateRoute>} />
          <Route path="/feedback-details" element={<PrivateRoute><FeedbackDetails /></PrivateRoute>} />
          <Route path="/ipd-feedback-details" element={<PrivateRoute><IpdFeedbackDetails /></PrivateRoute>} />
          <Route path="/dashboards/role-manage" element={<PrivateRoute><RoleManage /></PrivateRoute>} />
          <Route path="/dashboards/user-manage" element={<PrivateRoute><UserManageMent /></PrivateRoute>} />
          <Route path="/dashboards/bed-manage" element={<PrivateRoute><BedCreate /></PrivateRoute>} />
          <Route path="/dashboards/ipd-all-list" element={<PrivateRoute><IpdAllList /></PrivateRoute>} />
          <Route path="/dashboards/opd-all-list" element={<PrivateRoute><OpdAllList /></PrivateRoute>} />
          <Route path="/dashboards/complain-all-list" element={<PrivateRoute><ComplainAllList /></PrivateRoute>} />
          <Route path="/dashboards/nps-all-list" element={<PrivateRoute><NpsAllList /></PrivateRoute>} />
          <Route path="/mail" element={<PrivateRoute><EmailManagement /></PrivateRoute>} />
          <Route path="/dashboards/tat-view" element={<PrivateRoute><TATAllList /></PrivateRoute>} />
           <Route path="/notes" element={<PrivateRoute><NotesAdd /></PrivateRoute>} />
           <Route path="/todolist" element={<PrivateRoute><TodoPage /></PrivateRoute>} />

          <Route path="/dashboards/push-notification" element={<PrivateRoute><PushNotification /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
