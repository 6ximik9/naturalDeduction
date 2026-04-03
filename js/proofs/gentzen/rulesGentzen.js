
import * as index from "./GentzenProof";
import * as deductive from "../../core/deductiveEngine";
import {
  createModal,
  createModalForQuantifierSubstitution,
  performSubstitution
} from "../../ui/modals/substitution";
import {checkWithAntlr, convertToLogicalExpression, getProof} from "../../core/deductiveEngine";
import {createAdvancedModal} from "../../ui/modals/existentialIntro";
import {createModalForReturn} from "../../ui/modals/quantifierReturn";
import { createModalForLeibniz } from '../../ui/modals/leibniz.js';
import { createInputModal } from '../../ui/modals/input.js';
import { showToast } from '../../ui/notifications.js';
import { t } from '../../core/i18n.js';

// Утиліти
function createConclusion(proof) {
  index.addConclusions({ level: index.level, proof });
  index.setLevel(index.level + 1);
}

export function parseProofFromLastSide() {
  const text = index.lastSide.querySelector('#proofText')?.textContent;
  const parsed = deductive.checkWithAntlr(text);
  return deductive.getProof(parsed);
}

export function createAxiomConclusion(axiomText, axiomLevel) {
  index.setCurrentLevel(axiomLevel);
  const parsed = deductive.checkWithAntlr(axiomText);
  const proof = deductive.getProof(parsed);
  createConclusion(proof);
}

// 1. ⊥-введення
export function firstRule() {
  index.setCurrentLevel(1);
  createConclusion({ type: "atom", value: "⊥" });
}
// 2. Введення заперечення
export function secondRule() {
  index.setCurrentLevel(2);
  const pr = parseProofFromLastSide();
  const cleanFormula = deductive.getProof(pr);
  const cleanText = deductive.convertToLogicalExpression(cleanFormula);
  
  // Додаємо дужки лише для складних бінарних операцій
  const complexTypes = ['implication', 'disjunction', 'conjunction', 'equality', 'addition', 'multiplication'];
  const needsParens = complexTypes.includes(cleanFormula.type);
  const innerText = '¬' + (needsParens ? '(' + cleanText + ')' : cleanText);

  const hyp = deductive.checkWithAntlr(innerText);

  index.addHypotheses({ level: index.level, hyp });

  createConclusion({ type: "atom", value: "⊥" });
}

// 3. Порожній висновок
export function thirdRule() {
  index.setCurrentLevel(3);
  createConclusion({ type: "atom", value: " " });
}

// 4. Виведення з ¬
export function fourthRule() {
  index.setCurrentLevel(4);
  const pr = parseProofFromLastSide();
  let hyp;
  if (pr && pr.type === 'negation' && pr.operand) {
    hyp = deductive.getProof(pr.operand);
  } else {
    const innerText = index.lastSide.querySelector('#proofText')?.textContent.replace('¬', '');
    hyp = deductive.checkWithAntlr(innerText);
  }

  index.addHypotheses({ level: index.level, hyp });

  createConclusion({ type: "atom", value: "⊥" });
}

// 5. Тестовий висновок φ
export async function fifthRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(5);
  
  try {
    const inputText = await createInputModal(t("rule-neg-e"), t("modal-enter-phi"), "φ");
    
    const parsedPhi = deductive.checkWithAntlr(inputText);
    const parsedNotPhi = deductive.checkWithAntlr(`!(${inputText})`);
    
    createConclusion([parsedPhi, parsedNotPhi]);
  } catch (error) {
    if (deductive.handleModalCancellation("Rule 5", error)) {
      index.setCurrentLevel(previousLevel);
      return;
    }
    throw error;
  }
}

// 6. Виведення з подвійного висновку
export function sixthRule() {
  index.setCurrentLevel(6);
  const proof = parseProofFromLastSide();

  // Handle new left/right structure and legacy operands structure
  if (proof.left && proof.right) {
    createConclusion([proof.left, proof.right]);
  } else if (proof.operands && proof.operands.length >= 2) {
    createConclusion(proof.operands);
  } else {
    console.error("Invalid conjunction structure:", proof);
  }
}

// 7. Введення кон’юнкції (ліва частина)
export async function seventhRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(7);
  
  try {
    const innerText = index.lastSide.querySelector('#proofText')?.textContent;
    const initialText = `(${innerText}) ∧ ()`;
    
    const inputText = await createInputModal(t("rule-and-e1"), t("modal-enter-full-conj"), initialText);
    
    const parsed = deductive.checkWithAntlr(inputText);
    if (parsed.type !== 'conjunction') {
      showToast(t("alert-not-conjunction"));
      index.setCurrentLevel(previousLevel);
      return;
    }
    
    createConclusion(parsed);
  } catch (error) {
    if (deductive.handleModalCancellation("Rule 7", error)) {
      index.setCurrentLevel(previousLevel);
      return;
    }
    throw error;
  }
}

// 8. Введення кон’юнкції (права частина)
export async function eighthRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(8);
  
  try {
    const innerText = index.lastSide.querySelector('#proofText')?.textContent;
    const initialText = `() ∧ (${innerText})`;
    
    const inputText = await createInputModal(t("rule-and-e2"), t("modal-enter-full-conj"), initialText);
    
    const parsed = deductive.checkWithAntlr(inputText);
    if (parsed.type !== 'conjunction') {
      showToast(t("alert-not-conjunction"));
      index.setCurrentLevel(previousLevel);
      return;
    }
    
    createConclusion(parsed);
  } catch (error) {
    if (deductive.handleModalCancellation("Rule 8", error)) {
      index.setCurrentLevel(previousLevel);
      return;
    }
    throw error;
  }
}


// 9. Елімінація диз’юнкції (ліва частина)
export function ninthRule() {
  index.setCurrentLevel(9);
  const proof = parseProofFromLastSide();

  // Handle new left/right structure and legacy operands structure
  if (proof.left) {
    createConclusion(proof.left);
  } else if (proof.operands && proof.operands.length >= 1) {
    createConclusion(proof.operands[0]);
  } else {
    console.error("Invalid disjunction structure for left operand:", proof);
  }
}

// 10. Елімінація диз’юнкції (права частина)
export function tenthRule() {
  index.setCurrentLevel(10);
  const proof = parseProofFromLastSide();

  // Handle new left/right structure and legacy operands structure
  if (proof.right) {
    createConclusion(proof.right);
  } else if (proof.operands && proof.operands.length >= 2) {
    createConclusion(proof.operands[1]);
  } else {
    console.error("Invalid disjunction structure for right operand:", proof);
  }
}

// 11. Введення диз’юнкції (Елімінація диз'юнкції ∨E)
export async function eleventhRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(11);
  
  try {
    const inputText = await createInputModal(t("rule-or-e"), t("modal-enter-full-disj"), "φ∨ψ");
    
    const parsedInput = deductive.checkWithAntlr(inputText);
    if (parsedInput.type !== 'disjunction') {
      showToast(t("alert-not-disjunction"));
      index.setCurrentLevel(previousLevel);
      return;
    }
    
    const baseText = index.lastSide.querySelector('#proofText')?.textContent;
    const parsedBase = deductive.checkWithAntlr(baseText);
    
    createConclusion([parsedInput, parsedBase, parsedBase]);
  } catch (error) {
    if (deductive.handleModalCancellation("Rule 11", error)) {
      index.setCurrentLevel(previousLevel);
      return;
    }
    throw error;
  }
}

// 12. Імплікація: додавання гіпотези та висновку
export function twelfthRule() {
  index.setCurrentLevel(12);
  const pr = parseProofFromLastSide();

  // Handle new left/right structure and legacy operands structure
  let hyp, conclusion;
  if (pr.left && pr.right) {
    hyp = deductive.getProof(pr.left);
    conclusion = deductive.getProof(pr.right);
  } else if (pr.operands && pr.operands.length >= 2) {
    hyp = deductive.getProof(pr.operands[0]);
    conclusion = deductive.getProof(pr.operands[1]);
  } else {
    console.error("Invalid implication structure:", pr);
    return;
  }

  index.addHypotheses({ level: index.level, hyp });

  createConclusion(conclusion);
}

// 13. Введення імплікації (Елімінація імплікації ⇒E)
export async function thirteenthRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(13);
  
  try {
    const innerText = index.lastSide.querySelector('#proofText')?.textContent;
    const initialText = "()⇒(" + innerText + ")";
    
    const inputText = await createInputModal(t("rule-imp-e"), t("modal-enter-full-imp"), initialText);
    
    const parsedInput = deductive.checkWithAntlr(inputText);
    if (parsedInput.type !== 'implication') {
      showToast(t("alert-not-implication"));
      index.setCurrentLevel(previousLevel);
      return;
    }
    
    const parsedLeft = parsedInput.left;
    
    createConclusion([parsedLeft, parsedInput]);
  } catch (error) {
    if (deductive.handleModalCancellation("Rule 13", error)) {
      index.setCurrentLevel(previousLevel);
      return;
    }
    throw error;
  }
}

// 14. Існування: підстановка (∃-елімінація)
export async function fourteenthRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(14);
  try {
    const formulaString = index.lastSide.querySelector('#proofText')?.textContent;
    const formula = deductive.checkWithAntlr(formulaString);

    const result = await createModalForQuantifierSubstitution(formula, formulaString);
    console.log(result);
    const proof = getProof(deductive.checkWithAntlr(result.formula));
    index.setReplaces(result.substitution);
    createConclusion(proof);
  } catch (error) {
    if (deductive.handleModalCancellation("Rule 14", error)) {
      index.setCurrentLevel(-1); // Restore previous level
      return; // Gracefully exit without doing anything
    }
    console.error("Error in fourteenthRule:", error);
    throw error; // Re-throw non-cancellation errors
  }
}

// 15. Універсальна підстановка (∀-елімінація)
export async function fifteenthRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(15);
  try {
    const formulaString = index.lastSide.querySelector('#proofText')?.textContent;
    const formula = deductive.checkWithAntlr(formulaString);

    const result = await createModalForQuantifierSubstitution(formula, formulaString);
    console.log(result);
    const proof = getProof(deductive.checkWithAntlr(result.formula));
    index.setReplaces(result.substitution);
    createConclusion(proof);
  } catch (error) {
    if (deductive.handleModalCancellation("Rule 15", error)) {
      index.setCurrentLevel(-1); // Restore previous level
      return; // Gracefully exit without doing anything
    }
    console.error("Error in fifteenthRule:", error);
    throw error; // Re-throw non-cancellation errors
  }
}

// 16. Введення ∀
export async function sixteenthRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(16);
  try {
    const innerText = index.lastSide.querySelector('#proofText')?.textContent;

    // Шукаємо елементи замін у поточному вузлі або його батьках
    let replElements = index.lastSide.querySelectorAll('#repl');
    if (replElements.length === 0) {
        // Якщо не знайдено прямо в вузлі, спробуємо знайти в найближчому контейнері вузла
        const nodeContainer = index.lastSide.closest('[id^="divId-"]');
        if (nodeContainer) {
            replElements = nodeContainer.querySelectorAll('#repl');
        }
    }
    
    const replValues = Array.from(replElements).map(el => el.textContent);
    console.log("Found replacements:", replValues);

    const formulaString = index.lastSide.querySelector('#proofText')?.textContent;
    const formula = deductive.checkWithAntlr(formulaString);

    const result = await createModalForReturn(replValues, formula, formulaString);

    console.log(result);
    const repl = result.selectedConstant ? result.selectedConstant.split("/", 2)[0] : result.replacement;
    console.log(repl);

    // Create the forall node directly instead of constructing a string
    const modifiedFormulaNode = deductive.checkWithAntlr(result.modifiedFormula);
    const rule = {
      type: 'forall',
      variable: repl[0],
      operand: modifiedFormulaNode
    };
    createConclusion(rule);

    // const rule = deductive.checkWithAntlr('(∀' + repl[0] + ')';
    // createConclusion(rule);
    // const repl = result[0].split("/", 2);
    // console.log(repl);
    // const ast = deductive.checkWithAntlr(innerText);
    // console.log(ast);
    //
    // // Use precise replacement - replace only the selected term, not all occurrences
    // const replacementCount = deductive.updateTermsFirst(ast, repl[1], repl[0]);
    // console.log(`Replaced ${replacementCount} occurrence(s) of "${repl[1]}" with "${repl[0]}"`);
    // console.log(ast);
    //
    // const rule = deductive.checkWithAntlr('(∀' + repl[0] + ')' + deductive.convertToLogicalExpression(ast));
    // createConclusion(rule);
  } catch (error) {
    if (deductive.handleModalCancellation("Rule 16", error)) {
      index.setCurrentLevel(previousLevel); // Restore previous level
      return; // Gracefully exit without doing anything
    }
    console.error("Error in sixteenthRule:", error);
    throw error; // Re-throw non-cancellation errors
  }
}

// 17.
export async function seventeenthRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(17);
  try {
    const innerText = index.lastSide.querySelector('#proofText')?.textContent;
    const rightSide = getProof(deductive.checkWithAntlr(innerText));

    const allHyp = deductive.getAllHypotheses(index.lastSide);
    const allHypArray = allHyp.map(constant => deductive.convertToLogicalExpression(constant));

    console.log(allHypArray);
    const result = await createAdvancedModal(allHypArray)
    const leftSide = getProof(deductive.checkWithAntlr(result[0]));

    createConclusion([leftSide, rightSide]);
    console.log("test");
    console.log(deductive.checkWithAntlr(result[0]).operand);
    let ast = getProof(getProof(deductive.checkWithAntlr(result[0]).operand));

    // Use precise replacement - replace only the selected term, not all occurrences
    const replacementCount = deductive.updateTermsFirst(ast, result[1], result[2]);
    console.log(`Replaced ${replacementCount} occurrence(s) of "${result[1]}" with "${result[2]}"`);

    // Повертаємо гіпотезу для правої частини
    return ast
  } catch (error) {
    if (deductive.handleModalCancellation("Rule 17", error)) {
      index.setCurrentLevel(previousLevel); // Restore previous level
      return; // Gracefully exit without doing anything
    }
    console.error("Error in seventeenthRule:", error);
    throw error; // Re-throw non-cancellation errors
  }
}

// 18.
export async function eighteenthRule() {
  index.setCurrentLevel(18);
  try {
    const formulaString = index.lastSide.querySelector('#proofText')?.textContent;
    const formula = deductive.checkWithAntlr(formulaString);

    const result = await createModalForLeibniz(formula, formulaString, 'a=b');

    console.log(result);

    createConclusion([deductive.checkWithAntlr(result.left), deductive.checkWithAntlr(result.right)]);

  } catch (error) {
    if (deductive.handleModalCancellation("Rule 18", error)) {
      index.setCurrentLevel(-1); // Restore previous level
      return; // Gracefully exit without doing anything
    }
    console.error("Error in eighteenthRule:", error);
    throw error; // Re-throw non-cancellation errors
  }
}

// 19.
export async function nineteenthRule() {
  index.setCurrentLevel(19);
  try {
    const formulaString = index.lastSide.querySelector('#proofText')?.textContent;
    const formula = deductive.checkWithAntlr(formulaString);

    const result = await createModalForLeibniz(formula, formulaString, 'b=a');

    console.log(result);

    createConclusion([deductive.checkWithAntlr(result.left), deductive.checkWithAntlr(result.right)]);

  } catch (error) {
    if (deductive.handleModalCancellation("Rule 19", error)) {
      index.setCurrentLevel(-1); // Restore previous level
      return; // Gracefully exit without doing anything
    }
    console.error("Error in nineteenthRule:", error);
    throw error; // Re-throw non-cancellation errors
  }
}

// 20.
export async function twentiethRule() {
  index.setCurrentLevel(20);
  const innerText = index.lastSide.querySelector('#proofText')?.textContent;
  const proof = getProof(deductive.checkWithAntlr(innerText));

  // Handle equality structure
  let leftSide, rightSide;
  if (proof.left && proof.right) {
    leftSide = 'P(' + convertToLogicalExpression(proof.left) + ')';
    rightSide = 'P(' + convertToLogicalExpression(proof.right) + ')';
  } else {
    console.error("Invalid equality structure:", proof);
    return;
  }

  createConclusion([getProof(deductive.checkWithAntlr(leftSide)), getProof(deductive.checkWithAntlr(rightSide))]);
}

// 21. Mathematical Induction
export async function induction() {
  index.setCurrentLevel(21);
  const innerText = index.lastSide.querySelector('#proofText')?.textContent;
  const proof = getProof(deductive.checkWithAntlr(innerText));

  console.log("Ind");
  console.log(proof);

  // Base case: P(0)
  var leftSideText = performSubstitution(proof.operand, proof.variable, "0");
  // Inductive step: P(s(x))
  var rightSideText = performSubstitution(proof.operand, proof.variable, "s(x)");
  var leftSide = getProof(checkWithAntlr(leftSideText));
  var rightSide = getProof(checkWithAntlr(rightSideText));

  createConclusion([leftSide, rightSide]);
  console.log("Base case:", leftSide);
  console.log("Inductive step:", rightSide);

  // Повертаємо гіпотезу індукції P(x) для правої частини
  const inductionHypothesisText = performSubstitution(proof.operand, proof.variable, "x");
  const inductionHypothesis = getProof(checkWithAntlr(inductionHypothesisText));

  console.log("Induction hypothesis:", inductionHypothesis);
  return inductionHypothesis;
}

export function axRule() {
  const side = index.lastSide;
  const currentFormulaText = side.querySelector('#proofText').textContent;
  const parsed = deductive.checkWithAntlr(currentFormulaText);
  const proof = deductive.getProof(parsed);

  index.setNameRule("Ax");
  index.setCurrentLevel(40); // Set unique level for (Ax) to avoid conflicts with other rules (e.g. 12)
  const size = index.deductionContext.conclusions.length - 1;
  index.addConclusions({ level: index.level, proof });
  index.setLevel(index.level + 1);

  const newConclusion = index.deductionContext.conclusions[size + 1];
  index.createProofTree(newConclusion, side);

  // Mark as closed manually with the pleasant green color (class 'closed')
  // and make it non-clickable for rules (class 'previous')
  const axiomElement = document.querySelector(`.proof-element_level-${newConclusion.level}`);
  if (axiomElement) {
    const proofDiv = axiomElement.querySelector('.proof-content')?.parentElement;
    if (proofDiv) {
      proofDiv.className = 'closed';

      // Make label and content non-clickable by adding 'previous' class
      const label = proofDiv.querySelector('#proofText');
      if (label) label.classList.add('previous');

      const proofContent = proofDiv.querySelector('.proof-content');
      if (proofContent) proofContent.classList.add('previous');
    }
  }
  index.disableAllButtons();
  index.setSide(null);
  index.clearLabelHighlights();
}
