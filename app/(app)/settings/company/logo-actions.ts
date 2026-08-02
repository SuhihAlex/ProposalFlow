"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type CompanyLogoActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

const LOGO_BUCKET = "company-assets";
const MAX_LOGO_SIZE = 2 * 1024 * 1024;

const allowedLogoTypes = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

async function getAuthenticatedOwnerId() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  const ownerId = data?.claims?.sub;

  if (error || !ownerId) {
    return {
      supabase,
      ownerId: null,
    };
  }

  return {
    supabase,
    ownerId,
  };
}

export async function uploadCompanyLogoAction(
  _previousState: CompanyLogoActionState,
  formData: FormData,
): Promise<CompanyLogoActionState> {
  const logo = formData.get("logo");

  if (!(logo instanceof File) || logo.size === 0) {
    return {
      status: "error",
      message: "Select a logo before uploading.",
    };
  }

  if (logo.size > MAX_LOGO_SIZE) {
    return {
      status: "error",
      message: "The logo must be no larger than 2 MB.",
    };
  }

  const extension =
    allowedLogoTypes[
      logo.type as keyof typeof allowedLogoTypes
    ];

  if (!extension) {
    return {
      status: "error",
      message: "Use a PNG, JPEG or WebP image.",
    };
  }

  const { supabase, ownerId } =
    await getAuthenticatedOwnerId();

  if (!ownerId) {
    return {
      status: "error",
      message: "Your session has expired. Log in again.",
    };
  }

  const { data: company, error: companyError } =
    await supabase
      .from("companies")
      .select("logo_path")
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (companyError) {
    console.error(
      "Failed to load company before logo upload:",
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
        "Save your company information before uploading a logo.",
    };
  }

  const objectPath = `${ownerId}/logo.${extension}`;
  const previousLogoPath = company.logo_path;

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(objectPath, logo, {
      cacheControl: "3600",
      contentType: logo.type,
      upsert: true,
    });

  if (uploadError) {
    console.error(
      "Failed to upload company logo:",
      uploadError,
    );

    return {
      status: "error",
      message:
        "We could not upload the logo. Check its format and size.",
    };
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update({
      logo_path: objectPath,
    })
    .eq("owner_id", ownerId);

  if (updateError) {
    console.error(
      "Failed to save company logo path:",
      updateError,
    );

    if (
      previousLogoPath !== objectPath
    ) {
      await supabase.storage
        .from(LOGO_BUCKET)
        .remove([objectPath]);
    }

    return {
      status: "error",
      message:
        "The logo was uploaded, but the company profile could not be updated.",
    };
  }

  if (
    previousLogoPath &&
    previousLogoPath !== objectPath
  ) {
    const { error: removePreviousError } =
      await supabase.storage
        .from(LOGO_BUCKET)
        .remove([previousLogoPath]);

    if (removePreviousError) {
      console.error(
        "Failed to remove previous company logo:",
        removePreviousError,
      );
    }
  }

  revalidatePath("/settings/company");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Company logo uploaded.",
  };
}

export async function deleteCompanyLogoAction(
  previousState: CompanyLogoActionState,
  formData: FormData,
): Promise<CompanyLogoActionState> {
  void previousState;
  void formData;

  const { supabase, ownerId } =
    await getAuthenticatedOwnerId();
    
  if (!ownerId) {
    return {
      status: "error",
      message: "Your session has expired. Log in again.",
    };
  }

  const { data: company, error: companyError } =
    await supabase
      .from("companies")
      .select("logo_path")
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (companyError) {
    console.error(
      "Failed to load company logo:",
      companyError,
    );

    return {
      status: "error",
      message: "We could not load your company logo.",
    };
  }

  if (!company?.logo_path) {
    return {
      status: "success",
      message: "The company does not have a logo.",
    };
  }

  const logoPath = company.logo_path;

  const { error: updateError } = await supabase
    .from("companies")
    .update({
      logo_path: null,
    })
    .eq("owner_id", ownerId);

  if (updateError) {
    console.error(
      "Failed to clear company logo path:",
      updateError,
    );

    return {
      status: "error",
      message: "We could not remove the company logo.",
    };
  }

  const { error: removeError } = await supabase.storage
    .from(LOGO_BUCKET)
    .remove([logoPath]);

  if (removeError) {
    console.error(
      "Failed to delete company logo object:",
      removeError,
    );
  }

  revalidatePath("/settings/company");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Company logo removed.",
  };
}