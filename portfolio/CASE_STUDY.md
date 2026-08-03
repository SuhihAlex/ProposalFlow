# ProposalFlow — Full-Stack SaaS Proposal Management Platform

## Project Overview

ProposalFlow is a full-stack SaaS application for creating, sending and tracking commercial proposals.

The product is designed for freelancers, agencies and service companies that need a structured way to manage clients, reusable services, proposal pricing and client decisions without relying on disconnected documents, spreadsheets and email threads.

**Live product:**  
https://proposalflow-six.vercel.app

---

## The Problem

Creating a commercial proposal often requires several unrelated tools:

- client information is stored separately;
- services and prices are copied manually;
- totals and discounts are calculated in spreadsheets;
- proposals are sent as static documents;
- it is difficult to know whether a client viewed the proposal;
- client approval is handled through separate email conversations.

This creates repetitive work and makes proposal status difficult to track.

---

## The Solution

ProposalFlow combines the complete proposal workflow into one focused workspace.

Users can:

1. Create a company workspace.
2. Manage clients.
3. Create a reusable service catalogue.
4. Build proposal drafts.
5. Add services, quantities and prices.
6. Apply percentage or fixed discounts.
7. Publish secure client-facing proposal links.
8. Track when proposals are viewed.
9. Receive accepted or rejected responses.
10. Review proposal activity from a dashboard.

---

## My Role

I designed and developed the product from initial scope to production deployment.

My responsibilities included:

- product structure and MVP definition;
- responsive UX/UI implementation;
- frontend architecture;
- Supabase database architecture;
- authentication and session management;
- Row Level Security policies;
- proposal pricing logic;
- public proposal access;
- client response workflow;
- production deployment;
- validation and testing.

---

## Core Features

### Authentication

- User registration
- Email confirmation
- Login and logout
- Password recovery
- Protected application routes
- Server-side Supabase session handling

### Company Workspace

- Company profile settings
- Contact information
- Default currency
- Brand accent configuration
- Company logo upload

### Client Management

- Create clients
- Edit client details
- Delete clients
- Store company and contact information
- Assign clients to proposals

### Service Catalogue

- Create reusable services
- Configure pricing
- Define billing units
- Organize services by category
- Reuse services across proposals

### Proposal Management

- Create proposal drafts
- Assign a client
- Set proposal validity dates
- Add proposal services
- Configure quantities and unit prices
- Apply fixed or percentage discounts
- Automatic subtotal and total calculation
- Filter proposals by status

### Proposal Status Workflow

ProposalFlow supports the following statuses:

- Draft
- Sent
- Viewed
- Accepted
- Rejected
- Expired

When a client opens a published proposal, its status automatically changes from `Sent` to `Viewed`.

### Public Proposal Pages

- Secure token-based proposal links
- No client account required
- Responsive client-facing presentation
- Project overview
- Scope and pricing
- Proposal validity date
- Final proposal value
- Accept or decline workflow

### Client Responses

Clients can submit:

- acceptance or rejection;
- their name;
- email address;
- an optional comment.

Each proposal can receive only one final response.

### Dashboard

The dashboard displays:

- total proposals;
- published proposal activity;
- active pipeline value;
- accepted proposal value;
- recent proposals;
- status distribution;
- proposal view rate.

---

## UX and Interface

The interface was designed as a clean, focused SaaS workspace.

The visual system includes:

- responsive desktop and mobile layouts;
- reusable interface components;
- consistent status badges;
- structured information hierarchy;
- accessible form controls;
- clear proposal pricing blocks;
- client-facing public proposal layouts.

The product uses a neutral visual system with green brand accents to communicate progress, approval and business activity.

---

## Technical Stack

### Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Lucide React
- Reusable shadcn-compatible components

### Backend and Database

- Next.js Server Actions
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- PostgreSQL functions
- Database triggers
- Row Level Security

### Validation and Development

- Zod
- ESLint
- TypeScript
- Supabase CLI
- npm

### Deployment

- GitHub
- Vercel
- Supabase Cloud

---

## Database Architecture

The project includes database entities for:

- profiles;
- companies;
- clients;
- services;
- proposals;
- proposal sections;
- proposal items;
- proposal views;
- proposal responses;
- subscriptions.

Database migrations are version-controlled inside the repository.

Proposal pricing totals are calculated at the database level to keep financial values consistent between the dashboard, editor and public proposal page.

---

## Security

The application includes:

- authenticated workspace routes;
- owner-scoped database access;
- Supabase Row Level Security;
- secure public proposal tokens;
- safe redirect validation;
- server-side form validation;
- database-level response validation;
- one final response per proposal;
- environment variables excluded from Git;
- no service-role key exposed to the browser.

Public proposal access is handled through restricted PostgreSQL functions rather than unrestricted anonymous table access.

---

## Key Technical Challenges

### Secure Public Access

Clients need to open proposals without creating accounts.

This was solved with unique public proposal tokens and restricted database functions that expose only the information required by the public page.

### Proposal Status Tracking

The application automatically records client activity and changes a proposal from `Sent` to `Viewed` when opened through its public link.

### Accurate Proposal Pricing

Proposal items, quantities, prices and discounts need to produce consistent totals across several pages.

Pricing calculations are persisted and validated at the database level.

### Final Client Decisions

A client must not be able to submit multiple or conflicting decisions.

The response model enforces one final response per proposal and synchronizes the final proposal status.

---

## Validation

The project passes:

npm run lint
npm run typecheck
npm run build

The production version was manually tested for:

- public pages;
- authentication;
- protected routes;
- dashboard data;
- client management;
- service management;
- proposal creation;
- public proposal access;
- proposal view tracking;
- client responses;
- password recovery.

---

## Screenshots

Landing Page

Dashboard

Proposal Management

Proposal Editor and Client Response

Public Client Proposal

Proposal Pricing

### Result

ProposalFlow was developed from an initial product concept into a working production SaaS MVP.

The final product demonstrates:

- full-stack SaaS development;
- frontend and backend integration;
- authentication;
- relational database design;
- secure public workflows;
- business pricing logic;
- responsive UI implementation;
- production deployment.

Production:

https://proposalflow-six.vercel.app