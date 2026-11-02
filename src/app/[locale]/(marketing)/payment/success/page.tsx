import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { paymentOrderIdSchema, PaymentSuccessScreen } from "@/features/checkout";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RouteMetadata");
  return { title: t("paymentSuccess"), robots: { index: false, follow: false } };
}

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const params = await searchParams;
  const orderId = paymentOrderIdSchema.safeParse(params.orderId);
  if (!orderId.success) redirect("/checkout");

  return <PaymentSuccessScreen orderId={orderId.data} />;
}
