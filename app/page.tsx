"use client";

import {
  BadgeCheck,
  DollarSign,
  MoonStar,
  PieChart,
  PiggyBank,
  Receipt,
  Sunrise,
  Sun,
  Sunset,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { createElement, useEffect, useMemo, useState } from "react";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { FadeIn } from "@/components/ui/fade-in";
import { getCategoryIcon } from "@/features/expenses/icons";
import { formatCurrency, formatExpenseDate } from "@/features/expenses/formatters";
import { getCelebrationStates } from "@/features/insights/insights";
import { useBudget } from "@/features/settings/use-budget";
import { useCurrency } from "@/features/settings/use-currency";
import { useExpenses } from "@/features/expenses/use-expenses";

const BREAKDOWN_COLORS = ["#46966c", "#7db993", "#c9a174", "#9a663f", "#a8cfbc", "#d8c0a3"];

function getGreetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) {
    return {
      label: "Good morning",
      icon: Sunrise,
    };
  }

  if (hour >= 12 && hour < 17) {
    return {
      label: "Good afternoon",
      icon: Sun,
    };
  }

  if (hour >= 17 && hour < 20) {
    return {
      label: "Good evening",
      icon: Sunset,
    };
  }

  return {
    label: "Good night",
    icon: MoonStar,
  };
}

export default function DashboardPage() {
  const { expenses, isLoading } = useExpenses();
  const { currency } = useCurrency();
  const { monthlyBudget, categoryBudgets } = useBudget();
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const recentExpenses = expenses.slice(0, 4);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter((expense) =>
    expense.date.startsWith(currentMonth),
  );
  const totalSpent = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const transactions = monthlyExpenses.length;
  const avgPerDay =
    transactions === 0 ? 0 : totalSpent / new Date().getDate();
  const budgetProgress =
    monthlyBudget && monthlyBudget > 0
      ? Math.min((totalSpent / monthlyBudget) * 100, 100)
      : 0;
  const budgetLeft =
    monthlyBudget && monthlyBudget > 0
      ? Math.max(monthlyBudget - totalSpent, 0)
      : null;
  const budgetOverAmount =
    monthlyBudget && totalSpent > monthlyBudget
      ? totalSpent - monthlyBudget
      : 0;
  const categoryBreakdown = Object.entries(
    monthlyExpenses.reduce<Record<string, number>>((accumulator, expense) => {
      accumulator[expense.category] =
        (accumulator[expense.category] ?? 0) + expense.amount;

      return accumulator;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
  const categoryBreakdownTotal = categoryBreakdown.reduce(
    (sum, category) => sum + category.value,
    0,
  );
  const categoryBudgetWatch = categoryBreakdown
    .filter((category) => (categoryBudgets[category.name] ?? 0) > 0)
    .map((category) => {
      const budget = categoryBudgets[category.name];
      const progress = budget > 0 ? Math.min((category.value / budget) * 100, 100) : 0;

      return {
        ...category,
        budget,
        progress,
        remaining: Math.max(budget - category.value, 0),
        isOverBudget: category.value > budget,
      };
    })
    .sort((left, right) => {
      if (left.isOverBudget !== right.isOverBudget) {
        return Number(right.isOverBudget) - Number(left.isOverBudget);
      }

      return right.progress - left.progress;
    })
    .slice(0, 4);
  const celebrationStates = getCelebrationStates(expenses, currency, monthlyBudget);
  const greeting = useMemo(() => getGreetingForHour(currentHour), [currentHour]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const summaryCards = [
    {
      label: "Total spent",
      value: formatCurrency(totalSpent, currency),
      detail: "This month",
      accent: "text-[var(--color-primary)]",
      tint: "bg-[rgba(127,191,154,0.18)]",
      icon: DollarSign,
    },
    {
      label: "Transactions",
      value: String(transactions),
      detail: "Recorded this month",
      accent: "text-[rgba(43,43,43,0.82)]",
      tint: "bg-[rgba(43,43,43,0.06)]",
      icon: Receipt,
    },
    {
      label: "Avg per day",
      value: formatCurrency(avgPerDay, currency),
      detail: "Daily average",
      accent: "text-[var(--color-wood)]",
      tint: "bg-[rgba(200,162,124,0.18)]",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <FadeIn className="rounded-[28px] border border-white/70 bg-[rgba(255,255,255,0.72)] px-4 py-5 shadow-[0_18px_48px_rgba(139,94,60,0.07)] backdrop-blur sm:rounded-[32px] sm:px-5 sm:py-6 md:rounded-[36px] md:px-7 md:py-7">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(127,191,154,0.14)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] sm:px-4 sm:py-2 sm:text-sm">
              <greeting.icon size={15} strokeWidth={1.8} className="text-[var(--color-primary)]" />
              {greeting.label}
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.42)]">
              Monthly overview
            </p>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-[3rem] leading-none text-[var(--color-text)] sm:text-[3.5rem] md:text-[4.25rem]">
              Welcome back
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[color:rgba(43,43,43,0.64)] sm:text-base sm:leading-8">
              Spending overview for this month, arranged in a quieter rhythm.
            </p>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <FadeIn delay={0.04}>
          <section className="h-full rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,252,249,0.78))] p-4 shadow-[0_16px_38px_rgba(139,94,60,0.06)] backdrop-blur sm:rounded-[30px] sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.16)]">
                <Sparkles
                  size={19}
                  strokeWidth={1.5}
                  className="text-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Small wins
                </p>
                <p className="text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                  Quiet progress worth noticing this month.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {celebrationStates.length > 0 ? (
                celebrationStates.slice(0, 2).map((state, index) => (
                  <FadeIn key={state.title} delay={0.04 * (index + 1)}>
                    <article className="rounded-[20px] bg-white/72 px-4 py-4">
                      <div className="flex items-start gap-2">
                        <BadgeCheck
                          size={16}
                          strokeWidth={1.7}
                          className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {state.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                            {state.detail}
                          </p>
                        </div>
                      </div>
                    </article>
                  </FadeIn>
                ))
              ) : (
                <article className="rounded-[20px] bg-white/72 px-4 py-4">
                  <div className="flex items-start gap-2">
                    <Sparkles
                      size={16}
                      strokeWidth={1.7}
                      className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        Wins will show up here
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                        Add a few expenses, set a budget, or track across a couple of days and
                        Spendora will start highlighting your progress.
                      </p>
                    </div>
                  </div>
                </article>
              )}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.08}>
          <section className="h-full rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(250,250,247,0.72))] p-4 shadow-[0_16px_38px_rgba(139,94,60,0.06)] backdrop-blur sm:rounded-[30px] sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.14)]">
                <PiggyBank
                  size={19}
                  strokeWidth={1.5}
                  className="text-[var(--color-primary)]/85"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[color:rgba(43,43,43,0.56)]">
                  Monthly budget
                </p>
                <p className="mt-3 text-[1.75rem] font-semibold text-[var(--color-primary)] sm:text-[2rem]">
                  {monthlyBudget
                    ? formatCurrency(monthlyBudget, currency)
                    : "Not set"}
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 rounded-full bg-[rgba(127,191,154,0.14)]">
              <div
                className={`h-full rounded-full ${
                  monthlyBudget && totalSpent > monthlyBudget
                    ? "bg-[#c58d74]"
                    : "bg-[var(--color-primary)]"
                }`}
                style={{ width: `${budgetProgress}%` }}
              />
            </div>

            <p className="mt-3 text-sm leading-6 text-[color:rgba(43,43,43,0.58)]">
              {budgetLeft === null
                ? "Set your target in settings"
                : budgetOverAmount > 0
                  ? `${formatCurrency(budgetOverAmount, currency)} over`
                  : `${formatCurrency(budgetLeft, currency)} left`}
            </p>
          </section>
        </FadeIn>
      </div>

      <section className="grid gap-4 md:grid-cols-3 md:gap-5">
        {summaryCards.map((card, index) => (
          <FadeIn key={card.label} delay={0.06 * (index + 1)}>
            <article className="rounded-[24px] border border-white/70 bg-[rgba(255,255,255,0.74)] p-4 shadow-[0_14px_36px_rgba(139,94,60,0.06)] backdrop-blur sm:rounded-[30px] sm:p-5 md:p-6">
              <div className="sr-only">{card.label}</div>
              <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${card.tint}`}
              >
                <card.icon
                  size={19}
                  strokeWidth={1.5}
                  className={card.accent}
                />
              </div>
              <p className="text-sm font-medium text-[color:rgba(43,43,43,0.56)]">
                {card.label}
              </p>
              <p className={`mt-3 text-[2rem] font-semibold ${card.accent} sm:text-3xl`}>
                {card.value}
              </p>
              <p className="mt-4 border-t border-[rgba(139,94,60,0.08)] pt-4 text-sm text-[color:rgba(43,43,43,0.52)]">
                {card.detail}
              </p>
            </article>
          </FadeIn>
        ))}
      </section>

      <section className="grid gap-5 sm:gap-6 xl:grid-cols-[1.2fr_0.88fr]">
        <FadeIn delay={0.18}>
          <section className="rounded-[28px] border border-white/70 bg-[rgba(255,255,255,0.74)] p-4 shadow-[0_18px_44px_rgba(139,94,60,0.06)] backdrop-blur sm:rounded-[34px] sm:p-6 md:p-7">
            <div className="mb-6 flex items-start gap-3 sm:mb-7 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.14)]">
                <PieChart
                  size={19}
                  strokeWidth={1.5}
                  className="text-[var(--color-primary)]/80"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-[color:rgba(43,43,43,0.44)]">
                  Breakdown
                </p>
                <h2 className="font-display text-[2.1rem] text-[var(--color-text)] sm:text-3xl">
                  Category breakdown
                </h2>
                <p className="max-w-xl text-sm leading-6 text-[color:rgba(43,43,43,0.6)] sm:leading-7">
                  A softer view of where your spending has been flowing this month.
                </p>
              </div>
            </div>
            <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(250,250,247,0.86),rgba(255,255,255,0.68))] p-2 sm:rounded-[28px] sm:p-3 md:p-5">
              <div className="space-y-3 sm:hidden">
                {categoryBreakdown.length === 0 ? (
                  <div className="rounded-[18px] bg-white/60 px-4 py-5 text-sm text-[color:rgba(43,43,43,0.56)]">
                    No category data yet.
                  </div>
                ) : (
                  <>
                    {categoryBreakdown.slice(0, 4).map((category, index) => {
                      const share =
                        categoryBreakdownTotal === 0
                          ? 0
                          : Math.round((category.value / categoryBreakdownTotal) * 100);

                      return (
                        <div
                          key={category.name}
                          className="rounded-[18px] bg-white/68 px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor:
                                      BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
                                  }}
                                />
                                <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                                  {category.name}
                                </p>
                              </div>
                              <p className="mt-1 text-xs text-[color:rgba(43,43,43,0.5)]">
                                {share}% of this month
                              </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
                              {formatCurrency(category.value, currency)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              <div className="hidden sm:block">
                <CategoryPieChart data={categoryBreakdown} />
              </div>
            </div>

            <div className="mt-4 rounded-[22px] bg-[rgba(255,255,255,0.64)] p-4 sm:mt-5 sm:rounded-[26px] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                    Budget watch
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[color:rgba(43,43,43,0.58)]">
                    Categories closest to or beyond their monthly caps.
                  </p>
                </div>
                <div className="rounded-full bg-[rgba(127,191,154,0.14)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)]">
                  {categoryBudgetWatch.length} tracked
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {categoryBudgetWatch.length === 0 ? (
                  <div className="rounded-[18px] bg-white/70 px-4 py-4 text-sm leading-6 text-[color:rgba(43,43,43,0.56)]">
                    Add category budgets in Settings to see which areas are running high.
                  </div>
                ) : (
                  categoryBudgetWatch.map((category) => (
                    <div
                      key={category.name}
                      className="rounded-[18px] bg-white/72 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {category.name}
                          </p>
                          <p className="mt-1 text-xs text-[color:rgba(43,43,43,0.5)]">
                            {formatCurrency(category.value, currency)} spent of{" "}
                            {formatCurrency(category.budget, currency)}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-semibold ${
                            category.isOverBudget
                              ? "text-[#a15a4b]"
                              : "text-[var(--color-primary)]"
                          }`}
                        >
                          {category.isOverBudget
                            ? `${formatCurrency(category.value - category.budget, currency)} over`
                            : `${formatCurrency(category.remaining, currency)} left`}
                        </p>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-[rgba(127,191,154,0.14)]">
                        <div
                          className={`h-full rounded-full ${
                            category.isOverBudget
                              ? "bg-[#c58d74]"
                              : "bg-[var(--color-primary)]"
                          }`}
                          style={{ width: `${category.progress}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.24}>
          <section className="rounded-[28px] border border-white/70 bg-[rgba(255,255,255,0.74)] p-4 shadow-[0_18px_44px_rgba(139,94,60,0.06)] backdrop-blur sm:rounded-[34px] sm:p-6 md:p-7">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-[color:rgba(43,43,43,0.44)]">
                  Latest
                </p>
                <h2 className="font-display text-[2.1rem] text-[var(--color-text)] sm:text-3xl">
                  Recent expenses
                </h2>
                <p className="text-sm leading-6 text-[color:rgba(43,43,43,0.6)] sm:leading-7">
                  Category, note, date, and amount in one calm list.
                </p>
              </div>
              <div className="w-fit rounded-full bg-[rgba(127,191,154,0.14)] px-4 py-2 text-sm font-medium text-[var(--color-primary)]">
                {recentExpenses.length} items
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="rounded-[24px] bg-[rgba(250,250,247,0.82)] px-5 py-6 text-sm text-[color:rgba(43,43,43,0.6)]">
                  Loading recent expenses...
                </div>
              ) : null}

              {!isLoading && recentExpenses.length === 0 ? (
                <div className="rounded-[24px] bg-[rgba(250,250,247,0.82)] px-5 py-6 text-sm leading-7 text-[color:rgba(43,43,43,0.6)]">
                  Add your first expense to start filling this cozy timeline.
                </div>
              ) : null}

              {recentExpenses.map((expense, index) => (
                <FadeIn key={expense.id} delay={0.04 * (index + 1)}>
                  <article className="rounded-[22px] border border-[rgba(255,255,255,0.86)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(250,250,247,0.72))] px-4 py-4 shadow-[0_10px_26px_rgba(139,94,60,0.05)] sm:rounded-[26px] sm:px-5">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.14)] text-[var(--color-primary)]">
                            {createElement(getCategoryIcon(expense.category), {
                              size: 18,
                              strokeWidth: 1.5,
                              className: "text-[var(--color-primary)]/80",
                            })}
                          </span>
                          <p className="truncate text-base font-semibold text-[var(--color-text)]">
                            {expense.merchant?.trim() || expense.category}
                          </p>
                        </div>
                        <p className="truncate text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                          {expense.note?.trim() || expense.category}
                        </p>
                        <p className="text-xs uppercase tracking-[0.14em] text-[color:rgba(43,43,43,0.42)]">
                          {formatExpenseDate(expense.date)}
                        </p>
                      </div>
                      <p className="shrink-0 text-base font-semibold text-[var(--color-primary)] sm:text-lg">
                        {formatCurrency(expense.amount, currency)}
                      </p>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          </section>
        </FadeIn>
      </section>
    </div>
  );
}
