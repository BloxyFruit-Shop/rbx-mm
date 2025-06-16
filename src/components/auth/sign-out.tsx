"use client";

import { Button } from "~/components/ui/button";
import { signOut } from "~/lib/auth-client";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function SignOutButton({
  className,
  children,
}: SignOutButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await signOut();
      }}
      className={className}
    >
      {children}
    </Button>
  );
}
