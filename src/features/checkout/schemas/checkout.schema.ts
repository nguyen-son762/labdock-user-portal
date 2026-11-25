import { z } from "zod";

import { apiImageUrlSchema } from "@/lib/media-url";
import { defaultValidationTranslator, type ValidationTranslator } from "@/i18n/validation";

import { cartApiItemSchema, cartItemsSchema } from "./cart.schema";

export const paymentMethodSchema = z.enum(["bank-transfer"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export function createCheckoutSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z
    .object({
      fullName: z.string().trim().min(2, t("fullNameRequired")),
      email: z.email(t("emailInvalid")),
      phone: z
        .string()
        .trim()
        .regex(/^[+\d][\d\s-]{7,19}$/, t("phoneInvalid")),
      companyName: z
        .string()
        .trim()
        .max(100, t("companyMaxLength", { max: 100 }))
        .optional(),
      address: z.string().trim().min(8, t("deliveryAddressRequired")),
      city: z.string().trim().min(1, t("cityRequired")),
      notes: z.string().trim().optional(),
      postalCode: z.string().trim().optional(),
      country: z.string().min(1, t("countryRequired")),
      billingSameAsDelivery: z.boolean(),
      billingFullName: z.string().trim().optional(),
      billingEmail: z.string().trim().optional(),
      billingPhone: z.string().trim().optional(),
      billingCompanyName: z
        .string()
        .trim()
        .max(100, t("companyMaxLength", { max: 100 }))
        .optional(),
      billingAddress: z.string().trim().optional(),
      billingCity: z.string().trim().optional(),
      billingPostalCode: z.string().trim().optional(),
      billingCountry: z.string().optional(),
      paymentMethod: z.enum(paymentMethodSchema.options, { error: t("paymentMethodRequired") }),
    })
    .superRefine((values, context) => {
      if (values.billingSameAsDelivery) return;
      if ((values.billingFullName ?? "").length < 2) {
        context.addIssue({ code: "custom", path: ["billingFullName"], message: t("fullNameRequired") });
      }
      if (!z.email().safeParse(values.billingEmail ?? "").success) {
        context.addIssue({ code: "custom", path: ["billingEmail"], message: t("emailInvalid") });
      }
      if (!/^[+\d][\d\s-]{7,19}$/.test(values.billingPhone ?? "")) {
        context.addIssue({ code: "custom", path: ["billingPhone"], message: t("phoneInvalid") });
      }
      if (!values.billingCity) {
        context.addIssue({ code: "custom", path: ["billingCity"], message: t("cityRequired") });
      }
      if (!values.billingCountry) {
        context.addIssue({ code: "custom", path: ["billingCountry"], message: t("countryRequired") });
      }
      if (!values.billingSameAsDelivery && (!values.billingAddress || values.billingAddress.length < 8)) {
        context.addIssue({ code: "custom", path: ["billingAddress"], message: t("billingAddressRequired") });
      }
      if (!values.billingSameAsDelivery && !/^\d{6}$/.test(values.billingPostalCode ?? "")) {
        context.addIssue({ code: "custom", path: ["billingPostalCode"], message: t("billingPostalCodeInvalid") });
      }
    });
}

export const checkoutSchema = createCheckoutSchema();

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const createCheckoutInputSchema = z.object({
  checkout: checkoutSchema,
  items: cartItemsSchema.min(1, "Select at least one product."),
});
export type CreateCheckoutInput = z.infer<typeof createCheckoutInputSchema>;

const requestPhoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/, "Enter a valid international phone number.");
const requestCountrySchema = z.string().regex(/^[A-Z]{2}$/);

export const createCheckoutRequestSchema = z.object({
  cartItemIds: z.array(cartApiItemSchema.shape.id).min(1, "Select at least one product."),
  recipientName: z.string().trim().min(2),
  email: z.email(),
  phone: requestPhoneSchema,
  companyName: z.string().trim(),
  addressLine1: z.string().trim().min(8),
  city: z.string().trim().min(1),
  postalCode: z.string().trim(),
  country: requestCountrySchema,
  notes: z.string().trim(),
  sameAsDelivery: z.boolean(),
  billingRecipientName: z.string().trim().min(2),
  billingEmail: z.email(),
  billingPhone: requestPhoneSchema,
  billingCompanyName: z.string().trim(),
  billingAddressLine1: z.string().trim().min(8),
  billingCity: z.string().trim().min(1),
  billingPostalCode: z.string().trim(),
  billingCountry: requestCountrySchema,
});
export type CreateCheckoutRequest = z.infer<typeof createCheckoutRequestSchema>;

export const checkoutSessionSchema = z.object({
  orderId: cartApiItemSchema.shape.id,
  orderNumber: z.string().min(1),
  refCode: z.string().trim().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
  paymentExpiresAt: z.iso.datetime({ offset: true }),
  companyName: z.string().trim(),
  businessRegistrationNo: z.string().trim(),
  qrImageUrl: apiImageUrlSchema,
});
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;

export const paymentOrderIdSchema = cartApiItemSchema.shape.id;
