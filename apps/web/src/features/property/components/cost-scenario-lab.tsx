"use client";

import { Calculator, Info, Landmark, Percent, CalendarRange, Coins } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";

import {
  buildRateScenarios,
  formatAsCurrency,
  calculateHoldPeriodMetrics,
  calculateYieldMetrics,
  EXCHANGE_RATES,
  type Currency,
} from "../lib/mortgage";
import { defaultCostAssumptions } from "@/data/cost-assumptions";

type CostScenarioLabProps = {
  locale: Locale;
  priceAed: number;
  annualServiceChargeAed: number;
};

export function CostScenarioLab({ locale, priceAed, annualServiceChargeAed }: CostScenarioLabProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [baseRate, setBaseRate] = useState(4.75);
  const [termYears, setTermYears] = useState(25);
  const [currency, setCurrency] = useState<Currency>("AED");
  const [holdYears, setHoldYears] = useState(5);
  const [monthlyRentAed, setMonthlyRentAed] = useState(12000);
  const [vacancyRate, setVacancyRate] = useState(5);

  const scenarios = useMemo(() => {
    return buildRateScenarios(priceAed, downPaymentPercent, baseRate, termYears);
  }, [baseRate, downPaymentPercent, priceAed, termYears]);

  const baseMonthlyPaymentAed = useMemo(() => {
    const baseScenario = scenarios.find((s) => s.delta === 0);
    return baseScenario ? baseScenario.monthly : 0;
  }, [scenarios]);

  const holdPeriodMetrics = useMemo(() => {
    return calculateHoldPeriodMetrics(baseMonthlyPaymentAed, annualServiceChargeAed, holdYears);
  }, [baseMonthlyPaymentAed, annualServiceChargeAed, holdYears]);

  const yieldMetrics = useMemo(() => {
    return calculateYieldMetrics(priceAed, monthlyRentAed, vacancyRate, annualServiceChargeAed);
  }, [priceAed, monthlyRentAed, vacancyRate, annualServiceChargeAed]);

  const displayedRentValue = Math.round(monthlyRentAed / EXCHANGE_RATES[currency]);

  const handleRentChange = (value: number) => {
    setMonthlyRentAed(Math.round(value * EXCHANGE_RATES[currency]));
  };

  return (
    <div className="scenarioLab space-y-6">
      {/* Scope Styles */}
      <style>{`
        .labSectionHeader {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text, #383531);
          border-bottom: 1px solid var(--color-border, #D4CEC5);
          padding-bottom: 6px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .metricsGrid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 768px) {
          .metricsGrid {
            grid-template-columns: 1fr;
          }
        }
        .metricCard {
          background: transparent;
          border-top: 1px solid var(--color-border, #D4CEC5);
          padding-block: 18px;
        }
        .metricRow {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          padding-block: 6px;
          border-bottom: 1px dashed var(--color-border, #D4CEC5);
        }
        .metricRow:last-child {
          border-bottom: 0;
        }
        .metricValue {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: var(--color-ink, #171717);
        }
      `}</style>

      {/* Group 0: Cost Assumptions */}
      <div>
        <h4 className="labSectionHeader">
          <Info size={14} />
          {locale === "ar" ? "الافتراضات الأساسية" : "Baseline Assumptions"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {defaultCostAssumptions.map((assumption) => (
            <div key={assumption.id} className="py-4 border-t border-line flex flex-col gap-1.5">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-ink">{assumption.label[locale]}</span>
                <span className={`text-[10px] uppercase px-2 py-0.5 font-bold ${assumption.type === 'fixed' ? 'bg-ink text-white' : 'bg-surface-subtle text-muted border border-border'}`}>
                  {assumption.type === 'fixed' ? (locale === "ar" ? "ثابت" : "Fixed") : (locale === "ar" ? "تقديري" : "Estimated")}
                </span>
              </div>
              <span className="text-xs text-text">{assumption.description[locale]}</span>
              <span className="text-xl font-mono font-bold text-ink mt-2">{assumption.valuePercentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Group 1: Mortgage Inputs */}
      <div>
        <h4 className="labSectionHeader">
          <Landmark size={14} />
          {locale === "ar" ? "إعدادات التمويل العقاري" : "Mortgage Settings"}
        </h4>
        <div className="scenarioInputs">
          <label>
            <span>{locale === "ar" ? "الدفعة المقدمة" : "Down payment"}</span>
            <span className="inputWithSuffix">
              <Input
                max="80"
                min="5"
                onChange={(event) => setDownPaymentPercent(Math.min(100, Math.max(0, Number(event.target.value))))}
                type="number"
                value={downPaymentPercent}
              />
              <b>%</b>
            </span>
          </label>
          <label>
            <span>{locale === "ar" ? "معدل الأساس" : "Base rate"}</span>
            <span className="inputWithSuffix">
              <Input
                max="20"
                min="0"
                onChange={(event) => setBaseRate(Math.max(0, Number(event.target.value)))}
                step="0.05"
                type="number"
                value={baseRate}
              />
              <b>%</b>
            </span>
          </label>
          <label>
            <span>{locale === "ar" ? "المدة" : "Term"}</span>
            <span className="inputWithSuffix">
              <Input
                max="25"
                min="1"
                onChange={(event) => setTermYears(Math.max(1, Number(event.target.value)))}
                type="number"
                value={termYears}
              />
              <b>{locale === "ar" ? "سنة" : "yr"}</b>
            </span>
          </label>
        </div>
      </div>

      {/* Group 2: Currency & Hold Inputs */}
      <div>
        <h4 className="labSectionHeader">
          <CalendarRange size={14} />
          {locale === "ar" ? "السيناريو وخيارات العائد" : "Scenario & Return Options"}
        </h4>
        <div className="scenarioInputs grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">{locale === "ar" ? "عرض العملة" : "Display Currency"}</span>
            <Select value={currency} onValueChange={(val) => { if (val) setCurrency(val); }}>
              <SelectTrigger className="h-10 w-full border border-line bg-transparent px-3 text-xs rounded-none">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">{locale === "ar" ? "فترة الاحتفاظ" : "Holding Period"}</span>
            <Select value={String(holdYears)} onValueChange={(val) => setHoldYears(Number(val))}>
              <SelectTrigger className="h-10 w-full border border-line bg-transparent px-3 text-xs rounded-none">
                <SelectValue placeholder="Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">{locale === "ar" ? "٣ سنوات" : "3 years"}</SelectItem>
                <SelectItem value="5">{locale === "ar" ? "٥ سنوات" : "5 years"}</SelectItem>
                <SelectItem value="10">{locale === "ar" ? "١٠ سنوات" : "10 years"}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label>
            <span>{locale === "ar" ? "الإيجار الشهري المتوقع" : "Expected monthly rent"}</span>
            <span className="inputWithSuffix">
              <Input
                min="0"
                onChange={(event) => handleRentChange(Math.max(0, Number(event.target.value)))}
                type="number"
                value={displayedRentValue}
              />
              <b>{currency}</b>
            </span>
          </label>

          <label>
            <span>{locale === "ar" ? "نسبة الشواغر المتوقعة" : "Expected vacancy rate"}</span>
            <span className="inputWithSuffix">
              <Input
                max="100"
                min="0"
                onChange={(event) => setVacancyRate(Math.min(100, Math.max(0, Number(event.target.value))))}
                type="number"
                value={vacancyRate}
              />
              <b>%</b>
            </span>
          </label>
        </div>
      </div>

      {/* Mortgage Monthly Payments */}
      <div>
        <h4 className="labSectionHeader">
          <Coins size={14} />
          {locale === "ar" ? "سيناريوهات القسط الشهري للتمويل" : "Monthly Mortgage Scenarios"}
        </h4>
        <div className="scenarioResults">
          {scenarios.map((scenario) => (
            <div className={scenario.delta === 0 ? "scenarioCard active" : "scenarioCard"} key={scenario.delta}>
              <span>
                {scenario.delta === 0
                  ? locale === "ar"
                    ? "معدل الأساس"
                    : "Base rate"
                  : `${scenario.delta > 0 ? "+" : ""}${scenario.delta}%`}
              </span>
              <strong className="text-xl">
                {formatAsCurrency(Math.round(scenario.monthly), currency, locale)}
              </strong>
              <small>
                {locale === "ar" ? "شهرياً · تقديري" : "monthly · indicative"} · {scenario.rate.toFixed(2)}%
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* Hold & Net Yield Metrics */}
      <div className="metricsGrid">
        {/* Hold Period Box */}
        <div className="metricCard">
          <h5 className="font-bold text-sm mb-3 text-ink">
            {locale === "ar"
              ? `توقعات فترة الاحتفاظ (${holdYears} سنوات)`
              : `Holding Period Outlook (${holdYears} yrs)`}
          </h5>
          <div className="space-y-1">
            <div className="metricRow">
              <span>{locale === "ar" ? "إجمالي أقساط التمويل" : "Cumulative Mortgage Paid"}</span>
              <span className="metricValue">
                {formatAsCurrency(holdPeriodMetrics.mortgagePaid, currency, locale)}
              </span>
            </div>
            <div className="metricRow">
              <span>{locale === "ar" ? "رسوم الخدمات المتراكمة" : "Cumulative Service Charges"}</span>
              <span className="metricValue">
                {formatAsCurrency(holdPeriodMetrics.serviceChargesPaid, currency, locale)}
              </span>
            </div>
            <div className="metricRow font-bold pt-2 border-t border-line-strong">
              <span>{locale === "ar" ? "إجمالي المصاريف الجارية" : "Total Carrying Cost"}</span>
              <span className="metricValue">
                {formatAsCurrency(holdPeriodMetrics.totalExpenses, currency, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Yield Box */}
        <div className="metricCard">
          <h5 className="font-bold text-sm mb-3 text-ink">
            {locale === "ar" ? "العائد الاستثماري المتوقع" : "Rental Yield Projection"}
          </h5>
          <div className="space-y-1">
            <div className="metricRow">
              <span>{locale === "ar" ? "صافي الدخل الإيجاري السنوي" : "Annual Net Rental Income"}</span>
              <span className="metricValue">
                {formatAsCurrency(yieldMetrics.annualNetRent, currency, locale)}
              </span>
            </div>
            <div className="metricRow">
              <span>{locale === "ar" ? "رسوم الخدمات السنوية" : "Annual Service Charges"}</span>
              <span className="metricValue">
                {formatAsCurrency(annualServiceChargeAed, currency, locale)}
              </span>
            </div>
            <div className="metricRow font-bold pt-2 border-t border-line-strong">
              <span>{locale === "ar" ? "نسبة العائد الصافي" : "Estimated Net Yield"}</span>
              <span className="metricValue text-copper">
                {new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-US", {
                  style: "percent",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(yieldMetrics.netYieldPercent / 100)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="calculationGuardrail">
        <Calculator aria-hidden="true" size={16} />
        <span>
          {locale === "ar"
            ? "حساب حتمي بالإصدار ٠٫٢. لا يمثل موافقة ائتمانية أو وعداً بالعائد."
            : "Deterministic calculation v0.2. This is not mortgage approval or guaranteed returns."}
        </span>
        <Info aria-hidden="true" size={15} />
      </p>
    </div>
  );
}
