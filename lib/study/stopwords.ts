// Palabras vacías usadas para puntuar frases por relevancia, separadas por
// idioma para no perder precisión al filtrar contenido en textos mixtos.
export const STOPWORDS_ES = new Set<string>(
  `
  el la los las un una unos unas de del al a en y o u que qué quien quién como cómo
  cuando cuándo donde dónde por para con sin sobre entre desde hasta hacia según
  durante mediante ante bajo tras contra su sus mi mis tu tus nuestro nuestra
  nuestros nuestras vuestro vuestra vuestros vuestras este esta estos estas ese
  esa esos esas aquel aquella aquellos aquellas yo tú él ella usted nosotros
  nosotras vosotros vosotras ellos ellas ustedes me te se nos os le les lo
  es son fue fueron era eran ser estar está están estaba estaban ha han he
  has hemos habéis había habían hay muy más menos también tampoco pero aunque
  porque pues ya no sí solo sólo todo toda todos todas otro otra otros otras
  cada cual cuales algo alguien algún alguno alguna algunos algunas nada nadie
  ningún ninguno ninguna así entonces mientras además incluso sino cuyo cuya
  `
    .split(/\s+/)
    .filter(Boolean),
);

export const STOPWORDS_EN = new Set<string>(
  `
  the a an of in on at to for with without over between from until towards
  according during through against under after before its it his her their
  our your my this that these those i you he she we they them us him her
  is are was were be being been have has had do does did will would can
  could should may might must shall not no yes also too very more less
  than then so but although because while since as if or nor about into
  onto per via
  `
    .split(/\s+/)
    .filter(Boolean),
);

// A small, highly-discriminant subset used only to guess the document's
// dominant language (see detectLanguage in generateStudyPack.ts).
export const LANGUAGE_HINTS_ES = new Set([
  "de",
  "que",
  "el",
  "la",
  "en",
  "los",
  "las",
  "es",
  "para",
  "con",
  "por",
  "una",
  "un",
  "se",
  "su",
]);

export const LANGUAGE_HINTS_EN = new Set([
  "the",
  "and",
  "of",
  "to",
  "is",
  "that",
  "in",
  "it",
  "for",
  "with",
  "was",
  "are",
  "this",
  "as",
  "be",
]);
