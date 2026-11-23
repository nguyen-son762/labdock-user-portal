import { createTranslator } from "next-intl";
import type { z } from "zod";

import {
  createForgotPasswordResetSchema,
  createForgotPasswordVerificationSchema,
} from "@/features/auth/schemas/forgot-password.schema";
import {
  createPasswordSchema,
  createSignupSchema,
  createVerificationSchema,
} from "@/features/auth/schemas/signup.schema";
import { createCheckoutSchema } from "@/features/checkout/schemas/checkout.schema";
import { createQuoteContactSchema } from "@/features/checkout/schemas/quote.schema";
import { createContactFormSchema } from "@/features/contact/schemas/contact.schema";
import { createPasswordFormSchema, createProfileFormSchema } from "@/features/profile/schemas/profile-form.schema";
import { profileFixture } from "@/features/profile/test/profile-fixture";

import en from "../../messages/en.json";
import viMessages from "../../messages/vi.json";

function expectIssue(schema: z.ZodType, input: unknown, path: (string | number)[], message: string) {
  const result = schema.safeParse(input);
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error.issues).toContainEqual(expect.objectContaining({ path, message }));
}

describe.each([
  { locale: "en" as const, messages: en },
  { locale: "vi" as const, messages: viMessages },
])("$locale validation messages", ({ locale, messages }) => {
  const t = createTranslator({ locale, messages, namespace: "Validation" });

  it("translates both OTP schemas and password confirmation rules", () => {
    for (const schema of [createVerificationSchema(t), createForgotPasswordVerificationSchema(t)]) {
      expectIssue(schema, { code: "12a" }, ["code"], t("verificationCodeInvalid"));
    }
    expectIssue(
      createForgotPasswordResetSchema(t),
      { newPassword: "new-password", confirmPassword: "different-password" },
      ["confirmPassword"],
      t("passwordsMismatch"),
    );
    expectIssue(
      createPasswordSchema(t),
      { password: "new-password", confirmPassword: "different-password" },
      ["confirmPassword"],
      t("passwordsMismatch"),
    );
  });

  it("translates signup required fields", () => {
    expectIssue(
      createSignupSchema(t),
      { company: "", fullName: "", email: "", phoneCode: "", phone: "", country: "", region: "", address: "" },
      ["fullName"],
      t("signupFullNameRequired"),
    );
  });

  it("translates checkout billing refinements and company length limits", () => {
    const input = {
      fullName: "QA Tester",
      email: "qa@example.test",
      phone: "+65 88009900",
      companyName: "A".repeat(101),
      address: "123 Test Street",
      city: "Singapore",
      country: "SG",
      billingSameAsDelivery: false,
      billingAddress: "",
      billingPostalCode: "",
      paymentMethod: "bank-transfer",
    };
    const schema = createCheckoutSchema(t);
    expectIssue(schema, input, ["billingAddress"], t("billingAddressRequired"));
    expectIssue(schema, input, ["billingPostalCode"], t("billingPostalCodeInvalid"));
    expectIssue(schema, input, ["companyName"], t("companyMaxLength", { max: 100 }));
  });

  it("translates quote contact validation", () => {
    expectIssue(
      createQuoteContactSchema(t),
      { fullName: "", phoneCountry: "", phone: "", email: "", region: "" },
      ["phone"],
      t("phoneInvalid"),
    );
  });

  it.each([
    { field: "fullName", max: 80, key: "fullNameMaxLength" },
    { field: "phone", max: 20, key: "phoneMaxLength" },
    { field: "companyName", max: 120, key: "companyMaxLength" },
    { field: "companyPhone", max: 20, key: "companyPhoneMaxLength" },
    { field: "businessRegistrationNumber", max: 40, key: "businessRegistrationMaxLength" },
    { field: "deliveryAddress", max: 200, key: "deliveryAddressMaxLength" },
    { field: "postalCode", max: 12, key: "postalCodeMaxLength" },
  ] as const)("translates profile $field length errors", ({ field, max, key }) => {
    expectIssue(
      createProfileFormSchema(t),
      { ...profileFixture, [field]: "A".repeat(max + 1) },
      [field],
      t(key, { max }),
    );
  });

  it("translates profile password confirmation", () => {
    expectIssue(
      createPasswordFormSchema(t),
      { currentPassword: "current-password", newPassword: "new-password", confirmPassword: "different-password" },
      ["confirmPassword"],
      t("passwordsMismatch"),
    );
  });

  it("translates nested contact errors and product collection errors", () => {
    const schema = createContactFormSchema(t);
    const input = {
      inquiryType: "quote",
      fullName: "QA Tester",
      email: "qa@example.test",
      phoneCountry: "65",
      phone: "88009900",
      company: "",
      subject: "",
      message: "",
      products: [
        { productName: "Product", productId: "", slug: "", variantId: "", brand: "", quantity: "0", budgetRange: "" },
      ],
    };
    expectIssue(schema, input, ["products", 0, "productName"], t("productSelectionRequired"));
    expectIssue(schema, input, ["products", 0, "quantity"], t("quantityInvalid"));
    expectIssue(schema, { ...input, products: [] }, ["products"], t("productRequired"));
    expectIssue(schema, { ...input, message: "A".repeat(2001) }, ["message"], t("messageMaxLength", { max: 2000 }));
  });
});

it("keeps Vietnamese and English schemas isolated", () => {
  const vi = createTranslator({ locale: "vi", messages: viMessages, namespace: "Validation" });
  const vietnamese = createForgotPasswordVerificationSchema(vi);
  const english = createForgotPasswordVerificationSchema();
  expectIssue(vietnamese, { code: "" }, ["code"], "Vui lòng nhập mã xác minh gồm 6 chữ số.");
  expectIssue(english, { code: "" }, ["code"], "Enter the 6-digit verification code.");
});
