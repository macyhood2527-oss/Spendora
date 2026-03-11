"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { MerchantAutocomplete } from "@/components/expenses/merchant-autocomplete";
import { FadeIn } from "@/components/ui/fade-in";
import { InputField } from "@/components/ui/input-field";
import { useToast } from "@/components/ui/toast-provider";
import { useCategories } from "@/features/expenses/use-categories";
import { useExpenses } from "@/features/expenses/use-expenses";
import { addExpense } from "@/lib/db/spendora-db";

const QUICK_AMOUNTS = [50, 100, 250, 500] as const;

export default function AddExpensePage() {
  const router = useRouter();
  const { categories } = useCategories();
  const { expenses } = useExpenses();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

    setIsSaving(true);
    setError("");

    try {
      await addExpense({
        amount: parsedAmount,
        merchant: merchant.trim() || undefined,
        category,
        date,
        note: note.trim() || undefined,
      });

      showToast({
        tone: "success",
        title: "Expense saved",
        description: "Your new entry is now part of your local history.",
      });

      startTransition(() => {
        router.push("/expenses");
        router.refresh();
      });
    } catch (submitError) {
      console.error("Failed to save expense", submitError);
      setError("Could not save the expense. Try again.");
      showToast({
        tone: "error",
        title: "Could not save expense",
        description: "Try again in a moment.",
      });
      setIsSaving(false);
    }
  };

  const applyPreset = (presetMerchant: string, presetCategory: string) => {
    setMerchant(presetMerchant);
    setCategory(presetCategory);
  };

  const applyQuickAmount = (quickAmount: number) => {
    setAmount((currentAmount) => {
      const parsedCurrent = Number(currentAmount);

      if (!Number.isFinite(parsedCurrent) || parsedCurrent <= 0) {
        return String(quickAmount);
      }

      return String((parsedCurrent + quickAmount).toFixed(2).replace(/\.00$/, ""));
    });
    setError("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <FadeIn className="space-y-2 sm:space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary)]">
          Add Expense
        </p>
        <h1 className="font-display text-[2.2rem] leading-none text-[var(--color-text)] sm:text-[3.75rem] md:text-6xl">
          Capture a spend softly
        </h1>
        <p className="max-w-xl text-sm leading-6 text-[color:rgba(43,43,43,0.72)] sm:leading-7 md:text-base">
          Keep entry quick and uncluttered, with space for just enough context.
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <form
          onSubmit={handleSubmit}
          className="rounded-[26px] border border-white/70 bg-white/80 p-4 shadow-[0_20px_45px_rgba(139,94,60,0.08)] backdrop-blur sm:rounded-[32px] sm:p-5 md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Amount"
              name="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
            <InputField
              label="Date"
              name="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
            <MerchantAutocomplete
              label="Merchant"
              name="merchant"
              expenses={expenses}
              value={merchant}
              placeholder="Coffee shop, grocery, taxi, etc."
              onChange={setMerchant}
              onSelect={applyPreset}
            />
            <InputField
              label="Category"
              name="category"
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
          </div>

          <div className="mt-4 rounded-[24px] bg-[rgba(250,250,247,0.82)] p-4 sm:hidden">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.46)]">
              Quick amount
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => applyQuickAmount(quickAmount)}
                  className="rounded-full bg-white px-3 py-2 text-sm font-medium text-[var(--color-text)] shadow-[0_8px_16px_rgba(139,94,60,0.05)]"
                >
                  +{quickAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <InputField
              label="Notes"
              name="notes"
              as="textarea"
              placeholder="Optional context about the moment, purpose, or details."
              rows={5}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="mt-6 hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[color:rgba(43,43,43,0.62)]">
              {error || "Saved entries appear in your expense list immediately."}
            </p>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save expense"}
            </Button>
          </div>

          <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+4.9rem)] mt-6 -mx-4 border-t border-[rgba(139,94,60,0.08)] bg-[rgba(255,255,255,0.96)] px-4 pb-1 pt-4 backdrop-blur sm:hidden">
            <p className={`text-sm ${error ? "text-[#a84c4c]" : "text-[color:rgba(43,43,43,0.62)]"}`}>
              {error || "Saved entries appear in your expense list immediately."}
            </p>
            <Button type="submit" disabled={isSaving} className="mt-3 w-full">
              {isSaving ? "Saving..." : "Save expense"}
            </Button>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
