export const translations = {
  SK: {
    "nav-system": "Systém",
    "nav-gentzen": "Gentzen",
    "nav-fitch": "Fitch",
    "nav-sequent": "Sekvent",
    "nav-data": "Dáta",
    "nav-upload": "Nahrať",
    "nav-example": "Príklad",
    "nav-support": "Podpora",
    "nav-help": "Pomoc",
    "nav-feedback": "Spätná väzba",
    "btn-proof": "Dôkaz",
    "theme-toggle": "Prepnúť tému",
    "font-size-label": "Veľkosť písma",
    "nav-home": "Domov",
    "nav-rules": "Pravidlá",
    "nav-axiom": "Axióma",
    "nav-tree": "Strom",
    "nav-undo": "Krok späť",
    "nav-redo": "Krok vpred",
    "nav-zoom-in": "Priblížiť",
    "nav-zoom-out": "Oddialiť",
    "nav-fit": "Prispôsobiť",
    "nav-show-parens": "Zobraziть zátvorky",
    "nav-hide-parens": "Skryť zátvorky",
    "nav-original": "Originál",
    "nav-latex": "LaTeX zdroj",
    "label-all-hypotheses": "Všetky hypotézy",
    "label-current-hypotheses": "Aktuálne hypotézy",
    "tab-rules": "Pravidlá",
    "tab-axioms": "Axiómy",
    "tab-tree": "Strom"
  },
  EN: {
    "nav-system": "System",
    "nav-gentzen": "Gentzen",
    "nav-fitch": "Fitch",
    "nav-sequent": "Sequent",
    "nav-data": "Data",
    "nav-upload": "Upload",
    "nav-example": "Paste Example",
    "nav-support": "Support",
    "nav-help": "Help",
    "nav-feedback": "Feedback",
    "btn-proof": "Proof",
    "theme-toggle": "Switch Theme",
    "font-size-label": "Font Size",
    "nav-home": "Main Page",
    "nav-rules": "Rules",
    "nav-axiom": "Axiom",
    "nav-tree": "Tree",
    "nav-undo": "Undo Step",
    "nav-redo": "Redo Step",
    "nav-zoom-in": "Zoom In",
    "nav-zoom-out": "Zoom Out",
    "nav-fit": "Fit View",
    "nav-show-parens": "Show parentheses",
    "nav-hide-parens": "Hide parentheses",
    "nav-original": "Original",
    "nav-latex": "LaTeX Source",
    "label-all-hypotheses": "All Hypotheses",
    "label-current-hypotheses": "Current Hypotheses",
    "tab-rules": "Rules",
    "tab-axioms": "Axioms",
    "tab-tree": "Tree"
  },
  UA: {
    "nav-system": "Система",
    "nav-gentzen": "Генцен",
    "nav-fitch": "Фітч",
    "nav-sequent": "Секвенція",
    "nav-data": "Дані",
    "nav-upload": "Завантажити",
    "nav-example": "Приклад",
    "nav-support": "Підтримка",
    "nav-help": "Допомога",
    "nav-feedback": "Відгук",
    "btn-proof": "Доведення",
    "theme-toggle": "Змінити тему",
    "font-size-label": "Розмір шрифту",
    "nav-home": "Головна",
    "nav-rules": "Правила",
    "nav-axiom": "Аксіома",
    "nav-tree": "Дерево",
    "nav-undo": "Крок назад",
    "nav-redo": "Крок вперед",
    "nav-zoom-in": "Збільшити",
    "nav-zoom-out": "Зменшити",
    "nav-fit": "Вписати",
    "nav-show-parens": "Показати дужки",
    "nav-hide-parens": "Приховати дужки",
    "nav-original": "Оригінал",
    "nav-latex": "Джерело LaTeX",
    "label-all-hypotheses": "Усі гіпотези",
    "label-current-hypotheses": "Поточні гіпотези",
    "tab-rules": "Правила",
    "tab-axioms": "Аксіоми",
    "tab-tree": "Дерево"
  }
};

export function updateLanguage(lang) {
  const t = translations[lang];
  if (!t) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      // Check if it's a select option
      if (el.tagName === 'OPTION') {
          // If it's font-size-label, we want to keep the " : 20px" part
          if (key === 'font-size-label') {
              const fontSize = el.value;
              el.textContent = `${t[key]}: ${fontSize}px`;
          } else {
              el.textContent = t[key];
          }
      } else {
          // Handle elements with icons (SVGs or <i>)
          const svg = el.querySelector('svg');
          const icon = el.querySelector('i');
          if (svg || icon) {
              // We need to preserve the SVG/icon and only change the text node
              el.childNodes.forEach(node => {
                  if (node.nodeType === Node.TEXT_NODE) {
                      const trimmed = node.textContent.trim();
                      if (trimmed.length > 0) {
                          node.textContent = ' ' + t[key];
                      }
                  }
              });
          } else {
              el.textContent = t[key];
          }
      }
    }
  });

  // Update titles for tooltips
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (t[key]) {
      el.setAttribute('title', t[key]);
    }
  });
  
  localStorage.setItem('selectedLang', lang);
}
