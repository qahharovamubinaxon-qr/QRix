"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Props = {
  data: {
    date: string;
    scans: number;
  }[];
};

export default function DashboardChart({
  data,
}: Props) {
  return (
    <AreaChart
      width={900}
      height={300}
      data={data}
    >
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />

      <Area
        type="monotone"
        dataKey="scans"
        stroke="#22d3ee"
        fill="#22d3ee"
        fillOpacity={0.2}
      />
    </AreaChart>
  );
}