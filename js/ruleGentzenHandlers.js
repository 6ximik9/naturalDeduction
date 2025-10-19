import * as rules from './rulesGentzen';
import {deductionContext} from "./GentzenProof";
import {nineteenthRule, twentiethRule} from "./rulesGentzen";

// Robinson Arithmetic Axioms
export const ROBINSON_AXIOMS = [
  "∀x ∀y (s(x) = s(y) ⇒ x = y)", // ax1
  "∀x (0 ≠ s(x))", // ax2
  "∀x (x ≠ 0 ⇒ ∃y (x = s(y)))", // ax3
  "∀x (x + 0 = x)", // ax4
  "∀x ∀y (x + s(y) = s(x + y))", // ax5
  "∀x (x * 0 = 0)", // ax6
  "∀x ∀y (x * s(y) = (x * y) + x)" // ax7
];

// Всі правила виводу у вигляді LaTeX-формул
export const GENTZEN_BUTTONS = [
  "1. $$\\frac{\\bot}{\\phi} \\quad (\\bot E1) $$",
  "2. $${\\frac{[\\neg\\phi]}{\\vdots} \\atop \\frac{\\bot}{\\phi}} (\\bot E2) $$",
  "3. $$\\frac{}{\\top} \\quad (\\top I) $$",
  "4. $${\\frac{[\\phi]}{\\vdots} \\atop \\frac{\\bot}{\\neg\\phi}} (\\neg I) $$",
  "5. $$ \\frac{\\phi \\quad \\quad \\neg \\phi }{\\bot} \\quad (\\neg E)$$",
  "6. $$\\frac{\\phi \\quad \\quad \\psi}{\\phi \\wedge \\psi} (\\wedge I)$$",
  "7. $$\\frac{\\phi \\wedge \\psi}{\\phi} (\\wedge E1)$$",
  "8. $$\\frac{\\phi \\wedge \\psi}{\\psi} (\\wedge E2)$$",
  "9. $$\\frac{\\phi}{\\phi \\vee \\psi} (\\vee I1)$$",
  "10. $$ \\frac{\\psi}{\\phi \\vee \\psi} (\\vee I2) $$",
  "11. $$ \\frac{\\phi \\vee \\psi \\quad \\quad \\theta \\quad \\quad \\theta}{ \\theta} (\\vee E) $$",
  "12. $$\\frac{\\psi}{\\phi \\Rightarrow \\psi} (\\Rightarrow I)$$",
  "13. $$ \\frac{\\phi \\quad \\quad \\phi \\Rightarrow \\psi }{\\psi} (\\Rightarrow E) $$",
  "14. $$ \\frac{\\varphi[t/x]}{(\\exists x)\\varphi} \\; (\\exists I) $$",
  "15. $$ \\frac{\\varphi[t/x]}{(\\forall x)\\varphi} \\; (\\forall I) \\; \\tiny t \\text{ fresh} $$",
  "16. $$ \\frac{(\\forall x)\\varphi}{\\varphi[t/x]} \\; (\\forall E) $$",
  "17. $$ \\frac{(\\exists x)\\varphi \\quad {\\normalsize \\frac{[\\varphi[t/x]]}{\\vdots} \\atop \\normalsize \\psi}}{\\psi} \\; (\\exists E) \\; \\tiny t \\text{ fresh} $$",
  "18. $$\\frac{P(a) \\quad a = b}{P(b)} \\; (\\text{=E}_1)$$",
  "19. $$\\frac{P(b) \\quad a = b}{P(a)} \\; (\\text{=E}_2)$$",
  "20. $$\\frac{P(a) \\quad P(b)}{a = b} \\; (\\text{=I})$$"
];


// Helper function to get the value from different node types
function getValue(expr) {
  return expr.value || expr.name;
}

// Helper function to check if expression is not negation, top, or bottom
function isRegularExpression(expr) {
  const value = getValue(expr);
  return expr.type !== 'negation' && value !== '⊤' && value !== '⊥';
}

export const ruleGentzenHandlers = {
  "\\bot E1": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.firstRule(),
    requiresTree: true
  },
  "\\bot E2": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.secondRule(deductionContext),
    requiresTree: true
  },
  "\\top I": {
    condition: (expr) => getValue(expr) === '⊤',
    action: () => rules.thirdRule(),
    requiresTree: true
  },
  "\\neg I": {
    condition: (expr) => expr.type === 'negation',
    action: () => rules.fourthRule(),
    requiresTree: true
  },
  "\\neg E": {
    condition: (expr) => getValue(expr) === '⊥',
    action: () => rules.fifthRule(),
    requiresTree: false
  },
  "\\wedge I": {
    condition: (expr) => expr.type === 'conjunction',
    action: () => rules.sixthRule(),
    requiresTree: true
  },
  "\\wedge E1": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.seventhRule(deductionContext),
    requiresTree: false
  },
  "\\wedge E2": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.eighthRule(deductionContext),
    requiresTree: false
  },
  "\\vee I1": {
    condition: (expr) => expr.type === 'disjunction',
    action: () => rules.ninthRule(),
    requiresTree: true
  },
  "\\vee I2": {
    condition: (expr) => expr.type === 'disjunction',
    action: () => rules.tenthRule(),
    requiresTree: true
  },
  "\\vee E": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.eleventhRule(),
    requiresTree: false
  },
  "\\Rightarrow I": {
    condition: (expr) => expr.type === 'implication',
    action: () => rules.twelfthRule(),
    requiresTree: true
  },
  "\\Rightarrow E": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.thirteenthRule(),
    requiresTree: false
  },
  "\\exists I": {
    condition: (expr) => (expr.type === 'quantifier' && expr.quantifier === '∃') || expr.type === 'exists',
    action: async () => await rules.fourteenthRule(),
    requiresTree: true
  },
  "\\forall I": {
    condition: (expr) => (expr.type === 'quantifier' && expr.quantifier === '∀') || expr.type === 'forall',
    action: async () => await rules.fifteenthRule(),
    requiresTree: true
  },
  "\\forall E": {
    condition: (expr) => expr.type === 'relation' || expr.type === 'predicate' || expr.type === 'equality' || expr.type === 'forall' || expr.type === 'exists' || expr.type==="successor",
    action: async () => await rules.sixteenthRule(),
    requiresTree: true
  },
  "\\exists E": {
    condition: (expr) => {
      const value = getValue(expr);
      return value !== '⊤' && value !== '⊥';
    },
    action: async () => await rules.seventeenthRule(),
    requiresTree: true,
    returnsResult: true
  },
  "\\text{=E}_1": {
    condition: (expr) => expr.type === 'relation' || expr.type === 'predicate' || expr.type === 'equality' || expr.type==="successor",
    action: async () => await rules.eighteenthRule(),
    requiresTree: true,
  },
  "\\text{=E}_2": {
    condition: (expr) => expr.type === 'relation' || expr.type === 'predicate' || expr.type === 'equality' || expr.type==="successor",
    action: async () => rules.nineteenthRule(),
    requiresTree: true,
  },
  "\\text{=I}": {
    condition: (expr) => expr.type === 'equality',
    action: () => rules.twentiethRule(),
    requiresTree: true,
  }
};
