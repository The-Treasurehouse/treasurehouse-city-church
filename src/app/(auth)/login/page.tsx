import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "./actions";
import { supabaseConfigured } from "@/lib/auth";
import { firstParam } from "@/lib/format";
import { Flash, Field, SubmitButton } from "@/components/admin/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Staff sign in" };

const messages: Record<string, string> = {
  "no-access": "This account does not have staff access. Ask an admin to assign you a role.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const error = firstParam(params.error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Image src="/logo-black.png" alt={site.name} width={1755} height={187} priority className="h-7 w-auto" />
        </Link>

        <div className="rounded-2xl border border-border bg-card p-7">
          <h1 className="text-xl font-bold text-foreground">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted">Staff dashboard</p>

          <div className="mt-6">
            <Flash error={error ? (messages[error] ?? error) : undefined} />
            {!supabaseConfigured && (
              <p className="mb-6 rounded-lg bg-warning px-4 py-3 text-sm font-medium text-white">
                Supabase is not connected yet. Add the keys to .env.local to sign in.
              </p>
            )}
          </div>

          <form action={signIn} className="space-y-4">
            <Field label="Email" name="email" type="email" required />
            <Field label="Password" name="password" type="password" required />
            <div className="pt-2">
              <SubmitButton>Sign in</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
