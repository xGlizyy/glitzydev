import { cookies } from "next/headers";
import { COOKIE_CONSENT_NAME, parseConsentCookie, type CookieConsentValue } from "@/lib/cookies/types";

export async function getCookieConsent(): Promise<CookieConsentValue | null> {
  const cookieStore = await cookies();
  return parseConsentCookie(cookieStore.get(COOKIE_CONSENT_NAME)?.value);
}

export async function hasCookieConsent(category: "analytics" | "preferences"): Promise<boolean> {
  const consent = await getCookieConsent();
  return consent?.[category] ?? false;
}
