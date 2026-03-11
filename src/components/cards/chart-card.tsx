import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <motion.section
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(139,94,60,0.08)] backdrop-blur md:p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--color-text)]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[color:rgba(43,43,43,0.65)]">
          {description}
        </p>
      </div>
      {children}
    </motion.section>
  );
}
