import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Poetsen_One } from "next/font/google";
import "~/styles/globals.css";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const poetsen = Poetsen_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poetsen",
});

export const metadata: Metadata = {
  title: "Grow A Garden Trading | RbxMM",
  description:
    "Trade smarter with live Grow a Garden values & stock lists. Track Mango, Grape & more. 100% accurate prices updated hourly by expert traders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poetsen.variable} ${geist.className} flex min-h-screen flex-col font-sans`}
      >
        <TRPCReactProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
