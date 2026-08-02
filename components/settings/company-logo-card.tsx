"use client";

import {
  Building2,
  ImageUp,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  deleteCompanyLogoAction,
  uploadCompanyLogoAction,
  type CompanyLogoActionState,
} from "@/app/(app)/settings/company/logo-actions";
import { Button } from "@/components/ui/button";

const initialState: CompanyLogoActionState = {
  status: "idle",
  message: "",
};

const MAX_LOGO_SIZE = 2 * 1024 * 1024;

function StatusMessage({
  state,
}: {
  state: CompanyLogoActionState;
}) {
  if (
    state.status === "idle" ||
    !state.message
  ) {
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

export function CompanyLogoCard({
  companyExists,
  currentLogoUrl,
}: {
  companyExists: boolean;
  currentLogoUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [clientError, setClientError] = useState("");

  const [
    uploadState,
    uploadAction,
    uploadPending,
  ] = useActionState(
    uploadCompanyLogoAction,
    initialState,
  );

  const [
    deleteState,
    deleteAction,
    deletePending,
  ] = useActionState(
    deleteCompanyLogoAction,
    initialState,
  );

  useEffect(() => {
    if (uploadState.status !== "success") {
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    router.refresh();
  }, [router, uploadState.status]);

  useEffect(() => {
    if (deleteState.status === "success") {
      router.refresh();
    }
  }, [deleteState.status, router]);

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {currentLogoUrl ? (
          <div
            aria-label="Current company logo"
            className="size-24 shrink-0 rounded-2xl border bg-white bg-contain bg-center bg-no-repeat shadow-sm"
            role="img"
            style={{
              backgroundImage: `url("${currentLogoUrl}")`,
            }}
          />
        ) : (
          <div className="grid size-24 shrink-0 place-items-center rounded-2xl border bg-[var(--surface-muted)]">
            <Building2 className="size-9 text-[var(--muted-foreground)]" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">
            Company logo
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Upload a square or horizontal logo for public
            proposals and PDF documents.
          </p>

          <div className="mt-4 grid gap-3">
            {clientError ? (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {clientError}
              </div>
            ) : null}

            <StatusMessage state={uploadState} />
            <StatusMessage state={deleteState} />
          </div>

          {!companyExists ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Save the company information below before
              uploading a logo.
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3">
            <form
              action={uploadAction}
              className="flex flex-col gap-3 lg:flex-row lg:items-center"
            >
              <input
                accept="image/png,image/jpeg,image/webp"
                className="block w-full min-w-0 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface-muted)] file:px-3 file:py-1.5 file:text-xs file:font-semibold hover:file:bg-black/8"
                disabled={!companyExists || uploadPending}
                name="logo"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];

                  if (!file) {
                    setClientError("");
                    return;
                  }

                  if (file.size > MAX_LOGO_SIZE) {
                    event.currentTarget.value = "";
                    setClientError(
                      "The logo must be no larger than 2 MB.",
                    );
                    return;
                  }

                  setClientError("");
                }}
                ref={fileInputRef}
                required
                type="file"
              />

              <Button
                className="shrink-0"
                disabled={
                  !companyExists ||
                  uploadPending
                }
                type="submit"
              >
                {uploadPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageUp className="size-4" />
                    Upload logo
                  </>
                )}
              </Button>
            </form>

            {currentLogoUrl ? (
              <form action={deleteAction}>
                <Button
                  disabled={deletePending}
                  type="submit"
                  variant="outline"
                >
                  {deletePending ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      Remove logo
                    </>
                  )}
                </Button>
              </form>
            ) : null}
          </div>

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            PNG, JPEG or WebP. Maximum file size: 2 MB.
            SVG files are not accepted.
          </p>
        </div>
      </div>
    </section>
  );
}