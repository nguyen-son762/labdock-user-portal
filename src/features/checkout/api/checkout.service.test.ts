import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClient = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/lib/http-client", () => ({ httpClient }));

import type { CreateCheckoutInput } from "../schemas/checkout.schema";
import { authTokenStore } from "@/lib/auth-token-store";
import { checkoutSessionFixture as session } from "../test/checkout-session.fixture";
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
beforeEach(() => httpClient.post.mockReset());

describe("checkoutService.create", () => {
  it("posts selected cart item IDs and recipient details using the new request contract", async () => {
    httpClient.post.mockResolvedValue({ data: session });

    await expect(checkoutService.create(input)).resolves.toEqual(session);
    expect(httpClient.post).toHaveBeenCalledExactlyOnceWith("/checkout/sessions", {
      cartItemIds: ["11111111-1111-1111-1111-111111111111"],
      recipientName: "Buyer Demo",
      email: "buyer@example.test",
      phone: "+84123456789",
      companyName: "",
      addressLine1: "1 Nguyen Hue",
      city: "HCM",
      postalCode: "700000",
      country: "VN",
      notes: "Postman checkout",
      sameAsDelivery: true,
      billingRecipientName: "Buyer Demo",
      billingEmail: "buyer@example.test",
      billingPhone: "+84123456789",
      billingCompanyName: "",
      billingAddressLine1: "1 Nguyen Hue",
      billingCity: "HCM",
      billingPostalCode: "700000",
      billingCountry: "VN",
    });
  });

  it("sends the separate billing contact and address when it differs from delivery", async () => {
    httpClient.post.mockResolvedValue({ data: session });

    await checkoutService.create({
      ...input,
      checkout: {
        ...input.checkout,
        companyName: "Demo Lab",
        billingSameAsDelivery: false,
        billingFullName: "Accounts Team",
        billingEmail: "ap@example.test",
        billingPhone: "+84 987-654-321",
        billingCompanyName: "Demo Lab Finance",
        billingAddress: "2 Le Loi",
        billingCity: "Ha Noi",
        billingPostalCode: "100000",
        billingCountry: "Vietnam",
      },
    });

    expect(httpClient.post).toHaveBeenCalledWith(
      "/checkout/sessions",
      expect.objectContaining({
        companyName: "Demo Lab",
        sameAsDelivery: false,
        billingRecipientName: "Accounts Team",
        billingEmail: "ap@example.test",
        billingPhone: "+84987654321",
        billingCompanyName: "Demo Lab Finance",
        billingAddressLine1: "2 Le Loi",
        billingCity: "Ha Noi",
        billingPostalCode: "100000",
        billingCountry: "VN",
      }),
    );
  });

  it("accepts the live API response with a relative QR path and .NET timestamp precision", async () => {
    httpClient.post.mockResolvedValue({
      data: {
        orderId: "4ddb6932-feaf-416d-8a0a-8cd19f7103ce",
        orderNumber: "OR-20261125-1716",
        refCode: "ASYYZH22",
        amount: 10075,
        currency: "SGD",
        paymentExpiresAt: "2026-11-25T10:54:08.4399242+00:00",
        companyName: "I-DNA BIOTECHNOLOGY PTE LTD",
        businessRegistrationNo: "200402942H",
        qrImageUrl: "/media/public/payments/paynow-qr-936dc9af9e824e94998cb5c57304cb11.png",
      },
    });

    const result = await checkoutService.create(input);

    expect(result.orderId).toBe("4ddb6932-feaf-416d-8a0a-8cd19f7103ce");
    expect(result.qrImageUrl).toMatch(
      /^https?:\/\/[^/]+\/media\/public\/payments\/paynow-qr-936dc9af9e824e94998cb5c57304cb11\.png$/,
    );
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
    { ...session, qrImageUrl: "javascript:alert(1)" },
    { ...session, qrImageUrl: "data:text/html,test" },
    { ...session, paymentExpiresAt: "invalid" },
    { ...session, amount: -1 },
    { ...session, currency: "" },
    { ...session, refCode: " " },
    { orderId: session.orderId, orderNumber: session.orderNumber, checkoutUrl: "https://example.test/old" },
    { paymentReference: "PAY-LOCAL", amount: 99.5 },
  ])("rejects malformed or unsafe checkout responses", async (response) => {
    httpClient.post.mockResolvedValue({ data: response });

    await expect(checkoutService.create(input)).rejects.toThrow();
  });

  it("discards checkout instructions returned after the account session changes", async () => {
    httpClient.post.mockImplementation(async () => {
      authTokenStore.clear();
      return { data: session };
    });
    await expect(checkoutService.create(input)).rejects.toThrow("The account session changed.");
  });

  it("accepts the live checkout response when transfer configuration has not been filled in", async () => {
    const response = {
      ...session,
      companyName: "",
      businessRegistrationNo: "",
      qrImageUrl: "",
      paymentExpiresAt: "2026-11-04T03:55:45.1233513+00:00",
    };
    httpClient.post.mockResolvedValue({ data: response });
    await expect(checkoutService.create(input)).resolves.toEqual(response);
    expect(httpClient.post).toHaveBeenCalledOnce();
  });
});
