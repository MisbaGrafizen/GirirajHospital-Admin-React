import React, { useEffect, useRef, useState, useMemo } from "react";
import backArrow from "../../../public/imges/main/back-arrow.png";
import { useNavigate, useLocation } from "react-router-dom";
import ModernDatePicker from "../MainInputFolder/ModernDatePicker";

function Header({
  pageName = "",
  value,
  onChange,
  serviceVariant = "opd",
  services,
  doctors,
}) {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 to get current route

  const handleBack = () => {
    navigate(-1);
  };

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  return (
    <>
      <section className="flex w-[100%] border-b-[1.5px]">
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
              className="pl-[6px] text-[#3d3d3d] flex font-Poppins text-[20px] font-[600]"
              onClick={handleBack}
            >
              {pageName}
            </h1>
          </div>

          {/* ✅ Show only on dashboard */}
          {location.pathname === "/dashboards/super-dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6">
              <ModernDatePicker
                label="From Date"
                selectedDate={dateFrom}
                setSelectedDate={setDateFrom}
              />
              <ModernDatePicker
                label="To Date"
                selectedDate={dateTo}
                setSelectedDate={setDateTo}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Header;
