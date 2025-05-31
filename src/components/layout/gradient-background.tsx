const GradientBackground = ({
  children,
  still,
}: Readonly<{
  children: React.ReactNode;
  still?: boolean;
}>) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0f051d] via-[#1a0b2e] to-[#0f051d]">
      <div
        className={`absolute inset-0 z-0 ${
          still
            ? "bg-[radial-gradient(600px_600px_at_1000px_-200px,hsl(var(--gag-blue-hsl),0.35)_0%,transparent_100%)]"
            : "bg-[radial-gradient(45%_45%_at_70%_-20%,hsl(var(--gag-blue-hsl),0.35)_0%,transparent_100%)]"
        }`}
      />

      <div
        className={`absolute inset-0 z-0 ${
          still
            ? "bg-[radial-gradient(600px_600px_at_1200px_400px,hsl(var(--gag-purple-hsl),0.3)_0%,transparent_100%)]"
            : "bg-[radial-gradient(45%_45%_at_85%_35%,hsl(var(--gag-purple-hsl),0.3)_0%,transparent_100%)]"
        }`}
      />

      <div
        className={`absolute inset-0 z-0 ${
          still
            ? "bg-[radial-gradient(500px_500px_at_100px_600px,hsl(var(--gag-pink-hsl),0.25)_0%,transparent_100%)]"
            : "bg-[radial-gradient(35%_35%_at_5%_50%,hsl(var(--gag-pink-hsl),0.25)_0%,transparent_100%)]"
        }`}
      />

      <div
        className={`absolute inset-0 z-0 ${
          still
            ? "bg-[radial-gradient(1000px_700px_at_800px_1000px,var(--gag-bg-light)_0%,transparent_100%)]"
            : "bg-[radial-gradient(70%_50%_at_50%_100%,var(--gag-bg-light)_0%,transparent_100%)]"
        }`}
      />

      <div
        className={`absolute inset-0 z-0 ${
          still
            ? "bg-[radial-gradient(1400px_1400px_at_800px_0px,rgba(121,40,202,0.08)_0%,transparent_100%)]"
            : "bg-[radial-gradient(100%_100%_at_50%_0%,rgba(121,40,202,0.08)_0%,transparent_100%)]"
        }`}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GradientBackground;
