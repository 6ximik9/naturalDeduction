import {CharStreams, CommonTokenStream, ParseTreeWalker} from 'antlr4';
import GrammarLexer from '../my_antlr/GrammarLexer';
import GrammarParser from '../my_antlr/GrammarParser';
import MyGrammarListener from '../my_antlr/MyGrammarListener';
import * as editorMonaco from './monacoEditor';
import * as deductive from './deductiveEngine';
import * as controlState from './states';
import * as rules from './rulesGentzen';
import {checkWithAntlr, getProof} from "./deductiveEngine";
import {checkRule, typeProof} from "./index";
import {shakeElement} from "./index";
import {createTreeD3} from "./tree";
import {addNextLastButtonClick, addNextLastButtonClickGentzen} from "./states";
import {latexGentzen} from "./latexGen";

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

let hasError = false;


export let state = 0;

let nameRule;

let oldUserInput = "";

export function setState(newValue) {
  state = newValue;
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

// Додаємо обробник події кліку до body (можна вибрати інший контейнер)
document.getElementById('proof').addEventListener('click', function (event) {
  if (typeProof === 1) {
    return;
  }

  const clickedElement = event.target;

  if (clickedElement.className === "previous") {
    return;
  }

  const container = document.getElementById('proof');
  const labels = container.querySelectorAll('label');
  labels.forEach(label => {
    label.style.background = '';
  });

  if (clickedElement.tagName === 'DIV') {
    side = clickedElement;
    side.querySelector('label').style.background = 'rgba(136,190,213,0.78)';
  } else if (clickedElement.tagName === 'LABEL') {

    side = clickedElement.parentNode;
    clickedElement.style.background = 'rgba(136,190,213,0.78)';
  }


  let elements = document.getElementsByClassName("preview");
  if (elements.length <= 0) {
    setTimeout(() => {
      handleClick();
    }, 100);
  }

  const radioInput = document.getElementById('tab1');
  radioInput.checked = true;


});


function handleClick() {
  if (!side) {
    return;
  }

  if (!side.querySelector('.preview') && side.className !== "closed") {
    // oldUserInput = "";
    try {
      //   if(oldUserInput==="") {
      oldUserInput = side.querySelector('#proofText').textContent;
      // }
      processExpression(deductive.checkWithAntlr(side.querySelector('#proofText').textContent), 1);
      showAllHyp();
    } catch (error) {
      console.error('Close or previous');
    }
  }

}

export function parseExpression(text) {
  if (hasError || text === null || text.length === 0) {
    shakeElement('enter', 5);
    return;
  }

  document.getElementById('enterFormula').className = 'hidden';
  addClickGentzenRules();
  addNextLastButtonClickGentzen();
  latexGentzen();
  addOrRemoveParenthesesGentzen();
  let chars = CharStreams.fromString(text);
  let lexer = new GrammarLexer(chars);
  let tokens = new CommonTokenStream(lexer);
  let parser = new GrammarParser(tokens);
  let tree = parser.implication();

  const listener = new MyGrammarListener(); // Викликати конструктор вашого Лісенера
  ParseTreeWalker.DEFAULT.walk(listener, tree);

  // deductionContext.conclusions[0] = listener.stack.pop();

  deductionContext.conclusions[0] = {
    level: level++,  // Додаємо поле level
    proof: listener.stack.pop()
  };

  createProofTree(deductionContext.conclusions[0], document.getElementById('proof'));

  side = document.querySelector('.proof-element_level-0').children[0];
  // side = parentElement.querySelector('[class^="divItem-"]');
  oldUserInput = side.querySelector('#proofText').textContent;

  controlState.saveState();
  // side = document.get
  processExpression(deductionContext.conclusions[0].proof, 1);
  document.getElementById('undo_redo').style.display = 'flex';


  showAllHyp();
}

export function processExpression(expression, countRules) {
  document.getElementById('proof-menu').className = 'proof-menu';
  const buttons = ["$$\\frac{\\bot}{\\phi} \\quad (\\bot E1) $$"
    // , "$$\\frac{\\bot}{\\phi} \\quad \\ldots [\\neg\\phi] (\\bot E2) $$"
    , "$${\\frac{[\\neg\\phi]}{\\vdots} \\atop \\frac{\\bot}{\\phi}} (\\bot E2) $$"
    , "$$\\frac{}{\\top} \\quad (\\top I) $$"
    // , "$$\\frac{\\bot}{\\neg \\phi} \\quad \\ldots [\\phi] (\\neg I) $$"
    , "$${\\frac{[\\phi]}{\\vdots} \\atop \\frac{\\bot}{\\neg\\phi}} (\\neg I) $$"
    , "$$ \\frac{\\phi \\quad \\quad \\neg \\phi }{\\bot} \\quad (\\neg E)  $$"
    , "$$\\frac{\\phi \\quad \\quad \\psi}{\\phi \\wedge \\psi} (\\wedge I)$$"
    , "$$\\frac{\\phi \\wedge \\psi}{\\phi} (\\wedge E1)$$"
    , "$$\\frac{\\phi \\wedge \\psi}{\\psi} (\\wedge E2)$$"
    , "$$\\frac{\\phi}{\\phi \\vee \\psi} (\\vee I1)$$"
    , "$$ \\frac{\\psi}{\\phi \\vee \\psi} (\\vee I2) $$"
    , "$$ \\frac{\\phi \\vee \\psi \\quad \\quad \\theta \\quad \\quad \\theta}{ \\theta} (\\vee E) $$"
    , "$$\\frac{\\psi}{\\phi \\Rightarrow \\psi} (\\Rightarrow I)$$"
    , "$$ \\frac{\\phi \\quad \\quad \\phi \\Rightarrow \\psi }{\\psi}  (\\Rightarrow E) $$"];
  if (countRules === 1) {
    generateButtons(13, buttons);
    return;
  }

  expression = deductive.getProof(expression);
  switch (expression.type) {
    case "atom":
      if (expression.value === '⊤') {
        generateButtons(1, [buttons[2]]);
      } else if (expression.value === '⊥') {
        generateButtons(1, [buttons[4]]);
      } else {
        generateButtons(6, [buttons[0], buttons[1], buttons[6], buttons[7], buttons[10], buttons[12]]);
      }
      break;
    case "implication":
      generateButtons(7, [buttons[0], buttons[1], buttons[6], buttons[7], buttons[10], buttons[11]
        , buttons[12]]);
      break;
    case "conjunction":
      generateButtons(7, [buttons[0], buttons[1], buttons[5], buttons[6], buttons[7], buttons[10], buttons[12]]);
      break;
    case "disjunction":
      generateButtons(8, [buttons[0], buttons[1], buttons[6], buttons[7], buttons[8], buttons[9], buttons[10], buttons[12]]);
      break;
    case "negation":
      generateButtons(1, [buttons[3]]);
      break;
  }
}

// Функція для генерації кнопок
function generateButtons(buttonCount, buttonTexts) {
  // const buttonContainer = document.getElementById('button-container');
  const buttonContainer = document.getElementById('button-container');
  buttonContainer.innerHTML = '';

  for (let i = 0; i < buttonCount; i++) {
    let button = createButton(buttonTexts[i], () => buttonClicked(buttonTexts[i]));
    buttonContainer.appendChild(button);
  }

  MathJax.typesetPromise().then(() => {
    // Код тут виконається після того, як MathJax закінчить форматування формул
  }).catch((err) => console.log('Помилка MathJax:', err));

  let hypothesesAll = deductive.getAllHypotheses(side);
  let find = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);

  let isElementInArray = hypothesesAll.find(function (item) {
    item = deductive.getProof(item);
    find = deductive.getProof(find);
    // return JSON.stringify(deductive.getProof(item)) === JSON.stringify(deductive.getProof(find));
    return deductive.compareExpressions(item, find);
  });

  if (isElementInArray) {
    let btn = createButton("Close branch", () => closeSide(side));
    btn.style.minHeight = '80px';
    buttonContainer.appendChild(btn);
  }

}

// Функція для створення кнопки з обробником події
function createButton(text, clickHandler) {
  const button = document.createElement('button');
  button.className = 'button';
  button.innerHTML = text;
  button.addEventListener('click', clickHandler);
  return button;
}

function closeSide(container) {
  container.className = 'closed';
  container.innerHTML = '<label class = "previous" id="proofText">' + '[' + container.textContent + ']' + '</label>';
  document.getElementById('proof-menu').className = 'hidden';
  controlState.saveState();
  document.getElementById('currentHypotheses').style.display = 'none';
  document.getElementById('currentLabelHypotheses').style.display = 'none';
}


// Функція для обробки кліку на кнопку
function buttonClicked(buttonText) {
  // saveState();
  lastSide = side;
  const size = deductionContext.conclusions.length - 1;
  let lastParentheses = deductive.extractTextBetweenParentheses(buttonText.toString());
  nameRule = lastParentheses;
  const allButtons = document.querySelectorAll('#button-container button');
  let canUseRule = deductive.checkWithAntlr(lastSide.querySelector('#proofText').textContent);
  canUseRule = getProof(canUseRule);
  switch (lastParentheses) {
    case "\\bot E1":
      if (canUseRule.type !== 'negation' && canUseRule.value !== '⊤' && canUseRule.value !== '⊥') {
        rules.firstRule();
        createProofTree(deductionContext.conclusions[size + 1], side);
        controlState.saveState();
      } else {
        shakeButton(allButtons[0]);
        return;
      }
      break;
    case "\\bot E2":
      if (canUseRule.type !== 'negation' && canUseRule.value !== '⊤' && canUseRule.value !== '⊥') {
        rules.secondRule(deductionContext);
        createProofTree(deductionContext.conclusions[size + 1], side);
        controlState.saveState();
      } else {
        shakeButton(allButtons[1]);
        return;
      }
      break;
    case "\\top I":
      if (canUseRule.value === '⊤') {
        rules.thirdRule();
        createProofTree(deductionContext.conclusions[size + 1], side);
        controlState.saveState();
      } else {
        shakeButton(allButtons[2]);
        return;
      }
      break;
    case "\\neg I":
      if (canUseRule.type === 'negation') {
        rules.fourthRule();
        createProofTree(deductionContext.conclusions[size + 1], side);
        controlState.saveState();
      } else {
        shakeButton(allButtons[3]);
        return;
      }
      break;
    case "\\neg E":
      if (canUseRule.value === '⊥') {
        rules.fifthRule();
      } else {
        shakeButton(allButtons[4]);
        return;
      }
      break;
    case "\\wedge I":
      if (canUseRule.type === 'conjunction') {
        rules.sixthRule();
        createProofTree(deductionContext.conclusions[size + 1], side);
        controlState.saveState();
      } else {
        shakeButton(allButtons[5]);
        return;
      }
      break;
    case "\\wedge E1":
      if (canUseRule.type !== 'negation' && canUseRule.value !== '⊤' && canUseRule.value !== '⊥') {
        rules.seventhRule(deductionContext);
      } else {
        shakeButton(allButtons[6]);
        return;
      }
      break;
    case "\\wedge E2":
      if (canUseRule.type !== 'negation' && canUseRule.value !== '⊤' && canUseRule.value !== '⊥') {
        rules.eighthRule(deductionContext);
      } else {
        shakeButton(allButtons[7]);
        return;
      }
      break;
    case "\\vee I1":
      if (canUseRule.type === 'disjunction') {
        rules.ninthRule();
        createProofTree(deductionContext.conclusions[size + 1], side);
        controlState.saveState();
      } else {
        shakeButton(allButtons[8]);
        return;
      }
      break;
    case "\\vee I2":
      if (canUseRule.type === 'disjunction') {
        rules.tenthRule();
        createProofTree(deductionContext.conclusions[size + 1], side);
        controlState.saveState();
      } else {
        shakeButton(allButtons[9]);
        return;
      }
      break;
    case "\\vee E":
      if (canUseRule.type !== 'negation' && canUseRule.value !== '⊤' && canUseRule.value !== '⊥') {
        rules.eleventhRule();
      } else {
        shakeButton(allButtons[10]);
        return;
      }
      break;
    case "\\Rightarrow I":
      if (canUseRule.type === 'implication') {
        rules.twelfthRule();
        createProofTree(deductionContext.conclusions[size + 1], side);
        controlState.saveState();
      } else {
        shakeButton(allButtons[11]);
        return;
      }
      break;
    case "\\Rightarrow E":
      if (canUseRule.type !== 'negation' && canUseRule.value !== '⊤' && canUseRule.value !== '⊥') {
        rules.thirteenthRule();
      } else {
        shakeButton(allButtons[12]);
        return;
      }
      break;
  }

  document.getElementById('proof-menu').className = 'hidden';
  document.getElementById("tab1").checked = true;
  const container = document.getElementById('proof');
  const labels = container.querySelectorAll('label');
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

export function saveTree() {

  if (hasError) {
    shakeElement('saveBtn', 5);
    return;
  }

  let er = 0;
  // const parentDiv = document.getElementById('preview');
  // Отримуємо всі дочірні елементи з класом "innerDiv"
  // console.log(deductive.checkCorrect(deductive.checkWithAntlr(editorMonaco.editor.getValue(), er)));
  if (deductive.checkCorrect(deductive.checkWithAntlr(editorMonaco.editor.getValue(), er)) === 1 && currentLevel !== 5) {
    if (currentLevel === 7 || currentLevel === 8) {
      alert("Missing conjunction, please correct your input");
    } else if (currentLevel === 11) {
      alert("Missing disjunction, please correct your input")
    } else if (currentLevel === 13) {
      alert("Missing implication, please correct your input")
    }
    return;
  }

  // Перебираємо кожен знайдений елемент та виводимо інформацію в консоль
  let data = [];
  let premises;
  if (currentLevel === 5) {
    premises = [editorMonaco.editor.getValue(), `!${editorMonaco.editor.getValue()}`.toString()];
  } else if (currentLevel === 11) {
    let text = deductive.convertToLogicalExpression(deductive.checkWithAntlr(lastSide.querySelector('#proofText').textContent));
    premises = [editorMonaco.editor.getValue(), text, text];
  } else if (currentLevel === 13) {
    let prof1 = deductive.checkWithAntlr(editorMonaco.editor.getValue(), er);
    premises = [deductive.convertToLogicalExpression(prof1.left), deductive.convertToLogicalExpression(prof1)];
  } else {
    premises = [editorMonaco.editor.getValue()];
  }
  for (const str1 of premises) {
    data.push(deductive.checkWithAntlr(str1, er));
  }
  if (er === 1) {
    return;
  }

  // document.getElementById('keyProof').className = 'hidden';
  let newConclusion;
  if (data.length > 1) {
    newConclusion = {
      level: level++,  // Додаємо поле level
      proof: data
    };
  } else {
    newConclusion = {
      level: level++,  // Додаємо поле level
      proof: data.pop()
    };
  }

  deductionContext.conclusions.push(newConclusion);

  // const parentElement = document.getElementById("proof");
  const divToRemove = document.getElementById("preview");
  divToRemove.remove();

  let elements = document.querySelectorAll('[class^="divItem-"]');
  elements.forEach(function (element) {
    element.addEventListener('click', handleClick);
  });

  createProofTree(newConclusion, lastSide);

  controlState.saveState();
}

let enterText = document.getElementById('editorPanel');

export function createTestProof(conclusions) {
  let container = document.getElementById('proof');
  // container.removeEventListener('click', handleClick);
  if (level > 1) {
    container = side;
  }

  editorMonaco.clearEditorErrors();
  editorMonaco.editor.setValue('');

  editorMonaco.editor.setValue(conclusions.proof[0]);
  checkRule(1, editorMonaco.editor.getValue());
  let proofPreview = document.createElement('div');
  editorMonaco.editor.updateOptions({fontSize: 28})
  enterText.style.width = '600px';
  enterText.style.height = '60px';
  proofPreview.className = "preview";
  proofPreview.style.borderBottom = '2px solid #000000';
  proofPreview.id = 'preview';
  // Створюємо кнопку

  let button = document.createElement('button');
  button.classList.add('buttonWithIcon');
  button.style.background = 'rgb(255, 255, 255)';
  button.style.color = 'rgb(33, 33, 33)';
  button.style.boxShadow = 'rgba(0, 0, 0, 0.25) 0px 2px 5px 0px';
  button.style.fontSize = '32px';
  button.style.marginLeft = '20px';
  button.style.marginTop = '15px';
  button.style.height = '60px';
  button.id = 'saveBtn';

  button.addEventListener('click', saveTree);

  button.innerHTML = `
    <span class="buttonText">Save</span>
    <div class="buttonIcon" style="margin: 0px 0px 0px 10px; height: 100%; width: 24px;">
    <img src="../img/play.svg" alt="SVG Icon" style="height: 100%; width: 100%;">
  </div>
`;


  proofPreview.appendChild(enterText);
  proofPreview.appendChild(button);


  if (container.firstChild) {
    container.insertBefore(proofPreview, container.firstChild);
  } else {
    container.appendChild(proofPreview);
  }
  if (document.getElementById('editorResize')) {
    document.getElementById('editorResize').remove();
  }

  deductive.editPadding();
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


function createProofTree(conclusions, container) {
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
      const result = deductive.addRedundantParentheses(proofElement);
      let text = `${deductive.convertToLogicalExpression(getProof(deductive.checkWithAntlr(result)))}`;
      proofDiv.id = 'divId-' + container.id;
      proofDiv.innerHTML = '<label id="proofText">' + text + '</label>';
      proofDiv.style.alignSelf = 'flex-end';
      proofDiv.addEventListener('click', handleClick);

      addUserHyp(conclusions, proofDiv);
      levelDiv.appendChild(proofDiv);

      // Додавання роздільника, якщо це не останній елемент
      if (index < conclusions.proof.length - 1) {
        // const margin = document.createElement(`div`);
        // margin.style.width = '130px';
        // levelDiv.appendChild(margin);
        proofDiv.style.marginRight = '130px';
      }

    });
  } else {
    const proofDiv = document.createElement(`div`);
    let text = " ";
    if (currentLevel !== 3) {
      let result = deductive.convertToLogicalExpression(conclusions.proof);
      if (level !== 1) {
        result = deductive.addRedundantParentheses(getProof(conclusions.proof));
      }
      text = `${deductive.convertToLogicalExpression(deductive.checkWithAntlr(result))}`;
    }


    proofDiv.id = 'divId-' + container.id;
    if (text !== " ") {
      proofDiv.innerHTML = '<label id="proofText">' + text + '</label>';
    } else {
      proofDiv.innerHTML = '<label class="previous" id="proofText">' + text + '</label>';
      proofDiv.style.paddingTop = "25px";
      proofDiv.style.background = "white";
      proofDiv.className = 'closed';
      closeSide(side);
      console.log(side);
    }
    proofDiv.style.fontFamily = "'Times New Roman', sans-serif";
    addUserHyp(conclusions, proofDiv);
    levelDiv.appendChild(proofDiv);

  }


  //11 правило гіпотези
  if (conclusions.proof.length === 3 && currentLevel === 11) {
    // console.log(conclusions.proof[0].left);
    // console.log(conclusions.proof[0].right);
    // let childElements = levelDiv.querySelectorAll('[class^="divItem-{\\"type\\":\\"atom\\""]');
    let childElements = levelDiv.children;

    // console.log(childElements);

    childElements[2].id = lastSide.id + 'divId-' + deductive.convertToLogicalExpression(conclusions.proof[0].left);
    childElements[3].id = lastSide.id + 'divId-' + deductive.convertToLogicalExpression(conclusions.proof[0].right);

    deductionContext.hypotheses.push({level: level - 1, hyp: conclusions.proof[0].left});
    deductionContext.hypotheses.push({level: level - 1, hyp: conclusions.proof[0].right});

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
    let hypothesesCur = deductive.getAllHypotheses(side);
    for (let y = 0; y < hypothesesCur.length; y++) {
      let index = String.fromCharCode(97 + y); // 97 відповідає коду символа 'a'
      let text1 = deductive.convertToLogicalExpression(hypothesesCur[y]);

      let element = document.createElement('div');
      element.className = 'hyp';
      element.innerHTML = '[' + text1 + ']' + '<sup>' + index + '</sup>';
      element.style.fontFamily = "'Times New Roman', sans-serif";
      currentHypotheses.appendChild(element);
    }
  } catch (error) {

  }
}

function addUserHyp(conclusions, proofDiv) {
  if (conclusions.level === 0 && userHypotheses != null) {
    for (let h = 0; h < userHypotheses.length; h++) {
      let err = 0;
      let data = deductive.getProof(deductive.checkWithAntlr(deductive.addRedundantParentheses(deductive.checkWithAntlr(userHypotheses[h], err))));
      // console.log(data);
      let test = {
        level: level,  // Додаємо поле level
        hyp: data
      };

      deductionContext.hypotheses.push(test);
      proofDiv.id = proofDiv.id + 'divId-' + userHypotheses[h];
    }
    userHypotheses = "";
  }
}


function addOrRemoveParenthesesGentzen() {

  document.getElementById('addParentheses').addEventListener('click', function () {
    let inProof = deductive.checkWithAntlr(deductive.addRedundantParentheses(deductive.checkWithAntlr(side.querySelector('#proofText').textContent)));
    // console.log(inProof);
    side.querySelector('#proofText').textContent = deductive.convertToLogicalExpression(deductive.deleteHeadBack(inProof));
  });

  document.getElementById('deleteParentheses').addEventListener('click', function () {
    const expression = deductive.checkWithAntlr(side.querySelector('#proofText').textContent);
    side.querySelector('#proofText').textContent = deductive.convertToLogicalExpression(deductive.getProof(deductive.checkWithAntlr(deductive.removeRedundantParentheses(expression))));

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
  // document.addEventListener('DOMContentLoaded', function () {
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
        processExpression(checkWithAntlr(side.querySelector('#proofText').textContent), 1);
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
  // });
}
