// store/ticket/ticket.types.ts
export interface PriceCalculationRequest {
  userId: number;
  eventId: number;
  email: string;
  ticketQuantities: Record<number, number>; // Map<Long, Integer> no Java
}

export interface PriceCalculationResponse {
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon?: CouponInfo;
  items: PriceItem[];
}

export interface PriceItem {
  ticketId: number;
  ticketName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface CouponInfo {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
}

export interface CreateSaleRequest {
  ticketId: number;
  quantity: number;
  couponCode?: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  paymentMethod: string;
  userId: number;
  expectedTotalAmount?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface SaleResponse {
  id: number;
  transactionId: string;
  eventId: number;
  eventName: string;
  ticketId: number;
  ticketName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  commissionAmount: number;
  organizerPayout: number;
  buyerEmail: string;
  buyerName: string;
  saleStatus: SaleStatus;
  createdAt: string;
  appliedStrategies?: any[];
  totalDiscountFromStrategies?: number;
}

export type SaleStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';

export interface MpesaPaymentRequest {
  transactionId: string;
  phoneNumber: string;
  amount: number;
}

export interface MpesaPaymentResponse {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}
