import React, { useEffect, useRef, useState, useMemo } from "react";
import backArrow from "../../../public/imges/main/back-arrow.png";
import { useNavigate, useLocation } from "react-router-dom";
import ModernDatePicker from "../MainInputFolder/ModernDatePicker";
import dayjs from "dayjs";
import AnimatedDropdown from "../MainInputFolder/AnimatedDropdown";
import AnimatedDropdownNavigate from "../MainInputFolder/AnimatedDropdownNavigate";
import comming from "../../../public/imges/comming.png"
import { faTachometerAlt, faUserDoctor, faHospitalUser, faListCheck, faSmile } from "@fortawesome/free-solid-svg-icons";
import {
  Gauge,
  Wallet,
  FileStack,
  FileText,
  ClipboardCheck,
  BriefcaseMedical,
  Settings,
  Users,
  Hospital,
  Menu,
  ChevronRight,
  Activity,
  Plus,
  UserPlus,
  Search,
  User,
  Bell, Bug, LogOut
} from "lucide-react";
import { ApiGet } from "../../helper/axios";
import socket from "../../socket/index";
import OpdFilter from "../ReportFilter/OpdFilter";
import { motion, AnimatePresence } from "framer-motion"
import NotificationSettingsModal from "../NotifiactionSetting/NotificationSettingsModal";
import ReportBugModal from "../NotifiactionSetting/ReportBugModal";

function Header({
  pageName = "",
  onDateRangeChange,
  onFilterChange,       // ⭐ ADD THIS
  onCreateWard,
  onCreateDoctor,
  onCreateRoleUser,
  onCreateNewRole,
  complaintInfo,
  doctors = [],
  doctorOptions = [],
  roomOptions = [],
  selectedRange = "7 Days",
}) {

  const navigate = useNavigate();
  const location = useLocation();
  const [count, setCount] = useState(0);
  const [lastSeen, setLastSeen] = useState(Number(localStorage.getItem("lastSeen")) || 0);
  const [open, setOpen] = useState(false);
  const [activeRange, setActiveRange] = useState(selectedRange);
  const dropdownRef = useRef(null);

  const [openNotif, setOpenNotif] = useState(false);
  const [openBug, setOpenBug] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("All Doctors");
  const [selectedRoom, setSelectedRoom] = useState("All Rooms");
  const [selectedDepartment, setSelectedDepartment] = useState("Both");
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);
  const isAdmin = localStorage.getItem("loginType") === "admin";


  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        search: filterSearch,
        from: filterDateFrom,
        to: filterDateTo,
      });
    }
  }, [filterSearch, filterDateFrom, filterDateTo]);
 
  useEffect(() => {
    // initial fetch
    const fetchCount = async () => {
      try {
        const data = await ApiGet("/admin/notifications");
        setCount(data?.notifications?.length || 0);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchCount();

    // listen for new notifications
    socket.on("notification:new", () => {
      fetchCount(); // re-fetch count immediately when new notification comes
    });

    return () => {
      socket.off("notification:new");
    };
  }, []);


  const handleMail = () => {
    navigate("/mail");
    setLastSeen(count);
    localStorage.setItem("lastSeen", count);
  };

  const unreadCount = count - lastSeen;


  const handleBack = () => {
    navigate(-1);
  };

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange({
        from: dateFrom ? dayjs(dateFrom).format("YYYY-MM-DD") : null,
        to: dateTo ? dayjs(dateTo).format("YYYY-MM-DD") : null,
      });
    }
  }, [dateFrom, dateTo]);

  const handleLogout = () => {
    localStorage.removeItem("loginType");
    localStorage.removeItem("rights");
    localStorage.removeItem("token"); // if token stored
    sessionStorage.clear();

    navigate("/"); // redirect to login
  };


  const handleNotes = () => {
    navigate("/notes");
  }
  const handleTodo = () => {
    navigate("/todolist");
  }

  const handleProfile = () => {
    navigate("/profile")
  }

  const handleLogDetails = () => {
    navigate("/log-details")
  }
  return (
    <>

      <div className=" flex flex-col ">

        <section className=" w-[100%] bg-[#fff] border-b h-[30px]">

        </section>
        <section className="flex w-[100%]  bg-[#fff]  justify-between px-[12px] items-center border-b-[1.5px]">
          <div className="gap-[40px] flex items-center justify-between px-[0px] pb-[20px] pt-[22px] bg h-[25px]">
            {/* Left side back + title */}
            <div className="flex w-fit cursor-pointer items-center gap-[5px]" onClick={handleBack}>
              {/* <img
                className="flex w-[27px] h-[27px]"
                src={backArrow}
                onClick={handleBack}
              /> */}

              <i class="fa-solid fa-chevron-left text-[15px] pl-[10px] pr-[2px]"></i>
              <div className="flex w-[3px] bg-[#e21e23] h-[24px]"></div>
              <h1
                className="pl-[6px] min-w-[115px] text-[#3d3d3d] flex font-Poppins md34:!text-[14px] md11:!text-[20px] font-[500]"

              >
                {pageName}
              </h1>
            </div>

            <div className=" md:!flex md34:!hidden">


              {location.pathname === "/dashboard" && (
                <div className=" md34:hidden md11:!grid grid-cols-1 md:grid-cols-4 gap-x-3">
                  <ModernDatePicker
                    label="From Date"
                    selectedDate={dateFrom}
                    setSelectedDate={(d) => {
                      setDateFrom(d);
                      if (d && dateTo && onDateRangeChange) {
                        onDateRangeChange({ from: d, to: dateTo });
                      }
                    }} />
                  <ModernDatePicker
                    label="To Date"
                    selectedDate={dateTo}
                    setSelectedDate={(d) => {
                      setDateTo(d);
                      if (dateFrom && d && onDateRangeChange) {
                        onDateRangeChange({ from: dateFrom, to: d });
                      }
                    }} />

                  {/* ✅ Time Range Dropdown */}
                  <AnimatedDropdown
                    label="Time Range"
                    icon={User}
                    options={["Today", "7 Days", "15 Days", "30 Days"]}
                    selected={activeRange} // ✅ show selected value
                    onChange={(selected) => {
                      setActiveRange(selected); // ✅ update display text
                      const today = dayjs().endOf("day");
                      let from = today;

                      // ✅ ensure correct date range inclusivity (7 full days)
                      if (selected === "Today") from = today.startOf("day");
                      else if (selected === "7 Days") from = today.subtract(6, "day");
                      else if (selected === "15 Days") from = today.subtract(14, "day");
                      else if (selected === "30 Days") from = today.subtract(29, "day");

                      if (onDateRangeChange) {
                        onDateRangeChange({
                          from: from.format("YYYY-MM-DD"),
                          to: today.format("YYYY-MM-DD"),
                          range: selected,
                        });
                      }

                      // ✅ reflect in the local picker too
                      setDateFrom(from.toDate());
                      setDateTo(today.toDate());
                    }}
                  />

                </div>
              )}


              {/* ✅ OPD Feedback Dashboard */}
              {location.pathname === "/opd-feedback" && (
                <OpdFilter
                  serviceVariant="opd"
                  doctors={doctors || []} // ✅ dynamically received from parent (OPD)
                  onChange={(filters) => {
                    if (onDateRangeChange) onDateRangeChange(filters);
                  }}
                />
              )}

              {/* ✅ IPD Feedback Dashboard */}
              {location.pathname === "/ipd-feedback" && (
                <OpdFilter
                  serviceVariant="ipd"
                  doctors={doctors || []} // ✅ dynamically received from parent (IPD)
                  onChange={(filters) => {
                    if (onDateRangeChange) onDateRangeChange(filters);
                  }}
                />
              )}


              {location.pathname === "/complaint-dashboard" && (
                <OpdFilter
                  serviceVariant="concern"
                  doctors={doctors || []}
                  onChange={(filters) => {
                    if (onDateRangeChange) onDateRangeChange(filters);
                  }}
                />
              )}


              {location.pathname === "/reports/nps-reports" && (
                <>
                  <div className="grid grid-cols-2 md77:!grid-cols-3 md11:!grid-cols-5 h-fit gap-x-3">
                    {/* From Date */}
                    <div className="relative md11:!mb-[0px] md34:!mb-[14px]">
                      <ModernDatePicker
                        label="From Date"
                        selectedDate={dateFrom}
                        setSelectedDate={(d) => {
                          setDateFrom(d);
                          if (onDateRangeChange)
                            onDateRangeChange({
                              from: d ? dayjs(d).format("YYYY-MM-DD") : null,
                              to: dateTo ? dayjs(dateTo).format("YYYY-MM-DD") : null,
                            });
                        }}
                      />
                    </div>

                    {/* To Date */}
                    <div className="relative md11:!mb-[0px] md34:!mb-[14px]">
                      <ModernDatePicker
                        label="To Date"
                        selectedDate={dateTo}
                        setSelectedDate={(d) => {
                          setDateTo(d);
                          if (onDateRangeChange)
                            onDateRangeChange({
                              from: dateFrom ? dayjs(dateFrom).format("YYYY-MM-DD") : null,
                              to: d ? dayjs(d).format("YYYY-MM-DD") : null,
                            });
                        }}
                      />
                    </div>

                    {/* Department */}
                    <div className="md11:!mb-[0px] md34:mb-[14px] w-[100%]">
                      <AnimatedDropdown
                        label="Department"
                        options={["OPD", "IPD", "Both"]}
                        selected={selectedDepartment} // ✅ display selected department
                        onChange={(dept) => {
                          setSelectedDepartment(dept); // ✅ store new selection
                          // Reset Doctor & Room when department changes (optional)
                          setSelectedDoctor("All Doctors");
                          setSelectedRoom("All Rooms");

                          if (onDateRangeChange)
                            onDateRangeChange({
                              from: dateFrom ? dayjs(dateFrom).format("YYYY-MM-DD") : null,
                              to: dateTo ? dayjs(dateTo).format("YYYY-MM-DD") : null,
                              department: dept,
                            });
                        }}
                        icon={Hospital}
                      />
                    </div>

                    {/* Doctor */}
                    <div className="md11:!mb-[0px] w-[100%]">
                      <AnimatedDropdown
                        label="Doctor Name"
                        options={doctorOptions.length > 0 ? doctorOptions : ["All Doctors"]}
                        selected={selectedDoctor} // ✅ show selected
                        onChange={(doc) => {
                          setSelectedDoctor(doc); // ✅ store selection
                          if (onDateRangeChange)
                            onDateRangeChange({
                              from: dateFrom ? dayjs(dateFrom).format("YYYY-MM-DD") : null,
                              to: dateTo ? dayjs(dateTo).format("YYYY-MM-DD") : null,
                              doctor: doc,
                            });
                        }}
                        icon={User}
                      />
                    </div>

                    {/* Room */}
                    <div className="md:11!mb-[0px] w-[100%]">
                      <AnimatedDropdown
                        label="Room No"
                        options={roomOptions.length > 0 ? roomOptions : ["All Rooms"]}
                        selected={selectedRoom} // ✅ show selected
                        onChange={(room) => {
                          setSelectedRoom(room); // ✅ store selection
                          if (onDateRangeChange)
                            onDateRangeChange({
                              from: dateFrom ? dayjs(dateFrom).format("YYYY-MM-DD") : null,
                              to: dateTo ? dayjs(dateTo).format("YYYY-MM-DD") : null,
                              room,
                            });
                        }}
                        icon={Activity}
                      />
                    </div>
                  </div>
                </>
              )}




              {/* {location.pathname === "/reports/executive-report" && (

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 md77:!gap-4">

                  <div className="relative md34:!mb-[17px] md77:!mb-0">

                    <ModernDatePicker
                      label="From Date"
                      selectedDate={dateFrom}
                      setSelectedDate={setDateFrom}
                    />

                  </div>

                  <div className="relative">

                    <ModernDatePicker
                      label="To Date"
                      selectedDate={dateTo}
                      setSelectedDate={setDateTo}
                    />
                  </div>
                </div>
              )} */}
              {/* {location.pathname === "/internal-complint-list" && (
                <div className="grid  flex-shrink-0 grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">

                  <ModernDatePicker
                    label="From Date"
                    selectedDate={filterDateFrom}
                    setSelectedDate={setFilterDateFrom}
                  />

          
                  <ModernDatePicker
                    label="To Date"
                    selectedDate={filterDateTo}
                    setSelectedDate={setFilterDateTo}
                  />

            
                  <div className="relative">
                    <Search className="absolute left-3 top-[12px] -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="pl-9 pr-3 py-[3px] text-[13px] outline-none border border-gray-300 rounded-md w-[200px]"
                    />
                  </div>

                </div>
              )} */}

            </div>



            {location.pathname === "/complaint-details" && (

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white md:!flex hidden   px-[20px] pt-[6px]  gap-[30px]   rounded-lg mb-2"
              >
                <div className="flex items-center  gap-[20px] justify-between ">


                  <p className="text-gray-600  ml-">Complaint ID:<b> {complaintInfo?.id}</b></p>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${(complaintInfo?.status || "").toLowerCase() === "resolved"
                      ? "bg-green-100 text-green-700"
                      : (complaintInfo?.status || "").toLowerCase() === "in progress"
                        ? "bg-blue-100 text-blue-700"
                        : (complaintInfo?.status || "").toLowerCase() === "partial"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-gray-700"
                      }`}>
                      {complaintInfo?.status || "Unknown"}
                    </span>
                  </div>
                </div>
              </motion.div>



            )}

          </div>





          <div className="relative   mr-[30px] gap-[15px] flex items-center">
            {location.pathname === "/settings/user-manage" && (
              <div className=" md:!flex md34:!hidden gap-[10px]">


                <button
                  onClick={onCreateDoctor}
                  className="px-3  flex  items-center gap-[10px] py-[6px] bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
                >
                  <i className="fa-solid fa-plus"></i>
                  Create Doctors
                </button>


                <button
                  onClick={onCreateRoleUser}
                  className="px-3  flex  items-center gap-[10px] py-[6px] bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
                >
                  <UserPlus className="w-5 h-5" />
                  Create Role User
                </button>

              </div>
            )}
            {location.pathname === "/settings/role-manage" && (

              <button
                onClick={onCreateNewRole}
                className="px-3  md:!flex md34:!hidden  items-center gap-[10px] py-[6px] bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
              >
                <Plus className="w-5 h-5" />
                Create New Role
              </button>

            )}
            {location.pathname === "/settings/bed-manage" && (
              <button
                onClick={onCreateWard}
                className="px-2  md:!flex md34:!hidden  items-center gap-[10px] py-[6px] bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
              >
                <i className="fa-solid fa-plus"></i> Create Ward
              </button>
            )}

            <div className=" flex gap-[15px] ml-[10px] items-center justify-center">



              <i className="fa-light text-[18px] cursor-pointer fa-alarm-clock" onClick={handleTodo}></i>

              <i className="fa-light text-[18px]  cursor-pointer fa-file-lines" onClick={handleNotes}></i>


            </div>

            <div className=" relative">



              <button
                onClick={handleMail}
                className="flex items-center justify-center rounded-full  transition"
              >
                <i className="fa-light fa-bell text-gray-700 text-[20px]"></i>
              </button>

              {unreadCount > 0 && (
                <span
                  onClick={handleMail}
                  className="absolute top-[-10px] right-[-9px] flex items-center pt-[px] justify-center w-[16px] h-[16px] text-[9px] font-[500] text-white bg-red-600 rounded-full  border-white shadow"
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="relative" ref={dropdownRef}>
              {/* Profile Avatar */}
              <div
                onClick={() => setOpen(!open)}
                className="flex rounded-full gap-[5px] bg-[#c1c1c1] p-[5px] items-center cursor-pointer hover:bg-[#b8b8b8] transition"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-[24px] h-[24px] rounded-full bg-[#5B46F8] flex items-center justify-center text-white font-[500] text-[15px] select-none">
                    G
                  </div>
                  <span className="absolute bottom-0 right-0 w-[8px] h-[8px] bg-green-500 border-[1px] border-black rounded-full shadow-sm"></span>
                </div>
                <i
                  className={`fa-solid fa-chevron-down mr-[2px] text-[10px] text-[#fff] transform transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
                    }`}
                ></i>
              </div>

              {/* Dropdown Menu */}
              {open && (
                <div className="absolute right-0 mt-2 w-[210px] bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-slideDown">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition" onClick={handleProfile}
                  >
                    <User size={16} /> My Profile
                  </button>
                  {/* <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition" onClick={() => setOpenNotif(true)}
                  >
                    <Bell size={16} /> Notification Settings
                  </button> */}
                 {isAdmin && (
  <button
    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
    onClick={handleLogDetails}
  >
    <FileText size={16} /> Log Details
  </button>
)}

                  {/* <button
                    className="w-full flex items-center relative  gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 transition" onClick={() => setOpenBug(true)}
                  >
                    <Bug size={16} /> Report a Bug
                    <img className=" absolute w-[33px] object-contain h-[33px] right-7 rotate-[30deg]" src={comming} />
                  </button> */}
                  <hr className=" border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>


            <NotificationSettingsModal open={openNotif} onClose={() => setOpenNotif(false)} />
            <ReportBugModal open={openBug} onClose={() => setOpenBug(false)} />

          </div>

        </section>
        {["/dashboard", "/opd-feedback", "/ipd-feedback", "/complaint-dashboard", "/reports/nps-reports"].includes(location.pathname) && (
          <div className="  md34:!flex md11:!hidden w-[100%]  mt-[10px] ">

            <div className="flex h-[50px] px-[10px]  items-center justify-center w-[100%]">
              <AnimatedDropdownNavigate
                label="Go to Page"
                // icon={Menu}
                options={[
                  { id: "super-admin", label: "Dashboard", href: "/dashboard", icon: faTachometerAlt },
                  { id: "opd", label: "Opd Feedback", href: "/opd-feedback", icon: faUserDoctor },
                  { id: "ipd", label: "Ipd Feedback", href: "/ipd-feedback", icon: faHospitalUser },
                  { id: "complaints", label: "Complaint List", href: "/complaint-dashboard", icon: faListCheck },
                  { id: "nps", label: "Nps Dashboard", href: "/reports/nps-reports", icon: faSmile },
                ]}
              />
            </div>


          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.15s ease-out;
        }
      `}</style>
    </>
  );
}

export default Header;
