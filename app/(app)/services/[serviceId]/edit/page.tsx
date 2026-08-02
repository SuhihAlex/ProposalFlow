import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  ServiceForm,
  type ServiceFormValues,
} from "@/components/services/service-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EditServicePageProps = {
  params: Promise<{
    serviceId: string;
  }>;
};

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  const { serviceId } = await params;

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  if (claimsError || !ownerId) {
    redirect("/login");
  }

  const [
    serviceResult,
    companyResult,
  ] = await Promise.all([
    supabase
      .from("services")
      .select(
        `
          id,
          name,
          description,
          price,
          unit,
          category
        `,
      )
      .eq("id", serviceId)
      .eq("owner_id", ownerId)
      .maybeSingle(),

    supabase
      .from("companies")
      .select("currency")
      .eq("owner_id", ownerId)
      .maybeSingle(),
  ]);

  if (serviceResult.error) {
    console.error(
      "Failed to load service:",
      serviceResult.error,
    );

    notFound();
  }

  const service = serviceResult.data;

  if (!service) {
    notFound();
  }

  const defaultValues: ServiceFormValues = {
    name: service.name,
    description: service.description,
    price: String(service.price),
    unit: service.unit,
    category: service.category,
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
        href="/services"
      >
        <ArrowLeft className="size-4" />
        Back to services
      </Link>

      <div className="mb-7 mt-5">
        <p className="text-sm font-semibold text-[var(--brand)]">
          Services
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Edit service
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Update the standard pricing and description for{" "}
          <span className="font-medium text-[var(--foreground)]">
            {service.name}
          </span>
          .
        </p>
      </div>

      <ServiceForm
        currency={
          companyResult.data?.currency ?? "USD"
        }
        defaultValues={defaultValues}
        mode="edit"
        serviceId={service.id}
      />
    </div>
  );
}