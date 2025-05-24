const GradientBackground = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0f051d] via-[#1a0b2e] to-[#0f051d]">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(45%_45%_at_70%_-20%,hsl(var(--gag-blue-hsl),0.35)_0%,transparent_100%)] animate-gradient-blue" />

      <div className="absolute inset-0 z-0 bg-[radial-gradient(45%_45%_at_85%_35%,hsl(var(--gag-purple-hsl),0.3)_0%,transparent_100%)] animate-gradient-purple" />

      <div className="absolute inset-0 z-0 bg-[radial-gradient(35%_35%_at_5%_50%,hsl(var(--gag-pink-hsl),0.25)_0%,transparent_100%)] animate-gradient-pink" />

      <div className="absolute inset-0 z-0 bg-[radial-gradient(70%_50%_at_50%_100%,var(--gag-bg-light)_0%,transparent_100%)] animate-gradient-light" />

      <div className="absolute inset-0 z-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(121,40,202,0.08)_0%,transparent_100%)] animate-gradient-overlay" />
      
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GradientBackground;