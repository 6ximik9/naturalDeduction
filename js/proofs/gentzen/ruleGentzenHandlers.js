import * as rules from './rulesGentzen';
import {deductionContext, shakeButton} from "./GentzenProof";
import {nineteenthRule, twentiethRule, createAxiomConclusion} from "./rulesGentzen";
import {
  validateAxiom1,
  validateAxiom2,
  validateAxiom3,
  validateAxiom4,
  validateAxiom5,
  validateAxiom6,
  validateAxiom7,
  validateRobinsonAxioms
} from "../../core/robinsonAxiomValidator";
import {
  validateOrderAxiom1,
  validateOrderAxiom2,
  validateOrderAxiom3,
  validateOrderAxiom4
} from "../../core/orderAxiomValidator";

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

export const ORDER_AXIOMS = [
  "∀x ¬(x < x)",                         // Irreflexivity (Іррефлексивність)
  "∀x ∀y ∀z ((x < y ∧ y < z) ⇒ x < z)",  // Transitivity (Транзитивність)
  "∀x ∀y (x < y ∨ x = y ∨ y < x)",       // Trichotomy (Трихотомія)
  "∀x ∀y ∀z (x < y ⇒ x + z < y + z)"     // Compatibility with addition (Сумісність з додаванням)
];

// Axiom click handlers
export const AXIOM_HANDLERS = {
  1: {
    name: "Successor Injectivity",
    description: "The successor function is injective - if s(x) = s(y), then x = y",
    formula: "∀x ∀y (s(x) = s(y) ⇒ x = y)",
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateAxiom1(formula);
        if (result) {
          console.log(`✅ Формула відповідає аксіомі ${result.code}: ${result.desc}`);
          // Створюємо вузол дерева з текстом аксіоми
          createAxiomConclusion(ROBINSON_AXIOMS[0], 22);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  2: {
    name: "Zero is not a successor",
    description: "Zero is not the successor of any natural number",
    formula: "∀x (0 ≠ s(x))",
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateAxiom2(formula);
        if (result) {
          console.log(`✅ Формула відповідає аксіомі ${result.code}: ${result.desc}`);
          // Створюємо вузол дерева з текстом аксіоми
          createAxiomConclusion(ROBINSON_AXIOMS[1], 23);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  3: {
    name: "Predecessor existence",
    description: "Every non-zero number has a predecessor",
    formula: "∀x (x ≠ 0 ⇒ ∃y (x = s(y)))",
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateAxiom3(formula);
        if (result) {
          console.log(`✅ Формула відповідає аксіомі ${result.code}: ${result.desc}`);
          // Створюємо вузол дерева з текстом аксіоми
          createAxiomConclusion(ROBINSON_AXIOMS[2], 24);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  4: {
    name: "Addition identity",
    description: "Adding zero to any number gives the same number",
    formula: "∀x (x + 0 = x)",
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateAxiom4(formula);
        if (result) {
          console.log(`✅ Формула відповідає аксіомі ${result.code}: ${result.desc}`);
          // Створюємо вузол дерева з текстом аксіоми
          createAxiomConclusion(ROBINSON_AXIOMS[3], 25);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  5: {
    name: "Addition recursion",
    description: "Defines addition for successor numbers",
    formula: "∀x ∀y (x + s(y) = s(x + y))",
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateAxiom5(formula);
        if (result) {
          console.log(`✅ Формула відповідає аксіомі ${result.code}: ${result.desc}`);
          // Створюємо вузол дерева з текстом аксіоми
          createAxiomConclusion(ROBINSON_AXIOMS[4], 26);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  6: {
    name: "Multiplication by zero",
    description: "Multiplying any number by zero gives zero",
    formula: "∀x (x * 0 = 0)",
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateAxiom6(formula);
        if (result) {
          console.log(`✅ Формула відповідає аксіомі ${result.code}: ${result.desc}`);
          // Створюємо вузол дерева з текстом аксіоми
          createAxiomConclusion(ROBINSON_AXIOMS[5], 26);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  7: {
    name: "Multiplication recursion",
    description: "Defines multiplication for successor numbers",
    formula: "∀x ∀y (x * s(y) = (x * y) + x)",
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateAxiom7(formula);
        if (result) {
          console.log(`✅ Формула відповідає аксіомі ${result.code}: ${result.desc}`);
          // Створюємо вузол дерева з текстом аксіоми
          createAxiomConclusion(ROBINSON_AXIOMS[6], 27);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  8: {
    name: "Irreflexivity",
    description: "Irreflexivity of strict order: ¬(x < x)",
    formula: ORDER_AXIOMS[0],
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateOrderAxiom1(formula);
        if (result) {
          createAxiomConclusion(ORDER_AXIOMS[0], 28);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  9: {
    name: "Transitivity",
    description: "Transitivity of strict order",
    formula: ORDER_AXIOMS[1],
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateOrderAxiom2(formula);
        if (result) {
          createAxiomConclusion(ORDER_AXIOMS[1], 29);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  10: {
    name: "Trichotomy",
    description: "Trichotomy of strict order",
    formula: ORDER_AXIOMS[2],
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateOrderAxiom3(formula);
        if (result) {
          createAxiomConclusion(ORDER_AXIOMS[2], 30);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  },
  11: {
    name: "Compatibility with Addition",
    description: "Order is preserved under addition",
    formula: ORDER_AXIOMS[3],
    requiresTree: true,
    action: (formula, button) => {
      if (formula) {
        const result = validateOrderAxiom4(formula);
        if (result) {
          createAxiomConclusion(ORDER_AXIOMS[3], 31);
          return result;
        } else {
          shakeButton(button);
          return null;
        }
      }
    }
  }
};

// Всі правила виводу у вигляді LaTeX-формул
export const GENTZEN_BUTTONS = [
  "$$\\frac{\\bot}{\\phi} \\quad (\\bot E1) $$",
  "$${\\frac{[\\neg\\phi]}{\\vdots} \\atop \\frac{\\bot}{\\phi}} (\\bot E2) $$",
  "$$\\frac{}{\\top} \\quad (\\top I) $$",
  "$${\\frac{[\\phi]}{\\vdots} \\atop \\frac{\\bot}{\\neg\\phi}} (\\neg I) $$",
  "$$ \\frac{\\phi \\quad \\quad \\neg \\phi }{\\bot} \\quad (\\neg E)$$",
  "$$\\frac{\\phi \\quad \\quad \\psi}{\\phi \\wedge \\psi} (\\wedge I)$$",
  "$$\\frac{\\phi \\wedge \\psi}{\\phi} (\\wedge E1)$$",
  "$$\\frac{\\phi \\wedge \\psi}{\\psi} (\\wedge E2)$$",
  "$$\\frac{\\phi}{\\phi \\vee \\psi} (\\vee I1)$$",
  "$$ \\frac{\\psi}{\\phi \\vee \\psi} (\\vee I2) $$",
  "$$ \\frac{\\phi \\vee \\psi \\quad \\quad \\theta \\quad \\quad \\theta}{ \\theta} (\\vee E) $$",
  "$$\\frac{\\psi}{\\phi \\Rightarrow \\psi} (\\Rightarrow I)$$",
  "$$ \\frac{\\phi \\quad \\quad \\phi \\Rightarrow \\psi }{\\psi} (\\Rightarrow E) $$",
  "$$ \\frac{\\varphi[t/x]}{(\\exists x)\\varphi} \\; (\\exists I) $$",
  "$$ \\frac{\\varphi[t/x]}{(\\forall x)\\varphi} \\; (\\forall I) \\; \\tiny t \\text{ fresh} $$",
  "$$ \\frac{(\\forall x)\\varphi}{\\varphi[t/x]} \\; (\\forall E) $$",
  "$$ \\frac{(\\exists x)\\varphi \\quad {\\normalsize \\frac{[\\varphi[t/x]]}{\\vdots} \\atop \\normalsize \\psi}}{\\psi} \\; (\\exists E) \\; \\tiny t \\text{ fresh} $$",
  "$$\\frac{P(a) \\quad a = b}{P(b)} \\; (\\text{=E}_1)$$",
  "$$\\frac{P(b) \\quad a = b}{P(a)} \\; (\\text{=E}_2)$$",
  "$$ \\small \\frac{\\begin{matrix} [P(b)] \\\\ \\vdots \\\\ P(a) \\end{matrix} \\quad \\begin{matrix} [P(a)] \\\\ \\vdots \\\\ P(b) \\end{matrix}}{a = b} \\; (\\text{=I})$$",
  "$$ \\frac{\\varphi[0/x] \\quad {\\frac{[\\varphi]}{\\vdots} \\atop \\varphi[s(x)/x]}}{(\\forall x)\\varphi} \\; (Ind) $$"
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
    condition: (expr) => expr.type === 'equality' && (!expr.operator || expr.operator === '=' || expr.operator === 'EQUAL'),
    action: () => rules.twentiethRule(),
    requiresTree: true,
  },
  "Ind": {
    condition: (expr) => (expr.type === 'forall'),
    action: () => rules.induction(),
    requiresTree: true,
  }
};
