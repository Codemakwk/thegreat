// ─── User ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  emailVerified: boolean;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Product ──────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  featured: boolean;
  active: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  _count?: { products: number };
}

// ─── Cart ─────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ─── Order ────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  product: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discountAmount: number;
  couponCode?: string;
  stripePaymentIntentId?: string;
  notes?: string;
  items: OrderItem[];
  shippingAddress?: Address;
  payment?: Payment;
  user?: { firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  refundedAmount?: number;
  refundedAt?: string;
}

// ─── Review ───────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

// ─── Address ──────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// ─── Coupon ───────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxUses?: number;
  usedCount: number;
  minOrderAmount?: number;
  active: boolean;
  expiresAt?: string;
}

// ─── API Response ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | Pagination;
    pagination: Pagination;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────

export interface DashboardStats {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    monthlyRevenue: number;
    weeklyRevenue: number;
  };
  revenueChart: { date: string; revenue: number }[];
  recentOrders: Order[];
  topProducts: { product: Product; totalSold: number }[];
}
