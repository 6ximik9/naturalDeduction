import { parseAndCheck, runTestGroup } from './test-utils.js';

const constantTests = [
  ['P(A)', 'Uppercase constant A'],
  ['P(A, x)', 'Constant A and variable x'],
  ['(∀x)P(x) ⇒ P(A)', 'Universal elimination to constant'],
  ['∀X P(X)', 'Uppercase letter as variable (valid by grammar)'],
  ['P(Γ)', 'Greek uppercase constant'],
  ['A + B = C', 'Constants in arithmetic']
];

console.log('=== Constant Value Tests ===');

runTestGroup('Uppercase Constants', constantTests, { showAST: false });

// Specific AST check for one case
console.log('\n--- Detailed AST Check: P(X, x) ---');
parseAndCheck('P(X, x)', { showAST: true });
