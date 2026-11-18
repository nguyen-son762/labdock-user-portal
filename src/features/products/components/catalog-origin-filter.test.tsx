import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { CatalogOriginFilter } from "./catalog-origin-filter";

describe("CatalogOriginFilter", () => {
  it("reveals more origins and searches the entire API list without changing selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <CatalogOriginFilter
        origins={["SG", "DE", "IT", "JP", "VN", "US"]}
        selectedOrigins={["SG"]}
        disabled={false}
        hasError={false}
        onChange={onChange}
      />,
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    const more = screen.getByRole("button", { name: "See more" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await user.click(more);
    expect(screen.getAllByRole("checkbox")).toHaveLength(6);
    await user.click(screen.getByRole("button", { name: "See less" }));
    await user.type(screen.getByRole("textbox", { name: "Search origins" }), "united");
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: "United States" })).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("checkbox", { name: "United States" }));
    expect(onChange).toHaveBeenCalledWith(["SG", "US"]);
    await user.clear(screen.getByRole("textbox", { name: "Search origins" }));
    await user.type(screen.getByRole("textbox", { name: "Search origins" }), "de");
    expect(screen.getByRole("checkbox", { name: "Germany" })).toBeInTheDocument();
  });

  it("shows an empty search result and retains a keyboard-operable checkbox", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <CatalogOriginFilter
        origins={["SG"]}
        selectedOrigins={[]}
        disabled={false}
        hasError={false}
        onChange={onChange}
      />,
    );
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Singapore" })).toHaveFocus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(["SG"]);
    await user.type(screen.getByRole("textbox", { name: "Search origins" }), "unknown");
    expect(screen.getByRole("status")).toHaveTextContent("No matching origins");
  });

  it("collapses and reopens from the keyboard without clearing selected origins", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <CatalogOriginFilter
        origins={["SG"]}
        selectedOrigins={["SG"]}
        disabled={false}
        hasError={false}
        onChange={onChange}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Origin" });
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("checkbox", { name: "Singapore" })).not.toBeInTheDocument();
    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("checkbox", { name: "Singapore" })).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reports an empty API list and disables controls during navigation", () => {
    const { rerender } = renderWithProviders(
      <CatalogOriginFilter origins={[]} selectedOrigins={[]} disabled={false} hasError={false} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("No origins available");
    rerender(
      <CatalogOriginFilter origins={["SG"]} selectedOrigins={[]} disabled hasError={false} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("checkbox", { name: "Singapore" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Search origins" })).toBeDisabled();
  });
});
