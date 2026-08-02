import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProposalBasicsForm } from "@/components/proposals/proposal-basics-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientRow = {
  id: string;
  company_name: string;
  contact_name: string;
};

function getDefaultValidUntil() {
  const date = new Date();

  date.setUTCDate(date.getUTCDate() + 14);

  return date.toISOString().slice(0, 10);
}

export default async function NewProposalPage() {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  if (claimsError || !ownerId) {
    redirect("/login");
  }

  const [
    companyResult,
    clientsResult,
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id, currency")
      .eq("owner_id", ownerId)
      .maybeSingle(),

    supabase
      .from("clients")
      .select(
        `
          id,
          company_name,
          contact_name
        `,
      )
      .eq("owner_id", ownerId)
      .order("company_name", {
        ascending: true,
      }),
  ]);

  if (companyResult.error) {
    console.error(
      "Failed to load company for proposal form:",
      companyResult.error,
    );
  }

  if (!companyResult.data) {
    redirect("/settings/company");
  }

  if (clientsResult.error) {
    console.error(
      "Failed to load clients for proposal form:",
      clientsResult.error,
    );
  }

  const clientRows =
    (clientsResult.data ?? []) as ClientRow[];

  const clients = clientRows.map((client) => ({
    id: client.id,
    companyName: client.company_name,
    contactName: client.contact_name,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
        href="/proposals"
      >
        <ArrowLeft className="size-4" />
        Back to proposals
      </Link>

      <div className="mb-7 mt-5">
        <p className="text-sm font-semibold text-[var(--brand)]">
          Proposals
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Create proposal draft
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Add the project foundation first. You will
          configure pricing and content after the draft is
          created.
        </p>
      </div>

      <ProposalBasicsForm
        clients={clients}
        currency={companyResult.data.currency}
        defaultValidUntil={getDefaultValidUntil()}
      />
    </div>
  );
}