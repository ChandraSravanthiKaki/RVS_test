import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(100%_100%_at_50%_0%,#2a2458_0%,#0b0b11_60%)] text-white">
      {/* Navbar removed per request */}

      <main className="relative mx-auto max-w-[1400px] px-8 py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(232,121,249,0.25)_0%,rgba(99,102,241,0.15)_50%,transparent_70%)]" />
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-black leading-tight sm:text-7xl">
            Chandra <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Kaki</span>
          </h1>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/onboarding" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black shadow hover:bg-zinc-200">
              Register
            </Link>
            <Link href="/admin" className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15">
              Admin: Configure Flow
            </Link>
            <Link href="/data" className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15">
              View Data
            </Link>
          </div>

          {/* Vector image area below buttons */}
          <div className="relative mx-auto mt-14 w-full max-w-5xl overflow-hidden rounded-2xl">
            <Image
              src="/home.png"
              alt="Home vector"
              width={1200}
              height={520}
              className="h-auto w-full"
              priority
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#0b0b11]" />
          </div>
        </div>
      </main>
    </div>
  );
}
