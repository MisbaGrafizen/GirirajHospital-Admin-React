import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
import { H5, H4 } from '../../../../../AbstractElements';
import { RecentOrderChart } from '../../../Data/DefaultDashboard/Chart';

const RecentOrders = ({ overallNps = 0 }) => {
  // Accepts either -100..100 (percentage NPS) or 0..10 scale
  const npsRaw = Number(overallNps) || 0;
  const isPercent = Math.abs(npsRaw) > 10;

  // Radial fill series must be 0..100
  const seriesValue = isPercent
    ? Math.min(100, Math.abs(npsRaw))
    : Math.min(100, Math.abs(npsRaw * 10)); // 0..10 -> 0..100

  // 👉 Show decimal values instead of rounding
  const displayText = isPercent ? `${npsRaw.toFixed(1)}%` : npsRaw.toFixed(1);

  // Traffic-light color: negative -> red, low positive -> amber, healthy -> green
  const dialColor =
    npsRaw < 0 ? '#ef4444' : npsRaw < (isPercent ? 30 : 3) ? '#f59e0b' : '#10b981';

  const textColorClass =
    npsRaw < 0 ? 'text-danger' : npsRaw < (isPercent ? 30 : 3) ? 'text-warning' : 'text-success';

  const baseOpts = RecentOrderChart?.options || {};
  const options = {
    ...baseOpts,
    labels: [isPercent ? 'NPS %' : 'NPS'],
    colors: [dialColor],
    plotOptions: {
      ...(baseOpts.plotOptions || {}),
      radialBar: {
        ...(baseOpts.plotOptions?.radialBar || {}),
        dataLabels: {
          ...(baseOpts.plotOptions?.radialBar?.dataLabels || {}),
          value: {
            ...(baseOpts.plotOptions?.radialBar?.dataLabels?.value || {}),
            formatter: () => displayText, // show decimals correctly
          },
        },
      },
    },
  };

  return (
    <Col className="w-[100%] md11:!pb-0">
      <Card className="height-equal">
        <CardHeader className="card-no-border">
          <div className="flex items-center gap-[10px]">
            <div className="flex profile-box1 rounded-[10px] justify-center items-center w-[48px] h-[48px]">
              <i className="fa-regular text-[23px] fa-chart-user"></i>
            </div>
            <H5>NPS Rating</H5>
          </div>
        </CardHeader>

        <CardBody className="pt-0 pb-2">
          <div className="recent-wrapper">
            {/* Chart */}
            <div className="recent-chart md11:!w-[300px] mx-auto">
              <ReactApexChart
                type="radialBar"
                height={290}
                options={options}
                series={[seriesValue]}
              />
            </div>

            {/* KPI Section */}
            <div className="flex flex-col items-center mt-4">
              <H4 attrH4={{ className: `mb-1 ${textColorClass}` }}>
                {displayText}
              </H4>
              <span className="text-gray-500 text-sm">Total NPS Score</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default RecentOrders;
