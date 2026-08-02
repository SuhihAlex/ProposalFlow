import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Eye,
  FileCheck2,
  Send,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const DASHBOARD_TIME_ZONE = "Europe/Chisinau";

type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired";

type ProposalClient = {
  company_name: string;
};

type ProposalQueryRow = {
  id: string;
  proposal_number: string;
  project_title: string;
  status: ProposalStatus;
  currency: string;
  total: number | string | null;
  created_at: string;
  updated_at: string;
  client:
    | ProposalClient
    | ProposalClient[]
    | null;
};

type DashboardProposal = Omit<
  ProposalQueryRow,
  "client" | "total"
> & {
  client: ProposalClient | null;
  total: number;
};

type DashboardMetric = {
  label: string;
  value: string;
  icon: LucideIcon;
  detail: string;
};

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
    "border-zinc-200 bg-zinc-100 text-zinc-700",
  sent:
    "border-blue-200 bg-blue-50 text-blue-700",
  viewed:
    "border-amber-200 bg-amber-50 text-amber-700",
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected:
    "border-red-200 bg-red-50 text-red-700",
  expired:
    "border-zinc-200 bg-zinc-100 text-zinc-500",
};

function normalizeClient(
  client: ProposalQueryRow["client"],
): ProposalClient | null {
  if (Array.isArray(client)) {
    return client[0] ?? null;
  }

  return client;
}

function parseAmount(
  value: number | string | null,
) {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatMoney(
  value: number,
  currency: string,
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAggregateMoney(
  proposals: DashboardProposal[],
  fallbackCurrency: string,
) {
  const currencies = new Set(
    proposals.map(
      (proposal) => proposal.currency,
    ),
  );

  if (currencies.size > 1) {
    return "Mixed";
  }

  const currency =
    currencies.values().next().value ??
    fallbackCurrency;

  const total = proposals.reduce(
    (sum, proposal) =>
      sum + proposal.total,
    0,
  );

  return formatMoney(total, currency);
}

function formatDashboardDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: DASHBOARD_TIME_ZONE,
  }).format(date);
}

function formatProposalDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: DASHBOARD_TIME_ZONE,
  }).format(new Date(value));
}

function getGreeting(date: Date) {
  const hourText =
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: DASHBOARD_TIME_ZONE,
    }).format(date);

  const hour = Number(hourText);

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function isCreatedThisMonth(
  value: string,
  now: Date,
) {
  const proposalDate = new Date(value);

  const monthFormatter =
    new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      year: "numeric",
      timeZone: DASHBOARD_TIME_ZONE,
    });

  return (
    monthFormatter.format(proposalDate) ===
    monthFormatter.format(now)
  );
}

export default async function DashboardPage() {
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
    proposalsResult,
    companyResult,
  ] = await Promise.all([
    supabase
      .from("proposals")
      .select(
        `
          id,
          proposal_number,
          project_title,
          status,
          currency,
          total,
          created_at,
          updated_at,
          client:clients (
            company_name
          )
        `,
      )
      .eq("owner_id", ownerId)
      .order("updated_at", {
        ascending: false,
      }),

    supabase
      .from("companies")
      .select("name, currency")
      .eq("owner_id", ownerId)
      .maybeSingle(),
  ]);

  if (proposalsResult.error) {
    console.error(
      "Failed to load dashboard proposals:",
      proposalsResult.error,
    );

    throw new Error(
      "Failed to load dashboard proposals.",
    );
  }

  if (companyResult.error) {
    console.error(
      "Failed to load dashboard company:",
      companyResult.error,
    );
  }

  const proposalRows =
    (proposalsResult.data ??
      []) as ProposalQueryRow[];

  const proposals: DashboardProposal[] =
    proposalRows.map((proposal) => ({
      ...proposal,
      total: parseAmount(proposal.total),
      client: normalizeClient(
        proposal.client,
      ),
    }));

  const now = new Date();

  const companyName =
    companyResult.data?.name ??
    "your workspace";

  const companyCurrency =
    companyResult.data?.currency ?? "USD";

  const totalCount = proposals.length;

  const createdThisMonth =
    proposals.filter((proposal) =>
      isCreatedThisMonth(
        proposal.created_at,
        now,
      ),
    ).length;

  const sentCount = proposals.filter(
    (proposal) =>
      proposal.status === "sent",
  ).length;

  const viewedOnlyCount =
    proposals.filter(
      (proposal) =>
        proposal.status === "viewed",
    ).length;

  const acceptedCount =
    proposals.filter(
      (proposal) =>
        proposal.status === "accepted",
    ).length;

  const rejectedCount =
    proposals.filter(
      (proposal) =>
        proposal.status === "rejected",
    ).length;

  const publishedProposals =
    proposals.filter(
      (proposal) =>
        proposal.status !== "draft",
    );

  const engagedProposals =
    proposals.filter((proposal) =>
      [
        "viewed",
        "accepted",
        "rejected",
      ].includes(proposal.status),
    );

  const activePipeline =
    proposals.filter((proposal) =>
      ["sent", "viewed"].includes(
        proposal.status,
      ),
    );

  const acceptedProposals =
    proposals.filter(
      (proposal) =>
        proposal.status === "accepted",
    );

  const viewRate =
    publishedProposals.length > 0
      ? Math.round(
          (engagedProposals.length /
            publishedProposals.length) *
            100,
        )
      : 0;

  const sentShare =
    publishedProposals.length > 0
      ? Math.round(
          (sentCount /
            publishedProposals.length) *
            100,
        )
      : 0;

  const pipelineValue =
    formatAggregateMoney(
      activePipeline,
      companyCurrency,
    );

  const acceptedValue =
    formatAggregateMoney(
      acceptedProposals,
      companyCurrency,
    );

  const latestEngagedProposal =
    engagedProposals[0] ?? null;

  const metrics: DashboardMetric[] = [
    {
      label: "Total proposals",
      value: String(totalCount),
      icon: FileCheck2,
      detail: `${createdThisMonth} created this month`,
    },
    {
      label: "Sent",
      value: String(sentCount),
      icon: Send,
      detail: `${sentShare}% of published proposals`,
    },
    {
      label: "Client activity",
      value: String(
        engagedProposals.length,
      ),
      icon: Eye,
      detail: latestEngagedProposal
        ? `Latest activity ${formatProposalDate(
            latestEngagedProposal.updated_at,
          )}`
        : "No client activity yet",
    },
    {
      label: "Pipeline value",
      value: pipelineValue,
      icon: TrendingUp,
      detail: `${acceptedValue} accepted`,
    },
  ];

  const recentProposals =
    proposals.slice(0, 5);

  const otherCount =
    totalCount -
    acceptedCount -
    viewedOnlyCount -
    sentCount;

  const acceptedPercentage =
    totalCount > 0
      ? (acceptedCount / totalCount) * 100
      : 0;

  const viewedPercentage =
    totalCount > 0
      ? (viewedOnlyCount / totalCount) *
        100
      : 0;

  const sentPercentage =
    totalCount > 0
      ? (sentCount / totalCount) * 100
      : 0;

  const acceptedEnd =
    acceptedPercentage;

  const viewedEnd =
    acceptedEnd + viewedPercentage;

  const sentEnd =
    viewedEnd + sentPercentage;

  const donutBackground =
    totalCount > 0
      ? `conic-gradient(
          var(--brand) 0 ${acceptedEnd}%,
          #8fb8ae ${acceptedEnd}% ${viewedEnd}%,
          #d6dfd8 ${viewedEnd}% ${sentEnd}%,
          #eceee9 ${sentEnd}% 100%
        )`
      : "#eceee9";

  const statusOverview = [
    {
      label: "Accepted",
      value: acceptedCount,
    },
    {
      label: "Viewed",
      value: viewedOnlyCount,
    },
    {
      label: "Sent",
      value: sentCount,
    },
    {
      label: "Other",
      value: otherCount,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        action={
          <Button asChild>
            <Link href="/proposals/new">
              Create proposal

              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
        description={`A focused view of proposal activity for ${companyName}.`}
        eyebrow={formatDashboardDate(now)}
        title={getGreeting(now)}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(
          ({
            label,
            value,
            icon: Icon,
            detail,
          }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {label}
                  </p>

                  <div className="grid size-9 place-items-center rounded-xl bg-[var(--surface-muted)]">
                    <Icon className="size-4" />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-[-0.05em]">
                  {value}
                </p>

                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {detail}
                </p>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between border-b p-5">
            <div>
              <CardTitle>
                Recent proposals
              </CardTitle>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Latest workspace activity
              </p>
            </div>

            <Button
              asChild
              size="sm"
              variant="ghost"
            >
              <Link href="/proposals">
                View all
              </Link>
            </Button>
          </CardHeader>

          {recentProposals.length > 0 ? (
            <div className="divide-y">
              {recentProposals.map(
                (proposal) => (
                  <Link
                    className="grid gap-3 px-5 py-4 transition hover:bg-[#fafbf8] sm:grid-cols-[minmax(0,1fr)_140px_110px_100px] sm:items-center"
                    href={`/proposals/${proposal.id}/edit`}
                    key={proposal.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {
                          proposal.project_title
                        }
                      </p>

                      <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                        {proposal.client
                          ?.company_name ??
                          "No client"}
                      </p>
                    </div>

                    <p className="text-sm text-[var(--muted-foreground)]">
                      {formatProposalDate(
                        proposal.updated_at,
                      )}
                    </p>

                    <p className="text-sm font-semibold">
                      {formatMoney(
                        proposal.total,
                        proposal.currency,
                      )}
                    </p>

                    <Badge
                      className={`w-fit ${statusClasses[proposal.status]}`}
                    >
                      {
                        statusLabels[
                          proposal.status
                        ]
                      }
                    </Badge>
                  </Link>
                ),
              )}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center px-5 py-12 text-center">
              <div>
                <FileCheck2 className="mx-auto size-9 text-[var(--muted-foreground)]" />

                <h3 className="mt-4 font-semibold">
                  No proposals yet
                </h3>

                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Create your first proposal
                  to start tracking activity.
                </p>

                <Button
                  asChild
                  className="mt-5"
                  size="sm"
                >
                  <Link href="/proposals/new">
                    Create proposal
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Status overview
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-5">
            <div className="grid place-items-center py-3">
              <div
                className="grid size-44 place-items-center rounded-full"
                style={{
                  background:
                    donutBackground,
                }}
              >
                <div className="grid size-32 place-items-center rounded-full bg-white text-center">
                  <div>
                    <p className="text-3xl font-bold">
                      {viewRate}%
                    </p>

                    <p className="text-xs text-[var(--muted-foreground)]">
                      view rate
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 text-sm">
              {statusOverview.map(
                ({ label, value }) => (
                  <div
                    className="flex justify-between"
                    key={label}
                  >
                    <span className="text-[var(--muted-foreground)]">
                      {label}
                    </span>

                    <span className="font-semibold">
                      {value}
                    </span>
                  </div>
                ),
              )}
            </div>

            {rejectedCount > 0 ? (
              <p className="border-t pt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                {rejectedCount}{" "}
                {rejectedCount === 1
                  ? "proposal has"
                  : "proposals have"}{" "}
                been declined.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
