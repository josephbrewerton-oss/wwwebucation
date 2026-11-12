// scripts/export-curriculum-lisp.ts
/**
 * Exports canonical TypeScript curriculum knowledge base into declarative Lisp S-Expressions
 * Generates static/curriculum/curriculum-knowledge.ast
 */

import * as fs from 'fs';
import * as path from 'path';
import { CURRICULUM_COMPLETE_BASE } from '../src/data/curriculumKnowledgeComplete';
import { serializeCatalogueToLisp, parseLispTopic, serializeTopicToLisp } from '../src/utils/lispCurriculumCodec';

const ROOT_DIR = process.cwd();
const TARGET_DIR = path.join(ROOT_DIR, 'static', 'curriculum');
const TARGET_FILE = path.join(TARGET_DIR, 'curriculum-knowledge.ast');

function run() {
  console.log('[Lisp Curriculum Exporter] Converting curriculum knowledge to declarative Lisp S-Expressions...');

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const topicCount = Object.keys(CURRICULUM_COMPLETE_BASE).length;
  console.log(`[Lisp Curriculum Exporter] Found ${topicCount} canonical curriculum topics`);

  // Verify round-trip parsing on first topic
  const sampleKey = Object.keys(CURRICULUM_COMPLETE_BASE)[0];
  const sample = CURRICULUM_COMPLETE_BASE[sampleKey];
  const sampleLisp = serializeTopicToLisp(sample);
  const parsedBack = parseLispTopic(sampleLisp);

  if (parsedBack.topicId !== sample.topicId || parsedBack.questions.length !== sample.questions.length) {
    throw new Error(`Round-trip verification failed for topic ${sample.topicId}`);
  }
  console.log(`[Lisp Curriculum Exporter] Sample round-trip verified: ${sample.title} (${sample.questions.length} questions)`);

  const lispContent = serializeCatalogueToLisp(CURRICULUM_COMPLETE_BASE);
  fs.writeFileSync(TARGET_FILE, lispContent, 'utf8');

  const byteSize = Buffer.byteLength(lispContent, 'utf8');
  console.log(`[Lisp Curriculum Exporter] Successfully exported ${topicCount} topics to ${TARGET_FILE} (${(byteSize / 1024).toFixed(1)} KB)`);
}

run();
