import callingCodeData from "./calling-codes.json";
import countryData from "./countries.json";
import flagData from "./flag.json";

const callingCodeByCountry = new Map(callingCodeData.map(({ countryCode, dialCode }) => [countryCode, dialCode]));
// The supplied codes include duplicates and missing values. Regional indicator
// filenames identify the flag reliably, including Angola, both Congos and Iran.
const flagByCountry = new Map(
  flagData.flatMap(({ flag, country }) => {
    const match = flag.match(/\/([a-f0-9]+)-([a-f0-9]+)\.svg$/i);
    if (!match) return [];
    const code = match
      .slice(1)
      .map((part) => String.fromCharCode(parseInt(part, 16) - 0x1f1e6 + 65))
      .join("");
    return [[code, { flag, name: country }] as const];
  }),
);

export const countries = countryData
  .map(({ code, name }) => ({
    code,
    name: flagByCountry.get(code)?.name ?? name,
    aliases: [name],
    flag: flagByCountry.get(code)?.flag,
    dialCode: callingCodeByCountry.get(code) ?? "",
  }))
  .sort((left, right) => left.name.localeCompare(right.name, "en"));

export type Country = (typeof countries)[number];

export function findCountry(code: string): Country | undefined {
  const normalized = code.trim().toUpperCase();
  return countries.find((country) => country.code === normalized);
}

export function resolveCountryCode(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  return countries.find(({ code, name, aliases }) =>
    [code, name, ...aliases].some((candidate) => candidate.toLowerCase() === normalized),
  )?.code;
}

export function getCountryCallingCode(value: string): string {
  const countryCode = resolveCountryCode(value);
  return countries.find(({ code }) => code === countryCode)?.dialCode ?? "";
}

/** Returns the display name for an ISO 3166-1 alpha-2 code, or the input when it is not a known code. */
export function getCountryName(value: string): string {
  return findCountry(value)?.name ?? value;
}
