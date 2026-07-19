import Link from "next/link";
import { getResolutionQueue, listSources, listRecords } from "@/lib/operations-api";
import { PartnerScorecard } from "@/features/partner/components/partner-scorecard";

export default async function PartnerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Fetch real data from the operations API
  const [queue, sources, recordsRes] = await Promise.all([
    getResolutionQueue().catch(() => ({ counts: { pending: 0, matched: 0, rejected: 0, conflict: 0 }, items: [] })),
    listSources().catch(() => []),
    listRecords(100).catch(() => ({ items: [], nextCursor: null }))
  ]);

  const activeSources = sources.filter(s => s.active === true).length;
  // Fallback to finding the first source for the scorecard for MVP (assuming 1 partner = 1 source)
  const primarySource = sources.length > 0 ? sources[0] : undefined;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Partner Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your ingestion sources and view feed performance.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric Cards */}
        <div className="rounded border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Active Sources</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{activeSources}</p>
          <div className="mt-4">
            <Link href={`/${locale}/partner/ingestion` as any} className="text-sm font-medium text-blue-600 hover:underline">
              View sources &rarr;
            </Link>
          </div>
        </div>
        
        <div className="rounded border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Uploaded Rows</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{recordsRes.items.length}</p>
          <p className="text-sm text-slate-500 mt-1">Historical total</p>
        </div>
        
        <div className="rounded border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Resolution Queue</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{queue.counts.pending}</p>
          <p className="text-sm text-slate-500 mt-1">Pending items</p>
        </div>
      </div>

      {/* Scorecard Widget */}
      <div className="mt-8">
        <PartnerScorecard source={primarySource} records={recordsRes.items} />
      </div>
    </div>
  );
}
