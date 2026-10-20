import { SExprAST, SExprNode } from '../types/sexpr';
import { healSExprString } from './astQuestionExtractor';

/**
 * Strips Lisp-style comments (; or ;;) that occur outside of quoted strings.
 */
export function stripSExprComments(str: string): string {
  if (!str || typeof str !== 'string') return '';
  let result = '';
  let inQuote = false;
  let escapeNext = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escapeNext) {
      result += ch;
      escapeNext = false;
      continue;
    }
    if (ch === '\\') {
      result += ch;
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inQuote = !inQuote;
      result += ch;
      continue;
    }
    if (!inQuote && ch === ';') {
      while (i < str.length && str[i] !== '\n' && str[i] !== '\r') {
        i++;
      }
      result += '\n';
      continue;
    }
    result += ch;
  }
  return result;
}

export function parseSExpr(input: string): SExprAST {
  if (!input || typeof input !== 'string') return null;
  const decommented = stripSExprComments(input);
  const healed = healSExprString(decommented);
  const tokens = tokenize(healed);
  let cursor = 0;

  function parseNode(): SExprAST {
    if (cursor >= tokens.length) return null;
    const token = tokens[cursor++];
    if (token === '(' || token === '[') {
      const closeDelim = token === '(' ? ')' : ']';

      // Empty list: () or []
      if (cursor < tokens.length && tokens[cursor] === closeDelim) {
        cursor++;
        return [];
      }

      // Lookahead: check if next token is a nested expression, a keyword argument, or an array of items
      const next = tokens[cursor];
      if (
        next === '(' ||
        next === '[' ||
        (typeof next === 'string' && (next.startsWith(':') || next.startsWith('"') || !isNaN(Number(next))))
      ) {
        const items: any[] = [];
        while (cursor < tokens.length && tokens[cursor] !== closeDelim) {
          items.push(parseNode());
        }
        if (tokens[cursor] === closeDelim) cursor++; // consume closing delimiter
        return items;
      }

      const tag = cursor < tokens.length ? tokens[cursor++] : 'node';
      const props: Record<string, any> = {};
      const children: (SExprNode | any)[] = [];

      while (cursor < tokens.length && tokens[cursor] !== closeDelim) {
        const current = tokens[cursor];
        if (typeof current === 'string' && current.startsWith(':')) {
          const key = current.slice(1);
          cursor++;
          props[key] = parseNode();
        } else {
          children.push(parseNode());
        }
      }
      if (tokens[cursor] === closeDelim) cursor++; // consume closing delimiter
      return { tag, props, children };
    }

    // Primitive conversions
    if (token === 'true') return true;
    if (token === 'false') return false;
    if (token === 'nil' || token === 'null') return null;
    if (!isNaN(Number(token))) return Number(token);
    if (token && token.startsWith('"') && token.endsWith('"')) {
      return token.slice(1, -1).replace(/\\(["\\\/bfnrt])/g, (_, esc) => {
        switch (esc) {
          case '"': return '"';
          case '\\': return '\\';
          case 'n': return '\n';
          case 't': return '\t';
          case 'r': return '\r';
          case 'b': return '\b';
          case 'f': return '\f';
          default: return esc;
        }
      });
    }
    return token;
  }

  return parseNode();
}

/**
 * Tokenizes an S-Expression string into individual atomic tokens, delimiters, and quoted literals.
 * Implemented as a strictly linear O(n) character scanner without backtracking regular expressions
 * to guarantee complete immunity against Polynomial/Exponential ReDoS attacks (CodeQL: js/polynomial-redos).
 * Handles escaped quotes within strings cleanly.
 */
export function tokenize(str: string): string[] {
  if (!str || typeof str !== 'string') return [];
  const tokens: string[] = [];
  const len = str.length;
  let i = 0;

  while (i < len) {
    const ch = str[i];

    // Skip whitespace
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f') {
      i++;
      continue;
    }

    // Delimiters
    if (ch === '(' || ch === ')' || ch === '[' || ch === ']') {
      tokens.push(ch);
      i++;
      continue;
    }

    // Quoted string literal
    if (ch === '"') {
      const start = i;
      i++; // skip opening quote
      let inEscape = false;
      while (i < len) {
        const c = str[i];
        if (inEscape) {
          inEscape = false;
          i++;
        } else if (c === '\\') {
          inEscape = true;
          i++;
        } else if (c === '"') {
          i++; // include closing quote
          break;
        } else {
          i++;
        }
      }
      tokens.push(str.slice(start, i));
      continue;
    }

    // Atomic symbol, keyword (:kw), number, or identifier
    const start = i;
    while (
      i < len &&
      str[i] !== ' ' &&
      str[i] !== '\t' &&
      str[i] !== '\n' &&
      str[i] !== '\r' &&
      str[i] !== '\f' &&
      str[i] !== '(' &&
      str[i] !== ')' &&
      str[i] !== '[' &&
      str[i] !== ']' &&
      str[i] !== '"'
    ) {
      i++;
    }
    if (i > start) {
      tokens.push(str.slice(start, i));
    }
  }

  return tokens;
}

export interface ParsedAstNode {
  route: string;
  calc?: string;
  prompt: string;
  options: string[];
  answerKey: number;
}

/**
 * Robust S-Expression AST question extractor.
 * Replaces legacy brittle regular expression matchers (:prompt, :options regexes).
 * Uses recursive tokenizer and parser to safely parse:
 * - Escaped double-quotes inside prompt/options
 * - Nested parentheses and lists
 * - Multi-line strings
 * - S-expression comments (; or ;;)
 * - Shorthand keywords (:q, :opts, :choices, :answer, etc.)
 */
export function parseAstNode(input: string | SExprAST): ParsedAstNode {
  const ast = typeof input === 'string' ? parseSExpr(input) : input;
  if (!ast) {
    throw new Error('Invalid AST: Empty or unparseable S-expression');
  }

  let route = 'quiz:mcq';
  let calc: string | undefined = undefined;
  let prompt: string | undefined = undefined;
  let options: string[] = [];
  let answerKey = 0;

  const extractString = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'object') {
      if (val.props?.text) return String(val.props.text);
      if (Array.isArray(val.children) && val.children.length > 0) return extractString(val.children[0]);
    }
    return String(val);
  };

  const processProps = (props: Record<string, any>) => {
    if (!props || typeof props !== 'object') return;
    if (props.route && typeof props.route === 'string') route = props.route;
    if (props.calc && typeof props.calc === 'string') calc = props.calc;

    const rawPrompt = props.prompt ?? props.q ?? props.question ?? props.stem;
    if (rawPrompt !== undefined && rawPrompt !== null) {
      prompt = extractString(rawPrompt);
    }

    const rawKey = props['answer-key'] ?? props.answerKey ?? props.answer ?? props.key;
    if (rawKey !== undefined && rawKey !== null) {
      const parsed = parseInt(String(rawKey), 10);
      if (!isNaN(parsed)) answerKey = parsed;
    }

    const rawOpts = props.options ?? props.opts ?? props.choices;
    if (rawOpts) {
      if (Array.isArray(rawOpts)) {
        options = rawOpts.map(extractString).filter(Boolean);
      } else if (typeof rawOpts === 'object') {
        if (Array.isArray(rawOpts.children)) {
          options = rawOpts.children.map(extractString).filter(Boolean);
        }
      }
    }
  };

  if (Array.isArray(ast)) {
    const props: Record<string, any> = {};
    for (let i = 0; i < ast.length; i++) {
      const item = ast[i];
      if (typeof item === 'string' && item.startsWith(':')) {
        const key = item.slice(1);
        const val = i + 1 < ast.length ? ast[i + 1] : true;
        props[key] = val;
        i++;
      } else if (typeof item === 'object' && item !== null && 'tag' in item) {
        if (!prompt && (item.props?.prompt || item.props?.question)) {
          processProps(item.props);
          if (item.tag && item.tag !== 'node') route = item.tag;
        }
      } else if (typeof item === 'string' && i === 0 && !item.startsWith(':')) {
        route = item;
      }
    }
    processProps(props);
  } else if (typeof ast === 'object' && ast !== null && 'tag' in ast) {
    if (ast.tag && ast.tag !== 'node') route = ast.tag;
    if (ast.props) processProps(ast.props);

    if (Array.isArray(ast.children)) {
      for (const child of ast.children) {
        if (typeof child === 'object' && child !== null && 'tag' in child) {
          if (child.tag === 'option') {
            const optText = child.props?.text || (child.children && child.children[0]) || '';
            if (optText) options.push(extractString(optText));
            if (child.props?.correct === true || child.props?.correct === '#t') {
              answerKey = options.length - 1;
            }
          } else if (!prompt && (child.tag === 'prompt' || child.tag === 'question')) {
            prompt = extractString(child.props?.text || child.children[0] || '');
          }
        }
      }
    }
  }

  if (!prompt) {
    throw new Error('Invalid AST: Missing :prompt token');
  }

  if (options.length === 0) {
    options = ['Option A', 'Option B', 'Option C', 'Option D'];
  }

  return { route, calc, prompt, options, answerKey };
}

export interface CartridgeHeaderMetadata {
  id: string;
  type: 'Sim' | 'Slide' | 'App' | 'Film';
  title: string;
  stage: string;
  duration: number;
  video?: string;
  videoFit: 'contain' | 'cover' | 'fill';
  hasVideo: boolean;
  has3D: boolean;
  hasCheckpoints: boolean;
  hasSubtitles: boolean;
}

/**
 * Parses and verifies top-level AST cartridge headers (:id, :type, :title, :stage, :duration, :video, :video-fit).
 * Supports the Film archetype and synchronized video driving.
 */
export function parseCartridgeHeader(astContent: string): CartridgeHeaderMetadata {
  if (!astContent || typeof astContent !== 'string') {
    throw new Error('Empty or invalid AST content');
  }

  const idMatch = astContent.match(/:id\s+("([^"]+)"|([^\s\)]+))/i);
  const id = idMatch ? (idMatch[2] || idMatch[3]) : 'unnamed-scene';

  const typeMatch = astContent.match(/:type\s+("([^"]+)"|([^\s\)]+))/i);
  const rawType = typeMatch ? (typeMatch[2] || typeMatch[3]) : null;

  const videoMatch = astContent.match(/:video\s+("([^"]+)"|([^\s\)]+))/i) || astContent.match(/:film\s+("([^"]+)"|([^\s\)]+))/i);
  const video = videoMatch ? (videoMatch[2] || videoMatch[3]) : undefined;

  const videoFitMatch = astContent.match(/:video-?fit\s+("([^"]+)"|([^\s\)]+))/i);
  const videoFit: 'contain' | 'cover' | 'fill' = (videoFitMatch ? (videoFitMatch[2] || videoFitMatch[3]).toLowerCase() : 'contain') as any;

  let type: 'Sim' | 'Slide' | 'App' | 'Film' = 'Sim';
  if (rawType) {
    const norm = rawType.toLowerCase();
    if (norm === 'film' || norm === 'video' || norm === 'movie') type = 'Film';
    else if (norm === 'slide') type = 'Slide';
    else if (norm === 'app') type = 'App';
    else type = 'Sim';
  } else if (video) {
    type = 'Film';
  } else {
    const hasSubtitles = /:subtitles\s*\(/i.test(astContent);
    const hasGestures = /:gestures\s*\(/i.test(astContent) || /:draggable\s+/i.test(astContent);
    const hasCheckpoints = /:interactive\s*\(/i.test(astContent) || /:checkpoint\s+/i.test(astContent);
    const hasPhysics = /:physics\s*\(/i.test(astContent) || /:emitter\s+/i.test(astContent);
    if (hasSubtitles && !hasGestures && !hasPhysics) {
      type = 'Slide';
    } else if (hasGestures || hasPhysics || hasCheckpoints) {
      type = 'Sim';
    } else {
      type = 'App';
    }
  }

  const titleMatch = astContent.match(/:title\s+"([^"]+)"/i);
  const title = titleMatch ? titleMatch[1] : id;

  const stageMatch = astContent.match(/:stage\s+"([^"]+)"/i);
  const stage = stageMatch ? stageMatch[1] : 'CURRICULUM';

  const durationMatch = astContent.match(/:duration\s+([\d\.]+)/i);
  const duration = durationMatch ? parseFloat(durationMatch[1]) : 10.0;

  const has3D = /:camera\s+|:type\s+"3d-/i.test(astContent);
  const hasSubtitles = /:subtitles\s*\(/i.test(astContent);
  const hasCheckpoints = /:interactive\s*\(/i.test(astContent) || /:checkpoint\s+/i.test(astContent);

  return {
    id,
    type,
    title,
    stage,
    duration,
    video,
    videoFit,
    hasVideo: Boolean(video),
    has3D,
    hasCheckpoints,
    hasSubtitles,
  };
}

export class AstParser {
  /**
   * Parses S-Expression into ParsedAstNode using robust recursive tokenizer.
   * Replaces legacy regex matchers.
   */
  static parse(sExpr: string): ParsedAstNode {
    return parseAstNode(sExpr);
  }

  /**
   * Extracts verified cartridge header metadata including Film & Video attributes.
   */
  static parseHeader(sExpr: string): CartridgeHeaderMetadata {
    return parseCartridgeHeader(sExpr);
  }
}