"use client";

import {
  Building2,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useActionState, useState } from "react";

import {
  saveCompanySettingsAction,
  type CompanySettingsActionState,
} from "@/app/(app)/settings/company/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CompanySettingsValues = {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  currency: string;
  accentColor: string;
};

const initialState: CompanySettingsActionState = {
  status: "idle",
  message: "",
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
      id={id}
      className="text-xs font-medium text-red-600"
    >
      {message}
    </p>
  );
}

function StatusMessage({
  state,
}: {
  state: CompanySettingsActionState;
}) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const isError = state.status === "error";

  return (
    <div
      aria-live="polite"
      className={
        isError
          ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
      }
      role={isError ? "alert" : "status"}
    >
      {state.message}
    </div>
  );
}

function getCompanyInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "PF";
}

export function CompanySettingsForm({
  defaultValues,
}: {
  defaultValues: CompanySettingsValues;
}) {
  const [state, formAction, pending] = useActionState(
    saveCompanySettingsAction,
    initialState,
  );

  const [companyName, setCompanyName] = useState(
    defaultValues.name,
  );

  const [accentColor, setAccentColor] = useState(
    defaultValues.accentColor,
  );

  return (
    <form
      action={formAction}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
      noValidate
    >
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Company information
          </h2>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            These details will appear on proposals and PDF
            documents.
          </p>
        </div>

        <div className="grid gap-5">
          <StatusMessage state={state} />

          <div className="grid gap-2">
            <Label htmlFor="company-name">
              Company name
            </Label>

            <Input
              aria-describedby={
                state.fieldErrors?.name
                  ? "company-name-error"
                  : undefined
              }
              aria-invalid={Boolean(
                state.fieldErrors?.name,
              )}
              autoComplete="organization"
              id="company-name"
              name="name"
              onChange={(event) =>
                setCompanyName(event.target.value)
              }
              placeholder="Northline Digital"
              required
              value={companyName}
            />

            <FieldError
              id="company-name-error"
              message={state.fieldErrors?.name}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company-description">
              Description
            </Label>

            <textarea
              aria-describedby={
                state.fieldErrors?.description
                  ? "company-description-error"
                  : undefined
              }
              aria-invalid={Boolean(
                state.fieldErrors?.description,
              )}
              className="min-h-36 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
              defaultValue={defaultValues.description}
              id="company-description"
              maxLength={1200}
              name="description"
              placeholder="Describe what your studio does and the value you provide."
            />

            <div className="flex justify-between gap-4">
              <FieldError
                id="company-description-error"
                message={
                  state.fieldErrors?.description
                }
              />

              <p className="ml-auto text-xs text-[var(--muted-foreground)]">
                Maximum 1200 characters
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="company-email">
                Company email
              </Label>

              <Input
                aria-describedby={
                  state.fieldErrors?.email
                    ? "company-email-error"
                    : undefined
                }
                aria-invalid={Boolean(
                  state.fieldErrors?.email,
                )}
                autoComplete="email"
                defaultValue={defaultValues.email}
                id="company-email"
                name="email"
                placeholder="hello@northline.digital"
                required
                type="email"
              />

              <FieldError
                id="company-email-error"
                message={state.fieldErrors?.email}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-phone">
                Phone
              </Label>

              <Input
                aria-describedby={
                  state.fieldErrors?.phone
                    ? "company-phone-error"
                    : undefined
                }
                aria-invalid={Boolean(
                  state.fieldErrors?.phone,
                )}
                autoComplete="tel"
                defaultValue={defaultValues.phone}
                id="company-phone"
                name="phone"
                placeholder="+373 60 123 456"
                type="tel"
              />

              <FieldError
                id="company-phone-error"
                message={state.fieldErrors?.phone}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="company-website">
                Website
              </Label>

              <Input
                aria-describedby={
                  state.fieldErrors?.website
                    ? "company-website-error"
                    : undefined
                }
                aria-invalid={Boolean(
                  state.fieldErrors?.website,
                )}
                autoComplete="url"
                defaultValue={defaultValues.website}
                id="company-website"
                name="website"
                placeholder="northline.digital"
              />

              <FieldError
                id="company-website-error"
                message={state.fieldErrors?.website}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-currency">
                Primary currency
              </Label>

              <select
                aria-describedby={
                  state.fieldErrors?.currency
                    ? "company-currency-error"
                    : undefined
                }
                aria-invalid={Boolean(
                  state.fieldErrors?.currency,
                )}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[color:rgb(15_118_110_/_0.12)]"
                defaultValue={defaultValues.currency}
                id="company-currency"
                name="currency"
              >
                <option value="USD">
                  USD — US Dollar
                </option>

                <option value="EUR">
                  EUR — Euro
                </option>

                <option value="GBP">
                  GBP — British Pound
                </option>

                <option value="MDL">
                  MDL — Moldovan Leu
                </option>

                <option value="RON">
                  RON — Romanian Leu
                </option>
              </select>

              <FieldError
                id="company-currency-error"
                message={
                  state.fieldErrors?.currency
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company-accent-color">
              Accent color
            </Label>

            <div className="flex items-center gap-3">
              <input
                aria-label="Select accent color"
                className="h-10 w-12 cursor-pointer rounded-lg border bg-white p-1"
                onChange={(event) =>
                  setAccentColor(event.target.value)
                }
                type="color"
                value={accentColor}
              />

              <Input
                aria-describedby={
                  state.fieldErrors?.accentColor
                    ? "company-accent-color-error"
                    : undefined
                }
                aria-invalid={Boolean(
                  state.fieldErrors?.accentColor,
                )}
                id="company-accent-color"
                maxLength={7}
                name="accentColor"
                onChange={(event) =>
                  setAccentColor(event.target.value)
                }
                placeholder="#0F766E"
                required
                value={accentColor}
              />
            </div>

            <FieldError
              id="company-accent-color-error"
              message={
                state.fieldErrors?.accentColor
              }
            />
          </div>

          <div className="flex justify-end border-t pt-5">
            <Button
              disabled={pending}
              type="submit"
            >
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save settings
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold">
          Brand preview
        </p>

        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          A simplified preview of your proposal branding.
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl border bg-[#fbfcf9]">
          <div
            className="h-2"
            style={{
              backgroundColor:
                /^#[0-9A-Fa-f]{6}$/.test(accentColor)
                  ? accentColor
                  : "#0F766E",
            }}
          />

          <div className="p-5">
            <div
              className="grid size-11 place-items-center rounded-xl text-sm font-bold text-white"
              style={{
                backgroundColor:
                  /^#[0-9A-Fa-f]{6}$/.test(
                    accentColor,
                  )
                    ? accentColor
                    : "#0F766E",
              }}
            >
              {getCompanyInitials(companyName)}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              Proposal
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-tight">
              Website redesign and development
            </h3>

            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Prepared by{" "}
              <span className="font-medium text-[var(--foreground)]">
                {companyName.trim() ||
                  "Your company"}
              </span>
            </p>

            <div className="mt-6 grid gap-2">
              <div className="h-2.5 w-full rounded-full bg-black/8" />
              <div className="h-2.5 w-4/5 rounded-full bg-black/8" />
              <div className="h-2.5 w-3/5 rounded-full bg-black/8" />
            </div>

            <div className="mt-7 flex items-center justify-between border-t pt-4">
              <span className="text-sm text-[var(--muted-foreground)]">
                Total
              </span>

              <span className="text-lg font-semibold">
                $8,400
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3 rounded-xl bg-[var(--surface-muted)] p-3">
          <Building2 className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" />

          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            Your company details and accent color will
            later be used on public proposals and PDFs.
          </p>
        </div>
      </aside>
    </form>
  );
}