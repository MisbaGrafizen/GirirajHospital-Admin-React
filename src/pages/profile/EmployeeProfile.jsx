import React, { useEffect, useState } from "react";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Header from "../../Component/header/Header";
import Preloader from "../../Component/loader/Preloader";
import image from "../../../public/imges/main/avter.jpeg";
import {
  Mail,
  Phone,
  CalendarDays,
  Briefcase,
  User,
  ClipboardList,
  Award,
  Edit3,
} from "lucide-react";

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // 🟢 Fetch user data from localStorage
      const storedUser = localStorage.getItem("user");
      console.log('storeduser', storedUser)
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        // Example expected structure:
        // {
        //   name: "Dr. Sarah Johnson",
        //   email: "sarah.johnson@hospital.com",
        //   phone: "9876543210",
        //   department: "Cardiology",
        //   designation: "Senior Physician",
        //   joinDate: "2023-01-15",
        //   status: "Active",
        //   specialization: "Cardiac Surgery"
        // }

        setEmployee({
          name: parsedUser.name || "Unknown User",
          position: parsedUser.designation || "—",
          department: parsedUser.department || "—",
          employeeId: parsedUser.employeeId || "—",
          email: parsedUser.email || "—",
          phone: parsedUser.phone || "—",
          joinDate:
            parsedUser.joinDate ||
            new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          status: parsedUser.status || "Active",
          specialization: parsedUser.specialization || "—",
          image: parsedUser.image || image,
        });
      } else {
        console.warn("No user found in localStorage.");
      }
    } catch (err) {
      console.error("Failed to parse user data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <Preloader />;

  if (!employee)
    return (
      <div className="flex items-center justify-center h-[70vh] text-gray-600">
        No profile data found. Please log in again.
      </div>
    );

  return (
    <>
      <section className="flex w-[100%] h-[100%] select-none overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="Profile" />
          <div className="flex w-[100%] h-[100%]">
            <CubaSidebar />
            <div className="flex flex-col w-[100%] relative max-h-[93%] md34:!pb-[100px] md11:!pb-[20px] overflow-y-auto gap-[10px]  ">
          <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-[26%] bg-white/70 backdrop-blur-md border-r border-gray-200 p-3 flex flex-col justify-between shadow-md">
        {/* Top Profile */}
        <div>
          <div className="flex flex-col items-center text-center">
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-lg border-4 border-white mb-4">
              <img
                src={employee.image}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.name}
            </h1>
            <p className="text-blue-600 font-medium mt-1">
              {employee.position}
            </p>
            <p className="text-gray-500 text-sm">{employee.department}</p>

            <span
              className={`mt-4 px-5 py-1.5 text-sm font-semibold rounded-full ${
                employee.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {employee.status}
            </span>
          </div>

          {/* Contact Info */}
          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Email</p>
                <a
                  href={`mailto:${employee.email}`}
                  className="text-gray-900 font-semibold hover:text-blue-600"
                >
                  {employee.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Phone</p>
                <a
                  href={`tel:${employee.phone}`}
                  className="text-gray-900 font-semibold hover:text-blue-600"
                >
                  {employee.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Employee ID Footer */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Employee ID</p>
          <p className="text-gray-800 font-semibold">{employee.employeeId}</p>
          <p className="text-xs text-gray-400 mt-2">
            Joined: {employee.joinDate}
          </p>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-7 h-7 text-blue-600" />
              Employee Overview
            </h2>
            <p className=" text-[13px] text-gray-500">
              Complete profile & professional information
            </p>
          </div>

        </div>

        {/* DETAILS GRID */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Personal Information
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Department</span>
                <span className="font-semibold text-gray-800">
                  {employee.department}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Join Date</span>
                <span className="font-semibold text-gray-800">
                  {employee.joinDate}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold text-green-700">
                  {employee.status}
                </span>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Professional Details
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Specialization</span>
                <span className="font-semibold text-gray-800">
                  {employee.specialization}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Position</span>
                <span className="font-semibold text-gray-800">
                  {employee.position}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="font-semibold text-gray-800">
                  {employee.experience || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Achievements / Projects */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Recent Projects / Achievements
            </h3>

            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              {employee.projects && employee.projects.length > 0 ? (
                employee.projects.map((proj, i) => (
                  <li key={i} className="leading-6">
                    {proj}
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic">No recent records.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
