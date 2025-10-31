import React, { useState } from "react";
import { Eye, Clock, User, Bed } from "lucide-react";
import Header from "../../Component/header/Header";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import { useLocation } from "react-router-dom";

export default function AllComplaintPage() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Get filter type from navigation (e.g. "Resolved", "Pending", etc.)
  const filterType = location.state?.filter || "All";

  const data = [
    {
      id: "A00328",
      dateTime: "31/10/2025 10:20",
      patient: "Kantaben Kariya",
      doctor: "-",
      bedNo: "406",
      department: "Dietitian Services",
      status: "Resolved",
    },
    {
      id: "A00329",
      dateTime: "15/10/2025 09:30",
      patient: "Payagadhi Lalitkumar",
      doctor: "Dr. Sagar",
      bedNo: "205",
      department: "Dietitian Services",
      status: "Pending",
    },
  ];

  // 🔍 Filter logic
  const filtered = data.filter((item) => {
    const matchesSearch =
      item.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterType === "All" || item.status === filterType;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <section className="flex w-full h-full select-none overflow-hidden">
        <div className="flex w-full flex-col h-screen">
          <Header pageName={`${filterType} Complaints`} />
          <div className="flex w-full h-full">
            <CubaSidebar />
            <div className="flex flex-col w-full bg-white relative max-h-[93%] overflow-y-auto gap-4 rounded-[10px]">
              <Preloader />

              {/* Search Bar */}
              <div className="flex items-center justify-end px-5 py-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                <div className="relative">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 w-[230px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border shadow-sm w-[92%] mx-auto mt-2 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-2 text-left border-r">Complaint ID</th>
                      <th className="px-4 py-2 text-left border-r">Date & Time</th>
                      <th className="px-4 py-2 text-left border-r">Patient Name</th>
                      <th className="px-4 py-2 text-left border-r">Doctor Name</th>
                      <th className="px-4 py-2 text-left border-r">Bed No.</th>
                      <th className="px-4 py-2 text-left border-r">Department</th>
                      <th className="px-4 py-2 text-left border-r">Status</th>
                      <th className="px-4 py-2 text-left">Details</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm text-gray-700">
                    {filtered.map((issue, idx) => (
                      <tr
                        key={issue.id}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
                      >
                        <td className="px-4 py-2 font-semibold text-blue-700 border-r cursor-pointer hover:underline">
                          {issue.id}
                        </td>
                        <td className="px-4 py-2 border-r flex items-center gap-2 text-[13px]">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {issue.dateTime}
                        </td>


                        <td className="px-4 py-2 border-r font-medium capitalize">{issue.patient}</td>
              

                  <td className="px-4 py-2 border-r flex items-center gap-2">
                          <Bed className="w-4 h-4 text-gray-400" />
                          {issue.bedNo}
                        </td>     

                    
                        <td className="px-4 py-2 border-r">{issue.department}</td>
                        
 
                        <td className="px-4 py-2 border-r">
                          <span
                            className={`px-3 py-[3px] rounded-full text-xs font-semibold ${
                              issue.status === "Resolved"
                                ? "bg-green-100 text-green-700"
                                : issue.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : issue.status === "Escalated"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {issue.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-blue-600 font-medium cursor-pointer flex items-center gap-1 hover:underline">
                          <Eye className="w-4 h-4" />
                          View
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-gray-500">
                          No complaints found for {filterType}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
