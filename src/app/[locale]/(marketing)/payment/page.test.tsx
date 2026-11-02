import PaymentPage from "./page";
import PaymentSuccessPage from "./success/page";

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  redirect: () => {
    throw new Error("Redirect /checkout");
  },
}));
const valid = { orderId: "11111111-1111-1111-1111-111111111111" };
describe("Payment routes", () => {
  it("opens the bank transfer screen for the checkout order", async () => {
    const result = await PaymentPage({ searchParams: Promise.resolve(valid) });
    expect(result.props).toEqual(valid);
  });
  it.each([undefined, "", "invalid", "OR-3000"])("rejects malformed order ID %s", async (orderId) => {
    await expect(PaymentPage({ searchParams: Promise.resolve({ orderId }) })).rejects.toThrow("Redirect /checkout");
  });
  it("opens the success screen for the real checkout order ID", async () => {
    const result = await PaymentSuccessPage({ searchParams: Promise.resolve(valid) });
    expect(result.props).toEqual(valid);
  });
  it.each([undefined, "", "invalid", "OR-3000"])("rejects malformed success order ID %s", async (orderId) => {
    await expect(PaymentSuccessPage({ searchParams: Promise.resolve({ orderId }) })).rejects.toThrow(
      "Redirect /checkout",
    );
  });
});
