export type ProductStatus = "active" | "coming_soon" | "hidden";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  description: string;
  details: string[];
  price: number;
  /** Harga modal — hanya terisi untuk admin. */
  cost?: number;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  images: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "expired"
  | "refunded";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  cost: number;
  quantity: number;
};

export type Order = {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  note: string | null;
  shipping_name: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_url: string | null;
  tracking_number: string | null;
  /** Jumlah dana yang sudah dikembalikan ke pembeli. */
  refunded_total: number;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type Refund = {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  note: string;
  restocked: boolean;
  cogs_reversed: number;
  created_by: string;
  refunded_at: string;
};

export type RefundRequest = {
  id: string;
  order_id: string;
  reason: string;
  refund_account: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string;
  created_at: string;
  resolved_at: string | null;
};

export type Expense = {
  id: string;
  spent_on: string;
  category: string;
  description: string;
  amount: number;
  created_at: string;
};
