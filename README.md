# StudyBank

Past questions and course materials for Nigerian university students. Next.js + Supabase + Paystack.

## Run locally
    npm install
    copy .env.example to .env.local and add your Supabase publishable key
    npm run dev        # http://localhost:3000

## Supabase setup (SQL Editor, in this order)
1. supabase/schema.sql
2. supabase/payments.sql
3. supabase/browse.sql
4. supabase/moderator.sql

## Paystack (Edge Functions)
See supabase/functions/. Deploy both, set PAYSTACK_SECRET_KEY and SITE_URL as secrets.

## Deploy
Import this repo in Vercel. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY under Environment Variables.
