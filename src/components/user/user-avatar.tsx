import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import type { PublicUserProfile } from "~convex/user";
import { cn } from "~/lib/utils";

interface UserAvatarProps {
  user?:
    | {
        name: string;
        email: string;
        image: string | null | undefined;
      }
    | PublicUserProfile;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const sizeClasses = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
  };

  // Handle both user types
  const avatarUrl =
    "robloxAvatarUrl" in (user || {})
      ? (user as PublicUserProfile).robloxAvatarUrl
      : (user as any)?.image;

  const displayName =
    "robloxUsername" in (user || {})
      ? (user as PublicUserProfile).name ||
        (user as PublicUserProfile).robloxUsername
      : (user as any)?.name;
  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        "rounded-lg in-[.theme-mono]:grayscale",
        className,
      )}
    >
      <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? ""} />
      <AvatarFallback className="rounded-lg">
        {displayName ? (
          <span className="text-sm font-medium">
            {displayName.charAt(0).toUpperCase()}
          </span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-6 fill-current"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
            <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
          </svg>
        )}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
export { UserAvatar };
