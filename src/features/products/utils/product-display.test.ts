import { describe, expect, it } from "vitest";

import { mapProductViewModel } from "./map-product-view-model";
import { getDefaultProductVariant, getProductVariantPresentation, toSafeExternalUrl } from "./product-display";

const product = mapProductViewModel({
  id: "product-id",
  name: "Flask",
  image: "/flask.jpg",
  volume: "500ml",
  brand: "Brand",
  currency: "SGD",
  price: "100.00",
  category: "Glassware",
  origin: "",
  catalogNumber: "FLASK-001",
  description: "",
  specifications: [],
});
const variant = product.variants[0]!;

describe("product pricing", () => {
  it("applies promotions to the list price independently of RFQ pricing", () => {
    expect(
      getProductVariantPresentation(product, { ...variant, promotionPercent: 10, rfqBasePrice: 120 }),
    ).toMatchObject({
      price: "$90.00",
      originalPrice: "$100.00",
      discount: "-10%",
      canPurchase: true,
    });
    expect(getProductVariantPresentation(product, { ...variant, rfqBasePrice: 120 }).originalPrice).toBeUndefined();
  });

  it.each([
    { ...variant, priceVisible: false, promotionPercent: 10 },
    { ...variant, unitPrice: null, promotionPercent: 10 },
  ])("does not display missing or hidden prices and promotions", (item) => {
    expect(getProductVariantPresentation(product, item)).toMatchObject({
      price: "Contact for price",
      originalPrice: undefined,
      discount: undefined,
      canPurchase: false,
    });
  });

  it("defaults to the first API variant, preserving its order instead of choosing by price", () => {
    const promoted = { ...variant, id: "promoted", unitPrice: 110, promotionPercent: 20 };
    const missingPrice = { ...variant, id: "missing", unitPrice: null };
    expect(getDefaultProductVariant({ ...product, variants: [variant, promoted] })).toEqual(variant);
    expect(getDefaultProductVariant({ ...product, variants: [missingPrice, variant, promoted] })).toEqual(missingPrice);
  });
  it("PDP-007 distinguishes a visible zero price from a missing price", () => {
    expect(getProductVariantPresentation(product, { ...variant, unitPrice: 0 })).toMatchObject({
      price: "$0.00",
      priceVisible: true,
      canPurchase: false,
    });
    expect(getProductVariantPresentation(product, { ...variant, unitPrice: null })).toMatchObject({
      price: "Contact for price",
      priceVisible: false,
      canPurchase: false,
    });
  });
  it.each([{ stockQty: 0 }, { isActive: false }])("PDP-009 blocks purchase for unavailable variant %j", (values) => {
    expect(getProductVariantPresentation(product, { ...variant, ...values })).toMatchObject({
      outOfStock: true,
      canPurchase: false,
    });
  });
});

describe("toSafeExternalUrl", () => {
  it("keeps http and https links", () => {
    expect(toSafeExternalUrl(" https://example.com/paper ")).toBe("https://example.com/paper");
    expect(toSafeExternalUrl("http://example.com")).toBe("http://example.com/");
  });

  it("adds https to links entered without a scheme", () => {
    expect(toSafeExternalUrl("www.example.com/doc")).toBe("https://www.example.com/doc");
  });

  it("rejects unsafe or empty links", () => {
    expect(toSafeExternalUrl("javascript:alert(1)")).toBeUndefined();
    expect(toSafeExternalUrl("data:text/html,hi")).toBeUndefined();
    expect(toSafeExternalUrl("  ")).toBeUndefined();
  });
});
