// src/utils/lispCurriculumCodec.ts
/**
 * Lisp S-Expression Curriculum & Question Bank Codec
 * 
 * Provides zero-bloat bidirectional serialization between TypeScript CurriculumTopicEntry
 * and pure declarative Lisp S-Expressions (.ast.data / .ast).
 * 
 * Features:
 * - Deterministic S-Expression parsing & serialization
 * - GBNF grammar compatibility for local on-device LLM generation (Gemini Nano)
 * - Zero external dependencies, sub-millisecond execution
 * - Single source of truth for air-gapped optical QR & P2P mesh transfer
 */

import { CurriculumTopicEntry } from '../data/curriculumKnowledgeExpansion';

export interface LispCurriculumQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerKey: number;
  hint?: string;
  explanation: string;
}

/**
 * Escapes strings for Lisp S-Expression quotation
 */
function escapeLispString(str: string | undefined): string {
  if (!str) return '""';
  return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}

/**
 * Serializes a single CurriculumTopicEntry into a declarative Lisp S-Expression
 */
export function serializeTopicToLisp(entry: CurriculumTopicEntry): string {
  const hints: Record<string, string> = (entry.scaffoldHints as any) || {};
  const questions = (entry.questions || []).map(q => {
    const opts = (q.options || []).map(opt => escapeLispString(opt)).join(' ');
    return `    (:question :id ${escapeLispString(q.id)} :prompt ${escapeLispString(q.prompt)}
      (:options ${opts})
      :answer ${q.answerKey}
      :hint ${escapeLispString(q.hint)}
      :explanation ${escapeLispString(q.explanation)})`;
  }).join('\n');

  return `(:topic
  :id ${escapeLispString(entry.topicId)}
  :title ${escapeLispString(entry.title)}
  :key-stage ${escapeLispString(entry.keyStage)}
  :subject ${escapeLispString(entry.subject)}
  :axiom ${escapeLispString(entry.coreAxiom)}
  :trap ${escapeLispString(entry.cognitiveTrap)}
  :pivot ${escapeLispString(entry.socraticPivot)}
  :hook ${escapeLispString(entry.hook)}
  :guided-step ${escapeLispString(entry.guidedStep)}
  (:hints
    :l1 ${escapeLispString(hints.level1)}
    :l2 ${escapeLispString(hints.level2)}
    :l3 ${escapeLispString(hints.level3)})
  (:questions
${questions}
  )
)`;
}

/**
 * Tokenizer helper to extract balanced S-expression blocks
 */
function extractLispBlocks(text: string, tag: string): string[] {
  const blocks: string[] = [];
  const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startRegex = new RegExp('\\(' + safeTag + '[\\s)]', 'gi');
  let m: RegExpExecArray | null;

  while ((m = startRegex.exec(text)) !== null) {
    const startIdx = m.index;
    let depth = 0;
    let inString = false;
    let endIdx = -1;

    for (let i = startIdx; i < text.length; i++) {
      const char = text[i];
      if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
        inString = !inString;
      } else if (!inString) {
        if (char === '(') depth++;
        else if (char === ')') {
          depth--;
          if (depth === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
    }

    if (endIdx !== -1) {
      blocks.push(text.slice(startIdx, endIdx));
    }
  }

  return blocks;
}

/**
 * Helper to extract slot values from an S-expression
 */
function extractSlot(text: string, key: string): string | null {
  const reg = new RegExp(`:${key}\\s+"((?:[^"\\\\]|\\\\.)*)"`, 'i');
  const m = text.match(reg);
  if (m) {
    return m[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
  }
  const fallbackReg = new RegExp(`:${key}\\s+([^\\s)]+)`, 'i');
  const fb = text.match(fallbackReg);
  return fb ? fb[1] : null;
}

/**
 * Parses a declarative Lisp S-Expression topic into a typed CurriculumTopicEntry
 */
export function parseLispTopic(lispText: string): CurriculumTopicEntry {
  const topicId = extractSlot(lispText, 'id') || 'unnamed-topic';
  const title = extractSlot(lispText, 'title') || 'Curriculum Topic';
  const keyStage = extractSlot(lispText, 'key-stage') || 'Key Stage 3';
  const subject = extractSlot(lispText, 'subject') || 'General';
  const coreAxiom = extractSlot(lispText, 'axiom') || '';
  const cognitiveTrap = extractSlot(lispText, 'trap') || '';
  const socraticPivot = extractSlot(lispText, 'pivot') || '';
  const hook = extractSlot(lispText, 'hook') || '';
  const guidedStep = extractSlot(lispText, 'guided-step') || '';

  // Hints
  const hintBlocks = extractLispBlocks(lispText, ':hints');
  let level1 = '';
  let level2 = '';
  let level3 = '';
  if (hintBlocks.length > 0) {
    level1 = extractSlot(hintBlocks[0], 'l1') || '';
    level2 = extractSlot(hintBlocks[0], 'l2') || '';
    level3 = extractSlot(hintBlocks[0], 'l3') || '';
  }

  // Questions
  const qBlocks = extractLispBlocks(lispText, ':question');
  const questions: any[] = qBlocks.map(qText => {
    const qId = extractSlot(qText, 'id') || `q_${Date.now()}`;
    const prompt = extractSlot(qText, 'prompt') || '';
    const answerKeyStr = extractSlot(qText, 'answer') || '0';
    const answerKey = parseInt(answerKeyStr, 10) || 0;
    const hint = extractSlot(qText, 'hint') || '';
    const explanation = extractSlot(qText, 'explanation') || '';

    // Options extraction
    const optMatch = qText.match(/\(:options\s+([\s\S]*?)\)/i);
    const options: string[] = [];
    if (optMatch) {
      const optStr = optMatch[1];
      const optRegex = /"((?:[^"\\]|\\.)*)"/g;
      let om: RegExpExecArray | null;
      while ((om = optRegex.exec(optStr)) !== null) {
        options.push(om[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\'));
      }
    }

    return {
      id: qId,
      prompt,
      options: options.length > 0 ? options : ['Correct', 'Incorrect'],
      answerKey,
      hint,
      explanation
    };
  });

  return {
    topicId,
    title,
    keyStage,
    subject,
    coreAxiom,
    cognitiveTrap,
    socraticPivot,
    hook,
    guidedStep,
    scaffoldHints: { level1, level2, level3 },
    questions
  };
}

/**
 * Serializes an entire curriculum catalogue dictionary to a single Lisp S-Expression file
 */
export function serializeCatalogueToLisp(catalogue: Record<string, CurriculumTopicEntry>): string {
  const header = `;; static/curriculum/curriculum-knowledge.ast
;; St Joseph's Curriculum Portal - Declarative Lisp Knowledge Base
;; SPDX-License-Identifier: AGPL-3.0-or-later OR OGL-3.0
;; Generated: ${new Date().toISOString()}

(:curriculum-catalogue
  :version "1.0.0"
  :standards ("UK-National-Curriculum" "Catholic-Bishops-Conference-CES" "GCSE-Theology")
  :topics (
`;

  const topics = Object.values(catalogue)
    .map(topic => serializeTopicToLisp(topic))
    .join('\n\n');

  const footer = `\n  )\n)\n`;
  return header + topics + footer;
}
