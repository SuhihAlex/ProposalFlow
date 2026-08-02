import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsData?.claims;
  const userId = claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", userId)
    .maybeSingle();

  const email =
    typeof claims.email === "string"
      ? claims.email
      : "";

  const displayName =
    profile?.full_name?.trim() ||
    email.split("@")[0] ||
    "ProposalFlow user";

  return (
    <AppShell
      user={{
        displayName,
        email,
        plan: profile?.plan ?? "free",
      }}
    >
      {children}
    </AppShell>
  );
}