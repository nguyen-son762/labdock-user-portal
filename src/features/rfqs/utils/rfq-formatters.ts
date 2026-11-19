const currencyFormatter = new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" });
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatRfqCurrency(value: number, currency?: string | null) {
  if (!currency || currency.toUpperCase() === "SGD") return currencyFormatter.format(value);
  try {
    return new Intl.NumberFormat("en-SG", { style: "currency", currency }).format(value);
  } catch {
    return `${currencyFormatter.format(value).replace(/^\D+/, "")} ${currency}`;
  }
}

export function formatRfqDate(value: string) {
  return dateFormatter.format(new Date(value));
}
