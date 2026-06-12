"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: {
    date: string;
    scans: number;
  }[];
};

export default function DashboardChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div
        className="h-72 flex flex-col items-center justify-center gap-2 rounded-2xl"
        style={{ background: "var(--surface-hover)", border: "1px dashed var(--border)" }}
      >
        <span className="text-2xl">📊</span>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          No scan data yet — share a QR code to see trends here
        </span>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="qxScanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
              <stop offset="60%" stopColor="#22d3ee" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="qxScanStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 6"
            stroke="rgba(139,92,246,0.12)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#9b9bb3", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fill: "#9b9bb3", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: "rgba(139,92,246,.4)", strokeWidth: 1 }}
            contentStyle={{
              background: "rgba(17,17,32,.95)",
              border: "1px solid rgba(139,92,246,.3)",
              borderRadius: 12,
              color: "#f4f4f8",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,.4)",
            }}
            labelStyle={{ color: "#9b9bb3", marginBottom: 4 }}
          />
          <Area
            type="monotone"
            dataKey="scans"
            stroke="url(#qxScanStroke)"
            strokeWidth={2.5}
            fill="url(#qxScanGradient)"
            dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#22d3ee", strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
