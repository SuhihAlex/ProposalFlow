"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

import {
  signInAction,
  signUpAction,
  type AuthActionState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {
  status: "idle",
  message: "",
};

type FieldErrorProps = {
  id: string;
  message?: string;
};

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

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

type LoginFormProps = {
  next?: string;
  routeError?: string;
};

export function LoginForm({
  next = "/dashboard",
  routeError,
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialState,
  );

  const displayedState: AuthActionState =
    state.status === "idle" && routeError
      ? {
          status: "error",
          message: routeError,
        }
      : state;

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <input name="next" type="hidden" value={next} />

      <StatusMessage state={displayedState} />

      <div className="grid gap-2">
        <Label htmlFor="login-email">Email</Label>

        <Input
          aria-describedby={
            state.fieldErrors?.email ? "login-email-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          id="login-email"
          name="email"
          placeholder="you@company.com"
          required
          type="email"
        />

        <FieldError
          id="login-email-error"
          message={state.fieldErrors?.email}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>

          <Link
            className="text-xs font-semibold text-[var(--brand)]"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        <Input
          aria-describedby={
            state.fieldErrors?.password
              ? "login-password-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete="current-password"
          id="login-password"
          name="password"
          placeholder="Enter your password"
          required
          type="password"
        />

        <FieldError
          id="login-password-error"
          message={state.fieldErrors?.password}
        />
      </div>

      <Button
        className="mt-1 w-full"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            Log in
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        New to ProposalFlow?{" "}
        <Link
          className="font-semibold text-[var(--foreground)]"
          href="/register"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <StatusMessage state={state} />

      <div className="grid gap-2">
        <Label htmlFor="register-full-name">Full name</Label>

        <Input
          aria-describedby={
            state.fieldErrors?.fullName
              ? "register-full-name-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
          autoComplete="name"
          id="register-full-name"
          name="fullName"
          placeholder="Alex Morgan"
          required
        />

        <FieldError
          id="register-full-name-error"
          message={state.fieldErrors?.fullName}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-email">Work email</Label>

        <Input
          aria-describedby={
            state.fieldErrors?.email
              ? "register-email-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          id="register-email"
          name="email"
          placeholder="you@company.com"
          required
          type="email"
        />

        <FieldError
          id="register-email-error"
          message={state.fieldErrors?.email}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="register-password">Password</Label>

        <Input
          aria-describedby={
            state.fieldErrors?.password
              ? "register-password-error"
              : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete="new-password"
          id="register-password"
          name="password"
          placeholder="At least 8 characters"
          required
          type="password"
        />

        <FieldError
          id="register-password-error"
          message={state.fieldErrors?.password}
        />
      </div>

      <Button
        className="mt-1 w-full"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{" "}
        <Link
          className="font-semibold text-[var(--foreground)]"
          href="/login"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}