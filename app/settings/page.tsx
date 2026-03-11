"use client";

import { createElement, useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, Download, FolderKanban, PiggyBank, Plus, Settings2, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { useToast } from "@/components/ui/toast-provider";
import { getCategoryIcon } from "@/features/expenses/icons";
import { useCategories } from "@/features/expenses/use-categories";
import { currencyOptions } from "@/features/settings/constants";
import { useBudget } from "@/features/settings/use-budget";
import { useCurrency } from "@/features/settings/use-currency";
import { exportBackup, importBackup } from "@/lib/db/spendora-db";

export default function SettingsPage() {
  const { showToast } = useToast();
  const { currency, isLoading: isCurrencyLoading, updateCurrency } = useCurrency();
  const {
    monthlyBudget,
    categoryBudgets,
    isLoading: isBudgetLoading,
    updateMonthlyBudget,
    updateCategoryBudget,
  } = useBudget();
  const {
    categories,
    isLoading: areCategoriesLoading,
    addCategory,
    deleteCategory,
  } = useCategories();
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [categoryBudgetInputs, setCategoryBudgetInputs] = useState<Record<string, string>>(
    {},
  );
  const [savingCategoryBudget, setSavingCategoryBudget] = useState<string | null>(null);
  const [categoryBudgetError, setCategoryBudgetError] = useState("");
  const [backupMessage, setBackupMessage] = useState("");
  const [backupError, setBackupError] = useState("");
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);

  useEffect(() => {
    setBudgetInput(monthlyBudget === null ? "" : String(monthlyBudget));
  }, [monthlyBudget]);

  useEffect(() => {
    setCategoryBudgetInputs((current) => {
      const next: Record<string, string> = {};

      for (const category of categories) {
        next[category.name] =
          current[category.name] ??
          (categoryBudgets[category.name] === undefined
            ? ""
            : String(categoryBudgets[category.name]));
      }

      return next;
    });
  }, [categories, categoryBudgets]);

  const handleCurrencyChange = async (nextCurrency: string) => {
    try {
      await updateCurrency(nextCurrency);
      showToast({
        tone: "success",
        title: "Currency updated",
        description: `Spendora now formats values in ${nextCurrency}.`,
      });
    } catch (error) {
      console.error("Failed to update currency", error);
      showToast({
        tone: "error",
        title: "Could not update currency",
        description: "Try again in a moment.",
      });
    }
  };

  const handleAddCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await addCategory(newCategory);
      const savedCategory = newCategory.trim();
      setNewCategory("");
      setCategoryError("");
      showToast({
        tone: "success",
        title: "Category added",
        description: `${savedCategory} is now available in your forms and filters.`,
      });
    } catch (error) {
      console.error("Failed to add category", error);
      setCategoryError("Could not save category.");
      showToast({
        tone: "error",
        title: "Could not add category",
        description: "Choose a different name or try again.",
      });
    }
  };

  const handleBudgetSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = budgetInput.trim();

    if (trimmed.length === 0) {
      setIsSavingBudget(true);

      try {
        await updateMonthlyBudget(null);
        setBudgetError("");
        showToast({
          tone: "success",
          title: "Budget cleared",
          description: "Your monthly limit has been removed.",
        });
      } catch (error) {
        console.error("Failed to clear budget", error);
        setBudgetError("Could not save budget.");
        showToast({
          tone: "error",
          title: "Could not save budget",
          description: "Try again in a moment.",
        });
      } finally {
        setIsSavingBudget(false);
      }

      return;
    }

    const parsed = Number(trimmed);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setBudgetError("Enter a valid monthly budget.");
      return;
    }

    setIsSavingBudget(true);

    try {
      await updateMonthlyBudget(parsed);
      setBudgetError("");
      showToast({
        tone: "success",
        title: "Budget saved",
        description: "Your monthly budget was updated.",
      });
    } catch (error) {
      console.error("Failed to save budget", error);
      setBudgetError("Could not save budget.");
      showToast({
        tone: "error",
        title: "Could not save budget",
        description: "Try again in a moment.",
      });
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleCategoryBudgetSave = async (categoryName: string) => {
    const trimmed = categoryBudgetInputs[categoryName]?.trim() ?? "";

    if (trimmed.length === 0) {
      setSavingCategoryBudget(categoryName);

      try {
        await updateCategoryBudget(categoryName, null);
        setCategoryBudgetError("");
        showToast({
          tone: "success",
          title: "Category budget cleared",
          description: `${categoryName} no longer has a monthly cap.`,
        });
      } catch (error) {
        console.error("Failed to clear category budget", error);
        setCategoryBudgetError("Could not save category budget.");
        showToast({
          tone: "error",
          title: "Could not save category budget",
          description: "Try again in a moment.",
        });
      } finally {
        setSavingCategoryBudget(null);
      }

      return;
    }

    const parsed = Number(trimmed);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setCategoryBudgetError("Enter a valid category budget.");
      return;
    }

    setSavingCategoryBudget(categoryName);

    try {
      await updateCategoryBudget(categoryName, parsed);
      setCategoryBudgetError("");
      showToast({
        tone: "success",
        title: "Category budget saved",
        description: `${categoryName} now has an updated monthly cap.`,
      });
    } catch (error) {
      console.error("Failed to save category budget", error);
      setCategoryBudgetError("Could not save category budget.");
      showToast({
        tone: "error",
        title: "Could not save category budget",
        description: "Try again in a moment.",
      });
    } finally {
      setSavingCategoryBudget(null);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      await deleteCategory(id);
      showToast({
        tone: "success",
        title: "Category deleted",
        description: `${name} was removed from your custom categories.`,
      });
    } catch (error) {
      console.error("Failed to delete category", error);
      showToast({
        tone: "error",
        title: "Could not delete category",
        description: error instanceof Error ? error.message : "Try again in a moment.",
      });
    }
  };

  const handleExportBackup = async () => {
    setIsExportingBackup(true);
    setBackupError("");
    setBackupMessage("");

    try {
      const backup = await exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `spendora-backup-${backup.exported_at.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setBackupMessage("Backup exported successfully.");
      showToast({
        tone: "success",
        title: "Backup exported",
        description: "Your local data was downloaded as a JSON backup.",
      });
    } catch (error) {
      console.error("Failed to export backup", error);
      setBackupError("Could not export backup.");
      showToast({
        tone: "error",
        title: "Could not export backup",
        description: "Try again in a moment.",
      });
    } finally {
      setIsExportingBackup(false);
    }
  };

  const processBackupImport = async (file: File, mode: "merge" | "replace") => {
    setIsImportingBackup(true);
    setBackupError("");
    setBackupMessage("");

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const result = await importBackup(parsed, mode);

      setBackupMessage(
        `${mode === "replace" ? "Backup restored" : "Backup merged"}: ${result.importedExpenses} expenses, ${result.importedCategories} categories, and ${result.importedSettings} settings.`,
      );
      showToast({
        tone: "success",
        title: mode === "replace" ? "Backup restored" : "Backup merged",
        description: `${result.importedExpenses} expenses and ${result.importedSettings} settings were imported.`,
      });
    } catch (error) {
      console.error("Failed to import backup", error);
      setBackupError(
        error instanceof Error ? error.message : "Could not import backup.",
      );
      showToast({
        tone: "error",
        title: mode === "replace" ? "Could not restore backup" : "Could not merge backup",
        description: error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsImportingBackup(false);
    }
  };

  const handleImportBackup = async (
    event: React.ChangeEvent<HTMLInputElement>,
    mode: "merge" | "replace",
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (mode === "replace") {
      setPendingRestoreFile(file);
      return;
    }

    await processBackupImport(file, mode);
  };

  const handleCancelRestore = () => {
    setPendingRestoreFile(null);
    showToast({
      tone: "info",
      title: "Restore cancelled",
      description: "Your current local data was left unchanged.",
    });
  };

  const handleConfirmRestore = async () => {
    if (!pendingRestoreFile) {
      return;
    }

    const file = pendingRestoreFile;
    setPendingRestoreFile(null);
    await processBackupImport(file, "replace");
  };

  return (
    <>
      <div className="space-y-6 sm:space-y-8">
      <FadeIn className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-primary)]">
          Settings
        </p>
        <h1 className="font-display text-[3rem] leading-none text-[var(--color-text)] sm:text-[3.75rem] md:text-6xl">
          Preferences and categories
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[color:rgba(43,43,43,0.72)] sm:leading-7 md:text-base">
          Keep your app preferences and category management in one clean place.
        </p>
      </FadeIn>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FadeIn delay={0.08}>
          <section className="rounded-[28px] border border-white/70 bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_18px_44px_rgba(139,94,60,0.06)] backdrop-blur sm:rounded-[34px] sm:p-6 md:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.14)]">
                <Settings2
                  size={19}
                  strokeWidth={1.5}
                  className="text-[var(--color-primary)]/80"
                />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                  Preferences
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
                  Currency
                </h2>
              </div>
            </div>

            <label className="mt-6 block text-sm font-medium text-[var(--color-text)]">
              Preferred currency
              <select
                value={currency}
                disabled={isCurrencyLoading}
                onChange={(event) => void handleCurrencyChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[rgba(139,94,60,0.12)] bg-white/92 px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-secondary)] focus:shadow-[0_0_0_4px_rgba(127,191,154,0.12)]"
              >
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} · {option.label}
                  </option>
                ))}
              </select>
            </label>

            <form className="mt-6 rounded-[26px] bg-[var(--color-background)]/72 p-4" onSubmit={handleBudgetSave}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.14)]">
                  <PiggyBank
                    size={18}
                    strokeWidth={1.5}
                    className="text-[var(--color-primary)]/80"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                    Budget
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                    Monthly budget
                  </h3>
                </div>
              </div>

              <label className="mt-4 block text-sm font-medium text-[var(--color-text)]">
                Budget amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={budgetInput}
                  disabled={isBudgetLoading || isSavingBudget}
                  onChange={(event) => setBudgetInput(event.target.value)}
                  placeholder="Set a monthly limit"
                  className="mt-2 w-full rounded-2xl border border-[rgba(139,94,60,0.12)] bg-white/92 px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[rgba(43,43,43,0.36)] focus:border-[var(--color-secondary)] focus:shadow-[0_0_0_4px_rgba(127,191,154,0.12)]"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="submit" className="px-4 py-2.5" disabled={isSavingBudget}>
                  {isSavingBudget ? "Saving..." : "Save budget"}
                </Button>
                <p className="text-sm text-[color:rgba(43,43,43,0.56)]">
                  Leave blank to remove the monthly limit.
                </p>
              </div>

              {budgetError ? (
                <p className="mt-3 text-xs text-[#a15a4b]">{budgetError}</p>
              ) : null}
            </form>
          </section>
        </FadeIn>

        <FadeIn delay={0.14}>
          <section className="rounded-[28px] border border-white/70 bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_18px_44px_rgba(139,94,60,0.06)] backdrop-blur sm:rounded-[34px] sm:p-6 md:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(200,162,124,0.16)]">
                <FolderKanban
                  size={19}
                  strokeWidth={1.5}
                  className="text-[var(--color-wood)]/80"
                />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                  Categories
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
                  Category manager
                </h2>
              </div>
            </div>

            <form className="mt-6 flex gap-2" onSubmit={handleAddCategory}>
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Add category"
                className="min-w-0 flex-1 rounded-2xl border border-[rgba(139,94,60,0.12)] bg-white/92 px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[rgba(43,43,43,0.36)] focus:border-[var(--color-secondary)] focus:shadow-[0_0_0_4px_rgba(127,191,154,0.12)]"
              />
              <button
                type="submit"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-[0_12px_22px_rgba(63,143,104,0.18)] hover:bg-[#367b59]"
                aria-label="Add category"
              >
                <Plus size={18} strokeWidth={1.5} />
              </button>
            </form>

            {categoryError ? (
              <p className="mt-2 text-xs text-[#a15a4b]">{categoryError}</p>
            ) : null}

            {categoryBudgetError ? (
              <p className="mt-2 text-xs text-[#a15a4b]">{categoryBudgetError}</p>
            ) : null}

            <div className="mt-5 grid gap-3">
              {areCategoriesLoading ? (
                <p className="text-sm text-[color:rgba(43,43,43,0.54)]">
                  Loading categories...
                </p>
              ) : null}

              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,250,247,0.74))] px-4 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.12)]">
                        {createElement(getCategoryIcon(category.name), {
                          size: 18,
                          strokeWidth: 1.5,
                          className: "text-[var(--color-primary)]/80",
                        })}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-medium text-[var(--color-text)]">
                            {category.name}
                          </span>
                          {category.locked ? (
                            <span className="rounded-full bg-[rgba(127,191,154,0.14)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-[color:rgba(43,43,43,0.48)]">
                          Optional monthly cap for this category.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={categoryBudgetInputs[category.name] ?? ""}
                        onChange={(event) =>
                          setCategoryBudgetInputs((current) => ({
                            ...current,
                            [category.name]: event.target.value,
                          }))
                        }
                        placeholder="No budget"
                        className="w-full rounded-2xl border border-[rgba(139,94,60,0.12)] bg-white/92 px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[rgba(43,43,43,0.36)] focus:border-[var(--color-secondary)] focus:shadow-[0_0_0_4px_rgba(127,191,154,0.12)] sm:w-40"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-4 py-2.5"
                        disabled={savingCategoryBudget === category.name}
                        onClick={() => void handleCategoryBudgetSave(category.name)}
                      >
                        {savingCategoryBudget === category.name ? "Saving..." : "Save"}
                      </Button>
                      {category.locked ? (
                        <div className="flex h-9 items-center text-xs font-medium text-[color:rgba(43,43,43,0.42)]">
                          Built in
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleDeleteCategory(category.id, category.name)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[color:rgba(43,43,43,0.48)] hover:bg-white hover:text-[#a15a4b]"
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      </div>

      <FadeIn delay={0.2}>
        <section className="rounded-[28px] border border-white/70 bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_18px_44px_rgba(139,94,60,0.06)] backdrop-blur sm:rounded-[34px] sm:p-6 md:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(127,191,154,0.14)]">
              <Download
                size={19}
                strokeWidth={1.5}
                className="text-[var(--color-primary)]/80"
              />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                Backup
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
                Export and restore
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <section className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,250,247,0.76))] p-5">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Export backup
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                Save all local expenses, categories, and settings into one JSON file.
              </p>
              <Button
                type="button"
                className="mt-4 w-full justify-center gap-2"
                disabled={isExportingBackup}
                onClick={handleExportBackup}
              >
                <Download size={16} strokeWidth={1.7} />
                {isExportingBackup ? "Exporting..." : "Download backup"}
              </Button>
            </section>

            <section className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,250,247,0.76))] p-5">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Merge backup
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                Bring backup data into the current app without clearing what is already here.
              </p>
              <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(63,143,104,0.24)] hover:-translate-y-0.5 hover:bg-[#367b59]">
                <Upload size={16} strokeWidth={1.7} />
                {isImportingBackup ? "Importing..." : "Import and merge"}
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  disabled={isImportingBackup}
                  onChange={(event) => void handleImportBackup(event, "merge")}
                />
              </label>
            </section>

            <section className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,250,247,0.76))] p-5">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Replace with backup
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                Restore a backup and replace the current local data on this device.
              </p>
              <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--color-wood)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(139,94,60,0.14)] hover:-translate-y-0.5 hover:bg-[#765033]">
                <Upload size={16} strokeWidth={1.7} />
                {isImportingBackup ? "Importing..." : "Restore backup"}
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  disabled={isImportingBackup}
                  onChange={(event) => void handleImportBackup(event, "replace")}
                />
              </label>
            </section>
          </div>

          {backupMessage ? (
            <p className="mt-4 text-sm text-[var(--color-primary)]">{backupMessage}</p>
          ) : null}

          {backupError ? (
            <p className="mt-4 text-sm text-[#a15a4b]">{backupError}</p>
          ) : null}
        </section>
      </FadeIn>
      </div>

      {pendingRestoreFile ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(43,43,43,0.28)] px-0 py-0 sm:items-center sm:px-6 sm:py-6">
          <div className="w-full max-w-lg rounded-t-[30px] border border-white/70 bg-[rgba(255,255,255,0.96)] p-4 shadow-[0_30px_60px_rgba(139,94,60,0.12)] backdrop-blur sm:rounded-[30px] sm:p-6">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[rgba(139,94,60,0.16)] sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(200,162,124,0.18)]">
                  <AlertTriangle size={18} strokeWidth={1.5} className="text-[var(--color-wood)]/85" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-wood)]">
                    Restore backup
                  </p>
                  <h2 className="mt-2 font-display text-[1.9rem] leading-none text-[var(--color-text)] sm:text-[2.6rem]">
                    Replace current local data?
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelRestore}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(250,250,247,0.95)] hover:bg-white"
                aria-label="Close restore dialog"
              >
                <X size={18} strokeWidth={1.5} className="text-[var(--color-primary)]/80" />
              </button>
            </div>

            <div className="mt-6 rounded-[24px] bg-[var(--color-background)]/86 p-4">
              <p className="text-base font-semibold text-[var(--color-text)]">
                {pendingRestoreFile.name}
              </p>
              <p className="mt-1 text-sm text-[color:rgba(43,43,43,0.62)]">
                This will overwrite the current expenses, categories, and settings stored on this device.
              </p>
            </div>

            <p className="mt-4 text-sm leading-6 text-[color:rgba(43,43,43,0.62)]">
              This action cannot be undone. Export a backup first if you want to keep the current local data before restoring this file.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={handleCancelRestore} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isImportingBackup}
                onClick={() => void handleConfirmRestore()}
                className="w-full bg-[var(--color-wood)] hover:bg-[#765033] sm:w-auto"
              >
                {isImportingBackup ? "Restoring..." : "Restore backup"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
