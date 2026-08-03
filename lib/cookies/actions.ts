"use server";

import { cookies } from "next/headers";
import {
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_CONSENT_NAME,
  serializeConsent,
  type CookieChoices,
} from "@/lib/cookies/types";

export async function setCookieConsent(choices: CookieChoices): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_CONSENT_NAME, serializeConsent(choices), {
    maxAge: COOKIE_CONSENT_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
