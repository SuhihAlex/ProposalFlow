"use client";

import {
  CheckCircle2,
  Circle,
  LoaderCircle,
  Send,
} from "lucide-react";
import { useActionState } from "react";

import {
  markProposalSentAction,
  type ProposalLifecycleActionState,
} from "@/app/(app)/proposals/actions";
import { Button } from "@/components/ui/button";

type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired";

type ProposalStatusActionsProps = {
  proposalId: string;
  status: ProposalStatus;
  hasClient: boolean;
  itemCount: number;
  total: number | string;
  currency: string;
};

const initialState: ProposalLifecycleActionState = {
  status: "idle",
  message: "",
};

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

function ReadinessItem({
  ready,
  children,
}: {
  ready: boolean;
  children: React.ReactNode;
}) {
  const Icon = ready ? CheckCircle2 : Circle;

  return (
    <li className="flex items-center gap-2 text-sm">
      <Icon
        className={
          ready
            ? "size-4 shrink-0 text-emerald-600"
            : "size-4 shrink-0 text-[var(--muted-foreground)]"
        }
      />

      <span
        className={
          ready
            ? "text-[var(--foreground)]"
            : "text-[var(--muted-foreground)]"
        }
      >
        {children}
      </span>
    </li>
  );
}

export function ProposalStatusActions({
  proposalId,
  status,
  hasClient,
  itemCount,
  total,
  currency,
}: ProposalStatusActionsProps) {
  const action = markProposalSentAction.bind(
    null,
    proposalId,
  );

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  const hasItems = itemCount > 0;
  const hasPositiveTotal =
    Number.isFinite(Number(total)) &&
    Number(total) > 0;

  const isReady =
    hasClient &&
    hasItems &&
    hasPositiveTotal;

  if (status !== "draft") {
    return (
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
            <Send className="size-4" />
          </div>

          <div>
            <h2 className="font-semibold">
              Proposal is {status}
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              This proposal has left draft mode and its
              content is now read-only.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Finalize proposal
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Review the proposal readiness checks before
            moving it out of draft mode.
          </p>

          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            <ReadinessItem ready={hasClient}>
              Client assigned
            </ReadinessItem>

            <ReadinessItem ready={hasItems}>
              {itemCount}{" "}
              {itemCount === 1 ? "pricing item" : "pricing items"}
            </ReadinessItem>

            <ReadinessItem ready={hasPositiveTotal}>
              Total {formatMoney(total, currency)}
            </ReadinessItem>
          </ul>
        </div>

        <form
          action={formAction}
          className="shrink-0"
          onSubmit={(event) => {
            const confirmed = window.confirm(
              "Mark this proposal as sent? Its details and pricing will become read-only.",
            );

            if (!confirmed) {
              event.preventDefault();
            }
          }}
        >
          <Button
            className="w-full lg:w-auto"
            disabled={pending || !isReady}
            type="submit"
          >
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Mark as sent
              </>
            )}
          </Button>
        </form>
      </div>

      {state.status === "error" &&
      state.message ? (
        <div
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      {!isReady ? (
        <p className="mt-4 text-xs text-amber-700">
          Complete every readiness check before marking
          the proposal as sent.
        </p>
      ) : null}
    </section>
  );
}