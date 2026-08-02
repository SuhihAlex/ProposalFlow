import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeatureCard({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <Card className="h-full transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <CardContent className="p-6">
        <div className="grid size-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
          <Icon className="size-5" />
        </div>
        <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      </CardContent>
    </Card>
  );
}
