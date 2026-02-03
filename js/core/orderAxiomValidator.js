import { unwrap, areNodesEqual } from "./robinsonAxiomValidator.js";

// Order Axioms
export const ORDER_AXIOMS = [
  "∀x ¬(x < x)",                         // Irreflexivity
  "∀x ∀y ∀z ((x < y ∧ y < z) ⇒ x < z)",  // Transitivity
  "∀x ∀y (x < y ∨ x = y ∨ y < x)",       // Trichotomy
  "∀x ∀y ∀z (x < y ⇒ x + z < y + z)"     // Compatibility with addition
];

function stripUniversalQuantifiers(node) {
  let current = unwrap(node);
  while (current && (current.type === 'forall' || (current.type === 'quantifier' && (current.quantifier === '∀' || current.quantifier === 'forall')))) {
    current = unwrap(current.operand || current.expression);
  }
  return current;
}

/**
 * Validates Order Axiom 1: Irreflexivity
 * Pattern: ¬(t < t)
 */
export function validateOrderAxiom1(formula) {
  const root = stripUniversalQuantifiers(formula);
  
  if (root.type !== 'negation') return null;
  
  const operand = unwrap(root.operand);
  if (operand.type !== 'equality') return null;
  if (operand.operator !== '<') return null;
  
  if (areNodesEqual(operand.left, operand.right)) {
    return { code: "O1", desc: "Irreflexivity: ¬(x < x)" };
  }
  
  return null;
}

/**
 * Validates Order Axiom 2: Transitivity
 * Pattern: (a < b ∧ b < c) ⇒ a < c
 */
export function validateOrderAxiom2(formula) {
  const root = stripUniversalQuantifiers(formula);
  if (root.type !== 'implication') return null;
  
  const premise = unwrap(root.left);
  const conclusion = unwrap(root.right);
  
  // Conclusion: a < c
  if (conclusion.type !== 'equality' || conclusion.operator !== '<') return null;
  const a = conclusion.left;
  const c = conclusion.right;
  
  // Premise: a < b ∧ b < c
  if (premise.type !== 'conjunction') return null;
  
  const leftConj = unwrap(premise.left);
  const rightConj = unwrap(premise.right);
  
  if (leftConj.type !== 'equality' || leftConj.operator !== '<') return null;
  if (rightConj.type !== 'equality' || rightConj.operator !== '<') return null;
  
  // Check chaining
  // Case 1: (a < b) AND (b < c)
  if (areNodesEqual(leftConj.left, a) && areNodesEqual(rightConj.right, c)) {
    // Check middle term b
    if (areNodesEqual(leftConj.right, rightConj.left)) {
      return { code: "O2", desc: "Transitivity: (a < b ∧ b < c) ⇒ a < c" };
    }
  }
  
  // Case 2: (b < c) AND (a < b) (Commutativity of AND, though usually standard order is expected)
  if (areNodesEqual(rightConj.left, a) && areNodesEqual(leftConj.right, c)) {
    if (areNodesEqual(rightConj.right, leftConj.left)) {
      return { code: "O2", desc: "Transitivity: (a < b ∧ b < c) ⇒ a < c" };
    }
  }
  
  return null;
}

/**
 * Validates Order Axiom 3: Trichotomy
 * Pattern: a < b ∨ a = b ∨ b < a
 */
export function validateOrderAxiom3(formula) {
  const root = stripUniversalQuantifiers(formula);
  if (root.type !== 'disjunction') return null;
  
  // Flatten disjunctions to get all parts
  const parts = [];
  
  function collectParts(node) {
    const n = unwrap(node);
    if (n.type === 'disjunction') {
      collectParts(n.left);
      collectParts(n.right);
    } else {
      parts.push(n);
    }
  }
  
  collectParts(root);
  
  if (parts.length !== 3) return null;
  
  // We need to find: a < b, a = b, b < a
  let lt1 = null; // a < b
  let eq = null;  // a = b
  let lt2 = null; // b < a
  
  for (const part of parts) {
    if (part.type === 'equality') {
      if (part.operator === '<') {
        if (!lt1) lt1 = part;
        else if (!lt2) lt2 = part;
        else return null; // Too many inequalities
      } else if (part.operator === '=' || !part.operator) {
        if (!eq) eq = part;
        else return null; // Too many equalities
      } else {
        return null; // Unknown operator
      }
    } else {
      return null; // Not an equality expression
    }
  }
  
  if (!lt1 || !lt2 || !eq) return null;
  
  // Check consistency of terms
  const terms = [lt1.left, lt1.right];
  
  // Check eq terms (must match terms, order doesn't matter for =)
  const eqMatch = (areNodesEqual(eq.left, terms[0]) && areNodesEqual(eq.right, terms[1])) ||
                  (areNodesEqual(eq.left, terms[1]) && areNodesEqual(eq.right, terms[0]));
                  
  if (!eqMatch) return null;
  
  // Check lt2 terms (must be swapped compared to lt1)
  const lt2Match = areNodesEqual(lt2.left, terms[1]) && areNodesEqual(lt2.right, terms[0]);
  
  if (!lt2Match) return null;
  
  return { code: "O3", desc: "Trichotomy: x < y ∨ x = y ∨ y < x" };
}

/**
 * Validates Order Axiom 4: Compatibility with Addition
 * Pattern: a < b ⇒ a + c < b + c
 */
export function validateOrderAxiom4(formula) {
  const root = stripUniversalQuantifiers(formula);
  if (root.type !== 'implication') return null;
  
  const premise = unwrap(root.left);
  const conclusion = unwrap(root.right);
  
  // Premise: a < b
  if (premise.type !== 'equality' || premise.operator !== '<') return null;
  const a = premise.left;
  const b = premise.right;
  
  // Conclusion: a + c < b + c
  if (conclusion.type !== 'equality' || conclusion.operator !== '<') return null;
  
  const leftSum = unwrap(conclusion.left);
  const rightSum = unwrap(conclusion.right);
  
  if (leftSum.type !== 'addition' || rightSum.type !== 'addition') return null;
  
  // Check structure: (a + c) < (b + c)
  // We need to find 'c' which is common
  
  // Possible matches for leftSum: a+c or c+a
  let c_left = null;
  if (areNodesEqual(unwrap(leftSum.left), a)) {
    c_left = unwrap(leftSum.right);
  } else if (areNodesEqual(unwrap(leftSum.right), a)) {
    c_left = unwrap(leftSum.left);
  } else {
    return null; // 'a' not found in left sum
  }
  
  // Possible matches for rightSum: b+c or c+b
  let c_right = null;
  if (areNodesEqual(unwrap(rightSum.left), b)) {
    c_right = unwrap(rightSum.right);
  } else if (areNodesEqual(unwrap(rightSum.right), b)) {
    c_right = unwrap(rightSum.left);
  } else {
    return null; // 'b' not found in right sum
  }
  
  // Verify c is consistent
  if (areNodesEqual(c_left, c_right)) {
    return { code: "O4", desc: "Compatibility with addition: x < y ⇒ x + z < y + z" };
  }
  
  return null;
}
