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
            <div className="flex flex-col w-[100%] pt-[10px] relative max-h-[93%] md34:!pb-[100px] md11:!pb-[20px] overflow-y-auto gap-[10px]  ">
         <div className="w-full min-h-screen bg-gray-50 px-2  ">

  {/* GRID LAYOUT */}
  <div className="grid grid-cols-1 md11:!pb-[10px] pb-[80px] lg:grid-cols-3 gap-6 ">

    {/* ▬▬▬ LEFT PROFILE CARD ▬▬▬ */}
    <div className="bg-white h-fit rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 p-6 flex flex-col items-center">

      {/* Photo */}
      <div className="w-28 h-28 rounded-xl overflow-hidden shadow-md border border-gray-200">
        <img
          src={employee.image}
          alt={employee.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name & Role */}
      <h2 className="mt-4 text-lg font-bold text-gray-900">{employee.name}</h2>
      <p className="text-indigo-600 font-semibold text-sm">{employee.position}</p>
      <p className="text-gray-500 text-xs">{employee.department}</p>

      {/* Status */}
      <span
        className={`mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
          employee.status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {employee.status}
      </span>

      {/* Contact */}
      <div className="w-full mt-6 space-y-4 text-sm">

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-gray-700">{employee.email}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-gray-700">{employee.phone}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-200">
            <User className="w-5 h-5 text-gray-700" />
          </div>
          <span className="text-gray-700">ID: {employee.employeeId}</span>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 w-full border-t text-xs text-gray-400 text-center">
        Joined on {employee.joinDate}
      </div>
    </div>

    {/* ▬▬▬ RIGHT SIDE CONTENT ▬▬▬ */}
    <div className="lg:col-span-2 space-y-6">

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600 bg-blue-100 p-1 rounded-md" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Department</p>
            <p className="font-semibold text-gray-800">{employee.department}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Join Date</p>
            <p className="font-semibold text-gray-800">{employee.joinDate}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Status</p>
            <p className="font-semibold text-gray-800">{employee.status}</p>
          </div>

        </div>
      </div>

      {/* Professional Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600 bg-purple-100 p-1 rounded-md" />
          Professional Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Specialization</p>
            <p className="font-semibold text-gray-800">{employee.specialization}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Position</p>
            <p className="font-semibold text-gray-800">{employee.position}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Experience</p>
            <p className="font-semibold text-gray-800">
              {employee.experience || "—"}
            </p>
          </div>

        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600 bg-yellow-100 p-1 rounded-md" />
          Projects & Achievements
        </h3>

        <div className="space-y-3 text-sm">
          {employee.projects?.length ? (
            employee.projects.map((p, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all"
              >
                {p}
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic">No recent records.</p>
          )}
        </div>
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
