# Stripe Integration Plan

## Objective

Use Stripe only when approved to connect payments to qualified lead opportunities and future LaunchForge packages.

## MVP Status

Stripe is not used by the MVP implementation. No products, prices, checkout sessions, subscriptions, or customer records are created by this work.

## Future Integration Points

1. Product catalog
   - Define approved service packages in Stripe.
   - Store Stripe product and price IDs in internal configuration.

2. Checkout
   - Create checkout sessions only after user action.
   - Never charge or subscribe a customer automatically.
   - Persist checkout session IDs for auditability.

3. Customer mapping
   - Link internal lead/customer records to Stripe customer IDs.
   - Keep Stripe IDs internal.

4. Webhooks
   - Verify signatures.
   - Store payment lifecycle events.
   - Update internal lead/customer status after confirmed events.

5. Customer portal
   - Provide portal links only to authenticated owners.

## Required Approvals Before Implementation

- Approval to use Stripe credentials.
- Approval to create products or prices.
- Approval to create checkout sessions.
- Approval before any paid transaction or subscription flow.

## Suggested Files

```text
app/actions/billing.ts
app/api/stripe/webhook/route.ts
lib/billing/stripe.ts
lib/billing/types.ts
supabase/migrations/003_billing.sql
```

## Safety Requirements

- Do not spend money.
- Do not create paid subscriptions without explicit approval.
- Do not expose Stripe secret keys.
- Do not contact customers or third parties.
