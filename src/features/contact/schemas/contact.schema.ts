import { z } from "zod";

import { defaultValidationTranslator, type ValidationTranslator } from "@/i18n/validation";

export const inquiryTypeSchema = z.enum(["general", "quote"]);

export function createContactProductSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z.object({
    productName: z.string().trim(),
    // Filled from the product picked in the search results; never typed by the user.
    productId: z.string(),
    slug: z.string(),
    variantId: z.string(),
    brand: z.string(),
    quantity: z.string().trim(),
    budgetRange: z
      .string()
      .trim()
      .max(80, t("budgetMaxLength", { max: 80 })),
  });
}

export const contactProductSchema = createContactProductSchema();

export function createContactFormSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z
    .object({
      inquiryType: inquiryTypeSchema,
      fullName: z.string().trim().min(2, t("fullNameRequired")),
      email: z.email(t("emailInvalid")),
      phoneCountry: z.string().min(1, t("countryCodeRequired")),
      phone: z
        .string()
        .trim()
        .regex(/^\d[\d\s-]{6,18}$/, t("phoneInvalid")),
      company: z
        .string()
        .trim()
        .max(120, t("companyMaxLength", { max: 120 })),
      subject: z
        .string()
        .trim()
        .max(160, t("subjectMaxLength", { max: 160 })),
      message: z
        .string()
        .trim()
        .max(2_000, t("messageMaxLength", { max: 2000 })),
      products: z.array(createContactProductSchema(t)).max(5, t("productsMaxLength", { max: 5 })),
    })
    .superRefine((values, context) => {
      if (values.inquiryType !== "quote") return;
      if (values.products.length === 0) {
        context.addIssue({ code: "custom", path: ["products"], message: t("productRequired") });
        return;
      }
      values.products.forEach((product, index) => {
        if (product.productName.length < 2) {
          context.addIssue({
            code: "custom",
            path: ["products", index, "productName"],
            message: t("productNameRequired"),
          });
        } else if (!product.productId) {
          context.addIssue({
            code: "custom",
            path: ["products", index, "productName"],
            message: t("productSelectionRequired"),
          });
        } else if (!product.variantId) {
          context.addIssue({
            code: "custom",
            path: ["products", index, "variantId"],
            message: t("variantRequired"),
          });
        }
        if (!/^\d+$/.test(product.quantity) || Number(product.quantity) < 1) {
          context.addIssue({ code: "custom", path: ["products", index, "quantity"], message: t("quantityInvalid") });
        }
      });
    });
}

export const contactFormSchema = createContactFormSchema();

export const contactSubmissionSchema = z.object({
  reference: z.string().min(1),
  status: z.literal("submitted"),
});

/** The handoff API returns the created RFQ; the contact flow only needs its number as the reference. */
export const rfqHandoffResponseSchema = z.object({
  rfqNumber: z.string().min(1),
});

export const submitContactInputSchema = z.object({
  contact: contactFormSchema,
  idempotencyKey: z.uuid(),
});

export type InquiryType = z.infer<typeof inquiryTypeSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type SubmitContactInput = z.infer<typeof submitContactInputSchema>;
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
