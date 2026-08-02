"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type PublicProposalResponseActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    response?: string;
    clientName?: string;
    clientEmail?: string;
    clientComment?: string;
  };
};

const publicTokenSchema = z
  .string()
  .min(16)
  .max(200);

const responseFormSchema = z.object({
  response: z.enum(["accepted", "rejected"], {
    message: "Select a valid response.",
  }),

  clientName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(
      120,
      "Name must contain no more than 120 characters.",
    ),

  clientEmail: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(
      320,
      "Email must contain no more than 320 characters.",
    ),

  clientComment: z
    .string()
    .trim()
    .max(
      2000,
      "Comment must contain no more than 2000 characters.",
    ),
});

const rpcResultSchema = z.object({
  ok: z.boolean(),
  code: z.string().optional(),
  message: z.string().optional(),
  status: z
    .enum(["accepted", "rejected"])
    .optional(),
  respondedAt: z.string().optional(),
});

function firstError(errors?: string[]) {
  return errors?.[0];
}

export async function respondToPublicProposalAction(
  publicToken: string,
  previousState: PublicProposalResponseActionState,
  formData: FormData,
): Promise<PublicProposalResponseActionState> {
  void previousState;

  const tokenResult =
    publicTokenSchema.safeParse(publicToken);

  if (!tokenResult.success) {
    return {
      status: "error",
      message:
        "The proposal link is invalid or incomplete.",
    };
  }

  const validationResult =
    responseFormSchema.safeParse({
      response: String(
        formData.get("response") ?? "",
      ),

      clientName: String(
        formData.get("clientName") ?? "",
      ),

      clientEmail: String(
        formData.get("clientEmail") ?? "",
      ),

      clientComment: String(
        formData.get("clientComment") ?? "",
      ),
    });

  if (!validationResult.success) {
    const errors =
      validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        response: firstError(errors.response),
        clientName: firstError(
          errors.clientName,
        ),
        clientEmail: firstError(
          errors.clientEmail,
        ),
        clientComment: firstError(
          errors.clientComment,
        ),
      },
    };
  }

  const values = validationResult.data;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "respond_public_proposal",
    {
      p_public_token: tokenResult.data,
      p_response: values.response,
      p_client_name: values.clientName,
      p_client_email: values.clientEmail,
      p_client_comment:
        values.clientComment || null,
    },
  );

  if (error) {
    console.error(
      "Failed to respond to public proposal:",
      error,
    );

    return {
      status: "error",
      message:
        "Your response could not be submitted. Try again.",
    };
  }

  const result = rpcResultSchema.safeParse(data);

  if (!result.success) {
    console.error(
      "Unexpected public proposal response result:",
      data,
    );

    return {
      status: "error",
      message:
        "The proposal returned an unexpected response.",
    };
  }

  if (!result.data.ok) {
    return {
      status: "error",
      message:
        result.data.message ??
        "Your response could not be submitted.",
    };
  }

  if (!result.data.status) {
    return {
      status: "error",
      message:
        "The proposal response status was not returned.",
    };
  }

  revalidatePath("/proposals");
  revalidatePath(
    `/p/${tokenResult.data}`,
  );

  redirect(
    `/p/${tokenResult.data}?response=${result.data.status}`,
  );
}