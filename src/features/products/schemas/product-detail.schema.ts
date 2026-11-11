import { z } from "zod";

import type {
  Product,
  ProductCertificate,
  ProductDocument,
  ProductMedia,
  ProductReference,
  ProductSpecification,
  ProductVariant,
  ProductVariantSelection,
  RelatedProduct,
} from "../products.types";

const guidSchema = z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, "Invalid identifier.");

const productSpecificationSchema: z.ZodType<ProductSpecification> = z.object({
  name: z.string().min(1),
  value: z.string(),
});

const productVariantSelectionSchema: z.ZodType<ProductVariantSelection> = z.object({
  attributeId: guidSchema,
  attributeCode: z.string().min(1),
  attributeName: z.string().min(1),
  valueId: guidSchema,
  valueCode: z.string().min(1),
  value: z.string().min(1),
});

const productVariantSchema: z.ZodType<ProductVariant> = z.object({
  id: guidSchema,
  sku: z.string().min(1),
  priceVisible: z.boolean(),
  unitPrice: z.number().nonnegative().nullable(),
  rfqBasePrice: z.number().nonnegative().nullable(),
  promotionPercent: z.number().min(0).max(100),
  currency: z.string().length(3),
  stockQty: z.number().int().nonnegative(),
  isActive: z.boolean(),
  selections: z.array(productVariantSelectionSchema),
});

const productMediaSchema: z.ZodType<ProductMedia> = z.object({
  id: guidSchema,
  url: z.string().min(1),
  contentType: z.string().min(1),
  sortOrder: z.number().int(),
  isPrimary: z.boolean(),
});

const productDocumentSchema: z.ZodType<ProductDocument> = z.object({
  id: guidSchema,
  displayName: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  sortOrder: z.number().int(),
  createdAt: z.iso.datetime({ offset: true }),
  url: z.string().min(1),
});

const productReferenceSchema: z.ZodType<ProductReference> = z.object({
  id: guidSchema,
  title: z.string(),
  url: z.string(),
  sortOrder: z.number().int(),
});

const relatedProductSchema: z.ZodType<RelatedProduct> = z.object({
  id: guidSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  primaryImageUrl: z.string().min(1),
  priceVisible: z.boolean(),
  fromPrice: z.number().nonnegative().nullable(),
  currency: z.string().length(3),
});

const productCertificateSchema: z.ZodType<ProductCertificate> = z.object({
  id: guidSchema,
  name: z.string().min(1),
});

export const publicProductDetailSchema: z.ZodType<Product> = z.object({
  id: guidSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  productNo: z.string().min(1),
  supplierItemNo: z.string().optional(),
  status: z.union([z.string().min(1), z.number().int()]),
  brandName: z.string().min(1),
  notes: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  description: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  specialRequirement: z.boolean(),
  restrictedCondition: z.boolean(),
  priceVisible: z.boolean(),
  casNumber: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  specifications: z.array(productSpecificationSchema),
  variants: z.array(productVariantSchema),
  media: z.array(productMediaSchema),
  documents: z.array(productDocumentSchema),
  references: z
    .array(productReferenceSchema)
    .nullish()
    .transform((value) => value ?? []),
  related: z
    .array(relatedProductSchema)
    .nullable()
    .transform((value) => value ?? []),
  certificates: z.array(productCertificateSchema),
  isNew: z.boolean(),
  isOutstanding: z.boolean(),
});

export type PublicProductDetail = Omit<Product, "related"> & { related: RelatedProduct[] | null };
export type PublicProductSpecification = ProductSpecification;
export type PublicProductVariantSelection = ProductVariantSelection;
export type PublicProductVariant = ProductVariant;
export type PublicProductMedia = ProductMedia;
export type PublicProductDocument = ProductDocument;
export type PublicRelatedProduct = RelatedProduct;
export type PublicProductCertificate = ProductCertificate;
