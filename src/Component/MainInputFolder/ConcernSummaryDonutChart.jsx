"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
         
        transition={{ duration: 0.2 }}
        className="bg-white border !z-[500]   flex flex-col  border-gray-200 rounded-lg shadow-lg p-3 min-w-[120px]"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <div>
            <p className="font-medium text-gray-900 text-sm">{item.name}</p>
            <p className="text-gray-600 text-sm">Count: {item.value}</p>
          </div>
        </div>
      </motion.div>
    )
  }
  return null
}

export default function ConcernSummaryDonutChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Compute total dynamically
  const TOTAL = useMemo(
    () => data.reduce((sum, item) => sum + Number(item.value || 0), 0),
    [data]
  )

  return (
    <motion.div
      // initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      // animate={{ opacity: 1, scale: 1, rotate: 0 }3
      // transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
      className="relative bg-white w-fit rounded-2xl flex flex-col  h-fit  dashShadow border-gray-100 p-[15px] "
    >

      <div className=' flex  mb-[6px] items-center gap-[10px]'>


        <div className="w-[35px] h-[35px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
          <i className=" text-[#fff] text-[15px] fa-regular fa-star-sharp-half-stroke"></i>
        </div>
        <h3 className="text-[14px] font-[400] text-gray-900 ">Complaint Distribution</h3>
      </div>
      <div className="relative w-[280px]   !h-[180px] md34:items-start  md11:!items-center flex mx-auto justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              className=" "
              animationBegin={200}
              animationDuration={600}
              animationEasing="ease-in-out"
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className=" flex relative  !z-[100]"
                  stroke={hoveredIndex === index ? entry.color : "transparent"}
                  strokeWidth={hoveredIndex === index ? 3 : 0}
                  style={{
                    filter: hoveredIndex === index ? "brightness(1.1)" : "none",
                    transition: "all 0.15s ease-in-out",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
<Tooltip
  content={<CustomTooltip />}
  wrapperStyle={{
    zIndex: 9999,
    position: "absolute",
    pointerEvents: "none",
  }}
/>

          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute  z-[0] flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-xl font-[600] text-gray-900">Total</div>
            <div className="text-2xl font-[700] text-gray-700">{TOTAL}</div>
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="    flex justify-center gap-x-3  gap-y-[10px] mt-[16px] mb-[5px]"
      >
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
            <div className="text-[11px]">
              <span className="font-medium text-gray-900">{item.name}</span>
              <span className="text-gray-600 ml-1">({item.value})</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
