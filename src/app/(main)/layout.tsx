import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { HydrateClient } from "~/trpc/server";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HydrateClient>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </HydrateClient>
  );
}
