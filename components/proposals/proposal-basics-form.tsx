"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  ArrowLeft,
  FilePlus2,
  LoaderCircle,
} from "lucide-react";

import {
  createProposalAction,
  type ProposalActionState,
} from "@/app/(app)/proposals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ProposalActionState = {
  status: "idle",
  message: "",
};

type ProposalClientOption = {
  id: string;
  companyName: string;
  contactName: string;
};

type ProposalBasicsFormProps = {
  clients: ProposalClientOption[];
  currency: string;
  defaultValidUntil: string;
};

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className="text-xs font-medium text-red-600"
      id={id}
    >
      {message}
    </p>
  );
}

export function ProposalBasicsForm({
  clients,
  currency,
  defaultValidUntil,
}: ProposalBasicsFormProps) {
  const [state, formAction, pending] = useActionState(
    createProposalAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Proposal information
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Start with the project basics. Services, pricing
          and proposal sections will be added afterward.
        </p>
      </div>

      <div className="grid gap-5">
        {state.status === "error" &&
        state.message ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="proposal-client">
            Client
          </Label>

          <select
            aria-describedby={
              state.fieldErrors?.clientId
                ? "proposal-client-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.clientId,
            )}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
            defaultValue=""
            id="proposal-client"
            name="clientId"
          >
            <option value="">
              No client selected
            </option>

            {clients.map((client) => (
              <option
                key={client.id}
                value={client.id}
              >
                {client.companyName} —{" "}
                {client.contactName}
              </option>
            ))}
          </select>

          <FieldError
            id="proposal-client-error"
            message={state.fieldErrors?.clientId}
          />

          {clients.length === 0 ? (
            <p className="text-xs text-amber-700">
              No clients are available. You may create the
              draft without a client and assign one later.
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="proposal-project-title">
            Project title
          </Label>

          <Input
            aria-describedby={
              state.fieldErrors?.projectTitle
                ? "proposal-project-title-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.projectTitle,
            )}
            id="proposal-project-title"
            name="projectTitle"
            placeholder="New website design and development"
            required
          />

          <FieldError
            id="proposal-project-title-error"
            message={
              state.fieldErrors?.projectTitle
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="proposal-brief">
            Project brief
          </Label>

          <textarea
            aria-describedby={
              state.fieldErrors?.brief
                ? "proposal-brief-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.brief,
            )}
            className="min-h-44 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
            id="proposal-brief"
            maxLength={5000}
            name="brief"
            placeholder="Describe the client's situation, objectives, constraints and expected result."
          />

          <div className="flex justify-between gap-4">
            <FieldError
              id="proposal-brief-error"
              message={state.fieldErrors?.brief}
            />

            <p className="ml-auto text-xs text-[var(--muted-foreground)]">
              Maximum 5000 characters
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="proposal-valid-until">
              Valid until
            </Label>

            <Input
              aria-describedby={
                state.fieldErrors?.validUntil
                  ? "proposal-valid-until-error"
                  : undefined
              }
              aria-invalid={Boolean(
                state.fieldErrors?.validUntil,
              )}
              defaultValue={defaultValidUntil}
              id="proposal-valid-until"
              name="validUntil"
              required
              type="date"
            />

            <FieldError
              id="proposal-valid-until-error"
              message={state.fieldErrors?.validUntil}
            />
          </div>

          <div className="grid gap-2">
            <Label>Proposal currency</Label>

            <div className="flex h-10 items-center rounded-xl border bg-[var(--surface-muted)] px-3 text-sm font-semibold">
              {currency}
            </div>

            <p className="text-xs text-[var(--muted-foreground)]">
              Currency is inherited from Company Settings.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
          <Button
            asChild
            type="button"
            variant="outline"
          >
            <Link href="/proposals">
              <ArrowLeft className="size-4" />
              Cancel
            </Link>
          </Button>

          <Button
            disabled={pending}
            type="submit"
          >
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Creating draft...
              </>
            ) : (
              <>
                <FilePlus2 className="size-4" />
                Create draft
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}