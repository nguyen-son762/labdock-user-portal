export function isOrderAwaitingPayment(status: string): boolean {
  return ["awaitingpayment", "pendingpayment"].includes(
    status
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, ""),
  );
}
