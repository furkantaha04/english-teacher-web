import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 lg:ml-0">
        <div className="p-4 sm:p-6 lg:p-8 pt-18 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
