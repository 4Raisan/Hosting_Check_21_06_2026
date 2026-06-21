import { signIn } from "@/auth";
import Link from "next/link";

export default function SignInPage({ searchParams }: { searchParams: { callbackUrl?: string; error?: string } }) {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-slate-600">Welcome back.</p>

      {searchParams.error && (
        <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Invalid email or password.
        </div>
      )}

      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: searchParams.callbackUrl ?? "/dashboard/customer",
          });
        }}
        className="mt-6 space-y-4"
      >
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <button
          type="submit"
          className="w-full rounded bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          Sign in
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        No account?{" "}
        <Link href="/auth/signup" className="text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
      />
    </label>
  );
}
