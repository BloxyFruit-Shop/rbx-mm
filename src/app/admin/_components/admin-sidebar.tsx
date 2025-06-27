"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import {
  Users,
  Shield,
  BarChart3,
  Settings,
  Menu,
  Home,
  MessageSquare,
  Package,
  UserCheck,
  AlertTriangle,
  Database,
} from "lucide-react";

const adminRoutes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/admin",
    color: "text-sky-500",
  },
  {
    label: "Middleman Panel",
    icon: Shield,
    href: "/admin/middleman",
    color: "text-violet-500",
  },
  {
    label: "User Management",
    icon: Users,
    href: "/admin/users",
    color: "text-pink-700",
  },
  {
    label: "Trade Management",
    icon: Package,
    href: "/admin/trades",
    color: "text-orange-700",
  },
  {
    label: "Reports",
    icon: AlertTriangle,
    href: "/admin/reports",
    color: "text-red-500",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "text-emerald-500",
  },
  {
    label: "Database",
    icon: Database,
    href: "/admin/database",
    color: "text-blue-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
    color: "text-gray-500",
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight text-white">
              Admin Panel
            </h2>
            <div className="space-y-1">
              {adminRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                    pathname === route.href
                      ? "text-white bg-white/10"
                      : "text-zinc-400"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                    {route.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MobileAdminSidebarProps {
  className?: string;
}

export function MobileAdminSidebar({ className }: MobileAdminSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", className)}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="p-0 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e] border-white/10"
      >
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight text-white">
                Admin Panel
              </h2>
              <div className="space-y-1">
                {adminRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                      pathname === route.href
                        ? "text-white bg-white/10"
                        : "text-zinc-400"
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                      {route.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}