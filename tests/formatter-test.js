import { parseAndCheck } from './test-utils.js';
import { formulaToString } from '../js/core/formatter.js';

function testBracketPlacement(formula, description = '') {
  try {
    console.log(`\nTesting: ${formula}${description ? ' // ' + description : ''}`);

    const parsed = parseAndCheck(formula, { quiet: true });
    if (!parsed) throw new Error('Initial parse failed');

    const formattedWithParens = formulaToString(parsed, 1);
    console.log(`✓ Formatted (with parens): ${formattedWithParens}`);

    const formattedMinimal = formulaToString(parsed, 0);
    console.log(`✓ Formatted (minimal): ${formattedMinimal}`);

    const reparsed = parseAndCheck(formattedMinimal, { quiet: true });
    if (!reparsed) throw new Error('Round-trip parse failed');
    
    const reformatted = formulaToString(reparsed, 0);
    if (reformatted !== formattedMinimal) {
      throw new Error(`Round-trip mismatch: ${reformatted} !== ${formattedMinimal}`);
    }

    console.log(`✓ Round-trip successful`);
    return true;
  } catch (error) {
    console.log(`  ✗ FAILED: ${error.message}`);
    return false;
  }
}

const testCases = [
  ['P ∧ Q ∨ R', 'conjunction and disjunction precedence'],
  ['P ∨ Q ∧ R', 'disjunction and conjunction precedence'],
  ['P ⇒ Q ∧ R', 'implication and conjunction precedence'],
  ['P ∧ Q ⇒ R', 'conjunction and implication precedence'],
  ['¬P ∧ Q', 'negation and conjunction precedence'],
  ['¬(P ∧ Q)', 'negation with explicit parentheses'],
  ['x + y * z = w', 'addition and multiplication precedence in equality'],
  ['x * y + z = w', 'multiplication and addition precedence in equality'],
  ['(x + y) * z = w', 'addition with explicit parentheses in equality'],
  ['x + (y * z) = w', 'multiplication with explicit parentheses in equality'],
  ['P(x + y * z)', 'predicate with arithmetic'],
  ['x + y = z * w', 'equality with mixed arithmetic'],
  ['∀x (P(x) ∧ Q(x))', 'quantifier with conjunction'],
  ['∀x P(x) ∧ Q(x)', 'quantifier precedence with conjunction'],
  ['∃x (P(x) ⇒ Q(x))', 'quantifier with implication'],
  ['(P ∧ Q) ∨ (R ∧ S)', 'nested conjunctions in disjunction'],
  ['P ∧ Q ∨ R ∧ S', 'mixed conjunction and disjunction'],
  ['P ⇒ Q ⇒ R', 'chained implications'],
  ['(P ⇒ Q) ⇒ R', 'implication with explicit parentheses'],
  ['P ⇒ (Q ⇒ R)', 'right-associative implication'],
  ['s(x) + y = z', 'successor function with addition in equality'],
  ['s(x + y) = z', 'successor of addition in equality'],
  ['s(s(x)) + s(y) = z', 'nested successors with addition in equality'],
  ['¬¬P', 'double negation'],
  ['¬(¬P)', 'double negation with parentheses'],
  ['P ∧ Q ∧ R', 'multiple conjunctions'],
  ['P ∨ Q ∨ R', 'multiple disjunctions'],
];

console.log('=== Formatter Precedence & Bracket Tests ===');

let passed = 0;
testCases.forEach(([formula, description]) => {
  if (testBracketPlacement(formula, description)) passed++;
});

console.log(`\nResult: ${passed}/${testCases.length} passed`);
if (passed !== testCases.length) process.exit(1);
