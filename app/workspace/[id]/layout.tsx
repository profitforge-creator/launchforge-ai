import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { requireUser } from "@/lib/auth/session";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <SidebarLayout>{children}</SidebarLayout>;
}
