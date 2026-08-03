"use client";

import { openCookiePreferences } from "@/app/components/CookieConsent";

export default function ManageCookiesLink() {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className="underline-offset-2 hover:text-orange-300 hover:underline"
    >
      Gestionar cookies
    </button>
  );
}
