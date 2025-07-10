import { BetterBadge } from "~/components/ui/better-badge";
import { 
  Users, 
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import UsersClient from "./_components/users-client";

export const metadata = {
  title: "User Management | RBXMM Admin",
  description: "Manage users, roles, and permissions.",
  keywords: "admin, users, roles, permissions, management, rbxmm",
};

async function UsersPage() {
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
                      <Users className="size-3 sm:size-4" />
                      User Management
                    </span>
                  </BetterBadge>
                  <BetterBadge variant="info" size="default">
                    <span className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
                      <Shield className="size-3 sm:size-4" />
                      Roles & Permissions
                    </span>
                  </BetterBadge>
                </div>

                <div>
                  <h1 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-4xl lg:text-5xl xl:text-6xl">
                    <span className="bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] bg-clip-text text-transparent">
                      User Management
                    </span>
                  </h1>
                  <p className="max-w-full text-sm leading-relaxed sm:max-w-2xl lg:max-w-3xl sm:text-base lg:text-lg xl:text-xl text-white/70">
                    Manage users, roles, and permissions across the platform.
                    <span className="font-medium text-white">
                      {" "}
                      View user data, assign roles, and handle moderation tasks.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <UsersClient />
        </div>
      </div>
    </div>
  );
}

export default UsersPage;