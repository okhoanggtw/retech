export type Condition = "LIKE_NEW" | "EXCELLENT" | "GOOD" | "FAIR" | "WORN";

export const CONDITIONS: { value: Condition; label: string; percent: number }[] = [
  { value: "LIKE_NEW", label: "Như mới 99%", percent: 99 },
  { value: "EXCELLENT", label: "Đẹp 95-98%", percent: 96 },
  { value: "GOOD", label: "Tốt 90-94%", percent: 92 },
  { value: "FAIR", label: "Khá 80-89%", percent: 85 },
  { value: "WORN", label: "Trầy xước nhiều <80%", percent: 75 },
];
export const conditionOf = (c?: Condition) => CONDITIONS.find((x) => x.value === c);

export interface AiFactor { name: string; impact: string; note: string }
export interface AiPrice {
  suggestedPrice: number; minPrice: number; maxPrice: number;
  buyPriceLow: number; buyPriceHigh: number; confidence: number;
  explanation: string; factors: AiFactor[]; source: "GEMINI" | "FORMULA"; createdAt?: string;
}

export interface Product {
  id: string; name: string; slug: string; category: string; brand: string;
  model?: string; variant?: string; condition: Condition; batteryHealth?: number;
  price: number; originalPrice: number; stock: number; warrantyMonths: number;
  images: string[]; specs: Record<string, string>; highlights: string[];
  description?: string; tags: string[]; releaseYear: number; featured: boolean;
  active: boolean; freeShipping?: boolean; soldCount: number; viewCount: number; aiSuggestion?: AiPrice;
  createdAt?: string;
}

export interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }
export interface Category { id: string; name: string; slug: string; icon: string; description: string; sortOrder: number; yearlyRetention: number }
export interface BrandInfo { name: string; slug: string; productCount: number }

export interface User {
  id: string; fullName: string; email: string; phone?: string; address?: string;
  avatar?: string; role: "USER" | "ADMIN"; enabled: boolean; createdAt?: string;
}

export interface CartLine { product: Product; quantity: number; lineTotal: number; available: boolean }
export interface CartView { items: CartLine[]; totalQuantity: number; subtotal: number }

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "CANCELLED" | "REFUNDED";
export interface OrderItem { productId: string; name: string; slug: string; image?: string; category: string; brand: string; condition?: string; price: number; quantity: number }
export interface Order {
  id: string; orderCode: number; userId: string; items: OrderItem[];
  subtotal: number; discount: number; shippingFee: number; total: number; promotionCode?: string;
  shipping: { fullName: string; phone: string; email?: string; address: string; note?: string };
  paymentMethod: "COD" | "PAYOS"; paymentStatus: PaymentStatus; status: OrderStatus;
  checkoutUrl?: string; qrCode?: string; paymentReference?: string; paidAt?: string;
  history: { status: string; note?: string; at: string }[]; createdAt: string;
}
export interface Quote { subtotal: number; discount: number; shippingFee: number; total: number; promotionCode?: string; promotionMessage?: string }

export interface Banner { id?: string; title: string; subtitle?: string; image?: string; ctaText?: string; link?: string; theme?: string; sortOrder: number; active: boolean }
export interface MenuItem { id?: string; label: string; href: string; position: "HEADER" | "FOOTER"; groupName?: string; sortOrder: number; active: boolean }
export interface Faq { id?: string; question: string; answer: string; topic?: string; sortOrder: number }
export interface Promotion {
  id?: string; code: string; name: string; description?: string; type: "PERCENT" | "FIXED";
  value: number; maxDiscount: number; minOrderValue: number; startAt?: string; endAt?: string;
  usageLimit: number; usedCount: number; active: boolean;
}
export interface SiteSettings {
  id?: string; storeName: string; slogan?: string; hotline?: string; email?: string; address?: string;
  workingHours?: string; mapEmbedUrl?: string; freeShipThreshold: number; shippingFee: number;
  socials: Record<string, string>;
}
export interface TradeIn {
  id: string; category: string; brand: string; model: string; storage?: string; purchaseYear?: number;
  condition: Condition; batteryHealth?: number; issues: string[]; accessories: string[];
  contactName: string; contactPhone: string; contactEmail?: string; aiEstimate?: AiPrice;
  offerPrice?: number; status: "NEW" | "CONTACTED" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  adminNote?: string; createdAt: string; note?: string;
}
export interface ContactMessage { id: string; fullName: string; email: string; phone?: string; subject?: string; message: string; handled: boolean; createdAt: string }

export interface ChatMsg { role: "user" | "model"; content: string; products?: Product[]; suggestions?: string[] }
