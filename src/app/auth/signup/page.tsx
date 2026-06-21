import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import Link from "next/link";

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(["CUSTOMER", "WASHER"]).default("CUSTOMER"),
});

export default function SignUpPage({ searchParams }: { searchParams: { role?: string; error?: string } }) {
  const defaultRole = searchParams.role === "WASHER" ? "WASHER" : "CUSTOMER";

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600">
        {defaultRole === "WASHER" ? "Sign up as a washer." : "Sign up as a customer."}
      </p>

      {searchParams.error && (
        <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error === "exists" ? "An account with that email already exists." : "Could not sign up."}
        </div>
      )}

      <form
        action={async (formData) => {
          "use server";
          const parsed = signupSchema.safeParse({
            email: formData.get("email"),
            name: formData.get("name"),
            password: formData.get("password"),
            role: formData.get("role") ?? defaultRole,
          });
          if (!parsed.success) {
            redirect(`/auth/signup?role=${defaultRole}&error=invalid`);
          }
          const data = parsed.data;

          const existing = await prisma.user.findUnique({ where: { email: data.email } });
          if (existing) {
            redirect(`/auth/signup?role=${defaultRole}&error=exists`);
          }

          const passwordHash = await bcrypt.hash(data.password, 10);
          const user = await prisma.user.create({
            data: {
              email: data.email,
              name: data.name,
              passwordHash,
              role: data.role,
            },
          });

          if (data.role === "WASHER") {
            await prisma.washerProfile.create({
              data: { userId: user.id, baseRateCents: 2500 },
            });
          }

          await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirectTo: data.role === "WASHER" ? "/dashboard/washer" : "/dashboard/customer",
          });
        }}
        className="mt-6 space-y-4"
      >
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required minLength={8} />
        <label className="block">
          <span className="text-sm font-medium text-slate-700">I am a…</span>
          <select
            name="role"
            defaultValue={defaultRole}
            className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="CUSTOMER">Customer (book washes)</option>
            <option value="WASHER">Washer (offer services)</option>
          </select>
        </label>
        <button
          type="submit"
          className="w-full rounded bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          Create account
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-brand-600 hover:underline">
          Sign in
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
