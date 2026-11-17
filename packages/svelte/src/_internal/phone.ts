export type DialCountry = {
  iso: string;
  dial: string;
  name: string;
};

export const DIAL_COUNTRIES: readonly DialCountry[] = [
  { iso: "AU", dial: "61", name: "Australia" },
  { iso: "NZ", dial: "64", name: "New Zealand" },
  { iso: "PH", dial: "63", name: "Philippines" },
  { iso: "US", dial: "1", name: "United States" },
  { iso: "CA", dial: "1", name: "Canada" },
  { iso: "GB", dial: "44", name: "United Kingdom" },
  { iso: "IE", dial: "353", name: "Ireland" },
  { iso: "SG", dial: "65", name: "Singapore" },
  { iso: "MY", dial: "60", name: "Malaysia" },
  { iso: "ID", dial: "62", name: "Indonesia" },
  { iso: "IN", dial: "91", name: "India" },
  { iso: "CN", dial: "86", name: "China" },
  { iso: "JP", dial: "81", name: "Japan" },
  { iso: "KR", dial: "82", name: "South Korea" },
  { iso: "HK", dial: "852", name: "Hong Kong" },
  { iso: "TW", dial: "886", name: "Taiwan" },
  { iso: "TH", dial: "66", name: "Thailand" },
  { iso: "VN", dial: "84", name: "Vietnam" },
  { iso: "DE", dial: "49", name: "Germany" },
  { iso: "FR", dial: "33", name: "France" },
  { iso: "ES", dial: "34", name: "Spain" },
  { iso: "IT", dial: "39", name: "Italy" },
  { iso: "NL", dial: "31", name: "Netherlands" },
  { iso: "BE", dial: "32", name: "Belgium" },
  { iso: "CH", dial: "41", name: "Switzerland" },
  { iso: "AT", dial: "43", name: "Austria" },
  { iso: "SE", dial: "46", name: "Sweden" },
  { iso: "NO", dial: "47", name: "Norway" },
  { iso: "DK", dial: "45", name: "Denmark" },
  { iso: "FI", dial: "358", name: "Finland" },
  { iso: "PL", dial: "48", name: "Poland" },
  { iso: "PT", dial: "351", name: "Portugal" },
  { iso: "BR", dial: "55", name: "Brazil" },
  { iso: "MX", dial: "52", name: "Mexico" },
  { iso: "ZA", dial: "27", name: "South Africa" },
  { iso: "AE", dial: "971", name: "United Arab Emirates" },
  { iso: "SA", dial: "966", name: "Saudi Arabia" },
  { iso: "IL", dial: "972", name: "Israel" },
];

const PHONE_MIN = 8;

export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function dialLabel(country: DialCountry): string {
  return `${country.iso} +${country.dial}`;
}

export function countryFor(iso: string, countries: readonly DialCountry[] = DIAL_COUNTRIES): DialCountry {
  return countries.find((country) => country.iso === iso) ?? countries[0];
}

export function joinPhone(dial: string, national: string): string {
  const local = digitsOnly(national).replace(/^0+/, "");
  return local ? `${digitsOnly(dial)}${local}` : "";
}

export function splitPhone(
  stored: string | null | undefined,
  countries: readonly DialCountry[] = DIAL_COUNTRIES,
): { dial: string; national: string; iso: string } {
  const digits = digitsOnly(stored ?? "");
  const fallback = countries[0];
  const dials = [...new Set(countries.map((country) => country.dial))].sort((a, b) => b.length - a.length);
  for (const dial of dials)
    if (digits.startsWith(dial) && digits.length > dial.length) {
      const country = countries.find((option) => option.dial === dial)!;
      return { dial, national: digits.slice(dial.length), iso: country.iso };
    }
  return { dial: fallback.dial, national: digits, iso: fallback.iso };
}

export function phoneIssue(stored: string | null | undefined, maxLength = 16): string | null {
  const raw = (stored ?? "").trim();
  if (!raw) return null;
  else if (!/^\d+$/.test(raw)) return "Phone is digits only";
  else if (raw.length > maxLength) return `Phone allows at most ${maxLength} characters`;
  else if (raw.length < PHONE_MIN) return `Phone needs at least ${PHONE_MIN} digits`;
  else return null;
}
