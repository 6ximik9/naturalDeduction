import * as deductive from "./deductiveEngine";
import * as fitchMain from "./FitchProof";
import {checkRule, shakeElement} from "./index";
import * as editorMonaco from "./monacoEditor";
import {addNumberedDivs} from "./FitchProof";
import {
  addRedundantParentheses,
  checkWithAntlr,
  convertToLogicalExpression,
  getProof,
  removeRedundantParentheses
} from "./deductiveEngine";
import {saveStateFitch} from "./states";


export function firstRule(rules) {
  rules[0].element.querySelector('span.indexC').remove();
  rules[1].element.querySelector('span.indexC').remove();
  let firstPart = rules[0].element.textContent.replaceAll(" ", "");
  let secondPart = rules[1].element.textContent.replaceAll(" ", "");

  let nameRule = '∧I ' + (rules[0].index + 1) + ',' + (rules[1].index + 1);
  let proof =
    {
      formula: '('+ firstPart+')' + '∧' + '(' + secondPart +')',
      title: nameRule,
      branchIndex: fitchMain.branchIndex
    }
  fitchMain.addNewProof(proof);

  fitchMain.addRowToBranch(proof.formula, nameRule);
}

export function secondRule(rules) {
  rules[0].element.querySelector('span.indexC').remove();
  let rule = rules[0].element.textContent.replaceAll(" ", "");
  let parts = rule.split("∧");

  // const fitchBranch = document.createElement('div');
  // fitchBranch.className = 'fitch_branch';
  const div = document.createElement('div');
  div.className = 'userChoice';

  let button = createButton(parts[0], 'saveBtn1');
  let button1 = createButton(parts[1], 'saveBtn2');

  div.appendChild(button);
  div.appendChild(button1);

  // fitchBranch.appendChild(div);

  const outJust = document.getElementById('out_just');
  const titleDiv = document.createElement('div');
  titleDiv.textContent = "∧E, " + (rules[0].index + 1); // Використання однієї і тієї ж назви для кожної формули
  outJust.appendChild(titleDiv);
  // div.style.borderBottom = '1px solid black';x

  const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
  const lastFitchBranch = fitchBranches[fitchBranches.length - 1];

  lastFitchBranch.appendChild(div)

  // lastFitchBranch.appendChild(fitchBranch);

  fitchMain.addNumberedDivs();
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

export function thirdRule(rules) {
  rules[0].element.querySelector('span.indexC').remove();
  let rule = rules[0].element.textContent.replaceAll(" ", "");

  const div = document.createElement('div');
  div.className = 'userFormula';

  editorMonaco.clearEditorErrors();
  editorMonaco.editor.setValue('(' + rule + ')' + '∨' + ' ');
  checkRule(1, editorMonaco.editor.getValue());
  editorMonaco.editor.updateOptions({fontSize: 28})

  enterText.style.width = '300px';
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

  button.innerHTML = `<span class="buttonText">Save</span>`;

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
    } else {
      alert("Please correct your input")
    }
  });

  div.appendChild(enterText);
  div.appendChild(button);

  const outJust = document.getElementById('out_just');
  const titleDiv = document.createElement('div');
  titleDiv.textContent = "∨I, " + (rules[0].index + 1); // Використання однієї і тієї ж назви для кожної формули
  outJust.appendChild(titleDiv);

  const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
  const lastFitchBranch = fitchBranches[fitchBranches.length - 1];

  lastFitchBranch.appendChild(div)

  // lastFitchBranch.appendChild(fitchBranch);

  fitchMain.addNumberedDivs();

}

export function fourthRule(rulesRow, rulesBranch) {
  rulesRow[0].element.querySelector('span.indexC').remove();

  let firstPart = rulesRow[0].element.textContent.replaceAll(" ", "");

  let branch1 = rulesBranch[0].element.querySelectorAll('.fitch_formula');
  let branch2 = rulesBranch[1].element.querySelectorAll('.fitch_formula');

  let firstPartLeft = deductive.removeRedundantParentheses(getProof(checkWithAntlr(firstPart).left));
  let firstPartRight = deductive.removeRedundantParentheses(getProof(checkWithAntlr(firstPart).right));
  let firstBranch1 = deductive.removeRedundantParentheses(getProof(checkWithAntlr(branch1[0].textContent)));
  let lastBranch1 = deductive.removeRedundantParentheses(getProof(checkWithAntlr(branch1[branch1.length-1].textContent)));

  let firstBranch2 = deductive.removeRedundantParentheses(getProof(checkWithAntlr(branch2[0].textContent)));
  let lastBranch2 = deductive.removeRedundantParentheses(getProof(checkWithAntlr(branch2[branch1.length-1].textContent)));


  if ((firstPartLeft === firstBranch1 && firstPartRight === firstBranch2) ||
    (firstPartLeft === firstBranch2 && firstPartRight === firstBranch1)) {


    if(lastBranch1!==lastBranch2)
    {
      return;
    }

    const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
    // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
    let indexStart1 = allFitchFormulas.indexOf(branch1[0]) + 1;
    let indexFinish1 = allFitchFormulas.indexOf(branch1[branch1.length-1]) + 1;
    let indexStart2 = allFitchFormulas.indexOf(branch2[0]) + 1;
    let indexFinish2 = allFitchFormulas.indexOf(branch2[branch2.length-1]) + 1;

    let tempStartMin = Math.min(indexStart1, indexStart2);
    let tempFinishMin = Math.min(indexFinish1, indexFinish2);
    let tempStartMax = Math.max(indexStart1, indexStart2);
    let tempFinishMax = Math.max(indexFinish1, indexFinish2);

    indexStart1 = tempStartMin;
    indexFinish1 = tempFinishMin;
    indexStart2 = tempStartMax;
    indexFinish2 = tempFinishMax;

    fitchMain.addRowToBranch(lastBranch1,
      "∨E " + (rulesRow[0].index + 1)  + ", " + (indexStart1) + "-" + (indexFinish1)
      + ", " + (indexStart2) + "-" + (indexFinish2));

  }





}

export function fifthRule(rules) {
  let allFormula = rules[0].element.querySelectorAll('.fitch_formula');

  let newRule = allFormula[0].textContent + "⇒" + allFormula[allFormula.length - 1].textContent;

  newRule = deductive.removeRedundantParentheses(checkWithAntlr(newRule));

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);


  fitchMain.addRowToBranch(newRule, "⇒I " + (indexStart + 1) + "-" + (indexFinish + 1));

}

export function sixthRule(rules) {
  rules[0].element.querySelector('span.indexC').remove();
  rules[1].element.querySelector('span.indexC').remove();
  let firstPart = rules[0].element.textContent.replaceAll(" ", "");
  let secondPart = rules[1].element.textContent.replaceAll(" ", "");
  let nameRule = '⇒E ' + (rules[0].index + 1) + ',' + (rules[1].index + 1);


  if (getProof(checkWithAntlr(firstPart)).type !== "implication" && getProof(checkWithAntlr(secondPart)).type !== "implication") {
    alert("Missing implication, please change the selected rows");
    return;
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
  }
}

export function seventhRule(rules) {
  let allFormula = rules[0].element.querySelectorAll('.fitch_formula');

  if(allFormula[allFormula.length - 1].textContent !== "⊥")
  {
    alert("Missing absurdum, branch must end with an absurdum mark");
    return;
  }

  let newRule = "~" + "(" + allFormula[0].textContent + ")";

  newRule = deductive.addRedundantParentheses(checkWithAntlr(newRule));

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);


  fitchMain.addRowToBranch(newRule, "¬I " + (indexStart + 1) + "-" + (indexFinish + 1));
}

export function eighthRule(rules) {
  rules[0].element.querySelector('span.indexC').remove();
  rules[1].element.querySelector('span.indexC').remove();

  let firstPart = rules[0].element.textContent.replaceAll(" ", "");
  let secondPart = rules[1].element.textContent.replaceAll(" ", "");

  if (getProof(checkWithAntlr(firstPart)).type !== "negation" && getProof(checkWithAntlr(secondPart)).type !== "negation") {
    alert("Missing negation, please change the selected rows");
    return;
  }

  let negation = getProof(checkWithAntlr(firstPart));
  let notNegation = getProof(checkWithAntlr(secondPart));
  if (negation.type !== "negation") {
    negation = getProof(checkWithAntlr(secondPart));
    notNegation = getProof(checkWithAntlr(firstPart));
  }

  console.log(negation);
  console.log(notNegation);

  if (JSON.stringify(negation.value) === JSON.stringify(notNegation)) {
    fitchMain.addRowToBranch('⊥', "¬E " + (rules[0].index + 1) + ',' + (rules[1].index + 1));
  }


}

export function ninthRule(rules) {
  rules[0].element.querySelector('span.indexC').remove();
  let rule = rules[0].element.textContent.replaceAll(" ", "");
  if (rule !== "⊥") {
    alert("Missing absurdum, please change the selected rows");
    return;
  }

  const div = document.createElement('div');
  div.className = 'userFormula';

  editorMonaco.clearEditorErrors();
  editorMonaco.editor.setValue('');
  checkRule(1, editorMonaco.editor.getValue());
  editorMonaco.editor.updateOptions({fontSize: 28})

  enterText.style.width = '300px';
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

  button.innerHTML = `<span class="buttonText">Save</span>`;

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
  titleDiv.textContent = "∨I, " + (rules[0].index + 1); // Використання однієї і тієї ж назви для кожної формули
  outJust.appendChild(titleDiv);

  const fitchBranches = document.querySelectorAll('.fitch_branch:not(.finished)');
  const lastFitchBranch = fitchBranches[fitchBranches.length - 1];

  lastFitchBranch.appendChild(div)

  // lastFitchBranch.appendChild(fitchBranch);

  fitchMain.addNumberedDivs();
}

export function tenthRule(rules) {
  let allFormula = rules[0].element.querySelectorAll('.fitch_formula');

  if(allFormula[allFormula.length - 1].textContent !== "⊥")
  {
    alert("Missing absurdum, branch must end with an absurdum mark");
    return;
  }

  let check = getProof(checkWithAntlr(allFormula[0].textContent));
  if(check.type !== "negation")
  {
      alert("Missing negation, please change the selected branch");
      return;
  }

  let newRule = convertToLogicalExpression(check.value);

  newRule = deductive.removeRedundantParentheses(checkWithAntlr(newRule));

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);


  fitchMain.addRowToBranch(newRule, "C " + (indexStart + 1) + "-" + (indexFinish + 1));
}

export function eleventhRule(rules) {
  rules[0].element.querySelector('span.indexC').remove();
  let rule = rules[0].element.textContent.replaceAll(" ", "");

  let check = checkWithAntlr(rule);
  console.log(check);

  if (check.type === "negation" && check.value && check.value.type === "negation") {
    let value = deductive.convertToLogicalExpression(check.value.value);
    fitchMain.addRowToBranch(value, '¬ ¬E ' + (rules[0].index + 1));
  }
}


export function twelfthRule() {
}
