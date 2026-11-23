import { z } from "zod";

import { defaultValidationTranslator, type ValidationTranslator } from "@/i18n/validation";

export function createProfileFormSchema(t: ValidationTranslator = defaultValidationTranslator) {
  const optionalCompanyPhoneSchema = z
    .string()
    .trim()
    .max(20, t("companyPhoneMaxLength", { max: 20 }))
    .refine((value) => value.length === 0 || value.length >= 6, t("companyPhoneInvalid"));

  const optionalBusinessRegistrationSchema = z
    .string()
    .trim()
    .max(40, t("businessRegistrationMaxLength", { max: 40 }))
    .refine((value) => value.length === 0 || value.length >= 3, t("businessRegistrationInvalid"));

  const billingSchema = z.object({
    billingAddress: z
      .string()
      .trim()
      .min(5, t("billingAddressRequired"))
      .max(200, t("billingAddressMaxLength", { max: 200 })),
    billingPostalCode: z
      .string()
      .trim()
      .min(4, t("postalCodeRequired"))
      .max(12, t("postalCodeMaxLength", { max: 12 })),
    billingCountry: z.string().trim().min(1, t("countryRequired")),
  });

  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, t("fullNameMinLength"))
        .max(80, t("fullNameMaxLength", { max: 80 })),
      phone: z
        .string()
        .trim()
        .min(8, t("phoneInvalid"))
        .max(20, t("phoneMaxLength", { max: 20 })),
      email: z.string().trim().email(t("emailInvalid")),
      companyName: z
        .string()
        .trim()
        .min(2, t("profileCompanyRequired"))
        .max(120, t("companyMaxLength", { max: 120 })),
      companyPhone: optionalCompanyPhoneSchema,
      businessRegistrationNumber: optionalBusinessRegistrationSchema,
      deliveryAddress: z
        .string()
        .trim()
        .min(5, t("profileDeliveryAddressRequired"))
        .max(200, t("deliveryAddressMaxLength", { max: 200 })),
      postalCode: z
        .string()
        .trim()
        .min(4, t("postalCodeRequired"))
        .max(12, t("postalCodeMaxLength", { max: 12 })),
      country: z.string().trim().min(1, t("countryRequired")),
      billingSameAsDelivery: z.boolean(),
      billingAddress: z.string().trim().optional(),
      billingPostalCode: z.string().trim().optional(),
      billingCountry: z.string().trim().optional(),
    })
    .superRefine((values, context) => {
      if (values.billingSameAsDelivery) return;
      const result = billingSchema.safeParse({
        billingAddress: values.billingAddress ?? "",
        billingPostalCode: values.billingPostalCode ?? "",
        billingCountry: values.billingCountry ?? "",
      });
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          context.addIssue({ code: "custom", path: issue.path, message: issue.message }),
        );
      }
    });
}

export const profileFormSchema = createProfileFormSchema();

export function createPasswordFormSchema(t: ValidationTranslator = defaultValidationTranslator) {
  return z
    .object({
      currentPassword: z.string().min(8, t("currentPasswordMinLength")),
      newPassword: z.string().min(8, t("newPasswordMinLength")),
      confirmPassword: z.string().min(8, t("newPasswordConfirmation")),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

export const passwordFormSchema = createPasswordFormSchema();

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
