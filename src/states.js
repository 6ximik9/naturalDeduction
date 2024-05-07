import {side} from "./GentzenProof";
import {currentLevel} from "./GentzenProof";
import {state} from "./GentzenProof";
import {deductionContext} from "./GentzenProof";
import {level} from "./GentzenProof";
import {userHypotheses} from "./GentzenProof";
import {lastSide} from "./GentzenProof";
import {setState} from "./GentzenProof";
import {setLevel} from "./GentzenProof";
import {setSide} from "./GentzenProof";
import {setCurrentLevel} from "./GentzenProof";
import {setUserHypotheses} from "./GentzenProof";
import {setLastSide} from "./GentzenProof";
import {
  branchIndex, clearItems,
  clickedBranch,
  clickedProofs,
  fitchStates, setBranchIndex, setClickedBranch, setClickedProofs,
  setStateFitch,
  setUserHypothesesFitch
} from "./FitchProof";


let backwardButton = document.getElementById('backwardButton');
let forwardButton = document.getElementById('forwardButton');
let allProof = document.getElementById('proof');

let elementsAndVariablesArray = [];


// Додаємо обробник події "клік" для кнопок
export function addNextLastButtonClickGentzen() {
  backwardButton.addEventListener('click', function () {
    if (currentLevel === 5 || currentLevel === 11 || currentLevel === 13 || currentLevel === 7 || currentLevel === 8) {
      const divToRemove = document.getElementById("preview");
      if (divToRemove) {
        divToRemove.remove();
        document.getElementById('keyProof').className = 'hidden';
        return;
      }
    }

    if (!elementsAndVariablesArray[state]) {
      setState(state - 1);
    }
    setState(state - 1);
    if (state < 0) {
      location.reload(true);
      return;
    }
    getState(state);

    if (state === 0) {
      backwardButton.innerHTML = backwardButton.innerHTML.replace("Back", "New formula");
      homeButton.parentElement.style.display = 'none';
    }
  });


  forwardButton.addEventListener('click', function () {
    setState(state + 1);
    if (!elementsAndVariablesArray[state]) {
      setState(state - 1);
      return;
    }
    getState(state);
    backwardButton.innerHTML = backwardButton.innerHTML.replace("New formula", "Back");
    homeButton.parentElement.style.display = 'flex';
  });
}


export function addNextLastButtonClickFitch() {
  backwardButton.addEventListener('click', function () {

    if (!elementsAndVariablesArray[fitchStates]) {
      setStateFitch(fitchStates - 1);
    }

    setStateFitch(fitchStates - 1);
    if (fitchStates < 0) {
      location.reload(true);
      return;
    }
    getStateFitch(fitchStates);

    if (fitchStates === 0) {
      backwardButton.innerHTML = backwardButton.innerHTML.replace("Back", "New formula");
      homeButton.parentElement.style.display = 'none';
    }
  });


  forwardButton.addEventListener('click', function () {
    setStateFitch(fitchStates + 1);
    if (!elementsAndVariablesArray[fitchStates]) {
      setStateFitch(fitchStates - 1);
      return;
    }
    getStateFitch(fitchStates);
    backwardButton.innerHTML = backwardButton.innerHTML.replace("New formula", "Back");
    homeButton.parentElement.style.display = 'flex';
  });
}

export function saveStateFitch() {

  // Отримуємо елемент "proof"
  var proofDiv = document.getElementById('proof').cloneNode(true);

  // Отримуємо всі дочірні елементи елемента "proof" та створюємо копію
  var childElements = Array.from(proofDiv.children).map(function (element) {
    return element.cloneNode(true);
  });

  // Створюємо об'єкт з даними елемента та його змінними
  var elementData = {
    element: childElements, variables: {
      clickedProofs: JSON.parse(JSON.stringify(clickedProofs)),
      clickedBranch: JSON.parse(JSON.stringify(clickedBranch)),
      branchIndex: branchIndex
    }
  };

  // Додаємо цей об'єкт до масиву
  setStateFitch(elementsAndVariablesArray.length);
  if (fitchStates > 0) {
    backwardButton.innerHTML = backwardButton.innerHTML.replace("New formula", "Back");
    homeButton.parentElement.style.display = 'flex';
  }
  addElementWithIndex(elementData, fitchStates);
}


function getStateFitch(id) {
  document.getElementById('proof-menu').className = 'hidden';
  document.getElementById('hypotheses-container').style.display = "none";

  // Отримуємо останній елемент масиву
  var lastElementData = elementsAndVariablesArray[id].data;

  // Очищаємо div з id "proof"
  allProof.innerHTML = '';

  // Додаємо кожен елемент з останнього об'єкта масиву до div з id "proof"
  lastElementData.element.forEach(function (childElement) {
    allProof.appendChild(childElement.cloneNode(true));
  });

  // Оновлюємо значення змінних з останнього об'єкта
  var variables = lastElementData.variables;
  setClickedProofs(JSON.parse(JSON.stringify(variables.clickedProofs)));
  setClickedBranch(JSON.parse(JSON.stringify(variables.clickedBranch)));
  setBranchIndex(variables.branchIndex);
  clearItems();
}

function getState(id) {
  document.getElementById('proof-menu').className = 'hidden';
  document.getElementById('hypotheses-container').style.display = "none";

  // Отримуємо останній елемент масиву
  var lastElementData = elementsAndVariablesArray[id].data;

  // Очищаємо div з id "proof"
  allProof.innerHTML = '';

  // Додаємо кожен елемент з останнього об'єкта масиву до div з id "proof"
  lastElementData.element.forEach(function (childElement) {
    allProof.appendChild(childElement.cloneNode(true));
  });

  // Оновлюємо значення змінних з останнього об'єкта
  var variables = lastElementData.variables;
  deductionContext.hypotheses = JSON.parse(JSON.stringify(variables.deductionContext)).hypotheses;
  deductionContext.conclusions = JSON.parse(JSON.stringify(variables.deductionContext)).conclusions;
  setLevel(variables.level);
  setCurrentLevel(variables.currentLevel);
  setUserHypotheses(variables.userHypotheses);
  setSide(variables.side);
  setLastSide(variables.lastSide);
  // showAllHyp();
}


export function saveState() {

  const container = document.getElementById('proof');
  const labels = container.querySelectorAll('label');
  labels.forEach(label => {
    label.style.background = '';
  });

  // Отримуємо елемент "proof"
  var proofDiv = document.getElementById('proof').cloneNode(true);

  // Отримуємо всі дочірні елементи елемента "proof" та створюємо копію
  var childElements = Array.from(proofDiv.children).map(function (element) {
    return element.cloneNode(true);
  });

  // Створюємо об'єкт з даними елемента та його змінними
  var elementData = {
    element: childElements, variables: {
      deductionContext: JSON.parse(JSON.stringify(deductionContext)),
      level: level,
      currentLevel: currentLevel,
      userHypotheses: userHypotheses,
      side: side,
      lastSide: lastSide
    }
  };

  // Додаємо цей об'єкт до масиву
  // state = elementsAndVariablesArray.length;
  setState(elementsAndVariablesArray.length);
  if (state > 0) {
    backwardButton.innerHTML = backwardButton.innerHTML.replace("New formula", "Back");
    homeButton.parentElement.style.display = 'flex';
  }
  addElementWithIndex(elementData, state);
}

function addElementWithIndex(elementData, index) {
  // Створюємо об'єкт з даними елемента та його індексом
  let elementWithIndex = {data: elementData, index: index};
  // Додаємо об'єкт до масиву
  elementsAndVariablesArray.push(elementWithIndex);
  setState(state + 1);
}

var homeButton = document.getElementById("home");
homeButton.addEventListener("click", function () {
  var confirmation = confirm("Are you sure you want to go to the main page?");
  if (confirmation) {
    location.reload(true);
  }
});
