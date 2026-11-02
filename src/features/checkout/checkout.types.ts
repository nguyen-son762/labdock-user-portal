import type { CartItem } from "./schemas/cart.schema";

export type CheckoutItem = CartItem;

export type OrderTotals = {
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
};

export type { CheckoutSession } from "./schemas/checkout.schema";
