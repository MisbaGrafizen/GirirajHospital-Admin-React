import React from 'react';
import { Col, Row } from 'reactstrap';
import { Widgets2Data, Widgets2Data2 } from '../../../Data/DefaultDashboard';
import Widgets1 from '../../Common/CommonWidgets/Widgets1';
import Widgets2 from '../../Common/CommonWidgets/Widgets2';

// Import icons from lucide-react
import {
  MessageSquare,   // Feedback
  Star,            // Average Rating
  AlertCircle,     // Open Issues
  Activity,        // Response Rate
  TrendingUp,      // NPS Rating
  ClipboardList,   // Total Concerns
} from "lucide-react";

const WidgetsWrapper = ({ kpis }) => {
  const totalFeedback = kpis?.totalFeedback || 0;
  const avgRating = kpis?.averageRating?.value?.toFixed(1) || "0.0";
  const responseRate = kpis?.responseRate?.percent != null ? kpis.responseRate.percent : "—";
  const openIssues = kpis?.openIssues?.count || 0;
  const npsRating = kpis?.npsRating?.value?.toFixed(1) || "0.0";
  const totalConcern = kpis?.totalConcern || 0;

  return (
    <>
      <Col xxl="auto" xl="3" sm="6" className="box-col-6">
        <Row>
          <Col xl="12">
            <Widgets1
              data={{
                title: "Total Feedback",
                gros: totalFeedback,
                total: totalFeedback,
                color: "primary",
                  icon: <MessageSquare className="w-5 text-[#7366ff]  primary h-5" />,
              }}
            />
          </Col>
          <Col xl="12">
            <Widgets1
              data={{
                title: "Average Rating",
                gros: avgRating,
                total: avgRating,
                color: "warning",
                icon: <Star className="w-5  text-[#ffaa06] h-5" />,
              }}
            />
          </Col>
        </Row>
      </Col>

      <Col xxl="auto" xl="3" sm="6" className="box-col-6">
        <Row>
          <Col xl="12">
            <Widgets1
              data={{
                title: "Open Issues",
                gros: openIssues,
                total: openIssues,
                color: "warning",
                icon: <AlertCircle className="w-5  text-[#ffaa06] h-5" />,
              }}
            />
          </Col>
          <Col xl="12">
            <Widgets1
              data={{
                title: "Response Rate",
                gros: responseRate,
                total: responseRate + "%",
                color: "success",
                icon: <Activity className="w-5 text-[#55ba4a] h-5" />,
              }}
            />
          </Col>
        </Row>
      </Col>

      <Col xxl="auto" xl="3" sm="6" className="box-col-6">
        <Row>
          <Col xl="12">
            <Widgets1
              data={{
                title: "NPS Rating",
                gros: npsRating,
                total: npsRating,
                color: "info",
                icon: <TrendingUp className="w-5 h-5" />,
              }}
            />
          </Col>
          <Col xl="12">
            <Widgets1
              data={{
                title: "Total Concerns",
                gros: totalConcern,
                total: totalConcern,
                color: "secondary",
                icon: <ClipboardList className="w-5 text-[#f83164] h-5" />,
              }}
            />
          </Col>
        </Row>
      </Col>

      {/* <Col xxl="auto" xl="12" sm="6" className="box-col-6">
        <Row>
          <Col xxl="12" xl="6" className="box-col-12">
            <Widgets2 data={Widgets2Data} />
          </Col>
          <Col xxl="12" xl="6" className="box-col-12">
            <Widgets2 chartClass="profit-chart " data={Widgets2Data2} />
          </Col>
        </Row>
      </Col> */}
    </>
  );
};

export default WidgetsWrapper;
