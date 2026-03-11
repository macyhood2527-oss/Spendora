"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ExpenseCard } from "@/components/cards/expense-card";
import { DeleteExpenseDialog } from "@/components/expenses/delete-expense-dialog";
import { EditExpenseModal } from "@/components/expenses/edit-expense-modal";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { InputField } from "@/components/ui/input-field";
import { useToast } from "@/components/ui/toast-provider";
import {
  filterAndSortExpenses,
  hasActiveExpenseFilters,
  type ExpenseSort,
} from "@/features/expenses/filters";
import { toExpenseCardViewModel } from "@/features/expenses/formatters";
import { useCategories } from "@/features/expenses/use-categories";
import { useCurrency } from "@/features/settings/use-currency";
import { useExpenses } from "@/features/expenses/use-expenses";
import {
  deleteExpense,
  updateExpense,
  type ExpenseRecord,
} from "@/lib/db/spendora-db";

export default function ExpensesPage() {
  const { expenses, isLoading } = useExpenses();
  const { categories } = useCategories();
  const { currency } = useCurrency();
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseRecord | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<ExpenseSort>("date-desc");
  const [showFilters, setShowFilters] = useState(false);

  const filteredExpenses = useMemo(
    () =>
      filterAndSortExpenses(expenses, {
        query: searchQuery,
        category: selectedCategory,
        dateFrom,
        dateTo,
        sort: sortBy,
      }),
    [dateFrom, dateTo, expenses, searchQuery, selectedCategory, sortBy],
  );

  const hasActiveFilters = hasActiveExpenseFilters({
    query: searchQuery,
    category: selectedCategory,
    dateFrom,
    dateTo,
    sort: sortBy,
  });

  const handleDeleteConfirm = (id: string) => {
    const expense = expenses.find((entry) => entry.id === id) ?? null;
    setExpenseToDelete(expense);
  };

  const handleDeleteClose = () => {
    if (deletingId) {
      return;
    }

    setExpenseToDelete(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const expenseName =
      expenseToDelete?.merchant?.trim() ||
      expenseToDelete?.note?.trim() ||
      expenseToDelete?.category ||
      "Expense";

    try {
      await deleteExpense(id);
      setExpenseToDelete(null);
      showToast({
        tone: "success",
        title: "Expense deleted",
        description: `${expenseName} was removed from your local history.`,
      });
    } catch (error) {
      console.error("Failed to delete expense", error);
      showToast({
        tone: "error",
        title: "Could not delete expense",
        description: "Try again in a moment.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditOpen = (id: string) => {
    const expense = expenses.find((entry) => entry.id === id) ?? null;
    setEditingExpense(expense);
  };

  const handleEditClose = () => {
    if (isSavingEdit) {
      return;
    }

    setEditingExpense(null);
  };

  const handleEditSave = async (
    id: string,
    changes: {
      amount: number;
      merchant?: string;
      category: string;
      date: string;
      note?: string;
    },
  ) => {
    setIsSavingEdit(true);

    try {
      await updateExpense(id, changes);
      setEditingExpense(null);
      showToast({
        tone: "success",
        title: "Expense updated",
        description: "Your changes were saved successfully.",
      });
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not update expense",
        description: "Try again in a moment.",
      });
      throw error;
    } finally {
      setIsSavingEdit(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setDateFrom("");
    setDateTo("");
    setSortBy("date-desc");
  };

  const filtersForm = (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InputField
          label="Search"
          name="expense-search"
          placeholder="Merchant, note, or category"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <InputField
          label="Category"
          name="expense-category"
          as="select"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </InputField>
        <InputField
          label="From"
          name="expense-date-from"
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          max={dateTo || undefined}
        />
        <InputField
          label="To"
          name="expense-date-to"
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          min={dateFrom || undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 md:max-w-sm">
        <InputField
          label="Sort by"
          name="expense-sort"
          as="select"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as ExpenseSort)}
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </InputField>
      </div>
    </>
  );

  return (
    <>
      <div className="space-y-6 sm:space-y-8">
        <FadeIn className="space-y-2 sm:space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary)]">
            Expenses
          </p>
          <h1 className="font-display text-[2.25rem] leading-none text-[var(--color-text)] sm:text-[3.75rem] md:text-6xl">
            Every expense, in order
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[color:rgba(43,43,43,0.72)] sm:leading-7 md:text-base">
            Search, narrow, and sort your local timeline without losing the calm
            structure of the list.
          </p>
        </FadeIn>

        <FadeIn delay={0.06}>
          <section className="rounded-[28px] border border-white/70 bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_18px_44px_rgba(139,94,60,0.06)] backdrop-blur sm:rounded-[34px] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.14)]">
                  <SlidersHorizontal
                    size={19}
                    strokeWidth={1.5}
                    className="text-[var(--color-primary)]/80"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                    Filters
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--color-text)] sm:text-2xl">
                    Search and sort
                  </h2>
                  <p className="hidden text-sm leading-6 text-[color:rgba(43,43,43,0.58)] sm:block">
                    Filter by merchant, note, category, date range, or sort order.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start">
                <div className="rounded-full bg-[rgba(127,191,154,0.14)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] sm:px-4 sm:py-2">
                  {filteredExpenses.length} shown
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 px-4 py-2.5"
                  onClick={() => setShowFilters((current) => !current)}
                  aria-expanded={showFilters}
                  aria-controls="expense-filters-panel"
                >
                  {showFilters ? "Hide" : "Filters"}
                  <ChevronDown
                    size={16}
                    strokeWidth={1.5}
                    className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                  />
                </Button>
                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2 px-4 py-2.5"
                    onClick={resetFilters}
                  >
                    <X size={16} strokeWidth={1.5} />
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>

            {showFilters ? (
              <div id="expense-filters-panel" className="mt-5 hidden border-t border-[rgba(139,94,60,0.08)] pt-5 lg:block">
                {filtersForm}
              </div>
            ) : null}
          </section>
        </FadeIn>

        <div className="grid gap-4">
          {isLoading ? (
            <FadeIn>
              <div className="rounded-[28px] border border-white/75 bg-white/85 p-5 text-sm text-[color:rgba(43,43,43,0.65)] shadow-[0_16px_34px_rgba(139,94,60,0.07)]">
                Loading your expenses...
              </div>
            </FadeIn>
          ) : null}

          {!isLoading && expenses.length === 0 ? (
            <FadeIn>
              <div className="rounded-[28px] border border-dashed border-[rgba(139,94,60,0.22)] bg-white/70 p-8 text-sm leading-7 text-[color:rgba(43,43,43,0.65)]">
                No expenses yet. Add one to start building your local timeline.
              </div>
            </FadeIn>
          ) : null}

          {!isLoading && expenses.length > 0 && filteredExpenses.length === 0 ? (
            <FadeIn>
              <div className="rounded-[28px] border border-dashed border-[rgba(139,94,60,0.18)] bg-white/70 p-8 text-sm leading-7 text-[color:rgba(43,43,43,0.65)]">
                No expenses match the current filters. Try widening the date range or
                clearing the search.
              </div>
            </FadeIn>
          ) : null}

          {filteredExpenses.map((expense, index) => (
            <FadeIn key={expense.id} delay={0.04 * index}>
              <ExpenseCard
                expense={toExpenseCardViewModel(expense, currency)}
                onEdit={handleEditOpen}
                onDelete={handleDeleteConfirm}
                isEditing={editingExpense?.id === expense.id}
                isDeleting={deletingId === expense.id}
              />
            </FadeIn>
          ))}
        </div>
      </div>

      <EditExpenseModal
        expense={editingExpense}
        isOpen={editingExpense !== null}
        isSaving={isSavingEdit}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />

      <DeleteExpenseDialog
        expense={expenseToDelete}
        isOpen={expenseToDelete !== null}
        isDeleting={deletingId !== null}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      />

      <AnimatePresence>
        {showFilters ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-[rgba(43,43,43,0.24)] lg:hidden"
            onClick={() => setShowFilters(false)}
          >
            <motion.section
              initial={{ y: 32, opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 26, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 rounded-t-[32px] border border-white/70 bg-[rgba(255,255,255,0.98)] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-[0_-24px_50px_rgba(139,94,60,0.12)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto h-1.5 w-14 rounded-full bg-[rgba(43,43,43,0.12)]" />
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                    Filters
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
                    Search and sort
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(250,250,247,0.95)] text-[color:rgba(43,43,43,0.6)]"
                  aria-label="Close filters"
                >
                  <X size={18} strokeWidth={1.6} />
                </button>
              </div>

              <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
                {filtersForm}
              </div>

              <div className="mt-4 flex items-center gap-3">
                {hasActiveFilters ? (
                  <Button type="button" variant="ghost" className="flex-1" onClick={resetFilters}>
                    Clear
                  </Button>
                ) : null}
                <Button type="button" className="flex-1" onClick={() => setShowFilters(false)}>
                  Done
                </Button>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
