import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Car,
  CircleEllipsis,
  Film,
  HeartPulse,
  Plane,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Utensils,
} from "lucide-react";

const categoryIconMap: Record<string, LucideIcon> = {
  "food & dining": Utensils,
  food: Utensils,
  dining: Utensils,
  groceries: ShoppingCart,
  shopping: ShoppingBag,
  transportation: Car,
  transport: Car,
  entertainment: Film,
  "bills & utilities": Receipt,
  "health & fitness": HeartPulse,
  travel: Plane,
  education: BookOpen,
  other: CircleEllipsis,
};

export const getCategoryIcon = (category: string): LucideIcon =>
  categoryIconMap[category.trim().toLowerCase()] ?? Receipt;
