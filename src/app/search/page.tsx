import { redirect } from "next/navigation";

/** Old bookmarks keep their query and filters; the archive owns search. */
export default async function LegacySearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parameters = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["q", "type", "period"]) {
    const raw = parameters[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) query.set(key, value);
  }
  redirect(query.size ? `/wiki?${query.toString()}` : "/wiki");
}
