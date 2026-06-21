# Sparkle — Mobile Car Wash Marketplace (MVP)

A two-sided marketplace connecting customers with mobile car washers. Built with Next.js 14 (App Router), TypeScript, Tailwind, Prisma, PostgreSQL, Auth.js v5, and Stripe Connect (mockable).

This is a working MVP scaffold. Auth, booking, availability, and Stripe-ready payment intent creation are all wired end-to-end. The booking flow is **race-condition-safe** at the database level via a Postgres `EXCLUDE` constraint.

---

## Prerequisites

- Node.js 20+ (Auth.js v5 needs ESM)
- PostgreSQL 14+ with the `btree_gist` extension available
- npm (or pnpm)

> **Important:** the `btree_gist` extension is what makes double-booking impossible at the DB level. Most hosted Postgres providers (Neon, Supabase, RDS, local Docker `postgres:16`) ship with it and it just needs to be enabled — `CREATE EXTENSION IF NOT EXISTS btree_gist;` is in the migration so this happens automatically.

---

## First-time setup

```bash
# 1. Install
cd carwash-marketplace
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL and NEXTAUTH_SECRET. Stripe keys are optional in dev.

# 3. Create the database (one option — adjust to your setup)
createdb carwash

# 4. Generate Prisma client + apply migrations
npx prisma migrate dev --name init
# This will create the schema and run the no_overlap_constraint SQL migration
# that adds the EXCLUDE constraint on the Booking table.

# 5. Seed sample data (3 washers, 2 customers, 1 sample booking)
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open http://localhost:3000.

### Test accounts (after seeding)

All seeded accounts use the password **`password123`**.

| Role     | Email                |
|----------|----------------------|
| Customer | `alice@example.com`  |
| Customer | `bob@example.com`    |
| Washer   | `wendy@example.com`  |
| Washer   | `raj@example.com`    |
| Washer   | `mia@example.com`    |

---

## Walking the booking flow

1. Sign in as `alice@example.com`.
2. Click **Find a wash** → pick a washer → pick a service → **Book**.
3. Pick a date (within the washer's availability), time, address, submit.
4. You'll be redirected to `/dashboard/customer` with the booking listed as `PENDING`.
5. To simulate Stripe paying:
   ```bash
   # 1. Create the payment intent (real or mocked depending on STRIPE_SECRET_KEY):
   curl -X POST http://localhost:3000/api/stripe/checkout \
     -H "Content-Type: application/json" \
     -H "Cookie: <copy from your browser>" \
     -d '{"bookingId":"<id from dashboard>"}'

   # 2. Fire a fake webhook to mark it CONFIRMED (only works in mock mode —
   #    real mode requires a valid Stripe signature):
   curl -X POST http://localhost:3000/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_mock_<bookingId>","metadata":{"bookingId":"<bookingId>"}}}}'
   ```
6. Refresh the dashboard — booking is now `CONFIRMED`.

### Test the no-overlap constraint

Try booking the same washer for an overlapping time as a second customer (`bob@example.com`). The DB will reject the insert and you'll see the friendly **"That slot was just taken"** error.

---

## What's mocked vs real

| Concern              | MVP scaffold                                                | For production                                                                |
|----------------------|-------------------------------------------------------------|-------------------------------------------------------------------------------|
| Auth                 | ✅ Auth.js v5, bcrypt, Credentials provider                  | Add OAuth (Google/Apple), email verification, password reset                  |
| DB                   | ✅ Prisma + Postgres + `EXCLUDE` no-overlap constraint       | Add PostGIS for geo queries, indexes for hot paths                            |
| Payments             | 🟡 Stripe SDK wired, mocked when `STRIPE_SECRET_KEY` is unset | Set Stripe keys, run real `/connect/onboard` flow with account links          |
| Stripe Connect       | 🟡 Stub: writes a fake `acct_mock_*` ID                      | Real Express account creation + onboarding link                               |
| Webhook signature    | 🟡 Skipped in mock mode                                      | Always verify in production (already handled by `verifyAndParseWebhook`)      |
| Maps / distance      | ❌ Lat/lng stored, no UI yet                                  | Mapbox or Google Maps for nearby washers, drive-time estimates                |
| Notifications        | ❌                                                           | Twilio (SMS) + Resend (email) on booking, reminder, completion                |
| Real-time tracking   | ❌                                                           | Mapbox + websocket / Pusher                                                   |
| In-app chat          | ❌                                                           | Booking-scoped thread; Twilio Proxy to mask phone numbers                     |
| Reviews              | 🟡 Schema only, no UI                                        | Two-sided review UI on completed bookings                                     |
| Mobile apps          | ❌ Web (responsive)                                          | React Native or PWA push                                                      |

---

## Architecture notes

### Why the EXCLUDE constraint matters

Booking systems break down under concurrent load — two customers click "Book 10:00" at the exact same millisecond and your check-then-insert logic creates two overlapping bookings. The fix is a Postgres `EXCLUDE USING gist` constraint that makes overlapping ranges *physically impossible* at the database layer. See `prisma/migrations/20260617000000_no_overlap_constraint/migration.sql`. The application code (`src/lib/bookings.ts`) catches `SQLSTATE 23P01` and returns a clean 409 to the client.

### Idempotency keys

`POST /api/bookings` accepts an `Idempotency-Key` header. Retries with the same key return the original `bookingId` instead of creating a duplicate. The booking form generates a `randomUUID()` per submission.

### Booking status lifecycle

```
PENDING ──(Stripe webhook payment_intent.succeeded)──> CONFIRMED
   │                                                      │
   │── customer/washer cancels ──> CANCELLED              │
                                                          ▼
                                                   IN_PROGRESS ──> COMPLETED ──> Review enabled
```

---

## Project layout

```
carwash-marketplace/
├── prisma/
│   ├── schema.prisma            # Models: User, WasherProfile, Service, Availability, Booking, Review, IdempotencyKey
│   ├── seed.ts                  # 3 washers + 2 customers + sample booking
│   └── migrations/
│       └── 20260617000000_no_overlap_constraint/
│           └── migration.sql    # btree_gist + EXCLUDE constraint
├── src/
│   ├── app/
│   │   ├── layout.tsx, page.tsx          # Root + landing
│   │   ├── auth/{signin,signup}/page.tsx
│   │   ├── washers/page.tsx              # List
│   │   ├── washers/[id]/page.tsx         # Detail
│   │   ├── book/[serviceId]/page.tsx     # Booking flow
│   │   ├── dashboard/{customer,washer}/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── bookings/route.ts
│   │       ├── bookings/[id]/cancel/route.ts
│   │       ├── services/route.ts
│   │       ├── availability/route.ts
│   │       ├── stripe/connect/onboard/route.ts
│   │       ├── stripe/checkout/route.ts
│   │       └── webhooks/stripe/route.ts
│   ├── auth.ts                  # Auth.js v5 config (Credentials + JWT)
│   ├── middleware.ts            # Protects /dashboard/*
│   └── lib/
│       ├── prisma.ts            # Singleton Prisma client
│       ├── bookings.ts          # createBooking (transactional + idempotency + 23P01 → 409)
│       ├── stripe.ts            # Real Stripe SDK or in-process mock
│       └── utils.ts             # cn, formatCents, platform fee math
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
└── .env.example
```

---

## Roadmap (NOT in this MVP)

- Real-time washer GPS tracking (Mapbox + websockets)
- In-app messaging (Twilio Proxy)
- Email/SMS notifications for booking lifecycle (Resend + Twilio)
- Two-sided rating UI + dispute flow
- Native mobile apps
- Admin moderation dashboard
- Insurance/refund automation
- Sales tax via Stripe Tax
- Distance-based washer search using PostGIS (`ST_DWithin`)

---

## License

MIT — but this is a scaffold. Get a lawyer before launching for real (washer classification, insurance, ToS, privacy, sales tax).
