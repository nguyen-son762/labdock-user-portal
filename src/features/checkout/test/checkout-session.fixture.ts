import type { CheckoutSession } from "../schemas/checkout.schema";

export const checkoutSessionFixture: CheckoutSession = {
  orderId: "11111111-1111-1111-1111-111111111111",
  orderNumber: "ORD-20260821-00001",
  refCode: "AB12CD34",
  amount: 99.5,
  currency: "SGD",
  paymentExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  companyName: "i-DNA",
  businessRegistrationNo: "202012345A",
  qrImageUrl: "https://cdn.example/qr.png",
};
