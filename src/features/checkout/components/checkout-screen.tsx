"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft2 } from "iconsax-reactjs";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { getCountryCallingCode, resolveCountryCode } from "@/constants/country-options";
import { useCurrentUserQuery } from "@/features/profile";

import { useCartQuery } from "../api/use-cart-query";
import { useCreateCheckoutMutation } from "../api/use-create-checkout-mutation";
import { calculateOrderTotals } from "../data/checkout-data";
import { checkoutSchema, type CheckoutFormValues } from "../schemas/checkout.schema";
import { getNationalPhone } from "../utils/national-phone";
import { DeliveryAddressFields } from "./address-fields";
import { BillingSection } from "./billing-section";
import { CheckoutItems } from "./checkout-items";
import { OrderSummary } from "./order-summary";
import { PaymentMethodSection } from "./payment-method-section";
import { EmptyCartScreen } from "./empty-cart-screen";

export function CheckoutScreen({ initialItemIds }: { initialItemIds?: string[] }) {
  const tHeader = useTranslations("Header");
  const t = useTranslations("Checkout");
  const cartQuery = useCartQuery();
  const profileQuery = useCurrentUserQuery();
  const checkoutMutation = useCreateCheckoutMutation();
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
      address: "",
      city: "",
      notes: "",
      postalCode: "",
      country: "SG",
      billingSameAsDelivery: true,
      billingAddress: "",
      billingPostalCode: "",
      paymentMethod: "paynow",
    },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    const user = profileQuery.data;
    if (!user || isDirty) return;

    const country = resolveCountryCode(user.country) ?? "SG";
    const callingCode = getCountryCallingCode(country);
    const phone = user.phone.trim();
    const nationalPhone = getNationalPhone(phone, callingCode);

    form.reset({
      fullName: user.fullName,
      email: user.email,
      phone: [callingCode, nationalPhone].filter(Boolean).join(" "),
      companyName: user.companyName,
      address: user.deliveryAddress,
      city: "",
      notes: "",
      postalCode: user.postalCode,
      country,
      billingSameAsDelivery: user.billingSameAsDelivery,
      billingAddress: user.billingAddress.address,
      billingPostalCode: user.billingAddress.postalCode,
      paymentMethod: "paynow",
    });
  }, [form, isDirty, profileQuery.data]);
  const cartItems = cartQuery.data ?? [];
  const items = initialItemIds?.length ? cartItems.filter((item) => initialItemIds.includes(item.id)) : cartItems;
  const orderTotals = calculateOrderTotals(items);

  function handleCheckout(values: CheckoutFormValues): void {
    if (checkoutMutation.isPending) return;
    checkoutMutation.mutate(
      { checkout: values, items },
      {
        onSuccess: (session) => {
          window.location.assign(session.checkoutUrl);
        },
      },
    );
  }

  if (cartQuery.isPending) {
    return (
      <div className="container min-h-[675px] py-10">
        <Skeleton className="h-[560px] w-full rounded-xl" />
      </div>
    );
  }

  if (cartQuery.isSuccess && items.length === 0) return <EmptyCartScreen />;

  return (
    <div className="bg-[#f5f8fb] py-10">
      <div className="container">
        <Breadcrumbs
          items={[{ label: tHeader("home"), href: "/" }, { label: t("cart"), href: "/cart" }, { label: t("checkout") }]}
        />
        <h1 className="mt-3 text-3xl font-semibold text-[#164990]">{t("checkout")}</h1>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded text-xs text-[#164990] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
        >
          <ArrowLeft2 className="size-4" aria-hidden="true" /> {t("backToProducts")}
        </Link>
        <Form {...form}>
          <form
            id="checkout-form"
            noValidate
            onSubmit={form.handleSubmit(handleCheckout)}
            className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,0.95fr)]"
          >
            <div className="space-y-4">
              {checkoutMutation.isError ? <Alert>{t("preparePaymentError")}</Alert> : null}
              {cartQuery.isError ? <Alert>{t("returnToCartError")}</Alert> : null}
              <CheckoutItems items={items} />
              <DeliveryAddressFields form={form} />
              <BillingSection form={form} />
              <PaymentMethodSection form={form} />
            </div>
            <OrderSummary totals={orderTotals} pending={checkoutMutation.isPending} currency={items[0]?.currency} />
          </form>
        </Form>
      </div>
    </div>
  );
}
