import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol: string = '৳') {
  return `${symbol}${amount.toLocaleString()}`;
}

export function formatDate(date: string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('bn-BD');
}
