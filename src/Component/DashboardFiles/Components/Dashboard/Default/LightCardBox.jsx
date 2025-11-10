import React from 'react';

import { H6 } from '../../../../../AbstractElements';
import { DailyDropdown } from '../../../Constant';
import SvgIcon from '../../Common/Component/SvgIcon';
import DropdownCommon from '../../Common/Dropdown';

const LightCardBox = ({ data }) => {
  return (
    <div className=' bg-[#e0e0e066] w-fit items-center  py-[3px] !px-[6px] flex-shrink-0 balance-card widget-hover '>
         <div
        className=" w-[26px] h-[26px] rounded-[5px] flex items-center justify-center"
        style={{
          backgroundColor: data.bgColor , // fallback color
        }}
      >
        {data.icon}
      </div>

      <div className=''>
        <span className=' font-[400] text-[12px] '>{data.title}</span>
        <p  className="text-[13px] font-[600] mt-[-6px] " style={{ className: ' ' }}>{data.price}</p>
      </div>
 
    </div>
  );
};

export default LightCardBox;
