"use client";

import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type ProposalPublicLinkProps = {
  publicToken: string;
};

export function ProposalPublicLink({
  publicToken,
}: ProposalPublicLinkProps) {
  const [copied, setCopied] = useState(false);

  const publicPath = `/p/${publicToken}`;

  const previewPath = `${publicPath}?preview=1`;

  async function copyPublicLink() {
    const publicUrl = new URL(
      publicPath,
      window.location.origin,
    ).toString();

    try {
      await navigator.clipboard.writeText(publicUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy public proposal URL:",
        error,
      );

      window.alert(
        "The link could not be copied automatically.",
      );
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-semibold">
            Public proposal link
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            Share this secure link with the client. No
            ProposalFlow account is required to open it.
          </p>

          <code className="mt-3 block max-w-full overflow-x-auto rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs">
            {publicPath}
          </code>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button
            onClick={copyPublicLink}
            type="button"
            variant="outline"
          >
            {copied ? (
              <>
                <Check className="size-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy link
              </>
            )}
          </Button>

          <Button asChild>
            <Link
              href={previewPath}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-4" />
              Open preview
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}