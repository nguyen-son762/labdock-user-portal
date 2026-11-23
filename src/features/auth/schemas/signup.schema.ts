import { z } from "zod";

import { defaultValidationTranslator, type ValidationTranslator } from "@/i18n/validation";

const guidSchema = z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, "Invalid identifier.");

export function createSignupSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z.object({
    company: z
      .string()
      .trim()
      .min(1, t("companyRequired"))
      .max(160, t("companyMaxLength", { max: 160 })),
    fullName: z.string().trim().min(1, t("signupFullNameRequired")),
    email: z.string().trim().min(1, t("emailRequired")).email(t("emailInvalid")),
    phoneCode: z.string().min(1, t("callingCodeRequired")),
    phone: z
      .string()
      .trim()
      .regex(/^\d{6,15}$/, t("phoneInvalid")),
    country: z.string().regex(/^[A-Z]{2}$/, t("countryRequired")),
    region: z.string().trim().min(1, t("signupRegionRequired")),
    address: z.string().trim().min(1, t("addressRequired")),
  });
}

export const signupSchema = createSignupSchema();

function createVerificationCodeSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z
    .string()
    .trim()
    .regex(/^\d{6}$/, t("verificationCodeInvalid"));
}

const verificationCodeSchema = createVerificationCodeSchema();

export function createVerificationSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z.object({ code: createVerificationCodeSchema(t) });
}

export const verificationSchema = createVerificationSchema();

export function createPasswordSchema(t: ValidationTranslator = defaultValidationTranslator) {
  const passwordFieldsSchema = z.object({
    password: z.string().min(8, t("passwordMinLength")),
    confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
  });

  return passwordFieldsSchema.refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: t("passwordsMismatch"),
  });
}

export const passwordSchema = createPasswordSchema();

export const signupStartResponseSchema = z.object({
  challengeId: guidSchema,
  expiresAt: z.iso.datetime({ offset: true }),
});

export const verifySignupInputSchema = z.object({
  challengeId: guidSchema,
  code: verificationCodeSchema,
});

export const signupVerificationResponseSchema = z.object({ verified: z.boolean() });

export const completeSignupInputSchema = z.object({ challengeId: guidSchema }).and(passwordSchema);

export const signupCompletionSchema = z.object({
  userId: guidSchema,
  email: z.string().min(1),
});

export type SignupValues = z.infer<typeof signupSchema>;
export type VerificationValues = z.infer<typeof verificationSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;
export type SignupChallenge = z.infer<typeof signupStartResponseSchema>;
export type VerifySignupInput = z.infer<typeof verifySignupInputSchema>;
export type CompleteSignupInput = z.infer<typeof completeSignupInputSchema>;
export type SignupCompletion = z.infer<typeof signupCompletionSchema>;
