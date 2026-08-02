"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(80, "Name is too long."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(72, "Password is too long."),
});

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Enter your password."),
});

const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address."),
});

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(72, "Password is too long."),
    confirmPassword: z
      .string()
      .min(1, "Repeat your new password."),
  })
  .refine(
    ({ password, confirmPassword }) => password === confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

function getFirstError(errors?: string[]) {
  return errors?.[0];
}

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/dashboard";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validationResult = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        fullName: getFirstError(errors.fullName),
        email: getFirstError(errors.email),
        password: getFirstError(errors.password),
      },
    };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "http://localhost:3000";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: validationResult.data.email,
    password: validationResult.data.password,
    options: {
      data: {
        full_name: validationResult.data.fullName,
      },
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    status: "success",
    message:
      "Account created. Check your email and confirm your address before logging in.",
  };
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validationResult = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        email: getFirstError(errors.email),
        password: getFirstError(errors.password),
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validationResult.data.email,
    password: validationResult.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: "Invalid email or password.",
    };
  }

  redirect(getSafeRedirectPath(formData.get("next")));
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validationResult = resetPasswordRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted field.",
      fieldErrors: {
        email: getFirstError(errors.email),
      },
    };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "http://localhost:3000";

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    validationResult.data.email,
    {
      redirectTo: `${origin}/auth/confirm?next=/reset-password`,
    },
  );

  if (error) {
    return {
      status: "error",
      message:
        "We could not send the recovery email. Try again in a few minutes.",
    };
  }

  return {
    status: "success",
    message:
      "If an account exists for this email, a recovery link has been sent.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validationResult = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        password: getFirstError(errors.password),
        confirmPassword: getFirstError(errors.confirmPassword),
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: validationResult.data.password,
  });

  if (error) {
    return {
      status: "error",
      message:
        "The recovery session is missing or expired. Request a new recovery link.",
    };
  }

  await supabase.auth.signOut();

  return {
    status: "success",
    message: "Password updated. You can now log in with your new password.",
  };
}