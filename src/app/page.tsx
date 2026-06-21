import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-8 py-16 text-white shadow-lg">
        <h1 className="text-4xl font-bold sm:text-5xl">Mobile car wash, on your schedule.</h1>
        <p className="mt-4 max-w-xl text-lg text-brand-50">
          Book a vetted local washer who comes to you. Or list your own service and start earning.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/washers"
            className="rounded-md bg-white px-5 py-3 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Book a wash
          </Link>
          <Link
            href="/auth/signup?role=WASHER"
            className="rounded-md border border-white px-5 py-3 font-semibold text-white hover:bg-white/10"
          >
            Become a washer
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <Feature title="On-demand" body="Pick a slot, enter your address, the washer shows up." />
        <Feature title="Transparent pricing" body="Know the price before you book. No surprises." />
        <Feature title="Trusted reviews" body="Two-sided ratings. Verified by completed bookings only." />
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}
