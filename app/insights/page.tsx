"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";
import { ChartCard } from "@/components/cards/chart-card";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import {
  getAvailableReportMonths,
  getCategorySpending,
  getCurrentMonthExpenses,
  getInsightSummaryCards,
  getMonthlyReport,
  getMonthlyTrend,
  getTrendExplanations,
} from "@/features/insights/insights";
import { formatCurrency } from "@/features/expenses/formatters";
import { useCurrency } from "@/features/settings/use-currency";
import { useExpenses } from "@/features/expenses/use-expenses";

type InsightIconProps = {
  className?: string;
};

function StrokeIcon({
  children,
  className,
  viewBox = "0 0 24 24",
}: PropsWithChildren<{ className?: string; viewBox?: string }>) {
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function SparklesIcon({ className }: InsightIconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
      <path d="M5 16v3" />
      <path d="M6.5 17.5h-3" />
    </StrokeIcon>
  );
}

function BarChartIcon({ className }: InsightIconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M4 20V10" />
      <path d="M12 20V4" />
      <path d="M20 20v-7" />
      <path d="M2 20h20" />
    </StrokeIcon>
  );
}

function CalendarRangeIcon({ className }: InsightIconProps) {
  return (
    <StrokeIcon className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 11h18" />
      <path d="M8 15h3" />
      <path d="M13 15h3" />
    </StrokeIcon>
  );
}

function ShareIcon({ className }: InsightIconProps) {
  return (
    <StrokeIcon className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.7l6.8-3.4" />
      <path d="M8.6 13.3l6.8 3.4" />
    </StrokeIcon>
  );
}

function DownloadIcon({ className }: InsightIconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M12 4v10" />
      <path d="M8 10l4 4 4-4" />
      <path d="M4 20h16" />
    </StrokeIcon>
  );
}

export default function InsightsPage() {
  const { expenses } = useExpenses();
  const { currency } = useCurrency();
  const { showToast } = useToast();
  const [selectedReportMonth, setSelectedReportMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );

  const monthlyExpenses = useMemo(() => getCurrentMonthExpenses(expenses), [expenses]);
  const categorySpending = useMemo(
    () => getCategorySpending(monthlyExpenses),
    [monthlyExpenses],
  );
  const monthlyTrend = useMemo(() => getMonthlyTrend(expenses), [expenses]);
  const summaryCards = useMemo(
    () => getInsightSummaryCards(expenses, currency),
    [currency, expenses],
  );
  const trendExplanations = useMemo(
    () => getTrendExplanations(expenses, currency),
    [currency, expenses],
  );
  const reportMonths = useMemo(() => getAvailableReportMonths(expenses), [expenses]);
  const effectiveReportMonth =
    reportMonths.includes(selectedReportMonth)
      ? selectedReportMonth
      : (reportMonths[0] ?? new Date().toISOString().slice(0, 7));
  const monthlyReport = useMemo(
    () => getMonthlyReport(expenses, currency, effectiveReportMonth),
    [currency, effectiveReportMonth, expenses],
  );
  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const topCategory = categorySpending[0];
  const spendingRhythm = useMemo(() => {
    const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    const weekdayStats = monthlyExpenses.reduce<Record<string, { count: number; amount: number }>>(
      (accumulator, expense) => {
        const weekday = weekdayFormatter.format(new Date(`${expense.date}T12:00:00`));
        const current = accumulator[weekday] ?? { count: 0, amount: 0 };

        accumulator[weekday] = {
          count: current.count + 1,
          amount: current.amount + expense.amount,
        };

        return accumulator;
      },
      {},
    );

    const busiestWeekday = Object.entries(weekdayStats).sort((left, right) => {
      if (right[1].amount !== left[1].amount) {
        return right[1].amount - left[1].amount;
      }

      return right[1].count - left[1].count;
    })[0];
    const largestExpense = [...monthlyExpenses].sort((left, right) => right.amount - left.amount)[0];
    const averageTransaction =
      monthlyExpenses.length === 0 ? 0 : totalSpent / monthlyExpenses.length;

    return {
      averageTransaction,
      busiestWeekday,
      largestExpense,
    };
  }, [monthlyExpenses, totalSpent]);
  const monthlyMomentum = useMemo(() => {
    const currentMonth = monthlyTrend[monthlyTrend.length - 1];
    const previousMonth = monthlyTrend[monthlyTrend.length - 2];
    const lastThreeMonths = monthlyTrend.slice(-3);
    const strongestMonth = [...monthlyTrend].sort((left, right) => right.amount - left.amount)[0];
    const recentAverage =
      lastThreeMonths.length === 0
        ? 0
        : lastThreeMonths.reduce((sum, month) => sum + month.amount, 0) / lastThreeMonths.length;

    return {
      currentMonth,
      previousMonth,
      recentAverage,
      strongestMonth,
    };
  }, [monthlyTrend]);
  const monthDirection =
    monthlyMomentum.previousMonth == null
      ? null
      : monthlyMomentum.currentMonth.amount - monthlyMomentum.previousMonth.amount;

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(monthlyReport.shareText);
      showToast({
        tone: "success",
        title: "Summary copied",
        description: `${monthlyReport.monthLabel} report text is now in your clipboard.`,
      });
    } catch (error) {
      console.error("Failed to copy report", error);
      showToast({
        tone: "error",
        title: "Could not copy summary",
        description: "Your browser may be blocking clipboard access.",
      });
    }
  };

  const handleDownloadPdf = () => {
    showToast({
      tone: "info",
      title: "Preparing PDF export",
      description: "The print dialog will open so you can save this report as a PDF.",
    });
    window.print();
  };

  return (
    <div className="space-y-8">
      <FadeIn className="space-y-3 print-hidden">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary)]">
          Insights
        </p>
        <h1 className="font-display text-5xl leading-none text-[var(--color-text)] md:text-6xl">
          Patterns worth noticing
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-[color:rgba(43,43,43,0.72)] md:text-base">
          Real patterns from your local expense history, including category weight,
          monthly direction, and budget context.
        </p>
      </FadeIn>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 print-hidden">
        {summaryCards.map((card, index) => (
          <FadeIn key={card.label} delay={0.05 * (index + 1)}>
            <motion.article
              whileHover={{
                y: -5,
                scale: 1.01,
                boxShadow: "0 24px 55px rgba(139,94,60,0.12)",
              }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="rounded-[28px] border border-white/70 bg-white/80 p-5 backdrop-blur md:p-6"
            >
              <p className="text-sm font-medium text-[color:rgba(43,43,43,0.56)]">
                {card.label}
              </p>
              <p className="mt-3 text-[1.9rem] font-semibold text-[var(--color-text)] sm:text-[2.15rem]">
                {card.value}
              </p>
              <p className="mt-4 text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                {card.detail}
              </p>
            </motion.article>
          </FadeIn>
        ))}
      </section>

      {trendExplanations.length > 0 ? (
        <FadeIn delay={0.1}>
          <section className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(250,250,247,0.76))] p-5 shadow-[0_18px_45px_rgba(139,94,60,0.08)] backdrop-blur md:p-6 print-hidden">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.14)]">
                <SparklesIcon
                  className="h-[19px] w-[19px] text-[var(--color-primary)]"
                />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">
                  Trend notes
                </h2>
                <p className="mt-1 text-sm leading-6 text-[color:rgba(43,43,43,0.62)]">
                  Plain-language reads from your recent spending patterns.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {trendExplanations.map((item, index) => (
                <FadeIn key={item.title} delay={0.04 * (index + 1)}>
                  <article className="rounded-[22px] bg-white/70 px-4 py-4">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                      {item.detail}
                    </p>
                  </article>
                </FadeIn>
              ))}
            </div>
          </section>
        </FadeIn>
      ) : null}

      <section className="print-root rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(250,250,247,0.76))] p-5 shadow-[0_18px_45px_rgba(139,94,60,0.08)] backdrop-blur md:p-6 print-report-sheet">
          <div className="print-hidden flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(200,162,124,0.16)]">
                <BarChartIcon
                  className="h-[19px] w-[19px] text-[var(--color-wood)]/80"
                />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">
                  Monthly report
                </h2>
                <p className="mt-1 text-sm leading-6 text-[color:rgba(43,43,43,0.62)]">
                  A compact summary you can copy or export as a PDF for any tracked month.
                </p>
              </div>
            </div>

            <label className="block rounded-[22px] bg-white/70 p-3 text-sm text-[var(--color-text)]">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                Report month
              </span>
              <select
                className="mt-2 w-full rounded-[18px] border border-[rgba(139,94,60,0.12)] bg-white px-3 py-2"
                value={effectiveReportMonth}
                onChange={(event) => setSelectedReportMonth(event.target.value)}
              >
                {reportMonths.map((monthKey) => (
                  <option key={monthKey} value={monthKey}>
                    {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
                      new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)) - 1, 1),
                    )}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr] print-hidden">
            <article className="rounded-[24px] bg-white/72 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                {monthlyReport.monthLabel}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">
                {formatCurrency(monthlyReport.totalSpent, currency)}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                {monthlyReport.transactionCount} transactions with an average of{" "}
                {formatCurrency(monthlyReport.averageTransaction, currency)}.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] bg-[rgba(250,250,247,0.9)] p-4">
                  <p className="text-sm font-medium text-[color:rgba(43,43,43,0.56)]">
                    Top category
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                    {monthlyReport.topCategoryName ?? "No data"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-primary)]">
                    {monthlyReport.topCategoryName
                      ? formatCurrency(monthlyReport.topCategoryAmount, currency)
                      : ""}
                  </p>
                </div>

                <div className="rounded-[18px] bg-[rgba(250,250,247,0.9)] p-4">
                  <p className="text-sm font-medium text-[color:rgba(43,43,43,0.56)]">
                    Largest expense
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                    {monthlyReport.largestExpenseName ?? "No data"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-primary)]">
                    {monthlyReport.largestExpenseName
                      ? formatCurrency(monthlyReport.largestExpenseAmount, currency)
                      : ""}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[24px] bg-white/72 p-5">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Report highlights
              </p>
              <div className="mt-4 space-y-3">
                {monthlyReport.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-[18px] bg-[rgba(250,250,247,0.9)] px-4 py-4 text-sm leading-6 text-[color:rgba(43,43,43,0.62)]"
                  >
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button type="button" onClick={handleCopyReport} className="sm:w-auto">
                  <ShareIcon className="mr-2 h-4 w-4" />
                  Copy summary
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDownloadPdf}
                  className="sm:w-auto print-hidden"
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </article>
          </div>

          <div className="print-only mt-6">
            <article className="print-report-document">
              <header>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(31,31,31,0.56)]">
                  Spendora Monthly Report
                </p>
                <div className="mt-3 flex items-end justify-between gap-6">
                  <div>
                    <h1 className="font-display text-[30px] leading-none text-[#1f1f1f]">
                      {monthlyReport.monthLabel}
                    </h1>
                    <p className="mt-2 text-[13px] text-[rgba(31,31,31,0.66)]">
                      Local expense summary generated from recorded entries.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(31,31,31,0.5)]">
                      Total spent
                    </p>
                    <p className="mt-1 text-[28px] font-semibold leading-none text-[#1f1f1f]">
                      {formatCurrency(monthlyReport.totalSpent, currency)}
                    </p>
                  </div>
                </div>
              </header>

              <div className="print-report-rule mt-6 pt-4">
                <div className="print-report-grid text-[13px]">
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[rgba(31,31,31,0.5)]">
                      Transactions
                    </p>
                    <p className="mt-1 text-[20px] font-semibold text-[#1f1f1f]">
                      {monthlyReport.transactionCount}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[rgba(31,31,31,0.5)]">
                      Average
                    </p>
                    <p className="mt-1 text-[20px] font-semibold text-[#1f1f1f]">
                      {formatCurrency(monthlyReport.averageTransaction, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[rgba(31,31,31,0.5)]">
                      Top category
                    </p>
                    <p className="mt-1 text-[18px] font-semibold text-[#1f1f1f]">
                      {monthlyReport.topCategoryName ?? "No data"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-[0.14em] text-[rgba(31,31,31,0.5)]">
                      Largest expense
                    </p>
                    <p className="mt-1 text-[18px] font-semibold text-[#1f1f1f]">
                      {monthlyReport.largestExpenseName ?? "No data"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="print-report-rule mt-6 pt-4">
                <h2 className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[rgba(31,31,31,0.64)]">
                  Highlights
                </h2>
                <div className="mt-3">
                  {monthlyReport.highlights.map((highlight) => (
                    <div key={highlight} className="print-report-list-item text-[13px] leading-6 text-[rgba(31,31,31,0.8)]">
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="print-report-rule mt-6 pt-4">
                <h2 className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[rgba(31,31,31,0.64)]">
                  Category breakdown
                </h2>
                <div className="mt-3">
                  {monthlyReport.categoryBreakdown.slice(0, 8).map((category) => {
                    const share =
                      monthlyReport.totalSpent === 0
                        ? 0
                        : Math.round((category.value / monthlyReport.totalSpent) * 100);

                    return (
                      <div
                        key={category.name}
                        className="print-report-list-item flex items-center justify-between gap-4 text-[13px]"
                      >
                        <div>
                          <p className="font-medium text-[#1f1f1f]">{category.name}</p>
                          <p className="mt-1 text-[rgba(31,31,31,0.52)]">
                            {share}% of monthly spending
                          </p>
                        </div>
                        <p className="font-semibold text-[#1f1f1f]">
                          {formatCurrency(category.value, currency)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2 print-hidden">
        <FadeIn delay={0.08}>
          <ChartCard
            title="Spending by category"
            description="Live category distribution for the current month."
          >
            <CategoryPieChart data={categorySpending} />
          </ChartCard>
        </FadeIn>
        <FadeIn delay={0.16}>
          <ChartCard
            title="Monthly trend"
            description="Your actual expense totals across the last six months."
          >
            <MonthlyTrendChart data={monthlyTrend} />
          </ChartCard>
        </FadeIn>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] print-hidden">
        <FadeIn delay={0.22}>
          <motion.section
            whileHover={{ y: -6, scale: 1.005 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(139,94,60,0.08)] backdrop-blur md:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.14)]">
                <CalendarRangeIcon
                  className="h-[19px] w-[19px] text-[var(--color-primary)]/80"
                />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">
                  Spending rhythm
                </h2>
                <p className="mt-1 text-sm leading-6 text-[color:rgba(43,43,43,0.65)]">
                  Which days and transactions carry the strongest spending signal.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(250,250,247,0.86),rgba(255,255,255,0.72))] p-5">
                <p className="text-sm font-medium text-[color:rgba(43,43,43,0.56)]">
                  Busiest weekday
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                  {spendingRhythm.busiestWeekday?.[0] ?? "No data"}
                </p>
                <p className="mt-4 text-sm leading-6 text-[color:rgba(43,43,43,0.62)]">
                  {spendingRhythm.busiestWeekday
                    ? `${formatCurrency(spendingRhythm.busiestWeekday[1].amount, currency)} across ${spendingRhythm.busiestWeekday[1].count} transactions.`
                    : "Add expenses to reveal your strongest day."}
                </p>
              </div>

              <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(250,250,247,0.86),rgba(255,255,255,0.72))] p-5">
                <p className="text-sm font-medium text-[color:rgba(43,43,43,0.56)]">
                  Average transaction
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                  {formatCurrency(spendingRhythm.averageTransaction, currency)}
                </p>
                <p className="mt-4 text-sm leading-6 text-[color:rgba(43,43,43,0.62)]">
                  Based on {monthlyExpenses.length} recorded expenses this month.
                </p>
              </div>

              <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(250,250,247,0.86),rgba(255,255,255,0.72))] p-5">
                <p className="text-sm font-medium text-[color:rgba(43,43,43,0.56)]">
                  Largest expense
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                  {spendingRhythm.largestExpense
                    ? formatCurrency(spendingRhythm.largestExpense.amount, currency)
                    : "No data"}
                </p>
                <p className="mt-4 text-sm leading-6 text-[color:rgba(43,43,43,0.62)]">
                  {spendingRhythm.largestExpense
                    ? `${spendingRhythm.largestExpense.category} was your biggest single spend.`
                    : "Your largest transaction will appear here."}
                </p>
              </div>
            </div>
          </motion.section>
        </FadeIn>

        <FadeIn delay={0.28}>
          <motion.section
            whileHover={{ y: -6, scale: 1.005 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(139,94,60,0.08)] backdrop-blur md:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(200,162,124,0.16)]">
                <BarChartIcon
                  className="h-[19px] w-[19px] text-[var(--color-wood)]/80"
                />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">
                  Monthly momentum
                </h2>
                <p className="mt-1 text-sm leading-6 text-[color:rgba(43,43,43,0.65)]">
                  Direction and concentration, without repeating the dashboard.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {totalSpent === 0 && monthlyMomentum.recentAverage === 0 ? (
                <div className="rounded-[24px] bg-[rgba(250,250,247,0.82)] px-5 py-6 text-sm leading-7 text-[color:rgba(43,43,43,0.6)]">
                  Add expenses to reveal your recent momentum.
                </div>
              ) : (
                [
                  {
                    label: "This month vs last",
                    value:
                      monthDirection == null
                        ? "Not enough history"
                        : monthDirection >= 0
                          ? `+${formatCurrency(monthDirection, currency)}`
                          : `-${formatCurrency(Math.abs(monthDirection), currency)}`,
                    detail:
                      monthDirection == null
                        ? "Track another month to compare direction."
                        : `${monthlyMomentum.previousMonth?.month} closed at ${formatCurrency(monthlyMomentum.previousMonth.amount, currency)}.`,
                  },
                  {
                    label: "3-month average",
                    value: formatCurrency(monthlyMomentum.recentAverage, currency),
                    detail: "A smoother baseline across your latest three months.",
                  },
                  {
                    label: "Strongest month",
                    value: monthlyMomentum.strongestMonth?.month ?? "No data",
                    detail: monthlyMomentum.strongestMonth
                      ? `${formatCurrency(monthlyMomentum.strongestMonth.amount, currency)} spent in that month.`
                      : "Your peak month will appear here.",
                  },
                  {
                    label: "Top category this month",
                    value: topCategory?.name ?? "No data",
                    detail: topCategory
                      ? `${formatCurrency(topCategory.value, currency)} or ${Math.round((topCategory.value / Math.max(totalSpent, 1)) * 100)}% of current spending.`
                      : "Your leading category will appear here.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      whileHover={{
                        x: 4,
                        scale: 1.01,
                        boxShadow: "0 18px 32px rgba(139,94,60,0.08)",
                      }}
                      transition={{
                        duration: 0.22,
                        delay: 0.03 * index,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,250,247,0.76))] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs text-[color:rgba(43,43,43,0.48)]">
                            {item.detail}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[var(--color-primary)]">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </FadeIn>
      </div>
    </div>
  );
}
