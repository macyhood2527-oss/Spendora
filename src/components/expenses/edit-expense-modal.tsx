"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { MerchantAutocomplete } from "@/components/expenses/merchant-autocomplete";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useCategories } from "@/features/expenses/use-categories";
import { useExpenses } from "@/features/expenses/use-expenses";
import type { ExpenseRecord } from "@/lib/db/spendora-db";

type EditExpenseModalProps = {
  expense: ExpenseRecord | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    changes: {
      amount: number;
      merchant?: string;
      category: string;
      date: string;
      note?: string;
    },
  ) => Promise<void>;
};

export function EditExpenseModal({
  expense,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: EditExpenseModalProps) {
  if (!isOpen || !expense) {
    return null;
  }

  return (
    <EditExpenseModalBody
      key={expense.id}
      expense={expense}
      isSaving={isSaving}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

type EditExpenseModalBodyProps = Omit<EditExpenseModalProps, "isOpen" | "expense"> & {
  expense: ExpenseRecord;
};

function EditExpenseModalBody({
  expense,
  isSaving,
  onClose,
  onSave,
}: EditExpenseModalBodyProps) {
  const { categories } = useCategories();
  const { expenses } = useExpenses();
  const [amount, setAmount] = useState(() => String(expense.amount));
  const [merchant, setMerchant] = useState(() => expense.merchant ?? "");
  const [category, setCategory] = useState(() => expense.category);
  const [date, setDate] = useState(() => expense.date);
  const [note, setNote] = useState(() => expense.note ?? "");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }

    if (!category) {
      setError("Choose a category.");
      return;
    }

    if (!date) {
      setError("Pick a date.");
      return;
    }

    setError("");

    try {
      await onSave(expense.id, {
        amount: parsedAmount,
        merchant: merchant.trim() || undefined,
        category,
        date,
        note: note.trim() || undefined,
      });
    } catch (saveError) {
      console.error("Failed to update expense", saveError);
      setError("Could not update the expense. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(43,43,43,0.28)] px-0 py-0 sm:items-center sm:px-6 sm:py-6">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[30px] border border-white/70 bg-[rgba(255,255,255,0.96)] p-4 shadow-[0_30px_60px_rgba(139,94,60,0.12)] backdrop-blur sm:max-w-2xl sm:rounded-[30px] sm:p-6">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[rgba(139,94,60,0.16)] sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-primary)]">
              Edit Expense
            </p>
            <h2 className="mt-2 font-display text-[2rem] leading-none text-[var(--color-text)] sm:text-5xl">
              Refine the details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(250,250,247,0.95)] hover:bg-white"
            aria-label="Close edit modal"
          >
            <X size={18} strokeWidth={1.5} className="text-[var(--color-primary)]/80" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5 sm:mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Amount"
              name="edit-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
            <InputField
              label="Date"
              name="edit-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
            <MerchantAutocomplete
              label="Merchant"
              name="edit-merchant"
              expenses={expenses}
              value={merchant}
              placeholder="Coffee shop, grocery, taxi, etc."
              onChange={setMerchant}
              onSelect={(nextMerchant, nextCategory) => {
                setMerchant(nextMerchant);
                setCategory(nextCategory);
              }}
            />
            <InputField
              label="Category"
              name="edit-category"
              as="select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              <option value="">Choose a category</option>
              {categories.map((categoryOption) => (
                <option key={categoryOption.id} value={categoryOption.name}>
                  {categoryOption.name}
                </option>
              ))}
            </InputField>
            <div className="rounded-[22px] bg-[var(--color-background)]/90 p-4 sm:rounded-[28px] sm:p-5">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Entry context
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:rgba(43,43,43,0.65)]">
                Adjust merchant, category, date, or notes without leaving the list.
              </p>
            </div>
          </div>

          <InputField
            label="Notes"
            name="edit-note"
            as="textarea"
            placeholder="Optional context about the moment, purpose, or details."
            rows={5}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />

          <div className="sticky bottom-0 -mx-4 mt-2 flex flex-col gap-3 border-t border-[rgba(139,94,60,0.08)] bg-[rgba(255,255,255,0.96)] px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[color:rgba(43,43,43,0.62)]">
              {error || "Saving updates will refresh the list automatically."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
