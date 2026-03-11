"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpenseRecord } from "@/lib/db/spendora-db";

type DeleteExpenseDialogProps = {
  expense: ExpenseRecord | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
};

export function DeleteExpenseDialog({
  expense,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteExpenseDialogProps) {
  if (!isOpen || !expense) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(43,43,43,0.28)] px-0 py-0 sm:items-center sm:px-6 sm:py-6">
      <div className="w-full max-w-lg rounded-t-[30px] border border-white/70 bg-[rgba(255,255,255,0.96)] p-4 shadow-[0_30px_60px_rgba(139,94,60,0.12)] backdrop-blur sm:rounded-[30px] sm:p-6">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[rgba(139,94,60,0.16)] sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(200,162,124,0.18)]">
              <Trash2 size={18} strokeWidth={1.5} className="text-[var(--color-wood)]/85" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Delete Expense
              </p>
              <h2 className="mt-2 font-display text-[1.9rem] leading-none text-[var(--color-text)] sm:text-[2.6rem]">
                Remove this entry?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(250,250,247,0.95)] hover:bg-white"
            aria-label="Close delete dialog"
          >
            <X size={18} strokeWidth={1.5} className="text-[var(--color-primary)]/80" />
          </button>
        </div>

        <div className="mt-6 rounded-[24px] bg-[var(--color-background)]/86 p-4">
          <p className="text-base font-semibold text-[var(--color-text)]">
            {expense.merchant?.trim() || expense.note?.trim() || expense.category}
          </p>
          <p className="mt-1 text-sm text-[color:rgba(43,43,43,0.62)]">
            {expense.category} on {expense.date}
          </p>
        </div>

        <p className="mt-4 text-sm leading-6 text-[color:rgba(43,43,43,0.62)]">
          This action cannot be undone. The expense will be removed from your local history immediately.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            onClick={() => onConfirm(expense.id)}
            className="w-full bg-[var(--color-wood)] hover:bg-[#765033] sm:w-auto"
          >
            {isDeleting ? "Deleting..." : "Delete expense"}
          </Button>
        </div>
      </div>
    </div>
  );
}
