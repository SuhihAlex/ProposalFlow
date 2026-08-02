"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  Plus,
  Settings2,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    label: "Proposals",
    href: "/proposals",
    icon: BriefcaseBusiness,
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    label: "Services",
    href: "/services",
    icon: Building2,
  },
];

const settings = [
  {
    label: "Company settings",
    href: "/settings/company",
    icon: Settings2,
  },
  {
    label: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
  },
];

type AppUser = {
  displayName: string;
  email: string;
  plan: string;
};

function getInitials(displayName: string) {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "PF";
}

function getPlanLabel(plan: string) {
  return `${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan`;
}

function SidebarContent({
  user,
  onNavigate,
}: {
  user: AppUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const itemClass = (href: string) =>
    cn(
      "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
      pathname === href ||
        (href !== "/dashboard" && pathname.startsWith(href))
        ? "bg-[var(--foreground)] text-white shadow-sm"
        : "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
    );

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 py-4">
        <Logo />
      </div>

      <div className="mt-4 px-3">
        <Button
          asChild
          className="w-full justify-between"
        >
          <Link
            href="/proposals/new"
            onClick={onNavigate}
          >
            New proposal
            <Plus className="size-4" />
          </Link>
        </Button>
      </div>

      <nav className="mt-6 grid gap-1 px-3">
        {navigation.map(
          ({
            label,
            href,
            icon: Icon,
          }) => (
            <Link
              key={href}
              className={itemClass(href)}
              href={href}
              onClick={onNavigate}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ),
        )}
      </nav>

      <div className="mt-auto border-t px-3 py-4">
        <nav className="grid gap-1">
          {settings.map(
            ({
              label,
              href,
              icon: Icon,
            }) => (
              <Link
                key={href}
                className={itemClass(href)}
                href={href}
                onClick={onNavigate}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ),
          )}
        </nav>

        <div className="mt-4 flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand-strong)]">
            {getInitials(user.displayName)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user.displayName}
            </p>

            <p
              className="truncate text-xs text-[var(--muted-foreground)]"
              title={user.email}
            >
              {getPlanLabel(user.plan)}
            </p>
          </div>

          <form
            action="/auth/signout"
            method="post"
          >
            <Button
              aria-label="Log out"
              size="icon"
              title="Log out"
              type="submit"
              variant="ghost"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: AppUser;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-[#fbfcf9] lg:block">
        <SidebarContent user={user} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 w-[86%] max-w-xs border-r bg-[#fbfcf9] shadow-2xl">
            <button
              aria-label="Close menu"
              className="absolute right-3 top-4 grid size-9 place-items-center rounded-lg hover:bg-[var(--surface-muted)]"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>

            <SidebarContent
              user={user}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-[color:rgb(246_247_242_/_0.9)] px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              aria-label="Open menu"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              size="icon"
              variant="secondary"
            >
              <Menu className="size-5" />
            </Button>

            <p className="text-sm font-semibold">
              ProposalFlow workspace
            </p>
          </div>

          <Button
            asChild
            size="sm"
          >
            <Link href="/proposals/new">
              <Plus className="size-4" />
              New proposal
            </Link>
          </Button>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}