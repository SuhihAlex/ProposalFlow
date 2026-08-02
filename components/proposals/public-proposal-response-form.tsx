"use client";

import {
  CheckCircle2,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { useActionState } from "react";

import {
  respondToPublicProposalAction,
  type PublicProposalResponseActionState,
} from "@/app/p/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState:
  PublicProposalResponseActionState = {
    status: "idle",
    message: "",
  };

type PublicProposalResponseFormProps = {
  publicToken: string;
  defaultClientName: string;
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

export function PublicProposalResponseForm({
  publicToken,
  defaultClientName,
}: PublicProposalResponseFormProps) {
  const action =
    respondToPublicProposalAction.bind(
      null,
      publicToken,
    );

  const [state, formAction, pending] =
    useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-5"
      noValidate
    >
      <div>
        <h2 className="text-xl font-semibold">
          Respond to proposal
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Confirm whether you would like to proceed.
          Your response is final for this proposal.
        </p>
      </div>

      {state.status === "error" &&
      state.message ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="response-client-name">
            Your name
          </Label>

          <Input
            aria-describedby={
              state.fieldErrors?.clientName
                ? "response-client-name-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.clientName,
            )}
            defaultValue={defaultClientName}
            id="response-client-name"
            maxLength={120}
            name="clientName"
            placeholder="Your full name"
            required
          />

          <FieldError
            id="response-client-name-error"
            message={state.fieldErrors?.clientName}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="response-client-email">
            Your email
          </Label>

          <Input
            aria-describedby={
              state.fieldErrors?.clientEmail
                ? "response-client-email-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.clientEmail,
            )}
            id="response-client-email"
            maxLength={320}
            name="clientEmail"
            placeholder="name@company.com"
            required
            type="email"
          />

          <FieldError
            id="response-client-email-error"
            message={
              state.fieldErrors?.clientEmail
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="response-client-comment">
          Comment{" "}
          <span className="font-normal text-[var(--muted-foreground)]">
            (optional)
          </span>
        </Label>

        <textarea
          aria-describedby={
            state.fieldErrors?.clientComment
              ? "response-client-comment-error"
              : undefined
          }
          aria-invalid={Boolean(
            state.fieldErrors?.clientComment,
          )}
          className="min-h-32 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
          id="response-client-comment"
          maxLength={2000}
          name="clientComment"
          placeholder="Add questions, conditions or additional context."
        />

        <div className="flex justify-between gap-4">
          <FieldError
            id="response-client-comment-error"
            message={
              state.fieldErrors?.clientComment
            }
          />

          <p className="ml-auto text-xs text-[var(--muted-foreground)]">
            Maximum 2000 characters
          </p>
        </div>
      </div>

      <FieldError
        id="response-choice-error"
        message={state.fieldErrors?.response}
      />

      <div className="grid gap-3 border-t pt-5 sm:grid-cols-2">
        <Button
          disabled={pending}
          name="response"
          type="submit"
          value="accepted"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}

          Accept proposal
        </Button>

        <Button
          disabled={pending}
          name="response"
          onClick={(event) => {
            const confirmed = window.confirm(
              "Decline this proposal? This response is final.",
            );

            if (!confirmed) {
              event.preventDefault();
            }
          }}
          type="submit"
          value="rejected"
          variant="outline"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <XCircle className="size-4" />
          )}

          Decline proposal
        </Button>
      </div>
    </form>
  );
}