# BuddyGolf

Vite + React 19 + TypeScript + Tailwind v4, with Supabase (Postgres, Auth, Edge Functions) and Netlify hosting. See README.md for setup and the current data model.

## Design

The app is being rebuilt to a new design. Before any UI or data work, read `design/BUILD_SPEC.md`. It is the source of truth for product rules, design tokens, screens, the data model and build phases. The visual reference is `design/mockup/index.html`, with one image per screen in `design/screens/`.

Key rules:
- No payments between golfers in the app. Prices are information only ("pay at the club"). The Plus subscription is the only thing the app charges for.
- Hosting rounds is always free.
- Sample and seed data uses only two golfers: Paul (the signed-in user) and Steve.

## Workflow

- Schema changes go in a new file in `supabase/migrations/`, with row-level security. Regenerate `src/lib/database.types.ts` afterwards.
- Run `npm run build` and `npm run lint` before committing.
