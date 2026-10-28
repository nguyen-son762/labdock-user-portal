import axios from "axios";
import { z } from "zod";

const apiErrorPayloadSchema = z.object({
  message: z.string().min(1).optional(),
  detail: z.string().min(1).optional(),
});

type ApiErrorStatusMessageKey =
  "badRequest" | "unauthorized" | "forbidden" | "notFound" | "conflict" | "tooManyRequests";

const statusMessageKeys: Readonly<Partial<Record<number, ApiErrorStatusMessageKey>>> = {
  400: "badRequest",
  401: "unauthorized",
  403: "forbidden",
  404: "notFound",
  409: "conflict",
  429: "tooManyRequests",
};

type ApiErrorMessageKey = ApiErrorStatusMessageKey | "unknown" | "canceled" | "unavailable";

export function getApiErrorMessage(error: unknown, translate: (key: ApiErrorMessageKey) => string): string {
  if (!axios.isAxiosError(error)) {
    return translate("unknown");
  }

  const payload = apiErrorPayloadSchema.safeParse(error.response?.data);
  const status = error.response?.status;

  if (payload.success && payload.data.message && status !== undefined && status < 500) {
    return payload.data.message;
  }

  if (payload.success && payload.data.detail && status !== undefined && status < 500) {
    return payload.data.detail;
  }

  const statusMessageKey = status === undefined ? undefined : statusMessageKeys[status];
  if (statusMessageKey) {
    return translate(statusMessageKey);
  }

  if (error.code === "ERR_CANCELED") {
    return translate("canceled");
  }

  return translate("unavailable");
}
