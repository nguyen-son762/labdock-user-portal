import { describe, expect, it } from "vitest";

import { parseOrderDeliveryAddress } from "./parse-order-delivery-address";

describe("order delivery snapshot", () => {
  it("maps the documented shipping fields into readable address lines", () => {
    expect(
      parseOrderDeliveryAddress(
        JSON.stringify({
          recipientName: "Buyer",
          companyName: "Example Lab",
          addressLine1: "1 Test Street",
          addressLine2: "Unit 02",
          city: "Singapore",
          postalCode: "123456",
          country: "SG",
          phone: "+6512345678",
          ignored: "private value",
        }),
      ),
    ).toEqual({
      recipient: "Buyer • Example Lab",
      address: "1 Test Street, Unit 02, Singapore, 123456, SG",
      phone: "+6512345678",
    });
  });
  it.each(["invalid-json", "null", "[]", '{"phone":123}'])(
    "does not render raw invalid shipping data: %s",
    (snapshot) => {
      expect(parseOrderDeliveryAddress(snapshot)).toBeNull();
    },
  );
});
