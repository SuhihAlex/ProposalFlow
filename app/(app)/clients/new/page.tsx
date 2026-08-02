import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ClientForm } from "@/components/clients/client-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  if (claimsError || !ownerId) {
    redirect("/login");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (!company) {
    redirect("/settings/company");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
        href="/clients"
      >
        <ArrowLeft className="size-4" />
        Back to clients
      </Link>

      <div className="mb-7 mt-5">
        <p className="text-sm font-semibold text-[var(--brand)]">
          Clients
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Add a new client
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Store the client details that will later be used
          when creating and sending proposals.
        </p>
      </div>

      <ClientForm />
    </div>
  );
}