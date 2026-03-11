"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { DEFAULT_CURRENCY, CURRENCY_SETTING_KEY } from "@/features/settings/constants";
import { getSetting, setSetting } from "@/lib/db/spendora-db";

export function useCurrency() {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = liveQuery(() => getSetting(CURRENCY_SETTING_KEY)).subscribe({
      next: (setting) => {
        setCurrencyState(setting?.value ?? DEFAULT_CURRENCY);
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Failed to load currency setting", error);
        setCurrencyState(DEFAULT_CURRENCY);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateCurrency = async (nextCurrency: string) => {
    await setSetting(CURRENCY_SETTING_KEY, nextCurrency);
  };

  return {
    currency,
    isLoading,
    updateCurrency,
  };
}
