import React, { useEffect, useState } from "react";
import { Eye, Phone, User, Mail, IdCard, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../Component/header/Header";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import { ApiGet } from "../../helper/axios";

export default function UserAllList() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Check login type
  const loginType = localStorage.getItem("loginType");
  const isAdmin = loginType === "admin";

  useEffect(() => {
    const fetchRoleUsers = async () => {
      try {
        setLoading(true);

        // ❗ Non-admin should never see users
        if (!isAdmin) {
          setUsers([]);
          return;
        }

        const res = await ApiGet("/admin/role-user");
        setUsers(res?.roleUser || []);
      } catch (err) {
        console.error("Failed to fetch role users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleUsers();
  }, [isAdmin]);

  // 🔍 Search Filter — only admin can search
  const filteredUsers = isAdmin
    ? users.filter((u) => {
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q)
      );
    })
    : []; // ❗ Non-admin → no users shown

  // Count users ONLY for admin
  const totalUsers = filteredUsers.length;

  const handleView = (user) => {
    if (!isAdmin) return; // safety
    navigate("/user-details", { state: { user } });
  };

  return (
    <>
      <section className="flex w-full h-full select-none overflow-hidden">
        <div className="flex w-full flex-col gap-0 h-screen">
          <Header pageName="User List" />
          <div className="flex w-full h-full">
            <CubaSidebar />

            <div className="flex flex-col w-full relative max-h-[93%] md34:!pb-[120px] md11:!pb-[20px] py-[10px] px-[10px] overflow-y-auto gap-[10px]">
              <Preloader />

              {/* 🔍 Total Users + Search Bar */}
              <div className="flex justify-between items-center px-2">
                <div className="text-[14px] font-semibold text-gray-700">
                  Total Users: {isAdmin ? totalUsers : 0}
                </div>

                {/* non-admin → disable search */}
                {isAdmin && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-3 py-2 w-[230px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                )}
              </div>

              {/* 📋 User Table */}
              <div className="w-[100%] mx-auto border rounded-[10px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-[12px] text-left text-[12px] border-r font-medium text-gray-600 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-[12px] text-left text-[12px] border-r font-medium text-gray-600 uppercase tracking-wider">
                          Contact Number
                        </th>
                        <th className="px-6 py-[12px] text-left text-[12px] border-r font-medium text-gray-600 uppercase tracking-wider">
                          Employee ID
                        </th>
                        <th className="px-6 py-[12px] text-left text-[12px] border-r font-medium text-gray-600 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-[12px] text-left text-[12px] border-r font-medium text-gray-600 uppercase tracking-wider">
                          Email
                        </th>

                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredUsers.map((u, index) => (
                        <tr
                          key={u.id}
                          className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                        >
                          <td className="px-6 py-[10px] text-sm border-r">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {u.name}
                            </div>
                          </td>

                          <td className="px-6 py-[10px] text-sm border-r">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {u.contactNumber}
                            </div>
                          </td>

                          <td className="px-6 py-[10px] text-sm border-r">
                            <div className="flex items-center gap-2">
                              <IdCard className="w-5 h-5 text-gray-400" />
                              {u.employeeId}
                            </div>
                          </td>

                          <td className="px-6 py-[10px] text-sm border-r">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              {u.department}
                            </div>
                          </td>

                          <td className="px-6 py-[10px] text-sm border-r">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {u.email}
                            </div>
                          </td>


                        </tr>
                      ))}

                      {!loading && filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-gray-500">
                            {isAdmin ? "No users found." : "No users available."}
                          </td>
                        </tr>
                      )}
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
