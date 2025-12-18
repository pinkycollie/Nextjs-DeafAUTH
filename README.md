# DeafAUTH — Next.js Identity & Prompted Accessibility Layer

[![CI/CD](https://github.com/pinkycollie/Nextjs-DeafAUTH/actions/workflows/ci.yml/badge.svg)](https://github.com/pinkycollie/Nextjs-DeafAUTH/actions/workflows/ci.yml)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/pinkycollie/Nextjs-DeafAUTH/network/updates)

DeafAUTH is a focused identity and accessibility orchestration layer for Next.js apps, built to help teams reliably discover, prompt for, persist, and track accessibility needs for Deaf and hard-of-hearing learners. It treats accessibility preferences as first-class identity metadata and provides integration patterns, small SDKs, and tracking primitives so organizations (for example: vr4deaf.org) can ensure learners get the accommodations they need throughout training.

This repository contains the specification and reference implementation for DeafAUTH. Use it as a product-spec and developer guide to implement middleware, server helpers, client prompts, and analytics/events.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase project (DeafAUTH v1 auth backend)

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

**Supabase Auth (branded as "DeafAUTH") is the only identity provider.** All profile and accessibility data is stored in Supabase Postgres with Row Level Security.

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

- Lightweight Next.js layer (middleware + server helpers + client SDK) on top of Supabase Auth
- Contextual prompt flows (first use, before modules, device change)
- Accessibility profile model: sign language, captions, pace, device type
- Delivery and outcome tracking (events & audit trail) in Supabase
- App Router + Pages Router support
- Accessibility-first UI patterns and copy guidance

## Integration Overview

DeafAUTH integrates at three levels:

1. **Middleware** — hydrate identity + accessibility profile and optionally redirect to prompt flows early.
2. **Server helpers** — read/update profiles and persist events in Supabase. Enforce retention and privacy rules.
3. **Client SDK & hooks** — show prompts, update profile, and record accommodation events from the UI.

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
  const profile = await getDeafAuthProfile(); // reads Supabase user + accessibility prefs
  return (
    <Dashboard
      user={profile.user}
      accessibility={profile.accessibility}
    />
  );
}
```

### Client Hook

```ts
import { useEffect } from 'react';
import { useDeafAuth } from '@/hooks/use-deafauth';

function TrainingModule({ moduleId }: { moduleId: string }) {
  const { profile, promptAccessibility, recordEvent } = useDeafAuth();

  useEffect(() => {
    if (!profile?.accessibilityConfirmed) {
      promptAccessibility({ context: 'module-start', moduleId });
    }
  }, [profile, moduleId, promptAccessibility]);

  const onAccommodationDelivered = () => {
    recordEvent('accommodation_delivered', {
      type: 'sign-interpreter',
      moduleId,
    });
  };

  return (
    // UI adapted to profile.accessibility
    // and calls onAccommodationDelivered when support is actually delivered
    null
  );
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

## Data Model (Supabase)

### User (profiles)
- **id** (uuid, matches auth.users.id)
- **email** 
- **display_name**
- **default_org_id** (for multi-tenant)

### AccessibilityProfile (accessibility_prefs)
- **user_id** (fk → profiles.id)
- **preferred_language** (e.g., "en", "es")
- **primary_support** ("sign-language" | "captions" | "text-only" | "other")
- **captions** object:
  - **enabled** (boolean)
  - **language** (string)
  - **size** (optional string)
- **interpreter_needed** (boolean)
- **pace_preference** ("normal" | "slow" | "manual")
- **device_types** (JSON array: ["vr-headset", "desktop", "mobile"])
- **accessibility_confirmed** (boolean)
- **last_updated_at** (timestamptz)

### AccommodationEvent / TrainingProgress (accommodation_events)
- **id** (uuid)
- **user_id**
- **module_id**
- **event_type** ("offered" | "accepted" | "declined" | "delivered" | "issue_reported" | "profile_submitted" | "module_completed")
- **metadata** (jsonb: { provider?: string, notes?: string })
- **timestamp** (timestamptz)

**All of this lives in Supabase Postgres with RLS enforcing org and user scoping.**

## Events & Tracking

**Standardized events (stored in accommodation_events):**
- accessibility_profile_submitted
- accommodation_offered
- accommodation_accepted
- accommodation_declined
- accommodation_delivered
- training_module_completed
- accessibility_issue_reported

Each event **SHOULD** include:
- **eventType**
- **userId**
- **context** (e.g., moduleId, page, device)
- **timestamp**
- **metadata** (free-form JSON)

## Adapters (no Clerk)

- **Auth**: Supabase Auth only
- **Datastore**: Supabase Postgres (primary), optionally mirrored to other DBs
- **Analytics**: Segment / Amplitude / custom event store (optional)

**No Clerk.** If you see Clerk mentioned anywhere in the repo or docs, replace it with: _"Auth provider: Supabase Auth (DeafAUTH project)."_

## Example Setup: vr4deaf.org

This section provides a concrete example of how vr4deaf.org would integrate DeafAUTH for VR-based Deaf training modules.

### Required Supabase Tables

**1. profiles table**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  default_org_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

**2. accessibility_prefs table**
```sql
CREATE TABLE accessibility_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'en',
  primary_support TEXT CHECK (primary_support IN ('sign-language', 'captions', 'text-only', 'other')),
  captions JSONB DEFAULT '{"enabled": true, "language": "en", "size": "medium"}'::jsonb,
  interpreter_needed BOOLEAN DEFAULT false,
  pace_preference TEXT DEFAULT 'normal' CHECK (pace_preference IN ('normal', 'slow', 'manual')),
  device_types JSONB DEFAULT '["desktop"]'::jsonb,
  accessibility_confirmed BOOLEAN DEFAULT false,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE accessibility_prefs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own accessibility preferences
CREATE POLICY "Users can read own accessibility prefs" ON accessibility_prefs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert/update their own accessibility preferences
CREATE POLICY "Users can manage own accessibility prefs" ON accessibility_prefs
  FOR ALL USING (auth.uid() = user_id);
```

**3. accommodation_events table**
```sql
CREATE TABLE accommodation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'offered', 'accepted', 'declined', 'delivered', 
    'issue_reported', 'profile_submitted', 'module_completed'
  )),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE accommodation_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own events
CREATE POLICY "Users can read own events" ON accommodation_events
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own events
CREATE POLICY "Users can insert own events" ON accommodation_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_accommodation_events_user_id ON accommodation_events(user_id);
CREATE INDEX idx_accommodation_events_module_id ON accommodation_events(module_id);
CREATE INDEX idx_accommodation_events_timestamp ON accommodation_events(timestamp);
```

### Redirect URLs Configuration

In your Supabase project settings (Authentication → URL Configuration):

- **Site URL**: `https://vr4deaf.org`
- **Redirect URLs** (whitelist these):
  - `https://vr4deaf.org/auth/callback`
  - `https://vr4deaf.org/dashboard`
  - `https://vr4deaf.org/training/*`
  - `http://localhost:3000/auth/callback` (for local development)
  - `http://localhost:3000/dashboard` (for local development)

### Event Logging During Training Modules

**Example: User starts a VR training module**

```typescript
// app/training/[moduleId]/page.tsx
'use client';

import { useEffect } from 'react';
import { useDeafAuth } from '@/hooks/use-deafauth';
import { useParams } from 'next/navigation';

export default function TrainingModulePage() {
  const { moduleId } = useParams();
  const { profile, recordEvent, promptAccessibility } = useDeafAuth();

  // On module start, check accessibility preferences
  useEffect(() => {
    if (!profile?.accessibilityConfirmed) {
      // Prompt user before starting VR session
      promptAccessibility({ 
        context: 'vr-module-start', 
        moduleId: moduleId as string 
      });
    } else {
      // Log that accommodation was offered
      recordEvent('accommodation_offered', {
        moduleId,
        accommodationType: profile.accessibility?.primarySupport,
        device: 'vr-headset'
      });
    }
  }, [profile, moduleId, promptAccessibility, recordEvent]);

  // When sign language interpreter joins
  const onInterpreterJoined = () => {
    recordEvent('accommodation_delivered', {
      type: 'sign-interpreter',
      moduleId,
      provider: 'vr4deaf-interpreter-network',
      timestamp: new Date().toISOString()
    });
  };

  // When captions are enabled in VR
  const onCaptionsEnabled = () => {
    recordEvent('accommodation_delivered', {
      type: 'captions',
      moduleId,
      language: profile?.accessibility?.captions?.language || 'en',
      size: profile?.accessibility?.captions?.size || 'medium'
    });
  };

  // When user completes module
  const onModuleComplete = () => {
    recordEvent('training_module_completed', {
      moduleId,
      duration: '45min',
      accessibilityUsed: profile?.accessibility?.primarySupport,
      completionRate: 100
    });
  };

  // If user reports an accessibility issue
  const onReportIssue = (issue: string) => {
    recordEvent('accessibility_issue_reported', {
      moduleId,
      issue,
      device: 'vr-headset',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div>
      {/* VR Training Module UI */}
      {/* Buttons to trigger events as needed */}
    </div>
  );
}
```

### Typical Event Flow for vr4deaf.org

1. **User signs up** → Creates profile in `profiles` table via Supabase Auth
2. **First visit** → Middleware detects no accessibility_prefs, redirects to setup
3. **User submits preferences** → Stored in `accessibility_prefs`, logs `profile_submitted` event
4. **User enters VR training module** → Logs `accommodation_offered` event
5. **Sign interpreter joins** → Logs `accommodation_delivered` event with interpreter metadata
6. **User completes module** → Logs `module_completed` event with duration and satisfaction
7. **Issue during training** → User reports, logs `accessibility_issue_reported` event

All events are queryable from the `accommodation_events` table for analytics dashboards, compliance audits, and training effectiveness reports.

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
- v0.3: Supabase integration with Postgres schema and RLS policies
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
