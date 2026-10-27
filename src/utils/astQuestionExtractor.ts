// src/utils/astQuestionExtractor.ts

export interface DataCartridgeQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  hint?: string;
  explanation?: string;
  tier?: 'recall' | 'application' | 'analysis' | 'synthesis';
  topic?: string;
  misconceptions?: string[];
}

export interface DataCartridgePayload {
  unit: string;
  subject: string;
  stage: string;
  axiom?: string;
  trap?: string;
  socraticPivot?: string;
  hook?: string;
  guidedStep?: string;
  questions: DataCartridgeQuestion[];
}

export interface ExtractedQuestion {
  prompt: string;
  options: string[];
  answerKey: number;
  scratchpad?: string;
  hint?: string;
  misconceptions?: string[];
  socraticFollowUp?: string;
}

/**
 * Auto-heals truncated or malformed S-expression strings:
 * balances quotes and closing parentheses.
 */
export function healSExprString(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let clean = raw.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();

  // 1. Balance quotes (counting unescaped double quotes)
  let inQuote = false;
  let escapeNext = false;
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inQuote = !inQuote;
    }
  }
  if (inQuote) {
    clean += '"';
  }

  // 2. Balance parentheses
  let openParenCount = 0;
  inQuote = false;
  escapeNext = false;
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote) {
      if (char === '(') openParenCount++;
      else if (char === ')') openParenCount--;
    }
  }

  while (openParenCount > 0) {
    clean += ')';
    openParenCount--;
  }

  return clean;
}

export function extractQuestionFromAst(rawLisp: string): ExtractedQuestion | null {
  if (!rawLisp || typeof rawLisp !== 'string') return null;

  try {
    const rawTrimmed = rawLisp.trim();

    // Strategy 1: Attempt JSON extraction
    const jsonMatch = rawTrimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const prompt = parsed.prompt || parsed.question || parsed.q || parsed.stem;
        const rawOptions = parsed.options || parsed.choices || parsed.answers || parsed.opts;
        if (prompt && Array.isArray(rawOptions) && rawOptions.length >= 2) {
          const options = rawOptions.map((o: any) =>
            typeof o === 'string' ? o.replace(/^[A-D]\)\s*/i, '').trim() : String(o)
          );
          let answerKey = 0;
          if (typeof parsed.answerKey === 'number') answerKey = parsed.answerKey;
          else if (typeof parsed.answer === 'number') answerKey = parsed.answer;
          else if (typeof parsed.answerKey === 'string') {
            const letterIdx = 'abcd'.indexOf(parsed.answerKey.toLowerCase().trim());
            if (letterIdx >= 0) answerKey = letterIdx;
            else {
              const num = parseInt(parsed.answerKey, 10);
              if (!isNaN(num)) answerKey = num;
            }
          }
          return {
            prompt: String(prompt).trim(),
            options,
            answerKey: Math.min(Math.max(0, answerKey), options.length - 1),
            scratchpad: parsed.scratchpad || parsed.reasoning,
            hint: parsed.hint || parsed.clue,
            misconceptions: Array.isArray(parsed.misconceptions) ? parsed.misconceptions : undefined,
            socraticFollowUp: parsed.socraticFollowUp || parsed.followUp,
          };
        }
      } catch {}
    }

    const clean = healSExprString(rawLisp);

    // Strategy 2: Lisp S-Expression Parsing
    const promptMatch =
      clean.match(/:(?:prompt|q|question)\s+"([^"]+)"/i) ||
      clean.match(/:(?:prompt|q|question)\s+([^\s:]+)/i) ||
      clean.match(/\(question\s+(?:\(text\s+)?"([^"]+)"/i);

    const optionsMatch =
      clean.match(/:(?:options|opts|choices)\s+[\(\[](?:list\s+)?([^\]\)]*)[\)\]]/i);

    let optionMatches: string[] = [];
    let detectedAnswerKey = -1;

    if (optionsMatch) {
      optionMatches = [...optionsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1].trim());
    } else {
      const explicitOptionRegex = /\(option\s*(?::correct\s+#([tf]))?\s*(?:\(text\s+)?"([^"]+)"/gi;
      let optIdx = 0;
      let match: RegExpExecArray | null;
      while ((match = explicitOptionRegex.exec(clean)) !== null) {
        if (match[1]?.toLowerCase() === 't') {
          detectedAnswerKey = optIdx;
        }
        optionMatches.push(match[2].trim());
        optIdx++;
      }
    }

    // Strategy 3: Markdown / Plain Text MCQ fallback
    if (!promptMatch || optionMatches.length < 2) {
      const lines = rawTrimmed.split('\n').map((l) => l.trim()).filter(Boolean);
      let detectedPrompt = '';
      const textOptions: string[] = [];
      let textAnswer = 0;

      for (const line of lines) {
        const qMatch = line.match(/^(?:question|prompt|q)\s*[:\-]\s*(.+)$/i);
        if (qMatch && !detectedPrompt) {
          detectedPrompt = qMatch[1].trim();
          continue;
        }
        const optMatch = line.match(/^(?:[A-D]\)|\d+\.|\-)\s+(.+)$/i);
        if (optMatch) {
          textOptions.push(optMatch[1].replace(/^["']|["']$/g, '').trim());
          continue;
        }
        const ansMatch = line.match(/^(?:answer|correct|key)\s*[:\-]\s*([A-D]|\d+)/i);
        if (ansMatch) {
          const val = ansMatch[1].toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(val)) {
            textAnswer = 'ABCD'.indexOf(val);
          } else {
            textAnswer = parseInt(val, 10) || 0;
          }
        }
      }

      if (detectedPrompt && textOptions.length >= 2) {
        return {
          prompt: detectedPrompt,
          options: textOptions,
          answerKey: Math.min(Math.max(0, textAnswer), textOptions.length - 1),
        };
      }
      return null;
    }

    const prompt = promptMatch[1].trim();

    // 4. Answer key extraction
    let answerKey = detectedAnswerKey >= 0 ? detectedAnswerKey : 0;
    const answerKeyMatch = clean.match(/:(?:answer-key|ans|answerKey|answer_key)\s+(\d+)/i);
    if (answerKeyMatch) {
      const parsedKey = parseInt(answerKeyMatch[1], 10);
      if (!isNaN(parsedKey)) {
        answerKey = parsedKey;
      }
    }

    // 5. Scratchpad
    const scratchpadMatch = clean.match(/:(?:scratchpad|calc|reasoning)\s+"([^"]+)"/i);
    const scratchpad = scratchpadMatch ? scratchpadMatch[1].trim() : undefined;

    // 6. Hint
    const hintMatch =
      clean.match(/:hint\s+"([^"]+)"/i) ||
      clean.match(/:hints\s+\((?:list\s+)?(?:"([^"]+)")?/i) ||
      clean.match(/:hints\s+"([^"]+)"/i);
    const hint = hintMatch ? hintMatch[1].trim() : undefined;

    // 7. Misconceptions
    const miscMatch = clean.match(/:(?:misconceptions|misc)\s+[\(\[](?:list\s+)?([^\]\)]*)[\)\]]/i);
    let misconceptions: string[] | undefined = undefined;
    if (miscMatch) {
      const parsedMiscs = [...miscMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1].trim());
      if (parsedMiscs.length > 0) {
        misconceptions = parsedMiscs;
      }
    }

    // 8. Socratic Follow-up
    const socraticMatch = clean.match(/:(?:socratic-followup|socratic|followup)\s+"([^"]+)"/i);
    const socraticFollowUp = socraticMatch ? socraticMatch[1].trim() : undefined;

    return {
      prompt,
      options: optionMatches,
      answerKey: isNaN(answerKey) ? 0 : Math.min(Math.max(0, answerKey), optionMatches.length - 1),
      scratchpad,
      hint,
      misconceptions,
      socraticFollowUp,
    };
  } catch (err) {
    console.error('[AST Extractor] Parse error:', err);
    return null;
  }
}

/**
 * Strips cosmetic pedagogical emoji headers and bracketed tags
 * (e.g. "🔄 [Mastery Check] ", "🌍 [Step 1: Real-World Hook] ")
 * to extract the authentic question stem for strict deduplication.
 */
export function stripPromptDecorators(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return '';
  return prompt
    .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '')
    .replace(/^\[[^\]]+\]\s*/, '')
    .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '')
    .trim();
}

/**
 * Extracts a complete Data Cartridge payload (curriculum unit, stage, subject, axioms, and questions)
 * from either JSON format or an AST S-Expression (:cartridge :type :data ...).
 */
export function extractDataPayloadFromAst(raw: string): DataCartridgePayload | null {
  if (!raw || typeof raw !== 'string') return null;

  // 1. JSON check
  const jsonMatch = raw.trim().match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const questionsRaw = parsed.questions || parsed.dataPayload?.questions;
      if (Array.isArray(questionsRaw) && questionsRaw.length > 0) {
        return {
          unit: parsed.unit || parsed.dataPayload?.unit || 'General Curriculum Unit',
          subject: parsed.subject || parsed.dataPayload?.subject || 'Curriculum',
          stage: parsed.stage || parsed.dataPayload?.stage || 'Key Stage 2',
          axiom: parsed.axiom || parsed.dataPayload?.axiom,
          trap: parsed.trap || parsed.dataPayload?.trap,
          socraticPivot: parsed.socraticPivot || parsed.dataPayload?.socraticPivot,
          hook: parsed.hook || parsed.dataPayload?.hook,
          guidedStep: parsed.guidedStep || parsed.dataPayload?.guidedStep,
          questions: questionsRaw.map((q: any, i: number) => ({
            id: q.id || `q-${i + 1}`,
            prompt: String(q.prompt || q.question || '').trim(),
            options: Array.isArray(q.options) ? q.options.map(String) : [],
            answer: typeof q.answer === 'number' ? q.answer : (typeof q.answerKey === 'number' ? q.answerKey : 0),
            hint: q.hint,
            explanation: q.explanation,
            tier: q.tier || 'application',
            topic: q.topic,
            misconceptions: Array.isArray(q.misconceptions) ? q.misconceptions.map(String) : undefined,
          })).filter((q) => q.prompt && q.options.length >= 2),
        };
      }
    } catch {}
  }

  // 2. AST S-Expression parse
  const clean = healSExprString(raw);
  const stageMatch = clean.match(/:stage\s+"([^"]+)"/i);
  const subjectMatch = clean.match(/:subject\s+"([^"]+)"/i);
  const unitMatch = clean.match(/:(?:unit|topic)\s+"([^"]+)"/i);
  const axiomMatch = clean.match(/:axiom\s+"([^"]+)"/i);
  const trapMatch = clean.match(/:(?:trap|misconception)\s+"([^"]+)"/i);
  const pivotMatch = clean.match(/:(?:socratic-pivot|socraticPivot)\s+"([^"]+)"/i);
  const hookMatch = clean.match(/:hook\s+"([^"]+)"/i);
  const guidedStepMatch = clean.match(/:guided-step\s+"([^"]+)"/i);

  // Extract question blocks: either (:q ...) or (:question ...)
  const qBlockRegex = /\((?:q|question)\s+([\s\S]*?)(?=\n\s*\((?:q|question)|\n\s*\)\s*\)|$)/gi;
  const questions: DataCartridgeQuestion[] = [];
  let match: RegExpExecArray | null;
  let qIndex = 1;

  while ((match = qBlockRegex.exec(clean)) !== null) {
    const block = match[1];
    const idMatch = block.match(/:id\s+"([^"]+)"/i);
    const pMatch = block.match(/:prompt\s+"([^"]+)"/i) || block.match(/:q\s+"([^"]+)"/i);
    const optsMatch = block.match(/:options\s+[\(\[](?:list\s+)?([^\]\)]*)[\)\]]/i);
    const ansMatch = block.match(/:(?:answer|answer-key|ans)\s+(\d+)/i);
    const hintMatch = block.match(/:hint\s+"([^"]+)"/i);
    const expMatch = block.match(/:explanation\s+"([^"]+)"/i);
    const tierMatch = block.match(/:tier\s+"([^"]+)"/i);
    const miscMatch = block.match(/:(?:misconceptions|misc)\s+[\(\[](?:list\s+)?([^\]\)]*)[\)\]]/i);

    if (pMatch && optsMatch) {
      const opts = [...optsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1].trim());
      if (opts.length >= 2) {
        const miscs = miscMatch ? [...miscMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1].trim()) : undefined;
        questions.push({
          id: idMatch ? idMatch[1] : `q-${qIndex}`,
          prompt: pMatch[1].trim(),
          options: opts,
          answer: ansMatch ? parseInt(ansMatch[1], 10) : 0,
          hint: hintMatch ? hintMatch[1].trim() : undefined,
          explanation: expMatch ? expMatch[1].trim() : undefined,
          tier: (tierMatch ? tierMatch[1] : 'application') as any,
          misconceptions: miscs && miscs.length > 0 ? miscs : undefined,
        });
        qIndex++;
      }
    }
  }

  if (questions.length === 0) return null;

  return {
    stage: stageMatch ? stageMatch[1] : 'Key Stage 2',
    subject: subjectMatch ? subjectMatch[1] : 'Science',
    unit: unitMatch ? unitMatch[1] : 'Curriculum Unit',
    axiom: axiomMatch ? axiomMatch[1] : undefined,
    trap: trapMatch ? trapMatch[1] : undefined,
    socraticPivot: pivotMatch ? pivotMatch[1] : undefined,
    hook: hookMatch ? hookMatch[1] : undefined,
    guidedStep: guidedStepMatch ? guidedStepMatch[1] : undefined,
    questions,
  };
}

/**
 * Serializes a Data Cartridge payload into canonical declarative AST S-Expressions.
 */
export function serializeDataCartridgeToAst(payload: DataCartridgePayload, id: string, title: string): string {
  const sanitize = (s?: string) => (s ? s.replace(/"/g, '\\"') : '');
  let ast = `(:cartridge :type :data :id "${sanitize(id)}" :title "${sanitize(title)}" :stage "${sanitize(payload.stage)}" :subject "${sanitize(payload.subject)}" :unit "${sanitize(payload.unit)}"\n`;
  if (payload.axiom) ast += `  (:axiom "${sanitize(payload.axiom)}")\n`;
  if (payload.trap) ast += `  (:trap "${sanitize(payload.trap)}")\n`;
  if (payload.socraticPivot) ast += `  (:socratic-pivot "${sanitize(payload.socraticPivot)}")\n`;
  if (payload.hook) ast += `  (:hook "${sanitize(payload.hook)}")\n`;
  if (payload.guidedStep) ast += `  (:guided-step "${sanitize(payload.guidedStep)}")\n`;

  ast += `  (:questions (\n`;
  for (const q of payload.questions) {
    ast += `    (:q :id "${sanitize(q.id)}" :prompt "${sanitize(q.prompt)}"\n`;
    ast += `        :options (${q.options.map((o) => `"${sanitize(o)}"`).join(' ')})\n`;
    ast += `        :answer ${q.answer}\n`;
    if (q.tier) ast += `        :tier "${sanitize(q.tier)}"\n`;
    if (q.hint) ast += `        :hint "${sanitize(q.hint)}"\n`;
    if (q.explanation) ast += `        :explanation "${sanitize(q.explanation)}"\n`;
    if (q.misconceptions && q.misconceptions.length > 0) {
      ast += `        :misconceptions (${q.misconceptions.map((m) => `"${sanitize(m)}"`).join(' ')})\n`;
    }
    ast += `    )\n`;
  }
  ast += `  ))\n)\n`;
  return ast;
}