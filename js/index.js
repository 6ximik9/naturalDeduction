import antlr4, {CharStreams, CommonTokenStream} from 'antlr4';
import GrammarLexer from '../my_antlr/GrammarLexer';
import GrammarParser from '../my_antlr/GrammarParser';
import * as editorMonaco from './ui/monacoEditor';
import * as gentzen from './proofs/gentzen/GentzenProof'
import * as deductive from './core/deductiveEngine';
import * as fitch from "./proofs/fitch/FitchProof";
import * as sequent from "./proofs/sequent/SequentProof";
import * as help from './ui/help';
import {setEditorError} from "./ui/monacoEditor";
import {initProofView} from "./ui/proofView";

let hasError = false;
let inputText = "";

export let typeProof = 0;

document.addEventListener("DOMContentLoaded", function() {
  // Initialize Proof View (Pan/Zoom/Resize)
  initProofView();

  // Вибираємо батьківський елемент, що містить наші радіо-кнопки
  var myDict = document.querySelector('.mydict');

  // Перевіряємо, чи міститься клікнутий елемент в цьому батьківському елементі
  myDict.addEventListener('click', function(event) {
    // Переконуємось, що клік був зроблений саме по елементу <input type="radio"> і цей елемент належить до нашого контейнера .mydict
    var target = event.target;
    if (target.type === 'radio' && target.name === 'radio') {
      if (target.nextElementSibling.textContent === "Fitch") {
        typeProof = 1;
        updateAxiomTabVisibility(false);
      } else if (target.nextElementSibling.textContent === "Sequent") {
        typeProof = 2;
        updateAxiomTabVisibility(true);
      } else
      {
        typeProof = 0;
        updateAxiomTabVisibility(false);
      }
    }
  });
});

function updateAxiomTabVisibility(isSequent) {
  const axiomTabLabel = document.querySelector('label[for="tab3"]');
  if (axiomTabLabel) {
    const axiomTabLi = axiomTabLabel.closest('li');
    if (axiomTabLi) {
      axiomTabLi.style.display = isSequent ? 'none' : 'block';
    }
  }
  
  if (isSequent) {
      const axiomRadio = document.getElementById('tab3');
      if (axiomRadio && axiomRadio.checked) {
          const firstTab = document.getElementById('tab1');
          if (firstTab) firstTab.checked = true;
      }
  }
}



export function checkRule(index, text, editorInstance = editorMonaco.editor) {
  editorMonaco.clearEditorErrors(editorInstance);
  // editorMonaco.clearEditorErrors();
  hasError = false;
  let chars = CharStreams.fromString(text);
  let lexer = new GrammarLexer(chars);

  lexer.removeErrorListeners(); // Видаляємо стандартних слухачів
  lexer.addErrorListener({
    syntaxError: function (recognizer, offendingSymbol, line, column, msg, e) {
      hasError = true;
      // console.error(`Error on a line ${line}:${column} ${msg.replaceAll("\u22A2", '⊢')}`);
      msg = msg.replaceAll("\\u22A2", '⊢');
      // editorMonaco.setEditorError(index, column + 2, `Line ${index}, col ${column + 1}: ${msg}`);
      setEditorError(editorInstance, index, column + 2, `Line ${index}, col ${column + 1}: ${msg}`);
      enterButton.style.backgroundColor = 'rgba(253, 81, 81, 0.73)';
    }
  });

  if (hasError) {
    return 1;
  }

  let tokens = new CommonTokenStream(lexer);
  let parser = new GrammarParser(tokens);

  // Configure parser for better error handling
  parser.removeErrorListeners(); // Remove default error listeners
  parser.addErrorListener({
    syntaxError: function (recognizer, offendingSymbol, line, column, msg, e) {
      // console.error(`Error on a line ${line}:${column} ${msg.replaceAll("\\u22A2", '⊢')}`);
      msg = msg.replaceAll("\\u22A2", '⊢');
      // editorMonaco.setEditorError(index, column + 2, `Line ${index}, col ${column + 1}: ${msg}`);
      setEditorError(editorInstance, index, column + 2, `Line ${index}, col ${column + 1}: ${msg}`);
      enterButton.style.backgroundColor = 'rgba(253, 81, 81, 0.73)';
      hasError = true;
    },
    reportAmbiguity: function(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
      // Handle ambiguity errors gracefully
      console.warn('Grammar ambiguity detected, but continuing parsing');
    },
    reportAttemptingFullContext: function(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
      // Handle full context attempts gracefully
      console.warn('Parser attempting full context, but continuing parsing');
    },
    reportContextSensitivity: function(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
      // Handle context sensitivity gracefully
      console.warn('Context sensitivity detected, but continuing parsing');
    }
  });

  let tree = parser.formula();

  if (!hasError) {
    inputText = text;
    enterButton.style.backgroundColor = 'white';
    return 0;
  }

  return 1;
}


const enterButton = document.getElementById('enter');

enterButton.addEventListener('click', function () {
  let text = editorMonaco.editor.getValue();
  if (hasError || text === null || text.length === 0) {
    shakeElement('enter', 5);
    return;
  }

  if (!validateInputForStyle(text, typeProof)) {
    shakeElement('enter', 5);
    return;
  }

  // Show the proof container
  const proofContainer = document.getElementById('proof-container');
  if (proofContainer) proofContainer.style.display = 'block';

  if(typeProof===1)
  {
    fitchProof();
  }
  else if (typeProof === 2) {
    sequentProof();
  }
  else
  {
    gentzenProof();
  }

});

function validateInputForStyle(input, style) {
  try {
    // We reuse the parsing logic to check structure
    let ast = deductive.checkWithAntlr(input);
    
    // checkWithAntlr might return an array if the input is a list 'A, B' (which matches atomList)
    // or a 'sequent' object if it contains '⊢'
    // or a simple formula object (which might be wrapped or not, depending on listeners)

    // Style 0: Gentzen, 1: Fitch
    if (style === 0 || style === 1) {
      if (ast.type === 'sequent') {
        // Check conclusion (succedent)
        // In our modified listener, conclusion is an array of formulas
        if (Array.isArray(ast.conclusion)) {
          if (ast.conclusion.length > 1) {
            alert("Gentzen and Fitch styles require a single formula in the conclusion (right side of ⊢).");
            return false;
          }
          if (ast.conclusion.length === 0) {
            alert("Gentzen and Fitch styles require a conclusion.");
            return false;
          }
        } else {
           // Should be array, but if single object, it's length 1 essentially
        }
      } 
      else if (Array.isArray(ast)) {
        // It's a list of formulas without turnstile, e.g. "A, B"
        // Gentzen/Fitch treat non-sequent input as the goal formula.
        // It should be a single formula.
        if (ast.length > 1) {
          alert("Gentzen and Fitch styles expect a single formula as input (or a single-conclusion sequent).");
          return false;
        }
      }
    }
    
    // Style 2: Sequent (allows multi-conclusion and lists)
    return true;

  } catch (e) {
    console.warn("Validation check failed parsing, but checkRule passed?", e);
    return true; // Let the proof handler deal with edge cases if standard parse fails here
  }
}

function fitchProof()
{
  if (editorMonaco.editor.getValue().includes('————————————————')) {
    let userText = editorMonaco.editor.getValue();
    fitch.setUserHypothesesFitch(deductive.getHypotheses(userText));
    let lineArray = userText.split('\n');
    fitch.fitchStart(lineArray[lineArray.length - 1]);
  }
  else if(editorMonaco.editor.getValue().includes('⊢'))
  {
    let userText = editorMonaco.editor.getValue();
    userText = userText.replaceAll(" ", "");
    const lineArray = userText.split('⊢');
    fitch.setUserHypothesesFitch(lineArray[0].split(","));
    fitch.fitchStart(lineArray[1]);
  }
  else{
    // Allow start without premises (e.g. for axioms)
    let userText = editorMonaco.editor.getValue();
    fitch.setUserHypothesesFitch([]);
    fitch.fitchStart(userText);
  }
}

function sequentProof() {
  if (editorMonaco.editor.getValue().includes('⊢')) {
    // Якщо користувач вводить цілу секвенцію
    let userText = editorMonaco.editor.getValue();
    sequent.parseExpression(userText);
  } else {
    // Якщо користувач вводить тільки формулу (як в Gentzen)
    // Ми інтерпретуємо це як "Довести цю формулу" (⊢ A)
    // Тобто порожній антецедент і одна формула в сукцеденті
    gentzen.setUserHypotheses([]); // Clear Gentzen context just in case
    sequent.parseExpression(inputText);
  }
}

function gentzenProof()
{

  if (editorMonaco.editor.getValue().includes('————————————————')) {
    let userText = editorMonaco.editor.getValue();
    // userHypotheses = deductive.getHypotheses(userText);
    gentzen.setUserHypotheses(deductive.getHypotheses(userText));
    let lineArray = userText.split('\n');
    lineArray = lineArray.filter(line => line.trim() !== '');
    let filteredArray = deductive.getHypotheses(userText).filter(item => item.trim().length > 0);
    if(filteredArray.length===0)
    {
      return;
    }
    gentzen.parseExpression(lineArray[lineArray.length - 1]);

  }
  else if(editorMonaco.editor.getValue().includes('⊢'))
  {
    let userText = editorMonaco.editor.getValue();
    const lineArray = userText.split('⊢');
    // gentzen.setUserHypotheses(deductive.getHypotheses(lineArray[0]));
    gentzen.setUserHypotheses(lineArray[0].split(","));
    let filteredArray = lineArray[0].split(",").filter(item => item.trim().length > 0);
    if(filteredArray.length===0)
    {
      return;
    }
    gentzen.parseExpression(lineArray[1]);
  }
  else {
    gentzen.parseExpression(inputText);
  }
}

export function shakeElement(elementId, times) {
  let element = document.getElementById(elementId);
  if (!element) {
    // console.error("Елемент з ідентифікатором " + elementId + " не знайдено.");
    return;
  }

  let interval = 100; // час між кожною тряскою

  element.classList.add('shake'); // Додаємо клас, який запускає анімацію

  setTimeout(function () {
    element.classList.remove('shake'); // Видаляємо клас після завершення анімації
  }, interval * times);
}




document.getElementById('uploadBtn').addEventListener('click', function() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Отримуємо файл з об'єкта події
    if (file) {
      const reader = new FileReader(); // Створюємо об'єкт для читання файлу
      reader.onload = function(e) {
        const fileContents = e.target.result; // Отримуємо вміст файлу
        editorMonaco.editor.setValue(fileContents.toString());
      };
      reader.readAsText(file); // Читаємо файл як текст
    }
  });
  fileInput.click(); // Спрацьовуємо клік на прихованому input для вибору файлу
});
// Force rebuild
