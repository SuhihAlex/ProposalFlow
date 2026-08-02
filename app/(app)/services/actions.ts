"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ServiceActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: {
    name?: string;
    description?: string;
    price?: string;
    unit?: string;
    category?: string;
  };
};

const serviceUnits = [
  "project",
  "hour",
  "day",
  "page",
  "month",
  "item",
] as const;

const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must contain at least 2 characters.")
    .max(160, "Service name is too long."),

  description: z
    .string()
    .trim()
    .max(
      1000,
      "Description must contain no more than 1000 characters.",
    ),

  price: z
    .string()
    .trim()
    .min(1, "Enter a service price.")
    .refine(
      (value) => {
        const parsedValue = Number(value);

        return (
          Number.isFinite(parsedValue) &&
          parsedValue >= 0
        );
      },
      "Enter a valid price of 0 or greater.",
    )
    .transform((value) => Number(value)),

  unit: z.enum(serviceUnits, {
    message: "Select a valid billing unit.",
  }),

  category: z
    .string()
    .trim()
    .min(2, "Category must contain at least 2 characters.")
    .max(100, "Category is too long."),
});

const serviceIdSchema = z.string().uuid();

function getFirstError(errors?: string[]) {
  return errors?.[0];
}

function validateServiceForm(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    unit: formData.get("unit"),
    category: formData.get("category"),
  });
}

function getValidationErrorState(
  validationResult: ReturnType<
    typeof validateServiceForm
  >,
): ServiceActionState | null {
  if (validationResult.success) {
    return null;
  }

  const errors =
    validationResult.error.flatten().fieldErrors;

  return {
    status: "error",
    message: "Check the highlighted fields.",
    fieldErrors: {
      name: getFirstError(errors.name),
      description: getFirstError(errors.description),
      price: getFirstError(errors.price),
      unit: getFirstError(errors.unit),
      category: getFirstError(errors.category),
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

export async function createServiceAction(
  previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  void previousState;

  const validationResult =
    validateServiceForm(formData);

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
      "Failed to load company before creating service:",
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
        "Complete your company profile before adding services.",
    };
  }

  const values = validationResult.data;

  const { error: insertError } = await supabase
    .from("services")
    .insert({
      owner_id: ownerId,
      company_id: company.id,
      name: values.name,
      description: values.description,
      price: values.price,
      unit: values.unit,
      category: values.category,
    });

  if (insertError) {
    console.error("Failed to create service:", insertError);

    return {
      status: "error",
      message:
        "We could not create the service. Try again.",
    };
  }

  revalidatePath("/services");

  redirect("/services?created=1");
}

export async function updateServiceAction(
  serviceId: string,
  previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  void previousState;

  const idResult =
    serviceIdSchema.safeParse(serviceId);

  if (!idResult.success) {
    return {
      status: "error",
      message: "Invalid service identifier.",
    };
  }

  const validationResult =
    validateServiceForm(formData);

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

  const { data: updatedService, error: updateError } =
    await supabase
      .from("services")
      .update({
        name: values.name,
        description: values.description,
        price: values.price,
        unit: values.unit,
        category: values.category,
      })
      .eq("id", idResult.data)
      .eq("owner_id", ownerId)
      .select("id")
      .maybeSingle();

  if (updateError) {
    console.error(
      "Failed to update service:",
      updateError,
    );

    return {
      status: "error",
      message:
        "We could not update the service. Try again.",
    };
  }

  if (!updatedService) {
    return {
      status: "error",
      message: "The service could not be found.",
    };
  }

  revalidatePath("/services");
  revalidatePath(
    `/services/${idResult.data}/edit`,
  );

  redirect("/services?updated=1");
}

export async function deleteServiceAction(
  serviceId: string,
  previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  void previousState;
  void formData;

  const idResult =
    serviceIdSchema.safeParse(serviceId);

  if (!idResult.success) {
    return {
      status: "error",
      message: "Invalid service identifier.",
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

  const { data: deletedService, error: deleteError } =
    await supabase
      .from("services")
      .delete()
      .eq("id", idResult.data)
      .eq("owner_id", ownerId)
      .select("id")
      .maybeSingle();

  if (deleteError) {
    console.error(
      "Failed to delete service:",
      deleteError,
    );

    return {
      status: "error",
      message:
        "We could not delete the service. Try again.",
    };
  }

  if (!deletedService) {
    return {
      status: "error",
      message: "The service could not be found.",
    };
  }

  revalidatePath("/services");

  redirect("/services?deleted=1");
}