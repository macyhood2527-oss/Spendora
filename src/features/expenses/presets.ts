import type { ExpenseRecord } from "@/lib/db/types";

export type ExpensePreset = {
  merchant: string;
  category: string;
  count: number;
  lastUsedAt: string;
  averageAmount: number;
};

const normalizeText = (value: string) => value.trim().toLowerCase();

export function getExpensePresets(
  expenses: ExpenseRecord[],
  query: string,
  limit = 4,
) {
  const normalizedQuery = normalizeText(query);
  const presetMap = new Map<string, ExpensePreset>();

  for (const expense of expenses) {
    const merchant = expense.merchant?.trim() || expense.note?.trim();

    if (!merchant) {
      continue;
    }

    const key = normalizeText(merchant);
    const existing = presetMap.get(key);

    if (!existing) {
      presetMap.set(key, {
        merchant,
        category: expense.category,
        count: 1,
        lastUsedAt: expense.date,
        averageAmount: expense.amount,
      });
      continue;
    }

    const nextCount = existing.count + 1;

    presetMap.set(key, {
      ...existing,
      category: expense.date >= existing.lastUsedAt ? expense.category : existing.category,
      count: nextCount,
      lastUsedAt:
        expense.date >= existing.lastUsedAt ? expense.date : existing.lastUsedAt,
      averageAmount:
        (existing.averageAmount * existing.count + expense.amount) / nextCount,
    });
  }

  return [...presetMap.values()]
    .filter((preset) =>
      normalizedQuery.length === 0
        ? true
        : normalizeText(preset.merchant).includes(normalizedQuery),
    )
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return right.lastUsedAt.localeCompare(left.lastUsedAt);
    })
    .slice(0, limit);
}
