import type { Metadata } from "next";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sparkle — Mobile Car Wash Marketplace",
  description: "Book a mobile car wash on demand. Become a washer and grow your route.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-brand-600">
              Sparkle
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/washers" className="hover:text-brand-600">Find a wash</Link>
              {session?.user ? (
                <>
                  <Link
                    href={session.user.role === "WASHER" ? "/dashboard/washer" : "/dashboard/customer"}
                    className="hover:text-brand-600"
                  >
                    Dashboard
                  </Link>
                  <span className="text-slate-500">{session.user.email}</span>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="hover:text-brand-600">Sign in</Link>
                  <Link
                    href="/auth/signup"
                    className="rounded bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          Sparkle MVP · Built for demo purposes
        </footer>
      </body>
    </html>
  );
}
