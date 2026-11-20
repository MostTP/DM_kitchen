# DMK – De_Mayor Kitchen

DMK is a responsive React ordering application with a Supabase database, Paystack payments, and Nodemailer confirmation emails.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and add your Supabase, Paystack, and SMTP credentials.

3. Apply `migrations/001_create_orders.sql` in the Supabase SQL editor.

4. Start the API:

```bash
npm run server
```

5. Start the React app in a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Production configuration

- Keep Supabase service-role, Paystack secret, and SMTP credentials only on the API server.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for browser code.
- Configure the Paystack webhook URL as `/api/paystack/webhook` on the deployed API domain.
- Set `PAYSTACK_CALLBACK_URL` to the deployed customer app URL.
