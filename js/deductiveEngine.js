import {CharStreams, CommonTokenStream, ParseTreeWalker} from "antlr4";
import GrammarLexer from "../my_antlr/GrammarLexer.js";
import GrammarParser from "../my_antlr/GrammarParser.js";
import MyGrammarListener from "../my_antlr/MyGrammarListener.js";
// import {currentLevel} from "./index";
import {currentLevel, deductionContext} from "./GentzenProof.js";

// export function removeRedundantParentheses(expression, parentType = null, isLeftChild = false) {
//   function isParenthesesRedundant(expr, parentType, isLeftChild) {
//     if (parentType === 'negation' && expr.type === 'parenthesis') {
//       return false;
//     }
//
//     if (expr.type === 'parenthesis') {
//       // Спеціальна обробка для області дії квантора
//       if (parentType === 'quantifier') {
//         // Видалити дужки лише навколо простих виразів (атомів, відношень, функцій)
//         if (['atom', 'relation', 'function', 'variable', 'constant'].includes(expr.value.type)) {
//           return true;
//         }
//         // Залишити дужки навколо складних виразів в області квантора
//         return false;
//       }
//
//       // Видалити дужки навколо кванторів, якщо вони на початку або після операторів
//       if (expr.value.type === 'quantifier') {
//         return parentType !== 'negation';
//       }
//
//
//       // Обробка бінарних операцій
//       if (['conjunction', 'implication', 'disjunction'].includes(expr.value.type)) {
//         if (expr.value.type === 'implication' && parentType === 'implication' && isLeftChild) {
//           return false;
//         }
//         // Видалити дужки для кон'юнкції, якщо батьківський вузол — не кон'юнкція
//         if (expr.value.type === 'conjunction' && parentType !== 'conjunction') {
//           return true;
//         }
//         // Видалити дужки для диз'юнкції, якщо це не потрібно для пріоритету
//         if (expr.value.type === 'disjunction' && parentType !== 'conjunction') {
//           return true;
//         }
//         return false;
//       }
//
//       // Видалити дужки навколо атомів, відношень, функцій
//       if (['atom', 'relation', 'function', 'variable', 'constant'].includes(expr.value.type)) {
//         return true;
//       }
//     }
//
//     return false;
//   }
//
//   if (!expression) return '';
//
//   switch (expression.type) {
//     case 'atom':
//     case 'constant':
//     case 'variable':
//       return expression.value;
//
//     case 'parenthesis':
//       return isParenthesesRedundant(expression, parentType, isLeftChild)
//         ? removeRedundantParentheses(expression.value, parentType, isLeftChild)
//         : "(" + removeRedundantParentheses(expression.value, expression.type, false) + ")";
//
//     case 'negation':
//       const negatedExpression = removeRedundantParentheses(expression.value, 'negation', false);
//       // Додати дужки лише якщо заперечуваний вираз є складним
//       if (['atom', 'relation', 'function', 'variable', 'constant'].includes(expression.value.type)) {
//         return "¬" + negatedExpression;
//       }
//       return "¬" + (expression.value.type === 'parenthesis' ? negatedExpression : "(" + negatedExpression + ")");
//
//     case 'quantifier':
//       const quantifierExpression = removeRedundantParentheses(expression.expression, 'quantifier', false);
//       const variable = expression.variable?.value || expression.variable;
//       return `${expression.quantifier}${variable}${quantifierExpression}`;
//
//     case 'equality':
//       const leftEquality = removeRedundantParentheses(expression.left, 'equality', true);
//       const rightEquality = removeRedundantParentheses(expression.right, 'equality', false);
//       return `${leftEquality} = ${rightEquality}`;
//
//     case 'relation':
//     case 'function':
//       const args = expression.value.map(arg => removeRedundantParentheses(arg)).join(", ");
//       return `${expression.name}(${args})`;
//
//     default:
//       const left = expression.left ? removeRedundantParentheses(expression.left, expression.type, true) : '';
//       const right = expression.right ? removeRedundantParentheses(expression.right, expression.type, false) : '';
//       const operator = {"implication": " ⇒ ", "conjunction": " ∧ ", "disjunction": " ∨ "}[expression.type] || " ";
//       return left + operator + right;
//   }
// }

// export function addRedundantParentheses(expression) {
//   if (!expression || typeof expression !== 'object') {
//     return '';
//   }
//
//   const operatorMap = {
//     implication: " ⇒ ",
//     conjunction: " ∧ ",
//     disjunction: " ∨ ",
//     sum: " + ",
//     mult: " * "
//   };
//
//   switch (expression.type) {
//     case "atom":
//     case "constant":
//     case "variable":
//     case "number":
//       return expression.value;
//
//     case "parenthesis":
//       return addRedundantParentheses(expression.value);
//
//     case "negation":
//       return "¬" + addRedundantParentheses(expression.value);
//
//     case "quantifier":
//       const quantifierExpression = addRedundantParentheses(expression.expression);
//       const variable = expression.variable?.value || expression.variable;
//       return `(${expression.quantifier}${variable})${quantifierExpression}`;
//
//     case "equality":
//       const leftEq = addRedundantParentheses(expression.left);
//       const rightEq = addRedundantParentheses(expression.right);
//       return `(${leftEq} = ${rightEq})`;
//
//     case "relation":
//       const relArgs = expression.value.map(arg => addRedundantParentheses(arg)).join(", ");
//       return `${expression.name}(${relArgs})`;
//
//     case "function":
//       const funcArgs = expression.value.map(arg => addRedundantParentheses(arg)).join(", ");
//       return `${expression.name}(${funcArgs})`;
//
//     case "successor":
//       const successorArg = addRedundantParentheses(expression.argument);
//       return `s(${successorArg})`;
//
//     default:
//       // Handle binary operations
//       if (expression.left && expression.right) {
//         const left = addRedundantParentheses(expression.left);
//         const right = addRedundantParentheses(expression.right);
//         const operator = operatorMap[expression.type] || " ";
//         return `(${left}${operator}${right})`;
//       }
//       return expression.type;
//   }
// }


export function deleteHeadBack(removed) {
  if (removed.type === "parenthesis") {
    return getProof(removed.value);
  }
  return removed;
}

export function getProof(proof) {
  if (proof.type !== "parenthesis") {
    return proof;
  }

  return getProof(proof.value); // Додано return тут
}


export function convertToLogicalExpression(conclusion) {
  if (!conclusion) return '';

  switch (conclusion.type) {
    case "implication":
    case "disjunction":
    case "conjunction": {
      const op = conclusion.type === "conjunction" ? "∧" :
                 conclusion.type === "disjunction" ? "∨" : "⇒";

      // Handle new left/right structure
      if (conclusion.left && conclusion.right) {
        const leftStr = convertToLogicalExpression(conclusion.left);
        const rightStr = convertToLogicalExpression(conclusion.right);
        return `${leftStr}${op}${rightStr}`;
      }

      // Legacy support for operands array
      if (conclusion.operands && conclusion.operands.length >= 2) {
        let result = convertToLogicalExpression(conclusion.operands[0]);
        for (let i = 1; i < conclusion.operands.length; i++) {
          result = `${result}${op}${convertToLogicalExpression(conclusion.operands[i])}`;
        }
        return result;
      }

      return conclusion.type; // Invalid structure
    }

    case "atom":
      return conclusion.value;

    case "negation": {
      const negatedExpression = convertToLogicalExpression(conclusion.operand);
      const negSymbols = '¬'.repeat(conclusion.count || 1);
      return `${negSymbols}${negatedExpression}`;
    }

    case "parenthesis":
      return `(${convertToLogicalExpression(conclusion.value)})`;

    case "forall":
    case "exists": {
      const quantSymbol = conclusion.type === "forall" ? "∀" : "∃";
      const variable = conclusion.variable;
      const expression = convertToLogicalExpression(conclusion.operand);
      return `(${quantSymbol}${variable})${expression}`;
    }

    case "quantifier": {
      // Legacy support
      const expression = convertToLogicalExpression(conclusion.expression);
      const variable = conclusion.variable.value || conclusion.variable;
      return `(${conclusion.quantifier}${variable})${expression}`;
    }

    case "equality": {
      const left = convertToLogicalExpression(conclusion.left);
      const right = convertToLogicalExpression(conclusion.right);
      return `${left}${conclusion.operator}${right}`;
    }

    case "predicate": {
      if (conclusion.terms && conclusion.terms.length > 0) {
        const symbolName = conclusion.symbol ? (conclusion.symbol.name || conclusion.symbol.value) : conclusion.name;
        const args = conclusion.terms.map(arg => convertToLogicalExpression(arg)).join(",");
        return `${symbolName}(${args})`;
      } else {
        // Nullary predicate
        return conclusion.symbol ? (conclusion.symbol.name || conclusion.symbol.value) : conclusion.name;
      }
    }

    case "relation": {
      if (conclusion.value && conclusion.value.length > 0) {
        const args = conclusion.value.map(arg => convertToLogicalExpression(arg)).join(",");
        return `${conclusion.name}(${args})`;
      } else {
        // Nullary relation
        return conclusion.name;
      }
    }

    case "constant":
    case "variable":
    case "number":
      return conclusion.value || conclusion.name;

    case "function": {
      const args = (conclusion.terms || conclusion.value || []).map(arg => convertToLogicalExpression(arg)).join(",");
      return `${conclusion.name}(${args})`;
    }

    case "addition": {
      // Handle new left/right structure
      if (conclusion.left && conclusion.right) {
        const leftStr = convertToLogicalExpression(conclusion.left);
        const rightStr = convertToLogicalExpression(conclusion.right);
        return `${leftStr}+${rightStr}`;
      }

      // Legacy support for operands array
      if (conclusion.operands && conclusion.operands.length >= 2) {
        let result = convertToLogicalExpression(conclusion.operands[0]);
        for (let i = 1; i < conclusion.operands.length; i++) {
          result = `${result}+${convertToLogicalExpression(conclusion.operands[i])}`;
        }
        return result;
      }

      return conclusion.type; // Invalid structure
    }

    case "multiplication": {
      // Handle new left/right structure
      if (conclusion.left && conclusion.right) {
        const leftStr = convertToLogicalExpression(conclusion.left);
        const rightStr = convertToLogicalExpression(conclusion.right);
        return `${leftStr}*${rightStr}`;
      }

      // Legacy support for operands array
      if (conclusion.operands && conclusion.operands.length >= 2) {
        let result = convertToLogicalExpression(conclusion.operands[0]);
        for (let i = 1; i < conclusion.operands.length; i++) {
          result = `${result}*${convertToLogicalExpression(conclusion.operands[i])}`;
        }
        return result;
      }

      return conclusion.type; // Invalid structure
    }

    case "successor":
      return `s(${convertToLogicalExpression(conclusion.term)})`;

    case "sequent": {
      const premises = conclusion.premises.map(p => convertToLogicalExpression(p)).join(",");
      const conclusionStr = convertToLogicalExpression(conclusion.conclusion);
      return `${premises}⊢${conclusionStr}`;
    }

    // Legacy support
    case "sum": {
      const left = convertToLogicalExpression(conclusion.left);
      const right = convertToLogicalExpression(conclusion.right);
      return `${left}+${right}`;
    }

    case "mult": {
      const left = convertToLogicalExpression(conclusion.left);
      const right = convertToLogicalExpression(conclusion.right);
      return `${left}*${right}`;
    }

    default:
      return conclusion.value || conclusion.name || conclusion.type || '?';
  }
}


export function createLineLevel(text) {
  const container = document.createElement('div');
  container.classList.add('nameRule');
  container.innerHTML = '\\((' + text + ')\\)'; // Додаємо форматування MathJax
  MathJax.typeset([container]); // Викликаємо MathJax для форматування
  return container;
}


export function getAllHypotheses(container) {
  let hypothesesAll = container.id
    .replaceAll('divId-', ' ')
    .split(' ')
    .filter(word => word !== 'proof' && Boolean(word));


  for (var x = 0; x < hypothesesAll.length; x++) {
    let chars = CharStreams.fromString(hypothesesAll[x].toString());
    let lexer = new GrammarLexer(chars);
    let tokens = new CommonTokenStream(lexer);
    let parser = new GrammarParser(tokens);
    let tree = parser.formula();

    const listener = new MyGrammarListener(); // Викликати конструктор вашого Лісенера
    ParseTreeWalker.DEFAULT.walk(listener, tree);

    hypothesesAll[x] = listener.stack.pop();
  }

  return hypothesesAll;
}

export function extractTextBetweenParentheses(expression) {
  const startIndex = expression.lastIndexOf('('); // Знаходимо останню відкриваючу дужку

  if (startIndex !== -1) {
    let count = 1;
    let currentIndex = startIndex + 1;

    while (currentIndex < expression.length) {
      if (expression[currentIndex] === '(') {
        count++;
      } else if (expression[currentIndex] === ')') {
        count--;
        if (count === 0) {
          break;
        }
      }
      currentIndex++;
    }

    if (count === 0) {
      return expression.substring(startIndex + 1, currentIndex); // Повертаємо текст між останніми дужками
    }
  }

  return null; // Якщо дужки не знайдено
}


export function checkWithAntlr(text, er) {
  text = text.replace(/s0/g, 's(0)');
  let chars = CharStreams.fromString(text);
  let lexer = new GrammarLexer(chars);
  lexer.addErrorListener({
    syntaxError: function (recognizer, offendingSymbol, line, column, msg, e) {
      er = 1;
    }
  });

  let tokens = new CommonTokenStream(lexer);
  let parser = new GrammarParser(tokens);

  parser.addErrorListener({
    syntaxError: function (recognizer, offendingSymbol, line, column, msg, e) {
      er = 1;
    },
    reportAmbiguity: function(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
      // Handle ambiguity errors gracefully - don't set error flag for ambiguity
      console.warn('Grammar ambiguity detected in deductive engine');
    },
    reportAttemptingFullContext: function(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
      // Handle full context attempts gracefully - don't set error flag
      console.warn('Parser attempting full context in deductive engine');
    },
    reportContextSensitivity: function(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
      // Handle context sensitivity gracefully - don't set error flag
      console.warn('Context sensitivity detected in deductive engine');
    }
  });

  let tree = parser.formula();

  const listener = new MyGrammarListener(); // Викликати конструктор вашого Лісенера
  ParseTreeWalker.DEFAULT.walk(listener, tree);

  return listener.stack.pop();
}


export function checkCorrect(data, er) {
  data = getProof(data);
  if (currentLevel === 7 || currentLevel === 8) {
    if (data.type !== "conjunction") {
      return 1;
    }
  } else if (currentLevel === 11) {
    if (data.type !== "disjunction") {
      return 1;
    }
  } else if (currentLevel === 13) {
    if (data.type !== "implication") {
      return 1;
    }
  } else if (currentLevel === 18 || currentLevel === 19) {
    if (data.type !== "relation") {
      return 1;
    }
  }
  return 0;
}

export function getHypotheses(lines) {
  // Розділити рядок на масив рядків
  const lineArray = lines.split('\n');

  // Знайти індекс рядка з роздільником
  const separatorIndex = lineArray.indexOf('————————————————');

  // За винятком роздільника, повернути усі рядки
  if (separatorIndex !== -1) {
    return lineArray.slice(0, separatorIndex);
  } else {
    return lineArray;
  }
}


export function editPadding() {
  var mainElement = document.querySelector('.proof-element_level-0');

  var allLabels = document.querySelectorAll('.proof-element_level-0 label');

// Отримуємо його ширину в пікселях
  var widthInPixels = allLabels[allLabels.length - 1].offsetWidth;


  mainElement.style.width = widthInPixels + 'px';
}


export function compareExpressions(expr1, expr2) {
  expr1 = getProof(expr1);
  expr2 = getProof(expr2);

  // Перевірка, що типи обох виразів однакові
  if (expr1.type !== expr2.type) return false;

  // Обробка комутативних операцій: кон'юнкції і диз'юнкції
  if (expr1.type === 'conjunction' || expr1.type === 'disjunction') {
    if (!expr1.operands || !expr2.operands || expr1.operands.length !== expr2.operands.length) {
      // Legacy support for left/right structure
      if (expr1.left && expr1.right && expr2.left && expr2.right) {
        return (compareExpressions(expr1.left, expr2.left) && compareExpressions(expr1.right, expr2.right)) ||
               (compareExpressions(expr1.left, expr2.right) && compareExpressions(expr1.right, expr2.left));
      }
      return false;
    }

    // Handle new left/right structure
    if (expr1.left && expr1.right && expr2.left && expr2.right) {
      // Check both orders for commutativity
      return (compareExpressions(expr1.left, expr2.left) && compareExpressions(expr1.right, expr2.right)) ||
             (compareExpressions(expr1.left, expr2.right) && compareExpressions(expr1.right, expr2.left));
    }

    // Legacy support for operands structure
    if (expr1.operands && expr2.operands) {
      if (expr1.operands.length !== expr2.operands.length) return false;

      // For binary operations, check commutativity
      if (expr1.operands.length === 2 && expr2.operands.length === 2) {
        return (compareExpressions(expr1.operands[0], expr2.operands[0]) && compareExpressions(expr1.operands[1], expr2.operands[1])) ||
               (compareExpressions(expr1.operands[0], expr2.operands[1]) && compareExpressions(expr1.operands[1], expr2.operands[0]));
      }

      // For more than 2 operands, check exact order
      for (let i = 0; i < expr1.operands.length; i++) {
        if (!compareExpressions(expr1.operands[i], expr2.operands[i])) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  // Обробка негації
  if (expr1.type === 'negation') {
    const operand1 = expr1.operand || expr1.value;
    const operand2 = expr2.operand || expr2.value;
    const count1 = expr1.count || 1;
    const count2 = expr2.count || 1;
    return count1 === count2 && compareExpressions(operand1, operand2);
  }

  // Обробка імплікації
  if (expr1.type === 'implication') {
    // Handle new left/right structure
    if (expr1.left && expr1.right && expr2.left && expr2.right) {
      return compareExpressions(expr1.left, expr2.left) && compareExpressions(expr1.right, expr2.right);
    }

    // Legacy support for operands
    if (expr1.operands && expr2.operands) {
      if (expr1.operands.length !== expr2.operands.length) return false;
      for (let i = 0; i < expr1.operands.length; i++) {
        if (!compareExpressions(expr1.operands[i], expr2.operands[i])) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  // Обробка кванторів
  if (expr1.type === 'quantifier') {
    return expr1.quantifier === expr2.quantifier &&
      compareExpressions(expr1.variable, expr2.variable) &&
      compareExpressions(expr1.expression, expr2.expression);
  }

  // Обробка нових кванторів
  if (expr1.type === 'forall' || expr1.type === 'exists') {
    return expr1.variable === expr2.variable &&
      compareExpressions(expr1.operand, expr2.operand);
  }

  // Обробка рівності
  if (expr1.type === 'equality') {
    return expr1.operator === expr2.operator &&
      compareExpressions(expr1.left, expr2.left) &&
      compareExpressions(expr1.right, expr2.right);
  }

  // Обробка предикатів
  if (expr1.type === 'predicate') {
    const name1 = expr1.symbol ? (expr1.symbol.name || expr1.symbol.value) : expr1.name;
    const name2 = expr2.symbol ? (expr2.symbol.name || expr2.symbol.value) : expr2.name;
    if (name1 !== name2) return false;

    const terms1 = expr1.terms || [];
    const terms2 = expr2.terms || [];
    if (terms1.length !== terms2.length) return false;

    return terms1.every((arg, index) => compareExpressions(arg, terms2[index]));
  }

  // Обробка відношень
  if (expr1.type === 'relation') {
    const name1 = expr1.name;
    const name2 = expr2.name;
    if (name1 !== name2) return false;

    const value1 = expr1.value || [];
    const value2 = expr2.value || [];
    if (value1.length !== value2.length) return false;

    return value1.every((arg, index) => compareExpressions(arg, value2[index]));
  }

  // Обробка функцій
  if (expr1.type === 'function') {
    if (expr1.name !== expr2.name) return false;

    const terms1 = expr1.terms || expr1.value || [];
    const terms2 = expr2.terms || expr2.value || [];
    if (terms1.length !== terms2.length) return false;

    return terms1.every((arg, index) => compareExpressions(arg, terms2[index]));
  }

  // Обробка арифметичних операцій
  if (expr1.type === 'addition' || expr1.type === 'multiplication') {
    // Handle new left/right structure
    if (expr1.left && expr1.right && expr2.left && expr2.right) {
      return compareExpressions(expr1.left, expr2.left) && compareExpressions(expr1.right, expr2.right);
    }

    // Legacy support for operands
    if (expr1.operands && expr2.operands) {
      if (expr1.operands.length !== expr2.operands.length) return false;
      return expr1.operands.every((operand, index) => compareExpressions(operand, expr2.operands[index]));
    }

    return false;
  }

  // Обробка функції наступника
  if (expr1.type === 'successor') {
    return compareExpressions(expr1.term, expr2.term);
  }

  // Обробка констант, змінних, чисел
  if (expr1.type === 'constant' || expr1.type === 'variable' || expr1.type === 'number') {
    return (expr1.value || expr1.name) === (expr2.value || expr2.name);
  }

  // Обробка атомарних значень
  if (expr1.type === 'atom') {
    return expr1.value === expr2.value;
  }

  // Обробка дужок
  if (expr1.type === 'parenthesis') {
    return compareExpressions(expr1.value, expr2.value);
  }

  // Обробка секвентів
  if (expr1.type === 'sequent') {
    if (expr1.premises.length !== expr2.premises.length) return false;
    const premisesMatch = expr1.premises.every((premise, index) =>
      compareExpressions(premise, expr2.premises[index]));
    return premisesMatch && compareExpressions(expr1.conclusion, expr2.conclusion);
  }

  // Повертаємо false для невідомих типів
  return false;
}

/**
 * Updates terms in a logical expression with precise replacement control
 * @param {Object} obj - The logical expression object to update
 * @param {string} oldValue - The exact term to replace (as selected by user)
 * @param {string} newValue - The replacement term
 * @param {Object} options - Replacement options
 * @param {boolean} options.replaceAll - If true, replace all occurrences; if false, replace only first occurrence
 * @param {boolean} options.exactMatch - If true, use exact structural matching; if false, use string matching
 * @returns {number} Number of replacements made
 */
export function updateTerms(obj, oldValue, newValue, options = {}) {
  const { replaceAll = false, exactMatch = true } = options;
  let count = 0;
  let shouldStop = false;

  function traverse(node) {
    if (!node || typeof node !== 'object' || shouldStop) return;
    node = getProof(node);

    // Check if this node matches what we want to replace
    const isMatch = exactMatch ? isExactMatch(node, oldValue) : isStringMatch(node, oldValue);

    if (isMatch) {
      performReplacement(node, newValue);
      count++;

      // If not replacing all, stop after first replacement
      if (!replaceAll) {
        shouldStop = true;
        return;
      }
    }

    // Continue traversing if we haven't found a match or if we're replacing all
    if (!shouldStop) {
      traverseProperties(node);
    }
  }

  /**
   * Checks if a node exactly matches the target value using structural comparison
   */
  function isExactMatch(node, targetValue) {
    // For simple types (variables, constants, numbers), compare the actual value/name
    if (node.type === 'constant' || node.type === 'variable' || node.type === 'number') {
      const nodeValue = node.value !== undefined ? node.value : node.name;
      return nodeValue === targetValue;
    }

    // For relation symbols (like P, Q, R)
    if (node.type === 'relation') {
      const nodeValue = node.name !== undefined ? node.name : node.value;
      return nodeValue === targetValue;
    }

    // For complex types (functions, predicates, successors), compare string representation
    if (node.type === 'function' || node.type === 'predicate' || node.type === 'successor') {
      const nodeString = convertToLogicalExpression(node);
      // Normalize whitespace for comparison
      const normalizedNodeString = nodeString.replace(/\s+/g, ' ').trim();
      const normalizedTargetValue = targetValue.replace(/\s+/g, ' ').trim();
      return normalizedNodeString === normalizedTargetValue;
    }

    // For atoms (TRUE/FALSE constants)
    if (node.type === 'atom') {
      return node.value === targetValue;
    }

    return false;
  }

  /**
   * Checks if a node matches using string comparison (legacy method)
   */
  function isStringMatch(node, targetValue) {
    if ((node.type === 'constant' || node.type === 'variable' || node.type === 'number') &&
        (node.value === targetValue || node.name === targetValue)) {
      return true;
    }

    if ((node.type === 'function' || node.type === 'predicate' || node.type === 'successor') &&
        convertToLogicalExpression(node) === targetValue) {
      return true;
    }

    return false;
  }

  /**
   * Performs the actual replacement of a node
   */
  function performReplacement(node, newValue) {
    try {
      const updatedNode = checkWithAntlr(newValue);
      console.log(`Replacing ${convertToLogicalExpression(node)} with ${newValue}`);
      console.log('Original node:', node);
      console.log('Updated node:', updatedNode);

      // Store original properties that might be needed
      const originalType = node.type;

      if (originalType === 'function' || originalType === 'predicate') {
        // Handle complex type replacements
        if (updatedNode.type === 'constant' || updatedNode.type === 'variable' ||
            updatedNode.type === 'number' || updatedNode.type === 'relation') {
          // Replace complex type with simple type - clear all properties and assign new ones
          Object.keys(node).forEach(key => delete node[key]);
          Object.assign(node, updatedNode);
        } else if (updatedNode.type === 'function') {
          // Replace function with another function
          node.type = 'function';
          node.name = updatedNode.name;
          node.terms = updatedNode.terms || updatedNode.arguments || updatedNode.value;
          // Clear old properties that might conflict
          delete node.symbol;
          delete node.value;
        } else if (updatedNode.type === 'predicate') {
          // Replace predicate with another predicate
          node.type = 'predicate';
          node.symbol = updatedNode.symbol;
          node.terms = updatedNode.terms;
          // Clear old properties that might conflict
          delete node.name;
          delete node.value;
        } else {
          // For other types, do a complete replacement
          Object.keys(node).forEach(key => delete node[key]);
          Object.assign(node, updatedNode);
        }
      } else {
        // For simple types, do a complete replacement
        Object.keys(node).forEach(key => delete node[key]);
        Object.assign(node, updatedNode);
      }

      console.log('Node after replacement:', node);
    } catch (error) {
      console.error('Error in replacement:', error);
      console.error('Failed to parse new value:', newValue);
      console.error('Original node:', node);
    }
  }

  /**
   * Traverses all properties of a node recursively
   */
  function traverseProperties(node) {
    for (let key in node) {
      if (node.hasOwnProperty(key) && !shouldStop) {
        if (Array.isArray(node[key])) {
          // Handle arrays (like operands, terms, premises)
          for (let item of node[key]) {
            if (shouldStop) break;
            traverse(item);
          }
        } else if (typeof node[key] === 'object' && node[key] !== null) {
          traverse(node[key]);
        }
      }
    }
  }

  traverse(obj);
  return count;
}

/**
 * Legacy function for backward compatibility - replaces all occurrences
 * @deprecated Use updateTerms with options instead
 */
export function updateTermsAll(obj, oldValue, newValue) {
  return updateTerms(obj, oldValue, newValue, { replaceAll: true, exactMatch: true });
}

/**
 * Replaces only the first occurrence of a term (recommended for user selections)
 */
export function updateTermsFirst(obj, oldValue, newValue) {
  return updateTerms(obj, oldValue, newValue, { replaceAll: false, exactMatch: true });
}

/**
 * Checks if an error is a modal cancellation error
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error is from modal cancellation
 */
export function isModalCancellation(error) {
  return error && error.message === 'Modal was closed by user';
}

/**
 * Handles modal cancellation gracefully in rule functions
 * @param {string} ruleName - Name of the rule for logging
 * @param {Error} error - The error that occurred
 * @returns {boolean} True if error was handled (modal cancellation), false otherwise
 */
export function handleModalCancellation(ruleName, error) {
  if (isModalCancellation(error)) {
    console.log(`${ruleName} cancelled by user`);
    return true;
  }
  return false;
}

/**
 * Extracts constants, variables, and function terms from a logical expression
 * Updated to work with the new grammar structure and left/right format
 * @param {Object} proof - The parsed logical expression
 * @returns {Array<string>} Array of unique constants, variables, and function terms
 */
export function extractConstantsOrVariables(proof) {
  const result = [];

  console.log('Extracting from proof:', proof);

  function traverse(node) {
    if (!node || typeof node !== 'object') return;
    node = getProof(node);

    // Handle variables (lowercase letters like x, y, z)
    if (node.type === 'variable') {
      if (node.name) {
        result.push(node.name);
      } else if (node.value) {
        result.push(node.value);
      }
    }

    // Handle constants (numbers, named constants)
    if (node.type === 'constant') {
      if (node.value !== undefined) {
        result.push(node.value.toString());
      } else if (node.name) {
        result.push(node.name);
      }
    }

    // Handle atoms (TRUE/FALSE and relation symbols like P, Q, R)
    if (node.type === 'atom') {
      if (node.value && node.value !== '⊤' && node.value !== '⊥') {
        result.push(node.value);
      }
    }

    // Handle relation symbols (uppercase letters like P, Q, R)
    if (node.type === 'relation') {
      if (node.name) {
        result.push(node.name);
      } else if (node.value) {
        result.push(node.value);
      }
    }

    // Handle function applications - updated for new grammar
    if (node.type === 'function') {
      // Add the function itself as a term
      if (node.name && node.terms && Array.isArray(node.terms)) {
        const args = node.terms.map(arg => extractExpression(arg)).join(", ");
        result.push(`${node.name}(${args})`);
        // Also traverse terms to extract their constants/variables
        node.terms.forEach(traverse);
      } else if (node.name && node.arguments && Array.isArray(node.arguments)) {
        // Legacy format support
        const args = node.arguments.map(arg => extractExpression(arg)).join(", ");
        result.push(`${node.name}(${args})`);
        node.arguments.forEach(traverse);
      } else if (node.value && Array.isArray(node.value)) {
        // Legacy format support
        const args = node.value.map(arg => extractExpression(arg)).join(", ");
        result.push(`${node.name}(${args})`);
        node.value.forEach(traverse);
      }
    }

    // Handle successor function s(x) - updated for new grammar
    if (node.type === 'successor') {
      if (node.term) {
        const argStr = extractExpression(node.term);
        result.push(`s(${argStr})`);
        traverse(node.term);
      } else if (node.argument) {
        // Legacy format support
        const argStr = extractExpression(node.argument);
        result.push(`s(${argStr})`);
        traverse(node.argument);
      }
    }

    // Handle quantifiers (∀x, ∃y) - updated for new grammar
    if (node.type === 'quantifier' || node.type === 'forall' || node.type === 'exists') {
      // Add the bound variable
      if (node.variable) {
        result.push(node.variable);
      }
      // Traverse the expression/operand
      if (node.expression) {
        traverse(node.expression);
      } else if (node.operand) {
        traverse(node.operand);
      }
    }

    // Handle binary operations with new left/right structure
    if (node.type === 'disjunction' || node.type === 'conjunction' || node.type === 'implication' ||
        node.type === 'addition' || node.type === 'multiplication') {
      if (node.left && node.right) {
        traverse(node.left);
        traverse(node.right);
      } else if (node.operands && Array.isArray(node.operands)) {
        // Legacy support for operands array
        node.operands.forEach(traverse);
      }
    }

    // Handle equality
    if (node.type === 'equality') {
      if (node.left && node.right) {
        traverse(node.left);
        traverse(node.right);
      } else if (node.operands && Array.isArray(node.operands)) {
        // Legacy support
        node.operands.forEach(traverse);
      }
    }

    // Handle negation
    if (node.type === 'negation') {
      if (node.operand) {
        traverse(node.operand);
      } else if (node.expression) {
        traverse(node.expression);
      }
    }

    // Handle parentheses
    if (node.type === 'parenthesis') {
      if (node.value) {
        traverse(node.value);
      } else if (node.expression) {
        traverse(node.expression);
      }
    }

    // Handle predicate applications P(x,y) - updated for new grammar
    if (node.type === 'predicate') {
      if (node.symbol && node.terms && Array.isArray(node.terms)) {
        // New grammar format: predicate has symbol (relation) and terms (array of arguments)
        // Structure: { type: 'predicate', symbol: {type: 'relation', name: 'P'}, terms: [{type: 'variable', name: 'x'}, ...] }
        const symbolName = node.symbol.name || node.symbol.value;
        const args = node.terms.map(arg => extractExpression(arg)).join(", ");
        result.push(`${symbolName}(${args})`);
        // Traverse the symbol and terms to extract individual variables/constants
        traverse(node.symbol);
        node.terms.forEach(traverse);
      } else if (node.name && node.terms && Array.isArray(node.terms)) {
        // Legacy format support
        const args = node.terms.map(arg => extractExpression(arg)).join(", ");
        result.push(`${node.name}(${args})`);
        node.terms.forEach(traverse);
      }
    }

    // Handle sequents (premises ⊢ conclusion)
    if (node.type === 'sequent') {
      if (node.premises) {
        if (Array.isArray(node.premises)) {
          node.premises.forEach(traverse);
        } else {
          traverse(node.premises);
        }
      }
      if (node.conclusion) {
        traverse(node.conclusion);
      }
    }
  }

  /**
   * Helper function to extract string representation of an expression
   * @param {Object} node - The node to extract from
   * @returns {string} String representation of the node
   */
  function extractExpression(node) {
    if (!node || typeof node !== 'object') return String(node || '');

    node = getProof(node);

    switch (node.type) {
      case 'variable':
        return node.name || node.value || '';
      case 'constant':
        return String(node.value !== undefined ? node.value : node.name || '');
      case 'atom':
        return node.value || '';
      case 'relation':
        return node.name || node.value || '';
      case 'function':
        if (node.name && node.terms && Array.isArray(node.terms)) {
          const args = node.terms.map(arg => extractExpression(arg)).join(", ");
          return `${node.name}(${args})`;
        } else if (node.name && node.arguments && Array.isArray(node.arguments)) {
          const args = node.arguments.map(arg => extractExpression(arg)).join(", ");
          return `${node.name}(${args})`;
        } else if (node.name && node.value && Array.isArray(node.value)) {
          const args = node.value.map(arg => extractExpression(arg)).join(", ");
          return `${node.name}(${args})`;
        }
        return node.name || '';
      case 'successor':
        if (node.term) {
          return `s(${extractExpression(node.term)})`;
        } else if (node.argument) {
          return `s(${extractExpression(node.argument)})`;
        }
        return 's()';
      case 'parenthesis':
        return extractExpression(node.value || node.expression);
      default:
        return node.value || node.name || '';
    }
  }

  traverse(getProof(proof));

  // Remove duplicates and filter out empty strings
  const uniqueResult = [...new Set(result)].filter(item => item && item.trim() !== '');

  console.log('Extracted constants/variables:', uniqueResult);
  return uniqueResult;
}
