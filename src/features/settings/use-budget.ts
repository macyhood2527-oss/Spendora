"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { getSetting, getSettingsByPrefix, setSetting } from "@/lib/db/spendora-db";
import {
  CATEGORY_BUDGET_PREFIX,
  MONTHLY_BUDGET_SETTING_KEY,
} from "@/features/settings/constants";

const parseBudget = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export function useBudget() {
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const [monthlySetting, categorySettings] = await Promise.all([
        getSetting(MONTHLY_BUDGET_SETTING_KEY),
        getSettingsByPrefix(CATEGORY_BUDGET_PREFIX),
      ]);

      return {
        monthlySetting,
        categorySettings,
      };
    }).subscribe({
      next: ({ monthlySetting, categorySettings }) => {
        setMonthlyBudget(parseBudget(monthlySetting?.value));
        setCategoryBudgets(
          categorySettings.reduce<Record<string, number>>((accumulator, setting) => {
            const parsed = parseBudget(setting.value);

            if (parsed !== null) {
              accumulator[setting.key.replace(CATEGORY_BUDGET_PREFIX, "")] = parsed;
            }

            return accumulator;
          }, {}),
        );
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Failed to load budget setting", error);
        setMonthlyBudget(null);
        setCategoryBudgets({});
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateMonthlyBudget = async (value: number | null) => {
    if (value === null) {
      await setSetting(MONTHLY_BUDGET_SETTING_KEY, "");
      return;
    }

    await setSetting(MONTHLY_BUDGET_SETTING_KEY, value.toFixed(2));
  };

  const updateCategoryBudget = async (
    categoryName: string,
    value: number | null,
  ) => {
    const key = `${CATEGORY_BUDGET_PREFIX}${categoryName}`;

    if (value === null) {
      await setSetting(key, "");
      return;
    }

    await setSetting(key, value.toFixed(2));
  };

  return {
    monthlyBudget,
    categoryBudgets,
    isLoading,
    updateMonthlyBudget,
    updateCategoryBudget,
  };
}
