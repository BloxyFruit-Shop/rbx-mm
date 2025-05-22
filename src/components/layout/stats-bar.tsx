import { FireIcon, HandshakeIcon, PeopleIcon } from '~/components/icons/3d-icons';

export function StatsBar() {
  return (
    <div className="relative flex flex-col sm:grid sm:grid-cols-3 gap-4 w-full">
      <div className="absolute bottom-0 w-full h-[calc(100%-32px)] rounded-2xl overflow-hidden border border-white/5 hidden sm:block">
        <div className="absolute inset-0 bg-[#1a0b2e]/80" />
        <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] opacity-10 mask-b-from-0" />
      </div>

      <div className="relative grid grid-rows-[auto_1fr] gap-2 py-6 px-4 z-10 sm:bg-transparent bg-[#1a0b2e]/80 rounded-2xl border border-white/5 sm:border-none">
        <div className="absolute inset-0 rounded-2xl overflow-hidden sm:hidden">
          <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] opacity-10 mask-b-from-0" />
        </div>
        <div className="flex justify-center -mt-8 relative z-10">
          <div className="flex sm:size-24 size-16 items-center justify-center -mb-4">
            <HandshakeIcon />
          </div>
        </div>
        <div className="flex flex-col items-center relative z-10">
          <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            123,000
          </span>
          <p className="text-sm font-medium text-white/70 text-center">Trades completed</p>
        </div>
      </div>

      <div className="relative grid grid-rows-[auto_1fr] gap-2 py-6 px-4 z-10 sm:bg-transparent bg-[#1a0b2e]/80 rounded-2xl border border-white/5 sm:border-none">
        <div className="absolute inset-0 rounded-2xl overflow-hidden sm:hidden">
          <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] opacity-10 mask-b-from-0" />
        </div>
        <div className="flex justify-center -mt-8 relative z-10">
          <div className="flex sm:size-24 size-16 items-center justify-center -mb-4">
            <PeopleIcon />
          </div>
        </div>
        <div className="flex flex-col items-center relative z-10">
          <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            4,682
          </span>
          <p className="text-sm font-medium text-white/70 text-center">Users online</p>
        </div>
      </div>

      <div className="relative grid grid-rows-[auto_1fr] gap-2 py-6 px-4 z-10 sm:bg-transparent bg-[#1a0b2e]/80 rounded-2xl border border-white/5 sm:border-none">
        <div className="absolute inset-0 rounded-2xl overflow-hidden sm:hidden">
          <div className="absolute -inset-5 rounded-xl bg-[url('/images/pattern.webp')] opacity-10 mask-b-from-0" />
        </div>
        <div className="flex justify-center -mt-8 relative z-10">
          <div className="flex sm:size-24 size-16 items-center justify-center -mb-4">
            <FireIcon />
          </div>
        </div>
        <div className="flex flex-col items-center relative z-10">
          <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            957
          </span>
          <p className="text-sm font-medium text-white/70 text-center">Items tracked</p>
        </div>
      </div>
    </div>
  );
}