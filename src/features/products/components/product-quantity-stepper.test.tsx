import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ProductQuantityStepper } from "./product-quantity-stepper";

function Harness({ max = 10, initial = 1 }: { max?: number; initial?: number }) {
  const [quantity, setQuantity] = useState(initial);
  return (
    <>
      <ProductQuantityStepper value={quantity} max={max} disabled={false} onChange={setQuantity} />
      <span data-testid="committed">{quantity}</span>
    </>
  );
}

describe("ProductQuantityStepper", () => {
  it("accepts a typed quantity and commits it on Enter", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    const input = screen.getByRole("textbox", { name: "Quantity" });

    await user.clear(input);
    await user.type(input, "7{Enter}");

    expect(input).toHaveValue("7");
    expect(screen.getByTestId("committed")).toHaveTextContent("7");
  });

  it("reports values above stock so the caller can explain the limit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness max={5} initial={3} />);
    const input = screen.getByRole("textbox", { name: "Quantity" });

    await user.clear(input);
    await user.type(input, "9");
    expect(input).toHaveValue("9");
    expect(screen.getByTestId("committed")).toHaveTextContent("9");
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(screen.getByTestId("committed")).toHaveTextContent("5");
  });

  it("restores 1 when the field is left empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness max={5} initial={3} />);
    const input = screen.getByRole("textbox", { name: "Quantity" });

    await user.clear(input);
    expect(input).toHaveValue("");
    await user.tab();
    expect(input).toHaveValue("1");
    expect(screen.getByTestId("committed")).toHaveTextContent("1");
  });

  it("keeps the +/- buttons working within 1..max", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness max={2} />);
    const decrease = screen.getByRole("button", { name: "Decrease quantity" });
    const increase = screen.getByRole("button", { name: "Increase quantity" });

    expect(decrease).toBeDisabled();
    await user.click(increase);
    expect(screen.getByRole("textbox", { name: "Quantity" })).toHaveValue("2");
    expect(increase).toBeDisabled();
    await user.click(decrease);
    expect(screen.getByTestId("committed")).toHaveTextContent("1");
  });
});
