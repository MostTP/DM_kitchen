create table if not exists public.orders (
  order_id text primary key,
  customer jsonb not null,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  total integer not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  paystack_reference text,
  paid_at timestamptz,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists orders_paystack_reference_idx
  on public.orders(paystack_reference)
  where paystack_reference is not null;

alter table public.orders enable row level security;
