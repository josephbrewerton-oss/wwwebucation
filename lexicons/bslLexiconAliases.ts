/

St Joseph's Curriculum Portal — BSL Lexicon Normalization & Synonym Alias Table

Maps spoken English transcript tokens to canonical BSL AST sign identifiers.
*/

export const BSL_LEXICON_ALIASES: Record<string, string> = {
// --- Pythagoras, Geometry & Math Slide Cartridge ---
"triangles": "triangle",
"triangular": "triangle",
"pythagorean": "pythagoras",
"triples": "number",
"triple": "number",
"handles": "select",
"handle": "select",
"drag": "drag",
"dragging": "drag",
"drags": "drag",
"select": "select",
"selecting": "select",
"choose": "select",
"test": "prove",
"testing": "prove",
"tests": "prove",
"right": "right-angle",
"hypotenuse": "hypotenuse",
"squares": "square",
"squared": "square",
"angles": "angle",
"angular": "angle",
"lines": "line",
"calculate": "calculate",
"calculating": "calculate",
"calculation": "calculate",
"solve": "calculate",
"solving": "calculate",
"sum": "add",
"plus": "add",
"minus": "subtract",
"takeaway": "subtract",
"times": "multiply",
"product": "multiply",
"ratio": "fraction",
"perimeter": "area",
"surface": "area",
"rule": "theorem",
"formula": "theorem",

// --- Astronomy & Solar System Cartridge ---
"heliocentric": "solar-system",
"solar": "sun",
"planetary": "planet",
"planets": "planet",
"revolve": "orbit",
"revolves": "orbit",
"revolving": "orbit",
"orbits": "orbit",
"orbiting": "orbit",
"rotates": "rotate",
"rotating": "rotate",
"rotation": "rotate",
"spin": "rotate",
"spinning": "rotate",
"cosmic": "space",
"universe": "space",
"galaxy": "space",
"gravitational": "gravity",
"multiplier": "speed",
"velocity": "velocity",
"faster": "fast",
"slower": "slow",
"tap": "select",
"click": "select",
"card": "book",
"cards": "book",

// --- Core Action & Verb Normalization ---
"shows": "show",
"showing": "show",
"shown": "show",
"looking": "look",
"looks": "look",
"looked": "look",
"explains": "explain",
"explaining": "explain",
"explanation": "explain",
"learning": "learn",
"learnt": "learn",
"reading": "read",
"reads": "read",
"writing": "write",
"wrote": "write",
"stopped": "stop",
"stopping": "stop",
"started": "start",
"starting": "start",
"understanding": "understand",
"understood": "understand",
"thinks": "think",
"thinking": "think",
"knows": "know",
"knowing": "know",
"knew": "know",
"walks": "walk",
"walking": "walk",
"walked": "walk"
};

/

Standard grammatical English functional stop words.

These should be ignored rather than fingerspelled.
*/
export const BSL_IGNORED_STOPWORDS: ReadonlySet = new Set([
"a", "an", "the", "of", "to", "in", "for", "on", "with", "at",
"by", "from", "up", "about", "into", "over", "after", "is",
"are", "was", "were", "be", "been", "being", "have", "has",
"had", "do", "does", "did", "and", "or", "but", "so"
]);

/

Resolves a raw transcript word token to an addressable sign ID or null (for fingerspell fallback).
*/
export function resolveBslToken(token: string): string | null {
const normalized = token.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
if (!normalized || BSL_IGNORED_STOPWORDS.has(normalized)) {
return ""; // Drop stop word
}
return BSL_LEXICON_ALIASES[normalized] || normalized;
}
