"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type CompanySettingsActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: {
    name?: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    currency?: string;
    accentColor?: string;
  };
};

const supportedCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "MDL",
  "RON",
] as const;

const companySettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name must contain at least 2 characters.")
    .max(120, "Company name is too long."),

  description: z
    .string()
    .trim()
    .max(1200, "Description must contain no more than 1200 characters."),

  email: z
    .string()
    .trim()
    .email("Enter a valid company email address."),

  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long."),

  website: z
    .string()
    .trim()
    .max(200, "Website address is too long.")
    .transform((value) => {
      if (!value) {
        return "";
      }

      if (/^https?:\/\//i.test(value)) {
        return value;
      }

      return `https://${value}`;
    })
    .refine(
      (value) => {
        if (!value) {
          return true;
        }

        try {
          const url = new URL(value);

          return (
            url.protocol === "http:" ||
            url.protocol === "https:"
          );
        } catch {
          return false;
        }
      },
      {
        message: "Enter a valid website address.",
      },
    ),

  currency: z.enum(supportedCurrencies, {
    message: "Select a supported currency.",
  }),

  accentColor: z
    .string()
    .trim()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Enter a valid HEX color, for example #0F766E.",
    ),
});

function getFirstError(errors?: string[]) {
  return errors?.[0];
}

export async function saveCompanySettingsAction(
  _previousState: CompanySettingsActionState,
  formData: FormData,
): Promise<CompanySettingsActionState> {
  const validationResult = companySettingsSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    currency: formData.get("currency"),
    accentColor: formData.get("accentColor"),
  });

  if (!validationResult.success) {
    const errors =
      validationResult.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: {
        name: getFirstError(errors.name),
        description: getFirstError(errors.description),
        email: getFirstError(errors.email),
        phone: getFirstError(errors.phone),
        website: getFirstError(errors.website),
        currency: getFirstError(errors.currency),
        accentColor: getFirstError(errors.accentColor),
      },
    };
  }

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  if (claimsError || !ownerId) {
    return {
      status: "error",
      message:
        "Your session has expired. Log in again and retry.",
    };
  }

  const values = validationResult.data;

  const { error } = await supabase
    .from("companies")
    .upsert(
      {
        owner_id: ownerId,
        name: values.name,
        description: values.description,
        email: values.email,
        phone: values.phone || null,
        website: values.website || null,
        currency: values.currency,
        accent_color: values.accentColor.toUpperCase(),
      },
      {
        onConflict: "owner_id",
      },
    );

  if (error) {
    console.error("Failed to save company settings:", error);

    return {
      status: "error",
      message:
        "We could not save the company settings. Try again.",
    };
  }

  revalidatePath("/settings/company");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Company settings saved.",
  };
}