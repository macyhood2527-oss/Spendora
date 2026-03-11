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
import { useMediaQuery } from "@/hooks/use-media-query";

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
  const isMobile = useMediaQuery("(max-width: 639px)");
  const hasData = data.length > 0;
  const topCategories = data.slice(0, isMobile ? 4 : 6);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-[220px] w-full sm:h-[280px] md:h-[320px]"
    >
      {hasMounted ? (
        hasData ? (
          <div className="h-full">
            <ResponsiveContainer width="100%" height={isMobile ? "74%" : "100%"}>
              <PieChart margin={{ top: isMobile ? 4 : 14, right: 20, bottom: isMobile ? 0 : 14, left: 20 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy={isMobile ? "50%" : "53%"}
                outerRadius={isMobile ? 62 : 76}
                innerRadius={isMobile ? 16 : 0}
                paddingAngle={1}
                animationDuration={900}
                stroke="rgba(255,255,255,0.88)"
                strokeWidth={1.5}
                labelLine={false}
                label={isMobile ? false : CategoryLabel}
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

            {isMobile ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {topCategories.map((entry, index) => (
                  <div key={entry.name} className="rounded-[16px] bg-[rgba(250,250,247,0.9)] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <p className="truncate text-xs font-medium text-[var(--color-text)]">
                        {entry.name}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-[color:rgba(43,43,43,0.52)]">
                      {Math.round((entry.value / Math.max(total, 1)) * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[24px] bg-[rgba(255,255,255,0.6)] text-sm text-[color:rgba(43,43,43,0.56)]">
            No category data yet.
          </div>
        )
      ) : null}
    </motion.div>
  );
}
