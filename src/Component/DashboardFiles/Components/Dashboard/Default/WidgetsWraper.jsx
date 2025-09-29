// import React from 'react';
// import { Col, Row } from 'reactstrap';
// import { Widgets2Data, Widgets2Data2 } from '../../../Data/DefaultDashboard';
// import Widgets1 from '../../Common/CommonWidgets/Widgets1';
// import Widgets2 from '../../Common/CommonWidgets/Widgets2';

// // Import icons from lucide-react
// import {
//   MessageSquare,   // Feedback
//   Star,            // Average Rating
//   AlertCircle,     // Open Issues
//   Activity,        // Response Rate
//   TrendingUp,      // NPS Rating
//   ClipboardList,   // Total Concerns
// } from "lucide-react";

// const WidgetsWrapper = ({ kpis }) => {
//   const totalFeedback = kpis?.totalFeedback || 0;
//   const avgRating = kpis?.averageRating?.value?.toFixed(1) || "0.0";
//   const responseRate = kpis?.responseRate?.percent != null ? kpis.responseRate.percent : "—";
//   const openIssues = kpis?.openIssues || 0;
//   const npsRating = kpis?.npsRating?.value?.toFixed(1) || "0.0";
//   const totalConcern = kpis?.totalConcern || 0;

//   return (
//     <>
//       <div className=' flex  gap-[10px] w-[100%]'>


//         {/* <Col xxl="auto" xl="3" sm="6" className=" "> */}
//         <Col className=" ">

//           <div className=' md34:!hidden md11:!flex md11:!pr-[13px]'>


//             <Row className=' '>
//               <Col xl="12">
//                 <Widgets1
//                   data={{
//                     title: "Total Feedback",
//                     gros: totalFeedback,
//                     total: totalFeedback,
//                     color: "primary",
//                     icon: <MessageSquare className="w-5 text-[#7366ff]  primary h-5" />,
//                   }}
//                 />
//               </Col>
//               <Col xl="12">
//                 <Widgets1
//                   data={{
//                     title: "Average Rating",
//                     gros: avgRating,
//                     total: avgRating,
//                     color: "warning",
//                     icon: <Star className="w-5  text-[#ffaa06] h-5" />,
//                   }}
//                 />
//               </Col>
//             </Row>
//           </div>


//           <div className=' md34:!flex  gap-[10px] md11:!hidden'>



//             <Col xl="12">
//               <Widgets1
//                 data={{
//                   title: "Total Feedback",
//                   gros: totalFeedback,
//                   total: totalFeedback,
//                   color: "primary",
//                   icon: <MessageSquare className="w-5 text-[#7366ff]  primary h-5" />,
//                 }}
//               />
//             </Col>
//             <Col xl="12">
//               <Widgets1
//                 data={{
//                   title: "Average Rating",
//                   gros: avgRating,
//                   total: avgRating,
//                   color: "warning",
//                   icon: <Star className="w-5  text-[#ffaa06] h-5" />,
//                 }}
//               />
//             </Col>

//           </div>
//         </Col>

//         <Col  className="box-col-6">
//           <div className=' md34:!hidden md11:!pr-[13px] md11:!flex'>
//             <Row>
//               <Col xl="12">
//                 <Widgets1
//                   data={{
//                     title: "Open Issues",
//                     gros: openIssues,
//                     total: openIssues,
//                     color: "warning",
//                     icon: <AlertCircle className="w-5  text-[#ffaa06] h-5" />,
//                   }}
//                 />
//               </Col>
//               <Col xl="12">
//                 <Widgets1
//                   data={{
//                     title: "Response Rate",
//                     gros: responseRate,
//                     total: responseRate + "%",
//                     color: "success",
//                     icon: <Activity className="w-5 text-[#55ba4a] h-5" />,
//                   }}
//                 />
//               </Col>
//             </Row>
//           </div>


//           <div className=' md34:!flex gap-[10px] md11:!hidden'>
//             <Col xl="12">
//               <Widgets1
//                 data={{
//                   title: "Open Issues",
//                   gros: openIssues,
//                   total: openIssues,
//                   color: "warning",
//                   icon: <AlertCircle className="w-5  text-[#ffaa06] h-5" />,
//                 }}
//               />
//             </Col>
//             <Col xl="12">
//               <Widgets1
//                 data={{
//                   title: "Response Rate",
//                   gros: responseRate,
//                   total: responseRate + "%",
//                   color: "success",
//                   icon: <Activity className="w-5 text-[#55ba4a] h-5" />,
//                 }}
//               />
//             </Col>
//           </div>



//         </Col>

//         <Col  className="box-col-6">
//           <div className=' md34:!hidden md11:!pr-[13px] md11:!flex'>
//             <Row>
//               <Col xl="12">
//                 <Widgets1
//                   data={{
//                     title: "NPS Rating",
//                     gros: npsRating,
//                     total: npsRating,
//                     color: "info",
//                     icon: <TrendingUp className="w-5 h-5" />,
//                   }}
//                 />
//               </Col>
//               <Col xl="12">
//                 <Widgets1
//                   data={{
//                     title: "Total Concerns",
//                     gros: totalConcern,
//                     total: totalConcern,
//                     color: "secondary",
//                     icon: <ClipboardList className="w-5 text-[#f83164] h-5" />,
//                   }}
//                 />
//               </Col>
//             </Row>
//           </div>




//           <div className=' md34:!flex gap-[10px] md11:!hidden'>


//             <Col xl="12">
//               <Widgets1
//                 data={{
//                   title: "Pending ",
//                   gros: npsRating,
//                   total: npsRating,
//                   color: "info",
//                   icon: <TrendingUp className="w-5 h-5" />,
//                 }}
//               />
//             </Col>
//             <Col xl="12">
//               <Widgets1
//                 data={{
//                   title: "Pending",
//                   gros: totalConcern,
//                   total: totalConcern,
//                   color: "secondary",
//                   icon: <ClipboardList className="w-5 text-[#f83164] h-5" />,
//                 }}
//               />
//             </Col>
//           </div>
//         </Col>

//         <Col className="box-col-6">
//           <div className=' md34:!hidden md11:!flex'>
//             <Row>
//               <Col xl="12">
//                 <Widgets1
//                   data={{
//                     title: "Comming Soon",
//                     gros: openIssues,
//                     total: openIssues,
//                     color: "warning",
//                     icon: <AlertCircle className="w-5  text-[#ffaa06] h-5" />,
//                   }}
//                 />
//               </Col>
//               <Col xl="12">
//                 <Widgets1
//                   data={{
//                     title: "Comming Soon",
//                     gros: responseRate,
//                     total: responseRate + "%",
//                     color: "success",
//                     icon: <Activity className="w-5 text-[#55ba4a] h-5" />,
//                   }}
//                 />
//               </Col>
//             </Row>
//           </div>


//           <div className=' md34:!flex gap-[10px] md11:!hidden'>
//             <Col xl="12">
//               <Widgets1
//                 data={{
//                   title: "Open Issues",
//                   gros: openIssues,
//                   total: openIssues,
//                   color: "warning",
//                   icon: <AlertCircle className="w-5  text-[#ffaa06] h-5" />,
//                 }}
//               />
//             </Col>
//             <Col xl="12">
//               <Widgets1
//                 data={{
//                   title: "Comming Soon",
//                   gros: responseRate,
//                   total: responseRate + "%",
//                   color: "success",
//                   icon: <Activity className="w-5 text-[#55ba4a] h-5" />,
//                 }}
//               />
//             </Col>
//           </div>



//         </Col>

//         {/* <Col xxl="auto" xl="12" sm="6" className="box-col-6">
//         <Row>
//           <Col xxl="12" xl="6" className="box-col-12">
//             <Widgets2 data={Widgets2Data} />
//           </Col>
//           <Col xxl="12" xl="6" className="box-col-12">
//             <Widgets2 chartClass="profit-chart " data={Widgets2Data2} />
//           </Col>
//         </Row>
//       </Col> */}
//       </div>
//     </>
//   );
// };

// export default WidgetsWrapper;
"use client";

import React from "react";
import { Col, Row } from "reactstrap";
import Widgets1 from "../../Common/CommonWidgets/Widgets1";
import {
  MessageSquare,
  Star,
  AlertCircle,
  Activity,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

const WidgetsWrapper = ({ kpis }) => {
  const totalFeedback = kpis?.totalFeedback || 0;
  const avgRating = kpis?.averageRating?.value?.toFixed(1) || "0.0";
  const responseRate =
    kpis?.responseRate?.percent != null ? kpis.responseRate.percent : "—";
  const openIssues = kpis?.openIssues || 0;
  const npsRating = kpis?.npsRating?.value?.toFixed(1) || "0.0";
  const totalConcern = kpis?.totalConcern || 0;

  const widgets = [
    {
      title: "Total Feedback",
      gros: totalFeedback,
      total: totalFeedback,
      color: "primary",
      icon: <MessageSquare className="w-5 text-[#7366ff] h-5" />,
    },
    {
      title: "Average Rating",
      gros: avgRating,
      total: avgRating,
      color: "warning",
      icon: <Star className="w-5 text-[#ffaa06] h-5" />,
    },
    {
      title: "Open Issues",
      gros: openIssues,
      total: openIssues,
      color: "warning",
      icon: <AlertCircle className="w-5 text-[#ffaa06] h-5" />,
    },
    {
      title: "Response Rate",
      gros: responseRate,
      total: responseRate + "%",
      color: "success",
      icon: <Activity className="w-5 text-[#55ba4a] h-5" />,
    },
    {
      title: "NPS Rating",
      gros: npsRating,
      total: npsRating,
      color: "info",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      title: "Total Concerns",
      gros: totalConcern,
      total: totalConcern,
      color: "secondary",
      icon: <ClipboardList className="w-5 text-[#f83164] h-5" />,
    },
    {
      title: "Pending",
      gros: npsRating,
      total: npsRating,
      color: "info",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      title: "Coming Soon",
      gros: openIssues,
      total: 0,
      color: "danger",
      icon: <AlertCircle className="w-5 text-[#ffaa06] h-5" />,
    },
  ];

  return (
<Row className="gx-3 gy-1">
  {widgets.map((widget, index) => (
    <Col key={index} xs="6" md="4" lg="3">
      <Widgets1 data={widget} />
    </Col>
  ))}
</Row>

  );
};

export default WidgetsWrapper;
