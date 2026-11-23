import { createTranslator } from "next-intl";

import { Validation as validationMessages } from "../../messages/en.json";

export type ValidationTranslator = (
  key: keyof typeof validationMessages,
  values?: Record<string, string | number>,
) => string;

// Service validation and existing consumers keep English defaults; forms supply their active locale.
export const defaultValidationTranslator: ValidationTranslator = createTranslator({
  locale: "en",
  messages: { Validation: validationMessages },
  namespace: "Validation",
});
