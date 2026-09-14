export interface TechnicalSheet {
  dimensions?: string;
  lights?: string;
  voltage?: string;
  material?: string;
  weight?: string;
  models?: string;
  packaging?: string;
  cartonQty?: number;
  cartons?: number;
  totalPieces?: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  technicalSheet: TechnicalSheet;
  priceUnit: number;
  priceBox?: number;
  boxQuantity?: number;
  stock: number;
  image: string;
  nightImage?: string;
  isFeatured?: boolean;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  buyMode: 'unit' | 'box'; // 'unit' is individual piece, 'box' is wholesale box
}

export type PaymentMethod = 'yape' | 'plin' | 'transfer' | 'card' | 'cash';
export type DeliveryType = 'delivery' | 'pickup';

export interface OrderCheckoutData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
  appliedPromoCode?: string;
  discountAmount?: number;
}

export interface StoreSettings {
  storeName: string;
  whatsappPhone: string;
  contactDisplayPhone: string;
  currencySymbol: string;
  deliveryCost: number;
  freeDeliveryThreshold: number;
  storeAddress: string;
  adminPin: string;
  yapeNumber: string;
  yapeName: string;
  plinNumber: string;
  bcpAccount: string;
  bcpCci: string;
  bbvaAccount: string;

  // Customizable WhatsApp message template & seasonal promotions
  whatsappGreeting?: string;
  promoCode?: string;
  promoDiscountPercent?: number;
  promoMessage?: string;
  promoActive?: boolean;
  whatsappClosingNotes?: string;
  whatsappTemplate?: string;
}
