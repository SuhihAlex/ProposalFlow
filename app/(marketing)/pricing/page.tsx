import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const plans = [
  { name: "Free", price: "$0", description: "For validating your proposal workflow.", features: ["Up to 3 proposals", "Public proposal links", "PDF export", "Core analytics"], cta: "Start free" },
  { name: "Solo", price: "$15", description: "For independent professionals sending proposals every month.", features: ["Unlimited proposals", "AI section generation", "Email notifications", "Stripe test checkout"], cta: "Choose Solo", featured: true },
  { name: "Studio", price: "$39", description: "A visual product tier for small studio workflows.", features: ["Everything in Solo", "Higher AI allowance", "Priority support demo", "Future team-ready positioning"], cta: "Choose Studio" },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Simple pricing</p><h1 className="font-display mt-4 text-5xl leading-tight sm:text-6xl">Choose the pace that fits your proposal work.</h1><p className="mt-5 text-base leading-7 text-[var(--muted-foreground)]">Pricing is intentionally simple for the MVP. Stripe is demonstrated in test mode only.</p></div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => <Card key={plan.name} className={plan.featured ? "border-[var(--brand)] shadow-[var(--shadow-md)]" : ""}><CardContent className="p-7"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{plan.name}</h2>{plan.featured && <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand-strong)]">Most practical</span>}</div><p className="mt-4 text-4xl font-bold tracking-[-0.05em]">{plan.price}<span className="text-sm font-medium text-[var(--muted-foreground)]"> / month</span></p><p className="mt-3 min-h-12 text-sm leading-6 text-[var(--muted-foreground)]">{plan.description}</p><Button asChild className="mt-6 w-full" variant={plan.featured ? "default" : "secondary"}><Link href="/register">{plan.cta}</Link></Button><div className="mt-7 grid gap-3 border-t pt-6">{plan.features.map((feature) => <p key={feature} className="flex items-start gap-2.5 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" />{feature}</p>)}</div></CardContent></Card>)}
      </div>
    </main>
  );
}
