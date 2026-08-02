import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">
            Create clear, branded proposals that clients can review and approve without email chaos.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Log in</Link>
          <Link href="/#features">Features</Link>
          <Link href="/register">Register</Link>
        </div>
        <div className="border-t pt-6 text-xs text-[var(--muted-foreground)] md:col-span-2">
          © 2026 ProposalFlow. Portfolio SaaS demo.
        </div>
      </div>
    </footer>
  );
}
