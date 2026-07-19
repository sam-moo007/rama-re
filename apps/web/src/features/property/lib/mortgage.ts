export const EXCHANGE_RATES = {
  AED: 1.0,
  USD: 3.67,
  EUR: 4.00,
  GBP: 4.70,
};

export type Currency = keyof typeof EXCHANGE_RATES;

export type MortgageScenario = {
  delta: number;
  rate: number;
  monthly: number;
};

export function formatAsCurrency(amountAed: number, currency: Currency, locale: string): string {
  const rate = EXCHANGE_RATES[currency] || 1.0;
  const converted = amountAed / rate;
  return new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-US", {
    style: "currency",
    currency: currency,
    currencyDisplay: currency === "AED" ? "code" : "symbol",
    maximumFractionDigits: 0,
  }).format(converted);
}

export function monthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal < 0) throw new RangeError("Principal cannot be negative.");
  if (annualRate < 0) throw new RangeError("Annual rate cannot be negative.");
  if (years <= 0) throw new RangeError("Term must be greater than zero.");

  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;

  return (
    (principal * monthlyRate * (1 + monthlyRate) ** months) /
    ((1 + monthlyRate) ** months - 1)
  );
}

export function buildRateScenarios(
  priceAed: number,
  downPaymentPercent: number,
  baseRate: number,
  termYears: number,
): MortgageScenario[] {
  if (downPaymentPercent < 0 || downPaymentPercent > 100) {
    throw new RangeError("Down payment must be between 0 and 100 percent.");
  }

  const principal = priceAed * (1 - downPaymentPercent / 100);
  return [-1, 0, 1].map((delta) => {
    const rate = Math.max(0, baseRate + delta);
    return { delta, rate, monthly: monthlyPayment(principal, rate, termYears) };
  });
}

export type HoldPeriodMetrics = {
  months: number;
  mortgagePaid: number;
  serviceChargesPaid: number;
  totalExpenses: number;
};

export function calculateHoldPeriodMetrics(
  monthlyMortgagePayment: number,
  annualServiceChargeAed: number,
  holdYears: number,
): HoldPeriodMetrics {
  const months = holdYears * 12;
  const mortgagePaid = monthlyMortgagePayment * months;
  const serviceChargesPaid = annualServiceChargeAed * holdYears;
  const totalExpenses = mortgagePaid + serviceChargesPaid;
  return { months, mortgagePaid, serviceChargesPaid, totalExpenses };
}

export type YieldMetrics = {
  annualNetRent: number;
  netYieldPercent: number;
};

export function calculateYieldMetrics(
  purchasePriceAed: number,
  monthlyRentAed: number,
  vacancyRatePercent: number,
  annualServiceChargeAed: number,
): YieldMetrics {
  if (purchasePriceAed <= 0) throw new RangeError("Purchase price must be positive.");
  if (monthlyRentAed < 0) throw new RangeError("Monthly rent cannot be negative.");
  if (vacancyRatePercent < 0 || vacancyRatePercent > 100) {
    throw new RangeError("Vacancy rate must be between 0 and 100 percent.");
  }
  
  const grossAnnualRent = monthlyRentAed * 12 * (1 - vacancyRatePercent / 100);
  const annualNetRent = grossAnnualRent - annualServiceChargeAed;
  const netYieldPercent = (annualNetRent / purchasePriceAed) * 100;
  return { annualNetRent, netYieldPercent };
}
