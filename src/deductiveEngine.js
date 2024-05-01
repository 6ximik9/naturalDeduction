import {CharStreams, CommonTokenStream, ParseTreeWalker} from "antlr4";
import GrammarLexer from "../my_antlr/GrammarLexer";
import GrammarParser from "../my_antlr/GrammarParser";
import MyGrammarListener from "../my_antlr/MyGrammarListener";
// import {currentLevel} from "./index";
import {currentLevel} from "./GentzenProof";

export function removeRedundantParentheses(expression, parentType = null, isLeftChild = false) {
  // Функція для перевірки, чи дужки навколо виразу непотрібні
  function isParenthesesRedundant(expr, parentType, isLeftChild) {
    if (parentType === 'negation' && expr.type === 'parenthesis') {
      return false; // Зберігаємо дужки для негації складного виразу без додавання їх повторно
    }
    if (expr.type === 'parenthesis' && ['conjunction', 'implication'].includes(expr.value.type) && parentType !== 'conjunction') {
      // Для імплікації: зберігаємо дужки, якщо це ліва частина іншої імплікації
      if (expr.value.type === 'implication' && parentType === 'implication' && isLeftChild) {
        return false; // Зберігаємо дужки для правильного представлення асоціативності
      }
      return true;
    }

    if (expr.type === 'parenthesis' && expr.value.type === 'atom') {
      return true;
    }

    return false;
  }

  if (!expression) return ''; // Перевірка на невизначеність

  switch (expression.type) {
    case 'atom':
      return expression.value;
    case 'parenthesis':
      return isParenthesesRedundant(expression, parentType, isLeftChild) ? removeRedundantParentheses(expression.value, expression.type) : "(" + removeRedundantParentheses(expression.value, expression.type, false) + ")";
    case 'negation':
      let negatedExpression = removeRedundantParentheses(expression.value, 'negation', false);
      return "¬" + (expression.value.type === 'parenthesis' ? negatedExpression : "(" + negatedExpression + ")");
    default:
      let left = expression.left ? removeRedundantParentheses(expression.left, expression.type, true) : '';
      let right = expression.right ? removeRedundantParentheses(expression.right, expression.type, false) : '';
      let operator = {"implication": " ⇒ ", "conjunction": " ∧ ", "disjunction": " ∨ "}[expression.type] || " ";
      return left + operator + right;
  }
}


export function deleteHeadBack(removed) {
  if (removed.type === "parenthesis") {
    return getProof(removed.value);
  }

  return removed;
}


export function addRedundantParentheses(expression) {
  if (expression.type === "atom") {
    return expression.value;
  } else if (expression.type === "parenthesis") {
    return addRedundantParentheses(expression.value);
  } else if (expression.type === "negation") {
    let negatedExpression = addRedundantParentheses(expression.value);
    return "¬" + negatedExpression;
  } else {
    let left = addRedundantParentheses(expression.left);
    let right = addRedundantParentheses(expression.right);
    let operator;
    switch (expression.type) {
      case "implication":
        operator = " ⇒ ";
        break;
      case "conjunction":
        operator = " ∧ ";
        break;
      case "disjunction":
        operator = " ∨ ";
        break;
      default:
        operator = " "; // якщо тип не знайдено, просто повертаємо пробіл
    }
    return "(" + left + operator + right + ")";
  }
}

export function getProof(proof) {
  if (proof.type !== "parenthesis") {
    return proof;
  }

  return getProof(proof.value); // Додано return тут
}


export function convertToLogicalExpression(conclusion) {
  if (conclusion.type === "implication") {
    const left = convertToLogicalExpression(conclusion.left);
    const right = convertToLogicalExpression(conclusion.right);
    return `${left}⇒${right}`;
  } else if (conclusion.type === "disjunction") {
    const left = convertToLogicalExpression(conclusion.left);
    const right = convertToLogicalExpression(conclusion.right);
    return `${left}∨${right}`;
  } else if (conclusion.type === "conjunction") {
    const left = convertToLogicalExpression(conclusion.left);
    const right = convertToLogicalExpression(conclusion.right);
    return `${left}∧${right}`;
  } else if (conclusion.type === "atom") {
    return conclusion.value;
  } else if (conclusion.type === "negation") {
    const negatedExpression = convertToLogicalExpression(conclusion.value);
    return `¬${negatedExpression}`;
  } else if (conclusion.type === "parenthesis") {
    const parenthesis = convertToLogicalExpression(conclusion.value);
    return `(${parenthesis})`;
  } else {
    return conclusion.type;
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
    let tree = parser.implication();

    const listener = new MyGrammarListener(); // Викликати конструктор вашого Лісенера
    ParseTreeWalker.DEFAULT.walk(listener, tree);

    hypothesesAll[x] = listener.stack.pop();
  }

  return hypothesesAll;
}

export function extractTextBetweenParentheses(expression) {
  var startIndex = expression.indexOf('(');

  if (startIndex !== -1) {
    var count = 1;
    var currentIndex = startIndex + 1;

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
      return expression.substring(startIndex + 1, currentIndex);
    }
  }

  return null;
}


export function checkWithAntlr(text, er) {
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
    }
  });

  let tree = parser.implication();

  const listener = new MyGrammarListener(); // Викликати конструктор вашого Лісенера
  ParseTreeWalker.DEFAULT.walk(listener, tree);

  return listener.stack.pop();
}


export function checkCorrect(data, er) {

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

  // Обробка комутативних операцій: кон'юнкції і дизюнкції
  // A AND B = B AND A і A OR B = B OR A.
  if (expr1.type === 'conjunction' || expr1.type === 'disjunction') {
    return (compareExpressions(expr1.left, expr2.left) && compareExpressions(expr1.right, expr2.right)) ||
      (compareExpressions(expr1.left, expr2.right) && compareExpressions(expr1.right, expr2.left));
  }

  // Обробка негації та імплікації без комутативності
  if (expr1.type === 'negation' || expr1.type === 'implication') {
    return compareExpressions(expr1.left, expr2.left) && compareExpressions(expr1.right, expr2.right);
  }

  // Обробка атомарних значень
  if (expr1.type === 'atom') {
    return expr1.value === expr2.value;
  }

  // Повертаємо false для невідомих типів
  return false;
}
