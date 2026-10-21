-- =====================================================================
-- Serat Cerita — skema database Supabase
-- Cara pakai: buka Supabase → SQL Editor → New query → tempel seluruh
-- isi file ini → Run. Aman dijalankan ulang.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- Pengaturan toko (isi website, warna, ongkir, dll). Satu baris saja.
-- ---------------------------------------------------------------------
create table if not exists public.store_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict do nothing;

-- Pengaturan rahasia (hanya admin & server).
create table if not exists public.private_settings (
  id smallint primary key default 1 check (id = 1),
  telegram_chat_id text,
  updated_at timestamptz not null default now()
);
insert into public.private_settings (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------
-- Katalog
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories (id) on delete set null,
  description text not null default '',
  details text[] not null default '{}',
  price integer not null default 0 check (price >= 0),
  cost integer not null default 0 check (cost >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'active'
    check (status in ('active', 'coming_soon', 'hidden')),
  featured boolean not null default false,
  images text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);

-- ---------------------------------------------------------------------
-- Pesanan
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text not null,
  note text,
  shipping_name text not null,
  shipping_cost integer not null default 0 check (shipping_cost >= 0),
  subtotal integer not null check (subtotal >= 0),
  total integer not null check (total >= 0),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'processing', 'shipped',
                      'completed', 'cancelled', 'expired')),
  payment_method text,
  payment_url text,
  tracking_number text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  price integer not null,
  cost integer not null default 0,
  quantity integer not null check (quantity > 0)
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- Pembaruan untuk database yang sudah ada (aman dijalankan ulang).
alter table public.orders add column if not exists refunded_total integer not null default 0;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending_payment', 'paid', 'processing', 'shipped',
                    'completed', 'cancelled', 'expired', 'refunded'));

-- ---------------------------------------------------------------------
-- Pengembalian dana (refund)
-- ---------------------------------------------------------------------
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  amount integer not null check (amount > 0),
  method text not null default '',
  note text not null default '',
  restocked boolean not null default false,
  cogs_reversed integer not null default 0,
  created_by text not null default '',
  refunded_at timestamptz not null default now()
);
create index if not exists refunds_order_idx on public.refunds (order_id);
create index if not exists refunds_refunded_at_idx on public.refunds (refunded_at desc);

-- Permintaan pembatalan/refund dari pembeli (ditinjau admin).
create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  reason text not null,
  refund_account text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists refund_requests_order_idx on public.refund_requests (order_id);
-- Satu permintaan aktif per pesanan.
create unique index if not exists refund_requests_one_pending
  on public.refund_requests (order_id) where status = 'pending';

-- ---------------------------------------------------------------------
-- Pengeluaran (untuk laporan keuangan)
-- ---------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  spent_on date not null default current_date,
  category text not null default 'Lainnya',
  description text not null default '',
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index if not exists expenses_spent_on_idx on public.expenses (spent_on desc);

-- ---------------------------------------------------------------------
-- Fungsi: buat pesanan (harga & stok dicek di database, bukan di browser)
-- items: [{"product_id": "...", "quantity": 2}, ...]
-- ---------------------------------------------------------------------
create or replace function public.place_order(
  p_code text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_address text,
  p_note text,
  p_shipping_name text,
  p_shipping_cost integer,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_qty integer;
  v_subtotal integer := 0;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong';
  end if;

  insert into public.orders (code, customer_name, customer_phone, customer_email,
                             address, note, shipping_name, shipping_cost,
                             subtotal, total)
  values (p_code, p_customer_name, p_customer_phone, nullif(p_customer_email, ''),
          p_address, nullif(p_note, ''), p_shipping_name, p_shipping_cost, 0, 0)
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty < 1 then
      raise exception 'Jumlah tidak valid';
    end if;

    select * into v_product from public.products
      where id = (v_item ->> 'product_id')::uuid
      for update;

    if not found or v_product.status <> 'active' then
      raise exception 'Produk tidak tersedia';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Stok % tidak mencukupi (tersisa %)', v_product.name, v_product.stock;
    end if;

    update public.products set stock = stock - v_qty, updated_at = now()
      where id = v_product.id;

    insert into public.order_items (order_id, product_id, product_name, price, cost, quantity)
    values (v_order.id, v_product.id, v_product.name, v_product.price, v_product.cost, v_qty);

    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  update public.orders
    set subtotal = v_subtotal, total = v_subtotal + p_shipping_cost
    where id = v_order.id
    returning * into v_order;

  return v_order;
end;
$$;

-- ---------------------------------------------------------------------
-- Fungsi: ubah status pesanan. Stok dikembalikan bila dibatalkan/kedaluwarsa.
-- ---------------------------------------------------------------------
create or replace function public.set_order_status(
  p_order_id uuid,
  p_status text,
  p_payment_method text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_was_released boolean;
  v_now_released boolean;
begin
  -- Hanya admin (lewat login) atau server (service role) yang boleh.
  -- (current_user tidak bisa dipakai: di fungsi security definer nilainya selalu pemilik fungsi.)
  if not (public.is_admin() or coalesce(auth.role(), '') = 'service_role') then
    raise exception 'Tidak diizinkan';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Pesanan tidak ditemukan';
  end if;
  if v_order.status = 'refunded' then
    raise exception 'Dana pesanan ini sudah dikembalikan; statusnya tidak bisa diubah lagi';
  end if;

  v_was_released := v_order.status in ('cancelled', 'expired');
  v_now_released := p_status in ('cancelled', 'expired');

  if not v_was_released and v_now_released then
    update public.products p set stock = p.stock + i.quantity, updated_at = now()
      from public.order_items i
      where i.order_id = p_order_id and i.product_id = p.id;
  elsif v_was_released and not v_now_released then
    -- Pesanan dihidupkan lagi: ambil stok kembali (boleh habis, tidak minus).
    update public.products p set stock = greatest(p.stock - i.quantity, 0), updated_at = now()
      from public.order_items i
      where i.order_id = p_order_id and i.product_id = p.id;
  end if;

  update public.orders
    set status = p_status,
        payment_method = coalesce(p_payment_method, payment_method),
        paid_at = case
          when p_status in ('paid', 'processing', 'shipped', 'completed')
            then coalesce(paid_at, now())
          when p_status = 'pending_payment' then null
          else paid_at
        end,
        updated_at = now()
    where id = p_order_id
    returning * into v_order;

  return v_order;
end;
$$;

-- ---------------------------------------------------------------------
-- Fungsi: terapkan status pembayaran dari Midtrans secara atomik.
-- Mengembalikan true bila status benar-benar berubah (agar notifikasi
-- tidak terkirim dua kali).
-- ---------------------------------------------------------------------
create or replace function public.apply_payment_status(
  p_order_id uuid,
  p_status text,
  p_payment_method text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
begin
  select status into v_current from public.orders where id = p_order_id for update;
  if not found or v_current = p_status then
    return false;
  end if;

  if p_status = 'paid' then
    if v_current not in ('pending_payment', 'cancelled', 'expired') then
      return false;
    end if;
  elsif p_status in ('cancelled', 'expired') then
    if v_current <> 'pending_payment' then
      return false;
    end if;
  else
    return false;
  end if;

  perform public.set_order_status(p_order_id, p_status, p_payment_method);
  return true;
end;
$$;

-- ---------------------------------------------------------------------
-- Fungsi: catat pengembalian dana (penuh atau sebagian). Hanya admin.
-- Refund penuh mengubah status menjadi 'refunded' dan (opsional)
-- mengembalikan stok barang.
-- ---------------------------------------------------------------------
create or replace function public.record_refund(
  p_order_id uuid,
  p_amount integer,
  p_method text,
  p_note text,
  p_restock boolean,
  p_created_by text
)
returns public.refunds
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_refund public.refunds;
  v_remaining integer;
  v_full boolean;
  v_cogs integer := 0;
begin
  if not (public.is_admin() or coalesce(auth.role(), '') = 'service_role') then
    raise exception 'Tidak diizinkan';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Pesanan tidak ditemukan';
  end if;
  if v_order.status not in ('paid', 'processing', 'shipped', 'completed') then
    raise exception 'Hanya pesanan yang sudah dibayar yang bisa direfund';
  end if;

  v_remaining := v_order.total - v_order.refunded_total;
  if p_amount is null or p_amount < 1 then
    raise exception 'Jumlah refund tidak valid';
  end if;
  if p_amount > v_remaining then
    raise exception 'Jumlah refund melebihi sisa yang bisa dikembalikan (Rp %)', v_remaining;
  end if;

  v_full := p_amount = v_remaining;

  if v_full and p_restock then
    select coalesce(sum(cost * quantity), 0) into v_cogs
      from public.order_items where order_id = p_order_id;
    update public.products p set stock = p.stock + i.quantity, updated_at = now()
      from public.order_items i
      where i.order_id = p_order_id and i.product_id = p.id;
  end if;

  update public.orders
    set refunded_total = refunded_total + p_amount,
        status = case when v_full then 'refunded' else status end,
        updated_at = now()
    where id = p_order_id;

  insert into public.refunds (order_id, amount, method, note, restocked, cogs_reversed, created_by)
  values (p_order_id, p_amount, coalesce(p_method, ''), coalesce(p_note, ''),
          v_full and coalesce(p_restock, false), v_cogs, coalesce(p_created_by, ''))
  returning * into v_refund;

  return v_refund;
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, text, text, integer, jsonb) from public, anon, authenticated;
grant execute on function public.place_order(text, text, text, text, text, text, text, integer, jsonb) to service_role;
revoke all on function public.set_order_status(uuid, text, text) from public, anon;
grant execute on function public.set_order_status(uuid, text, text) to authenticated, service_role;
revoke all on function public.apply_payment_status(uuid, text, text) from public, anon, authenticated;
grant execute on function public.apply_payment_status(uuid, text, text) to service_role;
revoke all on function public.record_refund(uuid, integer, text, text, boolean, text) from public, anon;
grant execute on function public.record_refund(uuid, integer, text, text, boolean, text) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- Keamanan baris (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.store_settings enable row level security;
alter table public.private_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.expenses enable row level security;
alter table public.refunds enable row level security;
alter table public.refund_requests enable row level security;

drop policy if exists "admins: admin baca" on public.admins;
create policy "admins: admin baca" on public.admins
  for select to authenticated using (public.is_admin());

drop policy if exists "settings: publik baca" on public.store_settings;
create policy "settings: publik baca" on public.store_settings
  for select to anon, authenticated using (true);
drop policy if exists "settings: admin ubah" on public.store_settings;
create policy "settings: admin ubah" on public.store_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "private: admin" on public.private_settings;
create policy "private: admin" on public.private_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories: publik baca" on public.categories;
create policy "categories: publik baca" on public.categories
  for select to anon, authenticated using (true);
drop policy if exists "categories: admin kelola" on public.categories;
create policy "categories: admin kelola" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products: publik baca" on public.products;
create policy "products: publik baca" on public.products
  for select to anon, authenticated using (status <> 'hidden' or public.is_admin());
drop policy if exists "products: admin kelola" on public.products;
create policy "products: admin kelola" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders: admin" on public.orders;
create policy "orders: admin" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items: admin" on public.order_items;
create policy "order_items: admin" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "refunds: admin baca" on public.refunds;
create policy "refunds: admin baca" on public.refunds
  for select to authenticated using (public.is_admin());

drop policy if exists "refund_requests: admin" on public.refund_requests;
create policy "refund_requests: admin" on public.refund_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "expenses: admin" on public.expenses;
create policy "expenses: admin" on public.expenses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Pengunjung tidak boleh melihat harga modal (kolom cost).
revoke select on public.products from anon;
grant select (id, name, slug, category_id, description, details, price, stock,
              status, featured, images, sort_order, created_at, updated_at)
  on public.products to anon;

-- ---------------------------------------------------------------------
-- Penyimpanan foto (Supabase Storage)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "images: admin unggah" on storage.objects;
create policy "images: admin unggah" on storage.objects
  for insert to authenticated with check (bucket_id = 'images' and public.is_admin());
drop policy if exists "images: admin ubah" on storage.objects;
create policy "images: admin ubah" on storage.objects
  for update to authenticated using (bucket_id = 'images' and public.is_admin());
drop policy if exists "images: admin hapus" on storage.objects;
create policy "images: admin hapus" on storage.objects
  for delete to authenticated using (bucket_id = 'images' and public.is_admin());

-- ---------------------------------------------------------------------
-- Data awal (hanya bila katalog masih kosong)
-- ---------------------------------------------------------------------
do $$
declare
  v_keychain uuid;
  v_amigurumi uuid;
  v_accessories uuid;
begin
  if not exists (select 1 from public.categories) then
    insert into public.categories (name, slug, sort_order) values ('Keychain', 'keychain', 1)
      returning id into v_keychain;
    insert into public.categories (name, slug, sort_order) values ('Amigurumi', 'amigurumi', 2)
      returning id into v_amigurumi;
    insert into public.categories (name, slug, sort_order) values ('Accessories', 'accessories', 3)
      returning id into v_accessories;

    insert into public.products (name, slug, category_id, description, details, price, stock, status, featured, sort_order)
    values
      ('Amigurumi Keychain', 'amigurumi-keychain', v_keychain,
       'Gantungan kunci amigurumi mungil yang dirajut tangan satu per satu.',
       array['Dirajut tangan', 'Dilengkapi ring gantungan kunci'], 85000, 10, 'active', true, 1),
      ('Little Bear', 'little-bear', v_amigurumi,
       'Boneka beruang kecil yang lembut untuk dipeluk maupun dipajang.',
       array['Dirajut tangan'], 0, 0, 'coming_soon', true, 2),
      ('Crochet Flower', 'crochet-flower', v_accessories,
       'Bunga rajut yang tidak pernah layu.',
       array['Dirajut tangan'], 0, 0, 'coming_soon', true, 3);
  end if;
end;
$$;
