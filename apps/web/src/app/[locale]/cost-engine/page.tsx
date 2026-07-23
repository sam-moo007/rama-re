import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CostEngineRedirectPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const search = new URLSearchParams(await searchParams as any).toString();
  redirect(`/${locale}/costs${search ? `?${search}` : ""}` as any);
}
