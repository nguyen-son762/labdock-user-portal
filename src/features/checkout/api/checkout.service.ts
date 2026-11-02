import { resolveCountryCode } from "@/constants/country-options";
import { httpClient } from "@/lib/http-client";

import type { CheckoutSession } from "../checkout.types";
import {
  checkoutSessionSchema,
  createCheckoutInputSchema,
  createCheckoutRequestSchema,
  type CreateCheckoutInput,
} from "../schemas/checkout.schema";

export const checkoutService = {
  async create(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const { checkout, items } = createCheckoutInputSchema.parse(input);
    const body = createCheckoutRequestSchema.parse({
      cartItemIds: items.map(({ id }) => id),
      recipientName: checkout.fullName,
      phone: checkout.phone.replace(/[\s-]/g, ""),
      addressLine1: checkout.address,
      city: checkout.city,
      country: resolveCountryCode(checkout.country) ?? checkout.country,
      notes: checkout.notes ?? "",
    });
    const response = await httpClient.post<unknown>("/checkout/sessions", body);
    return checkoutSessionSchema.parse(response.data);
  },
};
