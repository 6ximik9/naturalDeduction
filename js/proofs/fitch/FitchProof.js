import * as editorMonaco from '../../ui/monacoEditor';
import * as deductive from "../../core/deductiveEngine";
import {currentLevel, deductionContext, lastSide, level, saveTree, side, state, userHypotheses} from "../gentzen/GentzenProof";
import {
  checkWithAntlr,
  convertToLogicalExpression,
  getProof
} from "../../core/deductiveEngine";
import * as rulesFitch from "./rulesFitch";
import * as controlState from "../../state/stateManager";
import {createTreeD3} from "../../ui/tree";
import {checkRule, shakeElement} from "../../index";
import {ninthRule, seventhRule} from "./rulesFitch";
import {addNextLastButtonClickFitch, saveStateFitch} from "../../state/stateManager";
import {latexFitch} from "../../ui/latexGen";
import {formulaToString} from "../../core/formatter";
import {ROBINSON_AXIOMS} from "../../core/robinsonAxiomValidator";
import {ORDER_AXIOMS} from "../../core/orderAxiomValidator";
import {t} from "../../core/i18n";
import { getActiveAxioms, logicSettings, isVL, isIntuitionistic } from '../../state/logicSettings';


let fitchProof = [];

export let fitchStates = 0;

let helpButtonToggleState = false;

export function setStateFitch(newValue) {
  fitchStates = newValue;
}

export let userHypothesesFitch;

export let clickedProofs = [];
export let clickedBranch = [];
export let branchIndex = 0;


export function setClickedProofs(newProof) {
  clickedProofs = newProof;
}

export function setClickedBranch(newProof) {
  clickedBranch = newProof;
}


export function setUserHypothesesFitch(newUserHypotheses) {
  userHypothesesFitch = newUserHypotheses;
}

export function setBranchIndex(newIndex) {
  branchIndex = newIndex;
}

export function addNewProof(proof) {
  fitchProof.push(proof);
}

export function fitchStart(formula) {
  let filteredArray = userHypothesesFitch.filter(item => item.trim().length > 0);
  // if(filteredArray.length===0)
  // {
  //   alert("Please enter the premises.")
  //   return;
  // }
  document.getElementById('enterFormula').className = 'hidden';
  // document.getElementById('undo_redo').style.display = 'flex'; // Removed legacy
  const proofFormula = convertToLogicalExpression(getProof(checkWithAntlr(formula)));
  document.getElementById('userText').textContent = proofFormula;
  addClickFitchRules();
  addNextLastButtonClickFitch();
  helpButtonToggleState = false;
  processExpression(checkWithAntlr(formula), 1);
  createDivs();
  if (document.getElementById('fitchHeader')) {
    document.getElementById('fitchHeader').textContent = proofFormula;
  }
  latexFitch();
  addOrRemoveParenthesesFitch();
  userHypothesesFitch = [...new Set(userHypothesesFitch)];
  addBranch(userHypothesesFitch, 'Premise');
  saveStateFitch();
}


export const FITCH_BUTTONS = [
    "Assumption"
    , "$$ \\begin{array}{c|ll} m & A \\\\ n & B \\\\  & A \\land B & (\\land I, m, n) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} n & A \\land B \\\\ & A & (\\land E, n) \\\\ & B & (\\land E, n) \\\\ \\end{array} $$"
    , "$$ \\begin{array}{c|ll} n & A \\\\  & A \\lor B & (\\lor I, n) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} m & A \\lor B \\\\ n & \\begin{array}{|c} A  \\\\ \\hline C  \\end{array}  \\\\ p & \\begin{array}{|c} B  \\\\ \\hline C  \\end{array}  \\\\ & C & (\\lor E, m, n, p) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} \\begin{array}{c} n \\\\ m \\end{array} &  \\quad\\begin{array}{|c} A  \\\\ B  \\end{array} \\\\ & A \\rightarrow B & (\\Rightarrow I, n, m) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} m & A \\rightarrow B \\\\ & A \\\\ \\hline& B & (\\Rightarrow E,m,n) \\end{array}$$"
    , "$$ \\begin{array}{c|ll} \\begin{array}{c} m \\\\ n \\end{array} &  \\quad\\begin{array}{|c} A  \\\\ \\perp  \\end{array} \\\\ & \\neg A & (\\neg I, m, n) \\end{array}\n $$"
    , "$$ \\begin{array}{c|ll} n & A \\\\ m & \\neg A \\\\  & \\perp & (\\neg E, n, m) \\end{array}$$"
    , "$$ \\begin{array}{c|ll} n & \\perp \\\\ & A  &   (\\perp E,n) \\end{array}$$"
    , "$$ \\begin{array}{c|ll} \\begin{array}{c} m \\\\ n \\end{array} &  \\quad\\begin{array}{|c} \\neg A  \\\\ \\perp  \\end{array} \\\\ & A & (C, m-n) \\end{array}\n $$"
    , "$$ \\begin{array}{c|ll} n & \\neg\\neg A \\\\ & A \\quad  (\\neg\\neg E,n) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} n & A \\\\ & A \\quad  (R,n) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} n & \\forall x A(x) \\\\ & A(c) & (\\forall E, n) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} n & \\begin{array}{|c} [c] \\\\ \\hline \\vdots \\\\ A(c) \\end{array} \\\\ & \\forall x A(x) & (\\forall I, n) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} n & A(c) \\\\ & \\exists x A(x) & (\\exists I, n) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} m & \\exists x A(x) \\\\ n & \\begin{array}{|c} [c] \\ A(c) \\\\ \\hline B \\end{array} \\\\ & B & (\\exists E, m, n) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} & c = c & (= I) \\end{array} $$"
    , "$$ \\begin{array}{c|ll} n & t_1 = t_2 \\\\ m & A(t_1) \\\\ & A(t_2) & (= E, n, m) \\end{array} $$"
  ];

export function processExpression(expression, countRules) {
  document.getElementById('proof-menu').className = 'proof-menu';

  const buttons = FITCH_BUTTONS;

  // Recommended Rules Logic
  let recommendedIndices = [];

  // Parse selected formulas
  const proofs = clickedProofs.map(p => {
    try {
      // Clone element to avoid modifying the DOM and to safely remove index span
      const clone = p.element.cloneNode(true);
      const indexSpan = clone.querySelector('.indexC');
      if (indexSpan) indexSpan.remove();

      const cleanText = clone.textContent.replaceAll(" ", "");
      return getProof(checkWithAntlr(cleanText));
    } catch (e) {
      console.warn("Error parsing selected proof:", e);
      return null;
    }
  }).filter(p => p !== null);

  if (clickedProofs.length === 1 && clickedBranch.length === 0) {
    const f = proofs[0];
    if (f) {
      // Context-specific
      if (f.type === 'conjunction') recommendedIndices.push(2); // AND E
      if (f.type === 'negation' && f.value && f.value.type === 'negation') recommendedIndices.push(11); // NOT NOT E
      if (f.type === 'forall' || (f.type === 'quantifier' && f.quantifier === '∀')) recommendedIndices.push(13); // Forall E

      const isBottom = f.value === '⊥' || f.name === '⊥' || f.type === 'bottom' || (f.type==='atom' && f.value==='⊥');
      if (isBottom) recommendedIndices.push(9); // Bottom E

      // Always valid with 1 premise
      recommendedIndices.push(3); // OR I
      recommendedIndices.push(12); // R
      recommendedIndices.push(15); // Exists I
      recommendedIndices.push(17); // = I (Global)
    }
  }
  else if (clickedProofs.length === 2 && clickedBranch.length === 0) {
    recommendedIndices.push(1); // AND I
    recommendedIndices.push(18); // = E

    if (proofs.length >= 2) {
      const f1 = proofs[0];
      const f2 = proofs[1];

      if (f1.type === 'implication' || f2.type === 'implication') recommendedIndices.push(6); // IMP E
      if (f1.type === 'negation' || f2.type === 'negation') recommendedIndices.push(8); // NOT E
    }
  }
  else if (clickedProofs.length === 1 && clickedBranch.length === 1) {
    const f = proofs[0];
    if (f && (f.type === 'exists' || (f.type === 'quantifier' && f.quantifier === '∃'))) recommendedIndices.push(16); // Exists E
  }
  else if (clickedProofs.length === 1 && clickedBranch.length === 2) {
    const f = proofs[0];
    if (f && f.type === 'disjunction') recommendedIndices.push(4); // OR E
  }
  else if (clickedProofs.length === 0 && clickedBranch.length === 1) {
    recommendedIndices.push(5); // IMP I
    recommendedIndices.push(7); // NOT I
    recommendedIndices.push(10); // C
    recommendedIndices.push(14); // Forall I
  }
  else if (clickedProofs.length === 0 && clickedBranch.length === 0) {
    recommendedIndices.push(0); // Assumption
    recommendedIndices.push(17); // = I
  }

  if (countRules === 1) {
    // Show all rules
    generateButtons(buttons.length, buttons, clickedProofs.length === 0 && clickedBranch.length === 0 ? recommendedIndices : false);
    return;
  }

  const recommendedButtons = [...new Set(recommendedIndices)].sort((a,b)=>a-b).map(i => buttons[i]);
  generateButtons(recommendedButtons.length, recommendedButtons);
}

function generateButtons(buttonCount, buttonTexts, disabled = false) {

  // const buttonContainer = document.getElementById('button-container');
  const buttonContainer = document.getElementById('button-container');
  buttonContainer.innerHTML = '';

  // Reset heights and styles that might be left over from Tree tab or Axioms tab
  buttonContainer.style.height = '';
  if (buttonContainer.parentElement) {
    buttonContainer.parentElement.style.height = '';
  }

  buttonContainer.style.position = 'relative';
  buttonContainer.style.minHeight = '150px';

  // Check if this is for axioms - use both tab state and content detection
  const tab3 = document.getElementById('tab3');
  let isAxiomsTab = (tab3 && tab3.checked) ||
                      (buttonTexts.length > 0 && buttonTexts.some(t => t.includes('∀x') && (t.includes('s(x)') || t.includes('<'))));

  // Race condition guard: if we have rules (which are many), it's probably not the axioms tab (which has few)
  // Or more simply, if we are calling this from a rule-generating context.
  if (buttonCount > 10 && buttonTexts === FITCH_BUTTONS) {
      isAxiomsTab = false;
  }

  if (branchIndex !== 0 && !isAxiomsTab) {
    let btn = createButton("Close assumption", () => closeAsp());
    btn.style.minHeight = '80px';
    if (disabled === true) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
    buttonContainer.appendChild(btn);
  }

  if (buttonCount === 0 && !isAxiomsTab && branchIndex === 0) {
    const msg = document.createElement('div');
    msg.textContent = "No rules available for this selection.";
    msg.style.cssText = "width: 100%; text-align: center; color: #666; padding: 20px; font-size: 18px;";
    buttonContainer.appendChild(msg);
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

  let showedRobinsonHeader = false;
  let showedOrderHeader = false;

  for (let i = 0; i < buttonCount; i++) {
    const text = buttonTexts[i];

    if (isIntuitionistic()) {
        if (text === FITCH_BUTTONS[10] || text === FITCH_BUTTONS[11]) {
            continue; // Hide RAA (C, m-n) and Double Negation (\neg\neg E)
        }
    }

    // Header for Robinson Arithmetic
    const isRobinsonAxiom = ROBINSON_AXIOMS.some(ax => text.includes(ax));
    if (isAxiomsTab && isRobinsonAxiom && !showedRobinsonHeader) {
      const header = document.createElement('h4');
      header.textContent = 'Robinson Arithmetic Axioms';
      header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 0 0 14px 0; color: var(--col-text-main); font-family: "Times New Roman", serif;';
      if (i > 0) header.style.marginTop = '20px';
      buttonContainer.appendChild(header);
      showedRobinsonHeader = true;
    }

    // Header for Linear Order
    const isOrderAxiom = ORDER_AXIOMS.some(ax => text.includes(ax));
    if (isAxiomsTab && isOrderAxiom && !showedOrderHeader) {
      const header = document.createElement('h4');
      header.textContent = 'Linear Order Axioms';
      header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 20px 0 14px 0; color: var(--col-text-main); font-family: "Times New Roman", serif;';
      if (!showedRobinsonHeader) header.style.marginTop = '0';
      buttonContainer.appendChild(header);
      showedOrderHeader = true;
    }

    let button = createButton(text, () => buttonClicked(text, button));

    // Tag quantifier and equality rules
    if (text.includes('\\forall') || text.includes('\\exists') || text.includes('c = c') || text.includes('t_1 = t_2')) {
      button.classList.add('quantifier-rule');
    }

    // If disabled is an array of allowed indices (when nothing is selected but we want to show everything)
    let isButtonDisabled = false;
    if (disabled === true) {
      isButtonDisabled = true;
    } else if (Array.isArray(disabled)) {
      // Find the index of this button in the FITCH_BUTTONS array
      const originalIndex = FITCH_BUTTONS.indexOf(text);
      if (!disabled.includes(originalIndex)) {
        isButtonDisabled = true;
      }
    }

    if (isButtonDisabled) {
      button.disabled = true;
      button.style.opacity = '0.5';
      button.style.cursor = 'not-allowed';
    }

    if (isAxiomsTab) {
       button.style.flex = 'none';
       button.style.width = '100%';
       button.style.maxWidth = 'none';
       button.style.minHeight = '60px';
    } else {
       // Prevent buttons from spanning 100% width when there are few rules shown
       button.style.flex = '0 1 auto';
    }

    buttonContainer.appendChild(button);
  }

  MathJax.typesetPromise().then(() => {
    // Код тут виконається після того, як MathJax закінчить форматування формул
  }).catch((err) => console.log('Помилка MathJax:', err));
}

export function toggleSmartMode() {
  // if (clickedProofs.length === 0 && clickedBranch.length === 0) {
  //   alert("Please select lines to get recommendations");
  //   return false;
  // }

  helpButtonToggleState = !helpButtonToggleState;

  if (helpButtonToggleState) {
    // Show Recommended Rules
    processExpression("HelpToggle", 0);
  } else {
    // Show All Rules
    processExpression("HelpToggle", 1);
  }
  return helpButtonToggleState;
}

function closeAsp() {
  clearItems();
  branchIndex--;
  const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
  fitchBranches[fitchBranches.length - 1].style.paddingBottom = '0px';
  fitchBranches[fitchBranches.length - 1].className += " finished";
  // helpButtonToggleState = false;
  processExpression("AllRules", helpButtonToggleState ? 0 : 1);
  saveStateFitch();
}

function createButton(text, clickHandler) {
  const button = document.createElement('button');
  button.className = 'button';
  button.innerHTML = text;
  button.style.fontSize = 22 + 'px';
  button.addEventListener('click', clickHandler);
  return button;
}

async function buttonClicked(buttonText, button) {

  if (buttonText === 'Assumption') {
    try {
      const inputText = await import('../../ui/modals/input').then(m => m.createInputModal("Assumption", "Enter the assumption formula:"));
      document.getElementById('proof-menu').className = 'proof-menu hidden';
      addBranch([inputText], 'Assumption');
      branchIndex++;
      clearItems();
      saveStateFitch();
    } catch (error) {
      console.log("Modal cancelled:", error);
    }
    return;
  }

  // Handle Axiom clicks
  const axiomMatch = buttonText.match(/^(\d+)\.\s(.+)$/);
  if (axiomMatch) {
    const axiomNumber = axiomMatch[1];
    const axiomText = axiomMatch[2];
    addRowToBranch(axiomText, `Axiom ${axiomNumber}`);
    clearItems();
    saveStateFitch();
    return;
  }

  const lastParentheses = deductive.extractTextBetweenParentheses(buttonText.toString());
  // console.log(lastParentheses);
  switch (lastParentheses) {
    case "\\land I, m, n":
      if (await rulesFitch.firstRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\land E, n":
      if (await rulesFitch.secondRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      document.getElementById('proof-menu').className = 'proof-menu hidden';
      // rulesFitch.secondRule(clickedProofs);
      break;
    case "\\lor I, n":
      if (await rulesFitch.thirdRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      // saveStateFitch();
      break;
    case "\\lor E, m, n, p":
      if (await rulesFitch.fourthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\Rightarrow I, n, m":
      if (await rulesFitch.fifthRule(clickedProofs, clickedBranch) !== 1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\Rightarrow E,m,n":
      if (await rulesFitch.sixthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\neg I, m, n":
      if (await rulesFitch.seventhRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\neg E, n, m":
      if (await rulesFitch.eighthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\perp E,n":
      if (await rulesFitch.ninthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "C, m-n":
      if (await rulesFitch.tenthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\neg\\neg E,n":
      if (await rulesFitch.eleventhRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "R,n":
      if (await rulesFitch.twelfthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\forall E, n":
      if (await rulesFitch.thirteenthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\forall I, n":
      if (await rulesFitch.fourteenthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\exists I, n":
      if (await rulesFitch.fifteenthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\exists E, m, n":
      if (await rulesFitch.sixteenthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "= I":
      if (await rulesFitch.seventeenthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "= E, n, m":
      if (await rulesFitch.eighteenthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
  }
  clearItems();
}

function shakeButton(button) {
  // const allButtons = document.querySelectorAll('#button-container button');
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

function createDivs() {
  // Знаходимо елемент з id 'proof'
  const proofDiv = document.getElementById('proof');
  proofDiv.innerHTML = '';

  // Створюємо заголовок для цільової формули
  const fitchHeader = document.createElement('div');
  fitchHeader.id = 'fitchHeader';
  proofDiv.appendChild(fitchHeader);

  // Створюємо головний div
  const outFitch = document.createElement('div');
  outFitch.id = 'out_fitch';

  // Створюємо три внутрішні div та встановлюємо їм відповідні id
  const outNums = document.createElement('div');
  outNums.id = 'out_nums';
  const outNodes = document.createElement('div');
  outNodes.id = 'out_nodes';
  const outJust = document.createElement('div');
  outJust.id = 'out_just';

  // Додаємо внутрішні div до головного div
  outFitch.appendChild(outNums);
  outFitch.appendChild(outNodes);
  outFitch.appendChild(outJust);

  // Додаємо головний div до 'proof' (який вже знайдено на початку функції)
  proofDiv.appendChild(outFitch);
}

function addBranch(formulas, title) {
  if (title !== "Assumption") {
    // Знаходимо div з id 'out_nodes', 'out_nums' та 'out_just'
    const outFitch = document.getElementById('out_nodes');
    const outJust = document.getElementById('out_just');

    // Створюємо новий div з класом 'fitch_branch'
    const fitchBranch = document.createElement('div');
    fitchBranch.className = 'fitch_branch';

    // Додаємо формули, номери та назви до відповідних div
    formulas.forEach((formula, index) => {
      // Створюємо div для формули
      const div = document.createElement('div');
      div.className = 'fitch_formula';
      div.textContent = deductive.convertToLogicalExpression(checkWithAntlr(formula));
      fitchProof.push({formula, title, branchIndex});
      fitchBranch.appendChild(div);
      // Створюємо div для назви
      const titleDiv = document.createElement('div');
      titleDiv.textContent = title; // Використання однієї і тієї ж назви для кожної формули
      outJust.appendChild(titleDiv);

      // Якщо це остання формула, додати стиль для нижньої рамки
      if (index === formulas.length - 1) {
        div.style.borderBottom = '1px solid black';
      }
    });

    // Додаємо 'fitch_branch' до 'out_fitch'
    outFitch.appendChild(fitchBranch);
  } else {
    const outJust = document.getElementById('out_just');

    const fitchBranch = document.createElement('div');
    fitchBranch.className = 'fitch_branch';

    const div = document.createElement('div');
    div.className = 'fitch_formula';
    div.style.display = 'flex';

    let formula = formulas[0];
    div.textContent = deductive.convertToLogicalExpression(getProof(checkWithAntlr(formula)));

    fitchBranch.appendChild(div);
    fitchProof.push({formula, title, branchIndex});

    // Створюємо div для назви
    const titleDiv = document.createElement('div');
    titleDiv.textContent = title; // Використання однієї і тієї ж назви для кожної формули
    outJust.appendChild(titleDiv);
    div.style.borderBottom = '1px solid black';

    const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
    const lastFitchBranch = fitchBranches[fitchBranches.length - 1];

    lastFitchBranch.appendChild(fitchBranch);
  }

  addNumberedDivs();
}

export function addNumberedDivs() {
  const outNums = document.getElementById('out_nums');
  outNums.innerHTML = '';
  const outJust = document.getElementById('out_just');
  const count = outJust.children.length;

  // Проходимось циклом від 1 до кінцевого індексу останнього елемента
  for (let i = 1; i <= count; i++) {
    // Створюємо новий div
    const numberDiv = document.createElement('div');
    numberDiv.textContent = i; // Додаємо ітераційний номер
    numberDiv.style.display = 'flex';
    numberDiv.style.alignItems = 'center'; // Центрує текст по вертикалі
    numberDiv.style.justifyContent = 'center'; // Центрує текст по горизонталі
    outNums.appendChild(numberDiv);
  }
}


document.getElementById('proof').addEventListener('click', function (event) {
  let clickedElement = event.target;
  if (!clickedElement) {
    return;
  }

  if (document.querySelector('.finished') || document.querySelector('div.fitch_formula[style*="success"]')) {
    return;
  }

  if (clickedElement.parentElement.className.includes("finished")) {

    clickedElement = clickedElement.parentElement;
    const allCloseFitchBranch = Array.from(document.querySelectorAll('.fitch_branch.finished'));
    // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
    const elementIndex = allCloseFitchBranch.indexOf(clickedElement);

    // Перевіряємо, чи вже є такий об'єкт у масиві clickedProofs
    const foundIndex = clickedBranch.findIndex(obj => obj.element === clickedElement);

    if (foundIndex === -1) {
      if (clickedBranch.length < 2) {
        clickedBranch.push({element: clickedElement, index: elementIndex});
        clickedElement.style.background = 'var(--col-highlight-secondary)';
      }
    } else {
      clickedBranch.splice(foundIndex, 1);
      clickedElement.style.background = '';

      const sbRules = document.getElementById('sb-rules');
      if (sbRules) sbRules.click();
    }

    return;
  }

  if (clickedElement.tagName === 'DIV' && clickedElement.className.includes("fitch_formula")) {
    // Отримуємо всі елементи з класом fitch_formula
    const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
    // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
    const elementIndex = allFitchFormulas.indexOf(clickedElement);

    // Перевіряємо, чи вже є такий об'єкт у масиві clickedProofs
    const foundIndex = clickedProofs.findIndex(obj => obj.element === clickedElement);

    if (foundIndex === -1) {
      if (clickedProofs.length < 2) {
        // Створюємо новий об'єкт з елементом та його індексом, і додаємо його до масиву
        clickedProofs.push({element: clickedElement, index: elementIndex});
        clickedElement.style.background = 'var(--col-highlight-main)';
        clickedElement.innerHTML += ' ' + `<span class="indexC" style="font-size: 22px;">${clickedProofs.length}</span>`;
      }
    } else {
      // Видаляємо елемент з масиву clickedProofs
      clickedProofs.splice(foundIndex, 1);
      clickedElement.style.background = '';
      let spanElement = clickedElement.querySelector('.indexC');
      if (spanElement) {
        spanElement.remove();
      }

      // Update indices for remaining selected elements
      clickedProofs.forEach((obj, idx) => {
        let remainingSpan = obj.element.querySelector('.indexC');
        if (remainingSpan) {
          remainingSpan.textContent = idx + 1;
        }
      });
    }

    if (window.updateFitchParenthesesButtons) {
        window.updateFitchParenthesesButtons();
    }

    const sbRules = document.getElementById('sb-rules');
    if (sbRules) sbRules.click();

    const radioInput = document.getElementById('tab1');
    if (radioInput) radioInput.checked = true;
    processExpression("AllRules", helpButtonToggleState ? 0 : 1);
  }
});


function addClickFitchRules() {
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  tabTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      const tabId = this.getAttribute('for');
      
      // Use setTimeout to ensure radio button state is updated before we check it
      setTimeout(() => {
        if (tabId === 'tab1') {
          // helpButtonToggleState = false;
          processExpression("AllRules", helpButtonToggleState ? 0 : 1);
        } else if (tabId === 'tab4') {
          if (clickedProofs.length !== 1) {
            event.preventDefault(); // Prevent tab switch
            alert(t("alert-select-formula"));
            // Ensure we stay on tab1 (or revert to it)
            const radioInput = document.getElementById('tab1');
            if (radioInput) radioInput.checked = true;
            return;
          }
          const buttonContainer = document.getElementById('button-container');
          buttonContainer.innerHTML = '';
          
          // Reset button-container styles and prepare for tree view
          buttonContainer.style.display = 'block'; 
          buttonContainer.style.gridTemplateColumns = '';
          buttonContainer.style.gap = '';
          buttonContainer.style.padding = '';
          buttonContainer.style.justifyItems = '';
          buttonContainer.style.position = 'relative';
          buttonContainer.style.height = "100%";
          buttonContainer.style.width = "100%";
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

          const spanElement = clickedProofs[0].element.querySelector('span.indexC');
          if (spanElement) spanElement.remove();

          createTreeD3(getProof(checkWithAntlr(clickedProofs[0].element.textContent)));

          if (spanElement) clickedProofs[0].element.appendChild(spanElement);
        } else if (tabId === 'tab3') {
          // helpButtonToggleState = false;
          // Format axioms for generateButtons
          const formattedAxioms = getActiveAxioms(ROBINSON_AXIOMS, ORDER_AXIOMS);
          // Axioms should always be available in Fitch mode
          generateButtons(formattedAxioms.length, formattedAxioms, false);
        }
      }, 0);
    });
  });
}

export function addRowToBranch(formula, title) {
  const div = document.createElement('div');
  div.className = 'fitch_formula';
  div.textContent = formulaToString(getProof(checkWithAntlr(formula)), 0);
  // div.textContent = getProof(checkWithAntlr(formula));

  const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
  let par = fitchBranches[fitchBranches.length - 1];

  par.appendChild(div);

  const titleDiv = document.createElement('div');
  titleDiv.textContent = title;
  document.getElementById('out_just').appendChild(titleDiv);

  addNumberedDivs();

  try {
    let mainBranch = document.querySelectorAll('.fitch_branch')[0];
    let lastElement = mainBranch.children[mainBranch.children.length - 1];
    let lastFormula = formulaToString(getProof(checkWithAntlr(lastElement.textContent)), 1);
    let startFormula = formulaToString(getProof(checkWithAntlr(document.getElementById('userText').textContent)), 0);

    if (deductive.compareExpressions(getProof(checkWithAntlr(lastFormula)), getProof(checkWithAntlr(startFormula)))) {
      document.getElementById('proof-menu').className = 'proof-menu hidden';
      lastElement.style.background = 'var(--col-highlight-success)';
      mainBranch.className += " finished";
      mainBranch.style.paddingBottom = '0px';
    }
  } catch (error) {
    console.warn("Error checking proof completion:", error);
  }
}


export function clearItems() {
  clickedProofs.forEach(function (item) {
    item.element.style.backgroundColor = '';
    const spanElement = item.element.querySelector('span.indexC');

    if (spanElement) {
      spanElement.remove();
    }
  });
  clickedProofs = [];

  clickedBranch.forEach(function (item) {
    item.element.style.backgroundColor = '';
    const spanElement = item.element.querySelector('span.indexC');

    if (spanElement) {
      spanElement.remove();
    }
  });
  clickedBranch = [];

  if (window.updateFitchParenthesesButtons) {
      window.updateFitchParenthesesButtons();
  }

  // Refresh button state (will disable buttons since selection is empty)
  // We use 1 to indicate "All Rules" mode, but the empty selection check inside processExpression
  // will ensure buttons are generated in disabled state regardless.
  // Exception: If we are in "Axioms" tab (tab3), we should respect that, but processExpression
  // currently defaults to generating standard buttons.
  // However, since we are clearing items, likely we want to reset to a neutral state.
  // The user can switch tabs if needed.
  // Note: If the user is on the Axioms tab, this might switch the view to "All Rules".
  // To avoid this, we could check the active tab.
  const isAxiomsTab = document.getElementById('tab3') && document.getElementById('tab3').checked;

  if (isAxiomsTab) {
      // Re-trigger the tab click logic for Axioms to refresh (and keep them enabled)
      const formattedAxioms = getActiveAxioms(ROBINSON_AXIOMS, ORDER_AXIOMS);
      generateButtons(formattedAxioms.length, formattedAxioms, false);
  } else {
      processExpression("AllRules", 1);
  }
}



function addOrRemoveParenthesesFitch() {
  const addBtn = document.getElementById('sb-show-parens') || document.getElementById('addParentheses');
  const delBtn = document.getElementById('sb-hide-parens') || document.getElementById('deleteParentheses');
  const retBtn = document.getElementById('sb-original') || document.getElementById('returnUserInput');

  if (!addBtn || !delBtn || !retBtn) return;

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

  function updateButtons(clickedBtn) {
    // Check if anything is selected
    if (!clickedProofs || clickedProofs.length === 0) {
       [addBtn, delBtn, retBtn].forEach(btn => toggleButtonState(btn, false));
       return;
    }

    // Enable all first
    [addBtn, delBtn, retBtn].forEach(btn => { if(btn) toggleButtonState(btn, true); });

    // Disable the active one if specified, otherwise default to Original (retBtn)
    if (clickedBtn) {
        toggleButtonState(clickedBtn, false);
    } else {
        toggleButtonState(retBtn, false);
    }
  }

  // Export this function to be called when selection changes
  window.updateFitchParenthesesButtons = updateButtons;

  addBtn.addEventListener('click', function (e) {
    if (e) e.preventDefault();
    if (!clickedProofs || clickedProofs.length === 0) return;

    clickedProofs.forEach(function (item) {
      const spanElement = item.element.querySelector('span.indexC');
      if (spanElement) spanElement.remove();

      if (!item.element.dataset.original) {
        item.element.dataset.original = item.element.textContent;
      }

      const expression = checkWithAntlr(item.element.textContent);
      item.element.textContent = formulaToString(getProof(expression), 1);

      if (spanElement) item.element.appendChild(spanElement);
    });
    updateButtons(addBtn);
  });

  delBtn.addEventListener('click', function (e) {
    if (e) e.preventDefault();
    if (!clickedProofs || clickedProofs.length === 0) return;

    clickedProofs.forEach(function (item) {
      const spanElement = item.element.querySelector('span.indexC');
      if (spanElement) spanElement.remove();

      if (!item.element.dataset.original) {
        item.element.dataset.original = item.element.textContent;
      }

      const expression = checkWithAntlr(item.element.textContent);
      item.element.textContent = formulaToString(getProof(expression), 0);

      if (spanElement) item.element.appendChild(spanElement);
    });
    updateButtons(delBtn);
  });

  retBtn.addEventListener('click', function (e) {
    if (e) e.preventDefault();
    if (!clickedProofs || clickedProofs.length === 0) return;

    clickedProofs.forEach(function (item) {
       const spanElement = item.element.querySelector('span.indexC');
       if (spanElement) spanElement.remove();

       if (item.element.dataset.original) {
           item.element.textContent = item.element.dataset.original;
       }

       if (spanElement) item.element.appendChild(spanElement);
    });
    updateButtons(retBtn);
  });
}
