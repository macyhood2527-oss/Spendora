"use client";

import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyTrendPoint } from "@/features/insights/insights";
import { useHasMounted } from "@/hooks/use-has-mounted";

export function MonthlyTrendChart({
  data,
}: {
  data: MonthlyTrendPoint[];
}) {
  const hasMounted = useHasMounted();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="h-[280px] w-full"
    >
      {hasMounted ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(139,94,60,0.10)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(43,43,43,0.55)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(43,43,43,0.55)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 18,
                border: "1px solid rgba(139, 94, 60, 0.12)",
                backgroundColor: "rgba(255,255,255,0.96)",
                boxShadow: "0 12px 24px rgba(139, 94, 60, 0.12)",
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3F8F68"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3F8F68" }}
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : null}
    </motion.div>
  );
}
