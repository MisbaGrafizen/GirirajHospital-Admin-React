
import React, { Fragment, useEffect, useState } from "react";
import { Container, Row } from "reactstrap";
import { Breadcrumbs } from "../../AbstractElements";

import SideBar from '../../Component/sidebar/SideBar';
import Header from '../../Component/header/Header';
import GreetingCard from "../../Component/DashboardFiles/Components/Dashboard/Default/GreetingCard";
import WidgetsWrapper from "../../Component/DashboardFiles/Components/Dashboard/Default/WidgetsWraper";
import OverallBalance from "../../Component/DashboardFiles/Components/Dashboard/Default/OverallBalance";
import RecentOrders from "../../Component/DashboardFiles/Components/Dashboard/Default/RecentOrders";
import ActivityCard from "../../Component/DashboardFiles/Components/Dashboard/Default/ActivityCard";
import RecentSales from "../../Component/DashboardFiles/Components/Dashboard/Default/RecentSales";
import TimelineCard from "../../Component/DashboardFiles/Components/Dashboard/Default/TimelineCard";
import PreAccountCard from "../../Component/DashboardFiles/Components/Dashboard/Default/PreAccountCard";
import TotalUserAndFollower from "../../Component/DashboardFiles/Components/Dashboard/Default/TotalUserAndFollower";
import PaperNote from "../../Component/DashboardFiles/Components/Dashboard/Default/PaperNote";
import '../../assets/scss/app.css'
import '../../assets/scss/style.css'
// import CryptoAnnotations from "../../Component/DashboardFiles/Components/Widgets/Chart/CryptoAnnotations";

// import 'react-clock/dist/Clock.css';

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
            
   <Fragment>
      <Breadcrumbs mainTitle="Default" parent="Dashboard" title="Default" />
      <Container fluid={true}>
        <Row className="widget-grid">
          <GreetingCard />
          <WidgetsWrapper />
          <OverallBalance />
          <RecentOrders />
          {/* <CryptoAnnotations /> */}
          <ActivityCard />
          <RecentSales />
          <TimelineCard />
          <PreAccountCard />
          <TotalUserAndFollower />
          <PaperNote />
        </Row>
      </Container>
    </Fragment>
            </div>

          </div>
        </div>
      </section>





    </>
  )
}
