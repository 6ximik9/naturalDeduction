import { editor } from '../monacoEditor';
import { typeProof } from '../../index';
import { t } from '../../core/i18n';
import { logicSettings, isVL, isPL } from '../../state/logicSettings';

const EXAMPLES_DATA = {
  gentzen: {
    "ex-category-propositional": [
      { label: "Identity", value: "φ⇒φ" },
      { label: "Double Negation", value: "φ⇒¬¬φ" },
      { label: "Transitivity (Syllogism)", value: "(φ⇒ψ)∧(ψ⇒θ)⇒(φ⇒θ)" },
      { label: "Excluded Middle", value: "φ∨¬φ" },
      { label: "Pierce's Law", value: "((φ⇒ψ)⇒φ)⇒φ" },
      { label: "De Morgan (1)", value: "¬(φ∨ψ)⇒¬φ∧¬ψ" },
      { label: "Distributivity", value: "φ∧(ψ∨θ)⇒(φ∧ψ)∨(φ∧θ)" },
      { label: "Contraposition", value: "(φ⇒ψ)⇒(¬ψ⇒¬φ)" },
      { label: "Explosion Principle", value: "φ∧¬φ⇒ψ" },
      { label: "Modus Ponens (Classic)", value: "φ\nφ⇒ψ\n————————————————\nψ" }
    ],
    "ex-category-predicate": [
      { label: "Universal Elimination", value: "∀x P(x) ⊢ P(a)" },
      { label: "Existential Introduction", value: "P(a) ⊢ ∃x P(x)" },
      { label: "Quantifier Exchange", value: "¬∀x P(x) ⊢ ∃x ¬P(x)" },
      { label: "Distributivity of ∀", value: "∀x (P(x) ∧ Q(x)) ⊢ ∀x P(x) ∧ ∀x Q(x)" },
      { label: "Syllogism (Barbara)", value: "∀x (P(x) ⇒ Q(x)), ∀x (Q(x) ⇒ R(x)) ⊢ ∀x (P(x) ⇒ R(x))" },
      { label: "Existence from Universality", value: "∀x P(x) ⊢ ∃x P(x)" }
    ],
    "ex-category-theories": [
      { label: "Addition Identity", value: "x + 0 = x" },
      { label: "Addition Recursion", value: "x + s(y) = s(x + y)" },
      { label: "Multiplication by Zero", value: "x * 0 = 0" },
      { label: "Order Transitivity", value: "x < y ∧ y < z ⇒ x < z" },
      { label: "Order Trichotomy", value: "x < y ∨ x = y ∨ y < x" },
      { label: "Successor Not Zero", value: "¬(s(x) = 0)" }
    ]
  },
  fitch: {
    "ex-category-propositional": [
      { label: "Identity", value: "φ⇒φ" },
      { label: "Modus Tollens", value: "φ⇒ψ, ¬ψ ⊢ ¬φ" },
      { label: "Double Negation Intro", value: "φ ⊢ ¬¬φ" },
      { label: "Double Negation Elim", value: "¬¬φ ⊢ φ" },
      { label: "Conjunction Intro", value: "φ, ψ ⊢ φ∧ψ" },
      { label: "Conjunction Elim", value: "φ∧ψ ⊢ φ" },
      { label: "Disjunction Intro", value: "φ ⊢ φ∨ψ" },
      { label: "Hypothetical Syllogism", value: "φ⇒ψ, ψ⇒θ ⊢ φ⇒θ" },
      { label: "Explosion (ECQ)", value: "φ, ¬φ ⊢ ψ" },
      { label: "Modus Ponens (Step)", value: "φ\nφ⇒ψ\n————————————————\nψ" }
    ],
    "ex-category-predicate": [
      { label: "Universal Elimination", value: "∀x P(x) ⊢ P(a)" },
      { label: "Existential Introduction", value: "P(a) ⊢ ∃x P(x)" },
      { label: "Quantifier Exchange", value: "¬∀x P(x) ⊢ ∃x ¬P(x)" },
      { label: "Universal Introduction", value: "P(a) ⊢ ∀x P(x)" },
      { label: "Barcan Formula (one-way)", value: "∀x □P(x) ⊢ □∀x P(x)" }
    ],
    "ex-category-theories": [
      { label: "Addition Identity", value: "x + 0 = x" },
      { label: "Successor Injectivity", value: "s(x) = s(y) ⇒ x = y" },
      { label: "Order Irreflexivity", value: "¬(x < x)" },
      { label: "Addition Compatibility", value: "x < y ⇒ x + z < y + z" }
    ]
  },
  sequent: {
    "ex-category-propositional": [
      { label: "Basic Identity", value: "φ ⊢ φ" },
      { label: "Double Negation", value: "⊢ φ⇒¬¬φ" },
      { label: "Modus Ponens", value: "φ, φ⇒ψ ⊢ ψ" },
      { label: "De Morgan", value: "¬(φ∧ψ) ⊢ ¬φ, ¬ψ" },
      { label: "Excluded Middle", value: "⊢ φ∨¬φ" },
      { label: "Distributivity", value: "φ∧(ψ∨θ) ⊢ (φ∧ψ)∨(φ∧θ)" },
      { label: "Empty Conclusion", value: "φ, ¬φ ⊢ " },
      { label: "Complex Chain", value: "φ⇒ψ, ψ⇒θ ⊢ φ⇒θ" },
      { label: "Multi-formula Sequent", value: "ψ,φ ⊢ (φ⇒ψ)∧(ψ⇒θ)" },
      { label: "Derivation Example", value: "φ\nφ⇒ψ\n————————————————\nψ" }
    ],
    "ex-category-predicate": [
      { label: "Universal Left", value: "∀x P(x) ⊢ P(a)" },
      { label: "Existential Right", value: "P(a) ⊢ ∃x P(x)" },
      { label: "Quantifier Exchange", value: "¬∀x P(x) ⊢ ∃x ¬P(x)" },
      { label: "Predicate Distributivity", value: "∀x (P(x) ∧ Q(x)) ⊢ ∀x P(x), ∀x Q(x)" }
    ],
    "ex-category-theories": [
      { label: "Arithmetic Ax1", value: "s(x) = s(y) ⊢ x = y" },
      { label: "Arithmetic Ax4", value: " ⊢ x + 0 = x" },
      { label: "Order Ax2", value: "x < y, y < z ⊢ x < z" },
      { label: "Order Ax4", value: "x < y ⊢ x + z < y + z" }
    ]
  }
};

let currentSystem = 'gentzen';
let currentCategory = 'ex-category-propositional';

export function initExamplesModal() {
  const modal = document.getElementById('examples-modal');
  const openBtn = document.getElementById('pasteExampleBtn');
  const closeBtn = document.getElementById('close-examples-modal');
  const tabButtons = document.querySelectorAll('.example-tab-btn');
  const filtersContainer = document.getElementById('example-category-filters');
  const contentArea = document.getElementById('example-list-content');

  if (!modal || !openBtn) return;

  openBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.classList.add('show');

    // 1. Set default system based on current typeProof
    currentSystem = 'gentzen';
    if (typeProof === 1) currentSystem = 'fitch';
    if (typeProof === 2) currentSystem = 'sequent';

    // 2. Set default category based on current logicSettings
    currentCategory = 'ex-category-propositional';
    if (isPL()) currentCategory = 'ex-category-predicate';
    if (logicSettings.theories.robinson || logicSettings.theories.order) {
        currentCategory = 'ex-category-theories';
    }

    renderCategoryFilters();
    renderExamples();
    setActiveSystemTab(currentSystem);
  };

  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.remove('show');
  }

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.classList.remove('show');
    }
  };

  tabButtons.forEach(btn => {
    btn.onclick = () => {
      currentSystem = btn.dataset.system;
      renderCategoryFilters();
      renderExamples();
      setActiveSystemTab(currentSystem);
    };
  });

  function setActiveSystemTab(system) {
    tabButtons.forEach(btn => {
      if (btn.dataset.system === system) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function renderCategoryFilters() {
    filtersContainer.innerHTML = '';
    const categories = Object.keys(EXAMPLES_DATA[currentSystem]);

    categories.forEach(catKey => {
      const chip = document.createElement('div');
      chip.className = 'category-chip';
      if (catKey === currentCategory) chip.classList.add('active');
      
      chip.textContent = t(catKey);
      
      chip.onclick = () => {
        currentCategory = catKey;
        renderCategoryFilters();
        renderExamples();
      };
      
      filtersContainer.appendChild(chip);
    });
  }

  function renderExamples() {
    contentArea.innerHTML = '';
    const examples = EXAMPLES_DATA[currentSystem][currentCategory] || [];

    if (examples.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-examples-msg';
      emptyMsg.textContent = "No examples for this category.";
      contentArea.appendChild(emptyMsg);
      return;
    }

    examples.forEach(ex => {
      const item = document.createElement('div');
      item.className = 'example-item';

      const label = document.createElement('div');
      label.className = 'example-label';
      label.textContent = ex.label;

      const value = document.createElement('div');
      value.className = 'example-value';
      value.textContent = ex.value === 'multiline'
        ? "(φ⇒θ)\n(ψ⇒θ)\n————————————————\n(φ⇒ψ)∧(ψ⇒θ)⇒(φ⇒θ)"
        : ex.value;

      item.appendChild(label);
      item.appendChild(value);

      item.onclick = () => {
        if (ex.value === 'multiline') {
          editor.setValue("(φ⇒θ)\n(ψ⇒θ)\n————————————————\n(φ⇒ψ)∧(ψ⇒θ)⇒(φ⇒θ)");
        } else {
          editor.setValue(ex.value);
        }
        modal.classList.remove('show');
      };

      contentArea.appendChild(item);
    });
  }
}
