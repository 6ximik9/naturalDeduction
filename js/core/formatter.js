const operatorPriority = {
  implication: 1,
  disjunction: 2,
  conjunction: 3,
  negation: 4,
  forall: 5,
  exists: 5,
  quantifier: 5,
  equality: 6,
  addition: 7,
  multiplication: 8,
  successor: 9,
  function: 10,
  predicate: 10,
  relation: 10,
  constant: 11,
  variable: 11,
  number: 11,
  atom: 11,
  parenthesis: 12
};

//1 всі дужки
//0 без них
export function formulaToString(node, useParens = 1) {
  if (!node) return '';

  switch (node.type) {
    case 'constant':
    case 'variable':
    case 'number':
      return node.value || node.name;

    case 'atom':
      return node.value;

    case 'parenthesis':
      // For useParens=1, always show parentheses
      if (useParens === 1) {
        return '(' + formulaToString(node.value, useParens) + ')';
      }
      // For useParens=0, only show parentheses if they're actually needed
      // This is handled by the parent context calling maybeWrap
      return formulaToString(node.value, useParens);

    case 'negation': {
      const operand = node.operand;
      const inner = formulaToString(operand, useParens);
      // Handle multiple negations
      const negSymbols = '¬'.repeat(node.count || 1);
      return negSymbols + maybeWrap(operand, inner, 'negation', useParens, 'right');
    }

    case 'conjunction':
    case 'disjunction':
    case 'implication': {
      const op = node.type === 'conjunction' ? '∧' :
        node.type === 'disjunction' ? '∨' : '⇒';

      // Handle new left/right structure
      if (node.left && node.right) {
        const leftStr = maybeWrap(node.left, formulaToString(node.left, useParens), node.type, useParens, 'left');
        const rightStr = maybeWrap(node.right, formulaToString(node.right, useParens), node.type, useParens, 'right');
        return `${leftStr}${op}${rightStr}`;
      }

      // Legacy support for operands array
      if (node.operands && node.operands.length >= 2) {
        let result = maybeWrap(node.operands[0], formulaToString(node.operands[0], useParens), node.type, useParens, 'left');
        for (let i = 1; i < node.operands.length; i++) {
          const operand = node.operands[i];
          const operandStr = maybeWrap(operand, formulaToString(operand, useParens), node.type, useParens, 'right');
          result = `${result}${op}${operandStr}`;
        }
        return result;
      }

      return '?'; // Invalid structure
    }

    case 'forall':
    case 'exists': {
      const quantSymbol = node.type === 'forall' ? '∀' : '∃';
      const variable = node.variable;
      const operand = node.operand;
      const body = formulaToString(operand, useParens);
      return `${quantSymbol}${variable} ` + maybeWrap(operand, body, node.type, useParens, 'right');
    }

    case 'quantifier': {
      // Legacy support
      const body = formulaToString(node.expression, useParens);
      return `${node.quantifier}${node.variable.value || node.variable} ` + maybeWrap(node.expression, body, 'quantifier', useParens, 'right');
    }

    case 'equality': {
      const left = maybeWrap(node.left, formulaToString(node.left, useParens), 'equality', useParens, 'left');
      const right = maybeWrap(node.right, formulaToString(node.right, useParens), 'equality', useParens, 'right');
      return `${left}${node.operator || '='}${right}`;
    }

    case 'addition': {
      // Handle new left/right structure
      if (node.left && node.right) {
        const leftStr = maybeWrap(node.left, formulaToString(node.left, useParens), 'addition', useParens, 'left');
        const rightStr = maybeWrap(node.right, formulaToString(node.right, useParens), 'addition', useParens, 'right');
        return `${leftStr}+${rightStr}`;
      }

      // Legacy support for operands array
      if (node.operands && node.operands.length >= 2) {
        let result = maybeWrap(node.operands[0], formulaToString(node.operands[0], useParens), 'addition', useParens, 'left');
        for (let i = 1; i < node.operands.length; i++) {
          const operand = node.operands[i];
          const operandStr = maybeWrap(operand, formulaToString(operand, useParens), 'addition', useParens, 'right');
          result = `${result}+${operandStr}`;
        }
        return result;
      }

      return '?'; // Invalid structure
    }

    case 'multiplication': {
      // Handle new left/right structure
      if (node.left && node.right) {
        const leftStr = maybeWrap(node.left, formulaToString(node.left, useParens), 'multiplication', useParens, 'left');
        const rightStr = maybeWrap(node.right, formulaToString(node.right, useParens), 'multiplication', useParens, 'right');
        return `${leftStr}*${rightStr}`;
      }

      // Legacy support for operands array
      if (node.operands && node.operands.length >= 2) {
        let result = maybeWrap(node.operands[0], formulaToString(node.operands[0], useParens), 'multiplication', useParens, 'left');
        for (let i = 1; i < node.operands.length; i++) {
          const operand = node.operands[i];
          const operandStr = maybeWrap(operand, formulaToString(operand, useParens), 'multiplication', useParens, 'right');
          result = `${result}*${operandStr}`;
        }
        return result;
      }

      return '?'; // Invalid structure
    }

    case 'function':
      return node.name + '(' + (node.terms || node.value || []).map(v => formulaToString(v, useParens)).join(', ') + ')';

    case 'predicate':
      if (node.terms && node.terms.length > 0) {
        const symbolName = node.symbol ? (node.symbol.name || node.symbol.value) : node.name;
        return symbolName + '(' + node.terms.map(v => formulaToString(v, useParens)).join(', ') + ')';
      } else {
        // Nullary predicate
        return node.symbol ? (node.symbol.name || node.symbol.value) : node.name;
      }

    case 'relation':
      if (node.value && node.value.length > 0) {
        return node.name + '(' + node.value.map(v => formulaToString(v, useParens)).join(', ') + ')';
      } else {
        // Nullary relation
        return node.name;
      }

    case 'successor': {
      const inner = formulaToString(node.term, useParens);
      // If we want minimal parentheses (mode 0), and the term is explicitly '0',
      // we can display it as 's0' instead of 's(0)'.
      // This matches the user's preference for compact Peano arithmetic notation.
      if (useParens === 0) {
        // Check if term is 0 (number or constant)
        const isZero = (node.term.type === 'number' || node.term.type === 'constant') && 
                       (node.term.value === '0' || node.term.name === '0');
        
        if (isZero) {
          return 's' + inner;
        }
      }
      return 's(' + inner + ')';
    }

    case 'sequent': {
      const premises = node.premises.map(p => formulaToString(p, useParens)).join(', ');
      const conclusion = formulaToString(node.conclusion, useParens);
      return `${premises} ⊢ ${conclusion}`;
    }

    // Legacy support
    case 'sum':
      return maybeWrap(node.left, formulaToString(node.left, useParens), 'addition', useParens, 'left')
        + '+'
        + maybeWrap(node.right, formulaToString(node.right, useParens), 'addition', useParens, 'right');

    case 'mult':
      return maybeWrap(node.left, formulaToString(node.left, useParens), 'multiplication', useParens, 'left')
        + '*'
        + maybeWrap(node.right, formulaToString(node.right, useParens), 'multiplication', useParens, 'right');

    default:
      return node.value || node.name || '?';
  }
}

function maybeWrap(child, rendered, parentType, useParens, position = 'left') {
  if (useParens === 1) {
    // For "Add Parentheses" mode:
    // Only wrap if it's NOT an atomic or self-contained type.
    // 'successor', 'function', 'predicate', 'relation' already have their own parentheses (e.g. s(x)),
    // so wrapping them again like (s(x)) is visually redundant.
    const atomicTypes = ['constant', 'variable', 'number', 'atom', 'successor', 'function', 'predicate', 'relation'];
    
    // If child is null/undefined, don't wrap
    if (!child) return rendered;

    // Check if it's an atomic type (or a parenthesis wrapping an atomic type)
    let typeToCheck = child.type;
    if (typeToCheck === 'parenthesis' && child.value) {
      typeToCheck = child.value.type;
    }

    if (atomicTypes.includes(typeToCheck)) {
      return rendered;
    }
    
    return '(' + rendered + ')';
  }

  // For useParens === 0 (Minimal/Delete Parentheses mode)
  // Don't add parentheses for missing children
  if (!child || !child.type) {
    return rendered;
  }

  // For parenthesis nodes, check the inner content to decide if we really need them
  let actualChild = child;
  let hasExplicitParens = false;
  if (child.type === 'parenthesis') {
    actualChild = child.value;
    hasExplicitParens = true;
  }

  const parentPriority = operatorPriority[parentType] || 0;
  const childPriority = operatorPriority[actualChild.type] || 0;

  // 1. Check Precedence
  // Lower priority number means lower binding power in this map (e.g. Implication 1 vs Conjunction 3)
  // If child has LOWER priority than parent, it binds loosely and needs protection.
  if (childPriority < parentPriority) {
    return '(' + rendered + ')';
  }

  // 2. Check Associativity (if priorities are equal)
  if (childPriority === parentPriority) {
    
    // Right Associative Operators: Implication (A -> B -> C parses as A -> (B -> C))
    if (parentType === 'implication') {
      // Left child needs parens: (A -> B) -> C
      if (position === 'left') {
        return '(' + rendered + ')';
      }
      // Right child fits natural associativity: A -> (B -> C) -> A -> B -> C
      return rendered;
    }

    // Left Associative Operators: Conjunction, Disjunction, Addition, Multiplication
    // (A & B & C parses as (A & B) & C)
    if (['conjunction', 'disjunction', 'addition', 'multiplication'].includes(parentType)) {
      // Left child fits natural associativity: (A & B) & C -> A & B & C
      if (position === 'left') {
        return rendered;
      }
      // Right child needs parens: A & (B & C)
      return '(' + rendered + ')';
    }
  }

  // If explicit parentheses exist but aren't strictly required by precedence/associativity rules above,
  // we usually remove them in mode 0 (Delete Parentheses). 
  // However, strict `useParens=0` usually implies "Canonical/Minimal Form".
  
  return rendered;
}
