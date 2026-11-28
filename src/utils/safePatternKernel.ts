// src/utils/safePatternKernel.ts
/**
 * Sealed Host Tuple-AST Pattern Kernel & Policy Text Normalizer
 *
 * Provides a compact, deterministic, ReDoS-free tuple-AST pattern system designed
 * for compiled-in, frozen (`Object.freeze`) host security & governance rules.
 *
 * Trust Invariant:
 * - Host safeguarding, PII, SVG/CSS, and Ask Nano policy tuples are compiled into
 *   the TypeScript bundle and deep-frozen at boot (never loaded from user-editable
 *   `.ast` cartridges or IndexedDB).
 * - Structural bounds (`maxDepth`, `maxNodes`, `maxRepetition`, zero nested
 *   quantifiers, bounded input length) are enforced fail-closed before compilation.
 */

export type CharClassToken = 'd' | 'w' | 's' | 'a' | 'hex';

export type PatternNode =
  | readonly ['lit', string]
  | readonly ['cls', CharClassToken]
  | readonly ['set', string, boolean?]
  | readonly ['seq', readonly PatternNode[]]
  | readonly ['alt', readonly PatternNode[]]
  | readonly ['rep', PatternNode, number, number]
  | readonly ['wb']
  | readonly ['anchor', 'start' | 'end'];

export const PATTERN_LIMITS = Object.freeze({
  maxDepth: 6,
  maxNodes: 96,
  maxRepetition: 32,
  maxInputChars: 4096,
  maxLiteralChars: 64,
});

export interface NormalizedPolicyText {
  /** NFKC + invisible-stripped + diacritic-stripped + homoglyph-folded + whitespace-collapsed (digits preserved). */
  normalized: string;
  /** `normalized` with separator-obfuscated letter runs collapsed and leetspeak folded inside letter runs. */
  folded: string;
  /** Count of stripped invisible / bidi / control characters (evasion telemetry). */
  strippedInvisibleCount: number;
  /** Whether the input exceeded `maxChars` and was bounded before matching. */
  truncated: boolean;
}

/**
 * Common Cyrillic & Greek Latin-lookalike homoglyphs used in filter evasion.
 * Kept compact and compiled-in (0 external tables).
 */
const HOMOGLYPH_MAP: Readonly<Record<string, string>> = Object.freeze({
  // Cyrillic lowercase & uppercase
  '\u0430': 'a', '\u0410': 'a', // а А
  '\u0435': 'e', '\u0415': 'e', // е Е
  '\u0451': 'e', '\u0401': 'e', // ё Ё
  '\u043E': 'o', '\u041E': 'o', // о О
  '\u0440': 'p', '\u0420': 'p', // р Р
  '\u0441': 'c', '\u0421': 'c', // с С
  '\u0443': 'y', '\u0423': 'y', // у У
  '\u0445': 'x', '\u0425': 'x', // х Х
  '\u0456': 'i', '\u0406': 'i', // і І
  '\u0458': 'j', '\u0408': 'j', // ј Ј
  '\u0455': 's', '\u0405': 's', // ѕ Ѕ
  '\u043A': 'k', '\u041A': 'k', // к К
  '\u043C': 'm', '\u041C': 'm', // м М
  '\u0442': 't', '\u0422': 't', // т Т
  '\u043D': 'h', '\u041D': 'h', // н Н
  '\u0432': 'b', '\u0412': 'b', // в В
  // Greek lowercase & uppercase
  '\u03B1': 'a', '\u0391': 'a', // α Α
  '\u03B2': 'b', '\u0392': 'b', // β Β
  '\u03B5': 'e', '\u0395': 'e', // ε Ε
  '\u03B9': 'i', '\u0399': 'i', // ι Ι
  '\u03BA': 'k', '\u039A': 'k', // κ Κ
  '\u03BC': 'm', '\u039C': 'm', // μ Μ
  '\u03BD': 'v', '\u039D': 'n', // ν Ν
  '\u03BF': 'o', '\u039F': 'o', // ο Ο
  '\u03C1': 'p', '\u03A1': 'p', // ρ Ρ
  '\u03C4': 't', '\u03A4': 't', // τ Τ
  '\u03C5': 'u', '\u03A5': 'y', // υ Υ
  '\u03C7': 'x', '\u03A7': 'x', // χ Χ
  // Latin small/special lookalikes
  '\u0131': 'i', // dotless ı
  '\u0261': 'g', // script ɡ
  '\u00DF': 's', // ß
});

const LEET_CHAR_MAP: Readonly<Record<string, string>> = Object.freeze({
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
  '!': 'i',
});

function isInvisibleOrControlCode(code: number): boolean {
  if (code <= 0x08 || code === 0x0b || code === 0x0c || (code >= 0x0e && code <= 0x1f) || code === 0x7f) {
    return true;
  }
  if (
    code === 0x00ad || // soft hyphen
    code === 0x034f || // combining grapheme joiner
    code === 0x061c || // arabic letter mark
    code === 0xfeff || // BOM / zero-width no-break space
    (code >= 0x200b && code <= 0x200f) || // ZWSP, ZWNJ, ZWJ, LRM, RLM
    (code >= 0x202a && code <= 0x202e) || // bidi embedding/override
    (code >= 0x2060 && code <= 0x206f)    // word joiner & invisible operators
  ) {
    return true;
  }
  return false;
}

function isAsciiLetterCode(code: number): boolean {
  return (code >= 0x61 && code <= 0x7a) || (code >= 0x41 && code <= 0x5a);
}

/**
 * Deterministic, bounded O(n) text normalizer for safeguarding & policy checks.
 * Never throws; always completes in linear time.
 */
export function normalizeForPolicy(
  raw: string,
  maxChars: number = PATTERN_LIMITS.maxInputChars
): NormalizedPolicyText {
  const str = typeof raw === 'string' ? raw : String(raw ?? '');
  const limit = Math.max(1, Math.min(PATTERN_LIMITS.maxInputChars * 2, maxChars));
  const truncated = str.length > limit;
  const bounded = truncated ? str.slice(0, limit) : str;

  // 1. NFKC folds full-width chars, circled letters, ligatures, superscripts.
  // 2. NFD splits combining diacritics so we can strip combining marks cleanly.
  const compat = bounded.normalize('NFKC').normalize('NFD');

  let strippedInvisibleCount = 0;
  let normOut = '';
  let lastWasSpace = true;

  for (let i = 0; i < compat.length; i++) {
    const code = compat.charCodeAt(i);
    // Strip combining diacritical marks (U+0300..U+036F)
    if (code >= 0x0300 && code <= 0x036f) {
      strippedInvisibleCount++;
      continue;
    }
    if (isInvisibleOrControlCode(code)) {
      strippedInvisibleCount++;
      continue;
    }
    const ch = compat[i];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\u00a0') {
      if (!lastWasSpace) {
        normOut += ' ';
        lastWasSpace = true;
      }
      continue;
    }
    const mapped = HOMOGLYPH_MAP[ch] ?? ch.toLowerCase();
    normOut += mapped;
    lastWasSpace = false;
  }

  const normalized = normOut.trim();

  // Build `folded`:
  // - Collapses separator-obfuscated single-letter runs (e.g., "k.i.l.l" or "p-o-r-n" -> "kill", "porn")
  // - Folds leetspeak characters ONLY inside tokens that contain at least one ASCII letter
  //   (so pure numeric sequences like "07700900123" or "1000000000" are never corrupted).
  const tokens = normalized ? normalized.split(' ') : [];
  const foldedTokens: string[] = [];

  // Step A: merge runs of >= 3 single-letter tokens (e.g. "k i l l" -> "kill")
  let tIdx = 0;
  const mergedSpacedTokens: string[] = [];
  while (tIdx < tokens.length) {
    if (tokens[tIdx].length === 1 && isAsciiLetterCode(tokens[tIdx].charCodeAt(0))) {
      let runEnd = tIdx + 1;
      while (
        runEnd < tokens.length &&
        tokens[runEnd].length === 1 &&
        isAsciiLetterCode(tokens[runEnd].charCodeAt(0))
      ) {
        runEnd++;
      }
      if (runEnd - tIdx >= 3) {
        let joined = '';
        for (let k = tIdx; k < runEnd; k++) joined += tokens[k];
        mergedSpacedTokens.push(joined);
        tIdx = runEnd;
        continue;
      }
    }
    mergedSpacedTokens.push(tokens[tIdx]);
    tIdx++;
  }

  // Step B: inside each token, fold punctuation-separated letter runs & mixed-letter leetspeak
  for (let i = 0; i < mergedSpacedTokens.length; i++) {
    const tok = mergedSpacedTokens[i];
    let hasLetter = false;
    for (let j = 0; j < tok.length; j++) {
      if (isAsciiLetterCode(tok.charCodeAt(j))) {
        hasLetter = true;
        break;
      }
    }
    if (!hasLetter) {
      foldedTokens.push(tok);
      continue;
    }

    // Check if token uses inline obfuscation separators like '.', '-', '_', '*' between letters/leet
    let strippedSep = '';
    for (let j = 0; j < tok.length; j++) {
      const ch = tok[j];
      if (ch === '.' || ch === '-' || ch === '_' || ch === '*' || ch === '/') {
        // Keep separator only if not separating two alphanumeric/leet chars
        const prev = j > 0 ? tok[j - 1] : '';
        const next = j + 1 < tok.length ? tok[j + 1] : '';
        const prevIsWord = prev !== '' && (isAsciiLetterCode(prev.charCodeAt(0)) || Boolean(LEET_CHAR_MAP[prev]));
        const nextIsWord = next !== '' && (isAsciiLetterCode(next.charCodeAt(0)) || Boolean(LEET_CHAR_MAP[next]));
        if (prevIsWord && nextIsWord) {
          continue;
        }
      }
      strippedSep += LEET_CHAR_MAP[ch] ?? ch;
    }
    foldedTokens.push(strippedSep);
  }

  return {
    normalized,
    folded: foldedTokens.join(' '),
    strippedInvisibleCount,
    truncated,
  };
}

/**
 * Recursively deep-freezes a compiled-in pattern tuple so host rules are immutable at runtime.
 */
export function freezePattern<T extends PatternNode>(node: T): Readonly<T> {
  if (!Array.isArray(node)) return node;
  for (let i = 0; i < node.length; i++) {
    const item = (node as readonly unknown[])[i];
    if (Array.isArray(item)) {
      freezePattern(item as unknown as PatternNode);
    }
  }
  return Object.freeze(node);
}

/**
 * Validates a tuple-AST pattern against strict depth, node-count, and anti-ReDoS invariants.
 * Explicitly forbids nested repetition (`rep` inside `rep`) and unbounded quantifiers.
 */
export function validatePatternTuple(
  node: unknown,
  depth: number = 0,
  inRep: boolean = false,
  counter: { n: number } = { n: 0 }
): { ok: true } | { ok: false; reason: string } {
  if (depth > PATTERN_LIMITS.maxDepth) {
    return { ok: false, reason: `Pattern exceeds max depth (${PATTERN_LIMITS.maxDepth})` };
  }
  counter.n++;
  if (counter.n > PATTERN_LIMITS.maxNodes) {
    return { ok: false, reason: `Pattern exceeds max node count (${PATTERN_LIMITS.maxNodes})` };
  }
  if (!Array.isArray(node) || node.length === 0) {
    return { ok: false, reason: 'Pattern node must be a non-empty tuple' };
  }

  const op = node[0];
  switch (op) {
    case 'lit': {
      if (typeof node[1] !== 'string' || node[1].length === 0 || node[1].length > PATTERN_LIMITS.maxLiteralChars) {
        return { ok: false, reason: 'lit node requires a non-empty bounded string' };
      }
      return { ok: true };
    }
    case 'cls': {
      if (node[1] !== 'd' && node[1] !== 'w' && node[1] !== 's' && node[1] !== 'a' && node[1] !== 'hex') {
        return { ok: false, reason: `Unknown cls token: ${String(node[1])}` };
      }
      return { ok: true };
    }
    case 'set': {
      if (typeof node[1] !== 'string' || node[1].length === 0 || node[1].length > PATTERN_LIMITS.maxLiteralChars) {
        return { ok: false, reason: 'set node requires a non-empty bounded character list' };
      }
      if (node[2] !== undefined && typeof node[2] !== 'boolean') {
        return { ok: false, reason: 'set negation flag must be boolean' };
      }
      return { ok: true };
    }
    case 'wb': {
      return { ok: true };
    }
    case 'anchor': {
      if (node[1] !== 'start' && node[1] !== 'end') {
        return { ok: false, reason: 'anchor must be "start" or "end"' };
      }
      return { ok: true };
    }
    case 'seq':
    case 'alt': {
      const children = node[1];
      if (!Array.isArray(children) || children.length === 0) {
        return { ok: false, reason: `${op} requires a non-empty child array` };
      }
      for (let i = 0; i < children.length; i++) {
        const res = validatePatternTuple(children[i], depth + 1, inRep, counter);
        if (!res.ok) return res;
      }
      return { ok: true };
    }
    case 'rep': {
      if (inRep) {
        return { ok: false, reason: 'Nested repetition is forbidden (anti-ReDoS invariant)' };
      }
      const child = node[1];
      const min = node[2];
      const max = node[3];
      if (
        typeof min !== 'number' ||
        typeof max !== 'number' ||
        !Number.isInteger(min) ||
        !Number.isInteger(max) ||
        min < 0 ||
        max < min ||
        max > PATTERN_LIMITS.maxRepetition
      ) {
        return { ok: false, reason: `Invalid repetition bounds [${String(min)}, ${String(max)}]` };
      }
      return validatePatternTuple(child, depth + 1, true, counter);
    }
    default:
      return { ok: false, reason: `Unsupported pattern op: ${String(op)}` };
  }
}

function escapeRegexLiteral(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeCharSet(chars: string): string {
  return chars.replace(/[\\\]^-]/g, '\\$&');
}

function emitRegexSource(node: PatternNode): string {
  switch (node[0]) {
    case 'lit':
      return escapeRegexLiteral(node[1]);
    case 'cls':
      switch (node[1]) {
        case 'd': return '[0-9]';
        case 'w': return '[A-Za-z0-9_]';
        case 's': return '[ \\t\\r\\n]';
        case 'a': return '[A-Za-z]';
        case 'hex': return '[0-9A-Fa-f]';
      }
      return '';
    case 'set':
      return `[${node[2] ? '^' : ''}${escapeCharSet(node[1])}]`;
    case 'wb':
      return '\\b';
    case 'anchor':
      return node[1] === 'start' ? '^' : '$';
    case 'seq':
      return `(?:${node[1].map(emitRegexSource).join('')})`;
    case 'alt':
      return `(?:${node[1].map(emitRegexSource).join('|')})`;
    case 'rep': {
      const inner = emitRegexSource(node[1]);
      const min = node[2];
      const max = node[3];
      const quant = min === max ? `{${min}}` : `{${min},${max}}`;
      return `(?:${inner})${quant}`;
    }
  }
}

const compiledMatcherCache = new Map<string, RegExp>();

/**
 * Compiles a validated tuple-AST into a cached, stateless, bounded predicate.
 * Fails closed (throws) if the tuple violates anti-ReDoS or depth limits.
 */
export function compileTupleMatcher(
  id: string,
  node: PatternNode,
  flags: '' | 'i' = 'i'
): (input: string) => boolean {
  const check = validatePatternTuple(node);
  if (!check.ok) {
    throw new Error(`[SafePatternKernel] Invalid pattern tuple "${id}": ${check.reason}`);
  }
  const cacheKey = `${id}::${flags}`;
  let rx = compiledMatcherCache.get(cacheKey);
  if (!rx) {
    const source = emitRegexSource(node);
    rx = new RegExp(source, flags);
    compiledMatcherCache.set(cacheKey, rx);
  }
  const compiled = rx;
  return (input: string): boolean => {
    if (typeof input !== 'string' || input.length === 0) return false;
    const bounded =
      input.length > PATTERN_LIMITS.maxInputChars
        ? input.slice(0, PATTERN_LIMITS.maxInputChars)
        : input;
    return compiled.test(bounded);
  };
}

/**
 * Compiles a validated tuple-AST into a stateless global replacement function
 * (used for deterministic curriculum allowlist masking without raw regex literals).
 */
export function compileTupleMasker(
  id: string,
  node: PatternNode,
  replacement: string = ' ',
  flags: '' | 'i' = 'i'
): (input: string) => string {
  const check = validatePatternTuple(node);
  if (!check.ok) {
    throw new Error(`[SafePatternKernel] Invalid masker tuple "${id}": ${check.reason}`);
  }
  const source = emitRegexSource(node);
  const rx = new RegExp(source, flags === 'i' ? 'gi' : 'g');
  return (input: string): string => {
    if (typeof input !== 'string' || input.length === 0) return '';
    const bounded =
      input.length > PATTERN_LIMITS.maxInputChars
        ? input.slice(0, PATTERN_LIMITS.maxInputChars)
        : input;
    rx.lastIndex = 0;
    return bounded.replace(rx, replacement);
  };
}

// ============================================================================
// Compact Tuple Constructors for Compiled-In Host Policies
// ============================================================================

const SPACE_1_2: PatternNode = freezePattern(['rep', ['cls', 's'], 1, 2]);
const WORD_SUFFIX = (max: number): PatternNode => freezePattern(['rep', ['cls', 'a'], 0, max]);

/** Builds a frozen word-bounded multi-word phrase tuple: `\bword1\s{1,2}word2\b` */
export function phraseTuple(phrase: string): Readonly<PatternNode> {
  const words = phrase.trim().split(/\s+/).filter(Boolean);
  const parts: PatternNode[] = [['wb']];
  for (let i = 0; i < words.length; i++) {
    if (i > 0) parts.push(SPACE_1_2);
    parts.push(['lit', words[i]]);
  }
  parts.push(['wb']);
  return freezePattern(['seq', parts]);
}

/** Builds a frozen word-bounded alternation of exact words or stems (`suffixMax > 0`). */
export function wordAltTuple(words: readonly string[], suffixMax: number = 0): Readonly<PatternNode> {
  const alts: PatternNode[] = words.map((w) =>
    suffixMax > 0
      ? (['seq', [['lit', w], WORD_SUFFIX(suffixMax)]] as const)
      : (['lit', w] as const)
  );
  return freezePattern(['seq', [['wb'], ['alt', alts], ['wb']]]);
}
