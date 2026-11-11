import type { Product, ProductViewModel } from "../products.types";

function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9.]/g, ""));
}

export function mapProductViewModel(product: ProductViewModel): Product {
  const unitPrice = parsePrice(product.price);
  const originalPrice = product.originalPrice ? parsePrice(product.originalPrice) : unitPrice;
  const promotionPercent = product.discount ? Number(product.discount.replace(/[^0-9.]/g, "")) : 0;
  const outOfStock = product.outOfStock ?? product.badge === "Out of stock";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug ?? product.id,
    productNo: product.catalogNumber,
    status: "Published",
    brandName: product.brand,
    notes: "",
    description: product.description,
    specialRequirement: false,
    restrictedCondition: false,
    priceVisible: product.priceVisible !== false,
    casNumber: product.casNumber ?? "",
    specifications: product.specifications.map((specification) => ({
      name: specification.label,
      value: specification.value,
    })),
    variants: [
      {
        id: `${product.id}-default`,
        sku: product.catalogNumber,
        priceVisible: product.priceVisible !== false,
        unitPrice: promotionPercent > 0 ? originalPrice : unitPrice,
        rfqBasePrice: originalPrice,
        promotionPercent,
        currency: product.currency,
        stockQty: outOfStock ? 0 : 1,
        isActive: true,
        selections: [
          {
            attributeId: `${product.id}-size`,
            attributeCode: "size",
            attributeName: "Size",
            valueId: `${product.id}-${product.volume}`,
            valueCode: product.volume,
            value: product.volume,
          },
        ],
      },
    ],
    media: (product.gallery ?? [product.image]).map((url, index) => ({
      id: `${product.id}-media-${index}`,
      url,
      contentType: "image/png",
      sortOrder: index,
      isPrimary: index === 0,
    })),
    documents: [],
    references: [],
    related: [],
    certificates: [],
    isNew: false,
    isOutstanding: product.badge === "Best Seller",
  };
}
