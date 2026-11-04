import { z } from "zod";

import { cartApiItemSchema, cartItemsSchema } from "./cart.schema";

export const paymentMethodSchema = z.enum(["bank-transfer"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s-]{7,19}$/, "Enter a valid phone number."),
    companyName: z.string().trim().max(100).optional(),
    address: z.string().trim().min(8, "Enter a complete delivery address."),
    city: z.string().trim().min(1, "Enter a city."),
    notes: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    country: z.string().min(1, "Select a country."),
    billingSameAsDelivery: z.boolean(),
    billingAddress: z.string().trim().optional(),
    billingPostalCode: z.string().trim().optional(),
    paymentMethod: paymentMethodSchema,
  })
  .superRefine((values, context) => {
    if (!values.billingSameAsDelivery && (!values.billingAddress || values.billingAddress.length < 8)) {
      context.addIssue({ code: "custom", path: ["billingAddress"], message: "Enter a complete billing address." });
    }
    if (!values.billingSameAsDelivery && !/^\d{6}$/.test(values.billingPostalCode ?? "")) {
      context.addIssue({ code: "custom", path: ["billingPostalCode"], message: "Postal code must contain 6 digits." });
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const createCheckoutInputSchema = z.object({
  checkout: checkoutSchema,
  items: cartItemsSchema.min(1, "Select at least one product."),
});
export type CreateCheckoutInput = z.infer<typeof createCheckoutInputSchema>;

export const createCheckoutRequestSchema = z.object({
  cartItemIds: z.array(cartApiItemSchema.shape.id).min(1, "Select at least one product."),
  recipientName: z.string().trim().min(2),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, "Enter a valid international phone number."),
  addressLine1: z.string().trim().min(8),
  city: z.string().trim().min(1),
  country: z.string().regex(/^[A-Z]{2}$/),
  notes: z.string().trim(),
});

export const checkoutSessionSchema = z.object({
  orderId: cartApiItemSchema.shape.id,
  orderNumber: z.string().min(1),
  refCode: z.string().trim().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
  paymentExpiresAt: z.iso.datetime({ offset: true }),
  companyName: z.string().trim(),
  businessRegistrationNo: z.string().trim(),
  qrImageUrl: z.union([z.literal(""), z.url({ protocol: /^https?$/ })]),
});
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;

export const paymentOrderIdSchema = cartApiItemSchema.shape.id;
