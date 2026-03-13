import { runTestGroup } from './test-utils.js';

const robinsonAxioms = [
  ['∀x ∀y (s(x) = s(y) ⇒ x = y)', 'ax1: successor injectivity'],
  ['∀x (0 ≠ s(x))', 'ax2: zero is not a successor'],
  ['∀x (x ≠ 0 ⇒ ∃y (x = s(y)))', 'ax3: every non-zero has predecessor'],
  ['∀x (x + 0 = x)', 'ax4: addition base case'],
  ['∀x ∀y (x + s(y) = s(x + y))', 'ax5: addition recursion'],
  ['∀x (x * 0 = 0)', 'ax6: multiplication base case'],
  ['∀x ∀y (x * s(y) = (x * y) + x)', 'ax7: multiplication recursion']
];

const folTests = [
  ['(∃x)((∀y)R(x, y)) -> (∀y)((∃x)R(x,y))', 'quantifier exchange'],
  ['(∀y)(∃x)R(x,y)', 'nested quantifiers'],
  ['(∀x)R1(x) → ((∀x)R2(x) → (∀y)(R1(y) ∧ R2(y)))', 'complex implication'],
  ['(∃x)R1(x) -> (∃x)(R1(x) ∨ R2(x))', 'existential disjunction'],
  ['(∀x)(P(x)&Q(x))|(∃x)R(x)', 'mixed quantifiers']
];

const greekTests = [
  ['(φ⇒ψ)⇒(¬φ⇒¬ψ)', 'Greek implication'],
  ['(φ⇒ψ)∧(ψ⇒θ)⇒(φ⇒θ)', 'Greek transitivity'],
  ['φ⇒¬¬φ', 'Greek double negation'],
  ['∀φ ∃ψ Φ(φ, ψ)', 'Greek quantified variables'],
  ['Φ(α, β, γ)', 'Greek predicate with args']
];

const arithmeticTests = [
  ['x + y = z', 'simple addition'],
  ['x * y = z', 'simple multiplication'],
  ['s(x) = y', 'successor function'],
  ['x + (y * z) = w', 'mixed arithmetic'],
  ['(x + y) * z = w', 'parenthesized arithmetic'],
  ['s(s(s(0))) = 3', 'nested successors'],
  ['+(x, y) = z', 'prefix addition'],
  ['*(x, y) = z', 'prefix multiplication']
];

const edgeCases = [
  ['φ, ψ ⊢ φ ∧ ψ', 'sequent with Greek'],
  ['P(x), ∀x (P(x) ⇒ Q(x)) ⊢ Q(x)', 'sequent with quantifiers'],
  ['((((φ⇒ψ)⇒θ)⇒α)⇒β)', 'deep nesting'],
  ['∀x ∃φ P(x, φ)', 'mixed Greek and Latin variables'],
  ['∀α (α + 0 = α)', 'Greek in Robinson arithmetic']
];

const comparisonTests = [
  ['x < y', 'less than'],
  ['x > y', 'greater than'],
  ['x <= y', 'less than or equal'],
  ['x >= y', 'greater than or equal'],
  ['x + y < z * w', 'comparison with arithmetic'],
  ['∀x (x < s(x))', 'quantified comparison'],
  ['∀x ¬(x < x)', 'irreflexivity axiom'],
  ['x < y ∧ y < z ⇒ x < z', 'transitivity property']
];

console.log('=== Grammar Integrity Tests ===');

runTestGroup('Robinson Axioms', robinsonAxioms);
runTestGroup('Basic FOL', folTests);
runTestGroup('Greek Letters', greekTests);
runTestGroup('Arithmetic', arithmeticTests);
runTestGroup('Edge Cases', edgeCases);
runTestGroup('Comparisons', comparisonTests);
