import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { PublicProposalResponseForm } from "@/components/proposals/public-proposal-response-form";

export const dynamic = "force-dynamic";

type ProposalStatus =
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

type PublicProposalItem = {
  id: string;
  name: string;
  description: string;
  quantity: number | string;
  unit: ProposalUnit;
  unitPrice: number | string;
  lineTotal: number | string;
};

type PublicProposal = {
  proposalNumber: string;
  projectTitle: string;
  brief: string;
  status: ProposalStatus;
  currency: string;
  validUntil: string;
  subtotal: number | string;
  discountType:
    | "none"
    | "percentage"
    | "fixed";
  discountValue: number | string;
  total: number | string;
  client: {
    companyName: string;
    contactName: string;
  } | null;
  items: PublicProposalItem[];
};

type PublicProposalPageProps = {
  params: Promise<{
    publicToken: string;
  }>;

  searchParams: Promise<{
    preview?: string | string[];
    response?: string | string[];
  }>;
};

const unitLabels: Record<ProposalUnit, string> = {
  project: "project",
  hour: "hour",
  day: "day",
  page: "page",
  month: "month",
  item: "item",
};

const statusLabels: Record<
  ProposalStatus,
  string
> = {
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
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getDiscountLabel(
  proposal: PublicProposal,
) {
  if (proposal.discountType === "percentage") {
    return `${Number(proposal.discountValue)}%`;
  }

  if (proposal.discountType === "fixed") {
    return formatMoney(
      proposal.discountValue,
      proposal.currency,
    );
  }

  return "No discount";
}

export default async function PublicProposalPage({
  params,
  searchParams,
}: PublicProposalPageProps) {
  const { publicToken } = await params;
  const query = await searchParams;

  const previewRequested =
    getSingleValue(query.preview) === "1";

  const responseResult =
    getSingleValue(query.response);

  if (
    !publicToken ||
    publicToken.length < 16 ||
    publicToken.length > 200
  ) {
    notFound();
  }

  const supabase = await createClient();

  let isOwnerPreview = false;

  if (previewRequested) {
    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const ownerId = claimsData?.claims?.sub;

    if (!claimsError && ownerId) {
      const {
        data: ownedProposal,
        error: ownerCheckError,
      } = await supabase
        .from("proposals")
        .select("id")
        .eq("public_token", publicToken)
        .eq("owner_id", ownerId)
        .maybeSingle();

      if (ownerCheckError) {
        console.error(
          "Failed to verify proposal preview owner:",
          ownerCheckError,
        );
      }

      isOwnerPreview = Boolean(ownedProposal);
    }
  }

  const { data, error } = isOwnerPreview
    ? await supabase.rpc(
        "get_public_proposal",
        {
          p_public_token: publicToken,
        },
      )
    : await supabase.rpc(
        "open_public_proposal",
        {
          p_public_token: publicToken,
        },
      );

  if (error) {
    console.error(
      "Failed to load public proposal:",
      error,
    );

    notFound();
  }

  if (!data) {
    notFound();
  }

  const proposal =
    data as unknown as PublicProposal;

  return (
    <main className="min-h-screen bg-[var(--surface-muted)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--foreground)] text-white">
              <FileText className="size-5" />
            </div>

            <div>
              <p className="font-semibold">
                ProposalFlow
              </p>

              <p className="text-xs text-[var(--muted-foreground)]">
                Commercial proposal
              </p>
            </div>
          </div>

          <span
            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses[proposal.status]}`}
          >
            {statusLabels[proposal.status]}
          </span>
        </header>

        {responseResult === "accepted" ? (
          <div
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            Thank you. The proposal has been accepted.
          </div>
        ) : null}

        {responseResult === "rejected" ? (
          <div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="status"
          >
            Your response has been recorded.
          </div>
        ) : null}

        <article className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <section className="border-b px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            <p className="text-sm font-semibold text-[var(--brand-strong)]">
              {proposal.proposalNumber}
            </p>

            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {proposal.projectTitle}
            </h1>

            {proposal.client ? (
              <div className="mt-6 flex items-start gap-3">
                <UserRound className="mt-0.5 size-5 shrink-0 text-[var(--muted-foreground)]" />

                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Prepared for
                  </p>

                  <p className="mt-1 font-semibold">
                    {proposal.client.companyName}
                  </p>

                  <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                    {proposal.client.contactName}
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 border-b bg-[var(--surface-muted)] px-5 py-5 sm:grid-cols-2 sm:px-8 lg:px-12">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-[var(--muted-foreground)]" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Valid until
                </p>

                <p className="mt-1 font-semibold">
                  {formatDate(
                    proposal.validUntil,
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--muted-foreground)]" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Proposal value
                </p>

                <p className="mt-1 font-semibold">
                  {formatMoney(
                    proposal.total,
                    proposal.currency,
                  )}
                </p>
              </div>
            </div>
          </section>

          {proposal.brief ? (
            <section className="border-b px-5 py-7 sm:px-8 lg:px-12">
              <h2 className="text-lg font-semibold">
                Project overview
              </h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--muted-foreground)]">
                {proposal.brief}
              </p>
            </section>
          ) : null}

          <section className="border-b px-5 py-7 sm:px-8 lg:px-12">
            <h2 className="text-lg font-semibold">
              Scope and pricing
            </h2>

            {proposal.items.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed p-6 text-center text-sm text-[var(--muted-foreground)]">
                No pricing items were added.
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {proposal.items.map((item) => (
                  <article
                    className="rounded-xl border p-4 sm:p-5"
                    key={item.id}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {item.name}
                        </h3>

                        {item.description ? (
                          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                            {item.description}
                          </p>
                        ) : null}
                      </div>

                      <p className="shrink-0 text-lg font-semibold">
                        {formatMoney(
                          item.lineTotal,
                          proposal.currency,
                        )}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-xs text-[var(--muted-foreground)]">
                      <span>
                        Quantity:{" "}
                        {Number(item.quantity)}{" "}
                        {unitLabels[item.unit]}
                      </span>

                      <span>
                        Unit price:{" "}
                        {formatMoney(
                          item.unitPrice,
                          proposal.currency,
                        )}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="ml-auto mt-6 max-w-md rounded-xl border bg-[var(--surface-muted)] p-5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-[var(--muted-foreground)]">
                  Subtotal
                </span>

                <span className="font-semibold">
                  {formatMoney(
                    proposal.subtotal,
                    proposal.currency,
                  )}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                <span className="text-[var(--muted-foreground)]">
                  Discount
                </span>

                <span className="font-semibold">
                  {getDiscountLabel(proposal)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-2xl font-semibold tracking-tight">
                  {formatMoney(
                    proposal.total,
                    proposal.currency,
                  )}
                </span>
              </div>
            </div>
          </section>

          {isOwnerPreview ? (
            <section className="border-b bg-blue-50 px-5 py-6 text-sm text-blue-800 sm:px-8 lg:px-12">
              You are viewing the owner preview. Client response
              controls are hidden.
            </section>
          ) : proposal.status === "sent" ||
            proposal.status === "viewed" ? (
            <section className="border-b px-5 py-8 sm:px-8 lg:px-12">
              <PublicProposalResponseForm
                defaultClientName={
                  proposal.client?.contactName ?? ""
                }
                publicToken={publicToken}
              />
            </section>
          ) : proposal.status === "accepted" ? (
            <section className="border-b bg-emerald-50 px-5 py-8 text-center sm:px-8 lg:px-12">
              <CheckCircle2 className="mx-auto size-9 text-emerald-600" />

              <h2 className="mt-4 text-xl font-semibold text-emerald-900">
                Proposal accepted
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-emerald-800">
                The response has been recorded. The proposal owner
                can now continue with the next project steps.
              </p>
            </section>
          ) : proposal.status === "rejected" ? (
            <section className="border-b bg-red-50 px-5 py-8 text-center sm:px-8 lg:px-12">
              <h2 className="text-xl font-semibold text-red-900">
                Proposal declined
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-red-700">
                The response has been recorded and shared with the
                proposal owner.
              </p>
            </section>
          ) : (
            <section className="border-b bg-zinc-100 px-5 py-8 text-center sm:px-8 lg:px-12">
              <h2 className="text-xl font-semibold">
                Proposal expired
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                This proposal can no longer receive a response.
              </p>
            </section>
          )}

          <footer className="px-5 py-6 text-center sm:px-8 lg:px-12">
            <p className="text-xs text-[var(--muted-foreground)]">
              This proposal was prepared and shared
              securely through ProposalFlow.
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}