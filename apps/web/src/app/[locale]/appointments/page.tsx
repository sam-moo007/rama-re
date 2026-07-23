import { redirect } from "next/navigation";

export default async function AppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = new URLSearchParams(await searchParams as any).toString();
  redirect(`/${locale}/advisor${query ? `?${query}` : ""}` as any);
}
