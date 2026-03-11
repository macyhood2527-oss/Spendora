"use client";

import { useDeferredValue, useMemo, useState, type KeyboardEvent } from "react";
import { Clock3 } from "lucide-react";
import { formatCurrency } from "@/features/expenses/formatters";
import { getExpensePresets } from "@/features/expenses/presets";
import type { ExpenseRecord } from "@/lib/db/types";

type MerchantAutocompleteProps = {
  expenses: ExpenseRecord[];
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelect: (merchant: string, category: string) => void;
};

export function MerchantAutocomplete({
  expenses,
  label,
  name,
  value,
  placeholder,
  onChange,
  onSelect,
}: MerchantAutocompleteProps) {
  const deferredValue = useDeferredValue(value);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const suggestions = useMemo(
    () =>
      deferredValue.trim().length === 0
        ? []
        : getExpensePresets(expenses, deferredValue, 5),
    [deferredValue, expenses],
  );
  const showSuggestions = isFocused && suggestions.length > 0;

  const handleSelect = (merchant: string, category: string) => {
    onSelect(merchant, category);
    setHighlightedIndex(0);
    setIsFocused(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current === 0 ? suggestions.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter" || (event.key === "Tab" && !event.shiftKey)) {
      const suggestion = suggestions[highlightedIndex];

      if (suggestion) {
        event.preventDefault();
        handleSelect(suggestion.merchant, suggestion.category);
      }
      return;
    }

    if (event.key === "Escape") {
      setIsFocused(false);
    }
  };

  return (
    <label
      htmlFor={name}
      className="relative block rounded-[28px] bg-[var(--color-background)]/90 p-5"
    >
      <span className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </span>
      <input
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-2 w-full rounded-[22px] border border-[rgba(139,94,60,0.14)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[rgba(43,43,43,0.38)] focus:border-[var(--color-secondary)] focus:shadow-[0_0_0_4px_rgba(127,191,154,0.14)]"
        onChange={(event) => {
          onChange(event.target.value);
          setHighlightedIndex(0);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        onKeyDown={handleKeyDown}
      />

      {showSuggestions ? (
        <div className="absolute inset-x-5 top-[calc(100%-0.25rem)] z-20 rounded-[24px] border border-white/80 bg-[rgba(255,255,255,0.98)] p-2 shadow-[0_20px_40px_rgba(139,94,60,0.12)] backdrop-blur">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.merchant}-${suggestion.category}`}
              type="button"
              className={`flex w-full items-start justify-between gap-3 rounded-[18px] px-3 py-3 text-left ${
                highlightedIndex === index ? "bg-[rgba(127,191,154,0.12)]" : "hover:bg-[rgba(250,250,247,0.9)]"
              }`}
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(suggestion.merchant, suggestion.category);
              }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                  {suggestion.merchant}
                </p>
                <p className="mt-1 text-xs text-[color:rgba(43,43,43,0.5)]">
                  {suggestion.category} • used {suggestion.count} time{suggestion.count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  {formatCurrency(suggestion.averageAmount)}
                </p>
                <p className="mt-1 flex items-center justify-end gap-1 text-xs text-[color:rgba(43,43,43,0.45)]">
                  <Clock3 size={12} strokeWidth={1.7} />
                  {suggestion.lastUsedAt}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}
