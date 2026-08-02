import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, FileCheck2, Gauge, Link2, Sparkles } from "lucide-react";
import { FeatureCard } from "@/components/marketing/feature-card";
import { ProposalPreview } from "@/components/marketing/proposal-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main>
      <section className="overflow-hidden border-b">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-18 sm:px-6 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-28">
          <div>
            <Badge className="border-[#b9dac9] bg-[var(--brand-soft)] text-[var(--brand-strong)]"><Sparkles className="mr-1.5 size-3.5" /> Client-ready proposals, faster</Badge>
            <h1 className="font-display mt-6 max-w-3xl text-5xl leading-[0.98] text-balance sm:text-6xl lg:text-7xl">Make every proposal feel like your best work.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">Create branded commercial proposals, generate the right sections with AI, and track client decisions through one focused workflow.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg"><Link href="/register">Start free <ArrowRight className="size-4" /></Link></Button><Button asChild size="lg" variant="secondary"><Link href="/login">View demo account</Link></Button></div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[var(--muted-foreground)]">
              {['No credit card', '3 free proposals', 'Public client links'].map((item) => <span key={item} className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-[var(--brand)]" />{item}</span>)}
            </div>
          </div>
          <ProposalPreview />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Everything in one flow</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Less document assembly. More confident client communication.</h2></div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={FileCheck2} title="Structured proposal builder" description="Combine project context, scope, services and pricing without fighting a general-purpose document editor." />
          <FeatureCard icon={Bot} title="Focused AI writing" description="Generate only the strategic sections you need, while keeping pricing and legal terms under your control." />
          <FeatureCard icon={Link2} title="Branded public links" description="Send a polished web proposal that works on every device and does not require a client account." />
          <FeatureCard icon={Gauge} title="Clear proposal status" description="See what is drafted, sent, viewed, accepted, rejected or expired without building a full CRM." />
          <FeatureCard icon={Sparkles} title="Professional PDF output" description="Give clients a clean downloadable document with company details, scope, dates and final pricing." />
          <FeatureCard icon={CheckCircle2} title="Simple approval" description="Let clients accept or decline from the proposal page and keep the final state visible in your dashboard." />
        </div>
      </section>

      <section id="workflow" className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">A compact workflow</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Move from brief to decision without extra tools.</h2><p className="mt-5 text-sm leading-7 text-[var(--muted-foreground)]">ProposalFlow deliberately avoids CRM complexity. It focuses on the one journey that matters: creating a strong proposal and getting a clear response.</p></div>
            <div className="grid gap-3">
              {[
                ["01", "Prepare", "Set up your company, client and reusable service catalogue."],
                ["02", "Compose", "Build the proposal, calculate pricing and generate selected sections with AI."],
                ["03", "Share", "Publish a secure client link and export the same content as PDF."],
                ["04", "Decide", "Track the view and receive an accepted or rejected status."],
              ].map(([number, title, text]) => <div key={number} className="grid gap-4 rounded-2xl border bg-[#fbfcf9] p-5 sm:grid-cols-[52px_140px_1fr] sm:items-center"><span className="text-sm font-bold text-[var(--brand)]">{number}</span><h3 className="font-semibold">{title}</h3><p className="text-sm leading-6 text-[var(--muted-foreground)]">{text}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="overflow-hidden rounded-[32px] bg-[var(--foreground)] px-6 py-14 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-2xl"><p className="text-sm font-semibold text-[#add7c2]">Start with a complete demo workspace</p><h2 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">Your next proposal can look finished before the meeting ends.</h2></div>
          <Button
            asChild
            className="landing-cta-button mt-8 lg:mt-0"
            size="lg"
            variant="secondary"
          >
            <Link href="/register">
              Create your workspace
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
