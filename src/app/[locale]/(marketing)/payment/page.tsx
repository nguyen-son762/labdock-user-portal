import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { paymentOrderIdSchema, PaymentScreen } from "@/features/checkout";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RouteMetadata");
  return { title: t("payment"), robots: { index: false, follow: false } };
}

type PaymentPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const orderId = paymentOrderIdSchema.safeParse(params.orderId);
  if (!orderId.success) redirect("/checkout");

  return <PaymentScreen orderId={orderId.data} />;
}
