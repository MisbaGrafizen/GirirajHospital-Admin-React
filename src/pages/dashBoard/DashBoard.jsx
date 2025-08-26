
import React, { Fragment, useEffect, useState } from "react";


import SideBar from '../../Component/sidebar/SideBar';
import Header from '../../Component/header/Header';


export default function DashBoard() {

  const [dashboardData, setDashboardData] = useState(null);






  return (
    <>

      <section className="flex w-[100%] h-[100%] select-none p-[15px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[14px] h-[96vh]">
          <Header pageName="Dashboard" />
          <div className="flex gap-[10px] w-[100%] h-[100%]">
            <SideBar />
            <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] pr-[15px] overflow-y-auto gap-[30px] rounded-[10px]">
            

            </div>

          </div>
        </div>
      </section>





    </>
  )
}
