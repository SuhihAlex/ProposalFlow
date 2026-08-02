import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Boxes,
  Clock3,
  Layers3,
  Pencil,
  Plus,
} from "lucide-react";

import { DeleteServiceButton } from "@/components/services/delete-service-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ServicesPageProps = {
  searchParams: Promise<{
    created?: string | string[];
    updated?: string | string[];
    deleted?: string | string[];
  }>;
};

type ServiceRow = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  unit:
    | "project"
    | "hour"
    | "day"
    | "page"
    | "month"
    | "item";
  category: string;
  created_at: string;
};

const unitLabels: Record<
  ServiceRow["unit"],
  string
> = {
  project: "per project",
  hour: "per hour",
  day: "per day",
  page: "per page",
  month: "per month",
  item: "per item",
};

function getSingleValue(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPrice(
  value: number | string,
  currency: string,
) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function ServiceIcon({
  category,
}: {
  category: string;
}) {
  const normalizedCategory =
    category.toLowerCase();

  const Icon =
    normalizedCategory.includes("support")
      ? Clock3
      : normalizedCategory.includes("design")
        ? Layers3
        : Boxes;

  return (
    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
      <Icon className="size-5" />
    </div>
  );
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const params = await searchParams;

  const wasCreated =
    getSingleValue(params.created) === "1";

  const wasUpdated =
    getSingleValue(params.updated) === "1";

  const wasDeleted =
    getSingleValue(params.deleted) === "1";

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const ownerId = claimsData?.claims?.sub;

  if (claimsError || !ownerId) {
    redirect("/login");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("currency")
    .eq("owner_id", ownerId)
    .maybeSingle();

  const {
    data,
    error,
  } = await supabase
    .from("services")
    .select(
      `
        id,
        name,
        description,
        price,
        unit,
        category,
        created_at
      `,
    )
    .eq("owner_id", ownerId)
    .order("created_at", {
      ascending: false,
    });

  const currency = company?.currency ?? "USD";
  const services = (data ?? []) as ServiceRow[];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand)]">
            Workspace
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Services
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Build a reusable catalogue of services and
            standard prices for your proposals.
          </p>
        </div>

        <Button
          asChild
          className="w-full sm:w-auto"
        >
          <Link href="/services/new">
            <Plus className="size-4" />
            Add service
          </Link>
        </Button>
      </div>

      {wasCreated ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Service created successfully.
        </div>
      ) : null}

      {wasUpdated ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Service updated successfully.
        </div>
      ) : null}

      {wasDeleted ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Service deleted successfully.
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          We could not load the services. Refresh the page
          and try again.
        </div>
      ) : null}

      {!error && services.length === 0 ? (
        <section className="mt-7 grid min-h-96 place-items-center rounded-2xl border border-dashed bg-white p-8 text-center shadow-sm">
          <div className="max-w-md">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Boxes className="size-6" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Add your first service
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Reusable services make proposal pricing
              faster and more consistent.
            </p>

            <Button
              asChild
              className="mt-6"
            >
              <Link href="/services/new">
                <Plus className="size-4" />
                Add service
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      {!error && services.length > 0 ? (
        <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              className="flex min-h-72 flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              key={service.id}
            >
              <div className="flex items-start justify-between gap-4">
                <ServiceIcon
                  category={service.category}
                />

                <span className="rounded-full border bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                  {service.category}
                </span>
              </div>

              <div className="mt-5">
                <h2 className="text-lg font-semibold">
                  {service.name}
                </h2>

                <p className="mt-2 line-clamp-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  {service.description ||
                    "No description added."}
                </p>
              </div>

              <div className="mt-auto pt-5">
                <div className="border-t pt-5">
                  <p className="text-2xl font-semibold tracking-tight">
                    {formatPrice(
                      service.price,
                      currency,
                    )}
                  </p>

                  <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
                    {unitLabels[service.unit]}
                  </p>
                </div>

                <div className="mt-5 flex gap-3">
                  <Button
                    asChild
                    className="flex-1"
                    size="sm"
                    variant="outline"
                  >
                    <Link
                      href={`/services/${service.id}/edit`}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>

                  <DeleteServiceButton
                    serviceId={service.id}
                    serviceName={service.name}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!error && services.length > 0 ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {services.length}{" "}
          {services.length === 1
            ? "service"
            : "services"}
        </p>
      ) : null}
    </div>
  );
}