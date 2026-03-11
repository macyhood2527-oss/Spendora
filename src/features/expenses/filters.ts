import type { ExpenseRecord } from "@/lib/db/types";

export type ExpenseSort =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc";

export type ExpenseFilters = {
  query: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  sort: ExpenseSort;
};

const normalizeText = (value: string) => value.trim().toLowerCase();

export const hasActiveExpenseFilters = ({
  query,
  category,
  dateFrom,
  dateTo,
  sort,
}: ExpenseFilters) =>
  Boolean(query.trim() || category || dateFrom || dateTo || sort !== "date-desc");

export function filterAndSortExpenses(
  expenses: ExpenseRecord[],
  filters: ExpenseFilters,
) {
  const query = normalizeText(filters.query);

  return expenses
    .filter((expense) => {
      const matchesQuery =
        query.length === 0 ||
        normalizeText(expense.merchant ?? "").includes(query) ||
        normalizeText(expense.note ?? "").includes(query) ||
        normalizeText(expense.category).includes(query);

      const matchesCategory =
        filters.category.length === 0 || expense.category === filters.category;

      const matchesDateFrom =
        filters.dateFrom.length === 0 || expense.date >= filters.dateFrom;

      const matchesDateTo =
        filters.dateTo.length === 0 || expense.date <= filters.dateTo;

      return matchesQuery && matchesCategory && matchesDateFrom && matchesDateTo;
    })
    .sort((left, right) => {
      switch (filters.sort) {
        case "date-asc":
          return left.date.localeCompare(right.date);
        case "amount-desc":
          return right.amount - left.amount;
        case "amount-asc":
          return left.amount - right.amount;
        case "date-desc":
        default:
          return right.date.localeCompare(left.date);
      }
    });
}
