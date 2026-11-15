import { httpClient } from "@/lib/http-client";
import { rfqDetailSchema } from "@/features/rfqs/schemas/rfq.schema";

import {
  contactSubmissionSchema,
  submitContactInputSchema,
  type ContactFormValues,
  type ContactSubmission,
  type SubmitContactInput,
} from "../schemas/contact.schema";

const MOCK_DELAY_MS = 550;

export const contactService = {
  async submit(input: SubmitContactInput): Promise<ContactSubmission> {
    const parsed = submitContactInputSchema.parse(input);
    if (parsed.contact.inquiryType === "quote") return submitQuote(parsed.contact);

    await new Promise((resolve) => globalThis.setTimeout(resolve, MOCK_DELAY_MS));
    return contactSubmissionSchema.parse({
      reference: `MSG-${parsed.idempotencyKey.slice(0, 8).toUpperCase()}`,
      status: "submitted",
    });
  },
};

async function submitQuote(contact: ContactFormValues): Promise<ContactSubmission> {
  const response = await httpClient.post<unknown>("/rfqs/external-handoff", {
    email: contact.email,
    fullName: contact.fullName,
    organization: contact.company,
    items: contact.products.map((product, index) => ({
      variantId: product.variantId,
      quantity: Number(product.quantity),
      specNote: buildSpecNote(product, index === 0 ? contact.message : ""),
    })),
  });
  const rfq = rfqDetailSchema.parse(response.data);
  return contactSubmissionSchema.parse({ reference: rfq.rfqNumber, status: "submitted" });
}

// The handoff API has no budget or message field, so they travel in the item spec note.
function buildSpecNote(product: ContactFormValues["products"][number], message: string) {
  return [product.budgetRange ? `Budget range: ${product.budgetRange}` : "", message ? `Message: ${message}` : ""]
    .filter(Boolean)
    .join("\n");
}
