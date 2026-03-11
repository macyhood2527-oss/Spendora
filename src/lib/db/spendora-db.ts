import Dexie, { type Table } from "dexie";

import type {
  CategoryRecord,
  ExpenseRecord,
  NewExpenseInput,
  SettingRecord,
  UpdateExpenseInput,
} from "@/lib/db/types";
import { expenseCategories } from "@/features/expenses/constants";

const SPENDORA_DB_NAME = "spendora";

class SpendoraDatabase extends Dexie {
  expenses!: Table<ExpenseRecord, string>;
  categories!: Table<CategoryRecord, string>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super(SPENDORA_DB_NAME);

    this.version(1).stores({
      expenses: "id, category, date, created_at",
      categories: "id, name, created_at",
      settings: "key, updated_at",
    });

    this.version(2).stores({
      expenses: "id, category, date, created_at",
      categories: "id, name, locked, created_at",
      settings: "key, updated_at",
    });

    this.version(3).stores({
      expenses: "id, merchant, category, date, created_at",
      categories: "id, name, locked, created_at",
      settings: "key, updated_at",
    });
  }
}

export const db = new SpendoraDatabase();
const BACKUP_VERSION = 1;

const categoryAliases: Record<string, string> = {
  "food/dining": "Food & Dining",
  dining: "Food & Dining",
  coffee: "Food & Dining",
  transport: "Transportation",
  wellness: "Health & Fitness",
  home: "Bills & Utilities",
  others: "Other",
};

const canonicalizeCategoryName = (name: string) => {
  const trimmedName = name.trim();

  return categoryAliases[trimmedName.toLowerCase()] ?? trimmedName;
};

const createExpenseRecord = (input: NewExpenseInput): ExpenseRecord => ({
  id: input.id ?? crypto.randomUUID(),
  amount: input.amount,
  merchant: input.merchant?.trim() || undefined,
  category: canonicalizeCategoryName(input.category),
  date: input.date,
  note: input.note?.trim() || undefined,
  created_at: input.created_at ?? new Date().toISOString(),
});

export type SpendoraBackup = {
  app: "spendora";
  version: number;
  exported_at: string;
  data: {
    expenses: ExpenseRecord[];
    categories: CategoryRecord[];
    settings: SettingRecord[];
  };
};

function isExpenseRecord(value: unknown): value is ExpenseRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<ExpenseRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.amount === "number" &&
    typeof record.category === "string" &&
    typeof record.date === "string" &&
    typeof record.created_at === "string"
  );
}

function isCategoryRecord(value: unknown): value is CategoryRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<CategoryRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.created_at === "string"
  );
}

function isSettingRecord(value: unknown): value is SettingRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<SettingRecord>;
  return (
    typeof record.key === "string" &&
    typeof record.value === "string" &&
    typeof record.updated_at === "string"
  );
}

function normalizeBackup(input: unknown): SpendoraBackup {
  if (!input || typeof input !== "object") {
    throw new Error("Backup file is not a valid object.");
  }

  const candidate = input as Partial<SpendoraBackup>;
  const data = candidate.data;

  if (
    candidate.app !== "spendora" ||
    typeof candidate.version !== "number" ||
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.expenses) ||
    !Array.isArray(data.categories) ||
    !Array.isArray(data.settings)
  ) {
    throw new Error("Backup file does not match Spendora's format.");
  }

  if (!data.expenses.every(isExpenseRecord)) {
    throw new Error("Backup expenses are malformed.");
  }

  if (!data.categories.every(isCategoryRecord)) {
    throw new Error("Backup categories are malformed.");
  }

  if (!data.settings.every(isSettingRecord)) {
    throw new Error("Backup settings are malformed.");
  }

  return {
    app: "spendora",
    version: candidate.version,
    exported_at:
      typeof candidate.exported_at === "string"
        ? candidate.exported_at
        : new Date().toISOString(),
    data: {
      expenses: data.expenses.map((expense) => ({
        ...expense,
        merchant: expense.merchant?.trim() || undefined,
        note: expense.note?.trim() || undefined,
        category: canonicalizeCategoryName(expense.category),
      })),
      categories: data.categories.map((category) => ({
        ...category,
        name: canonicalizeCategoryName(category.name),
      })),
      settings: data.settings,
    },
  };
}

export const addExpense = async (input: NewExpenseInput) => {
  const expense = createExpenseRecord(input);

  await db.expenses.add(expense);

  return expense;
};

export const getExpenses = async () =>
  db.expenses.orderBy("date").reverse().toArray();

export const exportBackup = async (): Promise<SpendoraBackup> => {
  const [expenses, categories, settings] = await Promise.all([
    db.expenses.toArray(),
    db.categories.toArray(),
    db.settings.toArray(),
  ]);

  return {
    app: "spendora",
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    data: {
      expenses,
      categories,
      settings,
    },
  };
};

export const importBackup = async (
  rawBackup: unknown,
  mode: "merge" | "replace",
) => {
  const backup = normalizeBackup(rawBackup);

  await db.transaction("rw", db.expenses, db.categories, db.settings, async () => {
    if (mode === "replace") {
      await Promise.all([
        db.expenses.clear(),
        db.categories.clear(),
        db.settings.clear(),
      ]);
    }

    await db.expenses.bulkPut(backup.data.expenses);
    await db.categories.bulkPut(backup.data.categories);
    await db.settings.bulkPut(backup.data.settings);
  });

  await ensureDefaultCategories();

  return {
    importedExpenses: backup.data.expenses.length,
    importedCategories: backup.data.categories.length,
    importedSettings: backup.data.settings.length,
    mode,
  };
};

export const deleteExpense = async (id: string) => db.expenses.delete(id);

export const updateExpense = async (
  id: string,
  changes: UpdateExpenseInput,
) => {
  await db.expenses.update(id, {
    ...changes,
    merchant:
      changes.merchant !== undefined ? changes.merchant.trim() || undefined : changes.merchant,
    note: changes.note !== undefined ? changes.note.trim() || undefined : changes.note,
    category: changes.category
      ? canonicalizeCategoryName(changes.category)
      : changes.category,
  });

  return db.expenses.get(id);
};

export const getSetting = async (key: string) => db.settings.get(key);

export const getSettingsByPrefix = async (prefix: string) =>
  db.settings
    .filter((setting) => setting.key.startsWith(prefix))
    .toArray();

export const setSetting = async (key: string, value: string) => {
  const setting: SettingRecord = {
    key,
    value,
    updated_at: new Date().toISOString(),
  };

  await db.settings.put(setting);

  return setting;
};

export const getCategories = async () => db.categories.orderBy("name").toArray();

export const addCategory = async (name: string) => {
  const normalizedName = canonicalizeCategoryName(name);

  if (!normalizedName) {
    throw new Error("Category name is required");
  }

  const existingCategory = await db.categories
    .filter(
      (category) => category.name.toLowerCase() === normalizedName.toLowerCase(),
    )
    .first();

  if (existingCategory) {
    return existingCategory;
  }

  const category: CategoryRecord = {
    id: crypto.randomUUID(),
    name: normalizedName,
    locked: false,
    created_at: new Date().toISOString(),
  };

  await db.categories.add(category);

  return category;
};

export const deleteCategory = async (id: string) => {
  const category = await db.categories.get(id);

  if (!category) {
    return;
  }

  if (category.locked) {
    throw new Error("Default categories cannot be deleted");
  }

  await db.categories.delete(id);
};

export const ensureDefaultCategories = async () => {
  await db.transaction("rw", db.categories, db.expenses, async () => {
    const existingCategories = await db.categories.toArray();

    for (const category of existingCategories) {
      const canonicalName = canonicalizeCategoryName(category.name);

      if (canonicalName !== category.name) {
        await db.categories.update(category.id, {
          name: canonicalName,
          locked: expenseCategories.includes(canonicalName),
        });
      }

      const expensesToUpdate = await db.expenses
        .filter((expense) => expense.category === category.name)
        .toArray();

      await Promise.all(
        expensesToUpdate.map((expense) =>
          db.expenses.update(expense.id, { category: canonicalName }),
        ),
      );
    }

    const normalizedCategories = await db.categories.toArray();
    const categoriesByName = new Map<string, CategoryRecord>();

    for (const category of normalizedCategories) {
      const key = category.name.toLowerCase();
      const existing = categoriesByName.get(key);

      if (!existing) {
        categoriesByName.set(key, category);
        continue;
      }

      const keepCurrent =
        Boolean(category.locked) && !existing.locked
          ? category
          : existing;
      const removeCurrent = keepCurrent.id === category.id ? existing : category;

      await db.categories.update(keepCurrent.id, {
        name: canonicalizeCategoryName(keepCurrent.name),
        locked: expenseCategories.includes(canonicalizeCategoryName(keepCurrent.name)),
      });
      await db.categories.delete(removeCurrent.id);

      categoriesByName.set(key, keepCurrent);
    }

    const refreshedCategories = await db.categories.toArray();

    for (const defaultCategoryName of expenseCategories) {
      const existingCategory = refreshedCategories.find(
        (category) =>
          category.name.toLowerCase() === defaultCategoryName.toLowerCase(),
      );

      if (existingCategory) {
        if (!existingCategory.locked) {
          await db.categories.update(existingCategory.id, { locked: true });
        }
        continue;
      }

      await db.categories.add({
        id: crypto.randomUUID(),
        name: defaultCategoryName,
        locked: true,
        created_at: new Date().toISOString(),
      });
    }
  });
};

export type {
  CategoryRecord,
  ExpenseRecord,
  NewExpenseInput,
  SettingRecord,
  UpdateExpenseInput,
};
