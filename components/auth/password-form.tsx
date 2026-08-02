"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";

import {
  requestPasswordResetAction,
  updatePasswordAction,
  type AuthActionState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {
  status: "idle",
  message: "",
};

function StatusMessage({ state }: { state: AuthActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const isError = state.status === "error";

  return (
    <div
      aria-live="polite"
      className={
        isError
          ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
      }
      role={isError ? "alert" : "status"}
    >
      {state.message}
    </div>
  );
}

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
    <p id={id} className="text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <StatusMessage state={state} />

      <div className="grid gap-2">
        <Label htmlFor="recovery-email">Email</Label>

        <Input
          aria-describedby={
            state.fieldErrors?.email
              ? "recovery-email-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          id="recovery-email"
          name="email"
          placeholder="you@company.com"
          required
          type="email"
        />

        <FieldError
          id="recovery-email-error"
          message={state.fieldErrors?.email}
        />
      </div>

      <Button disabled={pending} type="submit">
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Sending link...
          </>
        ) : (
          "Send recovery link"
        )}
      </Button>

      <Button asChild variant="ghost">
        <Link href="/login">
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <StatusMessage state={state} />

      <div className="grid gap-2">
        <Label htmlFor="new-password">New password</Label>

        <Input
          aria-describedby={
            state.fieldErrors?.password
              ? "new-password-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete="new-password"
          id="new-password"
          name="password"
          placeholder="At least 8 characters"
          required
          type="password"
        />

        <FieldError
          id="new-password-error"
          message={state.fieldErrors?.password}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm password</Label>

        <Input
          aria-describedby={
            state.fieldErrors?.confirmPassword
              ? "confirm-password-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          autoComplete="new-password"
          id="confirm-password"
          name="confirmPassword"
          placeholder="Repeat your password"
          required
          type="password"
        />

        <FieldError
          id="confirm-password-error"
          message={state.fieldErrors?.confirmPassword}
        />
      </div>

      <Button disabled={pending} type="submit">
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Updating password...
          </>
        ) : (
          "Update password"
        )}
      </Button>

      {state.status === "success" ? (
        <Button asChild variant="outline">
          <Link href="/login">Continue to login</Link>
        </Button>
      ) : null}
    </form>
  );
}