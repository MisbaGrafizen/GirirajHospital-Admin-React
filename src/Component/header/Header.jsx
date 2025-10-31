import React, { useEffect, useRef, useState, useMemo } from "react";
import backArrow from "../../../public/imges/main/back-arrow.png";
import { useNavigate, useLocation } from "react-router-dom";
import ModernDatePicker from "../MainInputFolder/ModernDatePicker";
import dayjs from "dayjs";
import AnimatedDropdown from "../MainInputFolder/AnimatedDropdown";
import AnimatedDropdownNavigate from "../MainInputFolder/AnimatedDropdownNavigate";
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
  Menu,
  ChevronRight,
} from "lucide-react";
import { ApiGet } from "../../helper/axios";
import socket from "../../socket/index";

function Header({
  pageName = "",
  onDateRangeChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [count, setCount] = useState(0);
  const [lastSeen, setLastSeen] = useState(Number(localStorage.getItem("lastSeen")) || 0);

  // useEffect(() => {
  //   const fetchCount = async () => {
  //     try {
  //       const data = await ApiGet("/admin/notifications");
  //       setCount(data?.notifications?.length || 0);
  //     } catch (err) {
  //       console.error("Error fetching notifications:", err);
  //     }
  //   };

  //   fetchCount(); // initial
  //   const interval = setInterval(fetchCount, 5000); // every 5 sec refresh

  //   return () => clearInterval(interval); // cleanup
  // }, []);

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

    // ✅ listen for new notifications
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
  return (
    <>

      <div className=" flex flex-col ">

<section className=" w-[100%] bg-[#fff] border-b h-[30px]">

</section>
        <section className="flex w-[100%]  bg-[#fff]  justify-between px-[12px] items-center border-b-[1.5px]">
          <div className="gap-[40px] flex items-center justify-between px-[0px] pb-[20px] pt-[22px] bg h-[25px]">
            {/* Left side back + title */}
            <div className="flex w-fit cursor-pointer items-center gap-[5px]"               onClick={handleBack}>
              {/* <img
                className="flex w-[27px] h-[27px]"
                src={backArrow}
                onClick={handleBack}
              /> */}

              <i class="fa-solid fa-chevron-left text-[15px] pl-[10px] pr-[2px]"></i>
              <div className="flex w-[3px] bg-[#e21e23] h-[24px]"></div>
              <h1
                className="pl-[6px] text-[#3d3d3d] flex font-Poppins md34:!text-[14px] md11:!text-[20px] font-[500]"
        
              >
                {pageName}
              </h1>
            </div>

            {/* ✅ Show only on dashboard */}
            {location.pathname === "/dashboards/super-dashboard" && (
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
              </div>
            )}
          </div>





          <div className="relative mr-[30px] flex items-center">
            <button
              onClick={handleNotes}
              className=" flex mr-[20px]  items-center justify-center rounded-full  hover:bg-gray-200 transition"
            >
              <i className="fa-light text-[17px] fa-pen-to-square"></i>
            </button>

            <button
              onClick={handleMail}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-full  transition"
            >
              <i className="fa-light fa-bell text-gray-700 text-[20px]"></i>
            </button>

            {unreadCount > 0 && (
              <span
                onClick={handleMail}
                className="absolute top-[-6px] right-[-6px] flex items-center pt-[px] justify-center w-[18px] h-[18px] text-[9px] font-[500] text-white bg-red-600 rounded-full border-2 border-white shadow"
              >
                {unreadCount}
              </span>
            )}
          </div>

        </section>
        {["/dashboards/super-dashboard", "/dashboards/opd-feedback", "/dashboards/ipd-feedback", "/dashboards/complaint-dashboard", "/dashboards/nps-dashboard"].includes(location.pathname) && (
          <div className="  md34:!flex md11:!hidden w-[100%]  mt-[10px] ">

            <div className="flex h-[50px] px-[10px]  items-center justify-center w-[100%]">
              <AnimatedDropdownNavigate
                label="Go to Page"
                // icon={Menu}
                options={[
                  { id: "super-admin", label: "Dashboard", href: "/dashboards/super-dashboard", icon: faTachometerAlt },
                  { id: "opd", label: "Opd Feedback", href: "/dashboards/opd-feedback", icon: faUserDoctor },
                  { id: "ipd", label: "Ipd Feedback", href: "/dashboards/ipd-feedback", icon: faHospitalUser },
                  { id: "complaints", label: "Complaint List", href: "/dashboards/complaint-dashboard", icon: faListCheck },
                  { id: "nps", label: "Nps Dashboard", href: "/dashboards/nps-dashboard", icon: faSmile },
                ]}
              />
            </div>


          </div>
        )}
      </div>

    </>
  );
}

export default Header;
