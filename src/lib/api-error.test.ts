import axios from "axios";
import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";

import en from "../../messages/en.json";
import vi from "../../messages/vi.json";

import { getApiErrorMessage } from "./api-error";

describe.each([
  ["en", en],
  ["vi", vi],
] as const)("getApiErrorMessage (%s)", (locale, messages) => {
  const t = createTranslator({ locale, messages, namespace: "ApiErrors" });
  it("reads RFC problem details returned by the authentication API", () => {
    const error = new axios.AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
      data: { title: "invalid_credentials", detail: "Invalid email or password." },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    });

    expect(getApiErrorMessage(error, t)).toBe("Invalid email or password.");
  });
  it("SYS-019 hides internal messages and details from server failures", () => {
    const error = new axios.AxiosError("Internal server error", "ERR_BAD_RESPONSE", undefined, undefined, {
      data: { message: "database_password=synthetic-secret", detail: "Internal stack trace" },
      status: 500,
      statusText: "Server error",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    });
    expect(getApiErrorMessage(error, t)).toBe(messages.ApiErrors.unavailable);
  });

  it.each([
    [400, "badRequest"],
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "notFound"],
    [409, "conflict"],
    [429, "tooManyRequests"],
  ] as const)("SYS-018 uses the fallback for status %s", (status, expected) => {
    const error = new axios.AxiosError("failure", "ERR_BAD_REQUEST", undefined, undefined, {
      data: {},
      status,
      statusText: "failure",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    });
    expect(getApiErrorMessage(error, t)).toBe(messages.ApiErrors[expected]);
  });
  it("SYS-018 prefers a public message to detail and handles opaque failures", () => {
    const error = new axios.AxiosError("failure", "ERR_BAD_REQUEST", undefined, undefined, {
      data: { message: "Message", detail: "Detail" },
      status: 400,
      statusText: "failure",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    });
    expect(getApiErrorMessage(error, t)).toBe("Message");
    expect(getApiErrorMessage(new Error("private error"), t)).toBe(messages.ApiErrors.unknown);
    expect(getApiErrorMessage(new axios.CanceledError(), t)).toBe(messages.ApiErrors.canceled);
    expect(getApiErrorMessage(new axios.AxiosError("network"), t)).toBe(messages.ApiErrors.unavailable);
  });
});
