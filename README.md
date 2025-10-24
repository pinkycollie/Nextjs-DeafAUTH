# DeafAUTH — Next.js Identity & Prompted Accessibility Layer

DeafAUTH is a focused identity and accessibility orchestration layer for Next.js apps, built to help teams reliably discover, prompt for, persist, and track accessibility needs for Deaf and hard-of-hearing learners. It treats accessibility preferences as first-class identity metadata and provides integration patterns, small SDKs, and tracking primitives so organizations (for example: vr4deaf.org) can ensure learners get the accommodations they need throughout training.

This repository contains the specification and reference README for DeafAUTH. Use it as a product-spec and developer guide to implement middleware, server helpers, client prompts, and analytics/events.

Table of contents
- Vision
- Problem
- Core features
- Integration overview
- Quick start (conceptual)
- Examples
  - Middleware (conceptual)
  - Server (App Router)
  - Client hook
- Data model
- Events & tracking
- Privacy & security
- Accessibility-first guidance
- Roadmap
- Contribution & governance
- License

Vision
------
Make inclusive learning measurable and repeatable by integrating accessibility needs directly into identity. DeafAUTH enables contextual prompting, persistent accessibility profiles, and assured delivery tracking so training providers can plan and verify accommodations (captions, sign language interpreters, real-time captioners, pace adjustments, etc.).

Problem
-------
Authentication/authorization libraries rarely capture ongoing accessibility needs or link them to training outcomes. Common issues:
- Needs are requested once and forgotten.
- Accessibility settings live separate from identity.
- No reliable audit that accommodations were offered/delivered.

DeafAUTH solves this by modeling accessibility as identity metadata and providing patterns to prompt, persist, and record accommodation lifecycle events.

Core features
-------------
- Lightweight Next.js layer (middleware + server helpers + client SDK)
- Contextual prompt flows (first use, before modules, device change)
- Accessibility profile model: sign language, captions, pace, device type
- Delivery and outcome tracking (events & audit trail)
- Extensible adapters (auth providers, DBs, analytics)
- App Router + Pages Router support
- Accessibility-first UI patterns and copy guidance (keyboard + screen reader friendly)

Integration overview
--------------------
DeafAUTH is intended to be integrated at three levels:
1. Middleware — hydrate identity + profile and optionally redirect to prompt flows early.
2. Server helpers — read/update profiles, persist events, enforce retention and privacy rules.
3. Client SDK & hooks — show prompts, update profile, and record in-app events.

Quick start (conceptual)
------------------------
1. Install DeafAUTH package(s) for Next.js.
2. Plug middleware to hydrate profile early.
3. Use server helpers in server components or APIs to enforce prompts or read preferences.
4. Use client hooks to prompt users contextually and record delivery events.

Examples (conceptual)
---------------------

Middleware (conceptual)
```ts
// middleware.ts (conceptual)
import { withDeafAuth } from 'deafauth/next';

export default withDeafAuth({
  promptOnFirstVisit: true,
  skip: ['/public', '/health'],
});
```

Server (App Router)
```tsx
// app/dashboard/page.tsx
import { getDeafAuthProfile } from 'deafauth/server';

export default async function DashboardPage({ request }) {
  const profile = await getDeafAuthProfile(request);
  return <Dashboard user={profile.user} accessibility={profile.accessibility} />;
}
```

Client hook
```ts
import { useDeafAuth } from 'deafauth/client';

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

Data model (conceptual)
-----------------------
User
- id
- name
- email
- authProviderId

AccessibilityProfile
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

Events & tracking
-----------------
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

Privacy & security
------------------
DeafAUTH handles sensitive identity & accessibility data. Follow these principles:
- Collect only what’s required for accommodations.
- Clear, contextual consent before storing/sharing preferences.
- Encryption in transit (TLS) and at rest.
- Configurable retention policies (default: minimal).
- Export and delete tooling to meet GDPR/CCPA requests.
- Prefer pseudonymous analytics where possible.
- Explicit user control for sharing profile with external vendors (interpreters, captioners).

Accessibility-first guidance
----------------------------
- Prompts must be keyboard accessible and screen-reader friendly.
- Provide "Ask me later" and "Never ask again" options.
- Use plain, non-technical language in prompts (offer examples of supports).
- Avoid defaulting to intrusive settings — prefer safe defaults like captions ON if unsure.
- Allow users to update preferences easily from account settings.

Roadmap (example)
-----------------
- v0.1: Spec, middleware, simple server APIs, client hook
- v0.2: Prompt UI components + examples (App Router + Pages Router)
- v0.3: Adapters for NextAuth/Clerk + Postgres example
- v0.4: Built-in analytics adapter and demo dashboards
- v1.0: Stable API, privacy toolkit, community contributions

Contribution
------------
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

License
-------
Choose a license that matches your goals. MIT encourages wide adoption; consider more restrictive licenses if you need them. Include privacy and data-handling guidance in docs.

Contact
-------
For collaboration related to vr4deaf.org, training integrations, or product design, list your project contact or email here.


## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
