import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { privacyDocument, termsDocument } from "../legal.data";
import { LegalDocumentScreen } from "./legal-document-screen";

describe("LegalDocumentScreen", () => {
  it("renders all Terms and Conditions sections with a single page heading", () => {
    renderWithProviders(<LegalDocumentScreen document={termsDocument} />);

    expect(screen.getByRole("heading", { level: 1, name: "Terms and conditions" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(14);
    expect(screen.getByRole("heading", { name: "Entire Agreement" })).toBeInTheDocument();
    expect(screen.getByText("14.")).toBeInTheDocument();
  });

  it("renders Privacy Policy lists as accessible lists", () => {
    renderWithProviders(<LegalDocumentScreen document={privacyDocument} />);

    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(11);
    expect(screen.getByRole("list", { name: "User Rights" })).toBeInTheDocument();
  });
});
