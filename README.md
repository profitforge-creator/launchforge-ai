# LaunchForge AI

Turn your skills into a business in minutes. LaunchForge AI generates a researched business opportunity — competitor analysis, product concept, and marketing strategy — based on your background.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Supabase-ready architecture (mock UI complete)
- **Payments**: Stripe-ready architecture (mock UI complete)
- **Deployment**: Vercel

## Folder Structure

```
launchforge-ai/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx              # Dashboard + generation form
│       ├── history/page.tsx
│       ├── account/page.tsx
│       └── results/[id]/page.tsx
├── components/
│   ├── ui/                       # button, input, select, card, badge, score-ring, skeleton
│   ├── features/
│   │   └── generation-form.tsx
│   └── layout/
│       ├── site-nav.tsx
│       └── dashboard-nav.tsx
├── lib/
│   ├── utils.ts
│   └── mock-data.ts
└── types/
    └── index.ts
```

## Setup

```bash
cd launchforge-ai
npm install
npm run dev        # http://localhost:3000
```

## Build & Deploy

```bash
npm run build      # production build
npm start          # run production server locally

vercel             # deploy preview
vercel --prod      # deploy production
```

## GitHub

```bash
git init
git add .
git commit -m "feat: LaunchForge AI v1"
git remote add origin https://github.com/YOUR_USERNAME/launchforge-ai.git
git push -u origin main
```

## Environment Variables (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

## AI Integration Points

Search `AI INTEGRATION POINT` in the codebase for all integration locations:

- `components/features/generation-form.tsx` — Replace mock delay with real API call
- `app/dashboard/results/[id]/page.tsx` — Fetch result by ID from database
- `app/login/page.tsx` — Supabase `signInWithPassword` + Google OAuth
- `app/signup/page.tsx` — Supabase `signUp`
- `app/dashboard/account/page.tsx` — Stripe Customer Portal
