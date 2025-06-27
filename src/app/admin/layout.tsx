import { notFound } from "next/navigation";
import { getServerUser } from "~/lib/auth";
import { HydrateClient } from "~/trpc/server";
import { AdminSidebar, MobileAdminSidebar } from "./_components/admin-sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getServerUser();
  
  if (
    user.error ||
    !user.data ||
    (!user.data.roles?.includes("admin") && !user.data.roles?.includes("middleman"))
  ) {
    notFound();
  }

  return (
    <HydrateClient>
      <div className="min-h-screen bg-gradient-to-br from-[#0f051d] via-[#1a0b2e] to-[#0f051d]">
        <div className="flex h-screen">
          <div className="hidden md:flex md:w-72 md:flex-col">
            <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r border-white/10 bg-gradient-to-b from-[#0f051d]/50 to-[#1a0b2e]/50 backdrop-blur-sm">
              <AdminSidebar />
            </div>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 md:hidden bg-gradient-to-r from-[#0f051d]/80 to-[#1a0b2e]/80 backdrop-blur-sm">
              <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
              <MobileAdminSidebar />
            </div>

            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}