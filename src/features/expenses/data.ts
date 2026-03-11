export type CategorySpending = {
  name: string;
  value: number;
};

export type MonthlyTrendPoint = {
  month: string;
  amount: number;
};

export const summaryCards = [
  {
    label: "Essentials",
    value: "$672",
    detail: "Groceries, home basics, and transport kept steady.",
  },
  {
    label: "Lifestyle",
    value: "$418",
    detail: "Dining, coffee, and little comfort purchases.",
  },
  {
    label: "Average spend",
    value: "$49.42",
    detail: "Per recorded expense this month.",
  },
  {
    label: "Most active category",
    value: "Groceries",
    detail: "Leading category for the last four weeks.",
  },
];

export const categorySpending: CategorySpending[] = [
  { name: "Groceries", value: 420 },
  { name: "Dining", value: 280 },
  { name: "Home", value: 215 },
  { name: "Coffee", value: 145 },
  { name: "Wellness", value: 110 },
];

export const monthlyTrend: MonthlyTrendPoint[] = [
  { month: "Oct", amount: 980 },
  { month: "Nov", amount: 1120 },
  { month: "Dec", amount: 1325 },
  { month: "Jan", amount: 1040 },
  { month: "Feb", amount: 1188 },
  { month: "Mar", amount: 1482 },
];
