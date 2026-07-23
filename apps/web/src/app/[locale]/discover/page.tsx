import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DiscoverPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const params_ = new URLSearchParams();
  const sp = await searchParams as Record<string, string | string[] | undefined>;
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) params_.append(key, v);
  }
  const search = params_.toString();
  redirect(`/${locale}/homes${search ? `?${search}` : ""}` as any);
}
