import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("focus-ring inline-flex items-center gap-2.5 rounded-lg", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-[var(--foreground)] text-white shadow-sm">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2">
          <path d="M6.5 6.5h7a4 4 0 0 1 0 8H10v3" />
          <path d="M10 10.5h4" />
        </svg>
      </span>
      {!compact && <span className="text-[15px] font-bold tracking-[-0.02em]">ProposalFlow</span>}
    </Link>
  );
}
