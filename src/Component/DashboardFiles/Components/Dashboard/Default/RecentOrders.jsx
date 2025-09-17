import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { H5, UL, LI, H4 } from '../../../../../AbstractElements';
import { RecentOrderChart } from '../../../Data/DefaultDashboard/Chart';

const RecentOrders = ({ overallNps = 0 }) => {
  // Accepts either -100..100 (percentage NPS) or 0..10 scale
  const npsRaw = Number(overallNps) || 0;
  const isPercent = Math.abs(npsRaw) > 10;

  // Radial fill series must be 0..100. We use absolute for fill; sign shown in label.
  const seriesValue = isPercent
    ? Math.min(100, Math.abs(npsRaw))
    : Math.min(100, Math.abs(npsRaw * 10)); // 0..10 -> 0..100

  const displayText = isPercent ? `${npsRaw.toFixed(0)}%` : npsRaw.toFixed(1);

  // Traffic-light color: negative -> red, low positive -> amber, healthy -> green
  const dialColor =
    npsRaw < 0 ? '#ef4444' : npsRaw < (isPercent ? 30 : 3) ? '#f59e0b' : '#10b981';

  const textColorClass =
    npsRaw < 0 ? 'text-danger' : npsRaw < (isPercent ? 30 : 3) ? 'text-warning' : 'text-success';

  // Optional "Average Rating (out of 5)" approximation
  const avg5 = +( (isPercent ? npsRaw / 20 : npsRaw / 2) ).toFixed(1);

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
            formatter: () => displayText, // show negative or percent correctly
          },
        },
      },
    },
  };

  return (
    <Col xxl="4" xl="7" md="6" sm="5" className="box-col-6">
      <Card className="height-equal">
        <CardHeader className="card-no-border">
          <div className="header-top">
            <H5>NPS Rating</H5>
          </div>
        </CardHeader>

        <CardBody className="pt-0 pb-1">
          <Row className="recent-wrapper">
            <Col xl="6">
              <div className="recent-chart">
                <ReactApexChart
                  type="radialBar"
                  height={290}
                  options={options}
                  series={[seriesValue]}
                />
              </div>
            </Col>

            <Col xl="6">
              <UL attrUL={{ className: 'order-content' }}>
                <LI>
                  <span className="recent-circle" style={{ backgroundColor: dialColor }} />
                  <div>
                    <span className="f-light f-w-500">All Over NPS</span>
                    <H4 attrH4={{ className: `mt-1 mb-0 ${textColorClass}` }}>
                      {displayText}
                      {!isPercent && (
                        <span className="f-light f-14 f-w-400 ms-1">(out of 10)</span>
                      )}
                    </H4>
                  </div>
                </LI>

                <LI>
                  <span className="recent-circle bg-info" />
                  <div>
                    <span className="f-light f-w-500">Average Rating</span>
                    <H4 attrH4={{ className: 'mt-1 mb-0' }}>
                      {avg5}
                      <span className="f-light f-14 f-w-400 ms-1">(out of 5)</span>
                    </H4>
                  </div>
                </LI>
              </UL>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default RecentOrders;
