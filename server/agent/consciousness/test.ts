/**
 * Test script for Consciousness Engine
 * Run with: npx tsx server/agent/consciousness/test.ts
 */

import { ConsciousnessEngine } from './engine';

async function testConsciousness() {
  console.log('🧠 Testing Consciousness Engine Physics...\n');

  const engine = new ConsciousnessEngine();

  // 1. Initial State
  console.log('1️⃣ Initial State:');
  console.log(engine.getState());

  // 2. Stimulate Failure (Increase Guilt, Lower Willpower)
  console.log('\n2️⃣ Simulating repeated failures...');

  for (let i = 1; i <= 4; i++) {
    const state = engine.processStimulus({
      type: 'failure',
      magnitude: 0.8,
      description: `Test Failure ${i}`
    });
    console.log(`\n--- Failure ${i} ---`);
    console.log(`Mood: ${state.currentMood}`);
    console.log(`Guilt: ${state.guilt.toFixed(2)}`);
    console.log(`Willpower: ${state.willpower.toFixed(2)}`);
    console.log(`Needs Reflection: ${state.needsReflection}`);

    if (state.needsReflection) {
      console.log('✅ REFLECTION TRIGGERED!');
      break;
    }
  }

  // 3. Stimulate Success (Recovery)
  console.log('\n3️⃣ Simulating success (Recovery)...');
  const state = engine.processStimulus({
    type: 'success',
    magnitude: 0.9,
    description: 'Great Success'
  });
  console.log(`Mood: ${state.currentMood}`);
  console.log(`Confidence: ${state.confidence.toFixed(2)}`);
  console.log(`Guilt: ${state.guilt.toFixed(2)}`);
}

testConsciousness();
