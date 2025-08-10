import {CharStreams, CommonTokenStream, ParseTreeWalker} from 'antlr4';
import GrammarLexer from '../my_antlr/GrammarLexer.js';
import GrammarParser from '../my_antlr/GrammarParser.js';
import MyGrammarListener from '../my_antlr/MyGrammarListener.js';
import * as editorMonaco from './monacoEditor';
import * as deductive from './deductiveEngine';
import * as controlState from './states';
import {checkWithAntlr, convertToLogicalExpression, getProof, handleModalCancellation} from "./deductiveEngine";
import {checkRule, typeProof} from "./index";
import {shakeElement} from "./index";
import {createTreeD3} from "./tree";
import {addNextLastButtonClickGentzen} from "./states";
import {latexGentzen} from "./latexGen";
import {GENTZEN_BUTTONS, ruleGentzenHandlers,} from './ruleGentzenHandlers';
import {get} from "mobx";
import {formulaToString} from "./formatter";


// Структура для зберігання контексту дедукції
export let deductionContext = {
  hypotheses: [], // Список гіпотез
  conclusions: [] // Список висновків
};

export let level = 0;
export let currentLevel = -1;

export let userHypotheses;

export let side;
export let lastSide;
export let mainReplaces = "";

let hasError = false;

export let state = 0;

let nameRule;

let oldUserInput = "";

export function setState(newValue) {
  state = newValue;
}

export function setReplaces(newValue) {
  mainReplaces = newValue;
}

// Сетер для level
export function setLevel(newLevel) {
  level = newLevel;
}

// Сетер для currentLevel
export function setCurrentLevel(newCurrentLevel) {
  currentLevel = newCurrentLevel;
}

// Сетер для userHypotheses
export function setUserHypotheses(newUserHypotheses) {
  userHypotheses = newUserHypotheses;
}

// Сетер для side
export function setSide(newSide) {
  side = newSide;
}

// Сетер для lastSide
export function setLastSide(newLastSide) {
  lastSide = newLastSide;
}

export function addConclusions(data) {
  deductionContext.conclusions.push(data);
}

export function addHypotheses(data) {
  deductionContext.hypotheses.push(data);
}

/**
 * Обробляє клік по дереву доказу: виділяє елемент та ініціює обробку виразу.
 */
document.getElementById('proof').addEventListener('click', function (event) {
  if (typeProof === 1) return;

  const clickedElement = event.target;

  // Ігнорувати клік по вже закритому елементу
  if (clickedElement.className === "previous") return;

  clearLabelHighlights();

  if (clickedElement.tagName === 'DIV') {
    side = clickedElement;
    try {
      side.querySelector('label').style.background = 'rgba(136,190,213,0.78)';
    } catch (error) {
      console.error('Monaco editor clicked');
    }
  } else if (clickedElement.tagName === 'LABEL') {
    side = clickedElement.parentNode;
    clickedElement.style.background = 'rgba(136,190,213,0.78)';
  }

  // Якщо немає попереднього перегляду — обробити клік
  if (document.getElementsByClassName("preview").length === 0) {
    setTimeout(handleClick, 100);
  }

  // Перемикаємося на вкладку 1
  document.getElementById('tab1').checked = true;
});

/**
 * Скидає підсвічування всіх label-елементів у дереві доказу.
 */
function clearLabelHighlights() {
  const labels = document.getElementById('proof').querySelectorAll('label');
  labels.forEach(label => {
    label.style.background = '';
  });
}

/**
 * Обробляє вибраний елемент дерева доказу, якщо він ще не оброблений.
 */
function handleClick() {
  if (!side) return;

  const isAlreadyProcessed = side.querySelector('.preview');
  const isClosed = side.className === "closed";

  if (!isAlreadyProcessed && !isClosed) {
    try {
      oldUserInput = side.querySelector('#proofText').textContent;
      const parsed = deductive.checkWithAntlr(oldUserInput);
      processExpression(parsed, 1);
      showAllHyp();
    } catch (error) {
      console.warn('Не вдалося обробити клік:', error);
    }
  }
}

/**
 * Парсить логічний вираз, створює дерево доказу та ініціалізує інтерфейс.
 * @param {string} text - Вхідний логічний вираз.
 */
export function parseExpression(text) {
  if (hasError || !text || text.trim().length === 0) {
    shakeElement('enter', 5);
    return;
  }

  // Приховуємо поле введення формули
  document.getElementById('enterFormula').className = 'hidden';

  // Ініціалізація інтерфейсу
  addClickGentzenRules();
  addNextLastButtonClickGentzen();
  latexGentzen();
  addOrRemoveParenthesesGentzen();
  addClickSwitchNotation();

  try {
    // Парсинг виразу через ANTLR
    const chars = CharStreams.fromString(text);
    const lexer = new GrammarLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new GrammarParser(tokens);

    // Add error handling to prevent reportAttemptingFullContext errors
    parser.removeErrorListeners();
    parser.addErrorListener({
      syntaxError: function (recognizer, offendingSymbol, line, column, msg, e) {
        throw new Error(`Parse error at line ${line}, column ${column}: ${msg}`);
      },
      reportAmbiguity: function(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
        console.warn('Grammar ambiguity detected in Gentzen proof parsing');
      },
      reportAttemptingFullContext: function(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
        console.warn('Parser attempting full context in Gentzen proof parsing');
      },
      reportContextSensitivity: function(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
        console.warn('Context sensitivity detected in Gentzen proof parsing');
      }
    });

    const tree = parser.implication();

    const listener = new MyGrammarListener();
    ParseTreeWalker.DEFAULT.walk(listener, tree);

    const parsedProof = listener.stack.pop();

    console.log(parsedProof);
    console.log(JSON.stringify(parsedProof, null, 2));

    const full = formulaToString(parsedProof, 1);    // з усіма дужками
    const minimal = formulaToString(parsedProof, 0); // тільки необхідні

    console.log('FULL:', full);
    console.log('MINIMAL:', minimal);

    // Зберігаємо результат у контекст
    const conclusion = {
      level: level++,
      proof: parsedProof
    };
    deductionContext.conclusions[0] = conclusion;

    // Створюємо дерево доказу
    createProofTree(conclusion, document.getElementById('proof'));

    // Встановлюємо активну сторону
    side = document.querySelector('.proof-element_level-0').children[0];
    oldUserInput = side.querySelector('#proofText').textContent;

    // Зберігаємо стан і показуємо кнопки
    controlState.saveState();
    processExpression(parsedProof, 1);
    document.getElementById('undo_redo').style.display = 'flex';

    showAllHyp();
  } catch (error) {
    console.error("Помилка при парсингу виразу:", error);
    shakeElement('enter', 5);
  }
}

/**
 * Генерує кнопки правил виводу на основі типу логічного виразу.
 * @param {Object} expression - Об'єкт логічного виразу.
 * @param {number} countRules - Якщо 1 — показати всі правила.
 */
export function processExpression(expression, countRules) {
  document.getElementById('proof-menu').className = 'proof-menu';

  // Якщо потрібно показати всі правила
  if (countRules === 1) {
    generateButtons(GENTZEN_BUTTONS.length, GENTZEN_BUTTONS);
    return;
  }

  const expr = deductive.getProof(expression);

  switch (expr.type) {
    case "variable":
    case "constant":
    case "number":
    case "atom":
      const value = expr.value || expr.name;
      if (value === '⊤') {
        generateButtons(1, [GENTZEN_BUTTONS[2]]);
      } else if (value === '⊥') {
        generateButtons(1, [GENTZEN_BUTTONS[4]]);
      } else {
        generateButtons(6, [
          GENTZEN_BUTTONS[0], GENTZEN_BUTTONS[1],
          GENTZEN_BUTTONS[6], GENTZEN_BUTTONS[7],
          GENTZEN_BUTTONS[10], GENTZEN_BUTTONS[12]
        ]);
      }
      break;

    case "implication":
      generateButtons(8, [
        GENTZEN_BUTTONS[0], GENTZEN_BUTTONS[1],
        GENTZEN_BUTTONS[6], GENTZEN_BUTTONS[7],
        GENTZEN_BUTTONS[10], GENTZEN_BUTTONS[11],
        GENTZEN_BUTTONS[12], GENTZEN_BUTTONS[16]
      ]);
      break;

    case "conjunction":
      generateButtons(8, [
        GENTZEN_BUTTONS[0], GENTZEN_BUTTONS[1],
        GENTZEN_BUTTONS[5], GENTZEN_BUTTONS[6],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[10],
        GENTZEN_BUTTONS[12], GENTZEN_BUTTONS[16]
      ]);
      break;

    case "disjunction":
      generateButtons(9, [
        GENTZEN_BUTTONS[0], GENTZEN_BUTTONS[1],
        GENTZEN_BUTTONS[6], GENTZEN_BUTTONS[7],
        GENTZEN_BUTTONS[8], GENTZEN_BUTTONS[9],
        GENTZEN_BUTTONS[10], GENTZEN_BUTTONS[12],
        GENTZEN_BUTTONS[16]
      ]);
      break;

    case "negation":
      generateButtons(2, [GENTZEN_BUTTONS[3], GENTZEN_BUTTONS[16]]);
      break;

    case "quantifier":
      if (expr.quantifier === '∃') {
        generateButtons(2, [GENTZEN_BUTTONS[13], GENTZEN_BUTTONS[16]]);
      } else if (expr.quantifier === '∀') {
        generateButtons(2, [GENTZEN_BUTTONS[14], GENTZEN_BUTTONS[16]]);
      }
      break;

    case "forall":
      generateButtons(3, [GENTZEN_BUTTONS[14], GENTZEN_BUTTONS[15], GENTZEN_BUTTONS[16]]);
      break;

    case "exists":
      generateButtons(3, [GENTZEN_BUTTONS[13], GENTZEN_BUTTONS[15], GENTZEN_BUTTONS[16]]);
      break;

    case "predicate":
    case "relation":
      generateButtons(4, [GENTZEN_BUTTONS[15], GENTZEN_BUTTONS[16], GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18]]);
      break;

    case "equality":
      generateButtons(4, [GENTZEN_BUTTONS[15], GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18], GENTZEN_BUTTONS[19]]);
      break;

    case "addition":
    case "multiplication":
    case "successor":
    case "function":
      // Arithmetic and function expressions
      generateButtons(4, [GENTZEN_BUTTONS[15], GENTZEN_BUTTONS[16], GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18]]);
      break;

    case "sequent":
      // Handle sequent notation
      generateButtons(6, [
        GENTZEN_BUTTONS[0], GENTZEN_BUTTONS[1],
        GENTZEN_BUTTONS[6], GENTZEN_BUTTONS[7],
        GENTZEN_BUTTONS[10], GENTZEN_BUTTONS[12]
      ]);
      break;

    default:
      console.warn("Невідомий тип виразу:", expr);
      break;
  }
}

/**
 * Генерує кнопки правил виводу та, за потреби, кнопку закриття гілки.
 * @param {number} buttonCount - Кількість кнопок.
 * @param {string[]} buttonTexts - Тексти кнопок (LaTeX).
 */
function generateButtons(buttonCount, buttonTexts) {
  const buttonContainer = document.getElementById('button-container');
  buttonContainer.innerHTML = '';

  const currentExpr = deductive.getProof(
    deductive.checkWithAntlr(side.querySelector('#proofText').textContent)
  );

  const hypotheses = deductive.getAllHypotheses(side).map(h =>
    deductive.getProof(h)
  );

  const isInHypotheses = hypotheses.some(h =>
    deductive.compareExpressions(h, currentExpr)
  );

  if (isInHypotheses) {
    const closeBtn = createButton("Close branch", () => closeSide(side));
    closeBtn.style.minHeight = '80px';
    buttonContainer.appendChild(closeBtn);
  }

  for (let i = 0; i < buttonCount; i++) {
    const button = createButton(buttonTexts[i], () => buttonClicked(buttonTexts[i]));
    buttonContainer.appendChild(button);
  }

  MathJax.typesetPromise().catch(err => console.warn('MathJax помилка:', err));
}

/**
 * Створює HTML-кнопку з заданим текстом та обробником кліку.
 * @param {string} text - Текст кнопки (може містити LaTeX).
 * @param {Function} clickHandler - Функція, яка викликається при кліку.
 * @returns {HTMLButtonElement} - Створена кнопка.
 */
function createButton(text, clickHandler) {
  const button = document.createElement('button');
  button.className = 'button';
  button.innerHTML = text;
  button.addEventListener('click', clickHandler);
  return button;
}


/**
 * Закриває гілку дерева доказу, очищаючи заміни та оновлюючи інтерфейс.
 * @param {HTMLElement} container - DOM-елемент гілки.
 */
function closeSide(container) {
  // Видаляємо всі span-елементи (заміни)
  container.querySelectorAll('span').forEach(span => span.remove());

  // Позначаємо гілку як закриту
  container.className = 'closed';
  const labelText = `[${container.textContent}]`;
  container.innerHTML = `<label class="previous" id="proofText">${labelText}</label>`;

  // Оновлюємо інтерфейс
  document.getElementById('proof-menu').className = 'hidden';
  document.getElementById('currentHypotheses').style.display = 'none';
  document.getElementById('currentLabelHypotheses').style.display = 'none';

  controlState.saveState();
}

/**
 * Обробляє натискання на кнопку правила виводу.
 * Використовує ruleGentzenHandlers для визначення дії.
 * @param {string} buttonText - Текст кнопки (LaTeX з назвою правила).
 */
async function buttonClicked(buttonText) {
  lastSide = side;
  const size = deductionContext.conclusions.length - 1;
  const allButtons = document.querySelectorAll('#button-container button');

  const ruleName = deductive.extractTextBetweenParentheses(buttonText.toString());
  nameRule = ruleName;

  let expr = getProof(checkWithAntlr(lastSide.querySelector('#proofText').textContent));
  const handler = ruleGentzenHandlers[ruleName];

  if (!handler) {
    console.warn(`Правило "${ruleName}" не знайдено.`);
    return;
  }

  // Перевірка умови застосування правила
  if (!handler.condition(expr)) {
    const index = Object.keys(ruleGentzenHandlers).indexOf(ruleName);
    if (allButtons[index]) shakeButton(allButtons[index]);
    return;
  }

  // Виконання дії з обробкою скасування модального вікна
  try {
    let result = handler.returnsResult ? await handler.action() : await handler.action();

    // Створення дерева доказу, якщо потрібно
    if (handler.requiresTree && currentLevel!==-1) {
      console.log(deductionContext.conclusions);
      const newConclusion = deductionContext.conclusions[size + 1];
      console.log('new', newConclusion);

      // Check if a new conclusion was actually added
      if (newConclusion) {
        createProofTree(newConclusion, side, result);
        controlState.saveState();
      } else {
        console.log('No new conclusion was added - rule may have been cancelled');
      }
    }
  } catch (error) {
    if (deductive.handleModalCancellation(`Rule "${ruleName}"`, error)) {
      console.log(`- no action taken`);
      return; // Gracefully exit without creating tree or changing state
    }
    // For other errors, log and potentially show user feedback
    console.error(`Error in rule "${ruleName}":`, error);
    // Optionally show user-friendly error message
    // alert(`An error occurred while applying the rule: ${error.message}`);
  }

  // Очистка інтерфейсу
  document.getElementById('proof-menu').className = 'hidden';
  document.getElementById("tab1").checked = true;

  const labels = document.getElementById('proof').querySelectorAll('label');
  labels.forEach(label => {
    label.style.background = '';
  });
}

function shakeButton(button) {
  let element = button;

  let interval = 100; // час між кожною тряскою

  element.classList.add('shake'); // Додаємо клас, який запускає анімацію
  element.style.transition = 'background-color 0.5s ease'; // Додаємо перехід для зміни кольору
  element.style.backgroundColor = 'rgba(253,81,81,0.5)'; // Змінюємо колір

  setTimeout(function () {
    element.classList.remove('shake'); // Видаляємо клас після завершення анімації
    element.style.backgroundColor = 'white'; // Повертаємо колір до початкового
  }, interval * 5);
}


/**
 * Зберігає поточне піддерево доказу, створене користувачем у редакторі.
 * Перевіряє правильність виразу, створює новий висновок і додає його до дерева.
 */
export function saveTree() {
  if (hasError) {
    shakeElement('saveBtn', 5);
    return;
  }

  let er = 0;
  const inputText = editorMonaco.editor.getValue();
  const parsed = deductive.checkWithAntlr(inputText, er);

  // Перевірка на синтаксичну коректність
  if (deductive.checkCorrect(parsed) === 1 && currentLevel !== 5) {
    const errorMessages = {
      7: "Missing conjunction, please correct your input",
      8: "Missing conjunction, please correct your input",
      11: "Missing disjunction, please correct your input",
      13: "Missing implication, please correct your input",
      18: "Missing relation, please correct your input",
      19: "Missing relation, please correct your input"
    };
    if (errorMessages[currentLevel]) alert(errorMessages[currentLevel]);
    return;
  }

  // Формування premises залежно від рівня
  let premises = [];
  if (currentLevel === 5) {
    premises = [inputText, `!${inputText}`];
  } else if (currentLevel === 11) {
    const base = deductive.convertToLogicalExpression(
      deductive.checkWithAntlr(lastSide.querySelector('#proofText').textContent)
    );
    premises = [inputText, base, base];
  } else if (currentLevel === 13) {
    const prof1 = deductive.checkWithAntlr(inputText, er);
    premises = [
      deductive.convertToLogicalExpression(prof1.left),
      deductive.convertToLogicalExpression(prof1)
    ];
  } else if (currentLevel === 18) {
    const input = getProof(deductive.checkWithAntlr(inputText, er));
    let prev = deductive.checkWithAntlr(lastSide.querySelector('#proofText').textContent);
    console.log(prev);
    let var1 = deductive.extractConstantsOrVariables(input)
    let var2 = deductive.extractConstantsOrVariables(prev)
    premises = [inputText, var1 + "=" + var2];
  } else if (currentLevel === 19) {
    const input = getProof(deductive.checkWithAntlr(inputText, er));
    let prev = deductive.checkWithAntlr(lastSide.querySelector('#proofText').textContent);
    console.log(prev);
    let var1 = deductive.extractConstantsOrVariables(input)
    let var2 = deductive.extractConstantsOrVariables(prev)
    premises = [inputText, var2 + "=" + var1];
  } else {
    premises = [inputText];
  }

  // Парсимо всі premises
  const data = premises.map(str => deductive.checkWithAntlr(str, er));
  if (er === 1) return;

  // Створюємо новий висновок
  const newConclusion = {
    level: level++,
    proof: data.length > 1 ? data : data[0]
  };
  deductionContext.conclusions.push(newConclusion);

  // Видаляємо попередній preview
  const divToRemove = document.getElementById("preview");
  if (divToRemove) divToRemove.remove();

  // Додаємо обробник кліку до всіх елементів дерева
  document.querySelectorAll('[class^="divItem-"]').forEach(el =>
    el.addEventListener('click', handleClick)
  );

  // Додаємо нове піддерево
  createProofTree(newConclusion, lastSide);
  controlState.saveState();
}

let enterText = document.getElementById('editorPanel');

/**
 * Створює попередній перегляд доказу з редактором і кнопкою збереження.
 * @param {Object} conclusions - Об'єкт з висновками користувача.
 */
export function createTestProof(conclusions) {
  let container = document.getElementById('proof');
  if (level > 1) {
    container = side;
  }

  // Очистити редактор
  editorMonaco.clearEditorErrors();
  editorMonaco.editor.setValue('');
  editorMonaco.editor.setValue(conclusions.proof[0]);
  editorMonaco.editor.updateOptions({fontSize: 24});

  // Перевірити вираз
  checkRule(1, editorMonaco.editor.getValue());

  // Створити preview-контейнер
  const preview = document.createElement('div');
  preview.className = "preview";
  preview.id = 'preview';
  preview.style.display = 'flex';
  preview.style.flexDirection = 'row';
  preview.style.alignItems = 'center';
  preview.style.justifyContent = 'flex-start';
  preview.style.gap = '10px';

  // Стилізувати редактор
  styleEditorPanel();

  // Створити кнопку "Save"
  const saveButton = createSaveButton();

  // Додати редактор і кнопку до preview
  // Only append enterText if it exists
  if (enterText) {
    preview.appendChild(enterText);
  }
  preview.appendChild(saveButton);

  // Додати preview до контейнера
  if (container.firstChild) {
    container.insertBefore(preview, container.firstChild);
  } else {
    container.appendChild(preview);
  }

  // Видалити resize-елемент, якщо є
  const resize = document.getElementById('editorResize');
  if (resize) resize.remove();

  deductive.editPadding();
}

/**
 * Стилізує панель редактора.
 */
function styleEditorPanel() {
  // Check if enterText element exists before accessing its style
  if (enterText) {
    enterText.style.display = 'inline-block';
    enterText.style.verticalAlign = 'middle';
    enterText.style.width = '400px';
    enterText.style.height = '70px';
    enterText.style.padding = '10px';
    enterText.style.overflow = 'auto';
    enterText.style.textAlign = 'left';
    enterText.style.fontFamily = "'Times New Roman', sans-serif";
    enterText.style.fontSize = '16px';
    enterText.style.lineHeight = '1.5';
    enterText.style.border = '1px solid #ccc';
    enterText.style.borderRadius = '4px';
    enterText.style.boxSizing = 'border-box';
  }
}

/**
 * Створює кнопку "Save" з іконкою.
 * @returns {HTMLButtonElement} - Кнопка збереження.
 */
function createSaveButton() {
  const button = document.createElement('button');
  button.classList.add('buttonWithIcon');
  button.id = 'saveBtn';

  button.style.display = 'flex';
  button.style.justifyContent = 'center';
  button.style.alignItems = 'center';
  button.style.background = 'white';
  button.style.color = '#212121';
  button.style.boxShadow = 'rgba(0, 0, 0, 0.25) 0px 2px 5px 0px';
  button.style.fontSize = '24px';
  button.style.marginLeft = '20px';
  button.style.marginTop = '15px';
  button.style.height = '40px';

  button.innerHTML = `
  <span class="buttonText">Save</span>
  <div class="buttonIcon" style="margin: 0px 0px 0px 10px; height: 100%; width: 24px;">
    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#0061a1">
      <g id="SVGRepo_bgCarrier" stroke-width="0"/>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.24000000000000005"/>
      <g id="SVGRepo_iconCarrier">
        <path d="M3 12L3 18.9671C3 21.2763 5.53435 22.736 7.59662 21.6145L10.7996 19.8727M3 8L3 5.0329C3 2.72368 5.53435 1.26402 7.59661 2.38548L20.4086 9.35258C22.5305 10.5065 22.5305 13.4935 20.4086 14.6474L14.0026 18.131" stroke="#0061a1" stroke-width="2.4" stroke-linecap="round"/>
      </g>
    </svg>
  </div>`;

  button.addEventListener('click', saveTree);
  return button;
}

editorMonaco.editor.onKeyDown(function (e) {
  // Перевіряємо, чи натиснута клавіша Enter
  if (e.keyCode === monaco.KeyCode.Enter && document.getElementById('preview')) {
    // Скасовуємо стандартну дію (перехід на новий рядок)
    e.preventDefault();
  }
});

// Функція для створення елементу дерева доказу
function createProofElement(level) {
  const proofElement = document.createElement('div');
  proofElement.className = `proof-element_level-${level}`;
  return proofElement;
}

function createProofTree(conclusions, container, hyp = null) {
  if (!conclusions || Object.keys(conclusions).length === 0 || !conclusions.proof) {
    return;
  }
  const levelDiv = createProofElement(conclusions.level);

  if (conclusions.level !== 0) {
    let lvl = document.querySelector(`.proof-element_level-${conclusions.level - 1}`);
    if (lvl.childElementCount === 0) {
      lvl.style.borderTop = '2px solid #000000';
    }
    levelDiv.appendChild(deductive.createLineLevel(nameRule));
    levelDiv.style.borderBottom = '2px solid #000000';
  }
  // Обробка conclusions.proof як масиву, якщо це масив
  if (Array.isArray(conclusions.proof)) {
    conclusions.proof.forEach((proofElement, index) => {
      const proofDiv = document.createElement(`div`);
      //вернутись бо не працюэ
      const result = formulaToString(getProof(proofElement), 0);
      let text = `${deductive.convertToLogicalExpression(getProof(deductive.checkWithAntlr(result)))}`;

      // console.log(text);
      proofDiv.id = 'divId-' + container.id;
      proofDiv.innerHTML = '<label id="proofText">' + text + '</label>';
      proofDiv.style.alignSelf = 'flex-end';
      proofDiv.addEventListener('click', handleClick);

      addUserHyp(conclusions, proofDiv);
      levelDiv.appendChild(proofDiv);

      // Додавання роздільника, якщо це не останній елемент
      if (index < conclusions.proof.length - 1) {
        proofDiv.style.marginRight = '130px';
      }

    });
  } else {
    const proofDiv = document.createElement(`div`);
    let text = " ";
    if (currentLevel !== 3) {
      let result = deductive.convertToLogicalExpression(conclusions.proof);
      console.log(conclusions.proof);
      console.log(result);
      if (level !== 1) {
        const result = formulaToString(getProof(conclusions.proof), 0);
      }
      text = `${deductive.convertToLogicalExpression(deductive.checkWithAntlr(result))}`;
    }


    proofDiv.id = 'divId-' + container.id;
    if (text !== " ") {
      if (mainReplaces !== "") {
        proofDiv.innerHTML = '<label id="proofText">' + text + '</label>' +
          '<span id="repl" style="display: none;">' + mainReplaces + '</span>';
        mainReplaces = "";
      } else {
        proofDiv.innerHTML = '<label id="proofText">' + text + '</label>';
      }
    } else {
      if (mainReplaces !== "") {
        proofDiv.innerHTML = '<label class="previous" id="proofText">' + text + '</label>' +
          '<span id="repl" style="display: none;">' + mainReplaces + '</span>';
        mainReplaces = "";
      } else {
        proofDiv.innerHTML = '<label class="previous" id="proofText">' + text + '</label>';
      }
      proofDiv.style.paddingTop = "25px";
      proofDiv.style.background = "white";
      proofDiv.className = 'closed';
      closeSide(side);
    }
    proofDiv.style.fontFamily = "'Times New Roman', sans-serif";
    addUserHyp(conclusions, proofDiv);
    levelDiv.appendChild(proofDiv);

  }

  //11 правило гіпотези
  if (conclusions.proof.length === 3 && currentLevel === 11) {
    let childElements = levelDiv.children;

    childElements[2].id = lastSide.id + 'divId-' + deductive.convertToLogicalExpression(conclusions.proof[0].left);
    childElements[3].id = lastSide.id + 'divId-' + deductive.convertToLogicalExpression(conclusions.proof[0].right);

    deductionContext.hypotheses.push({level: level - 1, hyp: conclusions.proof[0].left});
    deductionContext.hypotheses.push({level: level - 1, hyp: conclusions.proof[0].right});
  }

  //14 правило(запамятати заміни)
  const spansRepl = container.querySelectorAll('span#repl'); // Знаходимо всі span з id="repl"
  if (spansRepl.length > 0) {
    const childElements = levelDiv.children; // Отримуємо всі дочірні елементи levelDiv

    spansRepl.forEach(spanRepl => {
      const clonedSpan = spanRepl.cloneNode(true); // Клонуємо кожен span
      Array.from(childElements).forEach(child => {
        if (!child.classList.contains('nameRule')) {
          child.appendChild(clonedSpan.cloneNode(true)); // Додаємо клонований span до дочірніх елементів
        }
      });
    });
  }

  //17 правило
  if (currentLevel === 17 && hyp !== null) {
    let childElements = levelDiv.children;

    childElements[2].id = lastSide.id + 'divId-' + deductive.convertToLogicalExpression(hyp);

    deductionContext.hypotheses.push({level: level - 1, hyp: hyp});
  }

  if (currentLevel === 20) {
    let childElements = levelDiv.children;

    const firstChildText = childElements[1]?.querySelector('#proofText')?.textContent;
    const secondChildText = childElements[2]?.querySelector('#proofText')?.textContent;

    childElements[1].id = lastSide.id + 'divId-' + secondChildText;
    childElements[2].id = lastSide.id + 'divId-' + firstChildText;

    deductionContext.hypotheses.push({level: level - 1, hyp: getProof(checkWithAntlr(secondChildText))});
    deductionContext.hypotheses.push({level: level - 1, hyp: getProof(checkWithAntlr(firstChildText))});
    console.log(childElements);
  }

  showAllHyp();

  if (container.id !== 'proof' && container.className !== 'closed') {
    container.className = 'previous';
    container.querySelector('#proofText').className = 'previous';
  }

  // Вставити на початок контейнера
  if (container.firstChild) {
    container.insertBefore(levelDiv, container.firstChild);
  } else {
    container.appendChild(levelDiv);
  }

  document.getElementById('currentHypotheses').style.display = 'none';
  document.getElementById('currentLabelHypotheses').style.display = 'none';

  if (conclusions.level !== 0) {
    deductive.editPadding();
  }

  oldUserInput = "";
}


function showAllHyp() {
  //uniqueHypotheses
  let seenValues = new Set();
  let hypothesesAll = deductionContext.hypotheses.filter(item => {
    if (!seenValues.has(item.hyp)) {
      seenValues.add(item.hyp);
      return true;
    }
    return false;
  });

  document.getElementById('hypotheses-container').style.display = "flex";
  if (hypothesesAll.length !== 0) {
    let allHypotheses = document.getElementById('allHypotheses');
    allHypotheses.innerHTML = '';
    for (let i = 0; i < hypothesesAll.length; i++) {
      let index = String.fromCharCode(97 + i); // 97 відповідає коду символа 'a'
      let text1 = deductive.convertToLogicalExpression(hypothesesAll[i].hyp);

      let element = document.createElement('div');
      element.className = 'hyp';
      element.innerHTML = '[' + text1 + ']' + '<sup>' + index + '</sup>';
      element.style.fontFamily = "'Times New Roman', sans-serif";
      element.style.textWrap = 'nowrap';
      allHypotheses.appendChild(element);
    }
  } else {
    document.getElementById('hypotheses-container').style.display = "none";
    let myDivHyp = document.getElementById('allHypotheses');
    myDivHyp.innerHTML = '';
  }

  try {
    let currentHypotheses = document.getElementById('currentHypotheses');
    document.getElementById('currentLabelHypotheses').style.display = 'flex';
    currentHypotheses.style.display = 'block';
    currentHypotheses.innerHTML = '';
    let all = deductive.getAllHypotheses(side);
    let hypothesesCur = Array.from(new Set(all.map(JSON.stringify))).map(JSON.parse);
    for (let y = 0; y < hypothesesCur.length; y++) {
      let index = String.fromCharCode(97 + y); // 97 відповідає коду символа 'a'
      let text1 = deductive.convertToLogicalExpression(hypothesesCur[y]);

      let element = document.createElement('div');
      element.className = 'hyp';
      element.innerHTML = '[' + text1 + ']' + '<sup>' + index + '</sup>';
      element.style.fontFamily = "'Times New Roman', sans-serif";
      element.style.textWrap = 'nowrap';
      currentHypotheses.appendChild(element);
    }
  } catch (error) {

  }
}


/**
 * Додає гіпотези користувача до дерева доказу на першому рівні.
 * @param {Object} conclusions - Висновок, до якого додаються гіпотези.
 * @param {HTMLElement} proofDiv - DOM-елемент, до якого додається ідентифікатор.
 */
function addUserHyp(conclusions, proofDiv) {
  if (conclusions.level !== 0 || !userHypotheses || userHypotheses.length === 0) return;

  userHypotheses.forEach(hypText => {
    try {
      const parsed = deductive.checkWithAntlr(hypText);
      const withParens = formulaToString(parsed, 1);
      const proof = deductive.getProof(deductive.checkWithAntlr(withParens));

      deductionContext.hypotheses.push({
        level: level,
        hyp: proof
      });

      proofDiv.id += 'divId-' + hypText;
    } catch (error) {
      console.warn("Помилка при додаванні гіпотези користувача:", error);
    }
  });

  userHypotheses = "";
}


function addOrRemoveParenthesesGentzen() {

  document.getElementById('addParentheses').addEventListener('click', function () {
    const inProof = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);
    // side.querySelector('#proofText').textContent = deductive.convertToLogicalExpression(deductive.deleteHeadBack(inProof));
    side.querySelector('#proofText').textContent = formulaToString(inProof, 1);
  });

  document.getElementById('deleteParentheses').addEventListener('click', function () {
    const expression = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);
    // side.querySelector('#proofText').textContent = deductive.convertToLogicalExpression(deductive.getProof(deductive.checkWithAntlr(deductive.removeRedundantParentheses(expression))));
    side.querySelector('#proofText').textContent = formulaToString(getProof(expression), 0);
  });

  document.getElementById('returnUserInput').addEventListener('click', function () {
    if (oldUserInput !== "") {
      side.querySelector('#proofText').textContent = oldUserInput;
    } else {
      shakeButton(document.getElementById('returnUserInput'));
    }
  });

}

function addClickGentzenRules() {
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  tabTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const tabId = this.getAttribute('for');
      if (!side) {
        return;
      }
      if (tabId === 'tab1') {
        if (typeProof === 1) {
          return;
        }
        processExpression(checkWithAntlr(oldUserInput), 1);
      } else if (tabId === 'tab2') {
        if (typeProof === 1) {
          return;
        }
        processExpression(checkWithAntlr(side.querySelector('#proofText').textContent), 0);
      } else {
        const buttonContainer = document.getElementById('button-container');
        buttonContainer.innerHTML = '';

        let svgContainer = document.createElement("div");
        svgContainer.style.width = "100%"; // Або використовуйте фіксовану ширину, наприклад "1000px"
        svgContainer.style.maxWidth = "1000px";
        svgContainer.style.overflow = "auto"; // Дозволяє прокрутку, якщо вміст більше контейнера
        svgContainer.style.height = "auto"; // Висота адаптується до вмісту

        let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("width", "1000");
        svgElement.setAttribute("height", "1000"); // Початкова висота, може бути змінена динамічно

        svgContainer.appendChild(svgElement);

        buttonContainer.appendChild(svgContainer);

        let size = createTreeD3(checkWithAntlr(side.querySelector('#proofText').textContent));

        svgElement.setAttribute("width", (Math.max(1000, size[0] + 50)).toString());
        svgElement.setAttribute("height", (size[1] + 100).toString());
      }
    });
  });

}

function addClickSwitchNotation() {
  const switchBtn = document.getElementById('switchNotationBtn');
  if (!switchBtn) return;

  switchBtn.addEventListener('click', function () {
    const expression = getProof(deductive.checkWithAntlr(side.querySelector('#proofText').textContent));

    try {
      const convertedExpr = convertExpression(formulaToString(expression,0));
      side.querySelector('#proofText').textContent = convertedExpr;
    } catch (e) {
      console.error('Conversion error:', e);
      alert('Помилка при конвертації виразу. Перевірте формат.');
    }
  });
}

// І пам'ятай — функція convertExpression має бути визначена в глобальній області
function convertExpression(expr) {
  console.log(expr);
  const hasSNotation = /s\(0\)/.test(expr);

  console.log(hasSNotation);
  if (hasSNotation) {
    function decodeSNotation(str) {
      let count = 0;
      while (str.startsWith('s(')) {
        count++;
        str = str.slice(2);
      }
      str = str.replace(/\)+$/, '');
      if (str !== '0') throw new Error('Bad format: ' + str);
      return count;
    }

    return expr.replace(/s\(.*?0\)+/g, (match) => decodeSNotation(match));
  } else {
    function encodeSNotation(num) {
      if (num === 0) return '0';
      return 's('.repeat(num) + '0' + ')'.repeat(num);
    }

    return expr.replace(/\d+/g, (match) => encodeSNotation(Number(match)));
  }
}

