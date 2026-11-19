import { afterEach, describe, expect, it, vi } from "vitest";

const httpClient = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/http-client", () => ({ httpClient }));

import { rfqsService } from "./rfqs.service";

const rfq = {
  id: "ddcec378-a00f-4422-9a14-236e2cc09fde",
  rfqNumber: "RFQ-20261115-VPXH",
  status: "Pending",
  createdAt: "2026-11-15T16:24:04.100263+00:00",
  lastActionedAt: "2026-11-15T16:24:04.100263+00:00",
  quoteExpiresAt: null,
  itemCount: 1,
  estimatedValue: null,
  quotedTotal: null,
  currency: null,
};

const summary = {
  totalRfqs: 1,
  countsByStatus: [
    { status: "Pending", count: 1 },
    { status: "Quoted", count: 0 },
    { status: "Accepted", count: 0 },
    { status: "Declined", count: 0 },
    { status: "Expired", count: 0 },
  ],
};

describe("rfqsService", () => {
  afterEach(() => httpClient.get.mockReset());

  it("fetches a paginated RFQ list and validates the response", async () => {
    httpClient.get.mockResolvedValue({ data: { items: [rfq], page: 2, pageSize: 10, total: 11, summary } });
    const controller = new AbortController();

    const result = await rfqsService.list({ page: 2, pageSize: 10 }, controller.signal);

    expect(httpClient.get).toHaveBeenCalledWith("/rfqs", {
      params: { page: 2, pageSize: 10 },
      signal: controller.signal,
    });
    expect(result.items).toEqual([rfq]);
    expect(result.total).toBe(11);
    expect(result.summary).toEqual(summary);
  });

  it("sends search, status and date filters only when they are set", async () => {
    httpClient.get.mockResolvedValue({ data: { items: [], page: 1, pageSize: 10, total: 0, summary } });

    await rfqsService.list({
      page: 1,
      pageSize: 10,
      status: "Quoted",
      search: "RFQ-0018",
      fromDate: "2026-01-01",
      toDate: "2026-01-31",
    });

    expect(httpClient.get).toHaveBeenCalledWith("/rfqs", {
      params: {
        page: 1,
        pageSize: 10,
        status: "Quoted",
        search: "RFQ-0018",
        fromDate: "2026-01-01",
        toDate: "2026-01-31",
      },
      signal: undefined,
    });
  });

  it("fetches RFQ detail by id and validates its items and message", async () => {
    const detail = {
      id: "11111111-1111-1111-1111-111111111111",
      rfqNumber: "sample-rfq-number",
      status: "Pending",
      message: "Example description",
      contact: {
        fullName: "Example Name",
        phone: "+84901234567",
        email: "user@labdock.local",
        companyName: "sample-company-name",
        region: "HCM",
      },
      createdAt: "2026-08-21T10:00:00+00:00",
      lastActionedAt: "2026-08-21T10:00:00+00:00",
      quoteExpiresAt: "2026-08-21T10:00:00+00:00",
      estimatedValue: 99.5,
      quotedTotal: 99.5,
      currency: "SGD",
      items: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          variantId: "11111111-1111-1111-1111-111111111111",
          productName: "sample-product-name",
          variantName: "sample-variant-name",
          sku: "SKU-001",
          quantity: 10,
          listedUnitPrice: 99.5,
          estimatedValue: 99.5,
          quoteUnitPrice: null,
        },
      ],
    };
    httpClient.get.mockResolvedValue({ data: detail });

    const result = await rfqsService.getById(detail.id);

    expect(httpClient.get).toHaveBeenCalledWith(`/rfqs/${detail.id}`, { signal: undefined });
    expect(result.items[0]?.productName).toBe("sample-product-name");
    expect(result.items[0]?.quoteUnitPrice).toBeNull();
    expect(result.message).toBe("Example description");
  });

  it("accepts a pending RFQ detail with empty product and contact text and null prices", async () => {
    const detail = {
      id: "ddcec378-a00f-4422-9a14-236e2cc09fde",
      rfqNumber: "RFQ-20261115-VPXH",
      status: "Pending",
      message: null,
      contact: { fullName: "", phone: "", email: "", companyName: "", region: "" },
      createdAt: "2026-11-15T16:24:04.100263+00:00",
      lastActionedAt: "2026-11-15T16:24:04.100263+00:00",
      quoteExpiresAt: null,
      estimatedValue: null,
      quotedTotal: null,
      currency: null,
      items: [
        {
          id: "79d8875d-7ce4-4535-bfda-7b1bdaeb5389",
          variantId: "25842290-c11d-43e6-a46d-94b43e4dac9e",
          productName: "",
          variantName: "",
          sku: "",
          quantity: 1,
          listedUnitPrice: null,
          estimatedValue: null,
          quoteUnitPrice: null,
        },
      ],
    };
    httpClient.get.mockResolvedValue({ data: detail });

    const result = await rfqsService.getById(detail.id);

    expect(result.items[0]).toMatchObject({ productName: null, variantName: null, sku: null });
    expect(result.contact?.email).toBeNull();
  });

  it("rejects an invalid RFQ id before making a request", async () => {
    await expect(rfqsService.getById("RFQ-20261115-VPXH")).rejects.toThrow();
    expect(httpClient.get).not.toHaveBeenCalled();
  });
});
