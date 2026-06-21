import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WashersPage() {
  const washers = await prisma.washerProfile.findMany({
    include: { user: true, services: { where: { active: true } } },
    orderBy: { ratingAvg: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Washers near you</h1>
          <p className="text-sm text-slate-600">
            {washers.length} washer{washers.length === 1 ? "" : "s"} available
          </p>
        </div>
        <div className="text-xs text-slate-500">
          (Distance filtering uses geo data — wired up but not active in MVP)
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {washers.map((w) => (
          <Link
            key={w.id}
            href={`/washers/${w.id}`}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-500 hover:shadow"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">{w.user.name}</h2>
              <span className="text-sm text-amber-600">★ {w.ratingAvg.toFixed(1)}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{w.bio ?? "Mobile car wash"}</p>
            <div className="mt-3 text-sm">
              From <span className="font-semibold">{formatCents(w.baseRateCents)}</span>
              <span className="ml-2 text-slate-500">· {w.services.length} services</span>
            </div>
          </Link>
        ))}
        {washers.length === 0 && (
          <div className="col-span-full rounded border border-dashed p-6 text-center text-slate-500">
            No washers yet. Run <code className="font-mono">npm run db:seed</code> to populate.
          </div>
        )}
      </div>
    </div>
  );
}
