import axios from "axios";
import { z } from "zod";

/** Problem codes the order payment endpoints return in `title` (`application/problem+json`). */
export const ORDER_PAYMENT_ERROR_CODES = [
  "transfer_already_confirmed",
  "order_status_changed",
  "payment_expired",
  "invalid_payment_status",
  "payment_not_cancellable",
] as const;

export type OrderPaymentErrorCode = (typeof ORDER_PAYMENT_ERROR_CODES)[number];

const problemSchema = z.object({ title: z.enum(ORDER_PAYMENT_ERROR_CODES) });

export function getOrderPaymentErrorCode(error: unknown): OrderPaymentErrorCode | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const problem = problemSchema.safeParse(error.response?.data);
  return problem.success ? problem.data.title : undefined;
}
