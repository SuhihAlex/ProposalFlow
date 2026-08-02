import { ArrowRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderPage({ title, description, actionLabel }: { title: string; description: string; actionLabel: string }) {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={title} description={description} action={<Button><Plus className="size-4" />{actionLabel}</Button>} />
      <Card>
        <CardContent className="grid min-h-[420px] place-items-center p-8 text-center">
          <div className="max-w-md">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><ArrowRight className="size-6" /></div>
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">UI shell is ready</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Business logic for this section is intentionally deferred to its fixed implementation stage.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
