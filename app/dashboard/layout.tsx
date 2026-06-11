import { SidebarLayout } from "@/components/layout/sidebar-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </SidebarLayout>
  );
}
