alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_user_created_at_idx
  on public.orders(user_id, created_at desc);

update public.orders as orders
set user_id = users.id
from auth.users as users
where orders.user_id is null
  and lower(trim(orders.customer ->> 'email')) = lower(users.email);
