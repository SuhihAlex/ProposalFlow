"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ClientActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    companyName?: string;
    contactName?: string;
    email?: string;
    notes?: string;
  };
};

const clientSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must contain at least 2 characters.")
    .max(160, "Company name is too long."),

  contactName: z
    .string()
    .trim()
    .min(2, "Contact name must contain at least 2 characters.")
    .max(120, "Contact name is too long."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(320, "Email address is too long."),

  notes: z
    .string()
    .trim()
    .max(3000, "Notes must contain no more than 3000 characters."),
});

const clientIdSchema = z.string().uuid();

function getFirstError(errors?: string[]) {
  return errors?.[0];
}

function validateClientForm(formData: FormData) {
  return clientSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    notes: formData.get("notes"),
  });
}

function getValidationErrorState(
  validationResult: ReturnType<typeof validateClientForm>,
): ClientActionState | null {
  if (validationResult.success) {
    return null;
  }

  const errors =
    validationResult.error.flatten().fieldErrors;

  return {
    status: "error",
    message: "Check the highlighted fields.",
    fieldErrors: {
      companyName: getFirstError(errors.companyName),
      contactName: getFirstError(errors.contactName),
      email: getFirstError(errors.email),
      notes: getFirstError(errors.notes),
    },
  };
}

async function getAuthenticatedOwner() {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  return {
    supabase,
    ownerId:
      claimsError || !ownerId
        ? null
        : ownerId,
  };
}

export async function createClientAction(
  previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  void previousState;

  const validationResult =
    validateClientForm(formData);

  const validationError =
    getValidationErrorState(validationResult);

  if (validationError) {
    return validationError;
  }

  if (!validationResult.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
    };
  }

  const { supabase, ownerId } =
    await getAuthenticatedOwner();

  if (!ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const { data: company, error: companyError } =
    await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (companyError) {
    console.error(
      "Failed to load company before creating client:",
      companyError,
    );

    return {
      status: "error",
      message: "We could not load your company profile.",
    };
  }

  if (!company) {
    return {
      status: "error",
      message:
        "Complete your company profile before adding clients.",
    };
  }

  const values = validationResult.data;

  const { error: insertError } = await supabase
    .from("clients")
    .insert({
      owner_id: ownerId,
      company_id: company.id,
      company_name: values.companyName,
      contact_name: values.contactName,
      email: values.email.toLowerCase(),
      notes: values.notes,
    });

  if (insertError) {
    console.error("Failed to create client:", insertError);

    return {
      status: "error",
      message: "We could not create the client. Try again.",
    };
  }

  revalidatePath("/clients");

  redirect("/clients?created=1");
}

export async function updateClientAction(
  clientId: string,
  previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  void previousState;

  const idResult = clientIdSchema.safeParse(clientId);

  if (!idResult.success) {
    return {
      status: "error",
      message: "Invalid client identifier.",
    };
  }

  const validationResult =
    validateClientForm(formData);

  const validationError =
    getValidationErrorState(validationResult);

  if (validationError) {
    return validationError;
  }

  if (!validationResult.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
    };
  }

  const { supabase, ownerId } =
    await getAuthenticatedOwner();

  if (!ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const values = validationResult.data;

  const { data: updatedClient, error: updateError } =
    await supabase
      .from("clients")
      .update({
        company_name: values.companyName,
        contact_name: values.contactName,
        email: values.email.toLowerCase(),
        notes: values.notes,
      })
      .eq("id", idResult.data)
      .eq("owner_id", ownerId)
      .select("id")
      .maybeSingle();

  if (updateError) {
    console.error("Failed to update client:", updateError);

    return {
      status: "error",
      message: "We could not update the client. Try again.",
    };
  }

  if (!updatedClient) {
    return {
      status: "error",
      message: "The client could not be found.",
    };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${idResult.data}/edit`);

  redirect("/clients?updated=1");
}

export async function deleteClientAction(
  clientId: string,
  previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  void previousState;
  void formData;

  const idResult = clientIdSchema.safeParse(clientId);

  if (!idResult.success) {
    return {
      status: "error",
      message: "Invalid client identifier.",
    };
  }

  const { supabase, ownerId } =
    await getAuthenticatedOwner();

  if (!ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const { data: deletedClient, error: deleteError } =
    await supabase
      .from("clients")
      .delete()
      .eq("id", idResult.data)
      .eq("owner_id", ownerId)
      .select("id")
      .maybeSingle();

  if (deleteError) {
    console.error("Failed to delete client:", deleteError);

    return {
      status: "error",
      message: "We could not delete the client. Try again.",
    };
  }

  if (!deletedClient) {
    return {
      status: "error",
      message: "The client could not be found.",
    };
  }

  revalidatePath("/clients");

  redirect("/clients?deleted=1");
}