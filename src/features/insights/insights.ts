import { formatCurrency } from "@/features/expenses/formatters";
import type { ExpenseRecord } from "@/lib/db/types";

export type CategorySpending = {
  name: string;
  value: number;
};

export type MonthlyTrendPoint = {
  month: string;
  amount: number;
};

export type InsightSummaryCard = {
  label: string;
  value: string;
  detail: string;
};

export type InsightNarrative = {
  title: string;
  detail: string;
  tone: "positive" | "neutral" | "warm";
};

export type MonthlyReport = {
  monthKey: string;
  monthLabel: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  topCategoryName: string | null;
  topCategoryAmount: number;
  largestExpenseName: string | null;
  largestExpenseAmount: number;
  categoryBreakdown: CategorySpending[];
  highlights: string[];
  shareText: string;
};

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});
const monthLongFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const getMonthKey = (date: Date) => date.toISOString().slice(0, 7);

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

function getMonthTotal(expenses: ExpenseRecord[], monthKey: string) {
  return expenses
    .filter((expense) => expense.date.startsWith(monthKey))
    .reduce((sum, expense) => sum + expense.amount, 0);
}

function getMonthExpenses(
  expenses: ExpenseRecord[],
  monthKey: string,
) {
  return expenses.filter((expense) => expense.date.startsWith(monthKey));
}

function getCategoryTotals(expenses: ExpenseRecord[]) {
  return expenses.reduce<Record<string, number>>((accumulator, expense) => {
    accumulator[expense.category] =
      (accumulator[expense.category] ?? 0) + expense.amount;

    return accumulator;
  }, {});
}

export function getCurrentMonthExpenses(
  expenses: ExpenseRecord[],
  now = new Date(),
) {
  const currentMonth = getMonthKey(now);
  return expenses.filter((expense) => expense.date.startsWith(currentMonth));
}

export function getCategorySpending(expenses: ExpenseRecord[]) {
  return Object.entries(
    expenses.reduce<Record<string, number>>((accumulator, expense) => {
      accumulator[expense.category] =
        (accumulator[expense.category] ?? 0) + expense.amount;

      return accumulator;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
}

export function getMonthlyTrend(
  expenses: ExpenseRecord[],
  months = 6,
  now = new Date(),
) {
  const monthStarts = Array.from({ length: months }, (_, index) => {
    const date = startOfMonth(now);
    date.setMonth(date.getMonth() - (months - index - 1));
    return date;
  });

  return monthStarts.map((monthDate) => {
    const key = getMonthKey(monthDate);
    const amount = expenses
      .filter((expense) => expense.date.startsWith(key))
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      month: monthFormatter.format(monthDate),
      amount,
    };
  });
}

export function getInsightSummaryCards(
  expenses: ExpenseRecord[],
  currency: string,
) {
  const monthlyExpenses = getCurrentMonthExpenses(expenses);
  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageSpend =
    monthlyExpenses.length === 0 ? 0 : totalSpent / monthlyExpenses.length;
  const topCategory = getCategorySpending(monthlyExpenses)[0];

  const previousMonthDate = startOfMonth(new Date());
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonthKey = getMonthKey(previousMonthDate);
  const previousMonthTotal = getMonthTotal(expenses, previousMonthKey);
  const monthlyDelta = totalSpent - previousMonthTotal;
  const topCategoryShare =
    totalSpent > 0 && topCategory ? Math.round((topCategory.value / totalSpent) * 100) : 0;

  const cards: InsightSummaryCard[] = [
    {
      label: "This month",
      value: formatCurrency(totalSpent, currency),
      detail:
        previousMonthTotal === 0
          ? "Your first tracked month is taking shape."
          : monthlyDelta >= 0
            ? `${formatCurrency(monthlyDelta, currency)} more than last month.`
            : `${formatCurrency(Math.abs(monthlyDelta), currency)} less than last month.`,
    },
    {
      label: "Month change",
      value:
        previousMonthTotal === 0
          ? "New baseline"
          : monthlyDelta >= 0
            ? `+${formatCurrency(monthlyDelta, currency)}`
            : `-${formatCurrency(Math.abs(monthlyDelta), currency)}`,
      detail:
        previousMonthTotal === 0
          ? "You need one earlier month to compare against."
          : `${formatCurrency(previousMonthTotal, currency)} last month.`,
    },
    {
      label: "Top category share",
      value: topCategory ? `${topCategoryShare}%` : "No data yet",
      detail: topCategory
        ? `${topCategory.name} leads with ${formatCurrency(topCategory.value, currency)}.`
        : "Your strongest category will appear here.",
    },
    {
      label: "Average transaction",
      value: formatCurrency(averageSpend, currency),
      detail:
        monthlyExpenses.length === 0
          ? "Add expenses to reveal your spending rhythm."
          : `${monthlyExpenses.length} transactions recorded this month.`,
    },
  ];

  return cards;
}

export function getTrendExplanations(
  expenses: ExpenseRecord[],
  currency: string,
  now = new Date(),
) {
  const currentMonthKey = getMonthKey(now);
  const previousMonthDate = startOfMonth(now);
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonthKey = getMonthKey(previousMonthDate);
  const currentMonthExpenses = getMonthExpenses(expenses, currentMonthKey);
  const previousMonthExpenses = getMonthExpenses(expenses, previousMonthKey);
  const currentTotal = getMonthTotal(expenses, currentMonthKey);
  const previousTotal = getMonthTotal(expenses, previousMonthKey);
  const currentCategories = getCategoryTotals(currentMonthExpenses);
  const previousCategories = getCategoryTotals(previousMonthExpenses);
  const currentTopCategory = getCategorySpending(currentMonthExpenses)[0];
  const currentMonthLabel = monthLongFormatter.format(now);
  const previousMonthLabel = monthLongFormatter.format(previousMonthDate);

  const narratives: InsightNarrative[] = [];

  if (previousTotal > 0) {
    const change = currentTotal - previousTotal;
    const percentChange = Math.round((Math.abs(change) / previousTotal) * 100);

    narratives.push({
      title: "Month-over-month read",
      detail:
        change === 0
          ? `Spending is flat compared with ${previousMonthLabel}.`
          : change > 0
            ? `You are up ${percentChange}% in ${currentMonthLabel} compared with ${previousMonthLabel}.`
            : `You are down ${percentChange}% in ${currentMonthLabel} compared with ${previousMonthLabel}.`,
      tone: change > 0 ? "neutral" : "positive",
    });
  }

  const categoryChanges = Object.keys({
    ...currentCategories,
    ...previousCategories,
  })
    .map((category) => {
      const current = currentCategories[category] ?? 0;
      const previous = previousCategories[category] ?? 0;

      return {
        category,
        current,
        previous,
        delta: current - previous,
      };
    })
    .filter((item) => item.current > 0 || item.previous > 0)
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta));

  const strongestShift = categoryChanges[0];

  if (strongestShift && strongestShift.delta !== 0) {
    const shiftDirection = strongestShift.delta > 0 ? "up" : "down";
    const baseline = strongestShift.previous > 0 ? strongestShift.previous : strongestShift.current;
    const shiftPercent = baseline > 0
      ? Math.round((Math.abs(strongestShift.delta) / baseline) * 100)
      : 0;

    narratives.push({
      title: "Category movement",
      detail:
        strongestShift.previous === 0
          ? `${strongestShift.category} is newly active in ${currentMonthLabel} at ${formatCurrency(strongestShift.current, currency)}.`
          : `${strongestShift.category} is ${shiftDirection} ${shiftPercent}% versus ${previousMonthLabel}.`,
      tone: strongestShift.delta < 0 ? "positive" : "warm",
    });
  }

  if (currentTopCategory && currentTotal > 0) {
    const concentration = Math.round((currentTopCategory.value / currentTotal) * 100);
    narratives.push({
      title: "Category concentration",
      detail:
        concentration >= 40
          ? `${currentTopCategory.name} alone accounts for ${concentration}% of ${currentMonthLabel} spending.`
          : `${currentTopCategory.name} leads, but your spending is still fairly spread out this month.`,
      tone: concentration >= 40 ? "warm" : "neutral",
    });
  }

  return narratives.slice(0, 3);
}

export function getCelebrationStates(
  expenses: ExpenseRecord[],
  currency: string,
  monthlyBudget: number | null,
  now = new Date(),
) {
  const currentMonthKey = getMonthKey(now);
  const previousMonthDate = startOfMonth(now);
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonthKey = getMonthKey(previousMonthDate);
  const monthlyExpenses = getMonthExpenses(expenses, currentMonthKey);
  const totalSpent = getMonthTotal(expenses, currentMonthKey);
  const previousTotal = getMonthTotal(expenses, previousMonthKey);
  const activeDays = new Set(monthlyExpenses.map((expense) => expense.date)).size;

  const states: InsightNarrative[] = [];

  if (monthlyBudget && monthlyBudget > 0 && totalSpent > 0 && totalSpent <= monthlyBudget) {
    states.push({
      title: "Under budget",
      detail: `${formatCurrency(monthlyBudget - totalSpent, currency)} still left in your monthly budget.`,
      tone: "positive",
    });
  }

  if (previousTotal > 0 && totalSpent < previousTotal) {
    const reduction = previousTotal - totalSpent;
    const percent = Math.round((reduction / previousTotal) * 100);

    states.push({
      title: "Spending cooled off",
      detail: `You are spending ${percent}% less than last month so far, or ${formatCurrency(reduction, currency)} lower.`,
      tone: "positive",
    });
  }

  if (activeDays >= 5) {
    states.push({
      title: "Consistent logging",
      detail: `You have logged expenses on ${activeDays} different days this month.`,
      tone: "warm",
    });
  }

  return states.slice(0, 3);
}

export function getAvailableReportMonths(
  expenses: ExpenseRecord[],
  now = new Date(),
) {
  const months = new Set<string>([getMonthKey(now)]);

  for (const expense of expenses) {
    months.add(expense.date.slice(0, 7));
  }

  return [...months].sort((left, right) => right.localeCompare(left));
}

export function getMonthlyReport(
  expenses: ExpenseRecord[],
  currency: string,
  monthKey: string,
) {
  const [year, month] = monthKey.split("-").map(Number);
  const monthDate = new Date(year, (month ?? 1) - 1, 1);
  const monthLabel = monthLongFormatter.format(monthDate);
  const monthExpenses = getMonthExpenses(expenses, monthKey);
  const totalSpent = getMonthTotal(expenses, monthKey);
  const transactionCount = monthExpenses.length;
  const averageTransaction =
    transactionCount === 0 ? 0 : totalSpent / transactionCount;
  const categoryBreakdown = getCategorySpending(monthExpenses);
  const topCategory = categoryBreakdown[0];
  const largestExpense = [...monthExpenses].sort((left, right) => right.amount - left.amount)[0];
  const previousMonthDate = new Date(year, (month ?? 1) - 2, 1);
  const previousMonthKey = getMonthKey(previousMonthDate);
  const previousTotal = getMonthTotal(expenses, previousMonthKey);
  const monthDelta = totalSpent - previousTotal;
  const highlights: string[] = [];

  if (transactionCount === 0) {
    highlights.push(`No expenses were recorded in ${monthLabel}.`);
  } else {
    highlights.push(
      `${transactionCount} expenses added, with an average of ${formatCurrency(averageTransaction, currency)} each.`,
    );

    if (topCategory) {
      highlights.push(
        `${topCategory.name} led the month at ${formatCurrency(topCategory.value, currency)}.`,
      );
    }

    if (largestExpense) {
      highlights.push(
        `Largest entry: ${largestExpense.merchant?.trim() || largestExpense.note?.trim() || largestExpense.category} at ${formatCurrency(largestExpense.amount, currency)}.`,
      );
    }

    if (previousTotal > 0) {
      highlights.push(
        monthDelta >= 0
          ? `${formatCurrency(monthDelta, currency)} more than the previous month.`
          : `${formatCurrency(Math.abs(monthDelta), currency)} less than the previous month.`,
      );
    }
  }

  const shareText = [
    `Spendora monthly report for ${monthLabel}`,
    `Total spent: ${formatCurrency(totalSpent, currency)}`,
    `Transactions: ${transactionCount}`,
    `Average transaction: ${formatCurrency(averageTransaction, currency)}`,
    topCategory
      ? `Top category: ${topCategory.name} (${formatCurrency(topCategory.value, currency)})`
      : "Top category: No data",
    largestExpense
      ? `Largest expense: ${largestExpense.merchant?.trim() || largestExpense.note?.trim() || largestExpense.category} (${formatCurrency(largestExpense.amount, currency)})`
      : "Largest expense: No data",
    ...highlights,
  ].join("\n");

  return {
    monthKey,
    monthLabel,
    totalSpent,
    transactionCount,
    averageTransaction,
    topCategoryName: topCategory?.name ?? null,
    topCategoryAmount: topCategory?.value ?? 0,
    largestExpenseName:
      largestExpense?.merchant?.trim() || largestExpense?.note?.trim() || largestExpense?.category || null,
    largestExpenseAmount: largestExpense?.amount ?? 0,
    categoryBreakdown,
    highlights,
    shareText,
  } satisfies MonthlyReport;
}
