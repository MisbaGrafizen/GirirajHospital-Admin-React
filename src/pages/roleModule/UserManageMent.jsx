// import React, { useEffect, useRef, useState } from 'react'
// import Header from '../../Component/header/Header'
// import SideBar from '../../Component/sidebar/CubaSideBar'
// import { Calendar, Clock, MoreVertical, X, Upload, User, Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react"
// import { ApiDelete, ApiGet, ApiPost, ApiPut } from '../../helper/axios';
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronDown } from "lucide-react";
// // import { useDispatch, useSelector } from 'react-redux';

// import { Modal as NextUIModal, ModalContent } from "@nextui-org/react";
// import uploadToHPanel from '../../helper/hpanelUpload';

// export default function UserManageMent() {
//     const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
//     const [users, setUsers] = useState([]);
//     const [roles, setRoles] = useState([
//         { _id: "r1", roleName: "Admin" },
//         { _id: "r2", roleName: "Project Manager" },
//         { _id: "r3", roleName: "General Accountant" },
//         { _id: "r4", roleName: "Sales Executive" },
//         { _id: "r5", roleName: "Support Engineer" },
//     ]);


//     const [companies, setCompanies] = useState([
//         { _id: "c1", firmName: "TechCorp" },
//         { _id: "c2", firmName: "GlobalSoft" },
//         { _id: "c3", firmName: "NextGen Solutions" },
//         { _id: "c4", firmName: "Bright Future Ltd" },
//         { _id: "c5", firmName: "InnovaWorks" },
//     ]);

//     const [isLoading, setIsLoading] = useState(false);
//     const [editingUser, setEditingUser] = useState(null);
//     const cardMenuRef = useRef(null);
//     const dropdownRef = useRef(null);
//     const [showPassword, setShowPassword] = useState(false);
//     const [viewdatamodal, setViewDataModal] = useState(false);
//     const [selectedCompanies, setSelectedCompanies] = useState([]);
//     const [selectedUserData, setSelectedUserData] = useState(null);
//     const togglePasswordVisibility = () => setShowPassword(!showPassword);
//     const [screenshot, setScreenshot] = useState(null);
//     const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
//     const [isSavingUser, setIsSavingUser] = useState(false);
//     const [activeCard, setActiveCard] = useState(null);

//     // const dispatch = useDispatch();

//     const [isDropdownOpen, setDropdownOpen] = useState(false);

//     const handleRoleSelect = (roleName) => {
//         setFormData((prev) => ({ ...prev, role: roleName }));
//         setDropdownOpen(false);
//     };

//     // const [formData, setFormData] = useState({
//     //     name: "",
//     //     email: "",
//     //     role: "",
//     //     password: "",
//     //     loginEnabled: true,
//     //     avatar: null,
//     // });

//     // const companies = useSelector((state) => state.users.getCompanies);

//     const fetchRoles = async () => {
//         try {
//             const res = await ApiGet("/admin/role");
//             if (res?.role) {
//                 setRoles(res.role);
//             }
//         } catch (err) {
//             console.error("Error fetching roles", err);
//         }
//     };

//     const fetchUsers = async () => {
//         setIsLoading(true);
//         try {
//             const res = await ApiGet("/admin/role-user");
//             console.log("roleUser", res);
//             if (res?.roleUser) {
//                 setUsers(res.roleUser);
//             }
//             setIsLoading(false);
//         } catch (err) {
//             console.error("Error fetching users", err);
//         }
//     };

//     useEffect(() => {
//         fetchUsers();
//         fetchRoles();
//     }, []);

//     const handleAddUser = async (e) => {
//         e.preventDefault();

//         const selectedRole = roles.find((r) => r.roleName === formData.role);
//         const roleId = selectedRole?._id;

//         // Validate password only if login is enabled
//         if (formData.loginEnabled && !formData.password) {
//             alert("Please enter a password if login is enabled.");
//             return;
//         }

//         try {
//             setIsSavingUser(true);
//             const payload = {
//                 name: formData.name,
//                 email: formData.email,
//                 roleId: roleId,
//                 password: formData.loginEnabled ? formData.password : undefined,
//                 loginEnabled: formData.loginEnabled,
//                 avatar: formData.avatar,
//             };

//             console.log("payload", payload);

//             if (editingUser) {
//                 await ApiPut(`/admin/role-user/${editingUser._id}`, payload);
//             } else {
//                 await ApiPost("/admin/role-user", payload);
//             }
//             fetchUsers();
//             setIsModalOpen(false);
//             resetForm();
//             setEditingUser(null);

//         } catch (error) {
//             console.error("Error creating user", error);
//         } finally {
//             setIsSavingUser(false);
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             name: "",
//             email: "",
//             roleId: "",
//             password: "",
//             loginEnabled: true,
//             avatar: null,
//         });
//         setScreenshot(null);
//         setSelectedCompanies([]);
//     };


//     // const handleChange = (e) => {
//     //     const { name, value, type, checked } = e.target
//     //     setFormData({
//     //         ...formData,
//     //         [name]: type === "checkbox" ? checked : value,
//     //     })
//     // }

//     // const handleScreenshotCapture = () => {
//     //     fileInputRef.current.click()
//     // }

//     // const handleFileChange = (e) => {
//     //     if (e.target.files && e.target.files[0]) {
//     //         const file = e.target.files[0]
//     //         const reader = new FileReader()

//     //         reader.onload = (event) => {
//     //             setScreenshot(event.target.result)
//     //             setFormData({
//     //                 ...formData,
//     //                 avatar: event.target.result,
//     //             })
//     //         }

//     //         reader.readAsDataURL(file)
//     //     }
//     // }

//     const toggleCardMenu = (id) => {
//         setActiveCard(activeCard === id ? null : id)
//     }

//     const formatDate = (dateString) => {
//         if (!dateString) return "";
//         const date = new Date(dateString);
//         return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
//     };

//     const formatTime = (dateString) => {
//         if (!dateString) return "";
//         const date = new Date(dateString);
//         return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     };

//     const handleCompanySelect = (company) => {
//         setFormData({ ...formData, companyId: company._id, companyName: company.firmName });
//         setCompanyDropdownOpen(false);
//     };





//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (cardMenuRef.current && !cardMenuRef.current.contains(event.target)) {
//                 setActiveCard(null); // close any open popup
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);



//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setCompanyDropdownOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     const toggleCompanySelection = (company) => {
//         const exists = selectedCompanies.find((c) => c._id === company._id);
//         if (exists) {
//             setSelectedCompanies(selectedCompanies.filter((c) => c._id !== company._id));
//         } else {
//             setSelectedCompanies([...selectedCompanies, company]);
//         }
//     };

//     const removeCompany = (id) => {
//         setSelectedCompanies(selectedCompanies.filter((c) => c._id !== id));
//     };


//     const handleopenmodal = (user) => {
//         setSelectedUserData(user);
//         setViewDataModal(true);
//     };


//     const handleClosemodal = () => {
//         setViewDataModal(false)
//     }


//     const userData = {
//         name: "asd",
//         email: "aSD",
//         role: "General Accountant",
//         companies: ["SHRI RAMESHWAR POLE INDUSTRIES", "SHIV SHAKTI POLE INDUSTRIES"],
//         password: "••••••••",
//         loginEnabled: true,
//         profilePicture: null,
//     }



//     // const [users, setUsers] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         role: '',
//         password: '',
//         loginEnabled: true,
//         avatar: null,
//     });
//     const fileInputRef = useRef(null);


//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData({
//             ...formData,
//             [name]: type === 'checkbox' ? checked : value,
//         });
//     };


//     const handleScreenshotCapture = () => {
//         fileInputRef.current.click();
//     };


//     const handleFileChange = async (e) => {
//         try {
//             const file = e.target.files?.[0];
//             if (!file) return;

//             // optional: size check (5MB)
//             if (file.size > 5 * 1024 * 1024) {
//                 alert("Image too large (max 5MB).");
//                 return;
//             }

//             // show instant preview
//             const previewURL = URL.createObjectURL(file);
//             setScreenshot(previewURL);

//             // upload to HPanel with loading
//             setIsUploadingAvatar(true);
//             const fileUrl = await uploadToHPanel(file);
//             setIsUploadingAvatar(false);

//             if (!fileUrl) {
//                 alert("Image upload failed.");
//                 // optional: revert preview if you want
//                 return;
//             }

//             // store hosted URL so submit sends URL (not base64)
//             setFormData((prev) => ({ ...prev, avatar: fileUrl }));
//         } catch (err) {
//             console.error("Avatar upload error:", err);
//             setIsUploadingAvatar(false);
//             alert("Failed to upload image.");
//         } finally {
//             // allows re-picking same file
//             e.target.value = "";
//         }
//     };


//     // const handleAddUser = (e) => {
//     // e.preventDefault();
//     // setUsers([...users, { ...formData }]);
//     // setFormData({ name: '', email: '', role: '', password: '', loginEnabled: true, avatar: null });
//     // setScreenshot(null);
//     // setIsModalOpen(false);
//     // };
//     return (
//         <>



//             <section className="flex font-Poppins w-[100%] h-[100%] select-none p-[15px] overflow-hidden">
//                 <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
//                     <Header pageName="  User Management" />
//                     <div className="flex gap-[10px] w-[100%] h-[100%]">
//                         <SideBar />
//                         <div className="flex pl-[10px] w-[100%] max-h-[90%] pb-[50px] pr-[15px] overflow-y-auto gap-[30px] rounded-[10px]">
//                             <div className=' flex w-[100%] flex-col gap-[20px] py-[10px]'>
//                                 <div className=' flex gap-[5px]  w-[100%] flex-col'>
//                                     <div className=" w-[100%]  p-2">
//                                         <div className="">
//                                             {/* Header */}
//                                             <div className="flex justify-between items-center mb-10">
//                                                 <div>
//                                                     <h1 className="text-[24px] font-[600]  ">
//                                                         Manage User
//                                                     </h1>

//                                                 </div>
//                                                 <div className="flex space-x-3">
//                                                     <button
//                                                         onClick={() => setIsModalOpen(true)}
//                                                         className="px-5 py-2 = bs-spj text-white  rounded-[8px] hover:shadow-lg transition-all duration-300 flex items-center gap-2"
//                                                     >
//                                                         <UserPlus size={18} />
//                                                         <span>Add User</span>
//                                                     </button>
//                                                 </div>
//                                             </div>

//                                             {/* User Cards Grid */}
//                                             <div className=" flex flex-wrap gap-[15px]">
//                                                 {users.map((user) => (
//                                                     <div
//                                                         key={user.id}
//                                                         className="group relative bg-white  w-[350px] border !border-[#f10a0a50] rounded-xl overflow-hidden shadow-sm hover:shadow-xl h-[170px] transition-all duration-300"
//                                                     >
//                                                         {/* Card Header with Role Badge */}
//                                                         <div className="absolute top-0 left-0 w-full h-[40px] bg-[#ff000026]"></div>

//                                                         <div className="relative pt-3 px-4">
//                                                             <div className="flex justify-between items-start mb-4">
//                                                                 <div className="px-2 py-[2px] rounded-full text-[#c80404]  border !border-[#f10a0aba]   mt-[-9px] font-[500]  bg-gradient-to-r text-[13px]  shadow-md">
//                                                                     {user.roleId?.roleName}
//                                                                 </div>
//                                                                 <div className="relative">
//                                                                     <button
//                                                                         onClick={() => toggleCardMenu(user._id)}
//                                                                         className="p-2 rounded-full mt-[-10px] hover:bg-gray-100 transition-colors"
//                                                                     >
//                                                                         <MoreVertical size={18} className="text-gray-500" />
//                                                                     </button>

//                                                                     {activeCard === user._id && (
//                                                                         <div ref={cardMenuRef} className="absolute right-0 mt- w-48 bg-white rounded-xl shadow-xl z-10 border border-gray-100 overflow-hidden">
//                                                                             <div className="py-[3px]">
//                                                                                 <button
//                                                                                     onClick={() => handleopenmodal(user)}
//                                                                                     className="block w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
//                                                                                 >
//                                                                                     View details
//                                                                                 </button>
//                                                                                 <button
//                                                                                     onClick={() => {
//                                                                                         setFormData({
//                                                                                             name: user.name,
//                                                                                             email: user.email,
//                                                                                             role: user.roleId?.roleName,
//                                                                                             password: "",
//                                                                                             loginEnabled: user.loginEnabled ?? true,
//                                                                                             avatar: user.avatar,
//                                                                                         });
//                                                                                         if (Array.isArray(user.companyId)) {
//                                                                                             const matched = companies.filter(c => user.companyId.includes(c._id));
//                                                                                             setSelectedCompanies(matched);
//                                                                                         } else {
//                                                                                             setSelectedCompanies([]);
//                                                                                         }
//                                                                                         setScreenshot(user.avatar || null);
//                                                                                         setEditingUser(user);
//                                                                                         setIsModalOpen(true);
//                                                                                     }}
//                                                                                     className="block w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
//                                                                                 >
//                                                                                     Edit User
//                                                                                 </button>
//                                                                                 <button
//                                                                                     onClick={async () => {
//                                                                                         if (window.confirm("Are you sure you want to delete this user?")) {
//                                                                                             try {
//                                                                                                 await ApiDelete(`/admin/role-user/${user._id}`);
//                                                                                                 fetchUsers();
//                                                                                             } catch (err) {
//                                                                                                 console.error("Delete error", err);
//                                                                                             }
//                                                                                         }
//                                                                                     }}
//                                                                                     className="block w-full text-left px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                                                                                 >
//                                                                                     Delete User
//                                                                                 </button>
//                                                                             </div>
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                             </div>

//                                                             {/* User Info */}
//                                                             <div className="flex items-center gap-4 ">
//                                                                 <div className="!w-[54px] h-[54px] flex-shrink-0 rounded-2xl border-[1.5px] border-[#f10a0aba] overflow-hidden">
//                                                                     {user.avatar ? (
//                                                                         <img
//                                                                             src={user.avatar || "/placeholder.svg"}
//                                                                             alt={user.name}
//                                                                             className="w-full h-full object-cover rounded-xl"
//                                                                         />
//                                                                     ) : (
//                                                                         <div className=" w-[54px] h-[54px]  rounded-xl bg-white flex items-center justify-center">
//                                                                             <span className="text-3xl font- text-red-500  text-[#f10a0aba]">
//                                                                                 {user.name.charAt(0).toUpperCase()}
//                                                                             </span>
//                                                                         </div>
//                                                                     )}
//                                                                 </div>

//                                                                 <div>
//                                                                     <h3 className="font-semibold text-xl text-gray-800">{user.name}</h3>
//                                                                     <p className="text-gray-500 text-[13px] flex items-center gap-1.5">
//                                                                         <Mail size={14} className="text-[#f10a0aba]" />
//                                                                         {user.email}
//                                                                     </p>
//                                                                 </div>
//                                                             </div>

//                                                             {/* Card Footer */}
//                                                             {/* <div className="flex justify-between items-center py-4 border-t border-gray-100">
//                                                                 <div className="flex items-center gap-2 text-gray-500">
//                                                                     <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
//                                                                         <Calendar size={14} className="text-purple-500" />
//                                                                     </div>
//                                                                     <span className="text-sm">{user.date}</span>
//                                                                 </div>
//                                                                 <div className="flex items-center gap-2 text-gray-500">
//                                                                     <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
//                                                                         <Clock size={14} className="text-cyan-500" />
//                                                                     </div>
//                                                                     <span className="text-sm">{user.time}</span>
//                                                                 </div>
//                                                             </div> */}
//                                                         </div>
//                                                     </div>
//                                                 ))}

//                                             </div>
//                                         </div>

//                                         {/* Create User Modal */}
//                                         {isModalOpen && (
//                                             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
//                                                 <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
//                                                     <div className="relative">
//                                                         {/* Modal Header with Gradient */}
//                                                         <div className="h-[53px] bs-spj rounded-t-3xl flex items-end">
//                                                             <div className="absolute top-3 right-4">
//                                                                 <button
//                                                                     onClick={() => setIsModalOpen(false)}
//                                                                     className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
//                                                                 >
//                                                                     <X size={20} className="text-white" />
//                                                                 </button>
//                                                             </div>
//                                                             <div className="px-[20px] relative top-[-10px] pt-[-20px] pb-0">
//                                                                 <h2 className="text-2xl font-bold text-white"> {editingUser ? "Edit User" : "Create User"}</h2>
//                                                             </div>
//                                                         </div>

//                                                         <form onSubmit={handleAddUser}>
//                                                             <div className="p-6 space-y-">
//                                                                 {/* Name and Email Fields */}
//                                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                                                     <div className="space-y-2">
//                                                                         <label className="block text-gray-700 font-medium">
//                                                                             Name<span className="text-rose-500">*</span>
//                                                                         </label>
//                                                                         <div className="relative">
//                                                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                                                                 <User size={18} className="text-gray-400" />
//                                                                             </div>
//                                                                             <input
//                                                                                 type="text"
//                                                                                 name="name"
//                                                                                 value={formData.name}
//                                                                                 onChange={handleChange}
//                                                                                 placeholder="Enter User Name"
//                                                                                 className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300  outline-none"
//                                                                                 required
//                                                                             />
//                                                                         </div>
//                                                                     </div>

//                                                                     <div className="space-y-2">
//                                                                         <label className="block text-gray-700 font-medium">
//                                                                             Email<span className="text-rose-500">*</span>
//                                                                         </label>
//                                                                         <div className="relative">
//                                                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                                                                 <Mail size={18} className="text-gray-400" />
//                                                                             </div>
//                                                                             <input
//                                                                                 type="email"
//                                                                                 name="email"
//                                                                                 value={formData.email}
//                                                                                 onChange={handleChange}
//                                                                                 placeholder="Enter User Email"
//                                                                                 className="w-full pl-10 pr-4 py-3 outline-none rounded-xl border border-gray-300  arent"
//                                                                                 required
//                                                                             />
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>

//                                                                 {/* Role and Company Fields */}
//                                                                 <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-6">
//                                                                     {/* User Role Dropdown */}
//                                                                     <div className="space-y-2 relative">
//                                                                         <label className="block text-gray-700 font-medium">
//                                                                             User Role<span className="text-rose-500">*</span>
//                                                                         </label>
//                                                                         <div
//                                                                             className="relative w-full border border-gray-300 rounded-xl px-4 py-3 bg-white cursor-pointer flex justify-between items-center"
//                                                                             onClick={() => setDropdownOpen(!isDropdownOpen)}
//                                                                         >
//                                                                             <span>{formData.role || "Select Role"}</span>
//                                                                             <ChevronDown className="text-gray-500" size={18} />
//                                                                         </div>

//                                                                         <AnimatePresence>
//                                                                             {isDropdownOpen && (
//                                                                                 <motion.ul
//                                                                                     initial={{ opacity: 0, y: -10 }}
//                                                                                     animate={{ opacity: 1, y: 0 }}
//                                                                                     exit={{ opacity: 0, y: -10 }}
//                                                                                     className="absolute z-50 bg-white border border-gray-300 rounded-xl mt-2 w-full shadow-md max-h-[200px] overflow-y-auto"
//                                                                                 >
//                                                                                     {roles.map((role) => (
//                                                                                         <li
//                                                                                             key={role._id}
//                                                                                             onClick={() => handleRoleSelect(role.roleName)}
//                                                                                             className="px-4 py-2  hover:bg-gray-100 transition-colors cursor-pointer"
//                                                                                         >
//                                                                                             {role.roleName}
//                                                                                         </li>
//                                                                                     ))}
//                                                                                 </motion.ul>
//                                                                             )}
//                                                                         </AnimatePresence>
//                                                                     </div>

//                                                                     {/* Select Company Dropdown */}
//                                                                     {/* <div className="flex flex-col gap-[10px]" ref={dropdownRef}>
//                                                                         <div className="space-y-2 relative">
//                                                                             <label className="block text-gray-700 font-medium">
//                                                                                 Select Company<span className="text-rose-500">*</span>
//                                                                             </label>

//                                                                             <div
//                                                                                 className="relative w-full border border-gray-300 rounded-xl px-4 py-3 bg-white cursor-pointer flex justify-between items-center"
//                                                                                 onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
//                                                                             >
//                                                                                 <span className="text-[14px]">
//                                                                                     {selectedCompanies.length > 0 ? `${selectedCompanies.length} selected` : "Select Company"}
//                                                                                 </span>
//                                                                                 <ChevronDown className="text-gray-500" size={18} />
//                                                                             </div>

//                                                                             <AnimatePresence>
//                                                                                 {companyDropdownOpen && (
//                                                                                     <motion.ul
//                                                                                         initial={{ opacity: 0, y: -10 }}
//                                                                                         animate={{ opacity: 1, y: 0 }}
//                                                                                         exit={{ opacity: 0, y: -10 }}
//                                                                                         className="absolute z-50 bg-white border border-gray-300 rounded-xl mt-2 w-full shadow-md max-h-[200px] overflow-y-auto"
//                                                                                     >
//                                                                                         {companies
//                                                                                             .filter(
//                                                                                                 (company) =>
//                                                                                                     !selectedCompanies.some((c) => c._id === company._id)
//                                                                                             )
//                                                                                             .map((company) => (
//                                                                                                 <li
//                                                                                                     key={company._id}
//                                                                                                     onClick={() => toggleCompanySelection(company)}
//                                                                                                     className="px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
//                                                                                                 >
//                                                                                                     <div className="flex w-full h-full text-[14px] items-center justify-between gap-[20px]">
//                                                                                                         {company.firmName}
//                                                                                                         <input
//                                                                                                             type="checkbox"
//                                                                                                             checked={false} // always false since selected are filtered out
//                                                                                                             readOnly
//                                                                                                             className="w-[20px] h-[20px] pointer-events-none"
//                                                                                                         />
//                                                                                                     </div>
//                                                                                                 </li>
//                                                                                             ))}
//                                                                                     </motion.ul>
//                                                                                 )}
//                                                                             </AnimatePresence>




//                                                                         </div>

//                                                                     </div> */}
//                                                                     <div className="flex items-center mt-[30px] space-x-3">
//                                                                         <label className="text-gray-700 font-medium">Login is enabled</label>
//                                                                         <div
//                                                                             className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.loginEnabled ? " bs-spj" : "bg-gray-300"
//                                                                                 }`}
//                                                                             onClick={() => setFormData({ ...formData, loginEnabled: !formData.loginEnabled })}
//                                                                         >
//                                                                             <div
//                                                                                 className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${formData.loginEnabled ? "translate-x-7" : ""
//                                                                                     }`}
//                                                                             />
//                                                                         </div>
//                                                                     </div>

//                                                                 </div>
//                                                                 <div className="flex flex-wrap gap-2 mt-2">
//                                                                     {selectedCompanies.map((company) => (
//                                                                         <div
//                                                                             key={company._id}
//                                                                             className="relative min-w-[70px] h-[40px] px-[10px] border border-[#dedede] rounded-lg shadow flex items-center justify-center text-[#505050] bg-white text-[14px]"
//                                                                         >
//                                                                             <span>{company.firmName}</span>
//                                                                             <button
//                                                                                 onClick={() => removeCompany(company._id)}
//                                                                                 className="absolute right-[-5px] top-[-8px] rounded-full w-[18px] h-[18px] flex justify-center items-center bg-white text-[#ff0000] text-[18px] cursor-pointer"
//                                                                             >
//                                                                                 <i className="fa-solid fa-circle-xmark"></i>
//                                                                             </button>
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                                 <div className=' flex w-[100%] items-center justify-between'>




//                                                                     {formData.loginEnabled && (
//                                                                         <div className="space-y-2 w-[50%]">
//                                                                             <label className="block text-gray-700 font-medium">
//                                                                                 Password<span className="text-rose-500">*</span>
//                                                                             </label>
//                                                                             <div className="relative">
//                                                                                 {/* Lock Icon */}
//                                                                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                                                                     <Lock size={18} className="text-gray-400" />
//                                                                                 </div>

//                                                                                 {/* Password Input */}
//                                                                                 <input
//                                                                                     type={showPassword ? "text" : "password"}
//                                                                                     name="password"
//                                                                                     value={formData.password}
//                                                                                     onChange={handleChange}
//                                                                                     placeholder="Enter Company Password"
//                                                                                     className="w-full pl-10 pr-10 py-3 outline-none rounded-xl border border-gray-300"
//                                                                                     required
//                                                                                 />

//                                                                                 {/* Eye Icon Button */}
//                                                                                 <button
//                                                                                     type="button"
//                                                                                     onClick={togglePasswordVisibility}
//                                                                                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#c30404]"
//                                                                                 >
//                                                                                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                                                                                 </button>
//                                                                             </div>
//                                                                         </div>
//                                                                     )}

//                                                                 </div>

//                                                                 <div>
//                                                                     <label className="block text-gray-700 font-medium mb-2">Profile Picture</label>
//                                                                     <div className="mt-2">
//                                                                         <input
//                                                                             type="file"
//                                                                             ref={fileInputRef}
//                                                                             onChange={handleFileChange}
//                                                                             accept="image/*"
//                                                                             className="hidden"
//                                                                         />

//                                                                         {screenshot ? (
//                                                                             <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
//                                                                                 <img
//                                                                                     src={screenshot || "/placeholder.svg"}
//                                                                                     alt="Screenshot"
//                                                                                     className="w-full h-full object-cover"
//                                                                                 />
//                                                                                 <button
//                                                                                     type="button"
//                                                                                     onClick={() => {
//                                                                                         setScreenshot(null)
//                                                                                         setFormData({ ...formData, avatar: null })
//                                                                                     }}
//                                                                                     className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
//                                                                                 >
//                                                                                     <X size={16} />
//                                                                                 </button>
//                                                                             </div>
//                                                                         ) : (
//                                                                             <button
//                                                                                 type="button"
//                                                                                 onClick={handleScreenshotCapture}
//                                                                                 className="w-full h-36 border-2 border-dashed border-red-200 rounded-md flex flex-col items-center justify-center hover:border-red-300 transition-colors"
//                                                                             >
//                                                                                 <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
//                                                                                     <Upload size={24} className="text-red-500" />
//                                                                                 </div>
//                                                                                 <span className="text-gray-600 font-medium">Click to upload image</span>
//                                                                                 <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
//                                                                             </button>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             </div>

//                                                             {/* Form Buttons */}
//                                                             <div className="flex justify-end space-x-4 p-6 border-t border-gray-100">
//                                                                 <button
//                                                                     type="button"
//                                                                     onClick={() => setIsModalOpen(false)}
//                                                                     className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
//                                                                 >
//                                                                     Cancel
//                                                                 </button>
//                                                                 <button
//                                                                     type="submit"
//                                                                     className="px-6 py-2  bs-spj text-white rounded-md hover:shadow-lg transition-all duration-300"
//                                                                 >
//                                                                     {editingUser ? "Update" : "Create"}
//                                                                 </button>
//                                                             </div>
//                                                         </form>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         )}




//                                     </div>
//                                 </div>
//                             </div>


//                         </div>
//                     </div>
//                 </div>

//                 <NextUIModal onClose={handleClosemodal} isOpen={viewdatamodal}>

//                     <ModalContent className="md:max-w-[750px] max-w-[733px] relative  rounded-2xl z-[700] flex justify-center !py-0 mx-auto  h-[600px]  ">
//                         {(handleClosemodal) => (
//                             <>
//                                 <div className="bg-white  w-[100%] font-Poppins max-h-[90vh] overflow-y-auto animate-fadeIn">
//                                     <div className="relative">

//                                         <div className="h-[53px] bs-spj rounded-t- flex items-end">
//                                             <div className="absolute top-3 right-4">
//                                                 <button
//                                                     onClick={handleClosemodal}
//                                                     className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
//                                                 >
//                                                     <X size={20} className="text-white" />
//                                                 </button>
//                                             </div>
//                                             <div className="px-[20px] relative top-[-10px] pt-[-20px] pb-0">
//                                                 <h2 className="text-2xl font-bold text-white"> {editingUser ? "Edit User" : "Create User"}</h2>
//                                             </div>
//                                         </div>
//                                         <div className="p-6 space-y-6 overflow-y-auto">
//                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                                 {/* Name Field */}
//                                                 <div className="space-y-2">
//                                                     <p className="text-sm font-medium text-gray-500">
//                                                         Name<span className="text-red-500">*</span>
//                                                     </p>
//                                                     <div className="flex items-center gap-2">
//                                                         <User className="h-4 w-4 text-gray-500" />
//                                                         <p className="font-medium">{selectedUserData?.name}</p>
//                                                     </div>
//                                                 </div>

//                                                 {/* Email Field */}
//                                                 <div className="space-y-2">
//                                                     <p className="text-sm font-medium text-gray-500">
//                                                         Email<span className="text-red-500">*</span>
//                                                     </p>
//                                                     <div className="flex items-center gap-2">
//                                                         <svg
//                                                             xmlns="http://www.w3.org/2000/svg"
//                                                             width="16"
//                                                             height="16"
//                                                             viewBox="0 0 24 24"
//                                                             fill="none"
//                                                             stroke="currentColor"
//                                                             strokeWidth="2"
//                                                             strokeLinecap="round"
//                                                             strokeLinejoin="round"
//                                                             className="text-gray-500"
//                                                         >
//                                                             <rect width="20" height="16" x="2" y="4" rx="2" />
//                                                             <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
//                                                         </svg>
//                                                         <p className="font-medium">{selectedUserData?.email}</p>
//                                                     </div>
//                                                 </div>

//                                                 {/* User Role Field */}
//                                                 <div className="space-y-2">
//                                                     <p className="text-sm font-medium text-gray-500">
//                                                         User Role<span className="text-red-500">*</span>
//                                                     </p>
//                                                     <p className="font-medium">{selectedUserData?.roleId?.roleName}</p>
//                                                 </div>

//                                                 <div className="space-y-2">
//                                                     <p className="text-sm font-medium text-gray-500">Selected Companies</p>
//                                                     <p className="font-medium">{Array.isArray(selectedUserData?.companyId) ? selectedUserData?.companyId?.length : 1} selected</p>
//                                                 </div>

//                                                 {/* List of Companies */}
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {Array.isArray(selectedUserData?.companyId)
//                                                         ? selectedUserData?.companyId.map((c, idx) => (
//                                                             <div key={idx} className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-md border">
//                                                                 <span className="text-sm">{c.firmName}</span>
//                                                             </div>
//                                                         ))
//                                                         : (
//                                                             <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-md border">
//                                                                 <span className="text-sm">{selectedUserData?.companyId?.firmName}</span>
//                                                             </div>
//                                                         )}
//                                                 </div>

//                                                 {/* Password Field */}
//                                                 <div className="space-y-2">
//                                                     <p className="text-sm font-medium text-gray-500">
//                                                         Password<span className="text-red-500">*</span>
//                                                     </p>
//                                                     <div className="flex items-center gap-2">
//                                                         <svg
//                                                             xmlns="http://www.w3.org/2000/svg"
//                                                             width="16"
//                                                             height="16"
//                                                             viewBox="0 0 24 24"
//                                                             fill="none"
//                                                             stroke="currentColor"
//                                                             strokeWidth="2"
//                                                             strokeLinecap="round"
//                                                             strokeLinejoin="round"
//                                                             className="text-gray-500"
//                                                         >
//                                                             <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
//                                                             <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//                                                         </svg>
//                                                         <p className="font-medium">{showPassword ? "password123" : selectedUserData?.password}</p>
//                                                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500">
//                                                             {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                                                         </button>
//                                                     </div>
//                                                 </div>

//                                                 {/* Login Toggle */}
//                                                 <div className="flex items-center justify-between">
//                                                     <p className="text-sm font-medium text-gray-500">Login Status</p>
//                                                     <div className="flex items-center gap-2">
//                                                         <div className={`h-4 w-4 rounded-full ${selectedUserData.loginEnabled ? "bg-green-500" : "bg-red-500"}`}></div>
//                                                         <p className="font-medium">{selectedUserData.loginEnabled ? "Enabled" : "Disabled"}</p>
//                                                     </div>
//                                                 </div>

//                                                 {/* Profile Picture */}
//                                                 <div className="space-y-2">
//                                                     <p className="text-sm font-medium text-gray-500">Profile Picture</p>
//                                                     <div className="border rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50">
//                                                         {selectedUserData.profilePicture ? (
//                                                             <img
//                                                                 src={selectedUserData.profilePicture || "/placeholder.svg"}
//                                                                 alt="Profile"
//                                                                 className="h-24 w-24 rounded-full object-cover"
//                                                             />
//                                                         ) : (
//                                                             <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
//                                                                 <User className="h-12 w-12 text-gray-400" />
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </>
//                         )}
//                     </ModalContent>
//                 </NextUIModal>
//             </section >
//         </>
//     )
// }

import React, { useEffect, useRef, useState } from 'react'
import Header from '../../Component/header/Header'
import SideBar from '../../Component/sidebar/CubaSideBar'
import { Calendar, Clock, MoreVertical, X, Upload, User, Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react"
import { ApiDelete, ApiGet, ApiPost, ApiPut } from '../../helper/axios';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Modal as NextUIModal, ModalContent } from "@nextui-org/react";

import uploadToHPanel from '../../helper/hpanelUpload';

function resolvePermissions() {
  const loginType = localStorage.getItem("loginType")
  const isAdmin = loginType === "admin"

  let permsArray = []
  try {
    const parsed = JSON.parse(localStorage.getItem("rights"))
    if (parsed?.permissions && Array.isArray(parsed.permissions)) {
      permsArray = parsed.permissions
    } else if (Array.isArray(parsed)) {
      permsArray = parsed
    }
  } catch {
    permsArray = []
  }

  const findPerm = (mod) =>
    Array.isArray(permsArray) && permsArray.find((p) => p?.module === mod)

  const modulePerm =
    findPerm("role_management") ||
    findPerm("admin") ||
    findPerm("dashboard") ||
    null

  const has = (perm) => isAdmin || modulePerm?.permissions?.includes(perm)

  return {
    isAdmin,
    canView: has("View"),
    canCreate: has("Create"),
    canUpdate: has("Update"),
    canDelete: has("Delete"),
  }
}

function PermissionDenied() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="bg-white border rounded-xl p-8 shadow-sm text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Permission required
        </h2>
        <p className="text-gray-600">
          You don’t have access to view Role Management. Please contact an
          administrator.
        </p>
      </div>
    </div>
  )
}

export default function UserManageMent() {
  const { canView, canCreate, canUpdate, canDelete } = resolvePermissions()

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([
    { _id: "r1", roleName: "Admin" },
    { _id: "r2", roleName: "Project Manager" },
    { _id: "r3", roleName: "General Accountant" },
    { _id: "r4", roleName: "Sales Executive" },
    { _id: "r5", roleName: "Support Engineer" },
  ]);

  const [companies, setCompanies] = useState([
    { _id: "c1", firmName: "TechCorp" },
    { _id: "c2", firmName: "GlobalSoft" },
    { _id: "c3", firmName: "NextGen Solutions" },
    { _id: "c4", firmName: "Bright Future Ltd" },
    { _id: "c5", firmName: "InnovaWorks" },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const cardMenuRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [viewdatamodal, setViewDataModal] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    loginEnabled: true,
    avatar: null,
  });
  const fileInputRef = useRef(null);

  const handleRoleSelect = (roleName) => {
    setFormData((prev) => ({ ...prev, role: roleName }));
    setDropdownOpen(false);
  };
  useEffect(() => {
    if (canView) fetchRoles()
  }, [canView])

  const fetchRoles = async () => {
    try {
      const res = await ApiGet("/admin/role");
      if (res?.role) setRoles(res.role);
    } catch (err) {
      console.error("Error fetching roles", err);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await ApiGet("/admin/role-user");
      if (res?.roleUser) setUsers(res.roleUser);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();

    const selectedRole = roles.find((r) => r.roleName === formData.role);
    const roleId = selectedRole?._id;

    if (formData.loginEnabled && !formData.password) {
      alert("Please enter a password if login is enabled.");
      return;
    }

    if (isUploadingAvatar) {
      alert("Please wait for the image upload to finish.");
      return;
    }

    try {
      setIsSavingUser(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        roleId: roleId,
        password: formData.loginEnabled ? formData.password : undefined,
        loginEnabled: formData.loginEnabled,
        avatar: formData.avatar, // HPanel URL if uploaded
      };

      if (editingUser) {
        await ApiPut(`/admin/role-user/${editingUser._id}`, payload);
      } else {
        await ApiPost("/admin/role-user", payload);
      }

      await fetchUsers();
      setIsModalOpen(false);
      resetForm();
      setEditingUser(null);
    } catch (error) {
      console.error("Error creating/updating user", error);
      alert("Failed to save user.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      password: "",
      loginEnabled: true,
      avatar: null,
    });
    setScreenshot(null);
    setSelectedCompanies([]);
  };

  const toggleCardMenu = (id) => {
    setActiveCard(activeCard === id ? null : id)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCompanySelect = (company) => {
    setFormData({ ...formData, companyId: company._id, companyName: company.firmName });
    setCompanyDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardMenuRef.current && !cardMenuRef.current.contains(event.target)) {
        setActiveCard(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCompanySelection = (company) => {
    const exists = selectedCompanies.find((c) => c._id === company._id);
    if (exists) {
      setSelectedCompanies(selectedCompanies.filter((c) => c._id !== company._id));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };

  const removeCompany = (id) => {
    setSelectedCompanies(selectedCompanies.filter((c) => c._id !== id));
  };

  const handleopenmodal = (user) => {
    setSelectedUserData(user);
    setViewDataModal(true);
  };

  const handleClosemodal = () => {
    setViewDataModal(false)
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleScreenshotCapture = () => {
    if (isUploadingAvatar) return;
    fileInputRef.current.click();
  };

  // ⬇️ Upload avatar to HPanel with preview + loading
  const handleFileChange = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large (max 5MB).");
        return;
      }

      // local preview
      const previewURL = URL.createObjectURL(file);
      setScreenshot(previewURL);

      // upload with loading
      setIsUploadingAvatar(true);
      const fileUrl = await uploadToHPanel(file);
      setIsUploadingAvatar(false);

      if (!fileUrl) {
        alert("Image upload failed.");
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: fileUrl }));
    } catch (err) {
      console.error("Avatar upload error:", err);
      setIsUploadingAvatar(false);
      alert("Failed to upload image.");
    } finally {
      // allow re-picking the same file
      e.target.value = "";
    }
  };


  if (!canView) {
    return (
      <section className="flex w-full min-h-screen">
        <Header pageName="Role Management" />
        <SideBar />
        <PermissionDenied />
      </section>
    )
  }

  return (
    <>
      <section className="flex font-Poppins w-[100%] h-[100%] select-none overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="  User Management" />
          <div className="flex gap-[10px] w-[100%] h-[100%]">
            <SideBar />
            <div className="flex pl-[10px] w-[100%] max-h-[90%] pb-[50px] pr-[15px] overflow-y-auto gap-[30px] rounded-[10px]">
              <div className=' flex w-[100%] flex-col gap-[20px] py-[10px]'>
                <div className=' flex gap-[5px]  w-[100%] flex-col'>
                  <div className=" w-[100%]  p-2">
                    <div className="">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h1 className="text-[24px] font-[600]">Manage User</h1>
                        </div>
                        {canCreate && (
                          <div className="flex justify-end mb-5">
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="flex items-center gap-2 bs-spj text-white px-4 py-2 rounded-lg"
                            >
                              <UserPlus className="w-5 h-5" />
                              Create Role
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Loading users */}
                      {isLoading && (
                        <div className="w-full py-8 text-center text-gray-500">
                          <div className="mx-auto w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mb-3" />
                          Loading users...
                        </div>
                      )}

                      {/* User Cards Grid */}
                      {!isLoading && (
                        <div className="flex flex-wrap gap-[15px]">
                          {users.map((user) => (
                            <div
                              key={user._id || user.id}
                              className="group relative bg-white w-[350px] border !border-[#f10a0a50] rounded-xl overflow-hidden shadow-sm hover:shadow-xl h-[170px] transition-all duration-300"
                            >
                              <div className="absolute top-0 left-0 w-full h-[40px] bg-[#ff000026]" />
                              <div className="relative pt-3 px-4">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="px-2 py-[2px] rounded-full text-[#c80404] border !border-[#f10a0aba] mt-[-9px] font-[500] text-[13px] shadow-md">
                                    {user.roleId?.roleName}
                                  </div>
                                  <div className="relative">
                                    <button
                                      onClick={() => toggleCardMenu(user._id)}
                                      className="p-2 rounded-full mt-[-10px] hover:bg-gray-100 transition-colors"
                                    >
                                      <MoreVertical size={18} className="text-gray-500" />
                                    </button>

                                    {activeCard === user._id && (
                                      <div ref={cardMenuRef} className="absolute right-0 mt- w-48 bg-white rounded-xl shadow-xl z-10 border border-gray-100 overflow-hidden">
                                        <div className="py-[3px]">
                                          <button
                                            onClick={() => handleopenmodal(user)}
                                            className="block w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                                          >
                                            View details
                                          </button>
                                          {canUpdate && (
                                            <button
                                              onClick={() => {
                                                setFormData({
                                                  name: user.name,
                                                  email: user.email,
                                                  role: user.roleId?.roleName,
                                                  password: "",
                                                  loginEnabled: user.loginEnabled ?? true,
                                                  avatar: user.avatar,
                                                });
                                                if (Array.isArray(user.companyId)) {
                                                  const matched = companies.filter(c => user.companyId.includes(c._id));
                                                  setSelectedCompanies(matched);
                                                } else {
                                                  setSelectedCompanies([]);
                                                }
                                                setScreenshot(user.avatar || null);
                                                setEditingUser(user);
                                                setIsModalOpen(true);
                                              }}
                                              className="block w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                                            >
                                              Edit User
                                            </button>
                                          )}
                                          {canDelete && (
                                            <button
                                              onClick={async () => {
                                                if (window.confirm("Are you sure you want to delete this user?")) {
                                                  try {
                                                    await ApiDelete(`/admin/role-user/${user._id}`);
                                                    fetchUsers();
                                                  } catch (err) {
                                                    console.error("Delete error", err);
                                                  }
                                                }
                                              }}
                                              className="block w-full text-left px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                              Delete User
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                  <div className="!w-[54px] h-[54px] flex-shrink-0 rounded-2xl border-[1.5px] border-[#f10a0aba] overflow-hidden">
                                    {user.avatar ? (
                                      <img
                                        src={user.avatar || "/placeholder.svg"}
                                        alt={user.name}
                                        className="w-full h-full object-cover rounded-xl"
                                      />
                                    ) : (
                                      <div className="w-[54px] h-[54px] rounded-xl bg-white flex items-center justify-center">
                                        <span className="text-3xl text-[#f10a0aba]">
                                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <h3 className="font-semibold text-xl text-gray-800">{user.name}</h3>
                                    <p className="text-gray-500 text-[13px] flex items-center gap-1.5">
                                      <Mail size={14} className="text-[#f10a0aba]" />
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Create / Edit User Modal */}
                    {isModalOpen && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
                        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn relative">
                          {/* Optional blocker while saving */}
                          {isSavingUser && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-3xl z-20" />
                          )}

                          <div className="relative">
                            {/* Modal Header */}
                            <div className="h-[53px] bs-spj rounded-t-3xl flex items-end">
                              <div className="absolute top-3 right-4">
                                <button
                                  onClick={() => setIsModalOpen(false)}
                                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                  disabled={isSavingUser}
                                >
                                  <X size={20} className="text-white" />
                                </button>
                              </div>
                              <div className="px-[20px] relative top-[-10px] pt-[-20px] pb-0">
                                <h2 className="text-2xl font-bold text-white">{editingUser ? "Edit User" : "Create User"}</h2>
                              </div>
                            </div>

                            <form onSubmit={handleAddUser}>
                              <div className="p-6">
                                {/* Name & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="block text-gray-700 font-medium">
                                      Name<span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400" />
                                      </div>
                                      <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter User Name"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 outline-none"
                                        required
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="block text-gray-700 font-medium">
                                      Email<span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400" />
                                      </div>
                                      <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter User Email"
                                        className="w-full pl-10 pr-4 py-3 outline-none rounded-xl border border-gray-300"
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Role + Login toggle */}
                                <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-6">
                                  <div className="space-y-1 relative">
                                    <label className="block text-gray-700 font-medium">
                                      User Role<span className="text-rose-500">*</span>
                                    </label>
                                    <div
                                      className="relative w-full border border-gray-300 rounded-xl px-4 py-3 bg-white cursor-pointer flex justify-between items-center"
                                      onClick={() => setDropdownOpen(!isDropdownOpen)}
                                    >
                                      <span>{formData.role || "Select Role"}</span>
                                      <ChevronDown className="text-gray-500" size={18} />
                                    </div>

                                    <AnimatePresence>
                                      {isDropdownOpen && (
                                        <motion.ul
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          className="absolute z-50 bg-white border border-gray-300 rounded-xl mt-2 w-full shadow-md max-h-[200px] overflow-y-auto"
                                        >
                                          {roles.map((role) => (
                                            <li
                                              key={role._id}
                                              onClick={() => handleRoleSelect(role.roleName)}
                                              className="px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
                                            >
                                              {role.roleName}
                                            </li>
                                          ))}
                                        </motion.ul>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                  <div className="flex items-center mt-[30px] space-x-3">
                                    <label className="text-gray-700 font-medium">Login is enabled</label>
                                    <div
                                      className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.loginEnabled ? "bs-spj" : "bg-gray-300"}`}
                                      onClick={() => setFormData({ ...formData, loginEnabled: !formData.loginEnabled })}
                                    >
                                      <div
                                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${formData.loginEnabled ? "translate-x-7" : ""}`}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Password */}
                                {formData.loginEnabled && (
                                  <div className=" w-full md:w-1/2">
                                    <label className="block text-gray-700 font-medium">
                                      Password<span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400" />
                                      </div>
                                      <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter Company Password"
                                        className="w-full pl-10 pr-10 py-3 outline-none rounded-xl border border-gray-300"
                                        required
                                      />
                                      <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#c30404]"
                                      >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Avatar */}
                                <div className="mt-6">
                                  <label className="block text-gray-700 font-medium mb-2">Profile Picture</label>
                                  <div className="mt-2">
                                    <input
                                      type="file"
                                      ref={fileInputRef}
                                      onChange={handleFileChange}
                                      accept="image/*"
                                      className="hidden"
                                    />

                                    {screenshot ? (
                                      <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                                        <img
                                          src={screenshot || "/placeholder.svg"}
                                          alt="Screenshot"
                                          className="w-full h-full object-cover"
                                        />

                                        {/* overlay spinner while uploading */}
                                        {isUploadingAvatar && (
                                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          </div>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (isUploadingAvatar) return;
                                            setScreenshot(null);
                                            setFormData({ ...formData, avatar: null });
                                          }}
                                          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                          disabled={isUploadingAvatar}
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={handleScreenshotCapture}
                                        className={`w-full h-36 border-2 border-dashed rounded-md flex flex-col items-center justify-center transition-colors ${isUploadingAvatar ? "border-gray-200 cursor-not-allowed opacity-70" : "border-red-200 hover:border-red-300"
                                          }`}
                                        disabled={isUploadingAvatar}
                                      >
                                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                                          {isUploadingAvatar ? (
                                            <span className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Upload size={24} className="text-red-500" />
                                          )}
                                        </div>
                                        <span className="text-gray-600 font-medium">
                                          {isUploadingAvatar ? "Uploading image..." : "Click to upload image"}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Form Buttons */}
                              <div className="flex justify-end space-x-4 p-6 border-t border-gray-100">
                                <button
                                  type="button"
                                  onClick={() => setIsModalOpen(false)}
                                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                  disabled={isSavingUser}
                                >
                                  Cancel
                                </button>

                                <button
                                  type="submit"
                                  className={`px-6 py-2 bs-spj text-white rounded-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 ${isSavingUser || isUploadingAvatar ? "opacity-80 cursor-not-allowed" : ""
                                    }`}
                                  disabled={isSavingUser || isUploadingAvatar}
                                >
                                  {isSavingUser && (
                                    <span className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                                  )}
                                  {editingUser
                                    ? (isSavingUser ? "Updating..." : "Update")
                                    : (isSavingUser ? "Creating..." : "Create")}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* /Modal */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Data Modal */}
        <NextUIModal onClose={handleClosemodal} isOpen={viewdatamodal}>
          <ModalContent className="md:max-w-[750px] max-w-[733px] relative rounded-2xl z-[700] flex justify-center !py-0 mx-auto h-[600px]">
            {(handleClosemodal) => (
              <>
                <div className="bg-white w-[100%] font-Poppins max-h-[90vh] overflow-y-auto animate-fadeIn">
                  <div className="relative">
                    <div className="h-[53px] bs-spj rounded-t- flex items-end">
                      <div className="absolute top-3 right-4">
                        <button
                          onClick={handleClosemodal}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                          <X size={20} className="text-white" />
                        </button>
                      </div>
                      <div className="px-[20px] relative top-[-10px] pt-[-20px] pb-0">
                        <h2 className="text-2xl font-bold text-white">User Details</h2>
                      </div>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-500">Name<span className="text-red-500">*</span></p>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <p className="font-medium">{selectedUserData?.name}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-500">Email<span className="text-red-500">*</span></p>
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <p className="font-medium">{selectedUserData?.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-500">User Role<span className="text-red-500">*</span></p>
                          <p className="font-medium">{selectedUserData?.roleId?.roleName}</p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-500">Selected Companies</p>
                          <p className="font-medium">
                            {Array.isArray(selectedUserData?.companyId) ? selectedUserData?.companyId?.length : 1} selected
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(selectedUserData?.companyId)
                            ? selectedUserData?.companyId.map((c, idx) => (
                              <div key={idx} className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-md border">
                                <span className="text-sm">{c.firmName}</span>
                              </div>
                            ))
                            : (
                              <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-md border">
                                <span className="text-sm">{selectedUserData?.companyId?.firmName}</span>
                              </div>
                            )
                          }
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-500">Password<span className="text-red-500">*</span></p>
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <p className="font-medium">{showPassword ? "password123" : selectedUserData?.password}</p>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500">
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-500">Login Status</p>
                          <div className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded-full ${selectedUserData?.loginEnabled ? "bg-green-500" : "bg-red-500"}`} />
                            <p className="font-medium">{selectedUserData?.loginEnabled ? "Enabled" : "Disabled"}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-500">Profile Picture</p>
                          <div className="border rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50">
                            {selectedUserData?.profilePicture ? (
                              <img
                                src={selectedUserData?.profilePicture || "/placeholder.svg"}
                                alt="Profile"
                                className="h-24 w-24 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </ModalContent>
        </NextUIModal>
      </section>
    </>
  )
}
