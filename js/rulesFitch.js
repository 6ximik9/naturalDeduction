import * as deductive from "./deductiveEngine";
import * as fitchMain from "./FitchProof";
import {checkRule, shakeElement} from "./index";
import * as editorMonaco from "./monacoEditor";
import {addNumberedDivs, clearItems, clickedBranch, clickedProofs, fitchStates, setStateFitch} from "./FitchProof";
import {
  addRedundantParentheses,
  checkWithAntlr,
  convertToLogicalExpression,
  getProof,
  removeRedundantParentheses
} from "./deductiveEngine";
import {saveStateFitch} from "./states";


export function firstRule(proofs, branches) {
  if (proofs.length !== 2 || branches.length > 0) {
    return -1;
  }
  console.log(proofs);
  console.log(branches);
  proofs[0].element.querySelector('span.indexC').remove();
  proofs[1].element.querySelector('span.indexC').remove();

  let firstPart = proofs[0].element.textContent.replaceAll(" ", "");
  let secondPart = proofs[1].element.textContent.replaceAll(" ", "");


  let nameRule = '∧I ' + (proofs[0].index + 1) + ',' + (proofs[1].index + 1);
  let proof =
    {
      formula: '(' + firstPart + ')' + '∧' + '(' + secondPart + ')',
      title: nameRule,
      branchIndex: fitchMain.branchIndex
    }

  fitchMain.addNewProof(proof);

  fitchMain.addRowToBranch(proof.formula, nameRule);

  return 0;
}

export function secondRule(proofs, branches) {

  if (proofs.length !== 1 || branches.length > 0) {
    return -1;
  }

  proofs[0].element.querySelector('span.indexC').remove();

  let rule = proofs[0].element.textContent.replaceAll(" ", "");

  if (checkWithAntlr(rule).type !== "conjunction") {
    alert("Missing conjunction, please change the selected rows");
    clearItems();
    return -1;
  }


  let parts = rule.split("∧");

  const div = document.createElement('div');
  div.className = 'userChoice';

  let button = createButton(parts[0], 'saveBtn1');
  let button1 = createButton(parts[1], 'saveBtn2');

  div.appendChild(button);
  div.appendChild(button1);

  // fitchBranch.appendChild(div);

  const outJust = document.getElementById('out_just');
  const titleDiv = document.createElement('div');
  titleDiv.textContent = "∧E, " + (proofs[0].index + 1); // Використання однієї і тієї ж назви для кожної формули
  outJust.appendChild(titleDiv);
  // div.style.borderBottom = '1px solid black';x

  const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
  const lastFitchBranch = fitchBranches[fitchBranches.length - 1];

  lastFitchBranch.appendChild(div)

  // lastFitchBranch.appendChild(fitchBranch);

  fitchMain.addNumberedDivs();

  return 0;
}

function createButton(text, id) {
  let button = document.createElement('button');
  button.classList.add('buttonWithIcon');
  button.style.cssText = `
        background: rgb(255, 255, 255);
        color: rgb(33, 33, 33);
        box-shadow: rgba(0, 0, 0, 0.25) 0px 2px 5px 0px;
        font-size: 28px;
        margin-left: 20px;
        margin-top: 15px;
        height: 50px;
    `;
  button.id = id;
  button.innerHTML = `<span class="buttonText">${text}</span>`;

  // Adding a click event listener that alerts the text of the button
  button.addEventListener('click', function () {
    let ruleUser = this.querySelector('.buttonText').textContent;

    const par = document.querySelector('.userChoice');

    par.innerHTML = '';

    // const div = document.createElement('div');
    par.className = 'fitch_formula';
    par.style.display = 'flex';
    par.textContent = ruleUser;
    // par.appendChild(div);

    fitchMain.processExpression("AllRules", 1);
    saveStateFitch();
  });

  return button;
}

let enterText = document.getElementById('editorPanel');
editorMonaco.editor.onKeyDown(function (e) {
  // Перевіряємо, чи натиснута клавіша Enter
  if (e.keyCode === monaco.KeyCode.Enter && document.getElementById('preview')) {
    // Скасовуємо стандартну дію (перехід на новий рядок)
    e.preventDefault();
  }
});

export function thirdRule(proofs, branches) {
  if (proofs.length !== 1 || branches.length > 0) {
    clearItems();
    return -1;
  }

  proofs[0].element.querySelector('span.indexC').remove();
  let rule = proofs[0].element.textContent.replaceAll(" ", "");

  const div = document.createElement('div');
  div.className = 'userFormula';

  editorMonaco.clearEditorErrors();
  editorMonaco.editor.setValue('(' + rule + ')' + '∨' + ' ');
  checkRule(1, editorMonaco.editor.getValue());
  editorMonaco.editor.updateOptions({fontSize: 28})

  enterText.style.width = '500px';
  enterText.style.height = '50px';

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


  button.addEventListener('click', function () {
    let ruleUser = getProof(checkWithAntlr(editorMonaco.editor.getValue()));
    let lastRule = getProof(checkWithAntlr(rule));

    if (ruleUser.type !== "disjunction") {
      alert("Missing disjunction, please correct your input")
      return;
    }

    let leftSide = getProof(ruleUser.left);
    let rightSide = getProof(ruleUser.right);


    if (JSON.stringify(leftSide) === JSON.stringify(lastRule) || JSON.stringify(rightSide) === JSON.stringify(lastRule)) {
      const par = document.querySelector('.userFormula');
      par.innerHTML = '';
      // const div = document.createElement('div');
      par.className = 'fitch_formula';
      par.style.display = 'flex';
      par.textContent = removeRedundantParentheses(ruleUser);
      fitchMain.processExpression("AllRules", 1);
      saveStateFitch();
      return 0;
    } else {
      alert("Please correct your input")
    }
  });

  div.appendChild(enterText);
  div.appendChild(button);

  const outJust = document.getElementById('out_just');
  const titleDiv = document.createElement('div');
  titleDiv.textContent = "∨I, " + (proofs[0].index + 1); // Використання однієї і тієї ж назви для кожної формули
  outJust.appendChild(titleDiv);

  const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
  const lastFitchBranch = fitchBranches[fitchBranches.length - 1];

  lastFitchBranch.appendChild(div)

  // lastFitchBranch.appendChild(fitchBranch);

  fitchMain.addNumberedDivs();

  return 0;
}

export function fourthRule(proofs, branches) {

  if (proofs.length !== 1 || branches.length !== 2) {
    return -1;
  }

  proofs[0].element.querySelector('span.indexC').remove();

  if (checkWithAntlr(proofs[0].element.textContent.replaceAll(" ", "")).type !== "disjunction") {
    alert("Missing disjunction, please change the selected rows");
    clearItems();
    return -1;
  }


  let firstPart = proofs[0].element.textContent.replaceAll(" ", "");

  let branch1 = branches[0].element.querySelectorAll('.fitch_formula');
  let branch2 = branches[1].element.querySelectorAll('.fitch_formula');

  let firstPartLeft = deductive.removeRedundantParentheses(getProof(checkWithAntlr(firstPart).left));
  let firstPartRight = deductive.removeRedundantParentheses(getProof(checkWithAntlr(firstPart).right));
  let firstBranch1 = deductive.removeRedundantParentheses(getProof(checkWithAntlr(branch1[0].textContent)));
  let lastBranch1 = deductive.removeRedundantParentheses(getProof(checkWithAntlr(branch1[branch1.length - 1].textContent)));

  let firstBranch2 = deductive.removeRedundantParentheses(getProof(checkWithAntlr(branch2[0].textContent)));
  let lastBranch2 = deductive.removeRedundantParentheses(getProof(checkWithAntlr(branch2[branch1.length - 1].textContent)));


  if ((firstPartLeft === firstBranch1 && firstPartRight === firstBranch2) ||
    (firstPartLeft === firstBranch2 && firstPartRight === firstBranch1)) {


    if (lastBranch1 !== lastBranch2) {
      return;
    }

    const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
    // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
    let indexStart1 = allFitchFormulas.indexOf(branch1[0]) + 1;
    let indexFinish1 = allFitchFormulas.indexOf(branch1[branch1.length - 1]) + 1;
    let indexStart2 = allFitchFormulas.indexOf(branch2[0]) + 1;
    let indexFinish2 = allFitchFormulas.indexOf(branch2[branch2.length - 1]) + 1;

    let tempStartMin = Math.min(indexStart1, indexStart2);
    let tempFinishMin = Math.min(indexFinish1, indexFinish2);
    let tempStartMax = Math.max(indexStart1, indexStart2);
    let tempFinishMax = Math.max(indexFinish1, indexFinish2);

    indexStart1 = tempStartMin;
    indexFinish1 = tempFinishMin;
    indexStart2 = tempStartMax;
    indexFinish2 = tempFinishMax;

    fitchMain.addRowToBranch(lastBranch1,
      "∨E " + (proofs[0].index + 1) + ", " + (indexStart1) + "-" + (indexFinish1)
      + ", " + (indexStart2) + "-" + (indexFinish2));

  }

  return 0;


}

export function fifthRule(rules, branches) {
  if (branches.length !== 1 || rules.length > 0) {
    return -1;
  }

  let allFormula = branches[0].element.querySelectorAll('.fitch_formula');

  let newRule = allFormula[0].textContent + "⇒" + allFormula[allFormula.length - 1].textContent;

  newRule = deductive.removeRedundantParentheses(checkWithAntlr(newRule));

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);


  fitchMain.addRowToBranch(newRule, "⇒I " + (indexStart + 1) + "-" + (indexFinish + 1));

  return 0;
}

export function sixthRule(proofs, branches) {
  if (proofs.length !== 2 || branches.length > 0) {
    return -1;
  }

  proofs[0].element.querySelector('span.indexC').remove();
  proofs[1].element.querySelector('span.indexC').remove();
  let firstPart = proofs[0].element.textContent.replaceAll(" ", "");
  let secondPart = proofs[1].element.textContent.replaceAll(" ", "");
  let nameRule = '⇒E ' + (proofs[0].index + 1) + ',' + (proofs[1].index + 1);


  if (getProof(checkWithAntlr(firstPart)).type !== "implication" && getProof(checkWithAntlr(secondPart)).type !== "implication") {
    alert("Missing implication, please change the selected rows");
    clearItems();
    return -1;
  }

  //Де саме імплікація
  let implication = getProof(checkWithAntlr(firstPart));
  let notImplication = getProof(checkWithAntlr(secondPart));
  if (implication.type !== "implication") {
    implication = getProof(checkWithAntlr(secondPart));
    notImplication = getProof(checkWithAntlr(firstPart));
  }

  if (JSON.stringify(implication.left) === JSON.stringify(notImplication)) {
    fitchMain.addRowToBranch(deductive.convertToLogicalExpression(implication.right), nameRule);
    return 0;
  } else {
    return -1;
  }
}

export function seventhRule(rules, branches) {

  if (branches.length !== 1 || rules.length > 0) {
    return -1;
  }

  let allFormula = branches[0].element.querySelectorAll('.fitch_formula');

  if (allFormula[allFormula.length - 1].textContent !== "⊥") {
    alert("Missing absurdum, branch must end with an absurdum mark");
    return -1;
  }

  let newRule = "~" + "(" + allFormula[0].textContent + ")";

  newRule = deductive.addRedundantParentheses(checkWithAntlr(newRule));

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);


  fitchMain.addRowToBranch(newRule, "¬I " + (indexStart + 1) + "-" + (indexFinish + 1));

  return 0;
}

export function eighthRule(proofs, branches) {

  if (proofs.length !== 2 || branches.length > 0) {
    return -1;
  }

  proofs[0].element.querySelector('span.indexC').remove();
  proofs[1].element.querySelector('span.indexC').remove();

  let firstPart = proofs[0].element.textContent.replaceAll(" ", "");
  let secondPart = proofs[1].element.textContent.replaceAll(" ", "");

  if (getProof(checkWithAntlr(firstPart)).type !== "negation" && getProof(checkWithAntlr(secondPart)).type !== "negation") {
    alert("Missing negation, please change the selected rows");
    return -1;
  }

  let negation = getProof(checkWithAntlr(firstPart));
  let notNegation = getProof(checkWithAntlr(secondPart));
  if (negation.type !== "negation") {
    negation = getProof(checkWithAntlr(secondPart));
    notNegation = getProof(checkWithAntlr(firstPart));
  }


  if (JSON.stringify(negation.value) === JSON.stringify(notNegation)) {
    fitchMain.addRowToBranch('⊥', "¬E " + (proofs[0].index + 1) + ',' + (proofs[1].index + 1));
    return 0;
  } else {
    return -1;
  }


}

export function ninthRule(proofs, branches) {
  if (proofs.length !== 1 || branches.length > 0) {
    return -1;
  }

  proofs[0].element.querySelector('span.indexC').remove();
  let rule = proofs[0].element.textContent.replaceAll(" ", "");
  if (rule !== "⊥") {
    alert("Missing absurdum, please change the selected rows");
    return -1;
  }

  const div = document.createElement('div');
  div.className = 'userFormula';

  editorMonaco.clearEditorErrors();
  editorMonaco.editor.setValue('');
  checkRule(1, editorMonaco.editor.getValue());
  editorMonaco.editor.updateOptions({fontSize: 28})

  enterText.style.width = '500px';
  enterText.style.height = '50px';

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

  button.addEventListener('click', function () {
    if (checkRule(0, editorMonaco.editor.getValue()) === 1) {
      shakeElement('saveBtn', 5);
      return;
    }

    const par = document.querySelector('.userFormula');
    par.innerHTML = '';
    // const div = document.createElement('div');
    par.className = 'fitch_formula';
    par.style.display = 'flex';
    par.textContent = removeRedundantParentheses(checkWithAntlr(editorMonaco.editor.getValue()));
    fitchMain.processExpression("AllRules", 1);
    // fitchMain.addRowToBranch(editorMonaco.editor.getValue(), '⊥E1, ' + (rules[0].index + 1));
    saveStateFitch();
  });

  div.appendChild(enterText);
  div.appendChild(button);

  const outJust = document.getElementById('out_just');
  const titleDiv = document.createElement('div');
  titleDiv.textContent = "∨I, " + (proofs[0].index + 1); // Використання однієї і тієї ж назви для кожної формули
  outJust.appendChild(titleDiv);

  const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
  const lastFitchBranch = fitchBranches[fitchBranches.length - 1];

  lastFitchBranch.appendChild(div)

  // lastFitchBranch.appendChild(fitchBranch);

  fitchMain.addNumberedDivs();

  return 0;
}

export function tenthRule(rules, branches) {

  if (branches.length !== 1 || rules.length > 0) {
    return -1;
  }

  let allFormula = branches[0].element.querySelectorAll('.fitch_formula');

  if (allFormula[allFormula.length - 1].textContent !== "⊥") {
    alert("Missing absurdum, branch must end with an absurdum mark");
    return -1;
  }

  let check = getProof(checkWithAntlr(allFormula[0].textContent));
  if (check.type !== "negation") {
    alert("Missing negation, please change the selected branch");
    return -1;
  }

  let newRule = convertToLogicalExpression(check.value);

  newRule = deductive.removeRedundantParentheses(checkWithAntlr(newRule));

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);


  fitchMain.addRowToBranch(newRule, "C " + (indexStart + 1) + "-" + (indexFinish + 1));
  return 0;
}

export function eleventhRule(proofs, branches) {

  if (proofs.length !== 1 || branches.length>0) {
    return -1;
  }

  proofs[0].element.querySelector('span.indexC').remove();
  let rule = proofs[0].element.textContent.replaceAll(" ", "");

  let check = checkWithAntlr(rule);
  // console.log(check);

  if (check.type === "negation" && check.value && check.value.type === "negation") {
    let value = deductive.convertToLogicalExpression(check.value.value);
    fitchMain.addRowToBranch(value, '¬ ¬E ' + (proofs[0].index + 1));
    return 0;
  } else {
    return -1;
  }
}


export function twelfthRule(proofs, branches) {
  if (proofs.length !== 1 || branches.length>0) {
    return -1;
  }

  proofs[0].element.querySelector('span.indexC').remove();

  let firstPart = proofs[0].element.textContent.replaceAll(" ", "");

  fitchMain.addRowToBranch(firstPart, 'R ' + (proofs[0].index + 1));
}
