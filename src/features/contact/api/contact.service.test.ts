import { afterEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@/lib/http-client";

import type { SubmitContactInput } from "../schemas/contact.schema";
import { contactService } from "./contact.service";

const VARIANT_ID = "11111111-1111-4111-8111-111111111111";
const RFQ = {
  id: "22222222-2222-4222-8222-222222222222",
  rfqNumber: "RFQ-0001",
  userId: "33333333-3333-4333-8333-333333333333",
  supplierId: "44444444-4444-4444-8444-444444444444",
  status: "Submitted",
  source: "ExternalHandoff",
  createdAt: "2026-11-15T10:00:00+00:00",
  updatedAt: "2026-11-15T10:00:00+00:00",
  items: [],
};

function quoteInput(overrides: Partial<SubmitContactInput["contact"]> = {}): SubmitContactInput {
  return {
    idempotencyKey: crypto.randomUUID(),
    contact: {
      inquiryType: "quote",
      fullName: "Sarah Chen",
      email: "sarah@example.com",
      phoneCountry: "65",
      phone: "88009900",
      company: "Acme Lab",
      subject: "",
      message: "Need it by Friday",
      products: [
        {
          productName: "Prostaglandin A1",
          productId: "p1",
          slug: "prostaglandin-a1",
          variantId: VARIANT_ID,
          brand: "Cayman",
          quantity: "10",
          budgetRange: "SGD 500",
        },
        {
          productName: "Flask",
          productId: "p2",
          slug: "flask",
          variantId: VARIANT_ID,
          brand: "BioRad",
          quantity: "2",
          budgetRange: "",
        },
      ],
      ...overrides,
    },
  };
}

describe("contactService.submit", () => {
  afterEach(() => vi.restoreAllMocks());

  it("posts a quote request to the external handoff endpoint and returns the RFQ number", async () => {
    const post = vi.spyOn(httpClient, "post").mockResolvedValue({ data: RFQ });

    const result = await contactService.submit(quoteInput());

    expect(post).toHaveBeenCalledWith("/rfqs/external-handoff", {
      email: "sarah@example.com",
      fullName: "Sarah Chen",
      organization: "Acme Lab",
      items: [
        { variantId: VARIANT_ID, quantity: 10, specNote: "Budget range: SGD 500\nMessage: Need it by Friday" },
        { variantId: VARIANT_ID, quantity: 2, specNote: "" },
      ],
    });
    expect(result).toEqual({ reference: "RFQ-0001", status: "submitted" });
  });

  it("rejects an invalid RFQ response", async () => {
    vi.spyOn(httpClient, "post").mockResolvedValue({ data: { id: "x" } });
    await expect(contactService.submit(quoteInput())).rejects.toThrow();
  });

  it("does not call the RFQ API for general inquiries", async () => {
    const post = vi.spyOn(httpClient, "post");
    const result = await contactService.submit(quoteInput({ inquiryType: "general", subject: "Hello", products: [] }));
    expect(post).not.toHaveBeenCalled();
    expect(result.reference).toMatch(/^MSG-/);
  });
});
