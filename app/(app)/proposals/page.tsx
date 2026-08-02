import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CircleCheckBig,
  Clock3,
  FileText,
  Plus,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired";

type ProposalsPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    created?: string | string[];
  }>;
};

type ProposalClient = {
  company_name: string;
  contact_name: string;
};

type ProposalRow = {
  id: string;
  proposal_number: string;
  project_title: string;
  status: ProposalStatus;
  total: number | string;
  currency: string;
  valid_until: string;
  updated_at: string;
  client: ProposalClient | null;
};

type ProposalQueryRow = Omit<
  ProposalRow,
  "client"
> & {
  client:
    | ProposalClient
    | ProposalClient[]
    | null;
};

const proposalStatuses: ProposalStatus[] = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
];

const statusLabels: Record<
  ProposalStatus,
  string
> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

const statusClasses: Record<
  ProposalStatus,
  string
> = {
  draft:
    "border-slate-200 bg-slate-50 text-slate-700",
  sent:
    "border-blue-200 bg-blue-50 text-blue-700",
  viewed:
    "border-amber-200 bg-amber-50 text-amber-700",
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected:
    "border-red-200 bg-red-50 text-red-700",
  expired:
    "border-zinc-200 bg-zinc-100 text-zinc-600",
};

function getSingleValue(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] : value;
}

function isProposalStatus(
  value: string | undefined,
): value is ProposalStatus {
  return proposalStatuses.includes(
    value as ProposalStatus,
  );
}

function formatMoney(
  value: number | string,
  currency: string,
) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ProposalStatusBadge({
  status,
}: {
  status: ProposalStatus;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div className="grid size-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
          <Icon className="size-5" />
        </div>
      </div>
    </article>
  );
}

function normalizeClient(
  client: ProposalQueryRow["client"],
): ProposalClient | null {
  if (Array.isArray(client)) {
    return client[0] ?? null;
  }

  return client;
}

export default async function ProposalsPage({
  searchParams,
}: ProposalsPageProps) {
  const params = await searchParams;

  const wasCreated =
    getSingleValue(params.created) === "1";

  const requestedStatus = getSingleValue(
    params.status,
  );

  const activeStatus = isProposalStatus(
    requestedStatus,
  )
    ? requestedStatus
    : null;

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  if (claimsError || !ownerId) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("proposals")
    .select(
      `
        id,
        proposal_number,
        project_title,
        status,
        total,
        currency,
        valid_until,
        updated_at,
        client:clients!proposals_client_id_fkey (
          company_name,
          contact_name
        )
      `,
    )
    .eq("owner_id", ownerId)
    .order("updated_at", {
      ascending: false,
    });

  const proposalRows =
    (data ?? []) as ProposalQueryRow[];

  const proposals: ProposalRow[] =
    proposalRows.map((proposal) => ({
      ...proposal,
      client: normalizeClient(
        proposal.client,
      ),
    }));

  const visibleProposals = activeStatus
    ? proposals.filter(
        (proposal) =>
          proposal.status === activeStatus,
      )
    : proposals;

  const activeProposals = proposals.filter(
    (proposal) =>
      proposal.status === "sent" ||
      proposal.status === "viewed",
  );

  const acceptedProposals = proposals.filter(
    (proposal) =>
      proposal.status === "accepted",
  );

  const acceptedValue =
    acceptedProposals.reduce(
      (sum, proposal) =>
        sum + Number(proposal.total),
      0,
    );

  const summaryCurrency =
    acceptedProposals[0]?.currency ??
    proposals[0]?.currency ??
    "USD";

  const filters: Array<{
    label: string;
    value: ProposalStatus | null;
  }> = [
    {
      label: "All",
      value: null,
    },
    ...proposalStatuses.map((status) => ({
      label: statusLabels[status],
      value: status,
    })),
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand)]">
            Workspace
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Proposals
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Create, send and track commercial proposals
            from one workspace.
          </p>
        </div>

        <Button
          asChild
          className="w-full sm:w-auto"
        >
          <Link href="/proposals/new">
            <Plus className="size-4" />
            New proposal
          </Link>
        </Button>
      </div>

      {wasCreated ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Proposal draft created successfully.
        </div>
      ) : null}

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={FileText}
          label="Total proposals"
          value={String(proposals.length)}
        />

        <SummaryCard
          icon={Send}
          label="Sent and viewed"
          value={String(activeProposals.length)}
        />

        <SummaryCard
          icon={CircleCheckBig}
          label="Accepted"
          value={String(acceptedProposals.length)}
        />

        <SummaryCard
          icon={Clock3}
          label="Accepted value"
          value={formatMoney(
            acceptedValue,
            summaryCurrency,
          )}
        />
      </section>

      <nav
        aria-label="Filter proposals by status"
        className="mt-7 flex gap-2 overflow-x-auto pb-1"
      >
        {filters.map((filter) => {
          const isActive =
            activeStatus === filter.value;

          const href = filter.value
            ? `/proposals?status=${filter.value}`
            : "/proposals";

          return (
            <Link
              className={
                isActive
                  ? "shrink-0 rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
                  : "shrink-0 rounded-full border bg-white px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              }
              href={href}
              key={filter.label}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          We could not load the proposals. Refresh the page
          and try again.
        </div>
      ) : null}

      {!error && proposals.length === 0 ? (
        <section className="mt-7 grid min-h-96 place-items-center rounded-2xl border border-dashed bg-white p-8 text-center shadow-sm">
          <div className="max-w-md">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <FileText className="size-6" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Create your first proposal
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Combine client information, services and
              project content into a professional proposal.
            </p>

            <Button
              asChild
              className="mt-6"
            >
              <Link href="/proposals/new">
                <Plus className="size-4" />
                New proposal
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      {!error &&
      proposals.length > 0 &&
      visibleProposals.length === 0 ? (
        <section className="mt-7 rounded-2xl border border-dashed bg-white p-10 text-center shadow-sm">
          <h2 className="font-semibold">
            No {activeStatus} proposals
          </h2>

          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            There are currently no proposals with this
            status.
          </p>

          <Button
            asChild
            className="mt-5"
            variant="outline"
          >
            <Link href="/proposals">
              View all proposals
            </Link>
          </Button>
        </section>
      ) : null}

      {!error && visibleProposals.length > 0 ? (
        <>
          <section className="mt-7 hidden overflow-hidden rounded-2xl border bg-white shadow-sm lg:block">
            <div className="grid grid-cols-[130px_minmax(260px,1.5fr)_minmax(190px,1fr)_120px_150px_140px] gap-4 border-b bg-[var(--surface-muted)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
              <span>Number</span>
              <span>Project</span>
              <span>Client</span>
              <span>Status</span>
              <span>Value</span>
              <span>Valid until</span>
            </div>

            <div className="divide-y">
              {visibleProposals.map((proposal) => (
                <article
                  className="grid grid-cols-[130px_minmax(260px,1.5fr)_minmax(190px,1fr)_120px_150px_140px] items-center gap-4 px-5 py-4 transition hover:bg-[var(--surface-muted)]"
                  key={proposal.id}
                >
                  <span className="text-sm font-semibold text-[var(--brand-strong)]">
                    {proposal.proposal_number}
                  </span>

                  <div className="min-w-0">
                    <Link
                      className="block truncate text-sm font-semibold transition hover:text-[var(--brand-strong)]"
                      href={`/proposals/${proposal.id}/edit`}
                    >
                      {proposal.project_title}
                    </Link>

                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Updated{" "}
                      {formatDate(
                        proposal.updated_at,
                      )}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {proposal.client?.company_name ??
                        "No client"}
                    </p>

                    <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                      {proposal.client?.contact_name ??
                        "Client not assigned"}
                    </p>
                  </div>

                  <ProposalStatusBadge
                    status={proposal.status}
                  />

                  <span className="text-sm font-semibold">
                    {formatMoney(
                      proposal.total,
                      proposal.currency,
                    )}
                  </span>

                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <CalendarDays className="size-4 shrink-0" />

                    <span>
                      {formatDate(
                        proposal.valid_until,
                      )}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-7 grid gap-4 lg:hidden">
            {visibleProposals.map((proposal) => (
              <article
                className="rounded-2xl border bg-white p-5 shadow-sm"
                key={proposal.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--brand-strong)]">
                      {proposal.proposal_number}
                    </p>

                    <Link
                      className="mt-2 block text-lg font-semibold transition hover:text-[var(--brand-strong)]"
                      href={`/proposals/${proposal.id}/edit`}
                    >
                      {proposal.project_title}
                    </Link>
                  </div>

                  <ProposalStatusBadge
                    status={proposal.status}
                  />
                </div>

                <div className="mt-5 grid gap-4 border-t pt-5 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                      Client
                    </p>

                    <p className="mt-1 font-medium">
                      {proposal.client?.company_name ??
                        "No client"}
                    </p>

                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      {proposal.client?.contact_name ??
                        "Client not assigned"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                        Value
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatMoney(
                          proposal.total,
                          proposal.currency,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                        Valid until
                      </p>

                      <p className="mt-1">
                        {formatDate(
                          proposal.valid_until,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  className="mt-5 w-full"
                  size="sm"
                  variant="outline"
                >
                  <Link href={`/proposals/${proposal.id}/edit`}>
                    Edit proposal
                  </Link>
                </Button>
              </article>
            ))}
          </section>
        </>
      ) : null}

      {!error && visibleProposals.length > 0 ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {visibleProposals.length}{" "}
          {visibleProposals.length === 1
            ? "proposal"
            : "proposals"}
        </p>
      ) : null}
    </div>
  );
}