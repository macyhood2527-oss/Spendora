"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import {
  addCategory,
  deleteCategory,
  ensureDefaultCategories,
  getCategories,
  type CategoryRecord,
} from "@/lib/db/spendora-db";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void ensureDefaultCategories();

    const subscription = liveQuery(() => getCategories()).subscribe({
      next: (nextCategories) => {
        setCategories(nextCategories);
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Failed to load categories", error);
        setCategories([]);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    categories,
    isLoading,
    addCategory,
    deleteCategory,
  };
}
