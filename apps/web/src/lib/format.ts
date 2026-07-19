import type { Locale } from "./i18n";

export const formatAed = (amount: number, locale: Locale): string =>
  new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    style: "currency",
    currency: "AED",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (value: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
