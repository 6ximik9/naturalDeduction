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

import {initStartScreen} from './ui/modals/startScreen';
import {isVL} from './state/logicSettings';
import { initLayoutSettings } from './ui/modals/layout';
import { initExamplesModal } from './ui/modals/examples';
import { createReturnConfirmModal } from './ui/modals/returnConfirm';

let hasError = false;
let inputText = "";

export let typeProof = 0;

document.addEventListener("DOMContentLoaded", function() {
  // Initialize Start Screen
  initStartScreen();

  // Initialize Layout Settings
  initLayoutSettings();

  // Initialize Examples Modal
  initExamplesModal();

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
  const themeToggles = document.querySelectorAll('.theme-toggle');
  
  // Check for saved preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggles.forEach(t => t.classList.add('dark'));
    if (typeof monaco !== 'undefined') {
      monaco.editor.setTheme('vs-dark');
    }
  }

  themeToggles.forEach(themeToggle => {
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent parent (.logo) from triggering reload
      document.body.classList.toggle('dark-mode');
      
      const isDark = document.body.classList.contains('dark-mode');
      
      themeToggles.forEach(t => {
        if (isDark) t.classList.add('dark');
        else t.classList.remove('dark');
      });

      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      // Update Monaco theme
      if (typeof monaco !== 'undefined') {
        monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
      }
    });
  });

  // Language Switcher Logic
  const langOptsList = document.querySelectorAll('.lang-opt');
  langOptsList.forEach(opt => {
    opt.addEventListener('click', () => {
      const selectedLang = opt.textContent.trim();
      
      // Remove active class from all options globally
      langOptsList.forEach(o => o.classList.remove('active'));
      
      // Add active class to all options matching the selected language
      langOptsList.forEach(o => {
        if (o.textContent.trim() === selectedLang) {
          o.classList.add('active');
        }
      });

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
      
      const isHorizontal = container.classList.contains('h-top') || container.classList.contains('h-bottom');
      document.body.style.cursor = isHorizontal ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none'; // Disable text selection while dragging
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;

      const containerRect = container.getBoundingClientRect();
      const isHorizontal = container.classList.contains('h-top') || container.classList.contains('h-bottom');
      const isReverse = container.classList.contains('v-right') || container.classList.contains('h-bottom');

      if (isHorizontal) {
        let newHeight;
        if (container.classList.contains('h-bottom')) {
          newHeight = containerRect.bottom - e.clientY - (splitter.offsetHeight / 2);
        } else {
          newHeight = e.clientY - containerRect.top - (splitter.offsetHeight / 2);
        }

        const minHeight = containerRect.height * 0.1;
        const maxHeight = containerRect.height * 0.9;

        if (newHeight > minHeight && newHeight < maxHeight) {
          const heightPercent = (newHeight / containerRect.height) * 100;
          leftPanel.style.flexBasis = `${heightPercent}%`;
          // Clear direct width/height to avoid conflicts with flex-basis
          leftPanel.style.height = '';
          leftPanel.style.width = '';
          rightPanel.style.height = '';
          rightPanel.style.width = '';
        }
      } else {
        let newWidth;
        if (container.classList.contains('v-right')) {
          newWidth = containerRect.right - e.clientX - (splitter.offsetWidth / 2);
        } else {
          newWidth = e.clientX - containerRect.left - (splitter.offsetWidth / 2);
        }

        const minWidth = containerRect.width * 0.1;
        const maxWidth = containerRect.width * 0.9;

        if (newWidth > minWidth && newWidth < maxWidth) {
          const widthPercent = (newWidth / containerRect.width) * 100;
          leftPanel.style.flexBasis = `${widthPercent}%`;
          // Clear direct width/height to avoid conflicts with flex-basis
          leftPanel.style.height = '';
          leftPanel.style.width = '';
          rightPanel.style.height = '';
          rightPanel.style.width = '';
        }
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

  const navShowStarts = document.querySelectorAll('.nav-show-start, .logo');
  navShowStarts.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();

      // If we are in proof mode (proof sidebar is visible), show the confirmation modal
      const proofSidebar = document.getElementById('sidebar-proof');
      if (proofSidebar && proofSidebar.style.display !== 'none') {
        try {
          const result = await createReturnConfirmModal();
          if (result === 'edit') {
            localStorage.setItem('editIntroductionFormula', editorMonaco.editor.getValue());
            sessionStorage.setItem('savedFormula', editorMonaco.editor.getValue());
            sessionStorage.setItem('returnToEditor', 'true');
          } else if (result === 'yes') {
            sessionStorage.setItem('savedFormula', editorMonaco.editor.getValue());
            sessionStorage.setItem('returnToEditor', 'true');
          } else if (result === 'start') {
            const theme = localStorage.getItem('theme');
            const lang = localStorage.getItem('selectedLang');
            localStorage.clear();
            if (theme) localStorage.setItem('theme', theme);
            if (lang) localStorage.setItem('selectedLang', lang);
            sessionStorage.setItem('isHomeReload', 'true');
          }
          location.reload();
          return;
        } catch (err) {
          return; // Cancelled
        }
      }

      const theme = localStorage.getItem('theme');
      const lang = localStorage.getItem('selectedLang');
      localStorage.clear();
      if (theme) {
        localStorage.setItem('theme', theme);
      }
      if (lang) {
        localStorage.setItem('selectedLang', lang);
      }
      sessionStorage.setItem('isHomeReload', 'true');
      location.reload(true);
    });
  });

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

  if (!validateInputForLogic(text)) {
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
      if (proofContainer) {
          proofContainer.style.display = 'block';
      }
  }

  // Hide the enter button as we transition to proof mode
  enterButton.style.display = 'none';

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

  // Ensure view is reset (Fit View) at start
  if (window.resetProofView) {
      setTimeout(() => {
          window.resetProofView();
      }, 50);
  }

});

function validateInputForLogic(input) {
  if (!isVL()) {
    return true; // No restrictions for PR mode
  }

  try {
    let ast = deductive.checkWithAntlr(input);
    let invalidFound = false;

    function checkNode(node) {
      if (!node || typeof node !== 'object') return;
      if (invalidFound) return;

      node = deductive.getProof(node);

      const invalidTypes = [
        'forall', 'exists', 'quantifier',
        'equality', 'predicate', 'function',
        'addition', 'multiplication', 'successor', 'number'
      ];

      if (invalidTypes.includes(node.type)) {
        invalidFound = true;
        return;
      }

      // In VL mode, relation can only be simple proposition (no arguments/terms)
      if (node.type === 'relation' && node.value && Array.isArray(node.value) && node.value.length > 0) {
        invalidFound = true;
        return;
      }
      
      // Also predicate might have terms, but it's already caught in invalidTypes
      
      // Traverse children
      for (let key in node) {
        if (node.hasOwnProperty(key)) {
          if (Array.isArray(node[key])) {
            node[key].forEach(checkNode);
          } else if (typeof node[key] === 'object' && node[key] !== null) {
            checkNode(node[key]);
          }
        }
      }
    }

    if (Array.isArray(ast)) {
      ast.forEach(checkNode);
    } else {
      checkNode(ast);
    }

    if (invalidFound) {
      alert(t("alert-invalid-vl-element"));
      return false;
    }

    return true;
  } catch (e) {
    console.warn("Logic validation failed parsing, checking passed?", e);
    return true;
  }
}

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
  let originalBg = element.style.backgroundColor;
  let originalTransition = element.style.transition;

  element.classList.add('shake'); // Додаємо клас, який запускає анімацію
  element.style.transition = 'background-color 0.3s ease';
  
  // Вибираємо колір залежно від теми
  const isDark = document.body.classList.contains('dark-mode');
  const errorColor = isDark ? 'rgba(248, 113, 113, 0.3)' : '#fecaca'; // М'яке червоне світіння для темної теми, пастельний для світлої
  
  element.style.setProperty('background-color', errorColor, 'important');

  setTimeout(function () {
    element.classList.remove('shake'); // Видаляємо клас після завершення анімації
    element.style.backgroundColor = originalBg;
    
    // Restore transition after the color reverts
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 300);
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
    homeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const result = await createReturnConfirmModal();
        if (result === 'edit') {
          localStorage.setItem('editIntroductionFormula', editorMonaco.editor.getValue());
          sessionStorage.setItem('savedFormula', editorMonaco.editor.getValue());
          sessionStorage.setItem('returnToEditor', 'true');
        } else if (result === 'yes') {
          sessionStorage.setItem('savedFormula', editorMonaco.editor.getValue());
          sessionStorage.setItem('returnToEditor', 'true');
        } else if (result === 'start') {
          const theme = localStorage.getItem('theme');
          const lang = localStorage.getItem('selectedLang');
          localStorage.clear();
          if (theme) localStorage.setItem('theme', theme);
          if (lang) localStorage.setItem('selectedLang', lang);
          sessionStorage.setItem('isHomeReload', 'true');
        }
        location.reload();
      } catch (err) {
        // Modal cancelled
      }
    });
  }

  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const proofContainer = document.getElementById('proof-container');
      if (proofContainer) {
        proofContainer.classList.toggle('proof-fullscreen');
        const isFullscreen = proofContainer.classList.contains('proof-fullscreen');
        
        if (isFullscreen) {
          fullscreenBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;
        } else {
          fullscreenBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
        }
      }
    });
  }

  // Download Dropdown Logic
  const downloadBtn = document.getElementById('download-btn');
  const downloadMenu = document.getElementById('download-menu');
  if (downloadBtn && downloadMenu) {
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!downloadBtn.contains(e.target)) {
        downloadMenu.classList.remove('show');
      }
    });

    // Close on item click
    const downloadItems = downloadMenu.querySelectorAll('.download-item');
    downloadItems.forEach(item => {
      item.addEventListener('click', () => {
        downloadMenu.classList.remove('show');
      });
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
