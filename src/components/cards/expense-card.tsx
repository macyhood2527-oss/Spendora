"use client";

import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { createElement } from "react";
import { getCategoryIcon } from "@/features/expenses/icons";
import type { ExpenseCardViewModel } from "@/features/expenses/formatters";

type ExpenseCardProps = {
  expense: ExpenseCardViewModel;
  delay?: number;
  compact?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void | Promise<void>;
  isEditing?: boolean;
  isDeleting?: boolean;
};

export function ExpenseCard({
  expense,
  delay = 0,
  compact = false,
  onEdit,
  onDelete,
  isEditing = false,
  isDeleting = false,
}: ExpenseCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="rounded-[22px] border border-white/75 bg-white/85 p-4 shadow-[0_16px_34px_rgba(139,94,60,0.07)] backdrop-blur sm:rounded-[28px] md:p-5"
    >
      <div
        className={`flex ${compact ? "flex-col gap-3" : "flex-col gap-4 md:flex-row md:items-center md:justify-between"}`}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--color-text)] sm:text-lg">
              {expense.title}
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-secondary)]/18 px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
              {createElement(getCategoryIcon(expense.category), {
                size: 18,
                strokeWidth: 1.5,
                className: "text-[var(--color-primary)]/80",
              })}
              {expense.category}
            </span>
          </div>
          {expense.notes ? (
            <p className="text-sm leading-6 text-[color:rgba(43,43,43,0.62)]">
              {expense.notes}
            </p>
          ) : null}
          <p className="text-xs text-[var(--color-wood)] sm:text-sm">{expense.dateLabel}</p>
        </div>

        <div
          className={`flex ${compact ? "items-center justify-between" : "flex-col items-start gap-3 md:items-end"} gap-3`}
        >
          <p className="text-lg font-semibold text-[var(--color-text)] sm:text-xl">
            {expense.amount}
          </p>
          {!compact ? (
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                disabled={isEditing}
                onClick={() => onEdit?.(expense.id)}
                aria-label={`Edit ${expense.title}`}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(139,94,60,0.12)] bg-white/86 text-[var(--color-primary)] shadow-[0_8px_18px_rgba(139,94,60,0.05)] hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil size={15} strokeWidth={1.7} className="text-[var(--color-primary)]/85" />
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => onDelete?.(expense.id)}
                aria-label={`Delete ${expense.title}`}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-wood)] text-white shadow-[0_10px_18px_rgba(139,94,60,0.14)] hover:-translate-y-0.5 hover:bg-[#765033] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={15} strokeWidth={1.7} className="text-white" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
