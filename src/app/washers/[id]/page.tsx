import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WasherDetailPage({ params }: { params: { id: string } }) {
  const washer = await prisma.washerProfile.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      services: { where: { active: true }, orderBy: { priceCents: "asc" } },
      availability: { orderBy: { dayOfWeek: "asc" } },
    },
  });
  if (!washer) notFound();

  const dayName = (d: number) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">{washer.user.name}</h1>
          <p className="mt-1 text-amber-600">
            ★ {washer.ratingAvg.toFixed(1)}{" "}
            <span className="text-slate-500">({washer.ratingCount} reviews)</span>
          </p>
          <p className="mt-3 text-slate-700">{washer.bio}</p>
        </header>

        <section>
          <h2 className="text-lg font-semibold">Services</h2>
          <ul className="mt-3 space-y-3">
            {washer.services.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded border border-slate-200 bg-white p-4">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-slate-500">{s.durationMin} min</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatCents(s.priceCents)}</span>
                  <Link
                    href={`/book/${s.id}`}
                    className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Book
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Weekly availability</h3>
          <ul className="mt-2 text-sm text-slate-700">
            {washer.availability.map((a) => (
              <li key={a.id} className="flex justify-between py-0.5">
                <span>{dayName(a.dayOfWeek)}</span>
                <span className="text-slate-500">
                  {a.startTime} – {a.endTime}
                </span>
              </li>
            ))}
            {washer.availability.length === 0 && (
              <li className="text-slate-500">No availability set.</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}
