"use client";

import {
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  addProposalItemAction,
  deleteProposalItemAction,
  updateProposalDiscountAction,
  type ProposalDiscountActionState,
  type ProposalItemActionState,
} from "@/app/(app)/proposals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProposalUnit =
  | "project"
  | "hour"
  | "day"
  | "page"
  | "month"
  | "item";

export type ProposalServiceOption = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  unit: ProposalUnit;
  category: string;
};

export type ProposalPricingItem = {
  id: string;
  name: string;
  description: string;
  quantity: number | string;
  unit: ProposalUnit;
  unitPrice: number | string;
  lineTotal: number | string;
};

type ProposalPricingEditorProps = {
  proposalId: string;
  currency: string;
  editable: boolean;
  services: ProposalServiceOption[];
  items: ProposalPricingItem[];
  subtotal: number | string;
  discountType:
    | "none"
    | "percentage"
    | "fixed";
  discountValue: number | string;
  total: number | string;
};

const initialState: ProposalItemActionState = {
  status: "idle",
  message: "",
};

const discountInitialState:
  ProposalDiscountActionState = {
    status: "idle",
    message: "",
  };

const unitLabels: Record<ProposalUnit, string> = {
  project: "project",
  hour: "hour",
  day: "day",
  page: "page",
  month: "month",
  item: "item",
};

function formatMoney(
  value: number | string,
  currency: string,
) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function getDiscountLabel(
  type: ProposalPricingEditorProps["discountType"],
  value: number | string,
  currency: string,
) {
  if (type === "percentage") {
    return `${Number(value)}%`;
  }

  if (type === "fixed") {
    return formatMoney(value, currency);
  }

  return "No discount";
}

function DeleteProposalItemButton({
  proposalId,
  itemId,
  itemName,
}: {
  proposalId: string;
  itemId: string;
  itemName: string;
}) {
  const action = deleteProposalItemAction.bind(
    null,
    proposalId,
    itemId,
  );

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  useEffect(() => {
    if (state.status === "error" && state.message) {
      window.alert(state.message);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Remove ${itemName} from this proposal?`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <Button
        aria-label={`Remove ${itemName}`}
        disabled={pending}
        size="icon"
        type="submit"
        variant="outline"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </Button>
    </form>
  );
}

export function ProposalPricingEditor({
  proposalId,
  currency,
  editable,
  services,
  items,
  subtotal,
  discountType,
  discountValue,
  total,
}: ProposalPricingEditorProps) {
  const addAction = addProposalItemAction.bind(
    null,
    proposalId,
  );

  const [state, formAction, pending] = useActionState(
    addAction,
    initialState,
  );

  const discountAction =
    updateProposalDiscountAction.bind(
      null,
      proposalId,
    );

  const [
    discountState,
    discountFormAction,
    discountPending,
  ] = useActionState(
    discountAction,
    discountInitialState,
  );

  const [
    selectedDiscountType,
    setSelectedDiscountType,
  ] = useState<
    ProposalPricingEditorProps["discountType"]
  >(discountType);

  const [selectedServiceId, setSelectedServiceId] =
    useState(services[0]?.id ?? "");

  const selectedService = services.find(
    (service) =>
      service.id === selectedServiceId,
  );

  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-5 sm:p-6">
        <h2 className="text-lg font-semibold">
          Pricing
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Add catalogue services to calculate the proposal
          value automatically.
        </p>
      </div>

      {editable ? (
        <form
          action={formAction}
          className="border-b p-5 sm:p-6"
          noValidate
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px_auto] lg:items-end">
            <div className="grid gap-2">
              <Label htmlFor="proposal-service">
                Service
              </Label>

              <select
                aria-describedby={
                  state.fieldErrors?.serviceId
                    ? "proposal-service-error"
                    : undefined
                }
                aria-invalid={Boolean(
                  state.fieldErrors?.serviceId,
                )}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
                disabled={services.length === 0}
                id="proposal-service"
                name="serviceId"
                onChange={(event) =>
                  setSelectedServiceId(
                    event.currentTarget.value,
                  )
                }
                value={selectedServiceId}
              >
                {services.length === 0 ? (
                  <option value="">
                    No services available
                  </option>
                ) : null}

                {services.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.name} —{" "}
                    {formatMoney(
                      service.price,
                      currency,
                    )}
                  </option>
                ))}
              </select>

              {state.fieldErrors?.serviceId ? (
                <p
                  className="text-xs font-medium text-red-600"
                  id="proposal-service-error"
                >
                  {state.fieldErrors.serviceId}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="proposal-item-quantity">
                Quantity
              </Label>

              <Input
                aria-describedby={
                  state.fieldErrors?.quantity
                    ? "proposal-item-quantity-error"
                    : undefined
                }
                aria-invalid={Boolean(
                  state.fieldErrors?.quantity,
                )}
                defaultValue="1"
                id="proposal-item-quantity"
                min="0.01"
                name="quantity"
                required
                step="0.01"
                type="number"
              />

              {state.fieldErrors?.quantity ? (
                <p
                  className="text-xs font-medium text-red-600"
                  id="proposal-item-quantity-error"
                >
                  {state.fieldErrors.quantity}
                </p>
              ) : null}
            </div>

            <Button
              disabled={
                pending ||
                services.length === 0 ||
                !selectedServiceId
              }
              type="submit"
            >
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Add service
                </>
              )}
            </Button>
          </div>

          {selectedService ? (
            <div className="mt-4 rounded-xl border bg-[var(--surface-muted)] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {selectedService.name}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {selectedService.description ||
                      "No service description."}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold">
                  {formatMoney(
                    selectedService.price,
                    currency,
                  )}{" "}
                  /{" "}
                  {unitLabels[selectedService.unit]}
                </p>
              </div>
            </div>
          ) : null}

          {state.status === "error" &&
          state.message ? (
            <div
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {state.message}
            </div>
          ) : null}
        </form>
      ) : (
        <div className="border-b bg-amber-50 px-5 py-4 text-sm text-amber-800 sm:px-6">
          This proposal is no longer a draft. Pricing is
          read-only.
        </div>
      )}

      <div className="p-5 sm:p-6">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <h3 className="font-semibold">
              No pricing items yet
            </h3>

            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Add a service above to begin calculating the
              proposal value.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => (
              <article
                className="grid gap-4 rounded-xl border p-4 md:grid-cols-[minmax(0,1fr)_110px_150px_44px] md:items-center"
                key={item.id}
              >
                <div className="min-w-0">
                  <h3 className="font-semibold">
                    {item.name}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {item.description ||
                      "No description added."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                    Quantity
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {Number(item.quantity)}{" "}
                    {unitLabels[item.unit]}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                    Line total
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatMoney(
                      item.lineTotal,
                      currency,
                    )}
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {formatMoney(
                      item.unitPrice,
                      currency,
                    )}{" "}
                    each
                  </p>
                </div>

                {editable ? (
                  <DeleteProposalItemButton
                    itemId={item.id}
                    itemName={item.name}
                    proposalId={proposalId}
                  />
                ) : (
                  <div />
                )}
              </article>
            ))}
          </div>
        )}

        {editable ? (
          <form
            action={discountFormAction}
            className="mt-6 rounded-xl border p-4 sm:p-5"
            noValidate
          >
            <div>
              <h3 className="font-semibold">
                Proposal discount
              </h3>

              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Apply a percentage or fixed discount to the
                proposal subtotal.
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
              <div className="grid gap-2">
                <Label htmlFor="proposal-discount-type">
                  Discount type
                </Label>

                <select
                  aria-describedby={
                    discountState.fieldErrors?.discountType
                      ? "proposal-discount-type-error"
                      : undefined
                  }
                  aria-invalid={Boolean(
                    discountState.fieldErrors?.discountType,
                  )}
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
                  id="proposal-discount-type"
                  name="discountType"
                  onChange={(event) => {
                    setSelectedDiscountType(
                      event.currentTarget
                        .value as ProposalPricingEditorProps["discountType"],
                    );
                  }}
                  value={selectedDiscountType}
                >
                  <option value="none">
                    No discount
                  </option>

                  <option value="percentage">
                    Percentage
                  </option>

                  <option value="fixed">
                    Fixed amount
                  </option>
                </select>

                {discountState.fieldErrors
                  ?.discountType ? (
                  <p
                    className="text-xs font-medium text-red-600"
                    id="proposal-discount-type-error"
                  >
                    {
                      discountState.fieldErrors
                        .discountType
                    }
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="proposal-discount-value">
                  {selectedDiscountType === "percentage"
                    ? "Discount percentage"
                    : selectedDiscountType === "fixed"
                      ? "Discount amount"
                      : "Discount value"}
                </Label>

                {selectedDiscountType === "none" ? (
                  <>
                    <input
                      name="discountValue"
                      type="hidden"
                      value="0"
                    />

                    <Input
                      disabled
                      id="proposal-discount-value"
                      type="number"
                      value="0"
                    />
                  </>
                ) : (
                  <Input
                    aria-describedby={
                      discountState.fieldErrors?.discountValue
                        ? "proposal-discount-value-error"
                        : undefined
                    }
                    aria-invalid={Boolean(
                      discountState.fieldErrors
                        ?.discountValue,
                    )}
                    defaultValue={String(discountValue)}
                    id="proposal-discount-value"
                    max={
                      selectedDiscountType ===
                      "percentage"
                        ? "100"
                        : undefined
                    }
                    min="0"
                    name="discountValue"
                    required
                    step="0.01"
                    type="number"
                  />
                )}

                {discountState.fieldErrors
                  ?.discountValue ? (
                  <p
                    className="text-xs font-medium text-red-600"
                    id="proposal-discount-value-error"
                  >
                    {
                      discountState.fieldErrors
                        .discountValue
                    }
                  </p>
                ) : null}

                <p className="text-xs text-[var(--muted-foreground)]">
                  {selectedDiscountType === "percentage"
                    ? "Enter a value from 0 to 100."
                    : selectedDiscountType === "fixed"
                      ? `Enter a fixed amount in ${currency}.`
                      : "The proposal will use its full subtotal."}
                </p>
              </div>

              <Button
                disabled={discountPending}
                type="submit"
              >
                {discountPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Apply discount
                  </>
                )}
              </Button>
            </div>

            {discountState.status === "error" &&
            discountState.message ? (
              <div
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {discountState.message}
              </div>
            ) : null}
          </form>
        ) : null}

        <div className="ml-auto mt-6 max-w-md rounded-xl border bg-[var(--surface-muted)] p-5">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--muted-foreground)]">
              Subtotal
            </span>

            <span className="font-semibold">
              {formatMoney(subtotal, currency)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--muted-foreground)]">
              Discount
            </span>

            <span className="font-semibold">
              {getDiscountLabel(
                discountType,
                discountValue,
                currency,
              )}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
            <span className="font-semibold">
              Total
            </span>

            <span className="text-2xl font-semibold tracking-tight">
              {formatMoney(total, currency)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}