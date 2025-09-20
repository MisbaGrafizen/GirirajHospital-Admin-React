import React from 'react';
import { Col, Row } from 'reactstrap';

import LightCardBox from './LightCardBox';
import { icon } from 'leaflet';

import {
  Building2,
  UserCheck,
  MessageSquareText,
  ClipboardCheck,
} from "lucide-react";

const LightCard = ({ LightCardData, totals = {} }) => {
  return (
    <Col xl='3' md='12' sm='5' className='p-0'>
      <Row className='g-sm-4 g-2'>
         {typeof totals.ipd !== 'undefined' && (
         <Col xl='12' md='4'>
           <LightCardBox
             data={{
               ...(LightCardData?.[0] || {}),
               // set multiple common keys so LightCardBox can pick what it uses
               title: 'Total IPD Feedback',
               name: 'Total IPD Feedback',
               label: 'Total IPD Feedback',
               price: Number(totals.ipd || 0),
               number: Number(totals.ipd || 0),
               count: Number(totals.ipd || 0),
               amount: Number(totals.ipd || 0),
               badgeClass: 'bg-[#fff]',
               icon:<i class="fa-regular text-[21px] fa-bed-pulse"></i>
             }}
           />
         </Col>
       )}
       {typeof totals.opd !== 'undefined' && (
         <Col xl='12' md='4'>
           <LightCardBox
             data={{
               ...(LightCardData?.[0] || {}),
               title: 'Total OPD Feedback',
               name: 'Total OPD Feedback',
               label: 'Total OPD Feedback',
               price: Number(totals.opd || 0),
               number: Number(totals.opd || 0),
               count: Number(totals.opd || 0),
               amount: Number(totals.opd || 0),
               badgeClass: 'bg-primary',
                              icon:<i class="fa-light text-[21px]  fa-hospital-user"></i>
             }}
           />
         </Col>
       )}
 
        {/* {LightCardData.map((data, i) => (
          <Col key={i} xl='12' md='4'>
            <LightCardBox data={data} />
          </Col>
        ))} */}
      </Row>
    </Col>
  );
};

export default LightCard;
