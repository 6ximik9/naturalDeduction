import * as index from "./GentzenProof";
// import {createTestProof, currentLevel, lastSide, level, saveTree, side} from "./index";
import {createTestProof, currentLevel, lastSide, level, saveTree, side} from "./GentzenProof";
import * as deductive from "./deductiveEngine";

export function firstRule() {
  index.setCurrentLevel(1);
  let data = {
    level: index.level,  // Додаємо поле level
    proof: {type: "atom", value: "⊥"}
  };
  index.setLevel(index.level + 1);

  index.addConclusions(data);
}

export function secondRule(context) {
  // currentLevel = 2;
  index.setCurrentLevel(2);
  let innerText = '¬(' + side.innerText + ')';

  let hp = {
    level: level,  // Додаємо поле level
    hyp: deductive.checkWithAntlr(innerText)
  };

  index.lastSide.id = index.lastSide.id + 'divId-' + deductive.convertToLogicalExpression(hp.hyp);

  // context.hypotheses.push(hp);
  index.addHypotheses(hp);

  let con = {
    level: level,  // Додаємо поле level
    proof: {type: "atom", value: "⊥"}
  };

  index.setLevel(index.level + 1);
  index.addConclusions(con);
  // context.conclusions.push(con);
}

export function thirdRule() {
  index.setCurrentLevel(3);
  let data = {
    level: level,  // Додаємо поле level
    proof: {type: "atom", value: " "}
  };
  index.setLevel(index.level + 1);

  index.addConclusions(data);
}

export function fourthRule() {
  index.setCurrentLevel(4);
  let innerText = side.innerText.replace('¬', '');

  let hp = {
    level: level,  // Додаємо поле level
    hyp: deductive.checkWithAntlr(innerText)
  };
  // index.setLevel(index.level+1);

  index.lastSide.id = index.lastSide.id + 'divId-' + deductive.convertToLogicalExpression(hp.hyp);

  index.addHypotheses(hp);

  let data = {
    level: level,  // Додаємо поле level
    proof: {type: "atom", value: "⊥"}
  };
  index.setLevel(index.level + 1);

  index.addConclusions(data);

}


export function fifthRule() {
  index.setCurrentLevel(5);
  let newConclusion = {
    level: level,  // Додаємо поле level
    proof: ["φ"]
  };

  index.createTestProof(newConclusion);

  let btnSave = document.getElementById('saveBtn');

  btnSave.addEventListener('click', index.saveTree)
}

export function sixthRule() {
  index.setCurrentLevel(6);

  // let proof = JSON.parse(innerText.replaceAll('divItem-', ""));
  let proof = deductive.checkWithAntlr(index.lastSide.querySelector('#proofText').textContent);

  proof = deductive.getProof(proof);

  let newConclusion = {
    level: level,  // Додаємо поле level
    proof: [proof.left, proof.right]
  };

  index.setLevel(index.level + 1);
  // context.conclusions.push(newConclusion);
  index.addConclusions(newConclusion)
}


export function seventhRule() {
  index.setCurrentLevel(7);
  let innerText = index.lastSide.querySelector('#proofText').textContent;
  let newConclusion = {
    level: level,  // Додаємо поле level
    proof: ['(' + innerText + ')' + '∧' + '()']
  };

  index.createTestProof(newConclusion);

  let btnSave = document.getElementById('saveBtn');

  btnSave.addEventListener('click', index.saveTree)
}


export function eighthRule() {
  index.setCurrentLevel(8);
  // let innerText = lastSide.innerText;
  let innerText = index.lastSide.querySelector('#proofText').textContent;
  let newConclusion = {
    level: level,  // Додаємо поле level
    proof: ['()' + '∧' + '(' + innerText + ')']
  };

  index.createTestProof(newConclusion);

  let btnSave = document.getElementById('saveBtn');

  btnSave.addEventListener('click', index.saveTree)

}



export function ninthRule() {
  index.setCurrentLevel(9);
  let proof = deductive.checkWithAntlr(index.lastSide.querySelector('#proofText').textContent);

  proof = deductive.getProof(proof);

  let newConclusion = {
    level: level,  // Додаємо поле level
    proof: proof.left
  };

  index.setLevel(index.level + 1);

  index.addConclusions(newConclusion);
  // context.conclusions.push(newConclusion);

}




export function tenthRule() {
  index.setCurrentLevel(10);
  // let innerText = lastSide.querySelector('#proofText').textContent;
  // let proof = JSON.parse(innerText.replace('divItem-', ""));
  let proof = deductive.checkWithAntlr(index.lastSide.querySelector('#proofText').textContent);

  proof = deductive.getProof(proof);

  let newConclusion = {
    level: level,  // Додаємо поле level
    proof: proof.right
  };

  index.setLevel(index.level + 1);

  index.addConclusions(newConclusion);
}

export function eleventhRule() {
  index.setCurrentLevel(11);
  // let innerText = lastSide.querySelector('#proofText').textContent;
  // let proof = JSON.parse(innerText.replace('divItem-', ""));
  let proof = deductive.checkWithAntlr(index.lastSide.querySelector('#proofText').textContent);

  proof = deductive.getProof(proof);

  let newConclusion = {
    level: level,  // Додаємо поле level
    proof: ["φ∨ψ", proof.value, proof.value]
  };

  index.createTestProof(newConclusion);

  let btnSave = document.getElementById('saveBtn');

  btnSave.addEventListener('click', index.saveTree)
}


export function twelfthRule() {
  index.setCurrentLevel(12);
  // let pr = JSON.parse(lastSide.className.replace('divItem-', ""));
  let pr = deductive.checkWithAntlr(index.lastSide.querySelector('#proofText').textContent);

  pr = deductive.getProof(pr);

  let data = {
    level: level,  // Додаємо поле level
    hyp: pr.left
  };


  index.lastSide.id = index.lastSide.id + 'divId-' + deductive.convertToLogicalExpression(pr.left);


// Перевірка, чи немає елемента з таким же hyp у масиві
  let isElementAlreadyExists = index.deductionContext.hypotheses.some(function (item) {
    return JSON.stringify(item.hyp) === JSON.stringify(data.hyp);
  });

  if (!isElementAlreadyExists) {
    index.addHypotheses(data);
  }

  // Додаємо висновок до списку висновків
  let newConclusion = {
    level: level,  // Додаємо поле level
    proof: deductive.getProof(pr.right)
  };

  index.setLevel(index.level + 1);

  // context.conclusions.push(newConclusion);
  index.addConclusions(newConclusion);
}


export function thirteenthRule() {
  index.setCurrentLevel(13);
  let innerText = index.lastSide.querySelector('#proofText').textContent;
  let newConclusion = {
    level: level,  // Додаємо поле level
    proof: ["()⇒(" + innerText + ")"]
  };

  index.createTestProof(newConclusion);

  let btnSave = document.getElementById('saveBtn');

  btnSave.addEventListener('click', index.saveTree)

}
