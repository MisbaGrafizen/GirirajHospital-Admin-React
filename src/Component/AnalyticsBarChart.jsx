"use client"

import { BarChart } from "@mui/x-charts/BarChart";

// 🎨 Fixed department → color mapping
const DEPT_COLORS = {
  Doctor: "#3B82F6",        // Blue
  Billing: "#10B981",       // Green
  Housekeeping: "#F59E0B",  // Amber
  Maintenance: "#EF4444",   // Red
  Diagnostic: "#8B5CF6",    // Purple
  Dietitian: "#06B6D4",     // Cyan
  Security: "#9CA3AF",     
  Nursing: "#FFC107",
};


const chartSetting = {
  yAxis: [{ label: "Complaints", width:20 }],
  height: 260,
};

export default function SimpleBarChart({ trendData }) {
  // ✅ Summarize complaints by department
  const deptCounts = {};
  (trendData || []).forEach((row) => {
    Object.keys(DEPT_COLORS).forEach((dept) => {
      deptCounts[dept] = (deptCounts[dept] || 0) + (row[dept] || 0);
    });
  });

  // ✅ Convert to chart data
  const data = Object.entries(DEPT_COLORS).map(([dept, color]) => ({
    name: dept,
    value: deptCounts[dept] || 0,
    color,
  }));

  return (
    <BarChart
      xAxis={[{ scaleType: "band", data: ["Complaints"] }]}
      series={data.map((d) => ({
        data: [d.value],
        label: d.name,
        color: d.color,
        barWidth: 25, // Adjust bar thickness (10–25 looks nice)
      }))}
      grid={{ horizontal: true, vertical: false }}
      {...chartSetting}
    />
  );
}
