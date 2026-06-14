// Server component — fetches workspace list and renders sidebar + main content.
import { getHistoryRecords } from "@/lib/storage/generation-store";
import { AppSidebar } from "./app-sidebar";

export async function SidebarLayout({ children }: { children: React.ReactNode }) {
  const workspaces = await getHistoryRecords();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "hsl(220 13% 8%)" }}>
      <AppSidebar workspaces={workspaces} />
      <div className="flex-1 min-w-0 min-h-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
