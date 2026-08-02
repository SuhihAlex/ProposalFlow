"use client";

import {
  LoaderCircle,
  Save,
} from "lucide-react";
import { useActionState } from "react";

import {
  updateProposalDetailsAction,
  type ProposalDetailsActionState,
} from "@/app/(app)/proposals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ProposalDetailsActionState = {
  status: "idle",
  message: "",
};

export type ProposalClientOption = {
  id: string;
  companyName: string;
  contactName: string;
};

export type ProposalDetailsFormValues = {
  clientId: string;
  projectTitle: string;
  brief: string;
  validUntil: string;
};

type ProposalDetailsFormProps = {
  proposalId: string;
  editable: boolean;
  clients: ProposalClientOption[];
  defaultValues: ProposalDetailsFormValues;
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

export function ProposalDetailsForm({
  proposalId,
  editable,
  clients,
  defaultValues,
}: ProposalDetailsFormProps) {
  const action =
    updateProposalDetailsAction.bind(
      null,
      proposalId,
    );

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5 sm:p-6">
        <h2 className="text-lg font-semibold">
          Proposal details
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Manage the client, project description and
          proposal validity period.
        </p>
      </div>

      {!editable ? (
        <div className="border-b bg-amber-50 px-5 py-4 text-sm text-amber-800 sm:px-6">
          This proposal is no longer a draft. Its details
          are read-only.
        </div>
      ) : null}

      <form
        action={formAction}
        className="grid gap-5 p-5 sm:p-6"
        noValidate
      >
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
          <Label htmlFor="proposal-details-client">
            Client
          </Label>

          <select
            aria-describedby={
              state.fieldErrors?.clientId
                ? "proposal-details-client-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.clientId,
            )}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:opacity-70 focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
            defaultValue={defaultValues.clientId}
            disabled={!editable}
            id="proposal-details-client"
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
            id="proposal-details-client-error"
            message={state.fieldErrors?.clientId}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="proposal-details-title">
            Project title
          </Label>

          <Input
            aria-describedby={
              state.fieldErrors?.projectTitle
                ? "proposal-details-title-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.projectTitle,
            )}
            defaultValue={defaultValues.projectTitle}
            disabled={!editable}
            id="proposal-details-title"
            name="projectTitle"
            required
          />

          <FieldError
            id="proposal-details-title-error"
            message={
              state.fieldErrors?.projectTitle
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="proposal-details-brief">
            Project brief
          </Label>

          <textarea
            aria-describedby={
              state.fieldErrors?.brief
                ? "proposal-details-brief-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.brief,
            )}
            className="min-h-44 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:opacity-70 placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
            defaultValue={defaultValues.brief}
            disabled={!editable}
            id="proposal-details-brief"
            maxLength={5000}
            name="brief"
          />

          <div className="flex justify-between gap-4">
            <FieldError
              id="proposal-details-brief-error"
              message={state.fieldErrors?.brief}
            />

            <p className="ml-auto text-xs text-[var(--muted-foreground)]">
              Maximum 5000 characters
            </p>
          </div>
        </div>

        <div className="grid gap-2 md:max-w-xs">
          <Label htmlFor="proposal-details-valid-until">
            Valid until
          </Label>

          <Input
            aria-describedby={
              state.fieldErrors?.validUntil
                ? "proposal-details-valid-until-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.validUntil,
            )}
            defaultValue={defaultValues.validUntil}
            disabled={!editable}
            id="proposal-details-valid-until"
            name="validUntil"
            required
            type="date"
          />

          <FieldError
            id="proposal-details-valid-until-error"
            message={state.fieldErrors?.validUntil}
          />
        </div>

        {editable ? (
          <div className="flex justify-end border-t pt-5">
            <Button
              disabled={pending}
              type="submit"
            >
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save details
                </>
              )}
            </Button>
          </div>
        ) : null}
      </form>
    </section>
  );
}