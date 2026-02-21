import antlr4, {CharStreams, CommonTokenStream} from 'antlr4';
import * as monaco from 'monaco-editor';
import GrammarLexer from '../my_antlr/GrammarLexer';
import GrammarParser from '../my_antlr/GrammarParser';
import * as editorMonaco from './ui/monacoEditor';
import * as gentzen from './proofs/gentzen/GentzenProof'
import * as deductive from './core/deductiveEngine';
import * as fitch from "./proofs/fitch/FitchProof";
import * as sequent from "./proofs/sequent/SequentProof";
import * as help from './ui/help';
import {setEditorError, initFontSelectors} from "./ui/monacoEditor";
import {initProofView} from "./ui/proofView";
import {updateLanguage, t} from "./core/i18n";

let hasError = false;
let inputText = "";

export let typeProof = 0;

document.addEventListener("DOMContentLoaded", function() {
  // Initialize Language
  const savedLang = localStorage.getItem('selectedLang') || 'EN';
  updateLanguage(savedLang);

  // Set active class on lang switcher correctly on load
  const langOpts = document.querySelectorAll('.lang-opt');
  langOpts.forEach(opt => {
    if (opt.textContent.trim() === savedLang) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  // Initialize Proof View (Pan/Zoom/Resize)
  initProofView();

  // Initialize Font Selectors
  initFontSelectors();

  // Theme Toggle Logic
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    // Check for saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.classList.add('dark');
      if (typeof monaco !== 'undefined') {
        monaco.editor.setTheme('vs-dark');
      }
    }

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      themeToggle.classList.toggle('dark');

      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      // Update Monaco theme
      if (typeof monaco !== 'undefined') {
        monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
      }
    });
  }

  // Language Switcher Logic
  const langOptsList = document.querySelectorAll('.lang-opt');
  langOptsList.forEach(opt => {
    opt.addEventListener('click', () => {
      // Remove active class from all options
      langOptsList.forEach(o => o.classList.remove('active'));
      // Add active class to clicked option
      opt.classList.add('active');

      const selectedLang = opt.textContent.trim();
      updateLanguage(selectedLang);
      console.log(`Language switched to: ${selectedLang}`);
    });
  });

  // Setup Proxy for new Sidebar Buttons
  setupSidebarProxy();

  // Split View Resizing Logic
  const splitter = document.getElementById('proof-layout-divider');
  const leftPanel = document.getElementById('proof-tools');
  const rightPanel = document.getElementById('proof-container');
  const container = document.getElementById('proof-split-layout');

  if (splitter && leftPanel && rightPanel && container) {
    let isDragging = false;

    splitter.addEventListener('mousedown', function(e) {
      isDragging = true;
      splitter.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; // Disable text selection while dragging
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = e.clientX - containerRect.left - (splitter.offsetWidth / 2);

      // Constraints (20% min width for each side)
      const minWidth = containerRect.width * 0.2;
      const maxWidth = containerRect.width * 0.8;

      if (newLeftWidth > minWidth && newLeftWidth < maxWidth) {
        const leftPercent = (newLeftWidth / containerRect.width) * 100;
        const rightPercent = 100 - leftPercent; // Splitter width is negligible or handled by flex-shrink

        leftPanel.style.width = `${leftPercent}%`;
        rightPanel.style.width = `calc(${rightPercent}% - ${splitter.offsetWidth}px)`;
      }
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        splitter.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  // New Logic: Handle navigation links for proof types
  const navGentzen = document.getElementById('nav-gentzen');
  const navFitch = document.getElementById('nav-fitch');
  const navSequent = document.getElementById('nav-sequent');

  function setActiveNav(activeNav) {
    [navGentzen, navFitch, navSequent].forEach(nav => {
      if (nav) nav.classList.remove('active');
    });
    if (activeNav) activeNav.classList.add('active');
  }

  if (navGentzen) {
    navGentzen.addEventListener('click', function(e) {
      e.preventDefault();
      typeProof = 0;
      updateAxiomTabVisibility(false);
      setActiveNav(navGentzen);
    });
  }

  if (navFitch) {
    navFitch.addEventListener('click', function(e) {
      e.preventDefault();
      typeProof = 1;
      updateAxiomTabVisibility(false);
      setActiveNav(navFitch);
    });
  }

  if (navSequent) {
    navSequent.addEventListener('click', function(e) {
      e.preventDefault();
      typeProof = 2;
      updateAxiomTabVisibility(true);
      setActiveNav(navSequent);
    });
  }

  // Fallback / Backward Compatibility for old radio buttons if they still exist (hidden)
  var myDict = document.querySelector('.mydict');
  if (myDict) {
    myDict.addEventListener('click', function(event) {
      var target = event.target;
      if (target.type === 'radio' && target.name === 'radio') {
        if (target.nextElementSibling.textContent === "Fitch") {
          typeProof = 1;
          updateAxiomTabVisibility(false);
        } else if (target.nextElementSibling.textContent === "Sequent") {
          typeProof = 2;
          updateAxiomTabVisibility(true);
        } else {
          typeProof = 0;
          updateAxiomTabVisibility(false);
        }
      }
    });
  }
});



function updateAxiomTabVisibility(isSequent) {
  // Update old tab visibility (hidden but functional)
  const axiomTabLabel = document.querySelector('label[for="tab3"]');
  if (axiomTabLabel) {
    const axiomTabLi = axiomTabLabel.closest('li');
    if (axiomTabLi) {
      axiomTabLi.style.display = isSequent ? 'none' : 'block';
    }
  }

  // Update sidebar link visibility
  const sbAxiom = document.getElementById('sb-axiom');
  if (sbAxiom) {
      sbAxiom.style.display = isSequent ? 'none' : 'flex';
  }

  if (isSequent) {
      const axiomRadio = document.getElementById('tab3');
      if (axiomRadio && axiomRadio.checked) {
          const firstTab = document.getElementById('tab1');
          if (firstTab) firstTab.checked = true;
          // Also update active state in sidebar
          const sbRules = document.getElementById('sb-rules');
          if (sbRules) {
             document.querySelectorAll('.menu-group .nav-link').forEach(el => el.classList.remove('active'));
             sbRules.classList.add('active');
          }
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
      setEditorError(editorInstance, index, column + 2, `${t('label-line')} ${index}, ${t('label-col')} ${column + 1}: ${msg}`);
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
      setEditorError(editorInstance, index, column + 2, `${t('label-line')} ${index}, ${t('label-col')} ${column + 1}: ${msg}`);
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
    enterButton.style.backgroundColor = '#10b981';
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
  const splitLayout = document.getElementById('proof-split-layout');
  if (splitLayout) {
      splitLayout.style.display = 'flex';
  } else {
      const proofContainer = document.getElementById('proof-container');
      if (proofContainer) proofContainer.style.display = 'block';
  }

  const fontSelect = document.getElementsByClassName('custom-select')[0];
  // Hide the enter button as we transition to proof mode
  enterButton.style.display = 'none';
  fontSelect.style.display = 'none';

  // Switch Sidebar to Proof Mode
  const homeSidebar = document.getElementById('sidebar-home');
  const proofSidebar = document.getElementById('sidebar-proof');
  if (homeSidebar) homeSidebar.style.display = 'none';
  if (proofSidebar) proofSidebar.style.display = 'flex';
  if (proofSidebar) proofSidebar.style.flexDirection = 'column';

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
            alert(t("alert-single-formula"));
            return false;
          }
          if (ast.conclusion.length === 0) {
            alert(t("alert-missing-conclusion"));
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
          alert(t("alert-invalid-input"));
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
  }
  if (editorMonaco.editor.getValue().includes('————————————————')) {
    let userText = editorMonaco.editor.getValue();

    let lineArray = userText.split('\n');
    lineArray = lineArray.filter(line => line.trim() !== '');

    const result = lineArray
      .map(line => line.includes('—') ? '⊢' : line)
      .join(',')
      .replace(',⊢,', ' ⊢ ')
      .replace(',⊢', ' ⊢ ')
      .replace('⊢,', '⊢ ');

      sequent.parseExpression(result);
  }
  else {
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




function setupSidebarProxy() {
  const proxy = (id, targetId) => {
    const el = document.getElementById(id);
    const target = document.getElementById(targetId);
    if (el && target) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        target.click();
      });
    }
  };

  // Map sidebar buttons to hidden/existing controls
  const homeBtn = document.getElementById('sb-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if(confirm(t("confirm-return-main"))) {
        location.reload();
      }
    });
  }

  proxy('sb-prev', 'backwardButton');
  proxy('sb-next', 'forwardButton');
  // Zoom buttons handled directly by proofView.js
  // proxy('sb-plus', 'zoomInBtn');
  // proxy('sb-minus', 'zoomOutBtn');
  // proxy('sb-reset', 'resetZoomBtn');
  // proxy('sb-latex', 'latex');
  proxy('sb-help', 'helpBtn');
  proxy('sb-feedback', 'redirectButton');

  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', function() {
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
  }

  // Parentheses proxies removed (handled directly in GentzenProof/FitchProof)

  // Smart Mode Toggle
  const smartBtn = document.getElementById('sb-smart-mode');
  if (smartBtn) {
    smartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let isActive = false;
      if (typeProof === 0) { // Gentzen
         isActive = gentzen.toggleSmartMode();
      } else if (typeProof === 1) { // Fitch
         isActive = fitch.toggleSmartMode();
      } else if (typeProof === 2) { // Sequent
         isActive = sequent.toggleSmartMode();
      }

      if (isActive) {
        smartBtn.classList.add('active');
        smartBtn.style.color = '#f59e0b';
      } else {
        smartBtn.classList.remove('active');
        smartBtn.style.color = '';
      }
    });
  }

  // Tab switching with active state toggle
  const tabs = [
    { sb: 'sb-rules', target: 'tab1', labelTarget: 'tab1' }, // tab1 is radio
    { sb: 'sb-axiom', target: 'tab3', labelTarget: 'tab3' },
    { sb: 'sb-tree', target: 'tab4', labelTarget: 'tab4' }
  ];

  tabs.forEach(t => {
    const sbEl = document.getElementById(t.sb);
    if (sbEl) {
      sbEl.addEventListener('click', (e) => {
        e.preventDefault();
        // Click the corresponding label to trigger radio change
        const label = document.querySelector(`label[for="${t.target}"]`);
        if (label) label.click();

        // Update active class on sidebar
        tabs.forEach(x => {
           const el = document.getElementById(x.sb);
           if (el) el.classList.remove('active');
        });
        sbEl.classList.add('active');
      });
    }
  });
}
