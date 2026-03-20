import * as deductive from "../../core/deductiveEngine";
import * as fitchMain from "./FitchProof";
import {checkRule, shakeElement} from "../../index";
import * as editorMonaco from "../../ui/monacoEditor";
import {t} from "../../core/i18n";
import {addNumberedDivs, clearItems, clickedBranch, clickedProofs, fitchStates, setStateFitch} from "./FitchProof";
import {
  checkWithAntlr,
  convertToLogicalExpression,
  getProof
} from "../../core/deductiveEngine";
import {saveStateFitch} from "../../state/stateManager";
import {formulaToString} from "../../core/formatter";
import {createModalForReturn} from "../../ui/modals/quantifierReturn";
import {createAdvancedModal} from "../../ui/modals/existentialIntro";
import {createModalForLeibniz} from "../../ui/modals/leibniz";
import {createInputModal} from "../../ui/modals/input";

function getCleanFormula(element) {
  const clone = element.cloneNode(true);
  const span = clone.querySelector('.indexC');
  if (span) span.remove();
  return clone.textContent.replaceAll(" ", "");
}

export function firstRule(proofs, branches) {
  if (proofs.length !== 2 || branches.length > 0) {
    return -1;
  }
  
  let firstPart = getCleanFormula(proofs[0].element);
  let secondPart = getCleanFormula(proofs[1].element);


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

export async function secondRule(proofs, branches) {

  if (proofs.length !== 1 || branches.length > 0) {
    return -1;
  }

  let rule = getCleanFormula(proofs[0].element);
  let parsedRule = checkWithAntlr(rule);

  if (parsedRule.type !== "conjunction") {
    alert(t("alert-missing-conjunction"));
    return -1;
  }

  try {
    const inputText = await createInputModal("Conjunction Elimination (∧E)", "Enter the formula:");
    const parsedInput = checkWithAntlr(inputText);
    
    // Check if the input is valid syntactically
    if (checkRule(0, inputText) === 1) {
       return -1;
    }

    const leftSide = getProof(parsedRule.left);
    const rightSide = getProof(parsedRule.right);
    const inputProof = getProof(parsedInput);

    if (JSON.stringify(leftSide) === JSON.stringify(inputProof) || JSON.stringify(rightSide) === JSON.stringify(inputProof)) {
      fitchMain.addRowToBranch(inputText, "∧E, " + (proofs[0].index + 1));
      return 0;
    } else {
      alert(t("alert-correct-input"));
      return -1;
    }
  } catch (error) {
    console.log("Modal cancelled:", error);
    return -1;
  }
}

export async function thirdRule(proofs, branches) {
  if (proofs.length !== 1 || branches.length > 0) {
    return -1;
  }

  let rule = getCleanFormula(proofs[0].element);

  try {
    const inputText = await createInputModal("Disjunction Introduction (∨I)", "Enter the disjunction formula:", "(" + rule + ")∨");
    
    let ruleUser = getProof(checkWithAntlr(inputText));
    let lastRule = getProof(checkWithAntlr(rule));

    if (ruleUser.type !== "disjunction") {
      alert(t("alert-missing-disjunction"));
      return -1;
    }

    let leftSide = getProof(ruleUser.left);
    let rightSide = getProof(ruleUser.right);

    if (JSON.stringify(leftSide) === JSON.stringify(lastRule) || JSON.stringify(rightSide) === JSON.stringify(lastRule)) {
      fitchMain.addRowToBranch(inputText, "∨I, " + (proofs[0].index + 1));
      return 0;
    } else {
      alert(t("alert-correct-input"));
      return -1;
    }
  } catch (error) {
    console.log("Modal cancelled:", error);
    return -1;
  }
}

export function fourthRule(proofs, branches) {

  if (proofs.length !== 1 || branches.length !== 2) {
    return -1;
  }

  if (checkWithAntlr(getCleanFormula(proofs[0].element)).type !== "disjunction") {
    alert(t("alert-missing-disjunction"));
    return -1;
  }


  let firstPart = getCleanFormula(proofs[0].element);

  let branch1 = branches[0].element.querySelectorAll('.fitch_formula');
  let branch2 = branches[1].element.querySelectorAll('.fitch_formula');

  let firstPartLeft = formulaToString(getProof(checkWithAntlr(firstPart).left), 0);
  let firstPartRight = formulaToString(getProof(checkWithAntlr(firstPart).right), 0);
  let firstBranch1 = formulaToString(getProof(checkWithAntlr(branch1[0].textContent)), 0);
  let lastBranch1 = formulaToString(getProof(checkWithAntlr(branch1[branch1.length - 1].textContent)), 0);

  let firstBranch2 = formulaToString(getProof(checkWithAntlr(branch2[0].textContent)), 0);
  let lastBranch2 = formulaToString(getProof(checkWithAntlr(branch2[branch2.length - 1].textContent)), 0);


  if ((firstPartLeft === firstBranch1 && firstPartRight === firstBranch2) ||
    (firstPartLeft === firstBranch2 && firstPartRight === firstBranch1)) {


    if (lastBranch1 !== lastBranch2) {
      return -1;
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

    branches[0].element.classList.add('finished');
    branches[0].element.style.paddingBottom = '0px';
    branches[1].element.classList.add('finished');
    branches[1].element.style.paddingBottom = '0px';
    fitchMain.setBranchIndex(fitchMain.branchIndex - 2);

    fitchMain.addRowToBranch(lastBranch1,
      "∨E " + (proofs[0].index + 1) + ", " + (indexStart1) + "-" + (indexFinish1)
      + ", " + (indexStart2) + "-" + (indexFinish2));

    return 0;
  }

  return -1;
}

export function fifthRule(rules, branches) {
  if (branches.length !== 1 || rules.length > 0) {
    return -1;
  }

  let allFormula = branches[0].element.querySelectorAll('.fitch_formula');

  let newRule = allFormula[0].textContent + "⇒" + allFormula[allFormula.length - 1].textContent;

  newRule = formulaToString(checkWithAntlr(newRule), 0);

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);


  branches[0].element.classList.add('finished');
  branches[0].element.style.paddingBottom = '0px';
  fitchMain.setBranchIndex(fitchMain.branchIndex - 1);

  fitchMain.addRowToBranch(newRule, "⇒I " + (indexStart + 1) + "-" + (indexFinish + 1));

  return 0;
}

export function sixthRule(proofs, branches) {
  if (proofs.length !== 2 || branches.length > 0) {
    return -1;
  }

  let firstPart = getCleanFormula(proofs[0].element);
  let secondPart = getCleanFormula(proofs[1].element);
  let nameRule = '⇒E ' + (proofs[0].index + 1) + ',' + (proofs[1].index + 1);


  if (getProof(checkWithAntlr(firstPart)).type !== "implication" && getProof(checkWithAntlr(secondPart)).type !== "implication") {
    alert(t("alert-missing-implication"));
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

  if (getCleanFormula(allFormula[allFormula.length - 1]) !== "⊥") {
    alert(t("alert-missing-absurdum"));
    return -1;
  }

  let newRule = "~" + "(" + getCleanFormula(allFormula[0]) + ")";

  newRule = formulaToString(checkWithAntlr(newRule), 1);

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);


  branches[0].element.classList.add('finished');
  branches[0].element.style.paddingBottom = '0px';
  fitchMain.setBranchIndex(fitchMain.branchIndex - 1);

  fitchMain.addRowToBranch(newRule, "¬I " + (indexStart + 1) + "-" + (indexFinish + 1));

  return 0;
}

export function eighthRule(proofs, branches) {

  if (proofs.length !== 2 || branches.length > 0) {
    return -1;
  }

  let firstPart = getCleanFormula(proofs[0].element);
  let secondPart = getCleanFormula(proofs[1].element);

  if (getProof(checkWithAntlr(firstPart)).type !== "negation" && getProof(checkWithAntlr(secondPart)).type !== "negation") {
    alert(t("alert-missing-negation"));
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

export async function ninthRule(proofs, branches) {
  if (proofs.length !== 1 || branches.length > 0) {
    return -1;
  }

  let rule = getCleanFormula(proofs[0].element);
  if (rule !== "⊥") {
    alert(t("alert-missing-absurdum"));
    return -1;
  }

  try {
    const inputText = await createInputModal("Elimination of Absurdum (⊥E)", "Enter the formula:");
    
    // Add validation using the grammar checker
    if (checkRule(0, inputText) === 1) {
       shakeElement('saveBtn', 5); // Just for potential error handling UI if needed
       return -1;
    }
    
    fitchMain.addRowToBranch(inputText, '⊥E, ' + (proofs[0].index + 1));
    return 0;
  } catch (error) {
    console.log("Modal cancelled:", error);
    return -1;
  }
}

export function tenthRule(rules, branches) {

  if (branches.length !== 1 || rules.length > 0) {
    return -1;
  }

  let allFormula = branches[0].element.querySelectorAll('.fitch_formula');

  if (getCleanFormula(allFormula[allFormula.length - 1]) !== "⊥") {
    alert(t("alert-missing-absurdum"));
    return -1;
  }

  let check = getProof(checkWithAntlr(getCleanFormula(allFormula[0])));
  if (check.type !== "negation") {
    alert(t("alert-missing-negation"));
    return -1;
  }

  let newRule = convertToLogicalExpression(check.value);

  newRule = formulaToString(checkWithAntlr(newRule), 0);

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  // Знаходимо індекс клікнутого елемента в масиві allFitchFormulas
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);


  branches[0].element.classList.add('finished');
  branches[0].element.style.paddingBottom = '0px';
  fitchMain.setBranchIndex(fitchMain.branchIndex - 1);

  fitchMain.addRowToBranch(newRule, "C " + (indexStart + 1) + "-" + (indexFinish + 1));
  return 0;
}

export function eleventhRule(proofs, branches) {

  if (proofs.length !== 1 || branches.length>0) {
    return -1;
  }

  let rule = getCleanFormula(proofs[0].element);

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

  let firstPart = getCleanFormula(proofs[0].element);

  fitchMain.addRowToBranch(firstPart, 'R ' + (proofs[0].index + 1));
  return 0;
}

// Rule 13: Universal Elimination (\forall E)
export async function thirteenthRule(proofs, branches) {
  if (proofs.length !== 1 || branches.length > 0) {
    return -1;
  }

  let rule = getCleanFormula(proofs[0].element);

  let parsed = getProof(checkWithAntlr(rule));

  if (parsed.type !== "forall") {
    alert(t("alert-forall-required"));
    return -1;
  }

  try {
    const result = await createModalForReturn([], parsed, rule);
    if (result && result.modifiedFormula) {
      fitchMain.addRowToBranch(result.modifiedFormula, "∀E " + (proofs[0].index + 1));
      return 0;
    }
  } catch (error) {
    console.log("Modal cancelled:", error);
  }
  return -1;
}

// Rule 14: Universal Introduction (\forall I)
export async function fourteenthRule(proofs, branches) {
  if (branches.length !== 1 || proofs.length > 0) {
    return -1;
  }

  let allFormula = branches[0].element.querySelectorAll('.fitch_formula');
  let firstLine = getCleanFormula(allFormula[0]);
  let lastLine = getCleanFormula(allFormula[allFormula.length - 1]);

  try {
    const variable = await createInputModal(t('rule-universal-quantifier'), t('modal-enter-variable'));

    if (variable) {
      let constant = firstLine.trim();
      let newBody = lastLine.split(constant).join(variable);
      let newFormula = "∀" + variable + " (" + newBody + ")";

      newFormula = formulaToString(checkWithAntlr(newFormula), 0);

      const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
      const indexStart = allFitchFormulas.indexOf(allFormula[0]);
      const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);

      branches[0].element.classList.add('finished');
      branches[0].element.style.paddingBottom = '0px';
      fitchMain.setBranchIndex(fitchMain.branchIndex - 1);

      fitchMain.addRowToBranch(newFormula, "∀I " + (indexStart + 1) + "-" + (indexFinish + 1));
      return 0;
    }
  } catch (error) {
    console.log("Modal cancelled:", error);
  }
  return -1;
}

// Rule 15: Existential Introduction (\exists I)
export async function fifteenthRule(proofs, branches) {
  if (proofs.length !== 1 || branches.length > 0) {
    return -1;
  }

  let rule = getCleanFormula(proofs[0].element);

  try {
    const result = await createAdvancedModal([rule]);

    if (result && result.length >= 3) {
      const [formulaValue, selectedConstant, termValue] = result;

      // Perform substitution: replace constant with variable
      let newBody = formulaValue.split(selectedConstant).join(termValue);
      let newFormula = "∃" + termValue + " (" + newBody + ")";

      newFormula = formulaToString(checkWithAntlr(newFormula), 0);
      fitchMain.addRowToBranch(newFormula, "∃I " + (proofs[0].index + 1));
      return 0;
    }
  } catch (error) {
    console.log("Modal cancelled:", error);
  }
  return -1;
}

// Rule 16: Existential Elimination (\exists E)
export function sixteenthRule(proofs, branches) {
  if (proofs.length !== 1 || branches.length !== 1) {
    return -1;
  }

  let existFormula = getCleanFormula(proofs[0].element);
  let parsedExist = getProof(checkWithAntlr(existFormula));

  if (parsedExist.type !== "exists") {
    alert(t("alert-exists-required"));
    return -1;
  }

  let allFormula = branches[0].element.querySelectorAll('.fitch_formula');
  let conclusion = getCleanFormula(allFormula[allFormula.length - 1]);

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  const indexStart = allFitchFormulas.indexOf(allFormula[0]);
  const indexFinish = allFitchFormulas.indexOf(allFormula[allFormula.length - 1]);

  branches[0].element.classList.add('finished');
  branches[0].element.style.paddingBottom = '0px';
  fitchMain.setBranchIndex(fitchMain.branchIndex - 1);

  fitchMain.addRowToBranch(conclusion, "∃E " + (proofs[0].index + 1) + ", " + (indexStart + 1) + "-" + (indexFinish + 1));
  return 0;
}

// Rule 17: Identity Introduction (= I)
export async function seventeenthRule(proofs, branches) {
  // No need to remove indices here as we're using a modal for a new term

  try {
    const term = await createInputModal(t('rule-identity-intro'), t('modal-enter-term'));

    if (term) {
      let newFormula = term + " = " + term;
      fitchMain.addRowToBranch(newFormula, "= I");
      return 0;
    }
  } catch (error) {
    console.log("Modal cancelled:", error);
  }
  return -1;
}

// Rule 18: Identity Elimination (= E)
export async function eighteenthRule(proofs, branches) {
  if (proofs.length !== 2 || branches.length > 0) {
    return -1;
  }

  let f1 = getCleanFormula(proofs[0].element);
  let f2 = getCleanFormula(proofs[1].element);

  let parsed1 = getProof(checkWithAntlr(f1));
  let parsed2 = getProof(checkWithAntlr(f2));

  let equality = null;
  let target = null;
  let targetString = null;
  let targetIndex = -1;
  let eqIndex = -1;

  if (parsed1.type === 'equality') {
    equality = parsed1;
    target = parsed2;
    targetString = f2;
    eqIndex = proofs[0].index;
    targetIndex = proofs[1].index;
  } else if (parsed2.type === 'equality') {
    equality = parsed2;
    target = parsed1;
    targetString = f1;
    eqIndex = proofs[1].index;
    targetIndex = proofs[0].index;
  } else {
    alert(t("alert-equality-required"));
    return -1;
  }

  try {
    const result = await createModalForLeibniz(target, targetString);

    if (result && result.left) {
      fitchMain.addRowToBranch(result.left, "= E " + (eqIndex + 1) + ", " + (targetIndex + 1));
      return 0;
    }
  } catch (error) {
    console.log("Modal cancelled:", error);
  }
  return -1;
}

