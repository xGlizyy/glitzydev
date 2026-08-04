import { fetchSpanishEntry } from "@/lib/dictionary/es";
import { normalize, isCleanTerm } from "@/lib/dictionary/text";
import { seededShuffle } from "@/lib/random";
import { WORD_BANK } from "@/lib/challenge/wordBank";
import type { DictionaryEntry } from "@/lib/dictionary/types";
import type { GameCandidate } from "./types";

// Fetched in small parallel batches (not all at once, not one by one): a
// cold cache would otherwise mean dozens of sequential Wiktionary
// round-trips, risking a serverless timeout.
const FETCH_BATCH_SIZE = 10;

const MIN_DEFINITION_LENGTH = 12;
const MAX_DEFINITION_LENGTH = 160;

// Wiktionary entries for inflected forms ("Forma verbal") often carry a
// definition that's just a pointer back to the lemma ("Participio de
// discernir.") — useless, or an outright giveaway, as a game prompt.
const DEFINITION_PLACEHOLDER = /^(v[eé]ase|remite a|forma de|participio de|gerundio de)\b/i;

function isUsableDefinition(definition: string): boolean {
  const trimmed = definition.trim();
  if (trimmed.length < MIN_DEFINITION_LENGTH || trimmed.length > MAX_DEFINITION_LENGTH) return false;
  return !DEFINITION_PLACEHOLDER.test(trimmed);
}

/**
 * A word can have several Wiktionary senses (e.g. "jovial" has both the
 * everyday "alegre" meaning and an archaic "perteneciente a Jove/Júpiter"
 * one) — picking the first one in document order risks quizzing an obscure
 * sense. A sense that has its own synonyms/antonyms documented is a much
 * stronger signal that it's the common one, and keeps the definition
 * consistent with the syn/ant data the other games already quiz on.
 */
function pickDefinition(entry: DictionaryEntry): { definition: string; example?: string } | null {
  const usableSenses = entry.blocks
    .flatMap((block) => block.senses)
    .filter((sense) => isUsableDefinition(sense.definition));
  if (!usableSenses.length) return null;

  const withRelations = usableSenses.find(
    (sense) => (sense.synonyms?.length ?? 0) > 0 || (sense.antonyms?.length ?? 0) > 0,
  );
  const chosen = withRelations ?? usableSenses[0];
  return { definition: chosen.definition.trim(), example: chosen.example };
}

/**
 * Builds a fresh, randomly-ordered pool of playable candidates for the
 * unlimited-replay games (Definición, Intruso, Contrarreloj): each entry
 * has real synonym/antonym data *and* a usable definition, unlike Reto
 * diario's candidates which only need one or the other.
 */
export async function getGamePool(size = 60): Promise<GameCandidate[]> {
  const shuffledBank = seededShuffle(WORD_BANK, Math.random);
  const candidates: GameCandidate[] = [];

  for (let start = 0; start < shuffledBank.length; start += FETCH_BATCH_SIZE) {
    if (candidates.length >= size) break;

    const batch = shuffledBank.slice(start, start + FETCH_BATCH_SIZE);
    const entries = await Promise.all(batch.map((word) => fetchSpanishEntry(word).catch(() => null)));

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const word = batch[i];
      if (!entry) continue;

      const synonyms = entry.synonyms.filter((s) => isCleanTerm(s) && normalize(s) !== normalize(word));
      const antonyms = entry.antonyms.filter((s) => isCleanTerm(s) && normalize(s) !== normalize(word));
      if (!synonyms.length && !antonyms.length) continue;

      const picked = pickDefinition(entry);
      if (!picked) continue;

      candidates.push({
        word: entry.word,
        definition: picked.definition,
        example: picked.example,
        synonyms,
        antonyms,
      });
    }
  }

  return candidates;
}
