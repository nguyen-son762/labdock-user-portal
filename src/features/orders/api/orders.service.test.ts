import { afterEach, describe, expect, it, vi } from "vitest";

const httpClient = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("@/lib/http-client", () => ({ httpClient }));

import { ordersService } from "./orders.service";

const order = {
  id: "11111111-1111-1111-1111-111111111111",
  orderNumber: "ORD-001",
  status: "Draft",
  subtotal: 99.5,
  tax: 9.95,
  shippingFee: 0,
  additionalFeeTotal: 0,
  platformFee: 0,
  total: 109.45,
  currency: "SGD",
  createdAt: "2026-08-21T10:00:00+00:00",
};

const detail = {
  ...order,
  platformFeeRateSnap: 0,
  shippingSnapshotJson: "{}",
  refCode: "AB12CD34",
  paymentExpiresAt: "2026-08-21T11:00:00+00:00",
  companyName: "i-DNA",
  businessRegistrationNo: "202012345A",
  qrImageUrl: "https://cdn.example/qr.png",
  invoice: {
    orderNumber: "ORD-001",
    createdAt: "2026-08-21T10:00:00+00:00",
    buyerEmail: "sample-buyer-email",
    lines: [{ productName: "Example product", sku: "SKU-001", unitPrice: 99.5, quantity: 1, lineTotal: 99.5 }],
    subtotal: 99.5,
    tax: 9.95,
    platformFee: 0,
    total: 109.45,
    currency: "SGD",
    status: "Draft",
  },
};

describe("ordersService", () => {
  afterEach(() => {
    httpClient.get.mockReset();
    httpClient.post.mockReset();
  });

  it("fetches a paginated order list and validates the response", async () => {
    httpClient.get.mockResolvedValue({ data: { items: [order], page: 2, pageSize: 10, total: 11 } });
    const controller = new AbortController();

    const result = await ordersService.list({ page: 2, pageSize: 10 }, controller.signal);

    expect(httpClient.get).toHaveBeenCalledWith("/orders", {
      params: { page: 2, pageSize: 10 },
      signal: controller.signal,
    });
    expect(result.items).toEqual([order]);
    expect(result.total).toBe(11);
  });

  it("sends the status filter and parses the list summary", async () => {
    const summary = {
      totalSpent: 99.5,
      currency: "SGD",
      totalOrders: 1,
      countsByStatus: [
        { status: "Paid", count: 1 },
        { status: "Shipped", count: 0 },
      ],
    };
    httpClient.get.mockResolvedValue({ data: { items: [order], page: 1, pageSize: 10, total: 1, summary } });

    const result = await ordersService.list({ page: 1, pageSize: 10, status: "Paid" });

    expect(httpClient.get).toHaveBeenCalledWith("/orders", {
      params: { page: 1, pageSize: 10, status: "Paid" },
      signal: undefined,
    });
    expect(result.summary).toEqual(summary);
  });

  it("sends date range filters and accepts a null summary currency", async () => {
    const summary = { totalSpent: 0, currency: null, totalOrders: 0, countsByStatus: [{ status: "Draft", count: 0 }] };
    httpClient.get.mockResolvedValue({ data: { items: [], page: 1, pageSize: 10, total: 0, summary } });

    const result = await ordersService.list({ page: 1, pageSize: 10, fromDate: "2026-01-01", toDate: "2026-01-31" });

    expect(httpClient.get).toHaveBeenCalledWith("/orders", {
      params: { page: 1, pageSize: 10, fromDate: "2026-01-01", toDate: "2026-01-31" },
      signal: undefined,
    });
    expect(result.summary?.currency).toBeNull();
  });

  it("sends a trimmed search term", async () => {
    httpClient.get.mockResolvedValue({ data: { items: [], page: 1, pageSize: 10, total: 0 } });

    await ordersService.list({ page: 1, pageSize: 10, search: "  OR-3005 " });

    expect(httpClient.get).toHaveBeenCalledWith("/orders", {
      params: { page: 1, pageSize: 10, search: "OR-3005" },
      signal: undefined,
    });
  });

  it("treats a missing list summary as null", async () => {
    httpClient.get.mockResolvedValue({ data: { items: [], page: 1, pageSize: 10, total: 0 } });

    await expect(ordersService.list({ page: 1, pageSize: 10 })).resolves.toMatchObject({ summary: null });
  });

  it("rejects an unknown status filter before making a request", async () => {
    await expect(ordersService.list({ page: 1, pageSize: 10, status: "Unknown" as never })).rejects.toThrow();
    expect(httpClient.get).not.toHaveBeenCalled();
  });

  it("fetches order detail by id and validates invoice data", async () => {
    httpClient.get.mockResolvedValue({ data: detail });

    const result = await ordersService.getById(order.id);

    expect(httpClient.get).toHaveBeenCalledWith(`/orders/${order.id}`, { signal: undefined });
    expect(result.invoice.lines[0]?.sku).toBe("SKU-001");
    expect(result.shippingSnapshotJson).toBe("{}");
    expect(result.refCode).toBe(detail.refCode);
    expect(result.paymentExpiresAt).toBe(detail.paymentExpiresAt);
    expect(result.companyName).toBe(detail.companyName);
    expect(result.businessRegistrationNo).toBe(detail.businessRegistrationNo);
    expect(result.qrImageUrl).toBe(detail.qrImageUrl);
  });

  it.each([
    [1, "Draft"],
    [2, "New"],
    [3, "PendingPayment"],
    [4, "PaymentSubmitted"],
    [5, "Paid"],
    [6, "Processing"],
    [7, "Shipped"],
    [8, "Delivered"],
    [9, "Cancelled"],
    [10, "Failed"],
  ])("normalizes numeric order status %s and nullable fee rate", async (status, label) => {
    httpClient.get.mockResolvedValue({
      data: {
        ...detail,
        status,
        platformFeeRateSnap: null,
        invoice: { ...detail.invoice, status },
      },
    });

    const result = await ordersService.getById(order.id);

    expect(result.status).toBe(label);
    expect(result.invoice.status).toBe(label);
    expect(result.platformFeeRateSnap).toBeNull();
  });

  it("rejects an invalid order id before making a request", async () => {
    await expect(ordersService.getById("not-an-id")).rejects.toThrow();
    expect(httpClient.get).not.toHaveBeenCalled();
  });

  it("allows missing bank configuration and deadlines on historical orders", async () => {
    httpClient.get.mockResolvedValue({
      data: { ...detail, paymentExpiresAt: null, companyName: "", businessRegistrationNo: "", qrImageUrl: "" },
    });
    const result = await ordersService.getById(order.id);
    expect(result.paymentExpiresAt).toBeNull();
    expect(result.qrImageUrl).toBe("");
  });

  it.each([
    { ...detail, paymentExpiresAt: "invalid-date" },
    { ...detail, qrImageUrl: "javascript:alert(1)" },
  ])("rejects invalid payment metadata", async (response) => {
    httpClient.get.mockResolvedValue({ data: response });
    await expect(ordersService.getById(order.id)).rejects.toThrow();
  });

  it("confirms a transfer and validates the response", async () => {
    const response = {
      orderId: order.id,
      refCode: "AB12CD34",
      paymentStatus: "BuyerMarkedTransferred",
      buyerMarkedTransferredAt: "2026-11-12T10:30:00+00:00",
    };
    httpClient.post.mockResolvedValue({ data: response });

    await expect(ordersService.confirmTransfer(order.id)).resolves.toEqual(response);
    expect(httpClient.post).toHaveBeenCalledWith(`/orders/${order.id}/confirm-transfer`);
  });

  it("cancels an unpaid order and validates the response", async () => {
    httpClient.post.mockResolvedValue({
      data: { orderId: order.id, orderStatus: "Cancelled", paymentStatus: "Cancelled" },
    });

    const request = { reason: "no_longer_needed", comment: "Ordered by mistake" } as const;
    await expect(ordersService.cancelPayment(order.id, request)).resolves.toMatchObject({ orderStatus: "Cancelled" });
    expect(httpClient.post).toHaveBeenCalledWith(`/orders/${order.id}/cancel-payment`, request);
  });

  it("rejects payment actions for an invalid order id before making a request", async () => {
    await expect(ordersService.confirmTransfer("not-an-id")).rejects.toThrow();
    await expect(ordersService.cancelPayment("not-an-id", { reason: "other" })).rejects.toThrow();
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});
