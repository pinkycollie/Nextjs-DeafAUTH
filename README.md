# DeafAUTH — Next.js Identity & Prompted Accessibility Layer

[![CI/CD](https://github.com/pinkycollie/Nextjs-DeafAUTH/actions/workflows/ci.yml/badge.svg)](https://github.com/pinkycollie/Nextjs-DeafAUTH/actions/workflows/ci.yml)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/pinkycollie/Nextjs-DeafAUTH/network/updates)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.1-blue?logo=accessibility)](https://www.w3.org/WAI/WCAG21/quickref/)
[![a11y: Deaf Friendly](https://img.shields.io/badge/a11y-Deaf_Friendly-purple)](https://github.com/pinkycollie/Nextjs-DeafAUTH)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/pinkycollie/Nextjs-DeafAUTH/pulls)

DeafAUTH is a focused identity and accessibility orchestration layer for Next.js apps, built to help teams reliably discover, prompt for, persist, and track accessibility needs for Deaf and hard-of-hearing learners. It treats accessibility preferences as first-class identity metadata and provides integration patterns, small SDKs, and tracking primitives so organizations (for example: vr4deaf.org) can ensure learners get the accommodations they need throughout training.

This repository contains the specification and reference implementation for DeafAUTH. Use it as a product-spec and developer guide to implement middleware, server helpers, client prompts, and analytics/events.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account (for authentication backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/pinkycollie/Nextjs-DeafAUTH.git
cd Nextjs-DeafAUTH

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
pnpm dev
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Auto-Deploy & Auto-Update

This repository is configured with:

- **Dependabot**: Automatically creates PRs for dependency updates (daily)
- **Auto-merge**: Automatically merges patch and minor dependency updates
- **CI/CD Pipeline**: Builds and tests on every push/PR
- **Sync Workflow**: Syncs to `github.com/deafauth/nextjs` on main branch updates

### Setting Up Sync to DeafAUTH Repository

To enable syncing to the `deafauth/nextjs` repository:

1. Create a Personal Access Token (PAT) with `repo` scope
2. Add it as a repository secret named `DEAFAUTH_SYNC_TOKEN`
3. The sync workflow will automatically push changes on every main branch update

## Table of Contents

- [Vision](#vision)
- [Problem](#problem)
- [Core Features](#core-features)
- [Integration Overview](#integration-overview)
- [Quick Start (Usage)](#quick-start-usage)
- [Examples](#examples)
  - [Middleware](#middleware)
  - [Server (App Router)](#server-app-router)
  - [Client Hook](#client-hook)
- [Data Model](#data-model)
- [Events & Tracking](#events--tracking)
- [Privacy & Security](#privacy--security)
- [Accessibility-First Guidance](#accessibility-first-guidance)
- [Roadmap](#roadmap)
- [Contribution](#contribution)
- [License](#license)

## Vision

Make inclusive learning measurable and repeatable by integrating accessibility needs directly into identity. DeafAUTH enables contextual prompting, persistent accessibility profiles, and assured delivery tracking so training providers can plan and verify accommodations (captions, sign language interpreters, real-time captioners, pace adjustments, etc.).

## Problem

Authentication/authorization libraries rarely capture ongoing accessibility needs or link them to training outcomes. Common issues:
- Needs are requested once and forgotten.
- Accessibility settings live separate from identity.
- No reliable audit that accommodations were offered/delivered.

DeafAUTH solves this by modeling accessibility as identity metadata and providing patterns to prompt, persist, and record accommodation lifecycle events.

## Core Features

- Lightweight Next.js layer (middleware + server helpers + client SDK)
- Contextual prompt flows (first use, before modules, device change)
- Accessibility profile model: sign language, captions, pace, device type
- Delivery and outcome tracking (events & audit trail)
- Extensible adapters (auth providers, DBs, analytics)
- App Router + Pages Router support
- Accessibility-first UI patterns and copy guidance (keyboard + screen reader friendly)

## Integration Overview

DeafAUTH is intended to be integrated at three levels:
1. **Middleware** — hydrate identity + profile and optionally redirect to prompt flows early.
2. **Server helpers** — read/update profiles, persist events, enforce retention and privacy rules.
3. **Client SDK & hooks** — show prompts, update profile, and record in-app events.

## Quick Start (Usage)

1. Import and configure the middleware
2. Use server helpers in server components or APIs
3. Use client hooks to prompt users contextually

## Examples

### Middleware

```ts
// middleware.ts
import { withDeafAuth } from '@/lib/deafauth-middleware';

export default withDeafAuth({
  promptOnFirstVisit: true,
  skip: ['/public', '/health'],
});
```

### Server (App Router)

```tsx
// app/dashboard/page.tsx
import { getDeafAuthProfile } from '@/lib/deafauth-server';

export default async function DashboardPage() {
  const profile = await getDeafAuthProfile();
  return <Dashboard user={profile.user} accessibility={profile.accessibility} />;
}
```

### Client Hook

```ts
import { useDeafAuth } from '@/hooks/use-deafauth';

function TrainingModule({ moduleId }) {
  const { profile, promptAccessibility, recordEvent } = useDeafAuth();

  useEffect(() => {
    if (!profile?.accessibilityConfirmed) {
      promptAccessibility({ context: 'module-start', moduleId });
    }
  }, [profile]);

  const onAccommodationDelivered = () => {
    recordEvent('accommodation_delivered', { type: 'sign-interpreter', moduleId });
  };

  return (/* UI adapted to profile */);
}
```

### Accessibility Prompt Component

```tsx
import { AccessibilityPrompt } from '@/components/accessibility-prompt';
import { AccessibilityProvider } from '@/components/accessibility-provider';

function App() {
  return (
    <AccessibilityProvider>
      <YourApp />
      <AccessibilityPrompt />
    </AccessibilityProvider>
  );
}
```

## Data Model

### User
- id
- name
- email
- authProviderId

### AccessibilityProfile
- userId
- preferredLanguage (e.g., "en", "es")
- primarySupport (e.g., "sign-language", "captions", "text-only")
- captions: { enabled: boolean, language: string, size?: string }
- interpreterNeeded: boolean
- pacePreference: "normal" | "slow" | "manual"
- deviceTypes: ["vr-headset", "desktop", "mobile"]
- accessibilityConfirmed: boolean
- lastUpdatedAt: ISO timestamp

AccommodationEvent / TrainingProgress
- id
- userId
- moduleId
- eventType: "offered" | "accepted" | "declined" | "delivered" | "issue_reported"
- metadata: { provider?: string, notes?: string }
- timestamp: ISO timestamp

## Events & Tracking

DeafAUTH standardizes a small set of events to drive analytics, audit, and reporting:
- accessibility_profile_submitted
- accommodation_offered
- accommodation_accepted
- accommodation_declined
- accommodation_delivered
- training_module_completed
- accessibility_issue_reported

Each event SHOULD include:
- eventType
- userId or anonymousId
- context (moduleId, page, device)
- timestamp
- metadata (free-form JSON)

Adapters
- Auth: NextAuth, Clerk, custom JWT
- Datastore: Postgres, DynamoDB, Fauna, SQLite (dev)
- Analytics: Segment, Amplitude, self-hosted event store

## Privacy & Security

DeafAUTH handles sensitive identity & accessibility data. Follow these principles:
- Collect only what’s required for accommodations.
- Clear, contextual consent before storing/sharing preferences.
- Encryption in transit (TLS) and at rest.
- Configurable retention policies (default: minimal).
- Export and delete tooling to meet GDPR/CCPA requests.
- Prefer pseudonymous analytics where possible.
- Explicit user control for sharing profile with external vendors (interpreters, captioners).

## Accessibility-First Guidance

- Prompts must be keyboard accessible and screen-reader friendly.
- Provide "Ask me later" and "Never ask again" options.
- Use plain, non-technical language in prompts (offer examples of supports).
- Avoid defaulting to intrusive settings — prefer safe defaults like captions ON if unsure.
- Allow users to update preferences easily from account settings.

## Roadmap

- v0.1: Spec, middleware, simple server APIs, client hook
- v0.2: Prompt UI components + examples (App Router + Pages Router)
- v0.3: Adapters for NextAuth/Clerk + Postgres example
- v0.4: Built-in analytics adapter and demo dashboards
- v1.0: Stable API, privacy toolkit, community contributions

## Contribution

Contributions are welcome. Ways to help:
- Implement adapters (auth, DB, analytics)
- Provide UI components and examples for VR and web training
- Add localized prompt copy and UX testing notes
- Create automated tests and E2E flow examples

Suggested repo layout
- /packages/deafauth-next — middleware, server helpers
- /packages/deafauth-client — client hooks & prompt components
- /examples/vr4deaf — sample integration with training flow
- /docs — privacy, prompt wording, UX guidance

## License

Choose a license that matches your goals. MIT encourages wide adoption; consider more restrictive licenses if you need them. Include privacy and data-handling guidance in docs.

## Contact

For collaboration related to vr4deaf.org, training integrations, or product design, list your project contact or email here.


## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
