import { Check, Eye, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProposalPreview() {
  return (
    <div className="relative mx-auto max-w-[620px]">
      <div className="absolute -inset-5 -z-10 rounded-[36px] bg-[var(--brand-soft)] blur-2xl" />
      <div className="overflow-hidden rounded-[26px] border bg-white shadow-[var(--shadow-md)]">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#e9ece6] text-xs font-bold">ND</div>
            <div>
              <p className="text-sm font-semibold">Northline Digital</p>
              <p className="text-xs text-[var(--muted-foreground)]">Proposal #PF-2026-018</p>
            </div>
          </div>
          <MoreHorizontal className="size-5 text-[var(--muted-foreground)]" />
        </div>
        <div className="grid gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="border-[#b9dac9] bg-[var(--brand-soft)] text-[var(--brand-strong)]">Viewed</Badge>
              <h3 className="mt-4 max-w-lg text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                Website redesign for Aster Dental Clinic
              </h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Prepared for Elena Morris · Valid until Aug 21</p>
            </div>
            <div className="rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-right">
              <p className="text-xs text-[var(--muted-foreground)]">Total investment</p>
              <p className="mt-1 text-xl font-bold">$8,750</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Strategy & UX", "$1,400"],
              ["UI design", "$2,850"],
              ["Development", "$4,500"],
            ].map(([name, price]) => (
              <div key={name} className="rounded-xl border bg-[#fbfcf9] p-4">
                <p className="text-sm font-medium">{name}</p>
                <p className="mt-3 text-sm font-semibold">{price}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Proposed solution</p>
              <span className="text-xs text-[var(--muted-foreground)]">AI assisted</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              A conversion-focused website system that makes treatment options easier to understand and gives the clinic a clearer path from discovery to booking.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t bg-[#fbfcf9] px-5 py-4">
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <Eye className="size-4" /> Last viewed 18 minutes ago
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand)]">
            <Check className="size-4" /> Ready for approval
          </div>
        </div>
      </div>
    </div>
  );
}
