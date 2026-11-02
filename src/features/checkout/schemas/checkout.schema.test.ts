import { describe, expect, it } from "vitest";

import { checkoutSchema } from "./checkout.schema";

const validCheckout = {
  fullName: "Sarah Chen",
  email: "sarah_chen@biogenix.com.sg",
  phone: "+65 88009900",
  companyName: "Biogenix Pte Ltd",
  address: "745 Lor. 5 Toa Payoh, Singapore",
  city: "Singapore",
  postalCode: "319455",
  country: "Singapore",
  billingSameAsDelivery: true,
  billingAddress: "",
  billingPostalCode: "",
  paymentMethod: "bank-transfer" as const,
};

describe("checkoutSchema", () => {
  it("accepts the designed checkout values", () => {
    expect(checkoutSchema.safeParse(validCheckout).success).toBe(true);
  });

  it("requires billing fields when billing differs from delivery", () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, billingSameAsDelivery: false });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.billingAddress).toBeDefined();
  });
});
