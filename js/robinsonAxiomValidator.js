/**
 * Robinson Axiom Validator
 * Містить методи для перевірки всіх аксіом арифметики Робінсона
 */
import { getProof } from "./deductiveEngine.js";

// Константи для аксіом Робінсона
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
// 🛠️ СПІЛЬНІ HELPER ФУНКЦІЇ (Щоб не дублювати код)
// ==========================================

const unwrap = (node) => getProof(node);

// Глибоке порівняння вузлів (ВИПРАВЛЕНЕ)
const areNodesEqual = (n1, n2) => {
  if (!n1 || !n2) return n1 === n2;

  // Якщо це обгортки (parenthesis), знімаємо їх
  // Примітка: якщо getProof вже знімає дужки, ці рядки можна спростити,
  // але для надійності рекурсії залишаємо перевірку типів
  if (n1.type === 'parenthesis') return areNodesEqual(n1.value, n2);
  if (n2.type === 'parenthesis') return areNodesEqual(n1, n2.value);

  if (n1.type !== n2.type) return false;

  // Порівняння значень (Константи, Змінні, Числа)
  if (['variable', 'constant', 'number'].includes(n1.type)) {
    // Використовуємо value або name в залежності від того, що є
    const v1 = n1.value || n1.name;
    const v2 = n2.value || n2.name;
    return v1 === v2;
  }

  // Рекурсія для структур
  if (n1.type === 'successor') return areNodesEqual(n1.term, n2.term);

  // Для бінарних операцій
  if (['addition', 'multiplication', 'equality', 'implication', 'disjunction', 'conjunction'].includes(n1.type)) {
    return areNodesEqual(n1.left, n2.left) && areNodesEqual(n1.right, n2.right);
  }

  // Для кванторів (exists, forall)
  if (n1.type === 'exists' || n1.type === 'forall') {
    return n1.variable === n2.variable && areNodesEqual(n1.operand, n2.operand);
  }

  return false;
};

// Перевірка на нуль
const isZero = (node) => {
  const n = unwrap(node);
  return n && (n.type === 'constant' || n.type === 'number') && n.value === '0';
};

// Перевірка на "Successor-like" (s(...) або число > 0)
const isSuccessorLike = (node) => {
  const n = unwrap(node);
  if (n.type === 'successor') return true;
  if ((n.type === 'constant' || n.type === 'number') && n.value !== '0') return true;
  return false;
};

// Отримати глибину саксесора або число
// Повертає: { type: 'number', value: 5 } АБО { type: 'term', base: node, depth: 3 }
const getSuccessorDepth = (node) => {
  let current = unwrap(node);
  let depth = 0;

  while (current.type === 'successor') {
    depth++;
    current = unwrap(current.term);
  }

  if (current.type === 'constant' || current.type === 'number') {
    return { type: 'number', value: parseInt(current.value, 10) + depth };
  }

  return { type: 'term', base: current, depth: depth };
};

// Зняти один шар саксесора (для Ax1)
const peelSuccessor = (node) => {
  const n = unwrap(node);
  if (n.type === 'successor') return unwrap(n.term);

  if (n.type === 'constant' || n.type === 'number') {
    const val = parseInt(n.value, 10);
    if (!isNaN(val) && val > 0) {
      // Повертаємо об'єкт того ж типу, але на 1 менше
      return { ...n, value: (val - 1).toString() };
    }
  }
  return null;
};


// ==========================================
// 🔍 ФУНКЦІЇ ВАЛІДАЦІЇ АКСІОМ
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
 * Перевіряє патерни: NOT(0=s(x)) або 0 != s(x)
 */
export function validateAxiom2(formula) {
  const root = unwrap(formula);

  // Варіант А: Заперечення рівності (NOT (0 = s(x)))
  if (root.type === 'negation') {
    const operand = unwrap(root.operand);
    if (operand.type === 'equality') {
      const left = unwrap(operand.left);
      const right = unwrap(operand.right);

      // Перевіряємо: один бік 0, інший s(...)
      if ((isZero(left) && isSuccessorLike(right)) || (isZero(right) && isSuccessorLike(left))) {
        return { index: 1, code: "Ax2", desc: "Zero is not a successor (0 ≠ s(x))" };
      }
    }
  }

  // Варіант Б: Якщо парсер підтримує оператор "!=" або "≠"
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

  // Має бути імплікація
  if (root.type !== 'implication') return null;

  const premise = unwrap(root.left);       // x != 0
  const conclusion = unwrap(root.right);   // exists y (x = s(y))

  // 1. Аналіз передумови (x != 0)
  // Це може бути negation(x=0) або inequality
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

  if (!x_Var) return null; // Не знайшли структуру "щось != 0"

  // 2. Аналіз висновку (exists y (x = s(y)))
  // Зазвичай у кроках доведення люди пишуть інстанцію: a != 0 => exists y (a = s(y))
  // Або вже підставлене: exists y (a = s(y))

  if (conclusion.type === 'exists') {
    const body = unwrap(conclusion.operand);
    if (body.type === 'equality') {
      // Шукаємо x = s(y) або s(y) = x
      // x_Var має бути з одного боку
      let successorPart = null;

      if (areNodesEqual(body.left, x_Var)) successorPart = body.right;
      else if (areNodesEqual(body.right, x_Var)) successorPart = body.left;

      if (successorPart && successorPart.type === 'successor') {
        // Перевіряємо, чи змінна всередині successor це та, що під квантором
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

  // Left: x + s(y) (або x + number)
  if (left.type !== 'addition') return null;
  // Right: s(...)
  if (right.type !== 'successor' && right.type !== 'constant' && right.type !== 'number') return null;

  const sy_Left = unwrap(left.right); // Другий доданок зліва

  // Перевірка, що другий доданок НЕ нуль (інакше це Ax4)
  if (isZero(sy_Left)) return null;

  // Отримуємо глибини/значення
  // Left side Y part
  const valLeftY = getSuccessorDepth(sy_Left);

  // Right side (s(x+y)) -> треба дістати те, що всередині s, або число - 1
  let rightInnerVal;
  let rightIsNumber = false;

  if (right.type === 'successor') {
    // s(TERM)
    const term = unwrap(right.term); // TERM має бути x + y
    if (term.type !== 'addition') return null;

    const x_Right = unwrap(term.left);
    const y_Right = unwrap(term.right);

    // Перевіряємо X
    if (!areNodesEqual(unwrap(left.left), x_Right)) return null;

    rightInnerVal = getSuccessorDepth(y_Right);

  } else if (right.type === 'constant' || right.type === 'number') {
    // Це число (наприклад 3, що є s(2))
    // Тоді x + y має дорівнювати 2
    // Це складніший випадок для чистої структурної перевірки,
    // але для 1+2=3 ми можемо це обробити:

    const rVal = parseInt(right.value, 10);
    rightInnerVal = { type: 'number', value: rVal - 1 }; // Зменшуємо на 1 (зняли зовнішній s)
    rightIsNumber = true;
  } else {
    return null;
  }

  // Фінальне порівняння Y частин
  // Зліва ми мали s(y), значить valLeftY.value це (y+1)
  // Справа ми маємо y (всередині s), значить rightInnerVal.value це y

  if (valLeftY.type === 'number' && rightInnerVal.type === 'number') {
    // 1+2 = 3 (або s(1+1))
    // sy_Left = 2 -> valLeftY = 2
    // right = 3 -> rightInnerVal = 2 (бо 3 це s(2))
    // АБО right = s(1+1) -> y_Right = 1 -> rightInnerVal = 1

    // Тут є нюанс:
    // Якщо зліва 1+2 (s(y)=2, y=1).
    // Справа s(1+1) (y=1).
    // Тоді valLeftY (2) == rightInnerVal (1) + 1.

    if (valLeftY.value === rightInnerVal.value + 1) {
      return { index: 4, code: "Ax5", desc: "Recursive addition (x + s(y) = s(x+y))" };
    }
  } else {
    // Символьний: a + s(b) = s(a+b)
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

  // Left: Multiplcation
  if (left.type !== 'multiplication') return null;

  // Перевірка: Right == 0
  if (!isZero(right)) return null;

  // Перевірка: Left operand 2 == 0
  const arg2 = unwrap(left.right);
  if (!isZero(arg2)) return null;

  // Тоді це Ax6: x * 0 = 0
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

  // Структура Зліва
  if (left.type !== 'multiplication') return null;
  const x_Left = unwrap(left.left);
  const sy_Left = unwrap(left.right);

  // sy_Left має бути s(...) або число > 0
  if (isZero(sy_Left)) return null; // Це Ax6

  // Структура Справа
  if (right.type !== 'addition') return null;
  const xy_Right = unwrap(right.left);  // (x * y)
  const x_Right_Outer = unwrap(right.right); // + x

  // 1. Перевіряємо X (він усюди має бути однаковим)
  // x_Left == x_Right_Outer
  if (!areNodesEqual(x_Left, x_Right_Outer)) return null;

  // 2. Перевіряємо (x * y) всередині додавання
  if (xy_Right.type !== 'multiplication') return null;
  const x_Right_Inner = unwrap(xy_Right.left);
  const y_Right = unwrap(xy_Right.right);

  if (!areNodesEqual(x_Left, x_Right_Inner)) return null;

  // 3. Перевіряємо Y
  // Зліва ми маємо sy_Left (це s(y)). Справа маємо y_Right (це y).
  const valLeftY = getSuccessorDepth(sy_Left);
  const valRightY = getSuccessorDepth(y_Right);

  // Логіка як в Ax5: зліва має бути на 1 більше ніж справа
  let isMatch = false;

  if (valLeftY.type === 'number' && valRightY.type === 'number') {
    // Числа: 3 * 2 = ... (2 це s(1), тому y=1).
    // Справа має бути y=1.
    // valLeftY = 2, valRightY = 1.
    if (valLeftY.value === valRightY.value + 1) isMatch = true;
  } else {
    // Символи: a * s(b) = ...
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
 * Головний метод для перевірки всіх аксіом Робінсона
 */
export function validateRobinsonAxioms(formula) {
  // Ваш оригінальний код без змін, він хороший
  console.log("🚀 Починаю перевірку всіх аксіом Робинсона...");

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
      // Видаляємо логи з індивідуальних функцій, щоб не засмічувати консоль,
      // або залишаємо, якщо потрібно дебажити.
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
        validationResults.description = result.desc; // Додав опис
        console.log(`✅ Формула відповідає аксіомі ${validator.num} (${result.code})`);
        break;
      }
    } catch (error) {
      console.error(`❌ Помилка при перевірці аксіоми ${validator.num}:`, error);
      validationResults.details.push({
        axiomNumber: validator.num,
        isValid: false,
        error: error.message
      });
    }
  }

  if (!validationResults.isAxiom) {
    console.log("❌ Формула не відповідає жодній аксіомі Робинсона");
  }

  return validationResults;
}

// getAxiomInfo залишається без змін
export function getAxiomInfo(axiomNumber) {
  const axiomNames = [
    "Ін'єктивність наступника",
    "Нуль не є наступником",
    "Існування попередника",
    "Тотожність додавання",
    "Рекурсія додавання",
    "Множення на нуль",
    "Рекурсія множення"
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
