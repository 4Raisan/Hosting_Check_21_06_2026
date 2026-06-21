import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function platformFeeBps() {
  const v = Number(process.env.PLATFORM_FEE_BPS ?? "2000");
  return Number.isFinite(v) ? v : 2000;
}

export function calcPlatformFeeCents(priceCents: number) {
  return Math.round((priceCents * platformFeeBps()) / 10000);
}
