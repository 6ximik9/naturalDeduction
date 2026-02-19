import {CharStreams, CommonTokenStream, ParseTreeWalker} from 'antlr4';
import GrammarLexer from '../../../my_antlr/GrammarLexer.js';
import GrammarParser from '../../../my_antlr/GrammarParser.js';
import MyGrammarListener from '../../../my_antlr/MyGrammarListener.js';
import * as editorMonaco from '../../ui/monacoEditor.js'
import * as deductive from '../../core/deductiveEngine.js';
import {checkWithAntlr, convertToLogicalExpression, getProof} from '../../core/deductiveEngine.js';
import * as controlState from '../../state/stateManager.js';
import {addNextLastButtonClickGentzen} from '../../state/stateManager.js';
import {checkRule, shakeElement, typeProof} from "../../index.js";
import {createTreeD3} from "../../ui/tree.js";
import {latexGentzen} from "../../ui/latexGen.js";
import {AXIOM_HANDLERS, GENTZEN_BUTTONS, ROBINSON_AXIOMS, ORDER_AXIOMS, ruleGentzenHandlers} from './ruleGentzenHandlers.js';
import {formulaToString} from "../../core/formatter.js";
import {addProofTextHoverEffects, initializeProofTextHover} from '../../ui/proofTextHover.js';
import {validateRobinsonAxioms} from "../../core/robinsonAxiomValidator.js";
import {parseProofFromLastSide} from "./rulesGentzen";

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
  if (clickedElement.className === "previous" || clickedElement.className.includes("proof-element_level-") || clickedElement.id === "proof") return;

  // Обробка кліку на gamma-context елемент
  if (clickedElement.classList.contains('gamma-context')) {
    console.log('Gamma context clicked!', clickedElement);
    toggleGammaContext(clickedElement);
    return; // Виходимо, щоб не виконувати звичайну обробку кліку
  }

  let potentialSide = null;
  if (clickedElement.tagName === 'DIV') {
    potentialSide = clickedElement;
  } else if (clickedElement.tagName === 'LABEL') {
    potentialSide = clickedElement.parentNode;
  }

  // Якщо клікнули по вже активному елементу - знімаємо виділення
  if (side && potentialSide === side) {
      clearLabelHighlights();
      side = null;
      disableAllButtons();
      return;
  }

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
      
      // Determine active tab and update accordingly
      if (document.getElementById('tab3').checked) {
          // Axioms Tab
          if (helpButtonToggleState.axioms) {
               showFilteredAxioms();
          } else {
              const formattedRobinson = ROBINSON_AXIOMS.map((axiom, index) => `${index + 1}. ${axiom}`);
              const formattedOrder = ORDER_AXIOMS.map((axiom, index) => `${index + 1 + ROBINSON_AXIOMS.length}. ${axiom}`);
              generateButtons(formattedRobinson.length + formattedOrder.length, [...formattedRobinson, ...formattedOrder]);
          }
      } else if (document.getElementById('tab4').checked) {
          // Tree View Tab
          const buttonContainer = document.getElementById('button-container');
          buttonContainer.innerHTML = '';
          
          let svgContainer = document.createElement("div");
          svgContainer.style.width = "100%";
          svgContainer.style.maxWidth = "1000px";
          svgContainer.style.overflow = "auto";
          svgContainer.style.height = "auto";
          svgContainer.style.margin = "0 auto";
          svgContainer.style.display = "block";

          let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svgElement.setAttribute("width", "1000");
          svgElement.setAttribute("height", "1000");

          svgContainer.appendChild(svgElement);
          buttonContainer.appendChild(svgContainer);

          let size = createTreeD3(parsed);
          svgElement.setAttribute("width", (Math.max(1000, size[0] + 50)).toString());
          svgElement.setAttribute("height", (size[1] + 100).toString());
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
    side = document.querySelector('.proof-element_level-0').children[0];
    oldUserInput = side.querySelector('#proofText').textContent;

    setTimeout(() => {
        if (side) {
            const label = side.querySelector('label');
            if (label) {
                label.style.background = 'rgba(136,190,213,0.78)';
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
      const eqButtons = [GENTZEN_BUTTONS[15], GENTZEN_BUTTONS[17], GENTZEN_BUTTONS[18]];
      if (!expr.operator || expr.operator === '=' || expr.operator === 'EQUAL') {
        eqButtons.push(GENTZEN_BUTTONS[19]);
      }
      generateButtons(eqButtons.length, eqButtons);
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

  // Set position relative for all tabs (needed for help button)
  buttonContainer.style.position = 'relative';

  // Check if this is for axioms - more specific detection
  const isAxiomsTab = buttonTexts.length === (ROBINSON_AXIOMS.length + ORDER_AXIOMS.length) &&
    buttonTexts.every((text, index) => text.startsWith(`${index + 1}. `));

  // Check if this is the "All rules" tab (when all GENTZEN_BUTTONS are shown)
  const isAllRulesTab = buttonTexts.length === GENTZEN_BUTTONS.length &&
    buttonTexts === GENTZEN_BUTTONS;

  // Recommended rules tab is when it's not axioms and not all rules
  // BUT we should show help button if All rules toggle is active (even when showing recommended rules)
  const isRecommendedRulesTab = !isAxiomsTab && !isAllRulesTab && !helpButtonToggleState.allRules;

  if (isAxiomsTab) {
    // Special styling for axioms - 2 columns layout
    buttonContainer.style.display = 'grid';
    buttonContainer.style.gridTemplateColumns = '1fr 1fr';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.padding = '20px';
    buttonContainer.style.justifyItems = 'center';
    // Add simple header for axioms (without complex positioning)
    const header = document.createElement('h4');
    header.textContent = 'Robinson Arithmetic Axioms';
    header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 0 0 14px 0; color: #333; font-family: "Times New Roman", serif;';

    buttonContainer.appendChild(header);
  } else {
    // Reset to default styling for other tabs
    buttonContainer.style.display = '';
    buttonContainer.style.gridTemplateColumns = '';
    buttonContainer.style.gap = '';
    buttonContainer.style.padding = '';
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

    // Check if current expression matches any Robinson arithmetic axiom
    const isRobinsonAxiom = ROBINSON_AXIOMS.some(axiom => {
      try {
        const axiomParsed = deductive.getProof(deductive.checkWithAntlr(axiom));
        return deductive.compareExpressions(axiomParsed, currentExpr);
      } catch (error) {
        console.warn('Error parsing axiom:', axiom, error);
        return false;
      }
    });

    // Check if current expression matches any Order axiom
    const isOrderAxiom = ORDER_AXIOMS.some(axiom => {
      try {
        const axiomParsed = deductive.getProof(deductive.checkWithAntlr(axiom));
        return deductive.compareExpressions(axiomParsed, currentExpr);
      } catch (error) {
        console.warn('Error parsing axiom:', axiom, error);
        return false;
      }
    });

    if (isInLocalHypotheses || isRobinsonAxiom || isOrderAxiom) {
      const closeBtn = createButton("Close branch", () => closeSide(side));
      closeBtn.style.minHeight = '80px';
      buttonContainer.appendChild(closeBtn);
      console.log(`🔒 Close branch available - formula found in local hypotheses or is Robinson axiom`);
    } else {
      console.log(`❌ Close branch not available - formula not in local hypotheses`);
    }
  }

  for (let i = 0; i < buttonCount; i++) {
    if (isAxiomsTab && i === ROBINSON_AXIOMS.length) {
      const header = document.createElement('h4');
      header.textContent = 'Linear Order Axioms';
      header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 20px 0 14px 0; color: #333; font-family: "Times New Roman", serif;';
      buttonContainer.appendChild(header);
    }
    const button = createButton(buttonTexts[i], () => buttonClicked(buttonTexts[i]));

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
  if (!side) {
      shakeElement('helpBtn', 5);
      return false;
  }

  // Toggle state globally for both modes
  const newState = !helpButtonToggleState.allRules; // Using allRules as master state
  helpButtonToggleState.allRules = newState;
  helpButtonToggleState.axioms = newState;

  const isAxiomsTab = document.getElementById('tab3').checked;

  if (isAxiomsTab) {
    if (newState) {
      // Smart Mode ON: Show filtered
      showFilteredAxioms();
    } else {
      // Smart Mode OFF: Show all
      const formattedRobinson = ROBINSON_AXIOMS.map((axiom, index) => `${index + 1}. ${axiom}`);
      const formattedOrder = ORDER_AXIOMS.map((axiom, index) => `${index + 1 + ROBINSON_AXIOMS.length}. ${axiom}`);
      generateButtons(formattedRobinson.length + formattedOrder.length, [...formattedRobinson, ...formattedOrder]);
    }
  } else {
    // Rules tab
    // Get content from active side or fallback to oldUserInput
    let content = "";
    if (side) {
        content = side.querySelector('#proofText').textContent;
    } else if (oldUserInput) {
        content = oldUserInput;
    } else {
        console.warn("No active formula selected for Smart Mode");
        return newState;
    }

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
      header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 0 0 14px 0; color: #333; font-family: "Times New Roman", serif;';
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
 * @param {HTMLElement} container - DOM-елемент гілки.
 */
function closeSide(container) {
  // Normalize to the main proof element (outer div) if we passed the inner proof-content
  if (container.classList.contains('proof-content')) {
    container = container.parentNode;
  }

  disableAllButtons();
  side = null;
  clearLabelHighlights();

  // 1. Шукаємо елемент gamma
  const existingElement = container.querySelector('.gamma-context');
  
  if (!existingElement) {
    console.warn("Could not find gamma-context in element to close", container);
    return;
  }

  let gammaHtml = existingElement.outerHTML;
  
  // 3. Видаляємо всі span-елементи для отримання чистого тексту формули
  container.querySelectorAll('span').forEach(span => span.remove());

  // Позначаємо гілку як закриту
  container.className = 'closed';
  
  // Очищаємо текст від зайвих пробілів
  let rawText = container.textContent.trim();
  let labelText = `[${rawText}]`;
  labelText = labelText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 4. Вставляємо нову структуру
  container.innerHTML = `<div class="proof-content">${gammaHtml}<label class="previous" id="proofText">${labelText}</label></div>`;

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
          nameRule = "\\forall E";

          createProofTree(newConclusion, side);

          // Відразу закриваємо гілку для аксіоми
          const axiomElement = document.querySelector(`.proof-element_level-${newConclusion.level}`);
          if (axiomElement) {
            const proofDiv = axiomElement.querySelector('div:not(.nameRule)');
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
  if (!handler.condition(expr)) {
    const targetButton = Array.from(allButtons).find(btn => 
      btn.getAttribute('data-original-text') === buttonText
    );
    
    if (targetButton) {
      shakeButton(targetButton);
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

  side = null;
  disableAllButtons();
}

function disableAllButtons() {
    // Determine which tab is active to know what to show
    const isAxiomsTab = document.getElementById('tab3') && document.getElementById('tab3').checked;
    const isTreeTab = document.getElementById('tab4') && document.getElementById('tab4').checked;
    
    if (isTreeTab) {
        const buttonContainer = document.getElementById('button-container');
        buttonContainer.innerHTML = '';
        
        if (side) {
            // Reset styles for tree view
            buttonContainer.style.display = '';
            buttonContainer.style.gridTemplateColumns = '';
            buttonContainer.style.gap = '';
            buttonContainer.style.padding = '';
            
            let svgContainer = document.createElement("div");
            svgContainer.style.width = "100%";
            svgContainer.style.maxWidth = "1000px";
            svgContainer.style.overflow = "auto";
            svgContainer.style.height = "auto";
            svgContainer.style.margin = "0 auto";
            svgContainer.style.display = "block";

            let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgElement.setAttribute("width", "1000");
            svgElement.setAttribute("height", "1000");

            svgContainer.appendChild(svgElement);
            buttonContainer.appendChild(svgContainer);
            
             try {
                const parsed = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);
                let size = createTreeD3(parsed);
                svgElement.setAttribute("width", (Math.max(1000, size[0] + 50)).toString());
                svgElement.setAttribute("height", (size[1] + 100).toString());
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
         const formattedRobinson = ROBINSON_AXIOMS.map((axiom, index) => `${index + 1}. ${axiom}`);
         const formattedOrder = ORDER_AXIOMS.map((axiom, index) => `${index + 1 + ROBINSON_AXIOMS.length}. ${axiom}`);
         generateButtons(formattedRobinson.length + formattedOrder.length, [...formattedRobinson, ...formattedOrder]);
    } else {
         // Default to rules (Tab 1) logic
         generateButtons(GENTZEN_BUTTONS.length, GENTZEN_BUTTONS);
    }

    const buttons = document.querySelectorAll('#button-container button');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.title = 'Select a branch to prove';
    });
}

export function shakeButton(button) {
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
  button.style.height = '40px';
  button.style.padding = '0 15px';
  button.style.borderRadius = '5px';
  button.style.border = 'none';
  button.style.cursor = 'pointer';

  button.innerHTML = `
  <span class="buttonText">Save</span>
  <div class="buttonIcon" style="margin: 0px 0px 0px 10px; height: 100%; width: 24px; display: flex; align-items: center;">
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
  // Set z-index equal to level so higher levels stack on top of lower ones
  proofElement.style.zIndex = level;
  return proofElement;
}

function createProofTree(conclusions, container, hyp = null) {
  if (!conclusions || Object.keys(conclusions).length === 0 || !conclusions.proof) {
    return;
  }
  const levelDiv = createProofElement(conclusions.level);

  // Use a container for nodes to allow flexible layout (inference row vs direct append)
  let nodesContainer = levelDiv;

  if (conclusions.level !== 0) {
    let lvl = document.querySelector(`.proof-element_level-${conclusions.level - 1}`);
    if (lvl && lvl.childElementCount === 0) {
      lvl.style.borderTop = '2px solid #000000';
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
    nodesContainer.style.display = 'flex';
    nodesContainer.style.flexDirection = 'row';
    nodesContainer.style.gap = '80px';
    nodesContainer.style.justifyContent = 'center';
    nodesContainer.style.alignItems = 'flex-end';
    nodesContainer.style.borderBottom = '2px solid black';
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
        const result = formulaToString(getProof(conclusions.proof), 0);
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
      const gammaContextSpan = createGammaContextSpan(container, proofLevel);

      if (mainReplaces !== "") {
        proofDiv.innerHTML = `<div class="proof-content">${gammaContextSpan}<label id="proofText">${text}</label></div>` +
          '<span id="repl" style="display: none;">' + mainReplaces + '</span>';
        mainReplaces = "";
      } else {
        proofDiv.innerHTML = `<div class="proof-content">${gammaContextSpan}<label id="proofText">${text}</label></div>`;
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
    // addUserHyp(conclusions, proofDiv);
    nodesContainer.appendChild(proofDiv);

  }

  // Helper to get child elements from the correct container
  let childElements = nodesContainer.children;

  if (currentLevel === 2 || currentLevel === 4 || currentLevel === 12) {
    let hyp = "";

    if(currentLevel ===2 )
    {
      hyp = '¬(' + lastSide.querySelector('#proofText')?.textContent+ ')';
    }
    else if(currentLevel===4)
    {
      hyp = '¬(' + lastSide.querySelector('#proofText')?.textContent.replace('¬', '');
    }
    else if(currentLevel===12)
    {
      const pr = parseProofFromLastSide();
      console.log(pr);
      if (pr.left && pr.right) {
        hyp = deductive.convertToLogicalExpression(pr.left);
      } else if (pr.operands && pr.operands.length >= 2) {
        hyp = deductive.convertToLogicalExpression(pr.operands[0]);
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

  // Set initial state: Original Proof is disabled by default
  toggleButtonState(retBtn, false);

  // Helper to manage button states
  function toggleButtonState(btn, enabled) {
      if (enabled) {
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          btn.classList.remove('disabled');
      } else {
          btn.style.opacity = '0.5';
          btn.style.pointerEvents = 'none';
          btn.classList.add('disabled');
      }
  }

  function updateButtons(activeBtn) {
    // Enable all first
    [addBtn, delBtn, retBtn].forEach(btn => toggleButtonState(btn, true));

    // Disable the active one
    if (activeBtn) toggleButtonState(activeBtn, false);
  }

  addBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!side) return;
    const inProof = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);
    side.querySelector('#proofText').textContent = formulaToString(inProof, 1);
    updateButtons(addBtn);
  });

  delBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!side) return;
    const expression = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);
    side.querySelector('#proofText').textContent = formulaToString(getProof(expression), 0);
    updateButtons(delBtn);
  });

  retBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!side) return;
    if (oldUserInput !== "") {
      side.querySelector('#proofText').textContent = oldUserInput;
      updateButtons(retBtn);
    } else {
      // shakeButton(retBtn); // No easy shake for sidebar link
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
      if (tabId === 'tab1') {
        if (typeProof === 1) {
          return;
        }
        // Preserve Smart Mode state
        processExpression(checkWithAntlr(oldUserInput), helpButtonToggleState.allRules ? 0 : 1);
        // } else if (tabId === 'tab2') {
        //   if (typeProof === 1) {
        //     return;
        //   }
        //   // Reset toggle states when switching to recommended rules tab
        //   helpButtonToggleState.allRules = false;
        //   helpButtonToggleState.axioms = false;
        //   processExpression(checkWithAntlr(side.querySelector('#proofText').textContent), 0);
      } else if (tabId === 'tab3') {
        // Axioms tab - show Robinson Arithmetic axioms and Order Axioms
        if (typeProof === 1) {
          return;
        }

        if (helpButtonToggleState.axioms) {
             showFilteredAxioms();
        } else {
            // Format axioms for generateButtons
            const formattedRobinson = ROBINSON_AXIOMS.map((axiom, index) =>
              `${index + 1}. ${axiom}`
            );
            const formattedOrder = ORDER_AXIOMS.map((axiom, index) =>
              `${index + 1 + ROBINSON_AXIOMS.length}. ${axiom}`
            );
            const formattedAxioms = [...formattedRobinson, ...formattedOrder];
            generateButtons(formattedAxioms.length, formattedAxioms);
        }
      } else if (tabId === 'tab4') {
        // Reset toggle states when switching to tree view tab
        // Persist state instead of resetting
        // helpButtonToggleState.allRules = false;
        // helpButtonToggleState.axioms = false;
        const buttonContainer = document.getElementById('button-container');
        buttonContainer.innerHTML = '';

        // Reset button-container styles to original state (remove grid styles from Axioms tab)
        buttonContainer.style.display = '';
        buttonContainer.style.gridTemplateColumns = '';
        buttonContainer.style.gap = '';
        buttonContainer.style.padding = '';
        buttonContainer.style.justifyItems = 'center';
        buttonContainer.style.position = 'relative';

        let svgContainer = document.createElement("div");
        svgContainer.style.width = "100%"; // Або використовуйте фіксовану ширину, наприклад "1000px"
        svgContainer.style.maxWidth = "1000px";
        svgContainer.style.overflow = "auto"; // Дозволяє прокрутку, якщо вміст більше контейнера
        svgContainer.style.height = "auto"; // Висота адаптується до вмісту
        svgContainer.style.margin = "0 auto"; // Центруємо контейнер по горизонталі
        svgContainer.style.display = "block"; // Забезпечуємо block display для margin auto

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
      const convertedExpr = convertExpression(formulaToString(expression, 0));
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
      const gammaSpan = elementContext.querySelector(':scope > .gamma-context');
      const rawHypotheses = gammaSpan.dataset?.hypotheses;
      return JSON.parse(rawHypotheses);
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
 * @returns {string} - HTML рядок для gamma-context span
 */
function createGammaContextSpan(elementContext, level) {
  try {
    // Обчислюємо гіпотези для цього контексту
    const hypotheses = computeHypothesesForGammaContext(elementContext, level);

    // Получаем индекс для этого контекста
    const contextIndex = getContextIndex(hypotheses);

    // Конвертуємо гіпотези в JSON для зберігання в data атрибуті
    const hypothesesJson = JSON.stringify(hypotheses);

    // Формируем отображение Gamma с индексом
    const gammaDisplay = contextIndex === 0 ? 'Γ' : `Γ<sub>${contextIndex}</sub>`;

    // Створюємо span з data-hypotheses атрибутом та индексом
    return `<span class="gamma-context" data-hypotheses='${hypothesesJson}' data-level="${level}" data-context-index="${contextIndex}">${gammaDisplay}⊢</span>`;
  } catch (error) {
    console.error('Error creating gamma context span:', error);
    // Fallback до звичайного span без data атрибутів
    return `<span class="gamma-context">Γ⊢</span>`;
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
    return '{}'; // Показуємо порожній набір замість Γ
  }

  // Гіпотези вже є рядками, просто видаляємо дублікати
  const uniqueHyps = [...new Set(hypotheses)];

  if (uniqueHyps.length === 0) {
    return '{}'; // Показуємо порожній набір замість Γ
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

    if (!isExpanded) {
      // Обновляем отображение только если элемент свернут
      spanElement.innerHTML = `${newGammaDisplay}⊢`;
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

    if (isExpanded) {
      // Згортаємо: повертаємо до Γ⊢ з індексом
      const contextIndex = parseInt(gammaElement.getAttribute('data-context-index') || '0');
      const gammaDisplay = contextIndex === 0 ? 'Γ' : `Γ<sub>${contextIndex}</sub>`;
      gammaElement.innerHTML = `${gammaDisplay}⊢`;
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
        gammaElement.textContent = `${formattedContext}⊢`;
        gammaToggleState.set(gammaId, true);
        console.log(`Gamma context expanded for ${gammaId}:`, formattedContext);
      } catch (error) {
        console.error('Error expanding gamma context:', error);
        // У випадку помилки залишаємо Γ⊢
        gammaElement.textContent = 'Γ⊢';
        gammaToggleState.set(gammaId, false);
      }
    }
  } catch (error) {
    console.error('Error in toggleGammaContext:', error);
  }
}

