import { getLegalDocument, privacyDocument, termsDocument } from "./legal.data";

describe("localized legal documents", () => {
  it.each([
    ["terms", termsDocument, "Điều khoản và điều kiện"],
    ["privacy", privacyDocument, "Chính sách bảo mật"],
  ] as const)("BP-ND-03 translates the full %s document while preserving its structure", (kind, english, title) => {
    const vietnamese = getLegalDocument(kind, "vi");
    expect(getLegalDocument(kind, "en")).toBe(english);
    expect(vietnamese.title).toBe(title);
    expect(vietnamese.sections).toHaveLength(english.sections.length);
    vietnamese.sections.forEach((section, index) => {
      const original = english.sections[index];
      expect(section.title).not.toBe(original?.title);
      for (const field of ["paragraphs", "list", "closing"] as const) {
        expect(section[field]?.length).toBe(original?.[field]?.length);
        section[field]?.forEach((paragraph, paragraphIndex) => {
          expect(paragraph.trim()).not.toBe("");
          expect(paragraph).not.toBe(original?.[field]?.[paragraphIndex]);
        });
      }
    });
  });
});
