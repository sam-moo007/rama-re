"use client";

import { use, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calculator, HelpCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";

export default function CostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = use(params);
  const locale: Locale = isLocale(value) ? (value as Locale) : "en";
  const isAr = locale === "ar";

  const [propertyValue, setPropertyValue] = useState(2500000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(25);
  const [serviceChargePerSqFt, setServiceChargePerSqFt] = useState(16);
  const [propertyAreaSqFt, setPropertyAreaSqFt] = useState(1350);

  const downPayment = propertyValue * (downPaymentPct / 100);
  const loanAmount = propertyValue - downPayment;
  
  // Monthly mortgage calculation
  const r = interestRate / 100 / 12;
  const n = loanTerm * 12;
  const monthlyMortgage = loanAmount > 0 && r > 0 ? loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;

  // At Reservation
  const reservationDeposit = Math.min(propertyValue * 0.1, 50000);

  // At Transfer Fees
  const dldFee = propertyValue * 0.04;
  const dldAdminFee = 580;
  const trusteeFee = 4200;
  const agencyFee = (propertyValue * 0.02) * 1.05;
  const mortgageRegFee = loanAmount > 0 ? (loanAmount * 0.0025) + 290 : 0;
  const totalTransferFees = dldFee + dldAdminFee + trusteeFee + agencyFee + mortgageRegFee;

  // Upfront cash required total
  const totalUpfrontCash = downPayment + totalTransferFees;

  // Annual Ownership Costs
  const annualServiceCharge = propertyAreaSqFt * serviceChargePerSqFt;
  const annualInsurance = propertyValue * 0.001;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalAnnualOwnership = annualServiceCharge + annualInsurance;

  // Percentage of total for visual bar fills
  const dldPct = Math.round((dldFee / totalUpfrontCash) * 100);
  const agencyPct = Math.round((agencyFee / totalUpfrontCash) * 100);

  return (
    <div className="min-h-screen bg-[var(--limestone)]" style={{ color: 'var(--ink)' }} dir={isAr ? "rtl" : "ltr"}>
      <AppHeader locale={locale} />
      
      <main>
        <Container size="wide" className="py-10 lg:py-14">
          {/* Page Header — Enhanced with overline and luxury divider */}
          <div className="mb-12 space-y-4 pb-8 relative">
            <div className="luxury-divider" style={{ margin: '0 0 32px', maxWidth: '80px', marginBlock: '0 32px' }} />
            <p className="section-overline">
              {isAr ? "أداة مالية" : "Financial Tool"}
            </p>
            <h1 className="text-heading reveal-up">
              <BlurFade delay={0.1} inView>
                {isAr ? "حاسبة تكاليف الشراء الكاملة" : "Complete buying cost calculator"}
              </BlurFade>
            </h1>
            <p className="text-body max-w-2xl reveal-up delay-100">
              {isAr 
                ? "تفاصيل واضحة لجميع التكاليف الأولية والرسوم الحكومية ورسوم الصيانة السنوية."
                : "Clear breakdown of upfront fees, government charges, and annual service charges."}
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Controls Form — Premium styled */}
            <div className="lg:col-span-5 space-y-6 reveal-up delay-200">
              <MagicCard className="p-7" gradientColor="var(--copper-tint)">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--copper-dark)] mb-6 flex items-center gap-2">
                  <Calculator className="size-4" />
                  {isAr ? "معطيات العقار والتمويل" : "Property & financing parameters"}
                </h2>
                <p className="text-caption mb-6">
                  {isAr ? "عدّل القيم لتحديث حساب التكاليف فوراً" : "Adjust amounts to refresh all stages instantly"}
                </p>
                <div className="space-y-7">
                  {/* Property Price — Premium slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <Label className="font-semibold text-ink text-xs uppercase tracking-wider">{isAr ? "سعر العقار" : "Property price"}</Label>
                      <span className="font-mono font-bold text-[var(--copper-dark)] text-sm">AED {propertyValue.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range"
                      className="premium-slider w-full cursor-pointer"
                      min={500000} 
                      max={15000000} 
                      step={100000} 
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(Number(e.target.value))} 
                    />
                    <div className="flex justify-between text-[10px] text-[var(--ink-muted)] font-mono">
                      <span>AED 500K</span>
                      <span>AED 15M</span>
                    </div>
                  </div>

                  {/* Down Payment % — Premium slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <Label className="font-semibold text-ink text-xs uppercase tracking-wider">{isAr ? "الدفعة الأولى" : "Down payment"}</Label>
                      <span className="font-mono font-bold text-[var(--copper-dark)] text-sm">{downPaymentPct}% (AED {downPayment.toLocaleString()})</span>
                    </div>
                    <input 
                      type="range"
                      className="premium-slider w-full cursor-pointer"
                      min={15} 
                      max={80} 
                      step={5} 
                      value={downPaymentPct}
                      onChange={(e) => setDownPaymentPct(Number(e.target.value))} 
                    />
                    <div className="flex justify-between text-[10px] text-[var(--ink-muted)] font-mono">
                      <span>15%</span>
                      <span>80%</span>
                    </div>
                  </div>

                  {/* Interest Rate & Term */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--line)]">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-ink uppercase tracking-wider">{isAr ? "نسبة الفائدة (%)" : "Interest rate (%)"}</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        className="font-mono text-sm border-[var(--line-strong)] focus:border-[var(--copper)]" 
                        value={interestRate} 
                        onChange={(e) => setInterestRate(Number(e.target.value))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-ink uppercase tracking-wider">{isAr ? "مدة القرض (سنوات)" : "Loan term (years)"}</Label>
                      <Input 
                        type="number" 
                        className="font-mono text-sm border-[var(--line-strong)] focus:border-[var(--copper)]" 
                        value={loanTerm} 
                        onChange={(e) => setLoanTerm(Number(e.target.value))} 
                      />
                    </div>
                  </div>

                  {/* Area & Service Charge */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--line)]">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-ink uppercase tracking-wider">{isAr ? "المساحة (قدم مربع)" : "Area (sq ft)"}</Label>
                      <Input 
                        type="number" 
                        className="font-mono text-sm border-[var(--line-strong)] focus:border-[var(--copper)]" 
                        value={propertyAreaSqFt} 
                        onChange={(e) => setPropertyAreaSqFt(Number(e.target.value))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-ink uppercase tracking-wider">{isAr ? "رسوم الخدمة / قدم²" : "Service charge / sq ft"}</Label>
                      <Input 
                        type="number" 
                        className="font-mono text-sm border-[var(--line-strong)] focus:border-[var(--copper)]" 
                        value={serviceChargePerSqFt} 
                        onChange={(e) => setServiceChargePerSqFt(Number(e.target.value))} 
                      />
                    </div>
                  </div>
                </div>
              </MagicCard>

              {/* Quick Action Link */}
              <Link href={`/${locale}/homes`} className="gold-accent flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--copper-dark)] hover:text-[var(--ink)] py-3 transition-colors group">
                {isAr ? "تصفح العقارات المتاحة" : "Browse verified homes"}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Result Pane — Glass card with luxury staging */}
            <div className="lg:col-span-7 space-y-6 reveal-up delay-300">
              <div className="glass-card p-8 lg:p-10">
                {/* Total Hero */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[var(--copper)] pb-7 mb-7 gap-4">
                  <div>
                    <p className="section-overline mb-2">
                      {isAr ? "إجمالي المبلغ النقدي المطلوب" : "Total upfront acquisition cash"}
                    </p>
                    <p className="text-caption">
                      {isAr ? "يشمل الدفعة الأولى ورسوم نقل الملكية والرسوم الإدارية" : "Includes down payment, DLD transfer fees, and registration"}
                    </p>
                  </div>
                  <span className="stat-counter text-3xl lg:text-4xl font-light text-[var(--ink)] font-serif tabular-nums whitespace-nowrap">
                    AED <NumberTicker value={totalUpfrontCash} />
                  </span>
                </div>

                {/* Stage 1: At Reservation */}
                <div className="cost-stage mb-4">
                  <div className="cost-stage-number">01</div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ink-muted)] mb-4">
                    {isAr ? "عند الحجز" : "AT RESERVATION"}
                  </h3>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-caption">{isAr ? "عربون الحجز التقديري" : "Reservation deposit"}</span>
                    <span className="font-mono font-bold text-[var(--ink)]">AED {reservationDeposit.toLocaleString()}</span>
                  </div>
                  <div className="cost-stage-bar" style={{ '--fill': '15%' } as any} />
                  <p className="text-[11px] text-[var(--ink-muted)] italic mt-2">
                    {isAr ? "يُخصم عادةً من الدفعة الأولى عند إتمام الاتفاقية" : "Typically credited toward your down payment upon agreement signing."}
                  </p>
                </div>

                {/* Stage 2: At Transfer */}
                <div className="cost-stage mb-4">
                  <div className="cost-stage-number">02</div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ink-muted)] mb-4">
                    {isAr ? "عند نقل الملكية" : "AT TRANSFER & REGISTRATION"}
                  </h3>
                  <div className="space-y-0 text-sm">
                    <div className="flex justify-between py-2.5 border-b border-[var(--line)] hover:bg-[var(--copper-tint)]/30 px-2 -mx-2 transition-colors">
                      <span className="text-caption">{isAr ? "الدفعة الأولى" : "Down payment"}</span>
                      <span className="font-mono font-bold">AED {downPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[var(--line)] hover:bg-[var(--copper-tint)]/30 px-2 -mx-2 transition-colors">
                      <span className="text-caption">{isAr ? "رسوم دائرة الأراضي والأملاك (4%)" : "DLD transfer fee (4%)"}</span>
                      <span className="font-mono font-bold">AED {dldFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[var(--line)] hover:bg-[var(--copper-tint)]/30 px-2 -mx-2 transition-colors">
                      <span className="text-caption">{isAr ? "رسوم الوكالة (2% + ضريبة)" : "Agency fee (2% + VAT)"}</span>
                      <span className="font-mono font-bold">AED {agencyFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2.5 hover:bg-[var(--copper-tint)]/30 px-2 -mx-2 transition-colors">
                      <span className="text-caption">{isAr ? "رسوم أمين التسجيل والرهن العقاري" : "Trustee & mortgage registration fees"}</span>
                      <span className="font-mono font-bold">AED {(trusteeFee + dldAdminFee + mortgageRegFee).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="cost-stage-bar" style={{ '--fill': `${dldPct + agencyPct}%` } as any} />
                </div>

                {/* Stage 3: Ongoing Ownership */}
                <div className="cost-stage">
                  <div className="cost-stage-number">03</div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ink-muted)] mb-4">
                    {isAr ? "أثناء الملكية" : "DURING OWNERSHIP"}
                  </h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-caption mb-2">{isAr ? "القسط الشهري التقديري" : "Estimated monthly mortgage"}</p>
                      <p className="stat-counter text-xl font-light tabular-nums text-[var(--ink)]">
                        AED {Math.round(monthlyMortgage).toLocaleString()} <span className="text-caption text-xs">/mo</span>
                      </p>
                      <p className="text-[11px] text-[var(--ink-muted)] mt-1 font-mono">{loanTerm} yrs @ {interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-caption mb-2">{isAr ? "رسوم الصيانة والخدمة السنوية" : "Annual service charges"}</p>
                      <p className="stat-counter text-xl font-light tabular-nums text-[var(--ink)]">
                        AED {annualServiceCharge.toLocaleString()} <span className="text-caption text-xs">/yr</span>
                      </p>
                      <p className="text-[11px] text-[var(--ink-muted)] mt-1 font-mono">AED {serviceChargePerSqFt}/sq ft • {propertyAreaSqFt.toLocaleString()} sq ft</p>
                    </div>
                  </div>
                  <div className="cost-stage-bar" style={{ '--fill': '40%' } as any} />
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 mt-6 pt-5 border-t border-[var(--line)]">
                  <ShieldCheck className="size-4 text-[var(--sage)] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[var(--ink-muted)] italic leading-relaxed">
                    {isAr
                      ? "بناءً على لوائح دائرة الأراضي وشروط البنوك المعيارية. أكّد الرسوم النهائية قبل الإيداع."
                      : "Based on DLD regulations and standard bank terms. Confirm final fees before placing a deposit."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
