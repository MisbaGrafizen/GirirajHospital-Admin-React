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

function Header({
  pageName = "",
  onDateRangeChange,
}) {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 to get current route

  const handleBack = () => {
    navigate(-1);
  };

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

const handleMail =()=>{
  navigate("/mail");
}
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

  return (
    <>

      <div className=" flex flex-col ">


        <section className="flex w-[100%] justify-between px-[12px] items-center border-b-[1.5px]">
          <div className="gap-[30px] flex items-center justify-between px-[0px] pb-[25px] pt-[32px] bg h-[42px]">
            {/* Left side back + title */}
            <div className="flex w-fit cursor-pointer items-center gap-[5px]">
              <img
                className="flex w-[27px] h-[27px]"
                src={backArrow}
                onClick={handleBack}
              />
              <div className="flex w-[4px] bg-[#e21e23] h-[30px]"></div>
              <h1
                className="pl-[6px] text-[#3d3d3d] flex font-Poppins md34:!text-[14px] md11:!text-[20px] font-[600]"
                onClick={handleBack}
              >
                {pageName}
              </h1>
            </div>

            {/* ✅ Show only on dashboard */}
            {location.pathname === "/dashboards/super-dashboard" && (
              <div className=" md34:hidden md11:!grid grid-cols-1 md:grid-cols-4 gap-x-6">
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






          <div className="relative mr-[30px]  flex gap-[20px] items-center">
            <div className="bg-gradient-to-br  cursor-pointer   w-[130px] font-[600] items-center gap-[10px] text-[16px] rounded-[8px]   h-[35px] flex  justify-center  from-purple-400 to-blue-500  text-[#fff]  "
              onClick={handleLogout}>
              <i className="fa-solid fa-left-from-bracket"></i> Log Out
            </div>
            <i className="fa-solid fa-bell text-gray-700 text-2xl  cursor-pointer" onClick={handleMail}></i>

            <span className="absolute -top-1  cursor-pointer -right-3 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full" onClick={handleMail}>
              3
            </span>




          </div>
        </section>

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
      </div>

    </>
  );
}

export default Header;
