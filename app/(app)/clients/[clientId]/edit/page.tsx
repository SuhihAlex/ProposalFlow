import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  ClientForm,
  type ClientFormValues,
} from "@/components/clients/client-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EditClientPageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

export default async function EditClientPage({
  params,
}: EditClientPageProps) {
  const { clientId } = await params;

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  if (claimsError || !ownerId) {
    redirect("/login");
  }

  const { data: client, error } = await supabase
    .from("clients")
    .select(
      `
        id,
        company_name,
        contact_name,
        email,
        notes
      `,
    )
    .eq("id", clientId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load client:", error);
    notFound();
  }

  if (!client) {
    notFound();
  }

  const defaultValues: ClientFormValues = {
    companyName: client.company_name,
    contactName: client.contact_name,
    email: client.email,
    notes: client.notes,
  };

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
          Edit client
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Update the information for{" "}
          <span className="font-medium text-[var(--foreground)]">
            {client.company_name}
          </span>
          .
        </p>
      </div>

      <ClientForm
        clientId={client.id}
        defaultValues={defaultValues}
        mode="edit"
      />
    </div>
  );
}