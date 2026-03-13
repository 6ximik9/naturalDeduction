// runTests.js - Standalone версія без браузерних залежностей

// ==========================================
// 🛠️ MOCK ФУНКЦІЇ (замість браузерних імпортів)
// ==========================================

// Mock функція getProof (знімає дужки з AST вузлів)
function getProof(proof) {
  if (!proof || proof.type !== "parenthesis") {
    return proof;
  }
  return getProof(proof.value);
}

// Константи для аксіом Робінсона
const ROBINSON_AXIOMS = [
  "∀x ∀y (s(x) = s(y) ⇒ x = y)", // ax1
  "∀x (0 ≠ s(x))", // ax2
  "∀x (x ≠ 0 ⇒ ∃y (x = s(y)))", // ax3
  "∀x (x + 0 = x)", // ax4
  "∀x ∀y (x + s(y) = s(x + y))", // ax5
  "∀x (x * 0 = 0)", // ax6
  "∀x ∀y (x * s(y) = (x * y) + x)" // ax7
];

// ==========================================
// 🛠️ HELPER ФУНКЦІЇ
// ==========================================

const unwrap = (node) => getProof(node);

// Глибоке порівняння вузлів (ВИПРАВЛЕНЕ)
const areNodesEqual = (n1, n2) => {
  if (!n1 || !n2) return n1 === n2;

  // Якщо це обгортки (parenthesis), знімаємо їх
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

const createAST = {
  // Helpers для створення вузлів AST
  constant: (val) => ({ type: 'constant', value: val.toString() }),
  variable: (name) => ({ type: 'variable', name }),
  successor: (term) => ({ type: 'successor', term }),
  addition: (left, right) => ({ type: 'addition', left, right }),
  multiplication: (left, right) => ({ type: 'multiplication', left, right }),
  equality: (left, right, op = '=') => ({ type: 'equality', operator: op, left, right }),
  implication: (left, right) => ({ type: 'implication', left, right }),
  negation: (operand) => ({ type: 'negation', operand }),
  exists: (variable, operand) => ({ type: 'exists', variable, operand }),
  forall: (variable, operand) => ({ type: 'forall', variable, operand }),

  // Швидке створення числа через саксесори (напр. 2 -> s(s(0)))
  numberAsSuccessors: (num) => {
    let node = { type: 'constant', value: '0' };
    for (let i = 0; i < num; i++) {
      node = { type: 'successor', term: node };
    }
    return node;
  },

  // Швидке створення числа як константи (напр. "2")
  numberAsConst: (num) => ({ type: 'constant', value: num.toString() })
};

// ==========================================
// 🔍 ФУНКЦІЇ ВАЛІДАЦІЇ АКСІОМ (1-3)
// ==========================================

/**
 * Ax1: ∀x ∀y (s(x) = s(y) ⇒ x = y)
 */
function validateAxiom1(root) {
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
function validateAxiom2(formula) {
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
function validateAxiom3(formula) {
  const root = unwrap(formula);

  // Має бути імплікація
  if (root.type !== 'implication') return null;

  const premise = unwrap(root.left);       // x != 0
  const conclusion = unwrap(root.right);   // exists y (x = s(y))

  // 1. Аналіз передумови (x != 0)
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
  if (conclusion.type === 'exists') {
    const body = unwrap(conclusion.operand);
    if (body.type === 'equality') {
      // Шукаємо x = s(y) або s(y) = x
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

// ==========================================
// 🔍 ФУНКЦІЇ ВАЛІДАЦІЇ АКСІОМ (4-7)
// ==========================================

/**
 * Ax4: ∀x (x + 0 = x)
 */
function validateAxiom4(root) {
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
function validateAxiom5(root) {
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
    const rVal = parseInt(right.value, 10);
    rightInnerVal = { type: 'number', value: rVal - 1 }; // Зменшуємо на 1 (зняли зовнішній s)
    rightIsNumber = true;
  } else {
    return null;
  }

  // Фінальне порівняння Y частин
  if (valLeftY.type === 'number' && rightInnerVal.type === 'number') {
    if (valLeftY.value === rightInnerVal.value + 1) {
      return { index: 4, code: "Ax5", desc: "Recursive addition (x + s(y) = s(x+y))" };
    }
  } else {
    // Символьний: a + s(b) = s(a+b)
    if (valLeftY.depth === rightInnerVal.depth + 1 && areNodesEqual(valLeftY.base, rightInnerVal.base)) {
      return { index: 4, code: "Ax5", desc: "Recursive addition (x + s(y) = s(x+y))" };
    }
  }

  return null;
}

/**
 * Ax6: ∀x (x * 0 = 0)
 */
function validateAxiom6(formula) {
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
function validateAxiom7(formula) {
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
    if (valLeftY.value === valRightY.value + 1) isMatch = true;
  } else {
    // Символи: a * s(b) = ...
    if (valLeftY.depth === valRightY.depth + 1 && areNodesEqual(valLeftY.base, valRightY.base)) {
      isMatch = true;
    }
  }

  if (isMatch) {
    return { index: 6, code: "Ax7", desc: "Recursive multiplication (x * s(y) = x*y + x)" };
  }

  return null;
}

// ==========================================
// 🔍 ГОЛОВНА ФУНКЦІЯ ВАЛІДАЦІЇ
// ==========================================

/**
 * Головний метод для перевірки всіх аксіом Робінсона
 */
function validateRobinsonAxioms(formula) {
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
        validationResults.description = result.desc;
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

// ==========================================
// ТЕСТОВІ ДАНІ
// ==========================================
const tests = [
  // --- Ax1: s(x)=s(y) => x=y ---
  {
    name: "Ax1: Valid (Generic)",
    ast: createAST.implication(
      createAST.equality(createAST.successor(createAST.variable('a')), createAST.successor(createAST.variable('b'))),
      createAST.equality(createAST.variable('a'), createAST.variable('b'))
    ),
    expectedAx: 1
  },
  {
    name: "Ax1: Valid (Numeric 2=2 => 1=1)",
    ast: createAST.implication(
      createAST.equality(createAST.constant('2'), createAST.constant('2')),
      createAST.equality(createAST.constant('1'), createAST.constant('1'))
    ),
    expectedAx: 1
  },
  {
    name: "Ax1: Invalid (Wrong conclusion)",
    ast: createAST.implication(
      createAST.equality(createAST.successor(createAST.variable('a')), createAST.successor(createAST.variable('b'))),
      createAST.equality(createAST.variable('a'), createAST.variable('a')) // a=a замість a=b
    ),
    expectedAx: null
  },

  // --- Ax2: 0 != s(x) ---
  {
    name: "Ax2: Valid (0 != s(a))",
    ast: createAST.equality(
      createAST.constant('0'),
      createAST.successor(createAST.variable('a')),
      '≠'
    ),
    expectedAx: 2
  },
  {
    name: "Ax2: Valid (Negation)",
    ast: createAST.negation(
      createAST.equality(createAST.constant('0'), createAST.successor(createAST.variable('a')))
    ),
    expectedAx: 2
  },
  {
    name: "Ax2: Invalid (0 != 0)",
    ast: createAST.equality(createAST.constant('0'), createAST.constant('0'), '≠'),
    expectedAx: null
  },

  // --- Ax3: x != 0 => exists y (x=s(y)) ---
  {
    name: "Ax3: Valid (Generic)",
    ast: createAST.implication(
      createAST.equality(createAST.variable('a'), createAST.constant('0'), '≠'),
      createAST.exists('y', createAST.equality(createAST.variable('a'), createAST.successor(createAST.variable('y'))))
    ),
    expectedAx: 3
  },
  {
    name: "Ax3: Invalid (Missing successor)",
    ast: createAST.implication(
      createAST.equality(createAST.variable('a'), createAST.constant('0'), '≠'),
      createAST.exists('y', createAST.equality(createAST.variable('a'), createAST.variable('y')))
    ),
    expectedAx: null
  },

  // --- Ax4: x + 0 = x ---
  {
    name: "Ax4: Valid (a + 0 = a)",
    ast: createAST.equality(
      createAST.addition(createAST.variable('a'), createAST.constant('0')),
      createAST.variable('a')
    ),
    expectedAx: 4
  },
  {
    name: "Ax4: Valid (Complex (x+y)+0 = x+y)",
    ast: createAST.equality(
      createAST.addition(
        createAST.addition(createAST.variable('x'), createAST.variable('y')),
        createAST.constant('0')
      ),
      createAST.addition(createAST.variable('x'), createAST.variable('y'))
    ),
    expectedAx: 4
  },
  {
    name: "Ax4: Invalid (0 + a = a)",
    ast: createAST.equality(
      createAST.addition(createAST.constant('0'), createAST.variable('a')),
      createAST.variable('a')
    ),
    expectedAx: null // Це комутативність, не Ax4
  },

  // --- Ax5: x + s(y) = s(x+y) ---
  {
    name: "Ax5: Valid (a + s(b) = s(a+b))",
    ast: createAST.equality(
      createAST.addition(createAST.variable('a'), createAST.successor(createAST.variable('b'))),
      createAST.successor(createAST.addition(createAST.variable('a'), createAST.variable('b')))
    ),
    expectedAx: 5
  },
  {
    name: "Ax5: Valid (Numeric 1 + 2 = s(1+1))",
    ast: createAST.equality(
      createAST.addition(createAST.constant('1'), createAST.constant('2')), // 2 acts as s(1)
      createAST.successor(createAST.addition(createAST.constant('1'), createAST.constant('1')))
    ),
    expectedAx: 5
  },
  {
    name: "Ax5: Invalid (1 + 2 = 3)",
    ast: createAST.equality(
      createAST.addition(createAST.constant('1'), createAST.constant('2')),
      createAST.constant('3')
    ),
    expectedAx: null // Немає структури s(...) справа
  },

  // --- Ax6: x * 0 = 0 ---
  {
    name: "Ax6: Valid (a * 0 = 0)",
    ast: createAST.equality(
      createAST.multiplication(createAST.variable('a'), createAST.constant('0')),
      createAST.constant('0')
    ),
    expectedAx: 6
  },
  {
    name: "Ax6: Invalid (0 * a = 0)",
    ast: createAST.equality(
      createAST.multiplication(createAST.constant('0'), createAST.variable('a')),
      createAST.constant('0')
    ),
    expectedAx: null
  },

  // --- Ax7: x * s(y) = x*y + x ---
  {
    name: "Ax7: Valid (a * s(b) = a*b + a)",
    ast: createAST.equality(
      createAST.multiplication(createAST.variable('a'), createAST.successor(createAST.variable('b'))),
      createAST.addition(
        createAST.multiplication(createAST.variable('a'), createAST.variable('b')),
        createAST.variable('a')
      )
    ),
    expectedAx: 7
  },
  {
    name: "Ax7: Valid (Numeric 3 * 2 = 3*1 + 3)",
    ast: createAST.equality(
      createAST.multiplication(createAST.constant('3'), createAST.constant('2')), // 2 is s(1)
      createAST.addition(
        createAST.multiplication(createAST.constant('3'), createAST.constant('1')),
        createAST.constant('3')
      )
    ),
    expectedAx: 7
  },
  {
    name: "Ax7: Invalid (Wrong addition term)",
    ast: createAST.equality(
      createAST.multiplication(createAST.variable('a'), createAST.successor(createAST.variable('b'))),
      createAST.addition(
        createAST.multiplication(createAST.variable('a'), createAST.variable('b')),
        createAST.variable('b') // Added b instead of a
      )
    ),
    expectedAx: null
  }
];

// ==========================================
// ЗАПУСК ТЕСТІВ
// ==========================================
function runTests() {
  console.log("🚀 STARTING AUTOMATED ROBINSON AXIOM TESTS\n");

  let passed = 0;
  let failed = 0;
  const results = [];

  tests.forEach((test, index) => {
    let result;
    try {
      result = validateRobinsonAxioms(test.ast);
    } catch (e) {
      console.error(`Error running test "${test.name}":`, e);
      result = { isAxiom: false, error: e.message };
    }

    const actualAx = result.isAxiom ? result.axiomNumber : null;
    const isSuccess = actualAx === test.expectedAx;

    if (isSuccess) {
      passed++;
      results.push(`✅ [PASS] ${test.name}`);
    } else {
      failed++;
      results.push(`❌ [FAIL] ${test.name}\n   Expected: ${test.expectedAx ? 'Ax' + test.expectedAx : 'None'}\n   Got:      ${actualAx ? 'Ax' + actualAx : 'None'}`);
    }
  });

  console.log(results.join('\n'));
  console.log("\n==========================================");
  console.log(`📊 SUMMARY: Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("==========================================\n");

  if (failed === 0) {
    console.log("🎉 Great job! All tests passed.");
  } else {
    console.log("⚠️ Some tests failed. Please copy this output and send it for review.");
  }
}

// Запускаємо
runTests();
