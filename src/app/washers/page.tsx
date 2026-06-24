import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";

export const dynamic = "force-dynamic";

export default async function WashersPage() {
  const washers = await prisma.washerProfile.findMany({
    include: { user: true, services: { where: { active: true } } },
    orderBy: { ratingAvg: "desc" },
  });

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Washers <span className="neon-text">near you</span>
            </h1>
            <p className="mt-1 text-slate-400">
              {washers.length} washer{washers.length === 1 ? "" : "s"} ready to roll out.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            Distance filter coming soon
          </span>
        </div>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {washers.map((w, i) => (
          <Reveal key={w.id} delay={i * 0.06}>
            <TiltCard intensity={6} className="h-full">
              <Link href={`/washers/${w.id}`} className="block h-full">
                <div className="card card-hover relative h-full overflow-hidden">
                  {/* Avatar gradient circle */}
                  <div className="flex items-start gap-4">
                    <div className="relative h-12 w-12 shrink-0 rounded-full bg-[linear-gradient(135deg,#22d3ee,#8b5cf6,#ec4899)] p-[2px] shadow-glow">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-ink-900 font-display text-lg font-bold text-white">
                        {w.user.name.charAt(0)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h2 className="truncate font-display text-base font-semibold">
                          {w.user.name}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {w.ratingAvg.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                        {w.bio ?? "Mobile car wash specialist."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-sm">
                    <span className="text-slate-400">
                      From{" "}
                      <span className="font-semibold text-white">
                        {formatCents(w.baseRateCents)}
                      </span>
                    </span>
                    <span className="text-slate-500">{w.services.length} services</span>
                  </div>
                </div>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
        {washers.length === 0 && (
          <div className="col-span-full card text-center text-slate-400">
            No washers yet. Run <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-cyan-300">npm run db:seed</code> to populate.
          </div>
        )}
      </div>
    </div>
  );
}
