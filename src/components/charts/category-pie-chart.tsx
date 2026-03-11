"use client";

import { motion } from "framer-motion";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";
import type { CategorySpending } from "@/features/insights/insights";
import { useHasMounted } from "@/hooks/use-has-mounted";

const COLORS = ["#46966c", "#7db993", "#c9a174", "#9a663f", "#a8cfbc", "#d8c0a3"];

const RADIAN = Math.PI / 180;

function CategoryLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  percent = 0,
  name = "",
  index = 0,
}: PieLabelRenderProps) {
  const radius = Number(outerRadius) + 28;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
  const fill = COLORS[index % COLORS.length] ?? COLORS[0];
  const textAnchor = x > Number(cx) ? "start" : "end";
  const percentValue = Math.round(percent * 100);

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={textAnchor}
      dominantBaseline="central"
      style={{
        fontSize: "11px",
        fontWeight: 500,
      }}
    >
      {`${name} ${percentValue}%`}
    </text>
  );
}

export function CategoryPieChart({ data }: { data: CategorySpending[] }) {
  const hasMounted = useHasMounted();
  const hasData = data.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-[250px] w-full sm:h-[280px] md:h-[320px]"
    >
      {hasMounted ? (
        hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 14, right: 20, bottom: 14, left: 20 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="53%"
                outerRadius={76}
                paddingAngle={1}
                animationDuration={900}
                stroke="rgba(255,255,255,0.88)"
                strokeWidth={1.5}
                labelLine={false}
                label={CategoryLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${Number(value ?? 0)}`, "Amount"]}
                contentStyle={{
                  borderRadius: 18,
                  border: "1px solid rgba(139, 94, 60, 0.10)",
                  backgroundColor: "rgba(255,255,255,0.97)",
                  boxShadow: "0 12px 24px rgba(139, 94, 60, 0.08)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[24px] bg-[rgba(255,255,255,0.6)] text-sm text-[color:rgba(43,43,43,0.56)]">
            No category data yet.
          </div>
        )
      ) : null}
    </motion.div>
  );
}
