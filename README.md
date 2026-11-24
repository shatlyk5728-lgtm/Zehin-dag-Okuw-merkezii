# Zehin dag Okuw Merkezi

React + TypeScript + Vite + Supabase education-center platform starter.

## Setup
1. Install Node.js 20+ and run npm install.
2. Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
3. Run supabase/schema.sql in Supabase SQL Editor.
4. Create a user in Supabase Authentication, then promote the user to admin with the SQL statement at the end of schema.sql.
5. Run npm run dev; verify with npm run build.

## Deploy
Import this repository into Vercel. Set both VITE_ variables in Project Settings and deploy. Build command: npm run build. Output directory: dist.

## Security and status
Never put service_role keys in frontend variables. The frontend currently includes the public multilingual landing page, inquiry form, Supabase email/password login, initial admin navigation and basic list/add flows. The schema defines the core entities and initial RLS. Full edit/delete workflows, teacher/student-specific portals and scoped policies, payment and attendance workflows, audit logs, backups, file storage policies, email delivery and production security testing still need completion. Do not enter real student data until the access model is reviewed and tested.
