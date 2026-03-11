"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { getExpenses, type ExpenseRecord } from "@/lib/db/spendora-db";

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = liveQuery(() => getExpenses()).subscribe({
      next: (nextExpenses) => {
        setExpenses(nextExpenses);
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Failed to load expenses", error);
        setExpenses([]);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    expenses,
    isLoading,
  };
}
