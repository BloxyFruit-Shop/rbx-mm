import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";

function LogoIcon({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex transition-all", className)}>
      <Image src="/images/logo.webp" width={140} height={54} alt="RbxMM Logo" />
    </Link>
  );
}

export default LogoIcon;
