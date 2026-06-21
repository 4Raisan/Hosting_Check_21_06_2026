import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomerDashboard({ searchParams }: { searchParams: { booked?: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard/customer");

  const bookings = await prisma.booking.findMany({
    where: { customerId: session.user.id },
    include: { washer: { include: { user: true } }, service: true },
    orderBy: { startsAt: "desc" },
  });

  const now = new Date();
  const upcoming = bookings.filter((b) => b.startsAt >= now && b.status !== "CANCELLED");
  const past = bookings.filter((b) => b.startsAt < now || b.status === "CANCELLED");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your bookings</h1>
        <Link href="/washers" className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
          Book another wash
        </Link>
      </div>

      {searchParams.booked && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          Booking created. We'll confirm via email once payment goes through.
        </div>
      )}

      <Section title="Upcoming" bookings={upcoming} empty="No upcoming bookings." />
      <Section title="Past & cancelled" bookings={past} empty="No past bookings yet." />
    </div>
  );
}

function Section({
  title,
  bookings,
  empty,
}: {
  title: string;
  bookings: Awaited<ReturnType<typeof getBookings>>;
  empty: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {bookings.length === 0 ? (
        <p className="text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id} className="rounded border border-slate-200 bg-white p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{b.service.name}</span>
                <StatusPill status={b.status} />
              </div>
              <div className="mt-1 text-sm text-slate-600">
                With {b.washer.user.name} ·{" "}
                {b.startsAt.toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {b.addressLine} · {formatCents(b.priceCents)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "CONFIRMED" ? "bg-green-100 text-green-700" :
    status === "PENDING" ? "bg-amber-100 text-amber-700" :
    status === "COMPLETED" ? "bg-slate-100 text-slate-700" :
    status === "CANCELLED" ? "bg-red-100 text-red-700" :
    "bg-blue-100 text-blue-700";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>{status}</span>;
}

// Type helper so the generic Section gets the right shape
async function getBookings(customerId: string) {
  return prisma.booking.findMany({
    where: { customerId },
    include: { washer: { include: { user: true } }, service: true },
  });
}
