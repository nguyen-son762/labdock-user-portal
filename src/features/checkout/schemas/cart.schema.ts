import { z } from "zod";

const guidSchema = z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, "Invalid identifier.");

const cartVariantSelectionSchema = z.object({
  attributeId: guidSchema,
  attributeCode: z.string().min(1),
  attributeName: z.string().min(1),
  valueId: guidSchema,
  valueCode: z.string().min(1),
  value: z.string().min(1),
});

const cartVariantSchema = z.object({
  id: guidSchema,
  sku: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  currency: z.string().length(3),
  stockQty: z.number().int().nonnegative(),
  displayName: z.string(),
  selections: z.array(cartVariantSelectionSchema),
});

export const cartApiItemSchema = z.object({
  id: guidSchema,
  variantId: guidSchema,
  productId: guidSchema,
  productName: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  currency: z.string().length(3),
  lineTotal: z.number().nonnegative(),
  stockQty: z.number().int().nonnegative(),
  productStatus: z.string().min(1),
  isDeleted: z.boolean(),
  variants: z.array(cartVariantSchema),
});

export const cartResponseSchema = z.object({
  id: guidSchema,
  items: z.array(cartApiItemSchema),
  subtotal: z.number().nonnegative(),
  currency: z.string().length(3),
  updatedAt: z.iso.datetime({ offset: true }),
});

export const cartItemSchema = z.object({
  id: z.string().min(1),
  variantId: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string().min(1),
  sku: z.string().min(1),
  image: z.string().startsWith("/").optional(),
  unitPrice: z.number().nonnegative(),
  originalPrice: z.number().positive().optional(),
  quantity: z.number().int().min(1).max(999_999),
  size: z.string().min(1).optional(),
  currency: z.string().length(3).optional(),
  lineTotal: z.number().nonnegative().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  productStatus: cartApiItemSchema.shape.productStatus.optional(),
  isDeleted: cartApiItemSchema.shape.isDeleted.optional(),
  variants: cartApiItemSchema.shape.variants.optional(),
});

export const cartItemsSchema = z.array(cartItemSchema);

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1),
  variantId: guidSchema.optional(),
  quantity: z.number().int().min(1).max(999_999),
});

export const removeCartItemSchema = z.object({ itemId: z.string().min(1) });
export const addCartItemSchema = z.object({ variantId: guidSchema, quantity: z.number().int().min(1).max(999_999) });

export const cartQuoteInputSchema = z.object({ cartItemIds: z.array(guidSchema).min(1) });

const cartQuoteFeeSchema = z.object({
  name: z.string(),
  type: z.string(),
  value: z.number(),
  amount: z.number().nonnegative(),
});

const cartQuoteLineSchema = z.object({
  cartItemId: guidSchema,
  variantId: guidSchema,
  productName: z.string(),
  sku: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  lineTotal: z.number().nonnegative(),
  additionalFeeTotal: z.number().nonnegative(),
  additionalFees: z.array(cartQuoteFeeSchema),
});

export const cartQuoteSchema = z.object({
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  taxRatePercent: z.number().nonnegative(),
  shippingFee: z.number().nonnegative(),
  isFreeShipping: z.boolean(),
  additionalFeeTotal: z.number().nonnegative(),
  platformFee: z.number().nonnegative(),
  total: z.number().nonnegative(),
  currency: z.string().length(3),
  lines: z.array(cartQuoteLineSchema),
});

export type CartQuoteInput = z.infer<typeof cartQuoteInputSchema>;
export type CartQuote = z.infer<typeof cartQuoteSchema>;
export type CartApiItem = z.infer<typeof cartApiItemSchema>;
export type CartResponse = z.infer<typeof cartResponseSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;
