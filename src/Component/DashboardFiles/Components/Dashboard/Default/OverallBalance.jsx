import React from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { H5, UL, LI } from '../../../../../AbstractElements';
import { Earning, Expense, OverallBalanceTitle } from '../../../Constant';
import LightCard from './LitghtCard';
import ReactApexChart from 'react-apexcharts';
import { CurrencyChartData } from '../../../Data/DefaultDashboard/Chart';
import { LightCardData } from '../../../Data/DefaultDashboard';
const OverallBalance = ({ kpis, opdSummary }) => {
  const totalAll = Number(kpis?.totalFeedback?.value ?? kpis?.totalFeedback ?? 0);
  const totalOPD = Number(opdSummary?.responses ?? 0);
  const totalIPD = Math.max(0, totalAll - totalOPD);
  return (
    <Col className='box-col-12'>
      <Card>
        <CardHeader className='card-no-border  items-center  gap-[10px] !flex'>
          <div className=' flex  profile-box1 rounded-[10px] justify-center items-center w-[48px] h-[48px] '>
            <i className="fa-regular text-[23px] fa-chart-waterfall"></i>

          </div>
          <H5>Overall Ratings</H5>
        </CardHeader>
        <CardBody className='pt-0'>


          {/* <Row className='m-0 overall-card w-[100%]'> */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Chart */}
            <Col className="p-0 flex flex-1">
              <div className="chart-right w-full">
                <Row>
                  <Col xl="12">
                    <CardBody className="p-0">
                      <UL attrUL={{ horizontal: true, className: "d-flex balance-data " }}>
                        <LI>
                          <span className="circle md34:!hidden md77:!flex bg-[#aaafcb]"></span>
                          <span className="f-light md34:!hidden md77:!flex ms-1">OPD</span>
                        </LI>
                        <LI>
                          <span className="circle md34:!hidden md77:!flex  bg-primary"></span>
                          <span className="f-light  md34:!hidden md77:!flexms-1">IPD</span>
                        </LI>
                      </UL>

                      {/* ✅ Responsive full-width chart */}
                      <div className="w-full">
                        <ReactApexChart
                          type="bar"
                          height={250}
                          width="100%"
                          options={{
                            ...CurrencyChartData.options,
                            xaxis: {
                              ...CurrencyChartData.options.xaxis,
                              categories: (kpis?.earning?.labels?.length
                                ? kpis.earning.labels
                                : CurrencyChartData.options.xaxis.categories),
                            },
                            responsive: [
                              {
                                breakpoint: 1024, // tablets
                                options: {
                                  chart: { height: 250 },
                                  plotOptions: { bar: { columnWidth: "40%" } },
                                  legend: { position: "bottom" },
                                },
                              },
                              {
                                breakpoint: 768, // small tablets
                                options: {
                                  chart: { height: 220 },
                                  plotOptions: { bar: { columnWidth: "50%" } },
                                  xaxis: { labels: { rotate: -30 } },
                                },
                              },
                            ],
                          }}
                          series={[
                            {
                              name: "IPD",
                              data: Array.isArray(kpis?.earning?.series) ? kpis.earning.series : [],
                            },
                            {
                              name: "OPD",
                              data: Array.isArray(kpis?.expense?.series) ? kpis.expense.series : [],
                            },
                          ]}
                        />
                      </div>
                    </CardBody>
                  </Col>
                </Row>
              </div>
            </Col>


            <LightCard LightCardData={LightCardData} totals={{ ipd: totalIPD, opd: totalOPD }} />

          </div>

          {/* </Row> */}
        </CardBody>
      </Card>
    </Col>
  );
};

export default OverallBalance;
