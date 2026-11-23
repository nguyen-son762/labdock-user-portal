import { screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import { renderWithProviders } from "@/test/render-with-providers";

import type { CheckoutFormValues } from "../schemas/checkout.schema";
import { PaymentMethodSection } from "./payment-method-section";

function PaymentForm() {
  const form = useForm<CheckoutFormValues>({ defaultValues: { paymentMethod: "bank-transfer" } });
  return (
    <Form {...form}>
      <PaymentMethodSection form={form} />
    </Form>
  );
}

it.each([
  { locale: "vi" as const, label: "Chuyển khoản ngân hàng" },
  { locale: "en" as const, label: "Bank transfer" },
])("uses $locale for the payment method name", ({ locale, label }) => {
  renderWithProviders(<PaymentForm />, { locale });
  expect(screen.getByRole("radio", { name: label })).toBeChecked();
});
