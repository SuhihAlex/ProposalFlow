import { redirect } from "next/navigation";

import { CompanyLogoCard } from "@/components/settings/company-logo-card";
import {
  CompanySettingsForm,
  type CompanySettingsValues,
} from "@/components/settings/company-settings-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CompanySettingsPage() {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const claims = claimsData?.claims;
  const ownerId = claims?.sub;

  if (claimsError || !ownerId) {
    redirect("/login");
  }

  const { data: company, error: companyError } =
    await supabase
      .from("companies")
      .select(
        `
          name,
          description,
          email,
          phone,
          website,
          currency,
          accent_color,
          logo_path,
          updated_at
        `,
      )
      .eq("owner_id", ownerId)
      .maybeSingle();

  if (companyError) {
    console.error(
      "Failed to load company settings:",
      companyError,
    );
  }

  const authenticatedEmail =
    typeof claims.email === "string"
      ? claims.email
      : "";

  const defaultValues: CompanySettingsValues = {
    name: company?.name ?? "",
    description: company?.description ?? "",
    email: company?.email || authenticatedEmail,
    phone: company?.phone ?? "",
    website: company?.website ?? "",
    currency: company?.currency ?? "USD",
    accentColor:
      company?.accent_color ?? "#0F766E",
  };

  let currentLogoUrl: string | null = null;

  if (company?.logo_path) {
    const { data } = supabase.storage
      .from("company-assets")
      .getPublicUrl(company.logo_path);

    currentLogoUrl = company.updated_at
      ? `${data.publicUrl}?v=${encodeURIComponent(
          company.updated_at,
        )}`
      : data.publicUrl;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7">
        <p className="text-sm font-semibold text-[var(--brand)]">
          Settings
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Company profile
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Manage the company information used throughout
          your proposals, public pages and PDF documents.
        </p>
      </div>

      <div className="grid gap-6">
        <CompanyLogoCard
          companyExists={Boolean(company)}
          currentLogoUrl={currentLogoUrl}
        />

        <CompanySettingsForm
          defaultValues={defaultValues}
        />
      </div>
    </div>
  );
}