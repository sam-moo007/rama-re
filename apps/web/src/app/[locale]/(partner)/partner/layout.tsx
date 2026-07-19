import type { ReactNode } from "react";
import Link from "next/link";

export default async function PartnerLayout({ children, params }: { children: ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
        <Link href={`/${locale}/partner` as any} className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white">R</div>
          <span className="hidden sm:inline-block">RAMA Partner Portal</span>
        </Link>
        <nav className="ml-6 flex gap-6 text-sm font-medium text-slate-600">
          <Link href={`/${locale}/partner` as any} className="hover:text-slate-900 transition-colors">Dashboard</Link>
          <Link href={`/${locale}/partner/ingestion` as any} className="hover:text-slate-900 transition-colors">Ingestion Sources</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm text-slate-500">
          <span>Simulation Mode</span>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
