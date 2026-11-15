import { z } from "zod";

export const inquiryTypeSchema = z.enum(["general", "quote"]);

export const contactProductSchema = z.object({
  productName: z.string().trim(),
  // Filled from the product picked in the search results; never typed by the user.
  productId: z.string(),
  slug: z.string(),
  variantId: z.string(),
  brand: z.string(),
  quantity: z.string().trim(),
  budgetRange: z.string().trim().max(80, "Budget range is too long."),
});

export const contactFormSchema = z
  .object({
    inquiryType: inquiryTypeSchema,
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.email("Enter a valid email address."),
    phoneCountry: z.string().min(1, "Select a country code."),
    phone: z
      .string()
      .trim()
      .regex(/^\d[\d\s-]{6,18}$/, "Enter a valid phone number."),
    company: z.string().trim().max(120, "Company name is too long."),
    subject: z.string().trim().max(160, "Subject is too long."),
    message: z.string().trim().max(2_000, "Message must be 2,000 characters or fewer."),
    products: z.array(contactProductSchema).max(5, "You can add up to 5 products."),
  })
  .superRefine((values, context) => {
    if (values.inquiryType !== "quote") return;
    if (values.products.length === 0) {
      context.addIssue({ code: "custom", path: ["products"], message: "Add at least one product." });
      return;
    }
    values.products.forEach((product, index) => {
      if (product.productName.length < 2) {
        context.addIssue({
          code: "custom",
          path: ["products", index, "productName"],
          message: "Enter a product name.",
        });
      } else if (!product.productId) {
        context.addIssue({
          code: "custom",
          path: ["products", index, "productName"],
          message: "Select a product from the search results.",
        });
      } else if (!product.variantId) {
        context.addIssue({
          code: "custom",
          path: ["products", index, "variantId"],
          message: "Select a size.",
        });
      }
      if (!/^\d+$/.test(product.quantity) || Number(product.quantity) < 1) {
        context.addIssue({ code: "custom", path: ["products", index, "quantity"], message: "Enter a valid quantity." });
      }
    });
  });

export const contactSubmissionSchema = z.object({
  reference: z.string().min(1),
  status: z.literal("submitted"),
});

export const submitContactInputSchema = z.object({
  contact: contactFormSchema,
  idempotencyKey: z.uuid(),
});

export type InquiryType = z.infer<typeof inquiryTypeSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type SubmitContactInput = z.infer<typeof submitContactInputSchema>;
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
