import * as rules from './rulesGentzen';
import * as deductive from "../../core/deductiveEngine";
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
          createAxiomConclusion(ROBINSON_AXIOMS[5], 27);
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
          createAxiomConclusion(ROBINSON_AXIOMS[6], 28);
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
          createAxiomConclusion(ORDER_AXIOMS[0], 29);
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
          createAxiomConclusion(ORDER_AXIOMS[1], 30);
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
          createAxiomConclusion(ORDER_AXIOMS[2], 31);
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
          createAxiomConclusion(ORDER_AXIOMS[3], 32);
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
  "$$\\frac{\\varphi \\in \\Gamma}{\\Gamma \\vdash \\varphi} (Ax)$$ ",
  "$$\\frac{\\Gamma \\vdash \\bot}{\\Gamma \\vdash \\phi} \\quad (\\bot E1) $$",
  "$$\\frac{\\Gamma, \\neg\\phi \\vdash \\bot}{\\Gamma \\vdash \\phi} \\quad (\\bot E2) $$",
  "$$\\frac{}{\\Gamma \\vdash \\top} \\quad (\\top I) $$",
  "$$\\frac{\\Gamma, \\phi \\vdash \\bot}{\\Gamma \\vdash \\neg\\phi} \\quad (\\neg I) $$",
  "$$ \\frac{\\Gamma \\vdash \\phi \\quad \\quad \\Gamma \\vdash \\neg \\phi }{\\Gamma \\vdash \\bot} \\quad (\\neg E)$$",
  "$$\\frac{\\Gamma \\vdash \\phi \\quad \\quad \\Gamma \\vdash \\psi}{\\Gamma \\vdash \\phi \\wedge \\psi} (\\wedge I)$$",
  "$$\\frac{\\Gamma \\vdash \\phi \\wedge \\psi}{\\Gamma \\vdash \\phi} (\\wedge E1)$$",
  "$$\\frac{\\Gamma \\vdash \\phi \\wedge \\psi}{\\Gamma \\vdash \\psi} (\\wedge E2)$$",
  "$$\\frac{\\Gamma \\vdash \\phi}{\\Gamma \\vdash \\phi \\vee \\psi} (\\vee I1)$$",
  "$$ \\frac{\\Gamma \\vdash \\psi}{\\Gamma \\vdash \\phi \\vee \\psi} (\\vee I2) $$",
  "$$ \\frac{\\Gamma \\vdash \\phi \\vee \\psi \\quad \\quad \\Gamma, \\phi \\vdash \\theta \\quad \\quad \\Gamma, \\psi \\vdash \\theta}{\\Gamma \\vdash \\theta} (\\vee E) $$",
  "$$\\frac{\\Gamma, \\phi \\vdash \\psi}{\\Gamma \\vdash \\phi \\Rightarrow \\psi} (\\Rightarrow I)$$",
  "$$ \\frac{\\Gamma \\vdash \\phi \\quad \\quad \\Gamma \\vdash \\phi \\Rightarrow \\psi }{\\Gamma \\vdash \\psi} (\\Rightarrow E) $$",
  "$$ \\frac{\\Gamma \\vdash \\varphi[t/x]}{\\Gamma \\vdash (\\exists x)\\varphi} \\; (\\exists I) $$",
  "$$ \\frac{\\Gamma \\vdash \\varphi[t/x]}{\\Gamma \\vdash (\\forall x)\\varphi} \\; (\\forall I) \\; \\tiny t \\text{ fresh} $$",
  "$$ \\frac{\\Gamma \\vdash (\\forall x)\\varphi}{\\Gamma \\vdash \\varphi[t/x]} \\; (\\forall E) $$",
  "$$ \\frac{\\Gamma \\vdash (\\exists x)\\varphi \\quad \\Gamma, \\varphi[t/x] \\vdash \\psi}{\\Gamma \\vdash \\psi} \\; (\\exists E) \\; \\tiny t \\text{ fresh} $$",
  "$$\\frac{\\Gamma \\vdash P(a) \\quad \\Gamma \\vdash a = b}{\\Gamma \\vdash P(b)} \\; (\\text{=E}_1)$$",
  "$$\\frac{\\Gamma \\vdash P(b) \\quad \\Gamma \\vdash a = b}{\\Gamma \\vdash P(a)} \\; (\\text{=E}_2)$$",
  "$$ \\frac{\\Gamma, P(b) \\vdash P(a) \\quad \\Gamma, P(a) \\vdash P(b)}{\\Gamma \\vdash a = b} \\; (\\text{=I})$$",
  "$$ \\frac{\\Gamma \\vdash \\varphi[0/x] \\quad \\Gamma, \\varphi \\vdash \\varphi[s(x)/x]}{\\Gamma \\vdash (\\forall x)\\varphi} \\; (Ind) $$"
];


// Helper function to get the value from different node types
function getValue(expr) {
  return expr.value || expr.name;
}

// Helper function to check if expression is regular (now allows everything)
function isRegularExpression(expr) {
  return true;
}

export const ruleGentzenHandlers = {
  "Ax": {
    condition: (expr, side) => {
      if (!side) return false;

      // Check local hypotheses
      let isInLocalHypotheses = false;
      try {
        const gammaSpan = side.querySelector('.gamma-context');
        if (gammaSpan) {
          const hypothesesData = gammaSpan.getAttribute('data-hypotheses');
          if (hypothesesData) {
            const hypotheses = JSON.parse(hypothesesData);
            isInLocalHypotheses = hypotheses.some(hypText => {
              try {
                const hypParsed = deductive.getProof(deductive.checkWithAntlr(hypText));
                return deductive.compareExpressions(hypParsed, expr);
              } catch (error) {
                return false;
              }
            });
          }
        }
      } catch (error) {}

      if (isInLocalHypotheses) return true;

      // Check Robinson axioms
      const isRobinsonAxiom = ROBINSON_AXIOMS.some(axiom => {
        try {
          const axiomParsed = deductive.getProof(deductive.checkWithAntlr(axiom));
          return deductive.compareExpressions(axiomParsed, expr);
        } catch (error) {
          return false;
        }
      });
      if (isRobinsonAxiom) return true;

      // Check Order axioms
      const isOrderAxiom = ORDER_AXIOMS.some(axiom => {
        try {
          const axiomParsed = deductive.getProof(deductive.checkWithAntlr(axiom));
          return deductive.compareExpressions(axiomParsed, expr);
        } catch (error) {
          return false;
        }
      });
      return isOrderAxiom;
    },
    action: () => rules.axRule(),
    requiresTree: true,
    explanation: "Axiom (Ax): The formula must be present in the local hypotheses (Γ) or be a known arithmetic/order axiom."
  },
  "\\bot E1": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.firstRule(),
    requiresTree: true,
    explanation: "Bottom Elimination 1 (⊥E1): From absurdity, any formula φ can be derived."
  },
  "\\bot E2": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.secondRule(deductionContext),
    requiresTree: true,
    explanation: "Bottom Elimination 2 (⊥E2): Proof by contradiction. To prove φ, assume ¬φ and derive absurdity (⊥)."
  },
  "\\top I": {
    condition: (expr) => getValue(expr) === '⊤',
    action: () => rules.thirdRule(),
    requiresTree: true,
    explanation: "Top Introduction (⊤I): The Truth (⊤) constant can always be introduced without any premises."
  },
  "\\neg I": {
    condition: (expr) => expr.type === 'negation',
    action: () => rules.fourthRule(),
    requiresTree: true,
    explanation: "Negation Introduction (¬I): To prove ¬φ, assume φ and derive absurdity (⊥)."
  },
  "\\neg E": {
    condition: (expr) => getValue(expr) === '⊥',
    action: async () => await rules.fifthRule(),
    requiresTree: true,
    explanation: "Negation Elimination (¬E): If you have both φ and ¬φ, you can derive absurdity (⊥)."
  },
  "\\wedge I": {
    condition: (expr) => expr.type === 'conjunction',
    action: () => rules.sixthRule(),
    requiresTree: true,
    explanation: "Conjunction Introduction (∧I): To prove φ ∧ ψ, you must prove both φ and ψ independently."
  },
  "\\wedge E1": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.seventhRule(),
    requiresTree: true,
    explanation: "Conjunction Elimination 1 (∧E1): If you have φ, you can derive it from any conjunction φ ∧ ψ."
  },
  "\\wedge E2": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.eighthRule(),
    requiresTree: true,
    explanation: "Conjunction Elimination 2 (∧E2): If you have ψ, you can derive it from any conjunction φ ∧ ψ."
  },
  "\\vee I1": {
    condition: (expr) => expr.type === 'disjunction',
    action: () => rules.ninthRule(),
    requiresTree: true,
    explanation: "Disjunction Introduction 1 (∨I1): To prove φ ∨ ψ, it is sufficient to prove the left part φ."
  },
  "\\vee I2": {
    condition: (expr) => expr.type === 'disjunction',
    action: () => rules.tenthRule(),
    requiresTree: true,
    explanation: "Disjunction Introduction 2 (∨I2): To prove φ ∨ ψ, it is sufficient to prove the right part ψ."
  },
  "\\vee E": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.eleventhRule(),
    requiresTree: true,
    explanation: "Disjunction Elimination (∨E): To use φ ∨ ψ to prove θ, you must prove θ from φ and also prove θ from ψ."
  },
  "\\Rightarrow I": {
    condition: (expr) => expr.type === 'implication',
    action: () => rules.twelfthRule(),
    requiresTree: true,
    explanation: "Implication Introduction (⇒I): To prove φ ⇒ ψ, assume φ as a hypothesis and derive ψ."
  },
  "\\Rightarrow E": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.thirteenthRule(),
    requiresTree: true,
    explanation: "Implication Elimination (⇒E): To prove ψ, you need both φ and the implication φ ⇒ ψ."
  },
  "\\exists I": {
    condition: (expr) => (expr.type === 'quantifier' && expr.quantifier === '∃') || expr.type === 'exists',
    action: async () => await rules.fourteenthRule(),
    requiresTree: true,
    explanation: "Existential Introduction (∃I): To prove ∃x φ(x), it is sufficient to prove φ(t) for some term t."
  },
  "\\forall I": {
    condition: (expr) => (expr.type === 'quantifier' && expr.quantifier === '∀') || expr.type === 'forall',
    action: async () => await rules.fifteenthRule(),
    requiresTree: true,
    explanation: "Universal Introduction (∀I): To prove ∀x φ(x), prove φ(t) for a fresh constant t that does not appear in the hypotheses."
  },
  "\\forall E": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.sixteenthRule(),
    requiresTree: true,
    explanation: "Universal Elimination (∀E): If you have ∀x φ(x), you can derive φ(t) for any term t."
  },
  "\\exists E": {
    condition: (expr) => true,
    action: async () => await rules.seventeenthRule(),
    requiresTree: true,
    returnsResult: true,
    explanation: "Existential Elimination (∃E): To use ∃x φ(x) to prove ψ, assume φ(t) for a fresh constant t and derive ψ."
  },
  "\\text{=E}_1": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.eighteenthRule(),
    requiresTree: true,
    explanation: "Equality Elimination 1 (=E1): If P(a) is true and a = b, then P(b) is also true (Leibniz's Law)."
  },
  "\\text{=E}_2": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => rules.nineteenthRule(),
    requiresTree: true,
    explanation: "Equality Elimination 2 (=E2): If P(b) is true and a = b, then P(a) is also true."
  },
  "\\text{=I}": {
    condition: (expr) => expr.type === 'equality' && (!expr.operator || expr.operator === '=' || expr.operator === 'EQUAL'),
    action: () => rules.twentiethRule(),
    requiresTree: true,
    explanation: "Equality Introduction (=I): An identity a = b can be proven if P(a) and P(b) are equivalent for all properties P."
  },
  "Ind": {
    condition: (expr) => (expr.type === 'forall'),
    action: () => rules.induction(),
    requiresTree: true,
    explanation: "Mathematical Induction (Ind): To prove ∀x φ(x), prove the base case φ(0) and the inductive step φ(x) ⇒ φ(s(x))."
  }
};
