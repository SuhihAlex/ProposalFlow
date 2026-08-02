import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  MessageSquareText,
  UserRound,
} from "lucide-react";

import {
  ProposalPricingEditor,
  type ProposalPricingItem,
  type ProposalServiceOption,
} from "@/components/proposals/proposal-pricing-editor";
import { createClient } from "@/lib/supabase/server";

import {
  ProposalDetailsForm,
  type ProposalClientOption,
  type ProposalDetailsFormValues,
} from "@/components/proposals/proposal-details-form";

import { ProposalStatusActions } from "@/components/proposals/proposal-status-actions";

import { ProposalPublicLink } from "@/components/proposals/proposal-public-link";

export const dynamic = "force-dynamic";

type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired";

type ProposalUnit =
  | "project"
  | "hour"
  | "day"
  | "page"
  | "month"
  | "item";

type EditProposalPageProps = {
  params: Promise<{
    proposalId: string;
  }>;

  searchParams: Promise<{
    created?: string | string[];
    item?: string | string[];
    details?: string | string[];
    discount?: string | string[];
    lifecycle?: string | string[];
  }>;
};

type ProposalRow = {
  id: string;
  client_id: string | null;
  public_token: string;
  proposal_number: string;
  project_title: string;
  brief: string;
  status: ProposalStatus;
  currency: string;
  valid_until: string;
  subtotal: number | string;
  discount_type:
    | "none"
    | "percentage"
    | "fixed";
  discount_value: number | string;
  total: number | string;
};

type ProposalItemRow = {
  id: string;
  name: string;
  description: string;
  quantity: number | string;
  unit: ProposalUnit;
  unit_price: number | string;
  line_total: number | string;
};

type ServiceRow = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  unit: ProposalUnit;
  category: string;
};

type ClientRow = {
  id: string;
  company_name: string;
  contact_name: string;
};

type ProposalResponseRow = {
  response: "accepted" | "rejected";
  responded_at: string;
  client_name: string | null;
  client_email: string | null;
  client_comment: string | null;
};

function getSingleValue(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatResponseDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

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

export default async function EditProposalPage({
  params,
  searchParams,
}: EditProposalPageProps) {
  const { proposalId } = await params;
  const query = await searchParams;

  const wasCreated =
    getSingleValue(query.created) === "1";

  const itemResult = getSingleValue(query.item);

  const detailsResult =
    getSingleValue(query.details);

  const discountResult =
    getSingleValue(query.discount);

  const lifecycleResult =
    getSingleValue(query.lifecycle);

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
    data: proposalData,
    error: proposalError,
  } = await supabase
    .from("proposals")
    .select(
      `
        id,
        client_id,
        public_token,
        proposal_number,
        project_title,
        brief,
        status,
        currency,
        valid_until,
        subtotal,
        discount_type,
        discount_value,
        total
      `,
    )
    .eq("id", proposalId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (proposalError) {
    console.error(
      "Failed to load proposal editor:",
      proposalError,
    );

    notFound();
  }

  if (!proposalData) {
    notFound();
  }

  const proposal = proposalData as ProposalRow;

  const [
    itemsResult,
    servicesResult,
    clientsResult,
    responseResult,
  ] = await Promise.all([
    supabase
      .from("proposal_items")
      .select(
        `
          id,
          name,
          description,
          quantity,
          unit,
          unit_price,
          line_total
        `,
      )
      .eq("proposal_id", proposal.id)
      .order("position", {
        ascending: true,
      }),

    supabase
      .from("services")
      .select(
        `
          id,
          name,
          description,
          price,
          unit,
          category
        `,
      )
      .eq("owner_id", ownerId)
      .order("category", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),

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

      supabase
        .from("proposal_responses")
        .select(
          `
            response,
            responded_at,
            client_name,
            client_email,
            client_comment
          `,
        )
        .eq("proposal_id", proposal.id)
        .maybeSingle(),
      ]);

  if (itemsResult.error) {
    console.error(
      "Failed to load proposal items:",
      itemsResult.error,
    );
  }

  if (servicesResult.error) {
    console.error(
      "Failed to load proposal services:",
      servicesResult.error,
    );
  }

  if (clientsResult.error) {
    console.error(
      "Failed to load proposal clients:",
      clientsResult.error,
    );
  }

  if (responseResult.error) {
    console.error(
      "Failed to load proposal response:",
      responseResult.error,
    );
  }

  const clientRows =
    (clientsResult.data ?? []) as ClientRow[];

  const clients: ProposalClientOption[] =
    clientRows.map((client) => ({
      id: client.id,
      companyName: client.company_name,
      contactName: client.contact_name,
    }));

  const proposalResponse =
    responseResult.data as ProposalResponseRow | null;

  const selectedClient = clients.find(
    (client) =>
      client.id === proposal.client_id,
  );

  const clientCompanyName =
    selectedClient?.companyName ??
    "No client assigned";

  const clientContactName =
    selectedClient?.contactName ?? "";

  const detailsDefaultValues:
    ProposalDetailsFormValues = {
      clientId: proposal.client_id ?? "",
      projectTitle: proposal.project_title,
      brief: proposal.brief,
      validUntil: proposal.valid_until,
    };

  const itemRows =
    (itemsResult.data ?? []) as ProposalItemRow[];

  const items: ProposalPricingItem[] =
    itemRows.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unit_price,
      lineTotal: item.line_total,
    }));

  const serviceRows =
    (servicesResult.data ?? []) as ServiceRow[];

  const services: ProposalServiceOption[] =
    serviceRows.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      unit: service.unit,
      category: service.category,
    }));

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
        href="/proposals"
      >
        <ArrowLeft className="size-4" />
        Back to proposals
      </Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand)]">
            {proposal.proposal_number}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {proposal.project_title}
          </h1>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusClasses[proposal.status]}`}
        >
          {proposal.status}
        </span>
      </div>

      {wasCreated ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Proposal draft created. Add services and pricing.
        </div>
      ) : null}

      {itemResult === "added" ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Service added to proposal.
        </div>
      ) : null}

      {itemResult === "deleted" ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Proposal item removed.
        </div>
      ) : null}

      {detailsResult === "updated" ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Proposal details updated.
        </div>
      ) : null}

      {discountResult === "updated" ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Proposal discount updated.
        </div>
      ) : null}

      {lifecycleResult === "sent" ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Proposal marked as sent.
        </div>
      ) : null}

      <section className="mt-7 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Proposal
          </p>

          <p className="mt-2 font-semibold">
            {proposal.proposal_number}
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <UserRound className="mt-0.5 size-4 shrink-0 text-[var(--muted-foreground)]" />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Client
              </p>

              <p className="mt-2 truncate font-semibold">
                {clientCompanyName}
              </p>

              {clientContactName ? (
                <p className="mt-1 truncate text-sm text-[var(--muted-foreground)]">
                  {clientContactName}
                </p>
              ) : null}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-[var(--muted-foreground)]" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Valid until
              </p>

              <p className="mt-2 font-semibold">
                {formatDate(proposal.valid_until)}
              </p>
            </div>
          </div>
        </article>
      </section>

      <div className="mt-6">
        <ProposalStatusActions
          currency={proposal.currency}
          hasClient={Boolean(proposal.client_id)}
          itemCount={items.length}
          proposalId={proposal.id}
          status={proposal.status}
          total={proposal.total}
        />
      </div>

      {proposal.status !== "draft" ? (
        <div className="mt-6">
          <ProposalPublicLink
            publicToken={proposal.public_token}
          />
        </div>
      ) : null}

      {proposalResponse ? (
        <section
          className={
            proposalResponse.response === "accepted"
              ? "mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6"
              : "mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm sm:p-6"
          }
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                Client response
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                {proposalResponse.response === "accepted"
                  ? "Proposal accepted"
                  : "Proposal declined"}
              </h2>
            </div>

            <span
              className={
                proposalResponse.response === "accepted"
                  ? "inline-flex w-fit rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700"
                  : "inline-flex w-fit rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700"
              }
            >
              {proposalResponse.response === "accepted"
                ? "Accepted"
                : "Rejected"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Responded by
              </p>

              <div className="mt-2 flex items-center gap-2">
                <UserRound className="size-4 shrink-0 text-[var(--muted-foreground)]" />

                <p className="font-medium">
                  {proposalResponse.client_name ??
                    "Name not provided"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Email
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-[var(--muted-foreground)]" />

                {proposalResponse.client_email ? (
                  <a
                    className="min-w-0 truncate font-medium underline-offset-4 hover:underline"
                    href={`mailto:${proposalResponse.client_email}`}
                  >
                    {proposalResponse.client_email}
                  </a>
                ) : (
                  <p className="font-medium">
                    Email not provided
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Responded at
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Clock3 className="size-4 shrink-0 text-[var(--muted-foreground)]" />

                <p className="font-medium">
                  {formatResponseDate(
                    proposalResponse.responded_at,
                  )}
                </p>
              </div>
            </div>
          </div>

          {proposalResponse.client_comment ? (
            <div className="mt-6 border-t border-current/10 pt-5">
              <div className="flex items-center gap-2">
                <MessageSquareText className="size-4 text-[var(--muted-foreground)]" />

                <h3 className="font-semibold">
                  Client comment
                </h3>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--muted-foreground)]">
                {proposalResponse.client_comment}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-6">
        <ProposalDetailsForm
          clients={clients}
          defaultValues={detailsDefaultValues}
          editable={proposal.status === "draft"}
          proposalId={proposal.id}
        />
      </div>

      <div className="mt-6">
        <ProposalPricingEditor
          currency={proposal.currency}
          discountType={proposal.discount_type}
          discountValue={proposal.discount_value}
          editable={proposal.status === "draft"}
          items={items}
          proposalId={proposal.id}
          services={services}
          subtotal={proposal.subtotal}
          total={proposal.total}
        />
      </div>
    </div>
  );
}