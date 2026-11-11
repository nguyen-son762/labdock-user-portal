import { z } from "zod";

export type LoginValidationMessages = {
  emailRequired: string;
  emailInvalid: string;
  passwordMinLength: string;
  passwordMaxLength: string;
};

export function createLoginSchema(messages: LoginValidationMessages) {
  return z.object({
    email: z.string().trim().min(1, messages.emailRequired).email(messages.emailInvalid),
    password: z
      .string()
      .min(8, messages.passwordMinLength)
      .max(128, messages.passwordMaxLength),
  });
}

export const loginSchema = createLoginSchema({
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  passwordMinLength: "Password must be at least 8 characters.",
  passwordMaxLength: "Password must be no more than 128 characters.",
});

export type LoginValues = z.infer<typeof loginSchema>;
