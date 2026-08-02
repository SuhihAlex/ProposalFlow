import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>{eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{eyebrow}</p>}<h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>}</div>
      {action}
    </div>
  );
}
