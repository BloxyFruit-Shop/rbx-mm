export default function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9747FF] mx-auto mb-6"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9747FF]/20 to-[#7E3BFF]/20 blur-xl animate-pulse"></div>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">Loading Item Database</h3>
        <p className="text-white/60">Fetching the latest market data...</p>
      </div>
    </div>
  );
}