"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { MerchantAutocomplete } from "@/components/expenses/merchant-autocomplete";
import { FadeIn } from "@/components/ui/fade-in";
import { InputField } from "@/components/ui/input-field";
import { useCategories } from "@/features/expenses/use-categories";
import { useExpenses } from "@/features/expenses/use-expenses";
import { addExpense } from "@/lib/db/spendora-db";

export default function AddExpensePage() {
  const router = useRouter();
  const { categories } = useCategories();
  const { expenses } = useExpenses();
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

      startTransition(() => {
        router.push("/expenses");
        router.refresh();
      });
    } catch (submitError) {
      console.error("Failed to save expense", submitError);
      setError("Could not save the expense. Try again.");
      setIsSaving(false);
    }
  };

  const applyPreset = (presetMerchant: string, presetCategory: string) => {
    setMerchant(presetMerchant);
    setCategory(presetCategory);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <FadeIn className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary)]">
          Add Expense
        </p>
        <h1 className="font-display text-[3rem] leading-none text-[var(--color-text)] sm:text-[3.75rem] md:text-6xl">
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
            <div className="rounded-[22px] bg-[var(--color-background)]/90 p-4 sm:rounded-[28px] sm:p-5">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Entry context
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:rgba(43,43,43,0.65)]">
                Merchant keeps presets clean. Notes stay available for extra context.
              </p>
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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[color:rgba(43,43,43,0.62)]">
              {error || "Saved entries appear in your expense list immediately."}
            </p>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save expense"}
            </Button>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
