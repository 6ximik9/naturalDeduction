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

// Axiom click handlers
export const AXIOM_HANDLERS = {
  1: {
    name: "Successor Injectivity",
    description: "The successor function is injective - if s(x) = s(y), then x = y",
    formula: "∀x ∀y (s(x) = s(y) ⇒ x = y)",
    action: () => {
      console.log("🔢 Axiom 1 (Successor Injectivity): ∀x ∀y (s(x) = s(y) ⇒ x = y)");
      console.log("📝 This axiom states that the successor function is injective.");
      console.log("💡 Use: Proves that different natural numbers have different successors.");
    }
  },
  2: {
    name: "Zero is not a successor",
    description: "Zero is not the successor of any natural number",
    formula: "∀x (0 ≠ s(x))",
    action: () => {
      console.log("🔢 Axiom 2 (Zero is not a successor): ∀x (0 ≠ s(x))");
      console.log("📝 This axiom states that 0 is not the successor of any number.");
      console.log("💡 Use: Establishes that 0 is the unique minimal element.");
    }
  },
  3: {
    name: "Predecessor existence",
    description: "Every non-zero number has a predecessor",
    formula: "∀x (x ≠ 0 ⇒ ∃y (x = s(y)))",
    action: () => {
      console.log("🔢 Axiom 3 (Predecessor existence): ∀x (x ≠ 0 ⇒ ∃y (x = s(y)))");
      console.log("📝 This axiom states that every non-zero number has a predecessor.");
      console.log("💡 Use: Allows reasoning about the structure of natural numbers.");
    }
  },
  4: {
    name: "Addition identity",
    description: "Adding zero to any number gives the same number",
    formula: "∀x (x + 0 = x)",
    action: () => {
      console.log("🔢 Axiom 4 (Addition identity): ∀x (x + 0 = x)");
      console.log("📝 This axiom defines the base case for addition.");
      console.log("💡 Use: Fundamental property that 0 is the additive identity.");
    }
  },
  5: {
    name: "Addition recursion",
    description: "Defines addition for successor numbers",
    formula: "∀x ∀y (x + s(y) = s(x + y))",
    action: () => {
      console.log("🔢 Axiom 5 (Addition recursion): ∀x ∀y (x + s(y) = s(x + y))");
      console.log("📝 This axiom defines addition recursively.");
      console.log("💡 Use: Shows how addition works with the successor function.");
    }
  },
  6: {
    name: "Multiplication by zero",
    description: "Multiplying any number by zero gives zero",
    formula: "∀x (x * 0 = 0)",
    action: () => {
      console.log("🔢 Axiom 6 (Multiplication by zero): ∀x (x * 0 = 0)");
      console.log("📝 This axiom defines the base case for multiplication.");
      console.log("💡 Use: Fundamental property that multiplication by 0 yields 0.");
    }
  },
  7: {
    name: "Multiplication recursion",
    description: "Defines multiplication for successor numbers",
    formula: "∀x ∀y (x * s(y) = (x * y) + x)",
    action: () => {
      console.log("🔢 Axiom 7 (Multiplication recursion): ∀x ∀y (x * s(y) = (x * y) + x)");
      console.log("📝 This axiom defines multiplication recursively.");
      console.log("💡 Use: Shows how multiplication builds on addition.");
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
  "$$\\frac{P(a) \\quad P(b)}{a = b} \\; (\\text{=I})$$"
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
