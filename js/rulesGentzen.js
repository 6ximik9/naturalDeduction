
import * as index from "./GentzenProof";
import * as deductive from "./deductiveEngine";
import { createModal } from "./modalForRules/modalForSubstitution";
import {convertToLogicalExpression, getProof} from "./deductiveEngine";
import {createAdvancedModal} from "./modalForRules/modalForSeventeenthRule";
import {createModalForReturn} from "./modalForRules/modalForReturn";

// Утиліти
function createConclusion(proof) {
  console.log(proof);
  index.addConclusions({ level: index.level, proof });
  index.setLevel(index.level + 1);
}

function createTestConclusion(proof) {
  index.createTestProof({ level: index.level, proof });
  const btnSave = document.getElementById('saveBtn');
  btnSave?.addEventListener('click', index.saveTree);
}

function parseProofFromLastSide() {
  const text = index.lastSide.querySelector('#proofText')?.textContent;
  const parsed = deductive.checkWithAntlr(text);
  return deductive.getProof(parsed);
}

// 1. ⊥-введення
export function firstRule() {
  index.setCurrentLevel(1);
  createConclusion({ type: "atom", value: "⊥" });
}
// 2. Введення заперечення
export function secondRule() {
  index.setCurrentLevel(2);
  const innerText = '¬(' + index.side.innerText + ')';
  const hyp = deductive.checkWithAntlr(innerText);

  index.lastSide.id += 'divId-' + deductive.convertToLogicalExpression(hyp);
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
  const innerText = index.side.innerText.replace('¬', '');
  const hyp = deductive.checkWithAntlr(innerText);

  index.lastSide.id += 'divId-' + deductive.convertToLogicalExpression(hyp);
  index.addHypotheses({ level: index.level, hyp });

  createConclusion({ type: "atom", value: "⊥" });
}

// 5. Тестовий висновок φ
export function fifthRule() {
  index.setCurrentLevel(5);
  createTestConclusion(["φ"]);
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
export function seventhRule() {
  index.setCurrentLevel(7);
  const innerText = index.lastSide.querySelector('#proofText')?.textContent;
  createTestConclusion(['(' + innerText + ')' + '∧' + '()']);
}

// 8. Введення кон’юнкції (права частина)
export function eighthRule() {
  index.setCurrentLevel(8);
  const innerText = index.lastSide.querySelector('#proofText')?.textContent;
  createTestConclusion(['()' + '∧' + '(' + innerText + ')']);
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

// 11. Введення диз’юнкції
export function eleventhRule() {
  index.setCurrentLevel(11);
  const proof = parseProofFromLastSide();
  const value = proof.value || proof.name || deductive.convertToLogicalExpression(proof);
  createTestConclusion(["φ∨ψ", value, value]);
}

// 12. Імплікація: додавання гіпотези та висновку
export function twelfthRule() {
  index.setCurrentLevel(12);
  const pr = parseProofFromLastSide();

  // Handle new left/right structure and legacy operands structure
  let hyp, conclusion;
  if (pr.left && pr.right) {
    hyp = pr.left;
    conclusion = deductive.getProof(pr.right);
  } else if (pr.operands && pr.operands.length >= 2) {
    hyp = pr.operands[0];
    conclusion = deductive.getProof(pr.operands[1]);
  } else {
    console.error("Invalid implication structure:", pr);
    return;
  }

  index.lastSide.id += 'divId-' + deductive.convertToLogicalExpression(hyp);

  const alreadyExists = index.deductionContext.hypotheses.some(item =>
    JSON.stringify(item.hyp) === JSON.stringify(hyp)
  );

  if (!alreadyExists) {
    index.addHypotheses({ level: index.level, hyp });
  }

  createConclusion(conclusion);
}

// 13. Введення імплікації
export function thirteenthRule() {
  index.setCurrentLevel(13);
  const innerText = index.lastSide.querySelector('#proofText')?.textContent;
  createTestConclusion(["()⇒(" + innerText + ")"]);
}

// 14. Існування: підстановка (∃-елімінація)
export async function fourteenthRule() {
  const previousLevel = index.currentLevel;
  index.setCurrentLevel(14);
  try {
    const innerText = index.lastSide.querySelector('#proofText')?.textContent;
    const proof = getProof(deductive.checkWithAntlr(innerText)).operand;
    const allConst = deductive.extractConstantsOrVariables(proof);

    console.log("Test");
    console.log(proof);

    const result = await createModal(allConst);
    console.log(result);
    index.setReplaces(result[1] + "/" + result[0]);

    // Use precise replacement - replace only the selected term, not all occurrences
    const replacementCount = deductive.updateTermsFirst(proof, result[0], result[1]);
    console.log(`Replaced ${replacementCount} occurrence(s) of "${result[0]}" with "${result[1]}"`);
    console.log(proof);

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
    const innerText = index.lastSide.querySelector('#proofText')?.textContent;
    const proof = getProof(deductive.checkWithAntlr(innerText)).operand;
    const allConst = deductive.extractConstantsOrVariables(proof);

    const result = await createModal(allConst);
    index.setReplaces(result[0] + "/" + result[1]);

    // Use precise replacement - replace only the selected term, not all occurrences
    const replacementCount = deductive.updateTermsFirst(proof, result[0], result[1]);
    console.log(`Replaced ${replacementCount} occurrence(s) of "${result[0]}" with "${result[1]}"`);
    // console.log(proof);
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

    const replElements = index.lastSide.querySelectorAll('#repl');
    const replValues = Array.from(replElements).map(el => el.textContent);
    console.log(replValues);

    const result = await createModalForReturn(replValues);

    const repl = result[0].split("/", 2);
    console.log(repl);
    const ast = deductive.checkWithAntlr(innerText);
    console.log(ast);

    // Use precise replacement - replace only the selected term, not all occurrences
    const replacementCount = deductive.updateTermsFirst(ast, repl[1], repl[0]);
    console.log(`Replaced ${replacementCount} occurrence(s) of "${repl[1]}" with "${repl[0]}"`);
    console.log(ast);

    const rule = deductive.checkWithAntlr('(∀' + repl[0] + ')' + deductive.convertToLogicalExpression(ast));
    createConclusion(rule);
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

    const result = await createAdvancedModal(allHypArray);
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
  createTestConclusion(["P(a)"]);
}

// 19.
export async function nineteenthRule() {
  index.setCurrentLevel(19);
  createTestConclusion(["P(b)"]);
}

// 20.
export async function twentiethRule() {
  index.setCurrentLevel(20);
  const innerText = index.lastSide.querySelector('#proofText')?.textContent;
  const proof = getProof(deductive.checkWithAntlr(innerText));

  // Handle equality structure
  let leftSide, rightSide;
  if (proof.left && proof.right) {
    leftSide = 'P('+ convertToLogicalExpression(proof.left) + ')';
    rightSide = 'P('+ convertToLogicalExpression(proof.right) + ')';
  } else {
    console.error("Invalid equality structure:", proof);
    return;
  }

  createConclusion([getProof(deductive.checkWithAntlr(leftSide)), getProof(deductive.checkWithAntlr(rightSide))]);
}
