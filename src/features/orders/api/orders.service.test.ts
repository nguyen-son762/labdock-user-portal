import { afterEach, describe, expect, it, vi } from "vitest";

const httpClient = vi.hoisted(() => ({ get: vi.fn() }));

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
  afterEach(() => httpClient.get.mockReset());

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

  it("fetches order detail by id and validates invoice data", async () => {
    httpClient.get.mockResolvedValue({ data: detail });

    const result = await ordersService.getById(order.id);

    expect(httpClient.get).toHaveBeenCalledWith(`/orders/${order.id}`, { signal: undefined });
    expect(result.invoice.lines[0]?.sku).toBe("SKU-001");
    expect(result.shippingSnapshotJson).toBe("{}");
  });

  it.each([
    [0, "Draft"],
    [1, "New"],
    [2, "Processing"],
    [3, "Shipped"],
    [4, "Delivered"],
    [5, "Cancelled"],
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
});
