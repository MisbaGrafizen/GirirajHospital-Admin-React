"use client"

import { BarChart } from "@mui/x-charts/BarChart";

const chartSetting = {
  yAxis: [
    {
      label: "Complaints",
      width: 25,
    },
  ],
  height: 300,
};

const data = [
  { name: "Doctor", value: 38, color: "#3B82F6" },   // Blue
  { name: "Billing", value: 40, color: "#10B981" },  // Green
  { name: "Housekeeping", value: 26, color: "#F59E0B" }, // Amber
  { name: "Maintenance", value: 35, color: "#EF4444" },  // Red
  { name: "Diagnostic", value: 39, color: "#8B5CF6" },   // Purple
  { name: "Dietitian", value: 38, color: "#06B6D4" },    // Cyan
  { name: "Security", value: 25, color: "#F43F5E" },     // Pink/Coral
];

export default function SimpleBarChart() {
  return (
    <BarChart
      xAxis={[{ scaleType: "band", data: ["Complaints"] }]}
      series={data.map((d) => ({
        data: [d.value],
        label: d.name,
        color: d.color,
        barWidth: 10, // ✅ custom width for thinner bars
      }))}
      grid={{ horizontal: true, vertical: false }}
      {...chartSetting}
    />
  );
}
