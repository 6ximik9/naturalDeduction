import { execSync } from 'child_process';

const tests = [
  'tests/grammar-test.js',
  'tests/robinson-test.js',
  'tests/formatter-test.js',
  'tests/constant-test.js',
  'tests/runTests.js'
];

console.log('🚀 Running all test suites...\n');

let failed = 0;

tests.forEach(test => {
  console.log(`▶ Executing: ${test}`);
  try {
    execSync(`node ${test}`, { stdio: 'inherit' });
    console.log(`✅ ${test} passed\n`);
  } catch (error) {
    console.log(`❌ ${test} failed\n`);
    failed++;
  }
});

console.log('==========================================');
if (failed === 0) {
  console.log('🎉 ALL TEST SUITES PASSED!');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed} test suite(s) failed.`);
  process.exit(1);
}
