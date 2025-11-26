// import React from 'react';
// import { Card, CardBody } from 'reactstrap';
// import { H4 } from '../../../../../AbstractElements';
// import SvgIcon from '../Component/SvgIcon';
// import CountUp from "react-countup";

// const Widgets1 = ({ data }) => {
//   return (
//     <Card className="
//     widget-1 min-w-[170px] 
//     transition-all duration-300 
//     hover:scale-[1.05] active:scale-[0.97] 
//     hover:shadow-lg cursor-pointer
//   ">
//       <CardBody>
//         <div className='widget-content'>
//           <div className={`widget-round ${data.color}`}>
//             <div className='bg-round md34:!hidden md11:!flex '>
//               {data.icon}
//               <SvgIcon className='half-circle svg-fill' iconId='halfcircle' />
//             </div>
//             <div className='bg-round md34:!flex md11:!hidden '>
//               <div className={` font-${data.color} f-w-500`}>
//                 {/* <i className={`  icon-arrow-${data.gros < 50 ? 'down' : 'up'} icon-rotate me-1`} /> */}
//                 <span>
//                   <span>
//                     <CountUp
//                       key={data.title}
//                       start={0}
//                       end={Number(data.gros) || 0}
//                       duration={1.8}
//                       delay={Math.random() * 0.5} // 👈 small random delay
//                       separator=","
//                       redraw={true}
//                     />
//                   </span>

//                 </span>
//               </div>
//               <SvgIcon className='half-circle svg-fill' iconId='halfcircle' />
//             </div>
//           </div>
//           <div>
//             <div className=' md34:!hidden  md11:!flex '>
//               <H4>{data.total}</H4>
//             </div>
//             <span className='f-light'>{data.title}</span>
//           </div>
//         </div>
//         {/* <div className={` md11:!flex md34:!hidden font-${data.color} f-w-500`}>
//           <i className={`  icon-arrow-${data.gros < 50 ? 'down' : 'up'} icon-rotate me-1`} />
//           <span>{`${data.gros < 50 ? '-' : '+'}${data.gros}`}</span>
//         </div> */}
//       </CardBody>
//     </Card>
//   );
// };

// export default Widgets1;

import React from "react";
import { Card, CardBody } from "reactstrap";
import { H4 } from "../../../../../AbstractElements";
import SvgIcon from "../Component/SvgIcon";
import CountUp from "../../../Components/reactBits/CountUp"; // ✅ Now auto refresh works

const Widgets1 = ({ data }) => {
  return (
    <Card
      className="
      widget-1 min-w-[170px]
      transition-all duration-300
      hover:scale-[1.05] active:scale-[0.97]
      hover:shadow-lg cursor-pointer
    "
    >
      <CardBody>
        <div className="widget-content flex items-center justify-between">
          {/* ---------- LEFT SIDE ICON AREA ---------- */}
          <div className={`widget-round ${data.color}`}>
            <div className="bg-round md34:!hidden md11:!flex">
              {data.icon}
              <SvgIcon className="half-circle svg-fill" iconId="halfcircle" />
            </div>

            <div className="bg-round md34:!flex md11:!hidden">
              <div className={`font-${data.color} f-w-500`}>
                {/* ✅ CountUp auto-refresh on every new data */}
                <CountUp
                  from={0}
                  to={Number(data.gros) || 0}
                  duration={6.6}
                  separator=","
                  className="md11:!text-[20px] text-[16px] md11:!font-semibold text-gray-800"
                />
              </div>
              <SvgIcon className="half-circle svg-fill" iconId="halfcircle" />
            </div>
          </div>

          {/* ---------- RIGHT SIDE TEXT ---------- */}
          <div>
            <div className="md34:!hidden md11:!flex">
              <H4>{data.total}</H4>
            </div>
            <span className="f-light text-gray-600 text-sm">{data.title}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Widgets1;
