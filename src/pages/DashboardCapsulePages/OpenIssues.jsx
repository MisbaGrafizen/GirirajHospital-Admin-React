import React, { useEffect, useState } from "react";
import { Eye, Clock, User, Bed } from "lucide-react";
import Header from "../../Component/header/Header";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import { ApiGet } from "../../helper/axios";
import { useNavigate } from "react-router-dom";

export default function OpenIssues() {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await ApiGet("/admin/ipd-concern"); // ✅ your backend API
        const complaints = res?.data || [];

        // ✅ show only open complaints
        const openComplaints = complaints.filter(
          (c) => c.status?.toLowerCase() === "open"
        );

        setData(openComplaints);
      } catch (err) {
        console.error("❌ Failed to fetch complaints:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);


  const filtered = data.filter(
    (item) =>
      item.patientName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleNavigate = (complaint) => {
  navigate("/complaint-details", { state: { complaint } });
};


  return (
    <>
      <section className="flex w-full h-full select-none overflow-hidden">
        <div className="flex w-full flex-col h-screen">
          <Header pageName="Open Issues" />
          <div className="flex w-full h-full">
            <CubaSidebar />
            <div className="flex flex-col w-full bg-white px-[10px] relative max-h-[93%] overflow-y-auto gap- ">
              <Preloader />

              {/* 🔍 Search */}
              <div className="flex items-center justify-end px-3 pt-[10px] pb-[10px] sticky top-0 z-10">
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

              {/* 📋 Table */}
              <div className="bg-white rounded-xl border shadow-sm w-[100%] mx-auto  overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 text-xs font-[500] text-gray-600 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-2 text-left font-[500] border-r">Complaint ID</th>
                        <th className="px-4 py-2 text-left font-[500] border-r">Date & Time</th>
                        <th className="px-4 py-2 text-left  font-[500] border-r">Patient Name</th>
                        <th className="px-4 py-2 text-left  font-[500] border-r">Doctor Name</th>
                        <th className="px-4 py-2 text-left  font-[500] border-r">Bed No.</th>
                        <th className="px-4 py-2 text-left  font-[500] border-r">Department</th>
                        <th className="px-4 py-2 text-left font-[500] border-r">Status</th>
                        <th className="px-4 py-2 text-left font-[500]">Details</th>
                      </tr>
                    </thead>

                    <tbody className="text-sm text-gray-700">
                      {filtered.map((issue, idx) => (
                        <tr
                          key={issue.id}
                          className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-blue-50 transition`}
                        >
                          <td className="px-4 py-2 font-[500] text-blue-700 border-r cursor-pointer hover:underline">
                            {issue.complaintId}
                          </td>
                          <td className="px-4 py-2 border-r">
                            <div className="flex items-center gap-2 text-[13px]">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {issue.createdAt
                                ? `${new Date(issue.createdAt).toLocaleDateString("en-GB")} ${new Date(issue.createdAt)
                                  .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                : "-"}
                            </div>
                          </td>
                          <td className="px-4 py-2 border-r capitalize font-[400]">
                            {issue.patientName}
                          </td>
                          <td className="px-4 py-2 border-r flex items-center gap-2">
                            <div className="flex items-center gap-2 text-[13px]">
                              <User className="w-4 h-4 text-gray-400" />
                              {issue.consultantDoctorName?.name}
                            </div>
                          </td>
                          <td className="px-4 py-2 border-r  gap-2">
                            <div className="flex items-center gap-2 text-[13px]">
                              <Bed className="w-4 h-4 text-gray-400" />
                              {issue.bedNo}
                            </div>
                          </td>
                          
                          <td className="px-4 py-2 border-r">{issue.department}</td>
                          <td className="px-4 py-2 border-r">
                            <span
                              className={`px-3 py-[3px] rounded-full text-xs font-semibold ${issue.status === "Resolved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {issue.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-blue-600 font-medium cursor-pointer flex items-center gap-1 hover:underline" onClick={() => handleNavigate(issue)}>
                            <Eye className="w-4 h-4" />
                            View
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
