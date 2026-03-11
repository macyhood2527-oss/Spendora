import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  description: string;
  mobileSummary?: string;
  children: ReactNode;
};

export function ChartCard({ title, description, mobileSummary, children }: ChartCardProps) {
  return (
    <motion.section
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
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
        {mobileSummary ? (
          <p className="mt-3 rounded-[18px] bg-[rgba(250,250,247,0.9)] px-3 py-3 text-sm leading-6 text-[color:rgba(43,43,43,0.62)] sm:hidden">
            {mobileSummary}
          </p>
        ) : null}
      </div>
      {children}
    </motion.section>
  );
}
