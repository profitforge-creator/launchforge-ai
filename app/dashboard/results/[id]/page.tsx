import { redirect } from "next/navigation";

// Redirect legacy results URLs to the new workspace pages.
export default async function LegacyResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/workspace/${id}`);
}
