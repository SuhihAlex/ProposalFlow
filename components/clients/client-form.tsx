"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  ArrowLeft,
  LoaderCircle,
  Save,
} from "lucide-react";

import {
  createClientAction,
  updateClientAction,
  type ClientActionState,
} from "@/app/(app)/clients/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ClientActionState = {
  status: "idle",
  message: "",
};

export type ClientFormValues = {
  companyName: string;
  contactName: string;
  email: string;
  notes: string;
};

type ClientFormProps = {
  mode?: "create" | "edit";
  clientId?: string;
  defaultValues?: ClientFormValues;
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
      id={id}
      className="text-xs font-medium text-red-600"
    >
      {message}
    </p>
  );
}

function StatusMessage({
  state,
}: {
  state: ClientActionState;
}) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {state.message}
    </div>
  );
}

export function ClientForm({
  mode = "create",
  clientId,
  defaultValues = {
    companyName: "",
    contactName: "",
    email: "",
    notes: "",
  },
}: ClientFormProps) {
  const action =
    mode === "edit" && clientId
      ? updateClientAction.bind(null, clientId)
      : createClientAction;

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  const isEditing = mode === "edit";

  return (
    <form
      action={formAction}
      className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Client information
        </h2>

        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {isEditing
            ? "Update the contact and company information used in proposals."
            : "Add the main contact details used when preparing commercial proposals."}
        </p>
      </div>

      <div className="grid gap-5">
        <StatusMessage state={state} />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="client-company-name">
              Company
            </Label>

            <Input
              aria-describedby={
                state.fieldErrors?.companyName
                  ? "client-company-name-error"
                  : undefined
              }
              aria-invalid={Boolean(
                state.fieldErrors?.companyName,
              )}
              autoComplete="organization"
              defaultValue={defaultValues.companyName}
              id="client-company-name"
              name="companyName"
              placeholder="Acme Corporation"
              required
            />

            <FieldError
              id="client-company-name-error"
              message={state.fieldErrors?.companyName}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client-contact-name">
              Contact person
            </Label>

            <Input
              aria-describedby={
                state.fieldErrors?.contactName
                  ? "client-contact-name-error"
                  : undefined
              }
              aria-invalid={Boolean(
                state.fieldErrors?.contactName,
              )}
              autoComplete="name"
              defaultValue={defaultValues.contactName}
              id="client-contact-name"
              name="contactName"
              placeholder="Anna Johnson"
              required
            />

            <FieldError
              id="client-contact-name-error"
              message={state.fieldErrors?.contactName}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="client-email">
            Contact email
          </Label>

          <Input
            aria-describedby={
              state.fieldErrors?.email
                ? "client-email-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.email,
            )}
            autoComplete="email"
            defaultValue={defaultValues.email}
            id="client-email"
            name="email"
            placeholder="anna@acme.com"
            required
            type="email"
          />

          <FieldError
            id="client-email-error"
            message={state.fieldErrors?.email}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="client-notes">
            Notes
          </Label>

          <textarea
            aria-describedby={
              state.fieldErrors?.notes
                ? "client-notes-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.notes,
            )}
            className="min-h-36 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
            defaultValue={defaultValues.notes}
            id="client-notes"
            maxLength={3000}
            name="notes"
            placeholder="Project context, preferences or useful background information."
          />

          <div className="flex justify-between gap-4">
            <FieldError
              id="client-notes-error"
              message={state.fieldErrors?.notes}
            />

            <p className="ml-auto text-xs text-[var(--muted-foreground)]">
              Maximum 3000 characters
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
          <Button
            asChild
            type="button"
            variant="outline"
          >
            <Link href="/clients">
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
                {isEditing ? "Saving..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {isEditing
                  ? "Save changes"
                  : "Create client"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}