import { describe, expect, it } from "vitest";

import type { Product } from "../products.types";
import { publicProductDetailSchema } from "./product-detail.schema";

const productDetailResponse: Product = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Example Name",
  slug: "example-slug",
  productNo: "SKU-001",
  status: "Draft",
  brandName: "sample-brand-name",
  notes: "Example description",
  description: "Example description",
  specialRequirement: true,
  restrictedCondition: true,
  priceVisible: true,
  casNumber: "64-17-5",
  specifications: [{ name: "Example Name", value: "sample-value" }],
  variants: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      sku: "SKU-001",
      priceVisible: true,
      unitPrice: 99.5,
      rfqBasePrice: 99.5,
      promotionPercent: 99.5,
      currency: "SGD",
      stockQty: 10,
      isActive: true,
      selections: [
        {
          attributeId: "00000000-0000-0000-0000-000000000000",
          attributeCode: "example",
          attributeName: "example",
          valueId: "00000000-0000-0000-0000-000000000000",
          valueCode: "example",
          value: "example",
        },
      ],
    },
  ],
  media: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      url: "/media/public/example.jpg",
      contentType: "image/jpeg",
      sortOrder: 10,
      isPrimary: true,
    },
  ],
  documents: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      displayName: "Example Name",
      contentType: "image/jpeg",
      sizeBytes: 1024,
      sortOrder: 10,
      createdAt: "2026-08-21T10:00:00+00:00",
      url: "/media/public/example.jpg",
    },
  ],
  references: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Example reference",
      url: "https://example.com/paper",
      sortOrder: 0,
    },
  ],
  related: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Example Name",
      slug: "example-slug",
      primaryImageUrl: "sample-primary-image-url",
      priceVisible: true,
      fromPrice: 99.5,
      currency: "SGD",
    },
  ],
  certificates: [{ id: "11111111-1111-1111-1111-111111111111", name: "Example Name" }],
  isNew: true,
  isOutstanding: true,
};

describe("publicProductDetailSchema", () => {
  it("validates the complete product detail payload", () => {
    expect(publicProductDetailSchema.parse(productDetailResponse)).toEqual(productDetailResponse);
  });

  it("defaults missing references to an empty list", () => {
    const withoutReferences: Partial<Product> = { ...productDetailResponse };
    delete withoutReferences.references;
    expect(publicProductDetailSchema.parse({ ...withoutReferences, references: null }).references).toEqual([]);
    expect(publicProductDetailSchema.parse(withoutReferences).references).toEqual([]);
  });

  it("rejects malformed nested variant data", () => {
    const malformed = {
      ...productDetailResponse,
      variants: [{ ...productDetailResponse.variants[0], stockQty: -1 }],
    };

    expect(() => publicProductDetailSchema.parse(malformed)).toThrow();
  });

  it("accepts the numeric status still returned by the current product detail endpoint", () => {
    expect(publicProductDetailSchema.parse({ ...productDetailResponse, status: 1 }).status).toBe(1);
  });

  it("normalizes nullable text fields returned by the product detail endpoint", () => {
    const result = publicProductDetailSchema.parse({
      ...productDetailResponse,
      notes: null,
      description: null,
      casNumber: null,
    });

    expect(result).toEqual(expect.objectContaining({ notes: "", description: "", casNumber: "" }));
  });

  it("preserves hidden prices and normalizes an empty related collection", () => {
    const result = publicProductDetailSchema.parse({
      ...productDetailResponse,
      priceVisible: false,
      supplierItemNo: "SUPPLIER-001",
      variants: [{ ...productDetailResponse.variants[0], priceVisible: false, unitPrice: null, rfqBasePrice: null }],
      related: null,
    });

    expect(result.variants[0]).toEqual(expect.objectContaining({ unitPrice: null, rfqBasePrice: null }));
    expect(result.supplierItemNo).toBe("SUPPLIER-001");
    expect(result.related).toEqual([]);
  });
});
