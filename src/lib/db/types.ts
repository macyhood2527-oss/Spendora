export type ExpenseRecord = {
  id: string;
  amount: number;
  merchant?: string;
  category: string;
  date: string;
  note?: string;
  created_at: string;
};

export type NewExpenseInput = {
  amount: number;
  merchant?: string;
  category: string;
  date: string;
  note?: string;
  id?: string;
  created_at?: string;
};

export type UpdateExpenseInput = Partial<
  Pick<ExpenseRecord, "amount" | "merchant" | "category" | "date" | "note">
>;

export type CategoryRecord = {
  id: string;
  name: string;
  locked?: boolean;
  created_at: string;
};

export type SettingRecord = {
  key: string;
  value: string;
  updated_at: string;
};
