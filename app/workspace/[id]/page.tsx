import { notFound } from "next/navigation";
import { getGeneration } from "@/lib/storage/generation-store";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getGeneration(id);
  if (!result) notFound();
  return <WorkspaceShell result={result} />;
}
