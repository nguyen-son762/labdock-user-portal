import { describe, expect, it } from "vitest";

import callingCodeData from "./calling-codes.json";
import countryData from "./countries.json";
import { countries, getCountryCallingCode, getCountryName, resolveCountryCode } from "./country-options";
import flagData from "./flag.json";

describe("country data", () => {
  it("contains a complete ISO country list with a calling code for every entry", () => {
    expect(countryData).toHaveLength(249);
    expect(new Set(countryData.map((country) => country.code)).size).toBe(countryData.length);
    expect(callingCodeData).toHaveLength(countryData.length);
    expect(new Set(callingCodeData.map((country) => country.countryCode))).toEqual(
      new Set(countryData.map((country) => country.code)),
    );
    expect(
      callingCodeData.every(
        ({ countryCode, countryName, dialCode }) =>
          countryCode.length === 2 && countryName.length > 0 && /^\+\d+$/.test(dialCode),
      ),
    ).toBe(true);
  });

  it("includes the default Singapore and Vietnam calling codes", () => {
    expect(callingCodeData.find((entry) => entry.countryCode === "SG")?.dialCode).toBe("+65");
    expect(callingCodeData.find((entry) => entry.countryCode === "VN")?.dialCode).toBe("+84");
  });

  it("provides a matching flag from flag.json for all 249 ISO countries", () => {
    expect(countries).toHaveLength(249);
    for (const country of countries) {
      const filename = [...country.code].map((letter) => (letter.charCodeAt(0) - 65 + 0x1f1e6).toString(16)).join("-");
      expect(country.flag).toBe(`https://twemoji.maxcdn.com/2/svg/${filename}.svg`);
      expect(flagData.some((flag) => flag.flag === country.flag && flag.country === country.name)).toBe(true);
    }
  });

  it("keeps the ISO identity and calling code when supplied flag codes are incorrect or missing", () => {
    for (const code of ["AD", "AO", "BQ", "CD", "CG", "IR", "RS", "SH"]) {
      const country = countries.find((entry) => entry.code === code);
      expect(country).toBeDefined();
      expect(resolveCountryCode(country?.name ?? "")).toBe(code);
      expect(getCountryCallingCode(code)).toBe(callingCodeData.find((entry) => entry.countryCode === code)?.dialCode);
    }
  });

  it("resolves existing stored names as well as case-insensitive ISO codes", () => {
    expect(resolveCountryCode(" sg ")).toBe("SG");
    expect(resolveCountryCode("Singapore")).toBe("SG");
    expect(resolveCountryCode("Bonaire, Sint Eustatius and Saba")).toBe("BQ");
    expect(resolveCountryCode("Congo, Democratic Republic of the")).toBe("CD");
    expect(resolveCountryCode("not a country")).toBeUndefined();
  });

  it("resolves display names from ISO codes and keeps unknown values unchanged", () => {
    expect(getCountryName("SG")).toBe("Singapore");
    expect(getCountryName("de")).toBe("Germany");
    expect(getCountryName("Atlantis")).toBe("Atlantis");
  });
});
