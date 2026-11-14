export function isOrderAwaitingPayment(status: string): boolean {
  return ["awaitingpayment", "pendingpayment"].includes(
    status
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, ""),
  );
}

/** The buyer reported the transfer and is waiting for an admin to confirm it. */
export function isOrderPaymentSubmitted(status: string): boolean {
  return (
    status
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "") === "paymentsubmitted"
  );
}
