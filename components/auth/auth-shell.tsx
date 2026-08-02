import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export function AuthShell({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
          </div>
          {children}
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">© 2026 ProposalFlow</p>
      </section>
      <aside className="relative hidden overflow-hidden bg-[var(--foreground)] p-12 text-white lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-[#add7c2]">Built for focused client work</p>
            <h2 className="font-display mt-5 text-5xl leading-[1.05] text-balance">
              From first brief to approved proposal in one clear flow.
            </h2>
          </div>
          <div className="max-w-lg rounded-[28px] border border-white/12 bg-white/7 p-7 backdrop-blur">
            <p className="text-sm leading-6 text-white/70">
              “The proposal finally feels like part of the product—not a document we assemble at the end of the sales process.”
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Northline Digital</p>
                <p className="mt-1 text-xs text-white/50">Demo workspace</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#add7c2]">
                <CheckCircle2 className="size-4" /> 7 proposals ready
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
