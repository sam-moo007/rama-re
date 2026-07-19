"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface IngestionSource {
  key: string;
  adapterKind: string;
  state: "active" | "disabled";
  displayName: { en: string; ar: string };
  updatedAt: string;
}

export default function IngestionSourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  // Note: params is passed to client Link hrefs via useEffect below
  // For client component, we use React.use() to unwrap the Promise
  const { locale } = require("react").use(params) as { locale: string };
  const [sources, setSources] = useState<IngestionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSources() {
      try {
        const response = await fetch("/api/operations/ingestion/sources");
        if (!response.ok) {
          throw new Error(`Failed to fetch sources: ${response.statusText}`);
        }
        const data = await response.json();
        setSources(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSources();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ingestion Sources</h1>
        <p className="text-slate-500 mt-1">Select a source to upload your property feed.</p>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading sources...</div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded border bg-slate-50 p-8 text-center text-slate-500">
          No ingestion sources found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <div key={source.key} className="flex flex-col justify-between rounded border bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{source.displayName.en}</h3>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    source.state === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {source.state}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 font-mono">{source.key}</p>
                <p className="text-sm text-slate-500 mt-2">Adapter: {source.adapterKind}</p>
              </div>
              <div className="mt-6">
                <Link
                  href={`/${locale}/partner/ingestion/${source.key}/upload` as any}
                  className="inline-flex w-full items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  aria-disabled={source.state !== 'active'}
                  tabIndex={source.state !== 'active' ? -1 : undefined}
                  onClick={(e) => {
                    if (source.state !== 'active') e.preventDefault();
                  }}
                >
                  Upload Feed
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
