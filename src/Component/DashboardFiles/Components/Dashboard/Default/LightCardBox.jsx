import React from 'react';

import { H6 } from '../../../../../AbstractElements';
import { DailyDropdown } from '../../../Constant';
import SvgIcon from '../../Common/Component/SvgIcon';
import DropdownCommon from '../../Common/Dropdown';

const LightCardBox = ({ data }) => {
  return (
    <div className='light-card flex-shrink-0 balance-card widget-hover md34:!mt-[16px]'>
      <div className='svg-box'>
        {data.icon}
      </div>
      <div>
        <span className='f-light'>{data.title}</span>
        <H6 attrH6={{ className: 'mt-1 mb-0' }}>{data.price}</H6>
      </div>
      <div className='ms-auto text-end'>
        {/* <DropdownCommon dropdownMain={{ className: 'icon-dropdown', direction: 'start' }} options={DailyDropdown} iconName='icon-more-alt' btn={{ tag: 'span' }} /> */}
        {/* {data.gros && <span className={`d-inline-block mt-1 font-${data.color}`}>{data.gros}</span>} */}
      </div>
    </div>
  );
};

export default LightCardBox;
