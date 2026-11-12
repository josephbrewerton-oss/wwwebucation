// tests/test-lisp-curriculum.ts
import * as fs from 'fs';
import * as path from 'path';
import { parseLispTopic } from '../src/utils/lispCurriculumCodec';

function runTests() {
  console.log('[Test Lisp Curriculum] Verifying static/curriculum/curriculum-knowledge.ast...');
  const filePath = path.join(process.cwd(), 'static', 'curriculum', 'curriculum-knowledge.ast');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Curriculum Lisp file not found at ${filePath}`);
  }

  const text = fs.readFileSync(filePath, 'utf8');
  if (!text.includes('(:curriculum-catalogue') || !text.includes('(:topic')) {
    throw new Error('Invalid Lisp curriculum structure');
  }

  // Count topics
  const topicMatches = text.match(/\(:topic[\s\S]*?\n\)/g) || [];
  console.log(`[Test Lisp Curriculum] Found ${topicMatches.length} Lisp topic blocks`);

  if (topicMatches.length < 10) {
    throw new Error(`Expected at least 10 topics, got ${topicMatches.length}`);
  }

  // Parse every topic and ensure validity
  let totalQuestions = 0;
  topicMatches.forEach((tText, idx) => {
    const parsed = parseLispTopic(tText);
    if (!parsed.topicId || !parsed.title || !parsed.coreAxiom) {
      throw new Error(`Topic at index ${idx} missing required fields: ${JSON.stringify(parsed)}`);
    }
    totalQuestions += parsed.questions.length;
  });

  console.log(`[Test Lisp Curriculum] Successfully parsed all ${topicMatches.length} topics containing ${totalQuestions} formative questions.`);
  console.log('✅ ALL LISP CURRICULUM TESTS PASSED!');
}

runTests();
