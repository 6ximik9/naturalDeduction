import {side} from "./index";
import {currentLevel} from "./index";
import {state} from "./index";
import {deductionContext} from "./index";
import {level} from "./index";
import {userHypotheses} from "./index";
import {lastSide} from "./index";
import {setState} from "./index";
import {setLevel} from "./index";
import {setSide} from "./index";
import {setCurrentLevel} from "./index";
import {setUserHypotheses} from "./index";
import {setLastSide} from "./index";

let backwardButton = document.getElementById('backwardButton');
let forwardButton = document.getElementById('forwardButton');
let allProof = document.getElementById('proof');

let elementsAndVariablesArray = [];

// Додаємо обробник події "клік" для кнопок
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
    setState(state-1);
  }
  setState(state-1);
  if (state < 0) {
    location.reload(true);
    // alert("start");
    // state = 0;
    return;
  }
  getState(state);

  if (state === 0) {
    backwardButton.innerHTML = backwardButton.innerHTML.replace("Back", "New formula");
  }
});


forwardButton.addEventListener('click', function () {
  setState(state+1);
  if (!elementsAndVariablesArray[state]) {
    setState(state-1);
    return;
  }
  getState(state);
  backwardButton.innerHTML = backwardButton.innerHTML.replace("New formula", "Back");

});

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
  // deductionContext = JSON.parse(JSON.stringify(variables.deductionContext));
  deductionContext.hypotheses = JSON.parse(JSON.stringify(variables.deductionContext)).hypotheses;
  deductionContext.conclusions = JSON.parse(JSON.stringify(variables.deductionContext)).conclusions;
  // level = variables.level;
  // currentLevel = variables.currentLevel;
  // userHypotheses = variables.userHypotheses;
  // side = variables.side;
  // lastSide = variables.lastSide;
  setLevel(variables.level);
  setCurrentLevel(variables.currentLevel);
  setUserHypotheses(variables.userHypotheses);
  setSide(variables.side);
  setLastSide(variables.lastSide);
  // showAllHyp();
}


export function saveState() {
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
  }
  addElementWithIndex(elementData, state);
}

function addElementWithIndex(elementData, index) {
  // Створюємо об'єкт з даними елемента та його індексом
  let elementWithIndex = {data: elementData, index: index};
  // Додаємо об'єкт до масиву
  elementsAndVariablesArray.push(elementWithIndex);
  setState(state+1);
}
