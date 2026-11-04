import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile, supabaseConfigured } from "@/lib/auth";
import { adminNav, roleLabels } from "@/lib/permissions";
import { Sidebar } from "@/components/admin/Sidebar";
import { signOut } from "@/app/(auth)/login/actions";

// Every admin page depends on the signed-in user, so never prerender them.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Treasurehouse Admin" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8">
          <h1 className="text-xl font-bold text-foreground">Connect Supabase to continue</h1>
          <p className="mt-3 text-sm text-muted">
            The dashboard needs a Supabase project. Copy .env.local.example to .env.local, fill in the
            three keys, run the migrations in supabase/migrations, then sign in.
          </p>
        </div>
      </div>
    );
  }

  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role === "member") redirect("/login?error=no-access");

  const items = adminNav.filter((n) => n.roles.includes(profile.role));

  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      <Sidebar
        items={items}
        name={profile.fullName}
        roleLabel={roleLabels[profile.role]}
        signOut={signOut}
      />
      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  );
}
