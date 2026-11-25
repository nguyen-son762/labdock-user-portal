import { CanceledError } from "axios";

import { resolveCountryCode } from "@/constants/country-options";
import { authTokenStore } from "@/lib/auth-token-store";
import { httpClient } from "@/lib/http-client";

import type { CheckoutSession } from "../checkout.types";
import {
  checkoutSessionSchema,
  createCheckoutInputSchema,
  createCheckoutRequestSchema,
  type CreateCheckoutInput,
} from "../schemas/checkout.schema";

const normalizePhone = (phone: string) => phone.replace(/[\s-]/g, "");
const normalizeCountry = (country: string) => resolveCountryCode(country) ?? country;

export const checkoutService = {
  async create(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const sessionVersion = authTokenStore.getSessionVersion();
    const { checkout, items } = createCheckoutInputSchema.parse(input);
    const phone = normalizePhone(checkout.phone);
    const country = normalizeCountry(checkout.country);
    const companyName = checkout.companyName ?? "";
    const postalCode = checkout.postalCode ?? "";
    const sameAsDelivery = checkout.billingSameAsDelivery;
    const billing = sameAsDelivery
      ? {
          billingRecipientName: checkout.fullName,
          billingEmail: checkout.email,
          billingPhone: phone,
          billingCompanyName: companyName,
          billingAddressLine1: checkout.address,
          billingCity: checkout.city,
          billingPostalCode: postalCode,
          billingCountry: country,
        }
      : {
          billingRecipientName: checkout.billingFullName ?? "",
          billingEmail: checkout.billingEmail ?? "",
          billingPhone: normalizePhone(checkout.billingPhone ?? ""),
          billingCompanyName: checkout.billingCompanyName ?? "",
          billingAddressLine1: checkout.billingAddress ?? "",
          billingCity: checkout.billingCity ?? "",
          billingPostalCode: checkout.billingPostalCode ?? "",
          billingCountry: normalizeCountry(checkout.billingCountry ?? ""),
        };
    const body = createCheckoutRequestSchema.parse({
      cartItemIds: items.map(({ id }) => id),
      recipientName: checkout.fullName,
      email: checkout.email,
      phone,
      companyName,
      addressLine1: checkout.address,
      city: checkout.city,
      postalCode,
      country,
      notes: checkout.notes ?? "",
      sameAsDelivery,
      ...billing,
    });
    const response = await httpClient.post<unknown>("/checkout/sessions", body);
    if (sessionVersion !== authTokenStore.getSessionVersion()) throw new CanceledError("The account session changed.");
    return checkoutSessionSchema.parse(response.data);
  },
};
