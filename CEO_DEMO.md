# CEO Demo: Lead Ops Automation

## Architecture

The demo is a local-only dashboard workflow that shows the full lead operations loop without deployment, paid APIs, or external side effects.

Flow:

1. Lead intake form captures contact, company, budget, urgency, and need.
2. Local deterministic classifier scores the lead and assigns status/priority.
3. Follow-up generator drafts an email from the classification result.
4. CRM row is created in browser `localStorage` for demo persistence.
5. Weekly digest summarizes local CRM rows and top opportunities.

Production version:

- UI: Next.js App Router dashboard route.
- Server actions: validate intake, call approved AI provider, persist to Supabase.
- Database: `leads`, `lead_classifications`, `follow_up_drafts`, `weekly_digests`.
- Scheduler: weekly cron job creates digest and stores it for review.
- CRM integration: explicit opt-in connector after approval.

## File Structure

Current demo files:

```text
app/dashboard/demo/page.tsx   # Working local demo route
CEO_DEMO.md                   # Architecture, plan, and workflow
```

Recommended production files:

```text
app/dashboard/leads/page.tsx
app/actions/leads.ts
lib/leads/classifier.ts
lib/leads/follow-up.ts
lib/leads/digest.ts
lib/storage/lead-store.ts
supabase/migrations/002_lead_ops.sql
```

## Implementation Plan

Phase 1 demo:

- Build local intake UI.
- Use deterministic classification instead of paid AI.
- Generate follow-up drafts locally.
- Store CRM rows in `localStorage`.
- Generate weekly digest from local rows.

Phase 2 durable app:

- Add Supabase lead tables and RLS policies.
- Move create/read operations into server actions.
- Add validation and duplicate detection.
- Store generated drafts separately from lead records.
- Add digest records with review status.

Phase 3 integrations:

- Add approved AI provider for classification and drafting.
- Add CRM connector only after explicit approval.
- Add scheduled weekly digest after cron approval.
- Add audit log for external sends and data exports.

## Demo Workflow

1. Open `/dashboard/demo`.
2. Fill the intake form or click `Load sample`.
3. Review the live classification score, status, priority, and reasons.
4. Review the generated follow-up draft.
5. Click `Create CRM row`.
6. Confirm the CRM table includes the new row.
7. Confirm the weekly digest updates with total leads, qualified count, nurture count, average score, and top opportunities.

## Safety Notes

- No deploy was performed.
- No money was spent.
- No paid APIs are used.
- No emails, messages, DMs, or posts are sent.
- Demo data stays in the browser through `localStorage`.
