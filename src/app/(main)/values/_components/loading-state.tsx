export default function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-b-2 border-[#9747FF]"></div>
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20 blur-xl"></div>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">
          Loading Item Database
        </h3>
        <p className="text-white/60">Fetching the latest market data...</p>
      </div>
    </div>
  );
}
