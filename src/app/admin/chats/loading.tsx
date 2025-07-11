import { MessageSquare } from "lucide-react";

export default function ChatsLoading() {
  return (
    <div className="h-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-pulse-slow absolute top-1/4 left-1/4 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-gradient-to-r from-[#9747FF]/10 to-[#7E3BFF]/10 blur-3xl" />
        <div
          className="animate-pulse-slow absolute right-1/4 bottom-1/4 h-48 w-48 sm:h-80 sm:w-80 rounded-full bg-gradient-to-r from-[#7E3BFF]/10 to-[#9747FF]/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 h-full">
        <div className="h-full p-4 sm:p-6 lg:p-8">
          <div className="relative mb-6 sm:mb-8 lg:mb-12">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#9747FF]/5 to-[#7E3BFF]/5 blur-2xl sm:blur-3xl"></div>
            <div className="relative">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="h-6 w-32 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-6 w-40 bg-white/10 rounded animate-pulse"></div>
                </div>

                <div>
                  <div className="h-12 w-80 bg-white/10 rounded animate-pulse mb-4"></div>
                  <div className="h-6 w-96 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-20">
            <div className="p-6 mb-4 rounded-full sm:p-8 sm:mb-6 bg-gradient-to-br from-white/5 to-white/10">
              <MessageSquare className="size-12 sm:size-16 text-white/40 animate-pulse" />
            </div>
            <h3 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl text-white/80">
              Loading Chat Management
            </h3>
            <p className="max-w-md text-sm sm:text-lg text-white/60">
              Please wait while we load the chat data...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}