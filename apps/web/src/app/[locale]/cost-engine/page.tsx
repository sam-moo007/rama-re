"use client";

import { use, useState } from "react";
import { Calculator, DollarSign, Home, Percent } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/features/property/components/site-header";
import { isLocale, type Locale } from "@/lib/i18n";

export default function CostEnginePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = use(params);
  const locale: Locale = isLocale(value) ? (value as Locale) : "en";

  const [propertyValue, setPropertyValue] = useState(2000000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(25);

  const downPayment = propertyValue * (downPaymentPct / 100);
  const loanAmount = propertyValue - downPayment;
  
  // Monthly mortgage calculation
  const r = interestRate / 100 / 12;
  const n = loanTerm * 12;
  const monthlyMortgage = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  // DLD Fee (4% + 580 AED admin fee)
  const dldFee = (propertyValue * 0.04) + 580;
  // Agency Fee (2% + 5% VAT)
  const agencyFee = (propertyValue * 0.02) * 1.05;
  
  const totalUpfront = downPayment + dldFee + agencyFee;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader locale={locale} />
      
      <main className="container max-w-5xl py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Calculator className="w-8 h-8 text-primary" />
            {locale === "ar" ? "حاسبة التكاليف" : "Cost Engine"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {locale === "ar" 
              ? "احسب التكاليف الأولية والأقساط الشهرية لعقارك في دبي."
              : "Calculate upfront costs and monthly mortgage payments for your Dubai property."}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{locale === "ar" ? "المدخلات" : "Calculator Inputs"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-base">{locale === "ar" ? "قيمة العقار" : "Property Value (AED)"}</Label>
                    <span className="font-semibold">{propertyValue.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range"
                    className="w-full accent-primary"
                    min={500000} 
                    max={10000000} 
                    step={100000} 
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))} 
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-base">{locale === "ar" ? "الدفعة الأولى" : "Down Payment"}</Label>
                    <span className="font-semibold">{downPaymentPct}% ({downPayment.toLocaleString()} AED)</span>
                  </div>
                  <input 
                    type="range"
                    className="w-full accent-primary"
                    min={10} 
                    max={80} 
                    step={5} 
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{locale === "ar" ? "نسبة الفائدة (%)" : "Interest Rate (%)"}</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        className="pl-9" 
                        value={interestRate} 
                        onChange={(e) => setInterestRate(Number(e.target.value))} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{locale === "ar" ? "مدة القرض (سنوات)" : "Loan Term (Years)"}</Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        className="pl-9" 
                        value={loanTerm} 
                        onChange={(e) => setLoanTerm(Number(e.target.value))} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>{locale === "ar" ? "الملخص" : "Summary"}</CardTitle>
                <CardDescription>
                  {locale === "ar" ? "تقدير للتكاليف" : "Estimated breakdown of costs"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-background rounded border flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{locale === "ar" ? "القسط الشهري" : "Monthly Mortgage"}</p>
                    <p className="text-3xl font-bold text-primary">{Math.round(monthlyMortgage).toLocaleString()} <span className="text-lg font-normal text-muted-foreground">AED</span></p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary/40" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    {locale === "ar" ? "التكاليف الأولية المطلوبة" : "Required Upfront Costs"}
                  </h4>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>{locale === "ar" ? "الدفعة الأولى" : "Down Payment"}</span>
                    <span className="font-semibold">{downPayment.toLocaleString()} AED</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>{locale === "ar" ? "رسوم دائرة الأراضي والأملاك" : "DLD Registration Fee (4%)"}</span>
                    <span className="font-semibold">{dldFee.toLocaleString()} AED</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>{locale === "ar" ? "رسوم الوكالة" : "Agency Fee (2% + VAT)"}</span>
                    <span className="font-semibold">{agencyFee.toLocaleString()} AED</span>
                  </div>
                  <div className="flex justify-between items-center py-3 text-lg font-bold">
                    <span>{locale === "ar" ? "الإجمالي" : "Total Upfront Cash"}</span>
                    <span className="text-primary">{totalUpfront.toLocaleString()} AED</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
