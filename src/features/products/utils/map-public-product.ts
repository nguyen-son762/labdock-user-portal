import type { Product, RelatedProduct } from "../products.types";
import type { PublicProductDetail } from "../schemas/product-detail.schema";
import type { PublicProductListItem } from "../schemas/product-list.schema";

export function mapPublicProduct(product: PublicProductListItem | PublicProductDetail): Product {
  if ("variants" in product) return { ...product, related: product.related ?? [] };

  const unitPrice = product.fromPrice;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    productNo: product.productNo,
    status: "Published",
    brandName: product.brandName,
    notes: "",
    description: product.name,
    specialRequirement: false,
    restrictedCondition: false,
    priceVisible: product.priceVisible,
    casNumber: "",
    specifications: [
      { name: "Product number", value: product.productNo },
      { name: "Brand", value: product.brandName },
    ],
    variants: [
      {
        id: product.id,
        sku: product.productNo,
        priceVisible: product.priceVisible,
        unitPrice,
        rfqBasePrice: unitPrice,
        promotionPercent: product.promotionPercent,
        currency: product.currency,
        stockQty: product.outOfStock ? 0 : 1,
        isActive: true,
        selections: [],
      },
    ],
    media: product.primaryImageUrl
      ? [
          {
            id: product.id,
            url: product.primaryImageUrl,
            contentType: "image/*",
            sortOrder: 0,
            isPrimary: true,
          },
        ]
      : [],
    documents: [],
    references: [],
    related: [],
    certificates: [],
    isNew: product.isNew,
    isOutstanding: product.isOutstanding,
  };
}

export function mapRelatedProduct(product: RelatedProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    productNo: "",
    status: "Published",
    brandName: "",
    notes: "",
    description: product.name,
    specialRequirement: false,
    restrictedCondition: false,
    priceVisible: product.priceVisible,
    casNumber: "",
    specifications: [],
    variants: [
      {
        id: product.id,
        sku: "",
        priceVisible: product.priceVisible,
        unitPrice: product.fromPrice,
        rfqBasePrice: product.fromPrice,
        promotionPercent: 0,
        currency: product.currency,
        stockQty: 1,
        isActive: true,
        selections: [],
      },
    ],
    media: product.primaryImageUrl
      ? [
          {
            id: product.id,
            url: product.primaryImageUrl,
            contentType: "image/*",
            sortOrder: 0,
            isPrimary: true,
          },
        ]
      : [],
    documents: [],
    references: [],
    related: [],
    certificates: [],
    isNew: false,
    isOutstanding: false,
  };
}
