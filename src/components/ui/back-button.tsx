"use client";

import Link from 'next/link';
import { Button } from "~/components/ui/button";

interface BackButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function BackButton({ className, children }: BackButtonProps) {
  return (
    <Button
      variant="link"
      size="sm"
      className={className}
      asChild
    >
      <Link href="/">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
        {children ?? "Back"}
      </Link>
    </Button>
  );
}
