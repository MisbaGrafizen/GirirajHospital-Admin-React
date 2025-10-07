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
      title: "Coming Soon",
      gros: npsRating,
      total: 0,
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
        <>
          <Col key={index} className="  mx-auto md77:!block" xs="6" md="4" lg="3">
            <Widgets1 data={widget} />
          </Col>
          {/* <div className=" grid grid-cols-2  ">
            <div key={index} className="  ">
              <Widgets1 data={widget} />
            </div>
          </div> */}
        </>
      ))}
    </Row>

  );
};

export default WidgetsWrapper;
