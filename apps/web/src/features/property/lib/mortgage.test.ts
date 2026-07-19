import { describe, expect, it } from "vitest";

import {
  buildRateScenarios,
  monthlyPayment,
  formatAsCurrency,
  calculateHoldPeriodMetrics,
  calculateYieldMetrics,
} from "./mortgage";

describe("deterministic mortgage calculation", () => {
  it("handles a zero-rate loan without division by zero", () => {
    expect(monthlyPayment(1_200_000, 0, 25)).toBe(4_000);
  });

  it("produces ordered minus/base/plus rate scenarios", () => {
    const scenarios = buildRateScenarios(1_800_000, 20, 4.75, 25);

    expect(scenarios.map(({ delta }) => delta)).toEqual([-1, 0, 1]);
    expect(scenarios[0]!.monthly).toBeLessThan(scenarios[1]!.monthly);
    expect(scenarios[1]!.monthly).toBeLessThan(scenarios[2]!.monthly);
    expect(Math.round(scenarios[1]!.monthly)).toBe(8_210);
  });

  it("rejects impossible inputs instead of inventing a result", () => {
    expect(() => buildRateScenarios(1_800_000, 120, 4.75, 25)).toThrow(RangeError);
    expect(() => monthlyPayment(1_000_000, 4.75, 0)).toThrow(RangeError);
  });

  it("formats currency values correctly by locale and FX rate", () => {
    // AED to AED (rate 1.0)
    expect(formatAsCurrency(1000, "AED", "en")).toContain("AED");
    expect(formatAsCurrency(1000, "AED", "en")).toContain("1,000");

    // AED to USD (rate 3.67) -> ~272 USD
    expect(formatAsCurrency(1000, "USD", "en")).toContain("$272");

    // Arabic locale
    const formattedAr = formatAsCurrency(1000, "AED", "ar");
    expect(formattedAr.includes("د.إ") || formattedAr.includes("AED")).toBe(true);
  });

  it("calculates hold period metrics accurately", () => {
    const metrics = calculateHoldPeriodMetrics(5000, 12000, 5);
    expect(metrics.months).toBe(60);
    expect(metrics.mortgagePaid).toBe(300_000);
    expect(metrics.serviceChargesPaid).toBe(60_000);
    expect(metrics.totalExpenses).toBe(360_000);
  });

  it("calculates yield metrics accurately", () => {
    // Price = 1,000,000, Monthly Rent = 5,000, Vacancy = 5%, Service Charge = 12,000
    // Gross annual = 5,000 * 12 * 0.95 = 57,000
    // Net annual = 57,000 - 12,000 = 45,000
    // Yield = (45,000 / 1,000,000) * 100 = 4.5%
    const metrics = calculateYieldMetrics(1_000_000, 5_000, 5, 12_000);
    expect(metrics.annualNetRent).toBe(45_000);
    expect(metrics.netYieldPercent).toBe(4.5);
  });

  it("rejects invalid inputs for yield metrics", () => {
    expect(() => calculateYieldMetrics(0, 5000, 5, 12000)).toThrow(RangeError);
    expect(() => calculateYieldMetrics(100000, -100, 5, 12000)).toThrow(RangeError);
    expect(() => calculateYieldMetrics(100000, 5000, 105, 12000)).toThrow(RangeError);
  });
});
