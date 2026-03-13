import { runTestGroup } from './test-utils.js';

const axioms = [
  ['∀x ∀y (s(x) = s(y) ⇒ x = y)', 'ax1'],
  ['∀x (0 ≠ s(x))', 'ax2'],
  ['∀x (x ≠ 0 ⇒ ∃y (x = s(y)))', 'ax3'],
  ['∀x (x + 0 = x)', 'ax4'],
  ['∀x ∀y (x + s(y) = s(x + y))', 'ax5'],
  ['∀x (x * 0 = 0)', 'ax6'],
  ['∀x ∀y (x * s(y) = (x * y) + x)', 'ax7']
];

const construction = [
  ['0', 'zero'],
  ['s(0)', 'one'],
  ['s(s(0))', 'two'],
  ['s(s(s(0)))', 'three']
];

const arithmetic = [
  ['x + y', 'addition'],
  ['x * y', 'multiplication'],
  ['x + y + z', 'multiple addition'],
  ['x * y * z', 'multiple multiplication'],
  ['(x + y) * z', 'precedence'],
  ['s(x) + s(y)', 'successor addition']
];

const equality = [
  ['x = y', 'equality'],
  ['x ≠ y', 'not equal'],
  ['x != y', 'not equal alt'],
  ['x <> y', 'not equal alt 2']
];

const complex = [
  ['∀x (x + 0 = x)', 'quantified identity'],
  ['∃x (x + x = s(s(0)))', 'existence'],
  ['∀x ∀y ∀z ((x + y) + z = x + (y + z))', 'associativity']
];

console.log('=== Robinson Arithmetic (Q) Parse Tests ===');

runTestGroup('Axioms', axioms);
runTestGroup('Construction', construction);
runTestGroup('Arithmetic', arithmetic);
runTestGroup('Equality', equality);
runTestGroup('Complex/Quantified', complex);
