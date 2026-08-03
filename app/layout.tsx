import type { Metadata } from "next";

import "./globals.css";

const siteUrl = "https://proposalflow-six.vercel.app";

const description =
  "Create, send and track professional commercial proposals from one focused workspace.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "ProposalFlow — Proposal Management SaaS",
    template: "%s · ProposalFlow",
  },

  description,

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ProposalFlow",
    title: "ProposalFlow — Proposal Management SaaS",
    description,
  },

  twitter: {
    card: "summary_large_image",
    title: "ProposalFlow — Proposal Management SaaS",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}