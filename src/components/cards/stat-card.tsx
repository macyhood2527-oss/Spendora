"use client";

import { motion } from "framer-motion";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-[30px] border border-white/80 bg-white/80 p-5 shadow-[0_18px_40px_rgba(139,94,60,0.08)] backdrop-blur"
    >
      <p className="text-sm text-[color:rgba(43,43,43,0.65)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-wood)]">{detail}</p>
    </motion.article>
  );
}
