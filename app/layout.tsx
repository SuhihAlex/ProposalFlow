import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ProposalFlow", template: "%s · ProposalFlow" },
  description: "Create, send and track polished commercial proposals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
