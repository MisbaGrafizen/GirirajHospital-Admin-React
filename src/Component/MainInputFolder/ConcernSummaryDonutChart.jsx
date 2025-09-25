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
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[120px]"
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
      // animate={{ opacity: 1, scale: 1, rotate: 0 }}
      // transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
      className="relative bg-white w-[100%] rounded-2xl flex flex-col md34:!max-h-[360px] md11:!max-h-[100%] md34:items-start  md11:!items-center shadow-sm border border-gray-100 p-6 "
    >
      <div className="relative w-80 h-60 flex mx-auto justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
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
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-2xl font-[600] text-gray-900">Total</div>
            <div className="text-3xl font-[700] text-gray-700">{TOTAL}</div>
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="  flex flex-wrap md11:!flex justify-center gap-x-6  gap-y-[10px] md34:mt-[10px] md11:!mt-6"
      >
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
            <div className="text-sm">
              <span className="font-medium text-gray-900">{item.name}</span>
              <span className="text-gray-600 ml-1">({item.value})</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
