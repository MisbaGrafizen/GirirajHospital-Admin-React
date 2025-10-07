import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { H4 } from '../../../../../AbstractElements';
import SvgIcon from '../Component/SvgIcon';

const Widgets1 = ({ data }) => {
  return (
    <Card className='widget-1 min-w-[170px]'>
      <CardBody>
        <div className='widget-content'>
          <div className={`widget-round ${data.color}`}>
            <div className='bg-round md34:!hidden md11:!flex '>
              {data.icon}
              <SvgIcon className='half-circle svg-fill' iconId='halfcircle' />
            </div>
            <div className='bg-round md34:!flex md11:!hidden '>
              <div className={` font-${data.color} f-w-500`}>
                {/* <i className={`  icon-arrow-${data.gros < 50 ? 'down' : 'up'} icon-rotate me-1`} /> */}
                <span>{`${data.gros < 50 ? '' : ''}${data.gros}`}</span>
              </div>
              <SvgIcon className='half-circle svg-fill' iconId='halfcircle' />
            </div>
          </div>
          <div>
            <div className=' md34:!hidden  md11:!flex '>
              <H4>{data.total}</H4>
            </div>
            <span className='f-light'>{data.title}</span>
          </div>
        </div>
        {/* <div className={` md11:!flex md34:!hidden font-${data.color} f-w-500`}>
          <i className={`  icon-arrow-${data.gros < 50 ? 'down' : 'up'} icon-rotate me-1`} />
          <span>{`${data.gros < 50 ? '-' : '+'}${data.gros}`}</span>
        </div> */}
      </CardBody>
    </Card>
  );
};

export default Widgets1;
