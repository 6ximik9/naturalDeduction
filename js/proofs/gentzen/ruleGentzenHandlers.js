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
import {t} from "../../core/i18n";

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
    name: t("ax-robinson-1-name"),
    description: t("ax-robinson-1-desc"),
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
    name: t("ax-robinson-2-name"),
    description: t("ax-robinson-2-desc"),
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
    name: t("ax-robinson-3-name"),
    description: t("ax-robinson-3-desc"),
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
    name: t("ax-robinson-4-name"),
    description: t("ax-robinson-4-desc"),
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
    name: t("ax-robinson-5-name"),
    description: t("ax-robinson-5-desc"),
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
    name: t("ax-robinson-6-name"),
    description: t("ax-robinson-6-desc"),
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
    name: t("ax-robinson-7-name"),
    description: t("ax-robinson-7-desc"),
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
    name: t("ax-order-1-name"),
    description: t("ax-order-1-desc"),
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
    name: t("ax-order-2-name"),
    description: t("ax-order-2-desc"),
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
    name: t("ax-order-3-name"),
    description: t("ax-order-3-desc"),
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
    name: t("ax-order-4-name"),
    description: t("ax-order-4-desc"),
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
    explanation: t("expl-ax")
  },
  "\\bot E1": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.firstRule(),
    requiresTree: true,
    explanation: t("expl-bot-e")
  },
  "\\bot E2": {
    condition: (expr) => isRegularExpression(expr),
    action: () => rules.secondRule(deductionContext),
    requiresTree: true,
    explanation: t("expl-raa")
  },
  "\\top I": {
    condition: (expr) => getValue(expr) === '⊤',
    action: () => rules.thirdRule(),
    requiresTree: true,
    explanation: t("expl-top-i")
  },
  "\\neg I": {
    condition: (expr) => expr.type === 'negation',
    action: () => rules.fourthRule(),
    requiresTree: true,
    explanation: t("expl-neg-i")
  },
  "\\neg E": {
    condition: (expr) => getValue(expr) === '⊥',
    action: async () => await rules.fifthRule(),
    requiresTree: true,
    explanation: t("expl-neg-e")
  },
  "\\wedge I": {
    condition: (expr) => expr.type === 'conjunction',
    action: () => rules.sixthRule(),
    requiresTree: true,
    explanation: t("expl-and-i")
  },
  "\\wedge E1": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.seventhRule(),
    requiresTree: true,
    explanation: t("expl-and-e")
  },
  "\\wedge E2": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.eighthRule(),
    requiresTree: true,
    explanation: t("expl-and-e")
  },
  "\\vee I1": {
    condition: (expr) => expr.type === 'disjunction',
    action: () => rules.ninthRule(),
    requiresTree: true,
    explanation: t("expl-or-i")
  },
  "\\vee I2": {
    condition: (expr) => expr.type === 'disjunction',
    action: () => rules.tenthRule(),
    requiresTree: true,
    explanation: t("expl-or-i")
  },
  "\\vee E": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.eleventhRule(),
    requiresTree: true,
    explanation: t("expl-or-e")
  },
  "\\Rightarrow I": {
    condition: (expr) => expr.type === 'implication',
    action: () => rules.twelfthRule(),
    requiresTree: true,
    explanation: t("expl-imp-i")
  },
  "\\Rightarrow E": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.thirteenthRule(),
    requiresTree: true,
    explanation: t("expl-imp-e")
  },
  "\\exists I": {
    condition: (expr) => (expr.type === 'quantifier' && expr.quantifier === '∃') || expr.type === 'exists',
    action: async () => await rules.fourteenthRule(),
    requiresTree: true,
    explanation: t("expl-exists-i")
  },
  "\\forall I": {
    condition: (expr) => (expr.type === 'quantifier' && expr.quantifier === '∀') || expr.type === 'forall',
    action: async () => await rules.fifteenthRule(),
    requiresTree: true,
    explanation: t("expl-forall-i")
  },
  "\\forall E": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.sixteenthRule(),
    requiresTree: true,
    explanation: t("expl-forall-e")
  },
  "\\exists E": {
    condition: (expr) => true,
    action: async () => await rules.seventeenthRule(),
    requiresTree: true,
    returnsResult: true,
    explanation: t("expl-exists-e")
  },
  "\\text{=E}_1": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => await rules.eighteenthRule(),
    requiresTree: true,
    explanation: t("expl-eq-e")
  },
  "\\text{=E}_2": {
    condition: (expr) => isRegularExpression(expr),
    action: async () => rules.nineteenthRule(),
    requiresTree: true,
    explanation: t("expl-eq-e")
  },
  "\\text{=I}": {
    condition: (expr) => expr.type === 'equality' && (!expr.operator || expr.operator === '=' || expr.operator === 'EQUAL'),
    action: () => rules.twentiethRule(),
    requiresTree: true,
    explanation: t("expl-eq-i")
  },
  "Ind": {
    condition: (expr) => (expr.type === 'forall'),
    action: () => rules.induction(),
    requiresTree: true,
    explanation: t("expl-ind")
  }
};
