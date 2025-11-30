import {CharStreams, CommonTokenStream, ParseTreeWalker} from 'antlr4';
import GrammarLexer from '../my_antlr/GrammarLexer.js';
import GrammarParser from '../my_antlr/GrammarParser.js';
import MyGrammarListener from '../my_antlr/MyGrammarListener.js';
import * as editorMonaco from './monacoEditor.js'
import * as deductive from './deductiveEngine.js';
import * as controlState from './states.js';
import {checkWithAntlr, convertToLogicalExpression, getProof, handleModalCancellation} from "./deductiveEngine.js";
import {checkRule, typeProof} from "./index.js";
import {shakeElement} from "./index.js";
import {createTreeD3} from "./tree.js";
import {addNextLastButtonClickGentzen} from "./states.js";
import {latexGentzen} from "./latexGen.js";
import {GENTZEN_BUTTONS, ruleGentzenHandlers, ROBINSON_AXIOMS, AXIOM_HANDLERS} from './ruleGentzenHandlers.js';
import {get} from "mobx";
import {formulaToString} from "./formatter.js";
import {initializeProofTextHover, addProofTextHoverEffects} from './proofTextHover.js';
import {validateRobinsonAxioms} from "./robinsonAxiomValidator.js";

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
  if (clickedElement.className === "previous" || clickedElement.className.includes("proof-element_level-") || clickedElement.id === "proof") return;

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

  // Ініціалізуємо hover ефекти для proofText елементів
  initializeProofTextHover();

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
      reportAmbiguity: function (recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
        console.warn('Grammar ambiguity detected in Gentzen proof parsing');
      },
      reportAttemptingFullContext: function (recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
        console.warn('Parser attempting full context in Gentzen proof parsing');
      },
      reportContextSensitivity: function (recognizer, dfa, startIndex, stopIndex, prediction, configs) {
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

  // Set position relative for all tabs (needed for help button)
  buttonContainer.style.position = 'relative';

  // Check if this is for axioms - more specific detection
  const isAxiomsTab = buttonTexts.length === ROBINSON_AXIOMS.length &&
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


  if (!isAxiomsTab) {
    const currentExpr = deductive.getProof(
      deductive.checkWithAntlr(side.querySelector('#proofText').textContent)
    );

    const hypotheses = deductive.getAllHypotheses(side).map(h =>
      deductive.getProof(h)
    );

    const isInHypotheses = hypotheses.some(h =>
      deductive.compareExpressions(h, currentExpr)
    );

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

    if (isInHypotheses || isRobinsonAxiom) {
      const closeBtn = createButton("Close branch", () => closeSide(side));
      closeBtn.style.minHeight = '80px';
      buttonContainer.appendChild(closeBtn);
    }
  }

  for (let i = 0; i < buttonCount; i++) {
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

  // Add help button at the end, after all other buttons are generated
  // This prevents interference with the main button generation logic
  if (!isRecommendedRulesTab) {
    const helpButton = document.createElement('button');
    helpButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      z-index: 10;
      width: 48px;
      height: 48px;
    `;
    helpButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 40 40">
          <path fill="#b6dcfe" d="M14.5,29.833V28c0-1.914-1.168-3.76-2.52-5.897C10.349,19.525,8.5,16.603,8.5,13 C8.5,6.659,13.659,1.5,20,1.5S31.5,6.659,31.5,13c0,3.603-1.849,6.525-3.48,9.103C26.668,24.24,25.5,26.086,25.5,28v1.833H14.5z"></path>
          <path fill="#4788c7" d="M20,2c6.065,0,11,4.935,11,11c0,3.458-1.808,6.315-3.402,8.835C26.262,23.947,25,25.941,25,28v1.333 h-5h-5V28c0-2.059-1.262-4.053-2.598-6.165C10.808,19.315,9,16.458,9,13C9,6.935,13.935,2,20,2 M20,1C13.373,1,8,6.373,8,13 c0,6.667,6,10.958,6,15v2.333h6h6V28c0-4.042,6-8.333,6-15C32,6.373,26.627,1,20,1L20,1z"></path>
          <path fill="#fff" d="M22.714,11.335c0.502,0,0.974,0.195,1.329,0.55c0.733,0.733,0.733,1.925,0,2.657l-1.75,1.75 L22,16.586V17v12h-4V17v-0.414l-0.293-0.293l-1.75-1.75c-0.733-0.733-0.733-1.925,0-2.657c0.355-0.355,0.827-0.55,1.329-0.55 c0.502,0,0.974,0.195,1.329,0.55l0.679,0.679L20,13.271l0.707-0.707l0.679-0.679C21.741,11.531,22.212,11.335,22.714,11.335 M22.714,10.335c-0.737,0-1.474,0.281-2.036,0.843L20,11.857l-0.679-0.679c-0.562-0.562-1.299-0.843-2.036-0.843 c-0.737,0-1.474,0.281-2.036,0.843c-1.124,1.124-1.124,2.947,0,4.071L17,17v13h6V17l1.75-1.75c1.124-1.124,1.124-2.947,0-4.071 C24.188,10.616,23.451,10.335,22.714,10.335L22.714,10.335z"></path>
          <path fill="#4788c7" d="M20 31A4 4 0 1 0 20 39A4 4 0 1 0 20 31Z"></path>
          <path fill="#dff0fe" d="M17,36.5c-1.378,0-2.5-1.122-2.5-2.5v-5.5h11V34c0,1.378-1.122,2.5-2.5,2.5H17z"></path>
          <path fill="#4788c7" d="M25,29v5c0,1.103-0.897,2-2,2h-6c-1.103,0-2-0.897-2-2v-5H25 M26,28H14v6c0,1.657,1.343,3,3,3h6 c1.657,0,3-1.343,3-3V28L26,28z"></path>
          <path fill="#4788c7" d="M25.5 31h-6c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h6c.275 0 .5.225.5.5l0 0C26 30.775 25.775 31 25.5 31zM25.5 33h-6c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h6c.275 0 .5.225.5.5l0 0C26 32.775 25.775 33 25.5 33zM25.5 35h-6c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h6c.275 0 .5.225.5.5l0 0C26 34.775 25.775 35 25.5 35zM16.5 33h-2c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h2c.275 0 .5.225.5.5l0 0C17 32.775 16.775 33 16.5 33zM16.5 35H15c-.55 0-1-.45-1-1l0 0h2.5c.275 0 .5.225.5.5l0 0C17 34.775 16.775 35 16.5 35zM16.5 31h-2c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h2c.275 0 .5.225.5.5l0 0C17 30.775 16.775 31 16.5 31z"></path>
        </svg>
    `;

    // Add hover effect that works with toggle state
    helpButton.onmouseenter = () => {
      const isToggled = isAxiomsTab ? helpButtonToggleState.axioms : helpButtonToggleState.allRules;
      if (!isToggled) {
        helpButton.style.backgroundColor = 'rgba(0, 97, 161, 0.1)';
      }
    };
    helpButton.onmouseleave = () => {
      // Restore appearance based on toggle state
      updateHelpButtonAppearance(helpButton, isAxiomsTab);
    };

    // Add click handler with tab detection and toggle functionality
    helpButton.onclick = () => {
      console.log('Help button clicked!');

      if (isAxiomsTab) {
        // Toggle state for Axioms tab
        helpButtonToggleState.axioms = !helpButtonToggleState.axioms;
        console.log(`Axioms tab toggle: ${helpButtonToggleState.axioms ? 'ON' : 'OFF'}`);

        if (helpButtonToggleState.axioms) {
          console.log('Showing only matching axioms for current formula');
          // Show only axioms that match the current formula
          showFilteredAxioms();
        } else {
          console.log('Showing all axioms');
          // Show all axioms
          const formattedAxioms = ROBINSON_AXIOMS.map((axiom, index) =>
            `${index + 1}. ${axiom}`
          );
          generateButtons(ROBINSON_AXIOMS.length, formattedAxioms);
        }

      } else {
        // Toggle state for All rules tab
        helpButtonToggleState.allRules = !helpButtonToggleState.allRules;
        console.log(`All rules tab toggle: ${helpButtonToggleState.allRules ? 'ON' : 'OFF'}`);

        if (helpButtonToggleState.allRules) {
          console.log('This is where you would show help information about All Rules.');
          processExpression(checkWithAntlr(side.querySelector('#proofText').textContent), 0);
        } else {
          console.log('All rules help mode disabled.');
          processExpression(checkWithAntlr(side.querySelector('#proofText').textContent), 1);
        }
      }

      // Update button appearance based on toggle state
      updateHelpButtonAppearance(helpButton, isAxiomsTab);
    };

    // Set initial appearance based on current toggle state
    updateHelpButtonAppearance(helpButton, isAxiomsTab);

    // Add the help button to the container after all other buttons
    buttonContainer.appendChild(helpButton);
  }
}

// Function to update help button appearance based on toggle state
function updateHelpButtonAppearance(helpButton, isAxiomsTab) {
  const isToggled = isAxiomsTab ? helpButtonToggleState.axioms : helpButtonToggleState.allRules;

  if (isToggled) {
    // Active state - show as pressed/highlighted
    helpButton.style.backgroundColor = 'rgba(0, 97, 161, 0.2)';
    helpButton.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2)';
    helpButton.style.transform = 'scale(0.95)';
  } else {
    // Normal state
    helpButton.style.backgroundColor = 'transparent';
    helpButton.style.boxShadow = 'none';
    helpButton.style.transform = 'scale(1)';
  }
}

// Function to show only axioms that match the current formula
function showFilteredAxioms() {
  if (!side) return;

  try {
    const currentFormula = checkWithAntlr(side.querySelector('#proofText').textContent);
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

      axiomHandler.action(currentFormula, axiomButton);
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
    const index = Object.keys(ruleGentzenHandlers).indexOf(ruleName);
    if (allButtons[index]) shakeButton(allButtons[index]);
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

  // Очистка інтерфейсу
  document.getElementById('proof-menu').className = 'hidden';
  document.getElementById("tab1").checked = true;

  const labels = document.getElementById('proof').querySelectorAll('label');
  labels.forEach(label => {
    label.style.background = '';
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
      //вернутись бо не працює
      const result = formulaToString(getProof(proofElement), 0);
      let text = `${deductive.convertToLogicalExpression(getProof(deductive.checkWithAntlr(result)))}`;
      //Заміна всіх s0 на s(0)
      // text = text.replace(/s0/g, 's(0)');
      text = text.replace(/s\(0\)/g, 's0');
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
      // text = text.replace(/s0/g, 's(0)');
      text = text.replace(/s\(0\)/g, 's0');
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

  // Додаємо hover ефекти до нових proofText елементів
  addProofTextHoverEffects();

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
        // Reset All rules toggle state when switching to tab1
        helpButtonToggleState.allRules = false;
        processExpression(checkWithAntlr(oldUserInput), 1);
      // } else if (tabId === 'tab2') {
      //   if (typeProof === 1) {
      //     return;
      //   }
      //   // Reset toggle states when switching to recommended rules tab
      //   helpButtonToggleState.allRules = false;
      //   helpButtonToggleState.axioms = false;
      //   processExpression(checkWithAntlr(side.querySelector('#proofText').textContent), 0);
      } else if (tabId === 'tab3') {
        // Axioms tab - show Robinson Arithmetic axioms
        if (typeProof === 1) {
          return;
        }
        // Reset Axioms toggle state when switching to tab3
        helpButtonToggleState.axioms = false;
        // Format axioms for generateButtons
        const formattedAxioms = ROBINSON_AXIOMS.map((axiom, index) =>
          `${index + 1}. ${axiom}`
        );
        generateButtons(ROBINSON_AXIOMS.length, formattedAxioms);
      } else if (tabId === 'tab4') {
        // Reset toggle states when switching to tree view tab
        helpButtonToggleState.allRules = false;
        helpButtonToggleState.axioms = false;
        const buttonContainer = document.getElementById('button-container');
        buttonContainer.innerHTML = '';

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

