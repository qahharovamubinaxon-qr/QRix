"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function AnalyticsChart({
  data,
}: {
  data: {
    date: string;
    scans: number;
  }[];
}) {
  return (
    <LineChart
      width={800}
      height={300}
      data={data}
    >
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="scans"
        stroke="#06b6d4"
        strokeWidth={3}
      />
    </LineChart>
  );
}