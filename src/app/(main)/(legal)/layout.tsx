import GradientBackground from "~/components/layout/gradient-background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GradientBackground>
      <div className="prose prose-invert prose-li:text-left prose-h1:text-5xl mx-auto w-full max-w-2xl pt-[calc(72px+32px)] text-center pb-12">
        {children}
      </div>
    </GradientBackground>
  );
}
