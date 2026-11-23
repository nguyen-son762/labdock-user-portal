import { z } from "zod";

import { defaultValidationTranslator, type ValidationTranslator } from "@/i18n/validation";

const guidSchema = z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, "Invalid identifier.");

function createVerificationCodeSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z
    .string()
    .trim()
    .regex(/^\d{6}$/, t("verificationCodeInvalid"));
}

const verificationCodeSchema = createVerificationCodeSchema();

export function createForgotPasswordSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z.object({
    email: z.string().trim().min(1, t("emailRequired")).email(t("emailInvalid")),
  });
}

export const forgotPasswordSchema = createForgotPasswordSchema();

export const forgotPasswordStartResponseSchema = z.object({
  challengeId: guidSchema,
  expiresAt: z.iso.datetime({ offset: true }),
});

export function createForgotPasswordVerificationSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z.object({ code: createVerificationCodeSchema(t) });
}

export const forgotPasswordVerificationSchema = createForgotPasswordVerificationSchema();

export const verifyForgotPasswordInputSchema = z.object({
  challengeId: guidSchema,
  code: verificationCodeSchema,
});

export const forgotPasswordVerificationResponseSchema = z.object({ verified: z.boolean() });

export function createForgotPasswordResetSchema(t: ValidationTranslator = defaultValidationTranslator) {
  const forgotPasswordResetFieldsSchema = z.object({
    newPassword: z.string().min(8, t("passwordMinLength")),
    confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
  });

  return forgotPasswordResetFieldsSchema.refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: t("passwordsMismatch"),
  });
}

export const forgotPasswordResetSchema = createForgotPasswordResetSchema();

export const resetForgotPasswordInputSchema = z.object({ challengeId: guidSchema }).and(forgotPasswordResetSchema);

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ForgotPasswordChallenge = z.infer<typeof forgotPasswordStartResponseSchema>;
export type ForgotPasswordVerificationValues = z.infer<typeof forgotPasswordVerificationSchema>;
export type VerifyForgotPasswordInput = z.infer<typeof verifyForgotPasswordInputSchema>;
export type ForgotPasswordResetValues = z.infer<typeof forgotPasswordResetSchema>;
export type ResetForgotPasswordInput = z.infer<typeof resetForgotPasswordInputSchema>;
