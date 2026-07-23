import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PropertiesSlugPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const params_ = new URLSearchParams();
  const sp = await searchParams as Record<string, string | string[] | undefined>;
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) params_.append(key, v);
  }
  const search = params_.toString();
  redirect(`/${locale}/homes/${slug}${search ? `?${search}` : ""}` as any);
}
