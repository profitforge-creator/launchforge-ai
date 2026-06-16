# LaunchForge Lead Ops MVP Architecture

## Scope

The MVP turns a captured lead into a reviewed sales workflow:

1. Lead intake
2. Lead classification
3. Follow-up draft generation
4. CRM row creation
5. Weekly digest

The MVP does not deploy, send communications, charge money, or call paid services without approval.

## Runtime Architecture

```text
Dashboard UI
  -> Server actions
    -> Lead validation
    -> Local/mock AI classifier and draft generator
    -> Lead store abstraction
      -> Supabase tables when configured
      -> Local demo state fallback for UI-only demo
    -> Digest generator
```

## Boundaries

- Intake creates internal records only.
- Classification and draft generation are deterministic until a paid AI provider is explicitly approved.
- Follow-up drafts are never sent automatically.
- Stripe remains plan-only until explicit approval for real credentials and products.
- Weekly digest is generated on demand for MVP; scheduled jobs require separate approval.

## File Structure

Current implementation target:

```text
app/dashboard/leads/page.tsx
app/actions/leads.ts
components/leads/lead-workbench.tsx
lib/leads/types.ts
lib/leads/classifier.ts
lib/leads/follow-up.ts
lib/leads/digest.ts
lib/leads/mock-store.ts
supabase/migrations/002_lead_ops_mvp.sql
docs/MVP_ARCHITECTURE.md
docs/STRIPE_INTEGRATION_PLAN.md
docs/MVP_ROADMAP.md
```

Existing demo route:

```text
app/dashboard/demo/page.tsx
CEO_DEMO.md
```

## Data Flow

1. User submits lead intake form.
2. Server action validates required fields.
3. Classifier assigns score, status, priority, and reason list.
4. Draft generator creates a follow-up email body.
5. Store creates a CRM row.
6. Dashboard fetches rows and renders table.
7. Digest generator summarizes rows for weekly review.

## Security

- All mutations must require the authenticated user.
- RLS policies must restrict access to the owning `user_id`.
- Secrets must remain in environment variables and must not be logged.
- No email, CRM sync, payment action, or third-party contact happens without explicit approval.
