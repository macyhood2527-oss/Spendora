import type { ExpenseRecord } from "@/lib/db/spendora-db";
import { DEFAULT_CURRENCY } from "@/features/settings/constants";

export type ExpenseCardViewModel = {
  id: string;
  title: string;
  merchant?: string;
  category: string;
  amount: string;
  dateLabel: string;
  notes?: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export const formatCurrency = (
  amount: number,
  currency = DEFAULT_CURRENCY,
) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

export const formatExpenseDate = (date: string) =>
  dateFormatter.format(new Date(`${date}T00:00:00`));

export const toExpenseCardViewModel = (
  expense: ExpenseRecord,
  currency = DEFAULT_CURRENCY,
): ExpenseCardViewModel => ({
  id: expense.id,
  title: expense.merchant?.trim() || expense.note?.trim() || "Untitled expense",
  merchant: expense.merchant?.trim() || undefined,
  category: expense.category,
  amount: formatCurrency(expense.amount, currency),
  dateLabel: formatExpenseDate(expense.date),
  notes: expense.merchant?.trim() ? expense.note?.trim() || undefined : undefined,
});
