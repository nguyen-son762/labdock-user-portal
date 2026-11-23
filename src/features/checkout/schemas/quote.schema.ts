import { z } from "zod";

import { defaultValidationTranslator, type ValidationTranslator } from "@/i18n/validation";

export function createQuoteContactSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z.object({
    fullName: z.string().trim().min(2, t("fullNameRequired")),
    phoneCountry: z.string().min(1, t("countryCodeRequired")),
    phone: z
      .string()
      .trim()
      .regex(/^\d[\d\s-]{6,18}$/, t("phoneInvalid")),
    email: z.email(t("emailInvalid")),
    companyName: z
      .string()
      .trim()
      .max(100, t("companyMaxLength", { max: 100 }))
      .optional(),
    region: z.string().min(1, t("regionRequired")),
  });
}

export const quoteContactSchema = createQuoteContactSchema();

export const submitQuoteInputSchema = z.object({
  contact: quoteContactSchema,
  itemIds: z.array(z.string().min(1)).min(1, "Select at least one product."),
  idempotencyKey: z.uuid(),
});

export const quoteSubmissionSchema = z.object({ reference: z.string().min(1), status: z.literal("submitted") });

export type QuoteContactValues = z.infer<typeof quoteContactSchema>;
export type SubmitQuoteInput = z.infer<typeof submitQuoteInputSchema>;
export type QuoteSubmission = z.infer<typeof quoteSubmissionSchema>;
