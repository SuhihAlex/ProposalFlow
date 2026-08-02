"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-[color:rgb(246_247_242_/_0.88)] backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--muted-foreground)] md:flex">
          <Link className="hover:text-[var(--foreground)]" href="/#features">Features</Link>
          <Link className="hover:text-[var(--foreground)]" href="/#workflow">Workflow</Link>
          <Link className="hover:text-[var(--foreground)]" href="/pricing">Pricing</Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost"><Link href="/login">Log in</Link></Button>
          <Button asChild><Link href="/register">Create proposal</Link></Button>
        </div>
        <Button aria-label={open ? "Close navigation" : "Open navigation"} className="md:hidden" onClick={() => setOpen((value) => !value)} size="icon" variant="secondary">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
      {open && (
        <div className="border-t bg-[var(--background)] px-4 py-4 md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 text-sm font-medium">
            <Link className="rounded-xl px-3 py-3 hover:bg-white" href="/#features" onClick={() => setOpen(false)}>Features</Link>
            <Link className="rounded-xl px-3 py-3 hover:bg-white" href="/#workflow" onClick={() => setOpen(false)}>Workflow</Link>
            <Link className="rounded-xl px-3 py-3 hover:bg-white" href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-4">
              <Button asChild variant="secondary"><Link href="/login" onClick={() => setOpen(false)}>Log in</Link></Button>
              <Button asChild><Link href="/register" onClick={() => setOpen(false)}>Start free</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
