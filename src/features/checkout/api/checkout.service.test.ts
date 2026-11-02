import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClient = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/lib/http-client", () => ({ httpClient }));

import type { CreateCheckoutInput } from "../schemas/checkout.schema";
import { checkoutService } from "./checkout.service";

const input: CreateCheckoutInput = {
  checkout: {
    fullName: "Buyer Demo",
    email: "buyer@example.test",
    phone: "+84 1234-56789",
    address: "1 Nguyen Hue",
    city: "HCM",
    country: "VN",
    postalCode: "700000",
    notes: "Postman checkout",
    billingSameAsDelivery: true,
    paymentMethod: "bank-transfer",
  },
  items: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      variantId: "22222222-2222-2222-2222-222222222222",
      productName: "Ethanol 99.9%",
      sku: "ETH-999-1L",
      quantity: 2,
      unitPrice: 49.75,
    },
  ],
};
const session = {
  orderId: "33333333-3333-3333-3333-333333333333",
  orderNumber: "ORD-2026-001",
  checkoutUrl: "https://checkout.stripe.com/c/pay-test-session",
};

beforeEach(() => httpClient.post.mockReset());

describe("checkoutService.create", () => {
  it("posts selected cart item IDs and recipient details using the new request contract", async () => {
    httpClient.post.mockResolvedValue({ data: session });

    await expect(checkoutService.create(input)).resolves.toEqual(session);
    expect(httpClient.post).toHaveBeenCalledExactlyOnceWith("/checkout/sessions", {
      cartItemIds: ["11111111-1111-1111-1111-111111111111"],
      recipientName: "Buyer Demo",
      phone: "+84123456789",
      addressLine1: "1 Nguyen Hue",
      city: "HCM",
      country: "VN",
      notes: "Postman checkout",
    });
  });

  it("normalizes country names and allows no notes", async () => {
    httpClient.post.mockResolvedValue({ data: session });

    await checkoutService.create({
      ...input,
      checkout: { ...input.checkout, country: "Vietnam", notes: undefined },
    });

    expect(httpClient.post).toHaveBeenCalledWith(
      "/checkout/sessions",
      expect.objectContaining({ country: "VN", notes: "" }),
    );
  });

  it.each([{ items: [] }, { items: [{ ...input.items[0]!, id: "invalid" }] }])(
    "rejects invalid cart selections before sending a request",
    async ({ items }) => {
      await expect(checkoutService.create({ ...input, items })).rejects.toThrow();
      expect(httpClient.post).not.toHaveBeenCalled();
    },
  );

  it.each([400, 401, 409, 500])(
    "propagates API failure %s without retrying or returning a mock session",
    async (status) => {
      const error = new Error(`HTTP ${status}`);
      httpClient.post.mockRejectedValue(error);

      await expect(checkoutService.create(input)).rejects.toBe(error);
      expect(httpClient.post).toHaveBeenCalledOnce();
    },
  );

  it.each([
    { ...session, orderId: "invalid" },
    { ...session, checkoutUrl: "" },
    { ...session, checkoutUrl: "javascript:alert(1)" },
    { ...session, checkoutUrl: "data:text/html,test" },
    { paymentReference: "PAY-LOCAL", amount: 99.5 },
  ])("rejects malformed or unsafe checkout responses", async (response) => {
    httpClient.post.mockResolvedValue({ data: response });

    await expect(checkoutService.create(input)).rejects.toThrow();
  });
});
