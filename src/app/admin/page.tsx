import { BetterBadge } from "~/components/ui/better-badge";
import { getTranslations } from 'next-intl/server';
import Link from "next/link";
import { 
  Shield, 
  Users, 
  Package, 
  AlertTriangle, 
  BarChart3, 
  Database,
  ArrowRight
} from "lucide-react";
import AdminClient from "./_components/admin-client";

export const metadata = {
  title: "Admin Dashboard | RBXMM",
  description: "Administrative dashboard for RBXMM platform management.",
  keywords: "admin, dashboard, management, rbxmm",
};

const adminCards = [
  {
    title: "Middleman Panel",
    description: "Manage middleman calls and trade mediation",
    href: "/admin/middleman",
    icon: Shield,
    color: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
    badge: "Active",
    badgeVariant: "success" as const,
  },
  {
    title: "User Management",
    description: "Manage users, roles, and permissions",
    href: "/admin/users",
    icon: Users,
    color: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
    badge: "Coming Soon",
    badgeVariant: "info" as const,
  },
  {
    title: "Trade Management",
    description: "Monitor and manage trade advertisements",
    href: "/admin/trades",
    icon: Package,
    color: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-400",
    badge: "Coming Soon",
    badgeVariant: "info" as const,
  },
  {
    title: "Reports",
    description: "Handle user reports and moderation",
    href: "/admin/reports",
    icon: AlertTriangle,
    color: "from-red-500/20 to-pink-500/20",
    iconColor: "text-red-400",
    badge: "Coming Soon",
    badgeVariant: "info" as const,
  },
  {
    title: "Analytics",
    description: "View platform statistics and insights",
    href: "/admin/analytics",
    icon: BarChart3,
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
    badge: "Coming Soon",
    badgeVariant: "info" as const,
  },
  {
    title: "Database",
    description: "Manage items, games, and platform data",
    href: "/admin/database",
    icon: Database,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
    badge: "Coming Soon",
    badgeVariant: "info" as const,
  },
];

async function AdminDashboard() {
  
  return (
    <div className="h-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-pulse-slow absolute top-1/4 left-1/4 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 blur-3xl" />
        <div
          className="animate-pulse-slow absolute right-1/4 bottom-1/4 h-48 w-48 sm:h-80 sm:w-80 rounded-full bg-gradient-to-r from-[#7E3BFF]/10 to-[#9747FF]/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 h-full">
        <div className="h-full p-4 sm:p-6 lg:p-8">
          <div className="relative mb-6 sm:mb-8 lg:mb-12">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 blur-2xl sm:blur-3xl"></div>
            <div className="relative">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <BetterBadge variant="success" size="default">
                    <span className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
                      Admin Dashboard
                    </span>
                  </BetterBadge>
                  <BetterBadge variant="info" size="default">
                    <span className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
                      Platform Management
                    </span>
                  </BetterBadge>
                </div>

                <div>
                  <h1 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-4xl lg:text-5xl xl:text-6xl">
                    <span className="bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] bg-clip-text text-transparent">
                      Admin Dashboard
                    </span>
                  </h1>
                  <p className="max-w-full text-sm leading-relaxed sm:max-w-2xl lg:max-w-3xl sm:text-base lg:text-lg xl:text-xl text-white/70">
                    Comprehensive platform management tools for administrators and staff members.
                    <span className="font-medium text-white">
                      {" "}
                      Monitor, manage, and maintain the RBXMM ecosystem.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AdminClient />

          <div className="grid grid-cols-1 gap-4 pb-8 mt-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {adminCards.map((card) => {
              const IconComponent = card.icon;
              const isActive = card.badge === "Active";
              
              return (
                <Link
                  key={card.href}
                  href={isActive ? card.href : "#"}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br ${card.color} backdrop-blur-sm transition-all duration-300 ${
                    isActive 
                      ? "hover:border-white/20 hover:scale-[1.02] cursor-pointer" 
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${card.color}`}>
                        <IconComponent className={`size-5 sm:size-6 ${card.iconColor}`} />
                      </div>
                      <BetterBadge variant={card.badgeVariant} size="sm">
                        <span className="text-xs">{card.badge}</span>
                      </BetterBadge>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="text-lg font-semibold text-white transition-colors sm:text-xl group-hover:text-white/90">
                        {card.title}
                      </h3>
                      <p className="text-sm leading-relaxed sm:text-base text-white/60">
                        {card.description}
                      </p>
                    </div>

                    {isActive && (
                      <div className="flex items-center justify-between mt-4 sm:mt-6">
                        <span className="text-xs sm:text-sm text-white/50">
                          Click to access
                        </span>
                        <ArrowRight className="transition-all size-4 text-white/50 group-hover:text-white/70 group-hover:translate-x-1" />
                      </div>
                    )}
                  </div>

                  {isActive && (
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-white/5 to-transparent group-hover:opacity-100" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;