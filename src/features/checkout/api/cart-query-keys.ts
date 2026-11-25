export const cartQueryKeys = {
  all: ["cart"] as const,
  detail: () => [...cartQueryKeys.all, "detail"] as const,
  quote: (lineSignature: string[]) => [...cartQueryKeys.all, "quote", lineSignature] as const,
};
