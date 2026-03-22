import {CharStreams, CommonTokenStream, ParseTreeWalker} from 'antlr4';
import GrammarLexer from '../../../my_antlr/GrammarLexer.js';
import GrammarParser from '../../../my_antlr/GrammarParser.js';
import MyGrammarListener from '../../../my_antlr/MyGrammarListener.js';
import * as editorMonaco from '../../ui/monacoEditor.js'
import * as deductive from '../../core/deductiveEngine.js';
import {checkWithAntlr, convertToLogicalExpression, getProof} from '../../core/deductiveEngine.js';
import * as controlState from '../../state/stateManager.js';
import {t} from '../../core/i18n.js';
import {addNextLastButtonClickGentzen} from '../../state/stateManager.js';
import {checkRule, shakeElement, typeProof} from "../../index.js";
import {createTreeD3} from "../../ui/tree.js";
import {latexGentzen} from "../../ui/latexGen.js";
import {AXIOM_HANDLERS, GENTZEN_BUTTONS, ROBINSON_AXIOMS, ORDER_AXIOMS, ruleGentzenHandlers} from './ruleGentzenHandlers.js';
import {formulaToString} from "../../core/formatter.js";
import {addProofTextHoverEffects, initializeProofTextHover} from '../../ui/proofTextHover.js';
import {validateRobinsonAxioms} from "../../core/robinsonAxiomValidator.js";
import {parseProofFromLastSide} from "./rulesGentzen";
import { getActiveAxioms, logicSettings, isVL, isIntuitionistic } from '../../state/logicSettings';
import {showToast} from "../../ui/notifications";

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

// Global object to track help button toggle state for each tab independently
let helpButtonToggleState = {
  axioms: false,
  allRules: false
};

// Global object to track gamma context toggle state for each gamma element
let gammaToggleState = new Map();

// Global objects for tracking gamma context indexing
let gammaContextHistory = new Map(); // Maps context hash to index
let gammaCurrentIndex = 0; // Current index counter

export let state = 0;

let nameRule;

let oldUserInput = "";

/**
 * Создает хэш для массива гипотез для отслеживания изменений контекста
 * @param {Array<string>} hypotheses - Массив гипотез
 * @returns {string} - Хэш контекста
 */
function createContextHash(hypotheses) {
  if (!hypotheses || hypotheses.length === 0) {
    return 'empty';
  }
  // Сортируем для консистентного хэширования
  const sorted = [...hypotheses].sort();
  return sorted.join('|');
}

/**
 * Получает индекс для данного контекста, создавая новый если нужно
 * @param {Array<string>} hypotheses - Массив гипотез
 * @returns {number} - Индекс контекста
 */
function getContextIndex(hypotheses) {
  const hash = createContextHash(hypotheses);

  if (gammaContextHistory.has(hash)) {
    return gammaContextHistory.get(hash);
  } else {
    // If the hash is 'empty', assign it to the history but don't increment the visible index counter
    if (hash === 'empty') {
      gammaContextHistory.set(hash, 0); // Give it 0 internally, but it won't be displayed anyway
      return 0;
    }

    // For non-empty hypotheses, get the current index and then increment
    const newIndex = gammaCurrentIndex++;
    gammaContextHistory.set(hash, newIndex);
    return newIndex;
  }
}

/**
 * Сбрасывает состояние индексации контекстов (для новых доказательств)
 */
function resetContextIndexing() {
  gammaContextHistory.clear();
  gammaCurrentIndex = 0;
}

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
  if (window.updateGentzenParenthesesButtons) {
    window.updateGentzenParenthesesButtons();
  }
}

// Сетер для lastSide
export function setLastSide(newLastSide) {
  lastSide = newLastSide;
}

export function setNameRule(newNameRule) {
  nameRule = newNameRule;
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

  // Ігнорувати клік по вже закритому елементу, контейнеру гілок або самому полю доказу
  if (clickedElement.className === "previous" ||
      clickedElement.className.includes("proof-element_level-") ||
      clickedElement.classList.contains('premises-container') ||
      clickedElement.id === "proof") return;

  // Обробка кліку на gamma-context елемент
  if (clickedElement.classList.contains('gamma-context')) {
    console.log('Gamma context clicked!', clickedElement);
    toggleGammaContext(clickedElement);
    return; // Виходимо, щоб не виконувати звичайну обробку кліку
  }

  let potentialSide = null;
  if (clickedElement.tagName === 'DIV') {
    // Елемент є валідним, якщо він має клас proof-content або містить його безпосередньо
    if (clickedElement.classList.contains('proof-content') || clickedElement.querySelector(':scope > .proof-content')) {
      potentialSide = clickedElement;
    } else {
      return;
    }
  } else if (clickedElement.tagName === 'LABEL') {
    potentialSide = clickedElement.parentNode;
  } else {
    return;
  }

  // Якщо клікнули по вже активному елементу - знімаємо виділення
  if (side && potentialSide === side) {
      clearLabelHighlights();
      setSide(null);
      disableAllButtons();

      const sbRules = document.getElementById('sb-rules');
      if (sbRules) sbRules.click();

      return;
  }

  clearLabelHighlights();

  if (clickedElement.tagName === 'DIV') {
    setSide(clickedElement);
    try {
      side.querySelector('label').style.background = 'var(--col-highlight-main)';
    } catch (error) {
      console.error('Monaco editor clicked');
    }
  } else if (clickedElement.tagName === 'LABEL') {
    setSide(clickedElement.parentNode);
    clickedElement.style.background = 'var(--col-highlight-main)';
  }

  if (window.updateGentzenParenthesesButtons) window.updateGentzenParenthesesButtons();

  // Якщо немає попереднього перегляду — обробити клік
  if (document.getElementsByClassName("preview").length === 0) {
    setTimeout(handleClick, 100);
  }
});

/**
 * Скидає підсвічування всіх label-елементів у дереві доказу.
 */
export function clearLabelHighlights() {
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

      // Determine active tab and update accordingly
      if (document.getElementById('tab3').checked) {
          // Axioms Tab
          if (helpButtonToggleState.axioms) {
               showFilteredAxioms();
          } else {
              const formattedAxioms = getActiveAxioms(ROBINSON_AXIOMS, ORDER_AXIOMS);
              generateButtons(formattedAxioms.length, formattedAxioms);
          }
      } else if (document.getElementById('tab4').checked) {
          // Tree View Tab
          const buttonContainer = document.getElementById('button-container');
          buttonContainer.innerHTML = '';
          buttonContainer.style.height = "100%";
          buttonContainer.parentElement.style.height = "100%";

          let svgContainer = document.createElement("div");
          svgContainer.style.width = "100%";
          svgContainer.style.height = "100%";
          svgContainer.style.overflow = "hidden";
          svgContainer.style.position = "relative";
          svgContainer.style.display = "block";

          let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svgElement.style.width = "100%";
          svgElement.style.height = "100%";

          svgContainer.appendChild(svgElement);
          buttonContainer.appendChild(svgContainer);

          createTreeD3(parsed);
      } else {
          // Default to Rules (Tab 1 or others)
          processExpression(parsed, helpButtonToggleState.allRules ? 0 : 1);
      }
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

  // Ініціалізуємо hover ефекти для proofText елементів
  initializeProofTextHover();

  try {
    // Сбрасываем состояние индексации для нового доказательства
    resetContextIndexing();

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
      reportAmbiguity: function (recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
        // console.warn('Grammar ambiguity detected in Gentzen proof parsing');
      },
      reportAttemptingFullContext: function (recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
        // console.warn('Parser attempting full context in Gentzen proof parsing');
      },
      reportContextSensitivity: function (recognizer, dfa, startIndex, stopIndex, prediction, configs) {
        // console.warn('Context sensitivity detected in Gentzen proof parsing');
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
    setSide(document.querySelector('.proof-element_level-0').children[0]);
    oldUserInput = side.querySelector('#proofText').textContent;

    setTimeout(() => {
        if (side) {
            const label = side.querySelector('label');
            if (label) {
                label.style.background = 'var(--col-highlight-main)';
            }
        }
    }, 0);

    // Зберігаємо стан і показуємо кнопки
    controlState.saveState();
    processExpression(parsedProof, 1);

    document.getElementById('undo_redo').style.display = 'flex';
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

  // Logic for Ax rule recommendation
  const axHandler = ruleGentzenHandlers["Ax"];
  const shouldRecommendAx = side && axHandler && axHandler.condition(expr, side);

  const getButtonsWithAx = (buttons) => {
    if (shouldRecommendAx) {
      // Add Ax to the beginning if not already there
      if (!buttons.includes(GENTZEN_BUTTONS[0])) {
        return [GENTZEN_BUTTONS[0], ...buttons];
      }
    } else {
      // Remove Ax if it's there
      return buttons.filter(btn => btn !== GENTZEN_BUTTONS[0]);
    }
    return buttons;
  };

  switch (expr.type) {
    case "variable":
    case "constant":
    case "number":
    case "atom":
      const value = expr.value || expr.name;
      let atomButtons;
      if (value === '⊤') {
        atomButtons = [
          GENTZEN_BUTTONS[3]
        ];
      } else if (value === '⊥') {
        atomButtons = [
          GENTZEN_BUTTONS[5]
        ];
      } else {
        atomButtons = [
          GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
          GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
          GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
          GENTZEN_BUTTONS[16], GENTZEN_BUTTONS[17]
        ];
      }
      generateButtons(atomButtons.length, getButtonsWithAx(atomButtons));
      break;

    case "implication":
      const implButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
        GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[12],
        GENTZEN_BUTTONS[13], GENTZEN_BUTTONS[16],
        GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18],
        GENTZEN_BUTTONS[19]
      ];
      generateButtons(implButtons.length, getButtonsWithAx(implButtons));
      break;

    case "conjunction":
      const conjButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[6], GENTZEN_BUTTONS[7],
        GENTZEN_BUTTONS[8], GENTZEN_BUTTONS[11],
        GENTZEN_BUTTONS[13], GENTZEN_BUTTONS[16],
        GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18],
        GENTZEN_BUTTONS[19]
      ];
      generateButtons(conjButtons.length, getButtonsWithAx(conjButtons));
      break;

    case "disjunction":
      const disjButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
        GENTZEN_BUTTONS[9], GENTZEN_BUTTONS[10],
        GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
        GENTZEN_BUTTONS[16], GENTZEN_BUTTONS[17],
        GENTZEN_BUTTONS[18], GENTZEN_BUTTONS[19]
      ];
      generateButtons(disjButtons.length, getButtonsWithAx(disjButtons));
      break;

    case "negation":
      const negButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[4], GENTZEN_BUTTONS[7],
        GENTZEN_BUTTONS[8], GENTZEN_BUTTONS[11],
        GENTZEN_BUTTONS[13], GENTZEN_BUTTONS[16],
        GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18],
        GENTZEN_BUTTONS[19]
      ];
      generateButtons(negButtons.length, getButtonsWithAx(negButtons));
      break;

    case "quantifier":
      if (expr.quantifier === '∃') {
        const exButtons = [
          GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
          GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
          GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
          GENTZEN_BUTTONS[14], GENTZEN_BUTTONS[16],
          GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18],
          GENTZEN_BUTTONS[19]
        ];
        generateButtons(exButtons.length, getButtonsWithAx(exButtons));
      } else if (expr.quantifier === '∀') {
        const allButtons = [
          GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
          GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
          GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
          GENTZEN_BUTTONS[15], GENTZEN_BUTTONS[16],
          GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18],
          GENTZEN_BUTTONS[19], GENTZEN_BUTTONS[21]
        ];
        generateButtons(allButtons.length, getButtonsWithAx(allButtons));
      }
      break;

    case "forall":
      const forallButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
        GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
        GENTZEN_BUTTONS[15], GENTZEN_BUTTONS[16],
        GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18],
        GENTZEN_BUTTONS[19], GENTZEN_BUTTONS[21]
      ];
      generateButtons(forallButtons.length, getButtonsWithAx(forallButtons));
      break;

    case "exists":
      const existsButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
        GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
        GENTZEN_BUTTONS[14], GENTZEN_BUTTONS[16],
        GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18],
        GENTZEN_BUTTONS[19]
      ];
      generateButtons(existsButtons.length, getButtonsWithAx(existsButtons));
      break;

    case "predicate":
      const predButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
        GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
        GENTZEN_BUTTONS[16], GENTZEN_BUTTONS[17],
        GENTZEN_BUTTONS[18], GENTZEN_BUTTONS[19]
      ];
      generateButtons(predButtons.length, getButtonsWithAx(predButtons));
      break;

    case "relation":
      const relButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
        GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
        GENTZEN_BUTTONS[16], GENTZEN_BUTTONS[17]
      ];
      generateButtons(relButtons.length, getButtonsWithAx(relButtons));
      break;

    case "equality":
      const eqButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
        GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
        GENTZEN_BUTTONS[16], GENTZEN_BUTTONS[17],
        GENTZEN_BUTTONS[18], GENTZEN_BUTTONS[19]
      ];
      if (!expr.operator || expr.operator === '=' || expr.operator === 'EQUAL') {
        eqButtons.push(GENTZEN_BUTTONS[20]);
      }
      generateButtons(eqButtons.length, getButtonsWithAx(eqButtons));
      break;

    case "addition":
    case "multiplication":
    case "successor":
    case "function":
      // Arithmetic and function expressions
      const arithButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
        GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13],
        GENTZEN_BUTTONS[16], GENTZEN_BUTTONS[17],
        GENTZEN_BUTTONS[18], GENTZEN_BUTTONS[19]
      ];
      generateButtons(arithButtons.length, getButtonsWithAx(arithButtons));
      break;

    case "sequent":
      // Handle sequent notation
      const sequentButtons = [
        GENTZEN_BUTTONS[1], GENTZEN_BUTTONS[2],
        GENTZEN_BUTTONS[7], GENTZEN_BUTTONS[8],
        GENTZEN_BUTTONS[11], GENTZEN_BUTTONS[13]
      ];
      generateButtons(sequentButtons.length, getButtonsWithAx(sequentButtons));
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

  // Reset heights and styles that might be left over from Tree tab or Axioms tab
  buttonContainer.style.height = '';
  if (buttonContainer.parentElement) {
    buttonContainer.parentElement.style.height = '';
  }

  // Set position relative for all tabs (needed for help button)
  buttonContainer.style.position = 'relative';

  // Check if this is for axioms - more specific detection
  // Use tab3.checked but also consider buttonTexts to avoid race conditions during tab switching
  const tab3 = document.getElementById('tab3');
  const tab1 = document.getElementById('tab1');

  // If we're currently switching to tab1 (Rules), we should not treat it as axioms
  // even if tab3.checked is still true due to race condition.
  // We check if buttonTexts contains typical rules or if tab1 is being selected.
  let isAxiomsTab = (tab3 && tab3.checked) ||
                      (buttonTexts.length > 0 && buttonTexts.some(t => t.includes('∀x') && (t.includes('s(x)') || t.includes('<'))));

  // Refined check: if we have rules (which are many), it's probably not the axioms tab (which has few)
  // Or more simply, if we are calling this from a rule-generating context.
  if (buttonTexts.length > 10 && buttonTexts === GENTZEN_BUTTONS) {
      isAxiomsTab = false;
  }

  if (isAxiomsTab) {
    // Special styling for axioms - 2 columns layout
    buttonContainer.style.display = 'grid';
    buttonContainer.style.gridTemplateColumns = '1fr 1fr';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.padding = '20px';
    buttonContainer.style.justifyItems = 'center';
  } else {
    // Reset to default styling for other tabs
    // Using explicit values that match index.html defaults to ensure clean state
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'row';
    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.gridTemplateColumns = '';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.padding = '';
    buttonContainer.style.justifyItems = '';
  }


  if (!isAxiomsTab && side) {
    const currentExpr = deductive.getProof(
      deductive.checkWithAntlr(side.querySelector('#proofText').textContent)
    );

    // Аналізуємо контекст з gamma-context span для поточного елемента
    let isInLocalHypotheses = false;

    try {
      // Шукаємо gamma-context span в поточному елементі
      const gammaSpan = side.querySelector('.gamma-context');

      if (gammaSpan) {
        const hypothesesData = gammaSpan.getAttribute('data-hypotheses');

        if (hypothesesData) {
          const hypotheses = JSON.parse(hypothesesData);

          // Використовуємо compareExpressions для порівняння
          isInLocalHypotheses = hypotheses.some(hypText => {
            try {
              const hypParsed = deductive.getProof(deductive.checkWithAntlr(hypText));
              return deductive.compareExpressions(hypParsed, currentExpr);
            } catch (error) {
              console.warn('Error parsing hypothesis:', hypText, error);
              return false;
            }
          });
        } else {
          console.log(`⚠️  No data-hypotheses found in gamma-context span`);
        }
      } else {
        console.log(`⚠️  No gamma-context span found in current element`);
      }
    } catch (error) {
      console.warn('Error reading gamma-context data:', error);
    }
  }

  let showedRobinsonHeader = false;
  let showedOrderHeader = false;

  for (let i = 0; i < buttonCount; i++) {
    const text = buttonTexts[i];

    if (isIntuitionistic()) {
        if (text === GENTZEN_BUTTONS[2]) {
            continue; // Hide RAA (\bot E2) in Intuitionistic Logic
        }
    }

    // Header for Robinson Arithmetic - detect by any Robinson axiom if not shown yet
    const isRobinsonAxiom = ROBINSON_AXIOMS.some(ax => text.includes(ax));
    if (isAxiomsTab && isRobinsonAxiom && !showedRobinsonHeader) {
      const header = document.createElement('h4');
      header.textContent = 'Robinson Arithmetic Axioms';
      header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 0 0 14px 0; color: var(--col-text-main); font-family: "Times New Roman", serif;';
      buttonContainer.appendChild(header);
      showedRobinsonHeader = true;
    }

    // Header for Linear Order - detect by any Order axiom if not shown yet
    const isOrderAxiom = ORDER_AXIOMS.some(ax => text.includes(ax));
    if (isAxiomsTab && isOrderAxiom && !showedOrderHeader) {
      const header = document.createElement('h4');
      header.textContent = 'Linear Order Axioms';
      header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 20px 0 14px 0; color: var(--col-text-main); font-family: "Times New Roman", serif;';
      if (!showedRobinsonHeader) header.style.marginTop = '0';
      buttonContainer.appendChild(header);
      showedOrderHeader = true;
    }

    const button = createButton(text, () => buttonClicked(text));
    button.setAttribute('data-original-text', text); // Set for shaking logic

    // Tag quantifier and equality rules
    if (text.includes('\\forall') || text.includes('\\exists') || text.includes('a = b')) {
      button.classList.add('quantifier-rule');
    }

    if (isAxiomsTab) {
      // Override flex styles for axiom buttons to work properly with grid
      button.style.flex = 'none';
      button.style.width = '100%';
      button.style.maxWidth = 'none';
      button.style.minHeight = '60px';
    }

    buttonContainer.appendChild(button);
  }

  MathJax.typesetPromise().catch(err => console.warn('MathJax помилка:', err));
}

// Exported function for Sidebar "Smart Mode"
export function toggleSmartMode() {
  // Toggle state globally for both modes
  const newState = !helpButtonToggleState.allRules; // Using allRules as master state
  helpButtonToggleState.allRules = newState;
  helpButtonToggleState.axioms = newState;

  if (!side) {
    disableAllButtons();
    return newState;
  }

  const isAxiomsTab = document.getElementById('tab3').checked;

  if (isAxiomsTab) {
    if (newState) {
      // Smart Mode ON: Show filtered
      showFilteredAxioms();
    } else {
      // Smart Mode OFF: Show all
      const formattedAxioms = getActiveAxioms(ROBINSON_AXIOMS, ORDER_AXIOMS);
      generateButtons(formattedAxioms.length, formattedAxioms);
    }
  } else {
    // Rules tab
    // Get content from active side
    let content = side.querySelector('#proofText').textContent;
    processExpression(checkWithAntlr(content), newState ? 0 : 1);
  }

  return newState;
}

// Function to show only axioms that match the current formula
function showFilteredAxioms() {
  if (!side) return;

  try {
    console.log(side.querySelector('#proofText').textContent);
    const currentFormula = checkWithAntlr(side.querySelector('#proofText').textContent);
    console.log(currentFormula);
    const matchingAxioms = [];

    // Check each axiom individually using the main validator
    for (let i = 1; i <= 7; i++) {
      const axiomFormula = ROBINSON_AXIOMS[i - 1];
      try {
        const parsedAxiom = checkWithAntlr(axiomFormula);
        // Use validateRobinsonAxioms to check if current formula matches this specific axiom
        const validationResult = validateRobinsonAxioms(currentFormula);
        if (validationResult.isAxiom && validationResult.axiomNumber === i) {
          matchingAxioms.push(`${i}. ${axiomFormula}`);
        }
      } catch (error) {
        console.warn(`Error checking axiom ${i}:`, error);
      }
    }

    const buttonContainer = document.getElementById('button-container');

    // Save helpButton before clearing container
    const existingHelpButton = buttonContainer.querySelector('button[style*="position: absolute"]');

    if (matchingAxioms.length > 0) {
      console.log(`Found ${matchingAxioms.length} matching axioms:`, matchingAxioms);

      // Clear container but preserve styling
      buttonContainer.innerHTML = '';

      // Reset heights that might be left over from Tree tab
      buttonContainer.style.height = '';
      if (buttonContainer.parentElement) {
        buttonContainer.parentElement.style.height = '';
      }

      // Set axioms styling - adjust columns based on number of axioms
      buttonContainer.style.display = 'grid';
      buttonContainer.style.gridTemplateColumns = matchingAxioms.length === 1 ? '1fr' : '1fr 1fr';
      buttonContainer.style.gap = '8px';
      buttonContainer.style.padding = '20px';
      buttonContainer.style.justifyItems = 'center';
      buttonContainer.style.position = 'relative';

      // Add header
      const header = document.createElement('h4');
      header.textContent = 'Robinson Arithmetic Axioms (Recommended)';
      header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 0 0 14px 0; color: var(--col-text-main); font-family: "Times New Roman", serif;';
      buttonContainer.appendChild(header);

      // Add matching axiom buttons
      matchingAxioms.forEach(axiomText => {
        const button = createButton(axiomText, () => buttonClicked(axiomText));
        button.style.flex = 'none';
        button.style.width = '100%';
        button.style.maxWidth = 'none';
        button.style.minHeight = '60px';
        buttonContainer.appendChild(button);
      });

    } else {
      console.log('No matching axioms found, showing message');

      // Clear container but preserve styling
      buttonContainer.innerHTML = '';

      // Reset heights that might be left over from Tree tab
      buttonContainer.style.height = '';
      if (buttonContainer.parentElement) {
        buttonContainer.parentElement.style.height = '';
      }

      // Set axioms styling
      buttonContainer.style.display = 'grid';
      buttonContainer.style.gridTemplateColumns = '1fr';
      buttonContainer.style.gap = '8px';
      buttonContainer.style.padding = '20px';
      buttonContainer.style.justifyItems = 'center';
      buttonContainer.style.position = 'relative';

      const message = document.createElement('div');
      message.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        margin: 20px 0;
        color: #666;
        font-family: "Times New Roman", serif;
        font-size: 18px;
        padding: 20px;
        background: rgba(0, 97, 161, 0.05);
        border-radius: 8px;
        border: 1px dashed rgba(0, 97, 161, 0.3);
      `;
      message.textContent = 'No axioms match the current formula';
      buttonContainer.appendChild(message);
    }

    // Re-add helpButton if it existed
    if (existingHelpButton) {
      buttonContainer.appendChild(existingHelpButton);
    }

    // Re-render MathJax
    MathJax.typesetPromise().catch(err => console.warn('MathJax помилка:', err));

  } catch (error) {
    console.error('Error in showFilteredAxioms:', error);
    // Fallback to showing all axioms using generateButtons
    const formattedAxioms = ROBINSON_AXIOMS.map((axiom, index) =>
      `${index + 1}. ${axiom}`
    );
    generateButtons(ROBINSON_AXIOMS.length, formattedAxioms);
  }
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
  button.setAttribute('data-original-text', text);
  button.addEventListener('click', clickHandler);
  return button;
}


/**
 * Закриває гілку дерева доказу, очищаючи заміни та оновлюючи інтерфейс.
 * @param {HTMLElement} container - DOM-елемент гілку.
 */
function closeSide(container) {
  // Normalize to the main proof element (outer div) if we passed the inner proof-content
  if (container.classList.contains('proof-content')) {
    container = container.parentNode;
  }

  disableAllButtons();
  setSide(null);
  clearLabelHighlights();

  // 1. Шукаємо елемент gamma
  const existingElement = container.querySelector('.gamma-context');
  const proofText = container.querySelector('#proofText');

  if (!existingElement || !proofText) {
    console.warn("Could not find gamma-context or proofText in element to close", container);
    return;
  }

  let rawText = proofText.textContent.trim() || "";
  // Якщо ми закриваємо гілку, яка вже була закрита в системі (наприклад, аксіому),
  // то вона вже має квадратні дужки. Видаляємо їх для коректного форматування.
  if (rawText.startsWith('[') && rawText.endsWith(']')) {
    rawText = rawText.substring(1, rawText.length - 1);
  }

  // Позначаємо гілку як закриту
  container.classList.add('closed');

  let labelText = `[${rawText}]`;
  
  // 4. Оновлюємо тільки текстовий контент та додаємо класи
  proofText.textContent = labelText;
  proofText.classList.add('previous');
  
  const proofContent = container.querySelector('.proof-content');
  if (proofContent) {
    proofContent.classList.add('previous');
  }

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
  // Handle axiom clicks specially - check if it's a numbered axiom
  const axiomMatch = buttonText.match(/^(\d+)\.\s(.+)$/);
  // const axiomMatch = buttonText.match((text, index) => text.startsWith(`${index + 1}. `));
  if (axiomMatch) {
    const axiomNumber = parseInt(axiomMatch[1]);
    const axiomHandler = AXIOM_HANDLERS[axiomNumber];

    if (axiomHandler) {
      // Get current formula and find the corresponding button
      const currentFormula = getProof(checkWithAntlr(side.querySelector('#proofText').textContent));

      // Find the button that was clicked (axioms are at the beginning of allButtons array)
      const axiomButton = Array.from(allButtons).find(btn =>
        btn.textContent.includes(`${axiomNumber}.`) ||
        btn.innerHTML.includes(`${axiomNumber}.`)
      );

      const result = axiomHandler.action(currentFormula, axiomButton);

      // Створюємо дерево для аксіом, якщо вони вимагають цього і успішно застосувалися
      if (axiomHandler.requiresTree && currentLevel !== -1 && result) {
        const newConclusion = deductionContext.conclusions[size + 1];
        // Check if a new conclusion was actually added
        if (newConclusion) {
          nameRule = "Ax" + axiomNumber;

          createProofTree(newConclusion, side);

          // Відразу закриваємо гілку для аксіоми
          const axiomElement = document.querySelector(`.proof-element_level-${newConclusion.level}`);
          if (axiomElement) {
            // Шукаємо контейнер саме формули (який містить label#proofText),
            // а не весь блок виведення (inferenceRow)
            const proofDiv = axiomElement.querySelector('.proof-content')?.parentElement;
            if (proofDiv) {
              closeSide(proofDiv);
            }
          }

          controlState.saveState();

          // Persist Smart Mode state
          // helpButtonToggleState.axioms = false;
          // helpButtonToggleState.allRules = false;
        } else {
          console.log("❌ No new conclusion was added for axiom");
        }
      } else if (!result) {
        console.log(`❌ Axiom ${axiomNumber} validation failed, no tree created`);
      } else if (!axiomHandler.requiresTree) {
        console.log(`ℹ️ Axiom ${axiomNumber} doesn't require tree creation`);
      } else if (currentLevel === -1) {
        console.log("❌ Current level is -1, skipping axiom tree creation");
      }
    } else {
      // Fallback for unknown axioms
      const axiomText = axiomMatch[2];
      console.log(`⚠️  Unknown Axiom ${axiomNumber}: ${axiomText}`);
    }
    return;
  }

  let expr = getProof(checkWithAntlr(lastSide.querySelector('#proofText').textContent));
  const handler = ruleGentzenHandlers[ruleName];

  if (!handler) {
    console.warn(`Правило "${ruleName}" не знайдено.`);
    return;
  }

  // Перевірка умови застосування правила
  if (!handler.condition(expr, lastSide)) {
    const targetButton = Array.from(allButtons).find(btn =>
      btn.getAttribute('data-original-text') === buttonText
    );

    if (targetButton) {
      shakeButton(targetButton);
      const explanation = handler.explanation || t('alert-not-applicable');
      showToast(explanation);
    } else {
      console.warn("Could not find button for rule:", ruleName);
    }
    return;
  }

  // Виконання дії з обробкою скасування модального вікна
  try {
    let result = handler.returnsResult ? await handler.action() : await handler.action();

    // Створення дерева доказу, якщо потрібно
    if (handler.requiresTree && currentLevel !== -1) {
      console.log(deductionContext.conclusions);
      const newConclusion = deductionContext.conclusions[size + 1];
      console.log(JSON.stringify(newConclusion, null, 2));

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

  // Очистка старого виділення
  clearLabelHighlights();

  // Спробуємо знайти новостворений елемент для виділення (ліва гілка)
  let nextToSelect = null;
  const newSize = deductionContext.conclusions.length - 1;
  const newConclusion = deductionContext.conclusions[newSize];
  
  if (newConclusion) {
      const newLevelDiv = document.querySelector(`.proof-element_level-${newConclusion.level}`);
      if (newLevelDiv) {
          // Шукаємо перший елемент proof-content в новому рівні
          const firstNewBranch = newLevelDiv.querySelector('.premises-container > div') || 
                                newLevelDiv.querySelector(':scope > div');
          if (firstNewBranch && !firstNewBranch.classList.contains('closed') && !firstNewBranch.classList.contains('previous')) {
              nextToSelect = firstNewBranch;
          }
      }
  }

  if (nextToSelect) {
      setSide(nextToSelect);
      // Підсвічуємо новий елемент
      const label = nextToSelect.querySelector('label');
      if (label) {
          label.style.background = 'var(--col-highlight-main)';
      }
      
      // Оновлюємо кнопки для нового виділення (беремо першу формулу, якщо це масив)
      const exprToShow = Array.isArray(newConclusion.proof) ? newConclusion.proof[0] : newConclusion.proof;
      processExpression(exprToShow, helpButtonToggleState.allRules ? 0 : 1);
  } else {
      setSide(null);
      disableAllButtons();
  }
}

export function disableAllButtons() {
    // Determine which tab is active to know what to show
    const isAxiomsTab = document.getElementById('tab3') && document.getElementById('tab3').checked;
    const isTreeTab = document.getElementById('tab4') && document.getElementById('tab4').checked;

    // In Fitch mode (typeProof === 1), axioms should always be available
    const isFitch = (typeProof === 1);

    if (isTreeTab) {
        const buttonContainer = document.getElementById('button-container');
        buttonContainer.innerHTML = '';

        // Reset heights that might be left over from Tree tab
        buttonContainer.style.height = '';
        if (buttonContainer.parentElement) {
            buttonContainer.parentElement.style.height = '';
        }

        if (side) {
            // Reset styles for tree view
            buttonContainer.style.display = '';
            buttonContainer.style.gridTemplateColumns = '';
            buttonContainer.style.gap = '';
            buttonContainer.style.padding = '';
            buttonContainer.style.height = "100%";
            buttonContainer.parentElement.style.height = "100%";

            let svgContainer = document.createElement("div");
            svgContainer.style.width = "100%";
            svgContainer.style.height = "100%";
            svgContainer.style.overflow = "hidden";
            svgContainer.style.position = "relative";
            svgContainer.style.display = "block";

            let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgElement.style.width = "100%";
            svgElement.style.height = "100%";

            svgContainer.appendChild(svgElement);
            buttonContainer.appendChild(svgContainer);

             try {
                const parsed = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);
                createTreeD3(parsed);
             } catch (e) {
                 console.warn("Error rendering tree in disabled state", e);
             }
        } else {
             // Show message when no side selected
             buttonContainer.style.display = 'grid';
             buttonContainer.style.gridTemplateColumns = '1fr';
             buttonContainer.style.gap = '8px';
             buttonContainer.style.padding = '20px';
             buttonContainer.style.justifyItems = 'center';

             const message = document.createElement('div');
             message.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                margin: 20px 0;
                color: #666;
                font-family: "Times New Roman", serif;
                font-size: 18px;
                padding: 20px;
                background: rgba(0, 97, 161, 0.05);
                border-radius: 8px;
                border: 1px dashed rgba(0, 97, 161, 0.3);
             `;
             message.textContent = 'Select a branch to see the tree structure';
             buttonContainer.appendChild(message);
        }
        return; // Exit early for tree tab
    }

    // Regenerate full lists so user sees all options (disabled) instead of just filtered ones
    if (isAxiomsTab) {
         const formattedAxioms = getActiveAxioms(ROBINSON_AXIOMS, ORDER_AXIOMS);
         generateButtons(formattedAxioms.length, formattedAxioms);

         // If in Fitch mode, we don't disable the axiom buttons
         if (isFitch) return;
    } else {
         // Default to rules (Tab 1) logic
         generateButtons(GENTZEN_BUTTONS.length, GENTZEN_BUTTONS);
    }

    const buttons = document.querySelectorAll('#button-container button');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.title = t('tooltip-select-branch');
        btn.setAttribute('data-i18n-title', 'tooltip-select-branch');
    });
}

export function shakeButton(button) {
  let element = button;
  const originalBg = element.style.backgroundColor;
  const originalTransition = element.style.transition;

  element.classList.add('shake');
  element.style.transition = 'background-color 0.3s ease';

  // Вибираємо колір залежно від теми
  const isDark = document.body.classList.contains('dark-mode');
  const errorColor = isDark ? 'rgba(248, 113, 113, 0.3)' : '#fecaca';

  element.style.setProperty('background-color', errorColor, 'important');

  setTimeout(function () {
    element.classList.remove('shake');
    if (originalBg === "") {
      element.style.removeProperty("background-color");
    } else {
      element.style.backgroundColor = originalBg;
    }

    // Restore transition after the color reverts
    setTimeout(() => {
        element.style.transition = originalTransition;
    }, 300);
  }, 500); // Повертаємо старий час (0.5 сек)
}

// Функція для створення елементу дерева доказу
function createProofElement(level) {
  const proofElement = document.createElement('div');
  proofElement.className = `proof-element_level-${level}`;
  // Set z-index equal to level so higher levels stack on top of lower ones
  proofElement.style.zIndex = level;
  return proofElement;
}

export function createProofTree(conclusions, container, hyp = null) {
  if (!conclusions || Object.keys(conclusions).length === 0 || !conclusions.proof) {
    return;
  }
  const levelDiv = createProofElement(conclusions.level);

  // Use a container for nodes to allow flexible layout (inference row vs direct append)
  let nodesContainer = levelDiv;

  if (conclusions.level !== 0) {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const lineColor = isDarkMode ? '#ffffff' : '#000000';

    let lvl = document.querySelector(`.proof-element_level-${conclusions.level - 1}`);
    if (lvl && lvl.childElementCount === 0) {
      lvl.style.borderTop = `2px solid ${lineColor}`;
    }

    // Create Flex Structure for Rule Name and Line (same as Sequent)
    const inferenceRow = document.createElement('div');
    inferenceRow.style.display = 'flex';
    inferenceRow.style.flexDirection = 'row';
    inferenceRow.style.alignItems = 'flex-end';
    inferenceRow.style.justifyContent = 'center';
    inferenceRow.style.gap = '0px';
    inferenceRow.style.position = 'relative';
    inferenceRow.style.marginLeft = '45px';
    inferenceRow.style.marginRight = '45px';

    const premisesGroup = document.createElement('div');
    premisesGroup.style.display = 'flex';
    premisesGroup.style.flexDirection = 'column';
    premisesGroup.style.alignItems = 'center';

    nodesContainer = document.createElement('div');
    nodesContainer.className = 'premises-container';
    nodesContainer.style.display = 'flex';
    nodesContainer.style.flexDirection = 'row';
    nodesContainer.style.gap = '80px';
    nodesContainer.style.justifyContent = 'center';
    nodesContainer.style.alignItems = 'flex-end';
    nodesContainer.style.borderBottom = `2px solid ${lineColor}`;
    nodesContainer.style.paddingBottom = '3px';
    nodesContainer.style.marginBottom = '0px';

    const ruleLabel = deductive.createLineLevel(nameRule);
    ruleLabel.style.position = 'absolute';
    ruleLabel.style.right = '-45px';
    ruleLabel.style.bottom = '-10px';
    ruleLabel.style.width = '45px';
    ruleLabel.style.textAlign = 'left';
    ruleLabel.style.whiteSpace = 'nowrap';

    premisesGroup.appendChild(nodesContainer);
    inferenceRow.appendChild(premisesGroup);
    inferenceRow.appendChild(ruleLabel);

    levelDiv.appendChild(inferenceRow);
  }

  // Обробка conclusions.proof як масиву, якщо це масив
  if (Array.isArray(conclusions.proof)) {
    conclusions.proof.forEach((proofElement, index) => {
      const proofDiv = document.createElement(`div`);
      //вернутись бо не працює
      const result = formulaToString(getProof(proofElement), 0);
      let text = `${deductive.convertToLogicalExpression(getProof(deductive.checkWithAntlr(result)))}`;
      //Заміна всіх s0 на s(0)
      // text = text.replace(/s0/g, 's(0)');
      text = text.replace(/s\(0\)/g, 's0');
      text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      // console.log(text);
      proofDiv.id = 'divId-' + container.id;

      // Створюємо gamma-context span з data-hypotheses
      const proofLevel = conclusions.level;
      const gammaContextSpan = createGammaContextSpan(container, proofLevel);

      proofDiv.innerHTML = `<div class="proof-content">${gammaContextSpan}<label id="proofText">${text}</label></div>`;
      proofDiv.style.alignSelf = 'flex-end';
      proofDiv.addEventListener('click', handleClick);
      // addUserHyp(conclusions, proofDiv);
      // console.log(levelDiv);

      nodesContainer.appendChild(proofDiv);

      // Додавання роздільника, якщо це не останній елемент
      if (conclusions.level === 0 && index < conclusions.proof.length - 1) {
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
        result = formulaToString(getProof(conclusions.proof), 0);
      }
      text = `${deductive.convertToLogicalExpression(deductive.checkWithAntlr(result))}`;
      // text = text.replace(/s0/g, 's(0)');
      text = text.replace(/s\(0\)/g, 's0');
      text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }


    proofDiv.id = 'divId-' + container.id;
    if (text !== " ") {
      // Створюємо gamma-context span з data-hypotheses
      const proofLevel = conclusions.level;
      let gammaContextSpan = createGammaContextSpan(container, proofLevel, currentLevel === 40);

      if (currentLevel === 40) {
          // Format as "phi ∈ Γ"
          text = `${text} ∈ `;

          // Use custom order: formula label then gamma span (which now contains only Γ)
          if (mainReplaces !== "") {
            proofDiv.innerHTML = `<div class="proof-content"><label id="proofText">${text}</label>${gammaContextSpan}</div>` +
              '<span id="repl" style="display: none;">' + mainReplaces + '</span>';
            mainReplaces = "";
          } else {
            proofDiv.innerHTML = `<div class="proof-content"><label id="proofText">${text}</label>${gammaContextSpan}</div>`;
          }
      } else {
          if (mainReplaces !== "") {
            proofDiv.innerHTML = `<div class="proof-content">${gammaContextSpan}<label id="proofText">${text}</label></div>` +
              '<span id="repl" style="display: none;">' + mainReplaces + '</span>';
            mainReplaces = "";
          } else {
            proofDiv.innerHTML = `<div class="proof-content">${gammaContextSpan}<label id="proofText">${text}</label></div>`;
          }
      }
    } else {
      if (mainReplaces !== "") {
        proofDiv.innerHTML = '<label class="previous" id="proofText">' + text + '</label>' +
          '<span id="repl" style="display: none;">' + mainReplaces + '</span>';
        mainReplaces = "";
      } else {
        proofDiv.innerHTML = '<label class="previous" id="proofText">' + text + '</label>';
      }
      proofDiv.style.paddingTop = "0px";
      proofDiv.style.height = "5px"; 
      proofDiv.style.minWidth = "80px";
      
      // Manual "lite" close for axiomatic rules to avoid green highlight and keep the line visible
      const proofText = container.querySelector('#proofText');
      if (proofText) {
          let raw = proofText.textContent.trim();
          if (!raw.startsWith('[')) {
              proofText.textContent = `[${raw}]`;
          }
          proofText.classList.add('previous');
      }
      
      const proofContent = container.querySelector('.proof-content');
      if (proofContent) {
          proofContent.classList.add('previous');
      }
      
      disableAllButtons();
      setSide(null);
      clearLabelHighlights();
    }
    proofDiv.style.fontFamily = "'Times New Roman', sans-serif";
    // addUserHyp(conclusions, proofDiv);
    nodesContainer.appendChild(proofDiv);

  }

  // Helper to get child elements from the correct container
  let childElements = nodesContainer.children;

  if (currentLevel === 2 || currentLevel === 4 || currentLevel === 12) {
    let hyp = "";

    if(currentLevel ===2 )
    {
      const pr = parseProofFromLastSide();
      const cleanFormula = deductive.getProof(pr);
      const cleanText = deductive.convertToLogicalExpression(cleanFormula);
      const complexTypes = ['implication', 'disjunction', 'conjunction', 'equality', 'addition', 'multiplication'];
      const needsParens = complexTypes.includes(cleanFormula.type);
      hyp = '¬' + (needsParens ? '(' + cleanText + ')' : cleanText);
    }
    else if(currentLevel===4)
    {
      const pr = parseProofFromLastSide();
      if (pr && pr.type === 'negation' && pr.operand) {
        hyp = deductive.convertToLogicalExpression(deductive.getProof(pr.operand));
      } else {
        hyp = lastSide.querySelector('#proofText')?.textContent.replace('¬', '');
      }
    }
    else if(currentLevel===12)
    {
      const pr = parseProofFromLastSide();
      console.log(pr);
      if (pr.left && pr.right) {
        hyp = deductive.convertToLogicalExpression(deductive.getProof(pr.left));
      } else if (pr.operands && pr.operands.length >= 2) {
        hyp = deductive.convertToLogicalExpression(deductive.getProof(pr.operands[0]));
      } else {
        console.error("Invalid implication structure:", pr);
        return;
      }
    }
    // Using index 0 instead of 1 because nameRule is no longer a sibling
    const gammaSpan1 = childElements[0].querySelector('.gamma-context');
    addHypothesesToGammaSpan(gammaSpan1, hyp);
  }

  //11 правило гіпотези
  if (conclusions.proof.length === 3 && currentLevel === 11) {
    // Indices shifted by -1 (original 2, 3 -> 1, 2)
    const gammaSpan1 = childElements[1].querySelector('.gamma-context');
    const gammaSpan12 = childElements[2].querySelector('.gamma-context');

    addHypothesesToGammaSpan(gammaSpan1, deductive.convertToLogicalExpression(conclusions.proof[0].left));
    addHypothesesToGammaSpan(gammaSpan12, deductive.convertToLogicalExpression(conclusions.proof[0].right));

    deductionContext.hypotheses.push({level: level - 1, hyp: conclusions.proof[0].left});
    deductionContext.hypotheses.push({level: level - 1, hyp: conclusions.proof[0].right});
  }

  //14 правило(запамятати заміни)
  const spansRepl = container.querySelectorAll('span#repl'); // Знаходимо всі span з id="repl"
  if (spansRepl.length > 0) {
    // const childElements = levelDiv.children; // Replaced by nodesContainer.children logic
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
    // Index shifted by -1 (original 2 -> 1)
    const gammaSpan1 = childElements[1].querySelector('.gamma-context');
    addHypothesesToGammaSpan(gammaSpan1, deductive.convertToLogicalExpression(hyp));

    // childElements[1].id = lastSide.id + 'divId-' + deductive.convertToLogicalExpression(hyp);

    deductionContext.hypotheses.push({level: level - 1, hyp: hyp});
  }

  if (currentLevel === 20) {
    // Indices shifted by -1 (original 1, 2 -> 0, 1)
    const firstChildText = childElements[0]?.querySelector('#proofText')?.textContent;
    const secondChildText = childElements[1]?.querySelector('#proofText')?.textContent;
    //
    // childElements[0].id = lastSide.id + 'divId-' + secondChildText;
    // childElements[1].id = lastSide.id + 'divId-' + firstChildText;

    const gammaSpan1 = childElements[0].querySelector('.gamma-context');
    const gammaSpan2 = childElements[1].querySelector('.gamma-context');

    addHypothesesToGammaSpan(gammaSpan1, secondChildText);
    addHypothesesToGammaSpan(gammaSpan2, firstChildText);

    deductionContext.hypotheses.push({level: level - 1, hyp: getProof(checkWithAntlr(secondChildText))});
    deductionContext.hypotheses.push({level: level - 1, hyp: getProof(checkWithAntlr(firstChildText))});
    console.log(childElements);
  }

  //21 правило (Mathematical Induction)
  if (currentLevel === 21 && hyp !== null) {
    // Index shifted by -1 (original 2 -> 1)
    // Додаємо гіпотезу індукції P(x) до правої частини (інукційний крок)
    childElements[1].id = lastSide.id + 'divId-' + convertToLogicalExpression(hyp);

    deductionContext.hypotheses.push({level: level - 1, hyp: hyp});
    console.log("Induction hypothesis added:", hyp);
  }

  if (container.id !== 'proof' && !container.classList.contains('closed')) {
    container.classList.add('previous');

    // Перевіряємо, чи має контейнер нову структуру з .proof-content
    const proofContent = container.querySelector('.proof-content');

    if (proofContent) {
      // Якщо є нова структура - додаємо previous до .proof-content
      proofContent.classList.add('previous');
      const proofText = proofContent.querySelector('#proofText');
      if (proofText) {
        proofText.classList.add('previous');
      }
    } else {
      // Якщо старої структури - знаходимо proofText безпосередньо
      const proofText = container.querySelector('#proofText');
      if (proofText) {
        proofText.classList.add('previous');
      }
    }
  }

  // Вставити на початок контейнера
  if (container.firstChild) {
    container.insertBefore(levelDiv, container.firstChild);
  } else {
    container.appendChild(levelDiv);
  }


  if (conclusions.level !== 0) {
    deductive.editPadding();
  }

  // Додаємо hover ефекти до нових proofText елементів
  addProofTextHoverEffects();

  oldUserInput = "";
}


function showAllHyp() {
  // Функція більше не використовується, оскільки hypotheses-container контейнери прибрані
  // Гіпотези тепер зберігаються і відображаються через gamma-context spans
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
  const addBtn = document.getElementById('sb-show-parens') || document.getElementById('addParentheses');
  const delBtn = document.getElementById('sb-hide-parens') || document.getElementById('deleteParentheses');
  const retBtn = document.getElementById('sb-original') || document.getElementById('returnUserInput');

  if (!addBtn || !delBtn || !retBtn) return;

  // Helper to manage button states
  function toggleButtonState(btn, enabled) {
      if (enabled) {
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          btn.classList.remove('disabled');
          btn.classList.remove('disabled-action-btn');
      } else {
          btn.style.opacity = '0.5';
          btn.style.pointerEvents = 'none';
          btn.classList.add('disabled');
          btn.classList.add('disabled-action-btn');
      }
  }

  // Initial state: ALL disabled
  [addBtn, delBtn, retBtn].forEach(btn => toggleButtonState(btn, false));

  function updateButtons(activeBtn) {
    if (!side) {
        [addBtn, delBtn, retBtn].forEach(btn => toggleButtonState(btn, false));
        return;
    }

    // Enable all first
    [addBtn, delBtn, retBtn].forEach(btn => toggleButtonState(btn, true));

    // Disable the active one if specified, otherwise default to Original (retBtn)
    if (activeBtn) {
        toggleButtonState(activeBtn, false);
    } else {
        toggleButtonState(retBtn, false);
    }
  }

  window.updateGentzenParenthesesButtons = updateButtons;

  addBtn.addEventListener('click', function (e) {
    if (e) e.preventDefault();
    if (!side) return;
    const inProof = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);
    side.querySelector('#proofText').textContent = formulaToString(inProof, 1);
    updateButtons(addBtn);
  });

  delBtn.addEventListener('click', function (e) {
    if (e) e.preventDefault();
    if (!side) return;
    const expression = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);
    side.querySelector('#proofText').textContent = formulaToString(getProof(expression), 0);
    updateButtons(delBtn);
  });

  retBtn.addEventListener('click', function (e) {
    if (e) e.preventDefault();
    if (!side) return;
    if (oldUserInput !== "") {
      side.querySelector('#proofText').textContent = oldUserInput;
      updateButtons(retBtn);
    }
  });
}

function addClickGentzenRules() {
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  tabTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const tabId = this.getAttribute('for');
      if (!side) {
        setTimeout(disableAllButtons, 0);
        return;
      }

      // Use setTimeout to ensure radio button state is updated before we check it
      setTimeout(() => {
        if (tabId === 'tab1') {
          if (typeProof === 1) {
            return;
          }
          // Preserve Smart Mode state
          processExpression(checkWithAntlr(oldUserInput), helpButtonToggleState.allRules ? 0 : 1);
        } else if (tabId === 'tab3') {
          // Axioms tab - show Robinson Arithmetic axioms and Order Axioms
          if (typeProof === 1) {
            return;
          }

          if (helpButtonToggleState.axioms) {
               showFilteredAxioms();
          } else {
              // Format axioms for generateButtons
              const formattedAxioms = getActiveAxioms(ROBINSON_AXIOMS, ORDER_AXIOMS);
              generateButtons(formattedAxioms.length, formattedAxioms);
          }
        } else if (tabId === 'tab4') {
          const buttonContainer = document.getElementById('button-container');
          buttonContainer.innerHTML = '';

          // Reset button-container styles to original state (remove grid styles from Axioms tab)
          // Set height to 100% for the SVG tree
          buttonContainer.style.display = 'block';
          buttonContainer.style.gridTemplateColumns = '';
          buttonContainer.style.gap = '';
          buttonContainer.style.padding = '';
          buttonContainer.style.justifyItems = '';
          buttonContainer.style.position = 'relative';
          buttonContainer.style.height = "100%";
          buttonContainer.parentElement.style.height = "100%";

          let svgContainer = document.createElement("div");
          svgContainer.style.width = "100%";
          svgContainer.style.height = "100%";
          svgContainer.style.overflow = "hidden";
          svgContainer.style.position = "relative";
          svgContainer.style.display = "block";

          let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svgElement.style.width = "100%";
          svgElement.style.height = "100%";

          svgContainer.appendChild(svgElement);
          buttonContainer.appendChild(svgContainer);

          const parsed = checkWithAntlr(oldUserInput);
          createTreeD3(parsed);
        }
      }, 0);
    });
  });
}

function addClickSwitchNotation() {
  const switchBtn = document.getElementById('switchNotationBtn');
  if (!switchBtn) return;

  switchBtn.addEventListener('click', function () {
    const expression = getProof(deductive.checkWithAntlr(side.querySelector('#proofText').textContent));

    try {
      const convertedExpr = convertExpression(formulaToString(expression, 0));
      side.querySelector('#proofText').textContent = convertedExpr;
    } catch (e) {
      console.error('Conversion error:', e);
      showToast(t('alert-error-conversion'));
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

/**
 * Генерує унікальний ідентифікатор для гама-елемента на основі його позиції в DOM
 * @param {HTMLElement} gammaElement - Гама-елемент
 * @returns {string} - Унікальний ідентифікатор
 */
function getGammaId(gammaElement) {
  // Знаходимо контейнер доказу, до якого належить цей гама-елемент
  let proofDiv = gammaElement.closest('[id*="divId-"]');
  if (!proofDiv) {
    // Якщо не знайшли за divId, шукаємо по класу proof-element
    proofDiv = gammaElement.closest('[class*="proof-element_level-"]');
  }

  if (!proofDiv) return 'gamma-unknown';

  // Використовуємо id контейнера як базу для ідентифікатора
  const baseId = proofDiv.id || proofDiv.className;
  const position = Array.from(proofDiv.parentNode?.children || []).indexOf(proofDiv);

  return `gamma-${baseId}-${position}`;
}

/**
 * Витягує номер рівня з класу елемента або шукає найближчий батьківський елемент з рівнем
 * @param {HTMLElement} element - Елемент дерева доказу
 * @returns {number} - Номер рівня або -1 якщо не знайдено
 */
function extractLevelFromElement(element) {
  if (!element) {
    return -1;
  }

  // Спочатку перевіряємо поточний елемент
  if (element.className) {
    const match = element.className.match(/proof-element_level-(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  // Якщо не знайдено на поточному елементі, шукаємо у батьківських елементах
  let current = element.parentNode;
  while (current && current.id !== 'proof') {
    if (current.className) {
      const match = current.className.match(/proof-element_level-(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    current = current.parentNode;
  }

  return -1;
}

/**
 * Отримує локальні гіпотези для конкретного елемента дерева доказу
 * Враховує ієрархію та локальність гіпотез з правильною областю видимості на рівнях
 * @param {HTMLElement} element - Елемент дерева доказу
 * @returns {Array<string>} - Масив рядків локальних гіпотез
 */
function getLocalHypothesesForElement(element) {
  const localHypotheses = [];

  try {
    // Визначаємо рівень поточного елемента
    const currentLevel = extractLevelFromElement(element);

    console.log('Current element level:', currentLevel);
    console.log('Element details:', {
      id: element.id,
      className: element.className,
      tagName: element.tagName
    });

    // Якщо не вдалося визначити рівень, використовуємо максимальний рівень як fallback
    const effectiveLevel = currentLevel !== -1 ? currentLevel : 999;

    // Знаходимо всі батьківські елементи до кореня дерева доказу
    const ancestors = [];
    let current = element;

    while (current && current.id !== 'proof') {
      // Додаємо елемент до списку предків, якщо він має id з гіпотезами
      if (current.id && current.id.includes('divId-')) {
        ancestors.unshift(current); // додаємо на початок, щоб мати правильний порядок ієрархії
      }
      current = current.parentNode;
    }

    console.log('Found ancestors:', ancestors.length);

    // Проходимо по всім предкам і збираємо гіпотези ТІЛЬКИ з тих, що на поточному рівні та вище (менші номери рівнів)
    ancestors.forEach((ancestor, index) => {
      const ancestorLevel = extractLevelFromElement(ancestor);

      // Гіпотеза доступна тільки якщо вона з рівня вище або того ж самого (менший або рівний номер рівня)
      // Це означає: рівень 0 доступний всім, рівень 1 доступний тільки 1+, рівень 2 доступний тільки 2+
      if (ancestorLevel !== -1 && ancestorLevel < effectiveLevel) {
        const ancestorHypotheses = extractHypothesesFromId(ancestor.id);

        // Для кожного дозволеного предка додаємо його гіпотези до загального списку
        ancestorHypotheses.forEach(hyp => {
          // Перевіряємо, чи ця гіпотеза ще не додана (уникаємо дублікатів)
          const hypString = JSON.stringify(hyp);
          if (!localHypotheses.some(existingHyp => JSON.stringify(existingHyp) === hypString)) {
            localHypotheses.push(hyp);
          }
        });

        console.log(`Level ${ancestorLevel} (index ${index}): Added ${ancestorHypotheses.length} hypotheses from ${ancestor.id}`);
      } else {
        console.log(`Level ${ancestorLevel} (index ${index}): Skipped - hypothesis from same or deeper level not accessible (ancestorLevel: ${ancestorLevel}, currentLevel: ${effectiveLevel})`);
      }
    });

  } catch (error) {
    console.error('Error getting local hypotheses:', error);
  }

  console.log('Total local hypotheses found:', localHypotheses.length);
  return localHypotheses;
}

/**
 * Обчислює гіпотези для елемента при створенні gamma-context span
 * Використовується для статичного зберігання в data-hypotheses атрибуті
 * @param {HTMLElement|string} elementContext - Елемент або його ID для обчислення гіпотез
 * @param {number} level - Рівень елемента в доказі
 * @returns {Array<string>} - Масив рядків гіпотез для зберігання в data-hypotheses
 */
function computeHypothesesForGammaContext(elementContext, level) {
  const hypotheses = [];

  try {
    if (level === 0 && userHypotheses && Array.isArray(userHypotheses) && userHypotheses.length > 0) {
      console.log(`Found userHypotheses for level 0:`, userHypotheses);

      // Парсимо кожну гіпотезу користувача і конвертуємо в текст
      userHypotheses.forEach(hypText => {
        if (hypText && hypText.trim().length > 0) {
          try {
            const chars = CharStreams.fromString(hypText.trim());
            const lexer = new GrammarLexer(chars);
            const tokens = new CommonTokenStream(lexer);
            const parser = new GrammarParser(tokens);
            const tree = parser.formula();

            const listener = new MyGrammarListener();
            ParseTreeWalker.DEFAULT.walk(listener, tree);

            const parsedHyp = listener.stack.pop();
            if (parsedHyp) {
              // Конвертуємо AST в текстове представлення
              const hypText = deductive.convertToLogicalExpression(parsedHyp);
              hypotheses.push(hypText);
            }
          } catch (error) {
            console.warn('Error parsing user hypothesis:', hypText, error);
          }
        }
      });
    }
    else{
      const gammaSpan = elementContext.querySelector(':scope > .gamma-context') || elementContext.querySelector('.gamma-context');
      const rawHypotheses = gammaSpan?.dataset?.hypotheses;
      return rawHypotheses ? JSON.parse(rawHypotheses) : [];
    }
  } catch (error) {
    console.error('Error computing hypotheses for gamma context:', error);
  }

  return hypotheses;
}

/**
 * Створює gamma-context span з data-hypotheses атрибутом
 * @param {HTMLElement|string} elementContext - Контекст елемента для обчислення гіпотез
 * @param {number} level - Рівень елемента в доказі
 * @param {boolean} isAxiom - Чи створюється контекст для правила Ax (без знака ⊢)
 * @returns {string} - HTML рядок для gamma-context span
 */
function createGammaContextSpan(elementContext, level, isAxiom = false) {
  try {
    // Обчислюємо гіпотези для цього контексту
    const hypotheses = computeHypothesesForGammaContext(elementContext, level);

    // Получаем индекс для этого контекста
    const contextIndex = getContextIndex(hypotheses);

    // Конвертуємо гіпотези в JSON для зберігання в data атрибуті
    const hypothesesJson = JSON.stringify(hypotheses);

    // Формируем отображение Gamma с индексом
    let gammaDisplay = '';
    if (hypotheses.length > 0) {
        gammaDisplay = contextIndex === 0 ? 'Γ' : `Γ<sub>${contextIndex}</sub>`;
    } else if (isAxiom) {
        gammaDisplay = 'Γ';
    }

    const turnstile = isAxiom ? '' : '⊢';

    // Створюємо span з data-hypotheses атрибутом та индексом
    return `<span class="gamma-context" data-hypotheses='${hypothesesJson}' data-level="${level}" data-context-index="${contextIndex}" data-is-axiom="${isAxiom}">${gammaDisplay}${turnstile}</span>`;
  } catch (error) {
    console.error('Error creating gamma context span:', error);
    // Fallback до звичайного span без data атрибутів
    return `<span class="gamma-context">${isAxiom ? 'Γ' : '⊢'}</span>`;
  }
}

/**
 * Витягує гіпотези з id елемента (аналогічно до getAllHypotheses, але без парсингу всього контейнера)
 * @param {string} elementId - ID елемента
 * @returns {Array<string>} - Масив рядків гіпотез
 */
function extractHypothesesFromId(elementId) {
  if (!elementId || !elementId.includes('divId-')) {
    return [];
  }

  const hypothesesStrings = elementId
    .replaceAll('divId-', ' ')
    .split(' ')
    .filter(word => word !== 'proof' && Boolean(word));

  const hypotheses = [];

  for (const hypString of hypothesesStrings) {
    try {
      const chars = CharStreams.fromString(hypString.toString());
      const lexer = new GrammarLexer(chars);
      const tokens = new CommonTokenStream(lexer);
      const parser = new GrammarParser(tokens);
      const tree = parser.formula();

      const listener = new MyGrammarListener();
      ParseTreeWalker.DEFAULT.walk(listener, tree);

      const parsedHyp = listener.stack.pop();
      if (parsedHyp) {
        // Конвертуємо AST в текстове представлення
        const hypText = deductive.convertToLogicalExpression(parsedHyp);
        hypotheses.push(hypText);
      }
    } catch (error) {
      console.warn('Error parsing hypothesis:', hypString, error);
    }
  }

  return hypotheses;
}

/**
 * Форматує гіпотези для відображення в гама-контексті
 * @param {Array<string>} hypotheses - Масив рядків гіпотез
 * @returns {string} - Форматований рядок гіпотез
 */
function formatHypothesesForGamma(hypotheses) {
  if (!hypotheses || hypotheses.length === 0) {
    return ''; // Показуємо порожній рядок замість {}
  }

  // Гіпотези вже є рядками, просто видаляємо дублікати
  const uniqueHyps = [...new Set(hypotheses)];

  if (uniqueHyps.length === 0) {
    return ''; // Показуємо порожній рядок замість {}
  }

  // Форматуємо як {ψ, φ}
  return `{${uniqueHyps.join(', ')}}`;
}

/**
 * Додає нові гіпотези до існуючого gamma-context span
 * @param {HTMLElement|string} gammaSpan - DOM елемент span або селектор
 * @param {string|string[]} newHypotheses - Нова гіпотеза як рядок або масив гіпотез
 * @returns {boolean} - true якщо успішно додано, false якщо помилка
 */
function addHypothesesToGammaSpan(gammaSpan, newHypotheses) {
  try {
    // Отримуємо DOM елемент, якщо передано селектор
    let spanElement;
    if (typeof gammaSpan === 'string') {
      spanElement = document.querySelector(gammaSpan);
    } else {
      spanElement = gammaSpan;
    }

    // Перевіряємо, що елемент існує та має правильний клас
    if (!spanElement || !spanElement.classList.contains('gamma-context')) {
      console.error('Element is not a valid gamma-context span');
      return false;
    }

    // Отримуємо існуючі гіпотези з data-hypotheses атрибута (тепер це прості рядки)
    let existingHypotheses = [];
    const hypothesesData = spanElement.getAttribute('data-hypotheses');

    if (hypothesesData) {
      try {
        existingHypotheses = JSON.parse(hypothesesData);
      } catch (parseError) {
        console.error('Error parsing existing hypotheses:', parseError);
        existingHypotheses = [];
      }
    }

    // Нормалізуємо нові гіпотези до масиву
    let hypothesesToAdd = [];
    if (typeof newHypotheses === 'string') {
      hypothesesToAdd = [newHypotheses.trim()];
    } else if (Array.isArray(newHypotheses)) {
      hypothesesToAdd = newHypotheses.map(h => h.trim()).filter(h => h.length > 0);
    }

    // Перевіряємо, що є що додавати
    if (hypothesesToAdd.length === 0) {
      console.warn('No valid hypotheses to add');
      return false;
    }

    // Додаємо нові гіпотези як прості рядки (без ANTLR парсингу)
    hypothesesToAdd.forEach(hypothesis => {
      if (hypothesis && hypothesis.trim().length > 0) {
        // Перевіряємо чи немає дублікату (порівнюємо рядки)
        if (!existingHypotheses.includes(hypothesis.trim())) {
          existingHypotheses.push(hypothesis.trim());
        } else {
          console.log(`Hypothesis "${hypothesis}" already exists, skipping`);
        }
      }
    });

    // Получаем новый индекс для обновленного контекста
    const newContextIndex = getContextIndex(existingHypotheses);

    // Формируем новое отображение Gamma с индексом
    const newGammaDisplay = newContextIndex === 0 ? 'Γ' : `Γ<sub>${newContextIndex}</sub>`;

    // Оновлюємо data-hypotheses атрибут и индекс
    const updatedHypothesesJson = JSON.stringify(existingHypotheses);
    spanElement.setAttribute('data-hypotheses', updatedHypothesesJson);
    spanElement.setAttribute('data-context-index', newContextIndex.toString());

    // Обновляем отображение, если элемент не развернут (показывает Gamma, а не список гипотез)
    const gammaId = getGammaId(spanElement);
    const isExpanded = gammaToggleState.get(gammaId) || false;

    const isAxiom = spanElement.getAttribute('data-is-axiom') === 'true';
    const turnstile = isAxiom ? '' : '⊢';

    if (!isExpanded) {
      // Обновляем отображение только если элемент свернут
      spanElement.innerHTML = `${newGammaDisplay}${turnstile}`;
    }

    console.log(`Successfully added ${hypothesesToAdd.length} new hypotheses to gamma context`);
    console.log('Current hypotheses:', existingHypotheses);
    console.log(`Updated context index: ${newContextIndex}`);

    return true;

  } catch (error) {
    console.error('Error adding hypotheses to gamma span:', error);
    return false;
  }
}

/**
 * Перемикає відображення гама-контексту між Γ⊢ та {ψ, φ}⊢
 * @param {HTMLElement} gammaElement - Гама-елемент, на який клікнули
 */
function toggleGammaContext(gammaElement) {
  try {
    // Отримуємо унікальний ідентифікатор для цього гама-елемента
    const gammaId = getGammaId(gammaElement);

    // Перевіряємо поточний стан (розкритий чи ні)
    const isExpanded = gammaToggleState.get(gammaId) || false;

    // Знаходимо контейнер, до якого належить цей гама-елемент
    let proofContainer = gammaElement.closest('[id*="divId-"]');
    if (!proofContainer) {
      proofContainer = gammaElement.closest('[class*="proof-element_level-"]');
    }

    if (!proofContainer) {
      console.warn('Could not find proof container for gamma element');
      return;
    }

    const isAxiom = gammaElement.getAttribute('data-is-axiom') === 'true';
    const turnstile = isAxiom ? '' : '⊢';

    if (isExpanded) {
      // Згортаємо: повертаємо до Γ⊢ з індексом
      const contextIndex = parseInt(gammaElement.getAttribute('data-context-index') || '0');
      let gammaDisplay = contextIndex === 0 ? 'Γ' : `Γ<sub>${contextIndex}</sub>`;

      const hypothesesData = gammaElement.getAttribute('data-hypotheses');
      if (hypothesesData) {
          try {
              const hypArr = JSON.parse(hypothesesData);
              if (hypArr.length === 0) {
                  gammaDisplay = isAxiom ? 'Γ' : '';
              }
          } catch (e) {}
      }

      gammaElement.innerHTML = `${gammaDisplay}${turnstile}`;
      gammaToggleState.set(gammaId, false);
      console.log(`Gamma context collapsed for ${gammaId}`);
    } else {
      // Розкриваємо: показуємо {ψ, φ}⊢
      try {
        // Спочатку намагаємося прочитати гіпотези з data-hypotheses атрибуту
        let hypotheses = [];
        const hypothesesData = gammaElement.getAttribute('data-hypotheses');

        if (hypothesesData) {
          try {
            hypotheses = JSON.parse(hypothesesData);
            console.log(`Read ${hypotheses.length} hypotheses from data-hypotheses for ${gammaId}`);
          } catch (parseError) {
            console.warn('Error parsing data-hypotheses, falling back to dynamic computation:', parseError);
            // Fallback до динамічного обчислення
            hypotheses = getLocalHypothesesForElement(proofContainer);
          }
        } else {
          console.log('No data-hypotheses found, using dynamic computation for:', gammaId);
          // Fallback до динамічного обчислення
          hypotheses = getLocalHypothesesForElement(proofContainer);
        }

        // Форматуємо гіпотези
        const formattedContext = formatHypothesesForGamma(hypotheses);

        // Оновлюємо відображення
        gammaElement.textContent = `${formattedContext}${turnstile}`;
        gammaToggleState.set(gammaId, true);
        console.log(`Gamma context expanded for ${gammaId}:`, formattedContext);
      } catch (error) {
        console.error('Error expanding gamma context:', error);
        // У випадку помилки залишаємо ⊢
        gammaElement.textContent = turnstile;
        gammaToggleState.set(gammaId, false);
      }
    }
  } catch (error) {
    console.error('Error in toggleGammaContext:', error);
  }
}

