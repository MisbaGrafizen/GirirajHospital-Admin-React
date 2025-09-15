import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { H5, UL, LI, H4 } from '../../../../../AbstractElements';
import { Cancelled,  Delivered, LastMonth, profit, profit2, RecentOrdersTitle, WeeklyMonDropdown } from '../../../Constant';
import { RecentOrderChart } from '../../../Data/DefaultDashboard/Chart';
import DropdownCommon from '../../Common/Dropdown';

const RecentOrders = ({ overallNps = 0 }) => {
   const displayNps = Number(overallNps) || 0;         
  const seriesValue =
    displayNps <= 10 ? Math.max(0, Math.min(100, displayNps * 10)) 
                      : Math.max(0, Math.min(100, displayNps));     
  const avg5 = +(displayNps / 2).toFixed(1);            
  
  return (
    <Col xxl='4' xl='7' md='6' sm='5' className='box-col-6'>
      <Card className='height-equal'>
        <CardHeader className='card-no-border'>
          <div className='header-top'>
            <H5>{RecentOrdersTitle}</H5>
            <div className='card-header-right-icon'>
              <DropdownCommon dropdownMain={{ className: 'icon-dropdown', direction: 'start' }} options={WeeklyMonDropdown} iconName='icon-more-alt' btn={{ tag: 'span' }} />
            </div>
          </div>
        </CardHeader>
        <CardBody className='pt-0 pb-1'>
          <Row className='recent-wrapper'>
            <Col xl='6'>
              <div className='recent-chart'>
                {/* <ReactApexChart type='radialBar' height={290} options={RecentOrderChart.options} series={RecentOrderChart.series} /> */}
               <ReactApexChart
                  type='radialBar'
                  height={290}
                  options={{
                    ...RecentOrderChart.options,
                    labels: ['NPS'],
                    plotOptions: {
                      ...RecentOrderChart.options?.plotOptions,
                      radialBar: {
                        ...RecentOrderChart.options?.plotOptions?.radialBar,
                        dataLabels: {
                          ...RecentOrderChart.options?.plotOptions?.radialBar?.dataLabels,
                          value: {
                            ...(RecentOrderChart.options?.plotOptions?.radialBar?.dataLabels?.value || {}),
                            formatter: () => `${displayNps.toFixed(1)}`,
                          },
                        },
                      },
                    },
                  }}
                  series={[seriesValue]}
                />
              </div>
            </Col>
            <Col xl='6'>
              <UL attrUL={{ className: 'order-content' }}>
                <LI>
                  <span className='recent-circle bg-primary'> </span>
                  <div>
                    {/* <span className='f-light f-w-500'>{Cancelled} </span>
                    <H4 attrH4={{ className: 'mt-1 mb-0' }}>
                      {profit}
                      <span className='f-light f-14 f-w-400 ms-1'>({LastMonth}) </span>
                    </H4> */}
                     <span className='f-light f-w-500'>All Over NPS</span>
                    <H4 attrH4={{ className: 'mt-1 mb-0' }}>
                      {displayNps.toFixed(1)}
                      <span className='f-light f-14 f-w-400 ms-1'>(out of 10)</span>
                    </H4>
                  </div>
                </LI>
                <LI>
                  <span className='recent-circle bg-info' />
                  <div>
                    {/* <span className='f-light f-w-500'>{Delivered}</span>
                    <H4 attrH4={{ className: 'mt-1 mb-0' }}>
                      {profit2}
                      <span className='f-light f-14 f-w-400 ms-1'>({LastMonth})</span>
                    </H4> */}
                     <span className='f-light f-w-500'>Average Rating</span>
                    <H4 attrH4={{ className: 'mt-1 mb-0' }}>
                      {avg5}
                      <span className='f-light f-14 f-w-400 ms-1'>(out of 5)</span>
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
