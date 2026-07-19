import type { DldTransaction } from "@rama/contracts";
import type { Locale } from "@/lib/i18n";
import { localize } from "@/lib/i18n";

type DldTransactionTableProps = {
  transactions: DldTransaction[];
  locale: Locale;
};

export function DldTransactionTable({ transactions, locale }: DldTransactionTableProps) {
  if (!transactions || transactions.length === 0) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-US", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-US").format(value);
  };

  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-left text-sm text-ink bg-bone border border-line-strong">
        <thead className="bg-sand text-ink-muted border-b border-line-strong uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">{locale === "ar" ? "التاريخ" : "Date"}</th>
            <th className="px-4 py-3">{locale === "ar" ? "السعر" : "Price"}</th>
            <th className="px-4 py-3">{locale === "ar" ? "المساحة (قدم²)" : "Area (SqFt)"}</th>
            <th className="px-4 py-3">{locale === "ar" ? "السعر للقدم²" : "Price / SqFt"}</th>
            <th className="px-4 py-3">{locale === "ar" ? "غرف النوم" : "Bedrooms"}</th>
            <th className="px-4 py-3">{locale === "ar" ? "نوع العقار" : "Property Type"}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-line-strong last:border-0 hover:bg-sand/50 transition-colors">
              <td className="px-4 py-3 tabular-nums">{tx.date}</td>
              <td className="px-4 py-3 font-semibold tabular-nums">{formatCurrency(tx.priceAed)}</td>
              <td className="px-4 py-3 tabular-nums">{formatNumber(tx.areaSqft)}</td>
              <td className="px-4 py-3 tabular-nums">{formatCurrency(tx.pricePerSqft)}</td>
              <td className="px-4 py-3 tabular-nums">{formatNumber(tx.bedrooms)}</td>
              <td className="px-4 py-3">{localize(tx.propertyType, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
