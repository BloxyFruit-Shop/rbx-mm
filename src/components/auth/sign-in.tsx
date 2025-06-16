"use client";

import { Button, type ButtonProps } from "~/components/ui/button";
import { signIn } from "~/lib/auth-client";

interface SignInButtonProps extends ButtonProps {
  provider: "roblox" | "discord";
  className?: string;
  children?: React.ReactNode;
}

export default function SignInButton({
  provider,
  className,
  children,
  ...args
}: SignInButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      {...args}
      onClick={async () => {
        await signIn.social({
          provider,
          callbackURL: "/",
        });
      }}
      className={className}
    >
      {children}
    </Button>
  );
}
