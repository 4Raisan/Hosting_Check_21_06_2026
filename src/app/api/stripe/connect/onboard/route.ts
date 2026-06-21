import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripeMocked } from "@/lib/stripe";

/**
 * POST /api/stripe/connect/onboard
 *
 * STUB: in production this would create an Express connected account via
 * `stripe.accounts.create({ type: 'express' })`, then return an account-link
 * URL the washer is redirected to. For the MVP we just stash a fake account
 * id so the rest of the flow can proceed.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WASHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await prisma.washerProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "No washer profile" }, { status: 400 });

  const fakeId = `acct_mock_${profile.id.slice(0, 10)}`;
  await prisma.washerProfile.update({
    where: { id: profile.id },
    data: { stripeAccountId: fakeId },
  });

  return NextResponse.json({
    stripeAccountId: fakeId,
    onboardingUrl: stripeMocked ? null : "https://connect.stripe.com/setup/...",
    mocked: stripeMocked,
  });
}
