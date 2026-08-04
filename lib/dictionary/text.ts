export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Wiktionary synonym/antonym lists sometimes carry regional notes like
// "fallo (Venezuela —Oriente—)" or multi-word glosses — fine as reference
// text on the dictionary page, but confusing as a standalone quiz option.
export const CLEAN_TERM = /^[a-záéíóúüñ]+(?:[ -][a-záéíóúüñ]+){0,2}$/i;

export function isCleanTerm(term: string): boolean {
  return CLEAN_TERM.test(term.trim());
}
