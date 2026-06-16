# MVP Implementation Roadmap

## Phase 1: Local Functional MVP

- Create lead domain types.
- Create deterministic classifier.
- Create deterministic follow-up generator.
- Create weekly digest generator.
- Create in-memory/mock store for development.
- Create dashboard lead workbench.
- Add sidebar navigation.
- Verify with `npm run build`.

## Phase 2: Durable Storage

- Add Supabase schema.
- Add RLS policies.
- Switch store abstraction to Supabase when database access is available.
- Add read/create/update server actions.
- Add migration application and verification after approval.

## Phase 3: Review Workflow

- Add draft review states.
- Add owner assignment.
- Add lead status transitions.
- Add digest history.
- Add audit log entries for material actions.

## Phase 4: Approved Integrations

- Add approved AI provider.
- Add approved Stripe billing.
- Add approved CRM sync.
- Add approved email sending.
- Add approved weekly scheduler.

## Non-Goals For This Pass

- Deployment.
- Paid API usage.
- Sending email or DMs.
- Contacting third parties.
- Running database migrations.
