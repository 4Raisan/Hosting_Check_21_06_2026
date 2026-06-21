import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { stripeMocked } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function WasherDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard/washer");
  if (session.user.role !== "WASHER") {
    return (
      <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        This dashboard is for washers. <a href="/dashboard/customer" className="underline">Go to your customer dashboard</a>.
      </div>
    );
  }

  const profile = await prisma.washerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      services: { orderBy: { priceCents: "asc" } },
      availability: { orderBy: { dayOfWeek: "asc" } },
      bookings: {
        include: { customer: true, service: true },
        orderBy: { startsAt: "desc" },
        take: 20,
      },
    },
  });
  if (!profile) {
    return <div className="p-8">Profile missing. Contact support.</div>;
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Washer dashboard</h1>

      {/* Stripe Connect status */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Payouts</h2>
        {profile.stripeAccountId ? (
          <p className="mt-1 text-sm text-green-700">
            Stripe Connect linked ({profile.stripeAccountId}).
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-600">
              You need to link a Stripe account to receive payouts.
              {stripeMocked && <span className="ml-1 text-amber-700">(Stripe is in mock mode — this just sets a fake ID.)</span>}
            </p>
            <form
              action={async () => {
                "use server";
                // Stub: in production, redirect to Stripe Connect onboarding URL.
                await prisma.washerProfile.update({
                  where: { id: profile.id },
                  data: { stripeAccountId: `acct_mock_${profile.id.slice(0, 8)}` },
                });
                revalidatePath("/dashboard/washer");
              }}
              className="mt-3"
            >
              <button className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
                Link Stripe account
              </button>
            </form>
          </>
        )}
      </section>

      {/* Services CRUD */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Services</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {profile.services.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{s.name} {!s.active && <span className="ml-2 text-xs text-slate-500">(hidden)</span>}</div>
                <div className="text-sm text-slate-500">{s.durationMin} min · {formatCents(s.priceCents)}</div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await prisma.service.update({
                    where: { id: s.id },
                    data: { active: !s.active },
                  });
                  revalidatePath("/dashboard/washer");
                }}
              >
                <button className="text-sm text-brand-600 hover:underline">
                  {s.active ? "Hide" : "Activate"}
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form
          action={async (fd) => {
            "use server";
            const name = String(fd.get("name") ?? "");
            const durationMin = Number(fd.get("durationMin") ?? 30);
            const priceCents = Math.round(Number(fd.get("priceDollars") ?? 0) * 100);
            if (!name || !priceCents) return;
            await prisma.service.create({
              data: { washerId: profile.id, name, durationMin, priceCents },
            });
            revalidatePath("/dashboard/washer");
          }}
          className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4"
        >
          <input name="name" placeholder="Service name" className="rounded border border-slate-300 px-3 py-2" required />
          <input name="durationMin" type="number" defaultValue={60} className="rounded border border-slate-300 px-3 py-2" />
          <input name="priceDollars" type="number" step="0.01" placeholder="Price ($)" className="rounded border border-slate-300 px-3 py-2" required />
          <button className="rounded bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Add service
          </button>
        </form>
      </section>

      {/* Availability */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Weekly availability</h2>
        <p className="text-xs text-slate-500">One row per day, recurring every week.</p>
        <ul className="mt-3 divide-y divide-slate-100">
          {profile.availability.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][a.dayOfWeek]}</span>
              <span className="text-slate-500">{a.startTime} – {a.endTime}</span>
              <form
                action={async () => {
                  "use server";
                  await prisma.availability.delete({ where: { id: a.id } });
                  revalidatePath("/dashboard/washer");
                }}
              >
                <button className="text-xs text-red-600 hover:underline">Remove</button>
              </form>
            </li>
          ))}
        </ul>
        <form
          action={async (fd) => {
            "use server";
            const dow = Number(fd.get("dow"));
            const startTime = String(fd.get("startTime") ?? "");
            const endTime = String(fd.get("endTime") ?? "");
            if (!startTime || !endTime) return;
            await prisma.availability.create({
              data: { washerId: profile.id, dayOfWeek: dow, startTime, endTime },
            });
            revalidatePath("/dashboard/washer");
          }}
          className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4"
        >
          <select name="dow" className="rounded border border-slate-300 px-3 py-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((n, i) => (
              <option key={i} value={i}>{n}</option>
            ))}
          </select>
          <input name="startTime" type="time" defaultValue="09:00" className="rounded border border-slate-300 px-3 py-2" />
          <input name="endTime" type="time" defaultValue="18:00" className="rounded border border-slate-300 px-3 py-2" />
          <button className="rounded bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Add slot
          </button>
        </form>
      </section>

      {/* Bookings */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Recent bookings</h2>
        {profile.bookings.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No bookings yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {profile.bookings.map((b) => (
              <li key={b.id} className="py-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{b.service.name}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-500">{b.status}</span>
                </div>
                <div className="text-sm text-slate-600">
                  {b.customer.name} · {b.startsAt.toLocaleString()}
                </div>
                <div className="text-sm text-slate-500">
                  Earns {formatCents(b.priceCents - b.platformFeeCents)} (after {formatCents(b.platformFeeCents)} platform fee)
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
