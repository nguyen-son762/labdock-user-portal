import { describe, expect, it } from "vitest";

import { isOrderAwaitingPayment } from "./is-order-awaiting-payment";

describe("isOrderAwaitingPayment", () => {
  it.each([
    "AwaitingPayment",
    " awaiting payment ",
    "AWAITING_PAYMENT",
    "awaiting-payment",
    "PendingPayment",
    "pending payment",
  ])("accepts %s", (status) => {
    expect(isOrderAwaitingPayment(status)).toBe(true);
  });
  it.each(["Paid", "Shipped", "Delivered", "Cancelled", "Draft", "New", "Processing", "Unknown"])(
    "does not start a payment timer for %s",
    (status) => {
      expect(isOrderAwaitingPayment(status)).toBe(false);
    },
  );
});
