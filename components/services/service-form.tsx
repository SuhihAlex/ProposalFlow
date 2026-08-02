"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  ArrowLeft,
  LoaderCircle,
  Save,
} from "lucide-react";

import {
  createServiceAction,
  updateServiceAction,
  type ServiceActionState,
} from "@/app/(app)/services/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ServiceActionState = {
  status: "idle",
  message: "",
};

const unitOptions = [
  {
    value: "project",
    label: "Per project",
  },
  {
    value: "hour",
    label: "Per hour",
  },
  {
    value: "day",
    label: "Per day",
  },
  {
    value: "page",
    label: "Per page",
  },
  {
    value: "month",
    label: "Per month",
  },
  {
    value: "item",
    label: "Per item",
  },
] as const;

export type ServiceFormValues = {
  name: string;
  description: string;
  price: string;
  unit:
    | "project"
    | "hour"
    | "day"
    | "page"
    | "month"
    | "item";
  category: string;
};

type ServiceFormProps = {
  currency: string;
  mode?: "create" | "edit";
  serviceId?: string;
  defaultValues?: ServiceFormValues;
};

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className="text-xs font-medium text-red-600"
      id={id}
    >
      {message}
    </p>
  );
}

function StatusMessage({
  state,
}: {
  state: ServiceActionState;
}) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {state.message}
    </div>
  );
}

export function ServiceForm({
  currency,
  mode = "create",
  serviceId,
  defaultValues = {
    name: "",
    description: "",
    price: "",
    unit: "project",
    category: "",
  },
}: ServiceFormProps) {
  const action =
    mode === "edit" && serviceId
      ? updateServiceAction.bind(null, serviceId)
      : createServiceAction;

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  const isEditing = mode === "edit";

  return (
    <form
      action={formAction}
      className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Service information
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          {isEditing
            ? "Update the reusable service details and standard pricing."
            : "Add a reusable service that can later be inserted into proposal pricing."}
        </p>
      </div>

      <div className="grid gap-5">
        <StatusMessage state={state} />

        <div className="grid gap-2">
          <Label htmlFor="service-name">
            Service name
          </Label>

          <Input
            aria-describedby={
              state.fieldErrors?.name
                ? "service-name-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.name,
            )}
            defaultValue={defaultValues.name}
            id="service-name"
            name="name"
            placeholder="Website Design"
            required
          />

          <FieldError
            id="service-name-error"
            message={state.fieldErrors?.name}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="service-description">
            Description
          </Label>

          <textarea
            aria-describedby={
              state.fieldErrors?.description
                ? "service-description-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.description,
            )}
            className="min-h-32 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
            defaultValue={defaultValues.description}
            id="service-description"
            maxLength={1000}
            name="description"
            placeholder="Describe the scope and value of this service."
          />

          <div className="flex justify-between gap-4">
            <FieldError
              id="service-description-error"
              message={state.fieldErrors?.description}
            />

            <p className="ml-auto text-xs text-[var(--muted-foreground)]">
              Maximum 1000 characters
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="service-price">
              Price
            </Label>

            <div className="relative">
              <Input
                aria-describedby={
                  state.fieldErrors?.price
                    ? "service-price-error"
                    : undefined
                }
                aria-invalid={Boolean(
                  state.fieldErrors?.price,
                )}
                className="pr-16"
                defaultValue={defaultValues.price}
                id="service-price"
                inputMode="decimal"
                min="0"
                name="price"
                placeholder="1500.00"
                required
                step="0.01"
                type="number"
              />

              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-[var(--muted-foreground)]">
                {currency}
              </span>
            </div>

            <FieldError
              id="service-price-error"
              message={state.fieldErrors?.price}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service-unit">
              Billing unit
            </Label>

            <select
              aria-describedby={
                state.fieldErrors?.unit
                  ? "service-unit-error"
                  : undefined
              }
              aria-invalid={Boolean(
                state.fieldErrors?.unit,
              )}
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
              defaultValue={defaultValues.unit}
              id="service-unit"
              name="unit"
            >
              {unitOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <FieldError
              id="service-unit-error"
              message={state.fieldErrors?.unit}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="service-category">
            Category
          </Label>

          <Input
            aria-describedby={
              state.fieldErrors?.category
                ? "service-category-error"
                : undefined
            }
            aria-invalid={Boolean(
              state.fieldErrors?.category,
            )}
            defaultValue={defaultValues.category}
            id="service-category"
            list="service-category-options"
            name="category"
            placeholder="Design"
            required
          />

          <datalist id="service-category-options">
            <option value="Design" />
            <option value="Development" />
            <option value="Product Design" />
            <option value="Strategy" />
            <option value="Support" />
          </datalist>

          <FieldError
            id="service-category-error"
            message={state.fieldErrors?.category}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
          <Button
            asChild
            type="button"
            variant="outline"
          >
            <Link href="/services">
              <ArrowLeft className="size-4" />
              Cancel
            </Link>
          </Button>

          <Button
            disabled={pending}
            type="submit"
          >
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                {isEditing
                  ? "Saving..."
                  : "Creating..."}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {isEditing
                  ? "Save changes"
                  : "Create service"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}