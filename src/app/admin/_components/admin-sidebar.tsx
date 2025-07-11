"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "~/components/ui/sheet";
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
    requiredRoles: ["admin", "middleman"], // Both can access dashboard
  },
  {
    label: "Middleman Panel",
    icon: Shield,
    href: "/admin/middleman",
    color: "text-violet-500",
    requiredRoles: ["admin", "middleman"], // Both can access middleman panel
  },
  {
    label: "User Management",
    icon: Users,
    href: "/admin/users",
    color: "text-pink-700",
    requiredRoles: ["admin"], // Only admins can access user management
  },
  {
    label: "Chat Management",
    icon: MessageSquare,
    href: "/admin/chats",
    color: "text-orange-700",
    requiredRoles: ["admin"], // Only admins can access chat management
  },
  {
    label: "Reports",
    icon: AlertTriangle,
    href: "/admin/reports",
    color: "text-red-500",
    requiredRoles: ["admin"], // Only admins can access reports
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "text-emerald-500",
    requiredRoles: ["admin"], // Only admins can access analytics
  },
  {
    label: "Database",
    icon: Database,
    href: "/admin/database",
    color: "text-blue-500",
    requiredRoles: ["admin"], // Only admins can access database
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
    color: "text-gray-500",
    requiredRoles: ["admin"], // Only admins can access settings
  },
];

interface AdminSidebarProps {
  className?: string;
  userRoles: string[];
}

export function AdminSidebar({ className, userRoles }: AdminSidebarProps) {
  const pathname = usePathname();

  // Ensure userRoles is always an array
  const safeUserRoles = userRoles || [];

  // Helper function to check if user has access to a route
  const hasAccess = (requiredRoles: string[]) => {
    return requiredRoles.some(role => safeUserRoles.includes(role));
  };

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight text-white">
              Admin Panel
            </h2>
            <div className="space-y-1">
              {adminRoutes.map((route) => {
                const hasRouteAccess = hasAccess(route.requiredRoles);
                
                if (hasRouteAccess) {
                  return (
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
                  );
                } else {
                  return (
                    <div
                      key={route.href}
                      className={cn(
                        "text-sm group flex p-3 w-full justify-start font-medium cursor-not-allowed opacity-50 rounded-lg",
                        "text-zinc-600"
                      )}
                      title="Insufficient permissions"
                    >
                      <div className="flex items-center flex-1">
                        <route.icon className={cn("h-5 w-5 mr-3", "text-zinc-600")} />
                        {route.label}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MobileAdminSidebarProps {
  className?: string;
  userRoles: string[];
}

export function MobileAdminSidebar({ className, userRoles }: MobileAdminSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Ensure userRoles is always an array
  const safeUserRoles = userRoles || [];

  // Helper function to check if user has access to a route
  const hasAccess = (requiredRoles: string[]) => {
    return requiredRoles.some(role => safeUserRoles.includes(role));
  };

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
        <SheetTitle className="sr-only">Admin Panel Navigation</SheetTitle>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight text-white">
                Admin Panel
              </h2>
              <div className="space-y-1">
                {adminRoutes.map((route) => {
                  const hasRouteAccess = hasAccess(route.requiredRoles);
                  
                  if (hasRouteAccess) {
                    return (
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
                    );
                  } else {
                    return (
                      <div
                        key={route.href}
                        className={cn(
                          "text-sm group flex p-3 w-full justify-start font-medium cursor-not-allowed opacity-50 rounded-lg",
                          "text-zinc-600"
                        )}
                        title="Insufficient permissions"
                      >
                        <div className="flex items-center flex-1">
                          <route.icon className={cn("h-5 w-5 mr-3", "text-zinc-600")} />
                          {route.label}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}