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
import { useNavigate } from 'react-router-dom';

const LightCard = ({ LightCardData, totals = {} }) => {

    const navigate = useNavigate();

  return (
    <div  className='p-0  md11:!mt-0 '>





  <div className="!flex md77:!flex-row gap-[10px] md11:!flex-row">
      {/* 🔹 IPD Card */}
      {typeof totals.ipd !== "undefined" && (
        <div onClick={() => navigate("/dashboards/opd-all-list")} className="cursor-pointer">
          <LightCardBox
            data={{
              ...(LightCardData?.[0] || {}),
              title: "IPD",
              price: Number(totals.ipd || 0),
              bgColor: "#2863eb",
              icon: (
                <i className="fa-regular text-[14px] text-[#fff] fa-bed-pulse"></i>
              ),
            }}
          />
        </div>
      )}

      {/* 🔹 OPD Card */}
      {typeof totals.opd !== "undefined" && (
        <div onClick={() => navigate("/dashboards/opd-all-list")} className="cursor-pointer">
          <LightCardBox
            data={{
              ...(LightCardData?.[0] || {}),
              title: "OPD",
              price: Number(totals.opd || 0),
              bgColor: "#604e92",
              icon: (
                <i className="fa-light text-[14px] text-[#fff] fa-hospital-user"></i>
              ),
            }}
          />
        </div>
      )}
    </div>
    </div>
  );
};

export default LightCard;
