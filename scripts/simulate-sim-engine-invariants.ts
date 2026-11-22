// scripts/simulate-sim-engine-invariants.ts
/**
 * Orchestrator: Simulation Engine Invariants & Edge Verification Suite
 * Runs all 28 invariant tests across 7 focused domain modules under scripts/invariants/.
 * Optional CLI filter: `npx tsx scripts/simulate-sim-engine-invariants.ts <suite-key>`
 */

import { runCoreUiInvariants } from './invariants/sim-core-ui';
import { runPhysicsLabsInvariants } from './invariants/sim-physics-labs';
import { runAiWebMcpInvariants } from './invariants/sim-ai-webmcp';
import { runGesturesCoreInvariants } from './invariants/sim-gestures-core';
import { runGesturesStemParamsInvariants } from './invariants/sim-gestures-stem-params';
import { runModularArchitectureInvariants } from './invariants/sim-modular-architecture';
import { runAudioMobileInvariants } from './invariants/sim-audio-mobile';

const SUITES: Array<{ key: string; run: () => Promise<number> }> = [
  { key: 'core-ui', run: runCoreUiInvariants },
  { key: 'physics-labs', run: runPhysicsLabsInvariants },
  { key: 'ai-webmcp', run: runAiWebMcpInvariants },
  { key: 'gestures-core', run: runGesturesCoreInvariants },
  { key: 'gestures-stem-params', run: runGesturesStemParamsInvariants },
  { key: 'modular-architecture', run: runModularArchitectureInvariants },
  { key: 'audio-mobile', run: runAudioMobileInvariants },
];

async function main() {
  console.log('=============================================================');
  console.log("🔬 St Joseph's Simulation Engine & Physical Invariant Harness");
  console.log('=============================================================\n');

  const filter = (process.argv[2] || '').trim().toLowerCase();
  const selected = filter ? SUITES.filter((s) => s.key.includes(filter)) : SUITES;

  if (selected.length === 0) {
    console.error(`Unknown invariant suite filter "${filter}". Available: ${SUITES.map((s) => s.key).join(', ')}`);
    process.exit(1);
  }

  let passedTests = 0;
  for (const suite of selected) {
    passedTests += await suite.run();
  }

  console.log('\n=============================================================');
  console.log(`🎉 ALL ${passedTests} SIMULATION INVARIANT TESTS PASSED!`);
  console.log('=============================================================');
}

main().catch((err) => {
  console.error('❌ Simulation Invariant Suite Failed:', err);
  process.exit(1);
});
