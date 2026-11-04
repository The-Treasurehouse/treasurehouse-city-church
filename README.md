# Treasurehouse City Church

Public church site plus a staff dashboard (church management system, Phase 1 from
`docs/church_app_features_and_management_system.pdf`). Next.js 16, Tailwind v4, Supabase.

## Run

```bash
cp .env.local.example .env.local   # fill in the three Supabase keys
npm run dev                        # http://localhost:3012
```

## Database

The dashboard uses the church database that already exists in the Supabase project (organizations,
branches, members, attendance, giving, groups, events, announcements, user_roles). Those tables have
row level security on with no policies, so they are only reachable from the server with the service
role key. Every admin page and action checks the signed-in person first (`src/lib/auth.ts`) and then
their role (`src/lib/permissions.ts`). Nothing in this repo changes the database structure.

Signing in: staff sign in with Supabase Auth. The email must match a row in `profiles` that has a staff
role in `user_roles`. To add someone, use Settings (adds the profile and role), then create their login
under Authentication in Supabase with the same email.

Roles: super_admin, pastor, administrator, finance_officer, member (members have no dashboard access).

## Layout

- `src/app/(site)` public pages
- `src/app/(auth)/login` staff sign in
- `src/app/admin` dashboard: overview, members, attendance, giving, groups, events, communication, settings
- `src/lib/permissions.ts` which role sees and changes what

## Not built yet (later phases in the blueprint)

Expenses, follow-up tasks and the contact form inbox (they need new tables), member app, QR check-in,
online giving, sermon library, email/SMS/push delivery, payroll, inventory, AI features.
