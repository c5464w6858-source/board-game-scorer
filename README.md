# BuddyGolf

Vite + React + TypeScript + Tailwind v4, with Supabase (Postgres + Auth) and Netlify hosting.

## Local development

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + publishable key
npm run dev
```

`supabase/migrations/` mirrors what's applied to the live project.
