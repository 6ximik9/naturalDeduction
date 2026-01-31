import * as editorMonaco from './monacoEditor';
import * as deductive from "./deductiveEngine";
import {currentLevel, deductionContext, lastSide, level, saveTree, side, state, userHypotheses} from "./GentzenProof";
import {
  checkWithAntlr,
  convertToLogicalExpression,
  getProof
} from "./deductiveEngine";
import * as rulesFitch from "./rulesFitch";
import * as controlState from "./states";
import {createTreeD3} from "./tree";
import {checkRule, shakeElement} from "./index";
import {ninthRule, seventhRule} from "./rulesFitch";
import {addNextLastButtonClickFitch, saveStateFitch} from "./states";
import {latexFitch} from "./latexGen";
import {formulaToString} from "./formatter";


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
  if(filteredArray.length===0)
  {
    alert("Please enter the premises.")
    return;
  }
  document.getElementById('enterFormula').className = 'hidden';
  document.getElementById('undo_redo').style.display = 'flex';
  document.getElementById('inputFitch').style.display = 'flex';
  document.getElementById('returnUserInput').remove();
  document.getElementById('userText').textContent = convertToLogicalExpression(getProof(checkWithAntlr(formula)));
  addClickFitchRules();
  addNextLastButtonClickFitch();
  helpButtonToggleState = false;
  processExpression(checkWithAntlr(formula), 1);
  createDivs();
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
    , "$$ \\begin{array}{c|ll} n & A \\\\ & A \\quad  (R,n) \\end{array} $$"];
  if (countRules === 1) {
    generateButtons(13, buttons);
    return;
  }

  if (clickedProofs.length === 1 && clickedBranch.length === 0) {
    generateButtons(4, [buttons[2], buttons[3], buttons[11], buttons[12]]);
  } else if (clickedProofs.length === 2 && clickedBranch.length === 0) {
    generateButtons(3, [buttons[1], buttons[6], buttons[8]]);
  } else if (clickedProofs.length === 0 && clickedBranch.length === 0) {
    generateButtons(0, buttons);
  } else if (clickedProofs.length === 1 && clickedBranch.length === 2) {
    generateButtons(1, [buttons[4]]);
  } else if (clickedBranch.length === 1 && clickedProofs.length === 0) {
    generateButtons(3, [buttons[5], buttons[7], buttons[10]]);
  }


}

function generateButtons(buttonCount, buttonTexts) {

  // const buttonContainer = document.getElementById('button-container');
  const buttonContainer = document.getElementById('button-container');
  buttonContainer.innerHTML = '';
  buttonContainer.style.position = 'relative';

  if (branchIndex !== 0) {
    let btn = createButton("Close assumption", () => closeAsp());
    btn.style.minHeight = '80px';
    buttonContainer.appendChild(btn);
  }

  for (let i = 0; i < buttonCount; i++) {
    let button = createButton(buttonTexts[i], () => buttonClicked(buttonTexts[i], button));
    buttonContainer.appendChild(button);
  }

  MathJax.typesetPromise().then(() => {
    // Код тут виконається після того, як MathJax закінчить форматування формул
  }).catch((err) => console.log('Помилка MathJax:', err));

  // Help Button Logic
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

  helpButton.onmouseenter = () => {
    if (!helpButtonToggleState) {
      helpButton.style.backgroundColor = 'rgba(0, 97, 161, 0.1)';
    }
  };
  helpButton.onmouseleave = () => {
    updateHelpButtonAppearance(helpButton);
  };

  helpButton.onclick = () => {
    // Check if any lines are selected before enabling recommendations
    if (!helpButtonToggleState && clickedProofs.length === 0 && clickedBranch.length === 0) {
      alert("Please select lines to get recommendations");
      return;
    }

    helpButtonToggleState = !helpButtonToggleState;
    console.log(`Help button toggle: ${helpButtonToggleState ? 'ON' : 'OFF'}`);

    if (helpButtonToggleState) {
      // Show Recommended Rules
      processExpression("HelpToggle", 0);
    } else {
      // Show All Rules
      processExpression("HelpToggle", 1);
    }
  };

  updateHelpButtonAppearance(helpButton);
  buttonContainer.appendChild(helpButton);

}

function updateHelpButtonAppearance(helpButton) {
  if (helpButtonToggleState) {
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

function closeAsp() {
  clearItems();
  branchIndex--;
  const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
  fitchBranches[fitchBranches.length - 1].style.paddingBottom = '0px';
  fitchBranches[fitchBranches.length - 1].className += " finished";
  helpButtonToggleState = false;
  processExpression("AllRules", 1);
}

function createButton(text, clickHandler) {
  const button = document.createElement('button');
  button.className = 'button';
  button.innerHTML = text;
  button.style.fontSize = 22 + 'px';
  button.addEventListener('click', clickHandler);
  return button;
}

function buttonClicked(buttonText, button) {

  if (buttonText === 'Assumption') {
    document.getElementById('proof-menu').className = 'proof-menu hidden';
    addBranch(['test'], 'Assumption');
    branchIndex++;
    clearItems();
    return;
  }

  const lastParentheses = deductive.extractTextBetweenParentheses(buttonText.toString());
  // console.log(lastParentheses);
  switch (lastParentheses) {
    case "\\land I, m, n":
      if (rulesFitch.firstRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\land E, n":
      if (rulesFitch.secondRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      document.getElementById('proof-menu').className = 'proof-menu hidden';
      // rulesFitch.secondRule(clickedProofs);
      break;
    case "\\lor I, n":
      if (rulesFitch.thirdRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      // saveStateFitch();
      break;
    case "\\lor E, m, n, p":
      if (rulesFitch.fourthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\Rightarrow I, n, m":
      if (rulesFitch.fifthRule(clickedProofs, clickedBranch) !== 1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\Rightarrow E,m,n":
      if (rulesFitch.sixthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\neg I, m, n":
      if (rulesFitch.seventhRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\neg E, n, m":
      if (rulesFitch.eighthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\perp E,n":
      if (rulesFitch.ninthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "C, m-n":
      if (rulesFitch.tenthRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "\\neg\\neg E,n":
      if (rulesFitch.eleventhRule(clickedProofs, clickedBranch) === -1) {
        clearItems();
        shakeButton(button);
        return;
      }
      clearItems();
      saveStateFitch();
      break;
    case "R,n":
      if (rulesFitch.twelfthRule(clickedProofs, clickedBranch) === -1) {
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

  // Знаходимо елемент з id 'proof' та додаємо до нього головний div
  const proofDiv = document.getElementById('proof');
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
  helpButtonToggleState = false;
  processExpression("AllRules", 1);
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
        helpButtonToggleState = false;
        processExpression("AllRules", 1);
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
        // Axioms tab placeholder - currently empty for Fitch
        const buttonContainer = document.getElementById('button-container');
        buttonContainer.innerHTML = '';
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


let clonedArray = [];

function addOrRemoveParenthesesFitch() {
  document.getElementById('addParentheses').addEventListener('click', function () {
    clickedProofs.forEach(function (item) {
      const spanElement = item.element.querySelector('span.indexC');
      item.element.querySelector('span.indexC').remove();
      if (clonedArray.length !== 2) {
        clonedArray.push(item.element.textContent);
      }
      item.element.textContent = formulaToString(getProof(checkWithAntlr(item.element.textContent)), 1);

      item.element.appendChild(spanElement);
    });
  });

  document.getElementById('deleteParentheses').addEventListener('click', function () {
    clickedProofs.forEach(function (item) {

      const spanElement = item.element.querySelector('span.indexC');
      item.element.querySelector('span.indexC').remove();

      if (clonedArray.length !== 2) {
        clonedArray.push(item.element.textContent);
      }
      item.element.textContent = formulaToString(getProof(checkWithAntlr(item.element.textContent)), 0);

      item.element.appendChild(spanElement);
    });
    // console.log(clonedArray);
  });

  // document.getElementById('returnUserInput').addEventListener('click', function () {
  //   if (clonedArray.length === 0) {
  //     return;
  //   }
  //   clickedProofs.forEach(function (item, index) {
  //     const spanElement = item.element.querySelector('span.indexC');
  //     item.element.querySelector('span.indexC').remove();
  //
  //     item.element.textContent = clonedArray[index];
  //     item.element.appendChild(spanElement);
  //   });
  // });

}





