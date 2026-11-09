import { z } from "zod";

const text = z
  .string()
  .trim()
  .nullish()
  .transform((value) => value ?? "");
const snapshotSchema = z.object({
  recipientName: text,
  companyName: text,
  phone: text,
  addressLine1: text,
  addressLine2: text,
  city: text,
  postalCode: text,
  country: text,
});

export function parseOrderDeliveryAddress(snapshot: string) {
  try {
    const result = snapshotSchema.safeParse(JSON.parse(snapshot));
    if (!result.success) return null;
    const address = result.data;
    return {
      recipient: [address.recipientName, address.companyName].filter(Boolean).join(" • "),
      address: [address.addressLine1, address.addressLine2, address.city, address.postalCode, address.country]
        .filter(Boolean)
        .join(", "),
      phone: address.phone,
    };
  } catch {
    return null;
  }
}
