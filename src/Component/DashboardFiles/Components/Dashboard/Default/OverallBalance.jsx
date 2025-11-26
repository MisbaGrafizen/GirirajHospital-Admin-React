import React from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { H4, UL, LI } from "../../../../../AbstractElements";
import ReactApexChart from "react-apexcharts";
import { CurrencyChartData } from "../../../Data/DefaultDashboard/Chart";
import LightCard from "./LitghtCard";
import { LightCardData } from "../../../Data/DefaultDashboard";

const OverallBalance = ({ kpis, opdSummary, dateRange }) => {
  const totalAll = Number(kpis?.totalFeedback?.value ?? kpis?.totalFeedback ?? 0);
  const totalOPD = Number(opdSummary?.responses ?? 0);
  const totalIPD = Math.max(0, totalAll - totalOPD);

  // 🧮 Format filter label
  const filterLabel =
    dateRange?.from && dateRange?.to
      ? `${new Date(dateRange.from).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} → ${new Date(dateRange.to).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`
      : "Last 7 Days";

  return (
    <Col className=" w-[100%] ">
      <Card className=" md11:!w-[500px] md13:!w-[630px] 2xl:!w-[800px]">
        <div className=" flex    px-[15px] w-[100%] pt-[15px] justify-between gap-3">
          <div className="flex  gap-[10px]">
            <div className="profile-box1 flex-shrink-0 rounded-md flex justify-center items-center w-[35px] h-[35px]">
              <i className="fa-regular text-[15px] fa-chart-waterfall"></i>
            </div>
            <div>
              <H4>Overall Ratings</H4>
              <p className="text-[10px] text-gray-500 mt-[-2px]">
                Showing results for <span className="font-semibold">{filterLabel}</span>
              </p>
            </div>
          </div>

                                   <LightCard
              LightCardData={LightCardData}
              totals={{ ipd: totalIPD, opd: totalOPD }}
            />
        </div>

        <div className="pt-0 px-[4px]">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Chart Section */}
            <Col className="p-0 flex flex-1">
              <div className="chart-right w-full">
                <Row>
                  <Col >
                    <div className="w-[100%]">
                      {/* Legend */}
                      {/* <UL
                        attrUL={{
                          horizontal: true,
                          className: "d-flex balance-data mb-2",
                        }}
                      >
                        <LI>
                          <span className="circle bg-[#aaafcb]"></span>
                          <span className="f-light ms-1">OPD</span>
                        </LI>
                        <LI>
                          <span className="circle bg-primary"></span>
                          <span className="f-light ms-1">IPD</span>
                        </LI>
                      </UL> */}

  






                      {/* Chart */}
                      <div className="w-full">
                        <ReactApexChart
                          type="bar"
                          height={220}
                          width="100%"
                          options={{
                            ...CurrencyChartData.options,
                            xaxis: {
                              ...CurrencyChartData.options.xaxis,
                              categories:
                                kpis?.earning?.labels?.length
                                  ? kpis.earning.labels
                                  : CurrencyChartData.options.xaxis.categories,
                              title: {
                                text:
                                  dateRange?.from && dateRange?.to
                                    ? "Filtered Range"
                                    : "Last 7 Days",
                              },
                            },
                            colors: ["#2563eb", "#a78bfa"],
                            tooltip: {
                              theme: "light",
                              y: {
                                formatter: (val) => `${val}`,
                              },
                            },
                            responsive: [
                              {
                                breakpoint: 1024,
                                options: {
                                  chart: { height: 250 },
                                  plotOptions: { bar: { columnWidth: "40%" } },
                                  legend: { position: "bottom" },
                                },
                              },
                              {
                                breakpoint: 768,
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
                              data: Array.isArray(kpis?.earning?.series)
                                ? kpis.earning.series
                                : [],
                            },
                            {
                              name: "OPD",
                              data: Array.isArray(kpis?.expense?.series)
                                ? kpis.expense.series
                                : [],
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>

            {/* Summary Side Card */}
       
          </div>
        </div>
      </Card>
    </Col>
  );
};

export default OverallBalance;
