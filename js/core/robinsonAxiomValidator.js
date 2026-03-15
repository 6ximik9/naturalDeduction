/**
 * Robinson Axiom Validator
 * Contains methods for validating all Robinson arithmetic axioms
 */
import { getProof } from "./deductiveEngine.js";

// Constants for Robinson Axioms
export const ROBINSON_AXIOMS = [
  "∀x ∀y (s(x) = s(y) ⇒ x = y)", // ax1
  "∀x (0 ≠ s(x))", // ax2
  "∀x (x ≠ 0 ⇒ ∃y (x = s(y)))", // ax3
  "∀x (x + 0 = x)", // ax4
  "∀x ∀y (x + s(y) = s(x + y))", // ax5
  "∀x (x * 0 = 0)", // ax6
  "∀x ∀y (x * s(y) = (x * y) + x)" // ax7
];

// ==========================================
// 🛠️ COMMON HELPER FUNCTIONS (To avoid code duplication)
// ==========================================

export const unwrap = (node) => getProof(node);

// Get successor depth or number
// Returns: { type: 'number', value: 5 } OR { type: 'term', base: node, depth: 3 }
export const getSuccessorDepth = (node) => {
  let current = unwrap(node);
  let depth = 0;

  while (current && current.type === 'successor') {
    depth++;
    current = unwrap(current.term);
  }

  if (current && (current.type === 'constant' || current.type === 'number')) {
    const val = parseInt(current.value, 10);
    if (!isNaN(val)) {
      return { type: 'number', value: val + depth };
    }
  }

  return { type: 'term', base: current, depth: depth };
};

// Deep node comparison (FIXED)
export const areNodesEqual = (n1, n2) => {
  if (!n1 || !n2) return n1 === n2;

  // If it's a wrapper (parenthesis), unwrap it
  // Note: if getProof already unwraps parentheses, these lines can be simplified,
  // but for recursion reliability we keep the type checks
  if (n1.type === 'parenthesis') return areNodesEqual(n1.value, n2);
  if (n2.type === 'parenthesis') return areNodesEqual(n1, n2.value);

  // Special check for mixed types (number vs successor)
  // For example: 1 vs s(0)
  if (
    (n1.type === 'number' || n1.type === 'constant' || n1.type === 'successor') &&
    (n2.type === 'number' || n2.type === 'constant' || n2.type === 'successor')
  ) {
    const d1 = getSuccessorDepth(n1);
    const d2 = getSuccessorDepth(n2);

    if (d1.type === 'number' && d2.type === 'number') {
      return d1.value === d2.value;
    }
  }

  if (n1.type !== n2.type) return false;

  // Value comparison (Constants, Variables, Numbers)
  if (['variable', 'constant', 'number'].includes(n1.type)) {
    // Use value or name depending on what's available
    const v1 = n1.value || n1.name;
    const v2 = n2.value || n2.name;
    return v1 === v2;
  }

  // Recursion for structures
  if (n1.type === 'successor') return areNodesEqual(n1.term, n2.term);

  // For binary operations
  if (['addition', 'multiplication', 'equality', 'implication', 'disjunction', 'conjunction'].includes(n1.type)) {
    return areNodesEqual(n1.left, n2.left) && areNodesEqual(n1.right, n2.right);
  }

  // For quantifiers (exists, forall)
  if (n1.type === 'exists' || n1.type === 'forall') {
    return n1.variable === n2.variable && areNodesEqual(n1.operand, n2.operand);
  }

  return false;
};

// Check for zero
const isZero = (node) => {
  const n = unwrap(node);
  return n && (n.type === 'constant' || n.type === 'number') && n.value === '0';
};

// Check for "Successor-like" (s(...) or number > 0)
const isSuccessorLike = (node) => {
  const n = unwrap(node);
  if (n.type === 'successor') return true;
  if ((n.type === 'constant' || n.type === 'number') && n.value !== '0') return true;
  return false;
};

// Peel one successor layer (for Ax1)
const peelSuccessor = (node) => {
  const n = unwrap(node);
  if (n.type === 'successor') return unwrap(n.term);

  if (n.type === 'constant' || n.type === 'number') {
    const val = parseInt(n.value, 10);
    if (!isNaN(val) && val > 0) {
      // Return object of the same type but with value - 1
      return { ...n, value: (val - 1).toString() };
    }
  }
  return null;
};


// ==========================================
// 🔍 AXIOM VALIDATION FUNCTIONS
// ==========================================

/**
 * Ax1: ∀x ∀y (s(x) = s(y) ⇒ x = y)
 */
export function validateAxiom1(root) {
  const rootNode = unwrap(root);
  if (rootNode.type !== 'implication') return null;

  const premise = unwrap(rootNode.left);
  const conclusion = unwrap(rootNode.right);

  if (premise.type !== 'equality' || conclusion.type !== 'equality') return null;

  const peeledLeft = peelSuccessor(premise.left);
  const peeledRight = peelSuccessor(premise.right);

  if (!peeledLeft || !peeledRight) return null;

  const isLeftMatch = areNodesEqual(peeledLeft, conclusion.left);
  const isRightMatch = areNodesEqual(peeledRight, conclusion.right);

  if (isLeftMatch && isRightMatch) {
    return { index: 0, code: "Ax1", desc: "Injectivity (s(x)=s(y) => x=y)" };
  }
  return null;
}

/**
 * Ax2: ∀x (0 ≠ s(x))
 * Checks patterns: NOT(0=s(x)) or 0 != s(x)
 */
export function validateAxiom2(formula) {
  const root = unwrap(formula);

  // Option A: Negation of equality (NOT (0 = s(x)))
  if (root.type === 'negation') {
    const operand = unwrap(root.operand);
    if (operand.type === 'equality') {
      const left = unwrap(operand.left);
      const right = unwrap(operand.right);

      // Check: one side is 0, other is s(...)
      if ((isZero(left) && isSuccessorLike(right)) || (isZero(right) && isSuccessorLike(left))) {
        return { index: 1, code: "Ax2", desc: "Zero is not a successor (0 ≠ s(x))" };
      }
    }
  }

  // Option B: If the parser supports "!=" or "≠" operator
  if (root.type === 'equality' && (root.operator === '!=' || root.operator === '≠')) {
    const left = unwrap(root.left);
    const right = unwrap(root.right);
    if ((isZero(left) && isSuccessorLike(right)) || (isZero(right) && isSuccessorLike(left))) {
      return { index: 1, code: "Ax2", desc: "Zero is not a successor (0 ≠ s(x))" };
    }
  }

  return null;
}

/**
 * Ax3: ∀x (x ≠ 0 ⇒ ∃y (x = s(y)))
 */
export function validateAxiom3(formula) {
  const root = unwrap(formula);

  // Must be an implication
  if (root.type !== 'implication') return null;

  const premise = unwrap(root.left);       // x != 0
  const conclusion = unwrap(root.right);   // exists y (x = s(y))

  // 1. Premise analysis (x != 0)
  // This could be negation(x=0) or inequality
  let x_Var = null;

  if (premise.type === 'negation') {
    const eq = unwrap(premise.operand);
    if (eq.type === 'equality') {
      if (isZero(eq.left)) x_Var = eq.right;
      else if (isZero(eq.right)) x_Var = eq.left;
    }
  } else if (premise.type === 'equality' && (premise.operator === '!=' || premise.operator === '≠')) {
    if (isZero(premise.left)) x_Var = premise.right;
    else if (isZero(premise.right)) x_Var = premise.left;
  }

  if (!x_Var) return null; // "something != 0" structure not found

  // 2. Conclusion analysis (exists y (x = s(y)))
  // Usually in proof steps people write an instance: a != 0 => exists y (a = s(y))
  // Or already substituted: exists y (a = s(y))

  if (conclusion.type === 'exists') {
    const body = unwrap(conclusion.operand);
    if (body.type === 'equality') {
      // Look for x = s(y) or s(y) = x
      // x_Var must be on one side
      let successorPart = null;

      if (areNodesEqual(body.left, x_Var)) successorPart = body.right;
      else if (areNodesEqual(body.right, x_Var)) successorPart = body.left;

      if (successorPart && successorPart.type === 'successor') {
        // Check if the variable inside successor is the one under the quantifier
        const innerVar = unwrap(successorPart.term);
        if (innerVar.type === 'variable' && innerVar.name === conclusion.variable) {
          return { index: 2, code: "Ax3", desc: "Predecessor Existence" };
        }
      }
    }
  }

  return null;
}

/**
 * Ax4: ∀x (x + 0 = x)
 */
export function validateAxiom4(root) {
  const rootNode = unwrap(root);
  if (rootNode.type !== 'equality') return null;

  const left = unwrap(rootNode.left);   // (x + 0)
  const right = unwrap(rootNode.right); // x

  if (left.type !== 'addition') return null;

  const x_Inside = unwrap(left.left);
  const zero_Inside = unwrap(left.right);

  if (!isZero(zero_Inside)) return null;

  if (areNodesEqual(x_Inside, right)) {
    return { index: 3, code: "Ax4", desc: "Identity of addition (x + 0 = x)" };
  }
  return null;
}

/**
 * Ax5: ∀x ∀y (x + s(y) = s(x + y))
 */
export function validateAxiom5(root) {
  const rootNode = unwrap(root);
  if (rootNode.type !== 'equality') return null;

  const left = unwrap(rootNode.left);
  const right = unwrap(rootNode.right);

  // Left: x + s(y) (or x + number)
  if (left.type !== 'addition') return null;
  // Right: s(...)
  if (right.type !== 'successor' && right.type !== 'constant' && right.type !== 'number') return null;

  const sy_Left = unwrap(left.right); // Second operand on the left

  // Check that the second operand is NOT zero (otherwise it's Ax4)
  if (isZero(sy_Left)) return null;

  // Get depths/values
  // Left side Y part
  const valLeftY = getSuccessorDepth(sy_Left);

  // Right side (s(x+y)) -> need to get what's inside s, or number - 1
  let rightInnerVal;
  let rightIsNumber = false;

  if (right.type === 'successor') {
    // s(TERM)
    const term = unwrap(right.term); // TERM must be x + y
    if (term.type !== 'addition') return null;

    const x_Right = unwrap(term.left);
    const y_Right = unwrap(term.right);

    // Check X
    if (!areNodesEqual(unwrap(left.left), x_Right)) return null;

    rightInnerVal = getSuccessorDepth(y_Right);

  } else if (right.type === 'constant' || right.type === 'number') {
    // It's a number (e.g. 3, which is s(2))
    // Then x + y should equal 2
    // This is a more complex case for pure structural check,
    // but for 1+2=3 we can handle it:

    const rVal = parseInt(right.value, 10);
    rightInnerVal = { type: 'number', value: rVal - 1 }; // Decrease by 1 (removed outer s)
    rightIsNumber = true;
  } else {
    return null;
  }

  // Final comparison of Y parts
  // On the left we had s(y), so valLeftY.value is (y+1)
  // On the right we have y (inside s), so rightInnerVal.value is y

  if (valLeftY.type === 'number' && rightInnerVal.type === 'number') {
    // 1+2 = 3 (or s(1+1))
    // sy_Left = 2 -> valLeftY = 2
    // right = 3 -> rightInnerVal = 2 (since 3 is s(2))
    // OR right = s(1+1) -> y_Right = 1 -> rightInnerVal = 1

    // There is a nuance here:
    // If on the left 1+2 (s(y)=2, y=1).
    // On the right s(1+1) (y=1).
    // Then valLeftY (2) == rightInnerVal (1) + 1.

    if (valLeftY.value === rightInnerVal.value + 1) {
      return { index: 4, code: "Ax5", desc: "Recursive addition (x + s(y) = s(x+y))" };
    }
  } else {
    // Symbolic: a + s(b) = s(a+b)
    // valLeftY: depth 1, base b
    // rightInnerVal: depth 0, base b
    if (valLeftY.depth === rightInnerVal.depth + 1 && areNodesEqual(valLeftY.base, rightInnerVal.base)) {
      return { index: 4, code: "Ax5", desc: "Recursive addition (x + s(y) = s(x+y))" };
    }
  }

  return null;
}

/**
 * Ax6: ∀x (x * 0 = 0)
 */
export function validateAxiom6(formula) {
  const root = unwrap(formula);
  if (root.type !== 'equality') return null;

  const left = unwrap(root.left);
  const right = unwrap(root.right);

  // Left: Multiplication
  if (left.type !== 'multiplication') return null;

  // Check: Right == 0
  if (!isZero(right)) return null;

  // Check: Left operand 2 == 0
  const arg2 = unwrap(left.right);
  if (!isZero(arg2)) return null;

  // Then it's Ax6: x * 0 = 0
  return { index: 5, code: "Ax6", desc: "Multiplication by zero (x * 0 = 0)" };
}

/**
 * Ax7: ∀x ∀y (x * s(y) = (x * y) + x)
 */
export function validateAxiom7(formula) {
  const root = unwrap(formula);
  if (root.type !== 'equality') return null;

  const left = unwrap(root.left);   // x * s(y)
  const right = unwrap(root.right); // (x * y) + x

  // Structure on the Left
  if (left.type !== 'multiplication') return null;
  const x_Left = unwrap(left.left);
  const sy_Left = unwrap(left.right);

  // sy_Left must be s(...) or number > 0
  if (isZero(sy_Left)) return null; // This is Ax6

  // Structure on the Right
  if (right.type !== 'addition') return null;
  const xy_Right = unwrap(right.left);  // (x * y)
  const x_Right_Outer = unwrap(right.right); // + x

  // 1. Check X (it should be the same everywhere)
  // x_Left == x_Right_Outer
  if (!areNodesEqual(x_Left, x_Right_Outer)) return null;

  // 2. Check (x * y) inside addition
  if (xy_Right.type !== 'multiplication') return null;
  const x_Right_Inner = unwrap(xy_Right.left);
  const y_Right = unwrap(xy_Right.right);

  if (!areNodesEqual(x_Left, x_Right_Inner)) return null;

  // 3. Check Y
  // On the left we have sy_Left (it's s(y)). On the right we have y_Right (it's y).
  const valLeftY = getSuccessorDepth(sy_Left);
  const valRightY = getSuccessorDepth(y_Right);

  // Logic as in Ax5: left should be 1 more than right
  let isMatch = false;

  if (valLeftY.type === 'number' && valRightY.type === 'number') {
    // Numbers: 3 * 2 = ... (2 is s(1), so y=1).
    // On the right should be y=1.
    // valLeftY = 2, valRightY = 1.
    if (valLeftY.value === valRightY.value + 1) isMatch = true;
  } else {
    // Symbols: a * s(b) = ...
    // valLeftY: depth 1, base b
    // valRightY: depth 0, base b
    if (valLeftY.depth === valRightY.depth + 1 && areNodesEqual(valLeftY.base, valRightY.base)) {
      isMatch = true;
    }
  }

  if (isMatch) {
    return { index: 6, code: "Ax7", desc: "Recursive multiplication (x * s(y) = x*y + x)" };
  }

  return null;
}

/**
 * Main method for validating all Robinson axioms
 */
export function validateRobinsonAxioms(formula) {
  // Your original code without changes, it's good
  console.log("🚀 Starting validation of all Robinson axioms...");

  const validationResults = {
    isAxiom: false,
    axiomNumber: null,
    axiomFormula: null,
    details: []
  };

  const validators = [
    { num: 1, func: validateAxiom1 },
    { num: 2, func: validateAxiom2 },
    { num: 3, func: validateAxiom3 },
    { num: 4, func: validateAxiom4 },
    { num: 5, func: validateAxiom5 },
    { num: 6, func: validateAxiom6 },
    { num: 7, func: validateAxiom7 }
  ];

  for (const validator of validators) {
    try {
      // Remove logs from individual functions to avoid cluttering the console,
      // or leave if debugging is needed.
      const result = validator.func(formula);
      const isValid = result !== null;

      validationResults.details.push({
        axiomNumber: validator.num,
        isValid: isValid
      });

      if (isValid) {
        validationResults.isAxiom = true;
        validationResults.axiomNumber = validator.num;
        validationResults.axiomFormula = ROBINSON_AXIOMS[validator.num - 1];
        validationResults.description = result.desc; // Added description
        console.log(`✅ Formula matches axiom ${validator.num} (${result.code})`);
        break;
      }
    } catch (error) {
      console.error(`❌ Error validating axiom ${validator.num}:`, error);
      validationResults.details.push({
        axiomNumber: validator.num,
        isValid: false,
        error: error.message
      });
    }
  }

  if (!validationResults.isAxiom) {
    console.log("❌ Formula does not match any Robinson axiom");
  }

  return validationResults;
}

// getAxiomInfo remains unchanged
export function getAxiomInfo(axiomNumber) {
  const axiomNames = [
    "Successor injectivity",
    "Zero is not a successor",
    "Existence of predecessor",
    "Identity of addition",
    "Recursion of addition",
    "Multiplication by zero",
    "Recursion of multiplication"
  ];

  if (axiomNumber < 1 || axiomNumber > 7) {
    return null;
  }

  return {
    number: axiomNumber,
    name: axiomNames[axiomNumber - 1],
    formula: ROBINSON_AXIOMS[axiomNumber - 1]
  };
}
