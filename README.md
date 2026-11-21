# DMK – De_Mayor Kitchen

DMK is a responsive React ordering application with a Supabase database, Paystack payments, and Nodemailer confirmation emails.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and add your Supabase and Paystack credentials. SMTP is optional; confirmation emails are disabled until its settings are filled in.

3. Apply `migrations/001_create_orders.sql`, then `migrations/002_order_accounts.sql` in the Supabase SQL editor.

4. Start the API and web app together (the API loads `.env.local` or `.env`):

```bash
npm run dev
```

Open `http://localhost:5173`.

Use `npm run dev:web` only when the API is already running separately.

## Production configuration

- Keep Supabase service-role, Paystack secret, and SMTP credentials only on the API server.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for browser code.
- Enable Google and email OTP providers in Supabase Auth. Configure the Google OAuth client, set up Supabase Auth SMTP for email codes, and add the app's local and production URLs to Supabase's allowed redirect URLs.
- Set `ADMIN_EMAILS` on the API server to a comma-separated allowlist of administrator email addresses. Create each admin user in Supabase Auth with email and password; admins sign in from the separate Staff admin sign in screen. The allowlist is still enforced by the API before returning orders or accepting status updates.
- The admin operations dashboard summarizes, searches, filters, and updates recent orders. For delivery, staff enter the customer's Order ID in the verification panel; only an existing, payment-confirmed order receives a short-lived verification token, and the API requires it before the order can be marked out for delivery. Orders must be out for delivery before they can be completed.
- Orders are tied to the authenticated Supabase user. The account page lists their order IDs and statuses without requiring manual ID entry. Migration `002_order_accounts.sql` links existing orders to matching Supabase account emails.
- Configure the Paystack webhook URL as `/api/paystack/webhook` on the deployed API domain.
- Set `PAYSTACK_CALLBACK_URL` to the deployed customer app URL.
