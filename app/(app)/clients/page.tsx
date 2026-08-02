import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  Mail,
  Pencil,
  Plus,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteClientButton } from "@/components/clients/delete-client-button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientsPageProps = {
  searchParams: Promise<{
    created?: string | string[];
    updated?: string | string[];
    deleted?: string | string[];
  }>;
};

type ClientRow = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  notes: string;
  created_at: string;
};

function getSingleValue(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] : value;
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ClientAvatar({
  companyName,
}: {
  companyName: string;
}) {
  const initials = companyName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand-strong)]">
      {initials || "CL"}
    </div>
  );
}

export default async function ClientsPage({
  searchParams,
}: ClientsPageProps) {
  const params = await searchParams;
  const wasCreated =
    getSingleValue(params.created) === "1";

  const wasUpdated =
    getSingleValue(params.updated) === "1";

  const wasDeleted =
    getSingleValue(params.deleted) === "1";

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  if (claimsError || !ownerId) {
    redirect("/login");
  }

  const {
    data,
    error,
  } = await supabase
    .from("clients")
    .select(
      `
        id,
        company_name,
        contact_name,
        email,
        notes,
        created_at
      `,
    )
    .eq("owner_id", ownerId)
    .order("created_at", {
      ascending: false,
    });

  const clients = (data ?? []) as ClientRow[];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand)]">
            Workspace
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Clients
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Manage the companies and contacts used in your
            commercial proposals.
          </p>
        </div>

        <Button
          asChild
          className="w-full sm:w-auto"
        >
          <Link href="/clients/new">
            <Plus className="size-4" />
            Add client
          </Link>
        </Button>
      </div>

      {wasCreated ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Client created successfully.
        </div>
      ) : null}

      {wasUpdated ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Client updated successfully.
        </div>
      ) : null}

      {wasDeleted ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Client deleted successfully.
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          We could not load the clients. Refresh the page
          and try again.
        </div>
      ) : null}

      {!error && clients.length === 0 ? (
        <section className="mt-7 grid min-h-96 place-items-center rounded-2xl border border-dashed bg-white p-8 text-center shadow-sm">
          <div className="max-w-md">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Users className="size-6" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Add your first client
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Client profiles keep contact information and
              project context ready for your next proposal.
            </p>

            <Button
              asChild
              className="mt-6"
            >
              <Link href="/clients/new">
                <Plus className="size-4" />
                Add client
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      {!error && clients.length > 0 ? (
        <>
          <section className="mt-7 hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block">
            <div className="grid grid-cols-[minmax(240px,1.4fr)_minmax(190px,1fr)_minmax(220px,1fr)_130px_96px] border-b bg-[var(--surface-muted)]  px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
              <span>Company</span>
              <span>Contact</span>
              <span>Email</span>
              <span>Created</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="grid grid-cols-[minmax(240px,1.4fr)_minmax(190px,1fr)_minmax(220px,1fr)_130px_96px] items-center gap-4 px-5 py-4 transition hover:bg-[var(--surface-muted)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ClientAvatar
                      companyName={client.company_name}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {client.company_name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                        {client.notes ||
                          "No notes added"}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-2 text-sm">
                    <UserRound className="size-4 shrink-0 text-[var(--muted-foreground)]" />

                    <span className="truncate">
                      {client.contact_name}
                    </span>
                  </div>

                  <a
                    className="flex min-w-0 items-center gap-2 text-sm text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                    href={`mailto:${client.email}`}
                  >
                    <Mail className="size-4 shrink-0" />

                    <span className="truncate">
                      {client.email}
                    </span>
                  </a>

                  <span className="text-sm text-[var(--muted-foreground)]">
                    {formatCreatedAt(
                      client.created_at,
                    )}
                  </span>

                  <div className="flex justify-end gap-2">
                    <Button
                      asChild
                      aria-label={`Edit ${client.company_name}`}
                      size="icon"
                      variant="outline"
                    >
                      <Link href={`/clients/${client.id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>

                    <DeleteClientButton
                      clientId={client.id}
                      companyName={client.company_name}
                      compact
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7 grid gap-4 md:hidden">
            {clients.map((client) => (
              <article
                key={client.id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <ClientAvatar
                    companyName={client.company_name}
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold">
                      {client.company_name}
                    </h2>

                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Added{" "}
                      {formatCreatedAt(
                        client.created_at,
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <UserRound className="size-4 shrink-0 text-[var(--muted-foreground)]" />
                    <span>{client.contact_name}</span>
                  </div>

                  <a
                    className="flex min-w-0 items-center gap-3 text-[var(--muted-foreground)]"
                    href={`mailto:${client.email}`}
                  >
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">
                      {client.email}
                    </span>
                  </a>

                  {client.notes ? (
                    <div className="flex items-start gap-3 border-t pt-3 text-[var(--muted-foreground)]">
                      <Building2 className="mt-0.5 size-4 shrink-0" />

                      <p className="line-clamp-3 leading-6">
                        {client.notes}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex gap-3 border-t pt-4">
                  <Button
                    asChild
                    className="flex-1"
                    size="sm"
                    variant="outline"
                  >
                    <Link href={`/clients/${client.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>

                  <DeleteClientButton
                    clientId={client.id}
                    companyName={client.company_name}
                  />
                </div>
              </article>
            ))}
          </section>
        </>
      ) : null}

      {!error && clients.length > 0 ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {clients.length}{" "}
          {clients.length === 1 ? "client" : "clients"}
        </p>
      ) : null}
    </div>
  );
}