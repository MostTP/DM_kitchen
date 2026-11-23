# DMK – De_Mayor Kitchen

DMK is a responsive React ordering application with a Supabase database, Paystack payments, and Nodemailer confirmation emails.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and add your Supabase and Paystack credentials. SMTP is optional; confirmation emails are disabled until its settings are filled in.

3. Apply `migrations/001_create_orders.sql`, then `migrations/002_order_accounts.sql` in the Supabase SQL editor.

4. Start the Next.js frontend and integrated API together:

```bash
npm run dev
```

Open `http://localhost:3000`. API routes are served under `/api/*` by Next.js; a separate Express server is not required.

## Production configuration

- Deploy the repository directly to Vercel as a Next.js app. The frontend and `/api/*` Route Handlers are deployed together; do not deploy `server/index.js` separately.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, `SMTP_*` credentials and `ADMIN_EMAILS` only in Vercel server environment variables.
- Set browser-visible variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel. Never use the Supabase service-role key as a public variable.
- For production Google sign-in, enable the Google provider under Supabase Authentication → Providers and enter the Google OAuth web client ID and secret. In Google Cloud, add the Supabase callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`) as an Authorized redirect URI for that OAuth client. In Supabase Authentication → URL Configuration, set the production app URL as the Site URL and add the exact account callback (for example, `https://your-domain.example/account`) to the Redirect URLs allow-list. The app returns to `/account` after Google sign-in; add the corresponding `/account` URL for each production domain you actually use, including `www` or preview domains if applicable. Configure the Google OAuth consent screen and publish it or add the sign-in accounts as test users while it is in testing mode.
- Set up Supabase Auth SMTP for email codes, and add local development URLs to Supabase's allowed redirect URLs.
- Set `ADMIN_EMAILS` on the API server to a comma-separated allowlist of administrator email addresses. Create each admin user in Supabase Auth with email and password; admins sign in from the separate Staff admin sign in screen. The allowlist is still enforced by the API before returning orders or accepting status updates.
- The admin operations dashboard summarizes, searches, filters, and updates recent orders. For delivery, staff enter the customer's Order ID in the verification panel; only an existing, payment-confirmed order receives a short-lived verification token, and the API requires it before the order can be marked out for delivery. Orders must be out for delivery before they can be completed.
- Orders are tied to the authenticated Supabase user. The account page lists their order IDs and statuses without requiring manual ID entry. Migration `002_order_accounts.sql` links existing orders to matching Supabase account emails.
- Configure the Paystack webhook URL as `https://your-domain.example/api/paystack/webhook` on the deployed Next.js domain. It runs in the same deployment as the frontend.
- Set `PAYSTACK_CALLBACK_URL` to the deployed customer app success URL, such as `https://your-domain.example/success`.
