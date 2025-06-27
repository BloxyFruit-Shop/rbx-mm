import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Poetsen_One } from "next/font/google";
import "~/styles/globals.css";
import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";
import { ConvexClientProvider } from "~/convex/convex-client-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${poetsen.variable} ${geist.className} flex min-h-screen flex-col font-sans`}
      >
        <NextIntlClientProvider messages={messages}>
          <TRPCReactProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </TRPCReactProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}