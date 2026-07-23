import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PropertiesSlugPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const search = new URLSearchParams(await searchParams as any).toString();
  redirect(`/${locale}/homes/${slug}${search ? `?${search}` : ""}` as any);
}
