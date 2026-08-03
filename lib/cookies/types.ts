export type CookieChoices = {
  analytics: boolean;
  preferences: boolean;
};

export type CookieConsentValue = CookieChoices & {
  necessary: true;
};

export const COOKIE_CONSENT_NAME = "cookie_consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 180 días

type StoredConsent = CookieChoices & { version: number };

export function parseConsentCookie(raw: string | undefined): CookieConsentValue | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      preferences: Boolean(parsed.preferences),
    };
  } catch {
    return null;
  }
}

export function serializeConsent(choices: CookieChoices): string {
  const stored: StoredConsent = {
    analytics: choices.analytics,
    preferences: choices.preferences,
    version: COOKIE_CONSENT_VERSION,
  };
  return JSON.stringify(stored);
}
