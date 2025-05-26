import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

interface UserAvatarProps {
  user?: {
    name: string;
    email: string;
    image?: string | null | undefined;
  };
}

function UserAvatar({ user }: UserAvatarProps) {
  return (
    <Avatar className="size-8 rounded-lg in-[.theme-mono]:grayscale">
      <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
      <AvatarFallback className="rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="fill-current size-6"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
          <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
        </svg>
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
