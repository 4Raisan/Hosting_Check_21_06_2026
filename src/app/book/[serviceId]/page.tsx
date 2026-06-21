import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import { createBooking } from "@/lib/bookings";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export default async function BookServicePage({
  params,
  searchParams,
}: {
  params: { serviceId: string };
  searchParams: { error?: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/book/${params.serviceId}`);
  }

  const service = await prisma.service.findUnique({
    where: { id: params.serviceId },
    include: { washer: { include: { user: true, availability: true } } },
  });
  if (!service) {
    return <div className="p-8 text-slate-600">Service not found.</div>;
  }

  const today = new Date();
  // Suggest 14 days of slot dates
  const dateOptions: { iso: string; label: string }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(10, 0, 0, 0);
    dateOptions.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Book: {service.name}</h1>
        <p className="text-sm text-slate-600">
          With {service.washer.user.name} · {service.durationMin} min ·{" "}
          <span className="font-semibold">{formatCents(service.priceCents)}</span>
        </p>
      </header>

      {searchParams.error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}

      <form
        action={async (formData) => {
          "use server";
          const session2 = await auth();
          if (!session2?.user) redirect(`/auth/signin?callbackUrl=/book/${params.serviceId}`);

          const date = String(formData.get("date") ?? "");
          const time = String(formData.get("time") ?? "");
          const address = String(formData.get("address") ?? "");
          if (!date || !time || !address) {
            redirect(`/book/${params.serviceId}?error=${encodeURIComponent("All fields are required")}`);
          }

          const startsAt = new Date(`${date}T${time}:00`);
          const idempotencyKey = randomUUID();

          const result = await createBooking({
            customerId: session2.user.id,
            serviceId: params.serviceId,
            startsAt,
            addressLine: address,
            idempotencyKey,
          });

          if (!result.ok) {
            redirect(`/book/${params.serviceId}?error=${encodeURIComponent(result.message)}`);
          }
          redirect(`/dashboard/customer?booked=${result.bookingId}`);
        }}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <label className="block">
          <span className="text-sm font-medium">Date</span>
          <select name="date" className="mt-1 block w-full rounded border border-slate-300 px-3 py-2">
            {dateOptions.map((d) => (
              <option key={d.iso} value={d.iso}>{d.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Time</span>
          <input
            type="time"
            name="time"
            defaultValue="10:00"
            min="09:00"
            max="17:00"
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Service address</span>
          <input
            name="address"
            placeholder="123 Main St, Brooklyn, NY"
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-slate-600">You'll be charged on confirmation.</span>
          <button
            type="submit"
            className="rounded bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Confirm booking
          </button>
        </div>
      </form>
    </div>
  );
}
