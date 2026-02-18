import * as monaco from 'monaco-editor';
import {checkRule} from '../index';


monaco.languages.register({
  id: 'proofLanguage'
});

monaco.languages.registerCompletionItemProvider('proofLanguage', {
  triggerCharacters: ['\\'],
  provideCompletionItems: function (model, position) {
    // Отримуємо текст у рядку перед курсором
    var lineContent = model.getValueInRange({
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: 1,
      endColumn: position.column
    });

    // Перевіряємо, чи містить рядок знак '\'
    if (!lineContent.includes('\\')) {
      return {suggestions: []}; // Якщо рядок не містить '\', повертаємо порожній список підказок
      // return suggestions(position, ''); // Викликаємо функцію suggestions для отримання підсказок
    }

    // Визначаємо діапазон, де буде вставлено підсказку
    var range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: lineContent.lastIndexOf('\\')+1,
      endColumn: position.column
    };

    return suggestions(position, range); // Викликаємо функцію suggestions для отримання підсказок
  }
});






function suggestions(position, range) {
  const greekAlphabet = [
    {label: '\\alpha', insertText: 'α', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\beta', insertText: 'β', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\gamma', insertText: 'γ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\delta', insertText: 'δ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\epsilon', insertText: 'ε', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\zeta', insertText: 'ζ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\eta', insertText: 'η', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\theta', insertText: 'θ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\iota', insertText: 'ι', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\kappa', insertText: 'κ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\lambda', insertText: 'λ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\mu', insertText: 'μ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\nu', insertText: 'ν', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\xi', insertText: 'ξ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\omicron', insertText: 'ο', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\pi', insertText: 'π', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\rho', insertText: 'ρ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\sigma', insertText: 'σ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\tau', insertText: 'τ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\upsilon', insertText: 'υ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\phi', insertText: 'φ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\chi', insertText: 'χ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\psi', insertText: 'ψ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\omega', insertText: 'ω', range: range, kind: monaco.languages.CompletionItemKind.Text},

    {label: '\\Alpha', insertText: 'A', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Beta', insertText: 'B', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Gamma', insertText: 'Γ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Delta', insertText: 'Δ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Epsilon', insertText: 'E', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Zeta', insertText: 'Z', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Eta', insertText: 'H', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Theta', insertText: 'Θ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Iota', insertText: 'I', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Kappa', insertText: 'K', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Lambda', insertText: 'Λ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Mu', insertText: 'M', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Nu', insertText: 'N', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Xi', insertText: 'Ξ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Omicron', insertText: 'O', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Pi', insertText: 'Π', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Rho', insertText: 'P', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Sigma', insertText: 'Σ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Tau', insertText: 'T', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Upsilon', insertText: 'Y', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Phi', insertText: 'Φ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Chi', insertText: 'X', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Psi', insertText: 'Ψ', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\Omega', insertText: 'Ω', range: range, kind: monaco.languages.CompletionItemKind.Text},

    {label: '\\Rightarrow', insertText: '⇒', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\lor', insertText: '∨', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\land', insertText: '∧', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\vee', insertText: '∨', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\wedge', insertText: '∧', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\neg', insertText: '¬', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\verum', insertText: '⊤', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\absurdum', insertText: '⊥', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\top', insertText: '⊤', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\bot', insertText: '⊥', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\-', insertText: '————————————————\n', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\proves', insertText: '⊢', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\forall', insertText: '∀', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\FORALL', insertText: '∀', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\exists', insertText: '∃', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\EXISTS', insertText: '∃', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\EQ', insertText: '=', range: range, kind: monaco.languages.CompletionItemKind.Text},
    {label: '\\eq', insertText: '=', range: range, kind: monaco.languages.CompletionItemKind.Text}
  ];

  return {suggestions: greekAlphabet};
}


// Створення редактора монако
export let editor = monaco.editor.create(document.getElementById('editor'), {
  value: '',
  language: 'proofLanguage',
  fontSize: 20, // Більший розмір шрифту
  automaticLayout: true, // <<== the important part
  scrollbar: {
    vertical: 'auto', // Спочатку ховаємо вертикальний скролбар
    useShadows: true,
    verticalScrollbarSize: 17,
    horizontalScrollbarSize: 17,
    arrowSize: 30,
    // verticalSliderSize: 30
  },
  wordBasedSuggestions: false
});



// Викликає підсказки автоматично під час зміни курсора
editor.onDidChangeCursorPosition((e) => {
  editor.trigger('anyString', 'editor.action.triggerSuggest');
});

// Викликає підсказки автоматично під час зміни вмісту моделі
editor.onDidChangeModelContent((e) => {
  editor.trigger('anyString', 'editor.action.triggerSuggest');
});


editor.getModel().onDidChangeContent(function (event) {
  var model = editor.getModel();
  var changes = event.changes;
  changes.forEach(function (change) {
    var range = change.range;
    var newText = change.text;
    if (newText === "" && range.endColumn - range.startColumn === 1) {
      var lineContent = model.getLineContent(range.startLineNumber);
      if (lineContent.includes("—")) {
        var rangeToDelete = new monaco.Range(range.startLineNumber, 1, range.startLineNumber, range.endColumn);
        editor.executeEdits("", [{range: rangeToDelete, text: ""}]);
      }
    }
  });
});




editor.onDidChangeModelContent(() => {
  const newText = editor.getValue();
  // console.log(newText);
  const lines = newText.split('\n');
  // console.log(lines);
  for (let i = 0; i < lines.length; i++) {
    // console.log(lines[i].replaceAll('EOF',''));
    if (lines[i].trim() !== '' && !lines[i].includes("—")) {
      let c = checkRule(i + 1, lines[i].replaceAll('\n', ''));
      if (c === 1) {
        // console.log(c);
        return;
      }
    }
  }

  if (editor.getValue().length === 0) {
    checkRule(1, editor.getValue());
    clearEditorErrors();
  }
  // checkRule(newText);
});



export function setEditorError(editorInstance=editor, line, column, message) {
  const model = editorInstance.getModel();
  monaco.editor.setModelMarkers(model, 'owner', [{
    startLineNumber: line,
    startColumn: column,
    endLineNumber: line,
    endColumn: column + 1,
    message: message,
    severity: monaco.MarkerSeverity.Error
  }]);
}



export function clearEditorErrors(editorInstance = editor) {
  const model = editorInstance.getModel();
  monaco.editor.setModelMarkers(model, 'owner', []);
}

export function hasEditorErrors() {
  const markers = monaco.editor.getModelMarkers({});

  return markers.length > 0 ? 1 : 0;
}

export function getEditorErrors() {
  const markers = monaco.editor.getModelMarkers({});
  return markers.map(marker => marker.message); // Повертаємо масив текстів помилок
}

// Отримуємо посилання на елементи
const editorPanel = document.querySelector('.editorPanel');
const divider = document.querySelector('.divider');

// Додаємо обробник події для переміщення
if (divider && editorPanel) {
  divider.addEventListener('mousedown', function (event) {
    // Початкова позиція курсора
    const startX = event.clientX;
    const startWidth = parseInt(getComputedStyle(editorPanel).width, 10);

    // Обробник переміщення миші
    function onMouseMove(event) {
      // Розрахунок нової ширини
      const newWidth = startWidth + event.clientX - startX;

      // if(newWidth>600) {
        // Встановлюємо новий розмір для editorPanel, editorComponent та overflowGuard
        editorPanel.style.width = newWidth + 'px';
      // }
    }

    // Обробник відпускання кнопки миші
    function onMouseUp() {
      // Відключаємо обробники подій
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    // Додаємо обробники подій переміщення миші
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
}


const editorResize = document.querySelector('.editorResize');
if (editorResize && editorPanel) {
  editorResize.addEventListener('mousedown', function (event) {
    // Початкова позиція курсора
    const startY = event.clientY;
    const startHeight = parseInt(getComputedStyle(editorPanel).height, 10);

    // Обробник переміщення миші
    function onMouseMove(event) {
      // Розрахунок нової висоти
      const newHeight = startHeight + event.clientY - startY;

      // Встановлюємо нову висоту для editorPanel
      editorPanel.style.height = newHeight + 'px';
    }

    // Обробник відпускання кнопки миші
    function onMouseUp() {
      // Відключаємо обробники подій
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    // Додаємо обробники подій переміщення миші
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
}


const dropdownItems = document.querySelectorAll('.dropdown-content li');
const checkbox = document.querySelector('.dropdown input[type="checkbox"]');
// Додаємо обробник події для кожного елемента
dropdownItems.forEach(item => {
  item.addEventListener('click', function () {
    const selectedValue = this.getAttribute('data-value'); // Отримуємо значення data-value атрибуту

    if(selectedValue === "multiline") {
      editor.setValue("(φ⇒θ)\n(ψ⇒θ)\n————————————————\n(φ⇒ψ)∧(ψ⇒θ)⇒(φ⇒θ)");
    }
    else{editor.setValue(selectedValue);}
    checkbox.click();
  });
});


const dropdownItemsFont = document.querySelectorAll('.dropdown-contentFont li');
const checkboxFont = document.querySelector('.dropdownFont input[type="checkbox"]');
if (checkboxFont && dropdownItemsFont.length > 0) {
  // Додаємо обробник події для кожного елемента
  dropdownItemsFont.forEach(item => {
    item.addEventListener('click', function () {
      const selectedValue = this.getAttribute('data-value'); // Отримуємо значення data-value атрибуту
      editor.updateOptions({fontSize: selectedValue});
      checkboxFont.click();
    });
  });
}

// Support for new design Font Size selection
export function initFontSelectors() {
  const fontSelect = document.getElementById('font-size-select');

  if (fontSelect) {
    // Remove existing listeners by cloning (if any)
    const newFontSelect = fontSelect.cloneNode(true);
    fontSelect.parentNode.replaceChild(newFontSelect, fontSelect);

    newFontSelect.addEventListener('change', function(e) {
      const size = this.value;
      if (editor) editor.updateOptions({fontSize: parseInt(size)});
    });
  }
}

// Call it immediately if DOM is already parsed (backward compat), but mainly intended for external call
// const newFontOptions = document.querySelectorAll('.font-option');
// ... legacy code removed, moved to function above


export function createEditor(container) {
  return monaco.editor.create(container, {
    value: '',
    language: 'proofLanguage',
    fontSize: 28,
    automaticLayout: true,
    scrollbar: {
      vertical: 'auto',
      useShadows: true,
      verticalScrollbarSize: 17,
      horizontalScrollbarSize: 17,
      arrowSize: 30,
    },
    wordBasedSuggestions: false
  });
}


