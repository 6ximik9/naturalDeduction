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


export function processExpression(expression, countRules) {
  document.getElementById('proof-menu').className = 'proof-menu';

  const buttons = [
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

  if (countRules === 1) {
    generateButtons(19, buttons);
    return;
  }

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

  const recommendedButtons = [...new Set(recommendedIndices)].sort((a,b)=>a-b).map(i => buttons[i]);
  generateButtons(recommendedButtons.length, recommendedButtons);
}

function generateButtons(buttonCount, buttonTexts) {

  // const buttonContainer = document.getElementById('button-container');
  const buttonContainer = document.getElementById('button-container');
  buttonContainer.innerHTML = '';
  buttonContainer.style.position = 'relative';
  buttonContainer.style.minHeight = '150px';

  // Check if this is for axioms - detection by text format
  const isAxiomsTab = buttonTexts.length > 0 &&
                      buttonTexts.length === (ROBINSON_AXIOMS.length + ORDER_AXIOMS.length) &&
                      buttonTexts.every((text, index) => text.startsWith(`${index + 1}. `));

  if (branchIndex !== 0 && !isAxiomsTab) {
    let btn = createButton("Close assumption", () => closeAsp());
    btn.style.minHeight = '80px';
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

    // Add header
    const header = document.createElement('h4');
    header.textContent = 'Robinson Arithmetic Axioms';
    header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 0 0 14px 0; color: #333; font-family: "Times New Roman", serif;';
    buttonContainer.appendChild(header);
  } else {
    // Reset styling for regular rules
    buttonContainer.style.display = '';
    buttonContainer.style.gridTemplateColumns = '';
    buttonContainer.style.gap = '';
    buttonContainer.style.padding = '';
  }

  for (let i = 0; i < buttonCount; i++) {
    if (isAxiomsTab && i === ROBINSON_AXIOMS.length) {
      const header = document.createElement('h4');
      header.textContent = 'Linear Order Axioms';
      header.style.cssText = 'grid-column: 1 / -1; text-align: center; margin: 20px 0 14px 0; color: #333; font-family: "Times New Roman", serif;';
      buttonContainer.appendChild(header);
    }
    let button = createButton(buttonTexts[i], () => buttonClicked(buttonTexts[i], button));

    if (isAxiomsTab) {
       button.style.flex = 'none';
       button.style.width = '100%';
       button.style.maxWidth = 'none';
       button.style.minHeight = '60px';
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
    document.getElementById('proof-menu').className = 'proof-menu hidden';
    addBranch(['test'], 'Assumption');
    branchIndex++;
    clearItems();
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


let enterText = document.getElementById('editorPanel');


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
    div.className = 'userFormula';

    editorMonaco.clearEditorErrors();
    editorMonaco.editor.setValue('');
    checkRule(1, editorMonaco.editor.getValue());
    editorMonaco.editor.updateOptions({fontSize: 28})

    // Check if enterText element exists before accessing its style
    if (enterText) {
      enterText.style.width = '300px';
      enterText.style.height = '50px';
    }

    // Створюємо кнопку
    let button = document.createElement('button');
    button.classList.add('buttonWithIcon');
    button.style.background = 'rgb(255, 255, 255)';
    button.style.color = 'rgb(33, 33, 33)';
    button.style.boxShadow = 'rgba(0, 0, 0, 0.25) 0px 2px 5px 0px';
    button.style.fontSize = '28px';
    button.style.marginLeft = '20px';
    button.style.marginTop = '15px';
    button.style.height = '50px';
    button.id = 'saveBtn';

    button.innerHTML = `<span class="buttonText">Save</span>`;

    button.addEventListener('click', saveAsp);


    // Only append enterText if it exists
    if (enterText) {
      div.appendChild(enterText);
    }
    div.appendChild(button);

    fitchBranch.appendChild(div);
    let formula = formulas[0];
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

editorMonaco.editor.onKeyDown(function (e) {
  // console.log(document.getElementsByClassName('userFormula'));
  if (e.keyCode === monaco.KeyCode.Enter && document.getElementsByClassName('userFormula').length>0) {
    e.preventDefault();
  }
});

function saveAsp() {
  if (checkRule(0, editorMonaco.editor.getValue()) === 1) {
    shakeElement('saveBtn', 5);
    return;
  }

  let inp = editorMonaco.editor.getValue();
  const fitchBranchElements = document.querySelectorAll('.fitch_branch');
  let par = fitchBranchElements[fitchBranchElements.length - 1];
  par.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'fitch_formula';
  div.style.display = 'flex';
  div.textContent = convertToLogicalExpression(getProof(checkWithAntlr(inp)));
  div.style.borderBottom = '1px solid black';
  par.appendChild(div);
  // helpButtonToggleState = false;
  processExpression("AllRules", helpButtonToggleState ? 0 : 1);
  saveStateFitch();
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

  if (document.querySelector('div.fitch_formula[style="background: rgba(0, 255, 0, 0.55);"]')) {
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
        clickedElement.style.background = 'rgba(72, 187, 244, 0.78)';
      }
    } else {
      clickedBranch.splice(foundIndex, 1);
      clickedElement.style.background = '';
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
        clickedElement.style.background = 'rgba(136,190,213,0.78)';
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
    }


    const radioInput = document.getElementById('tab1');
    radioInput.checked = true;
    processExpression("AllRules", helpButtonToggleState ? 0 : 1);
  }
});


function addClickFitchRules() {
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  tabTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      const tabId = this.getAttribute('for');
      if (tabId === 'tab1') {
        // helpButtonToggleState = false;
        processExpression("AllRules", helpButtonToggleState ? 0 : 1);
      } else if (tabId === 'tab4') {
        if (clickedProofs.length !== 1) {
          event.preventDefault(); // Prevent tab switch
          alert("Please select one line with the formula");
          // Ensure we stay on tab1 (or revert to it)
          const radioInput = document.getElementById('tab1');
          if (radioInput) radioInput.checked = true;
          return;
        }
        const buttonContainer = document.getElementById('button-container');
        buttonContainer.innerHTML = '';
        buttonContainer.style.display = ''; // Reset display style
        buttonContainer.style.gridTemplateColumns = ''; // Reset grid columns
        buttonContainer.style.padding = ''; // Reset padding

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

        const spanElement = clickedProofs[0].element.querySelector('span.indexC');
        if (spanElement) spanElement.remove();

        let size = createTreeD3(getProof(checkWithAntlr(clickedProofs[0].element.textContent)));

        if (spanElement) clickedProofs[0].element.appendChild(spanElement);

        svgElement.setAttribute("width", (Math.max(1000, size[0] + 50)).toString());
        svgElement.setAttribute("height", (size[1] + 100).toString());
      } else if (tabId === 'tab3') {
        // helpButtonToggleState = false;
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
      lastElement.style.background = 'rgba(0, 255, 0, 0.55)';
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

}



function addOrRemoveParenthesesFitch() {
  const addBtn = document.getElementById('sb-show-parens') || document.getElementById('addParentheses');
  const delBtn = document.getElementById('sb-hide-parens') || document.getElementById('deleteParentheses');
  const retBtn = document.getElementById('sb-original') || document.getElementById('returnUserInput');

  if (!addBtn || !delBtn || !retBtn) return;

  // Set initial state
  toggleButtonState(retBtn, false);

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

  function updateButtons(clickedBtn) {
    [addBtn, delBtn, retBtn].forEach(btn => toggleButtonState(btn, true));
    if (clickedBtn) toggleButtonState(clickedBtn, false);
  }

  addBtn.addEventListener('click', function (e) {
    e.preventDefault();
    clickedProofs.forEach(function (item) {
      const spanElement = item.element.querySelector('span.indexC');
      if (spanElement) spanElement.remove();

      // Store original text if not already stored
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
    e.preventDefault();
    clickedProofs.forEach(function (item) {
      const spanElement = item.element.querySelector('span.indexC');
      if (spanElement) spanElement.remove();

      // Store original text if not already stored
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
    e.preventDefault();
    let anyRestored = false;
    clickedProofs.forEach(function (item) {
      if (item.element.dataset.original) {
        const spanElement = item.element.querySelector('span.indexC');
        if (spanElement) spanElement.remove();

        item.element.textContent = item.element.dataset.original;

        // Remove the stored original as we are back to it
        delete item.element.dataset.original;

        if (spanElement) item.element.appendChild(spanElement);
        anyRestored = true;
      }
    });

    if (anyRestored) {
        updateButtons(retBtn);
    }
  });

}





