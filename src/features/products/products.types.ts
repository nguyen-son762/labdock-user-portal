export type ProductSpecification = {
  name: string;
  value: string;
};

export type ProductVariantSelection = {
  attributeId: string;
  attributeCode: string;
  attributeName: string;
  valueId: string;
  valueCode: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  priceVisible: boolean;
  unitPrice: number | null;
  rfqBasePrice: number | null;
  promotionPercent: number;
  currency: string;
  stockQty: number;
  isActive: boolean;
  selections: ProductVariantSelection[];
};

export type ProductMedia = {
  id: string;
  url: string;
  contentType: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductDocument = {
  id: string;
  displayName: string;
  contentType: string;
  sizeBytes: number;
  sortOrder: number;
  createdAt: string;
  url: string;
};

export type ProductReference = {
  id: string;
  title: string;
  url: string;
  sortOrder: number;
};

export type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  primaryImageUrl: string;
  priceVisible: boolean;
  fromPrice: number | null;
  currency: string;
};

export type ProductCertificate = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  productNo: string;
  supplierItemNo?: string;
  status: string | number;
  brandName: string;
  notes: string;
  description: string;
  specialRequirement: boolean;
  restrictedCondition: boolean;
  priceVisible: boolean;
  casNumber: string;
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  media: ProductMedia[];
  documents: ProductDocument[];
  references: ProductReference[];
  related: RelatedProduct[];
  certificates: ProductCertificate[];
  isNew: boolean;
  isOutstanding: boolean;
};

export type ProductViewModelSpecification = {
  label: string;
  value: string;
};

/** Presentation model currently consumed by product cards, listings and the static detail screen. */
export type ProductViewModel = {
  id: string;
  slug?: string;
  name: string;
  image: string;
  gallery?: string[];
  volume: string;
  brand: string;
  currency: string;
  price: string;
  priceVisible?: boolean;
  outOfStock?: boolean;
  originalPrice?: string;
  badge?: "Best Seller" | "Out of stock";
  discount?: string;
  category: string;
  origin: string;
  catalogNumber: string;
  casNumber?: string;
  description: string;
  specifications: ProductViewModelSpecification[];
};

export type ProductDetail = Product;

export type CatalogBrandOption = {
  id: string;
  name: string;
};

export type CatalogCategoryOption = {
  id: string;
  name: string;
  slug: string;
  depth: number;
  imageUrl: string | null;
  productCount?: number;
};
