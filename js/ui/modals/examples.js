import { editor } from '../monacoEditor';
import { typeProof } from '../../index';
import { t } from '../../core/i18n';
import { logicSettings, isVL, isPL } from '../../state/logicSettings';

const EXAMPLES_DATA = {
  gentzen: {
    "ex-category-propositional": [
      { label: "ex-label-identity", value: "φ⇒φ" },
      { label: "ex-label-double-negation", value: "φ⇒¬¬φ" },
      { label: "ex-label-transitivity", value: "(φ⇒ψ)∧(ψ⇒θ)⇒(φ⇒θ)" },
      { label: "ex-label-excluded-middle", value: "φ∨¬φ" },
      { label: "ex-label-pierce", value: "((φ⇒ψ)⇒φ)⇒φ" },
      { label: "ex-label-demorgan-1", value: "¬(φ∨ψ)⇒¬φ∧¬ψ" },
      { label: "ex-label-distributivity", value: "φ∧(ψ∨θ)⇒(φ∧ψ)∨(φ∧θ)" },
      { label: "ex-label-contraposition", value: "(φ⇒ψ)⇒(¬ψ⇒¬φ)" },
      { label: "ex-label-explosion", value: "φ∧¬φ⇒ψ" },
      { label: "ex-label-mp-classic", value: "φ\nφ⇒ψ\n————————————————\nψ" }
    ],
    "ex-category-predicate": [
      { label: "ex-label-univ-elim", value: "∀x P(x) ⊢ P(a)" },
      { label: "ex-label-exis-intro", value: "P(a) ⊢ ∃x P(x)" },
      { label: "ex-label-quant-exch", value: "¬∀x P(x) ⊢ ∃x ¬P(x)" },
      { label: "ex-label-dist-forall", value: "∀x (P(x) ∧ Q(x)) ⊢ ∀x P(x) ∧ ∀x Q(x)" },
      { label: "ex-label-syllogism-barbara", value: "∀x (P(x) ⇒ Q(x)), ∀x (Q(x) ⇒ R(x)) ⊢ ∀x (P(x) ⇒ R(x))" },
      { label: "ex-label-exis-from-univ", value: "∀x P(x) ⊢ ∃x P(x)" }
    ],
    "ex-category-theories": [
      { label: "ex-label-add-ident", value: "x + 0 = x" },
      { label: "ex-label-add-recur", value: "x + s(y) = s(x + y)" },
      { label: "ex-label-mult-zero", value: "x * 0 = 0" },
      { label: "ex-label-ord-trans", value: "x < y ∧ y < z ⇒ x < z" },
      { label: "ex-label-ord-trich", value: "x < y ∨ x = y ∨ y < x" },
      { label: "ex-label-succ-not-zero", value: "¬(s(x) = 0)" }
    ]
  },
  fitch: {
    "ex-category-propositional": [
      { label: "ex-label-identity", value: "φ⇒φ" },
      { label: "ex-label-modus-tollens", value: "φ⇒ψ, ¬ψ ⊢ ¬φ" },
      { label: "ex-label-dn-intro", value: "φ ⊢ ¬¬φ" },
      { label: "ex-label-dn-elim", value: "¬¬φ ⊢ φ" },
      { label: "ex-label-conj-intro", value: "φ, ψ ⊢ φ∧ψ" },
      { label: "ex-label-conj-elim", value: "φ∧ψ ⊢ φ" },
      { label: "ex-label-disj-intro", value: "φ ⊢ φ∨ψ" },
      { label: "ex-label-hyp-syll", value: "φ⇒ψ, ψ⇒θ ⊢ φ⇒θ" },
      { label: "ex-label-explosion-ecq", value: "φ, ¬φ ⊢ ψ" },
      { label: "ex-label-mp-step", value: "φ\nφ⇒ψ\n————————————————\nψ" }
    ],
    "ex-category-predicate": [
      { label: "ex-label-univ-elim", value: "∀x P(x) ⊢ P(a)" },
      { label: "ex-label-exis-intro", value: "P(a) ⊢ ∃x P(x)" },
      { label: "ex-label-quant-exch", value: "¬∀x P(x) ⊢ ∃x ¬P(x)" },
      { label: "ex-label-univ-intro", value: "P(a) ⊢ ∀x P(x)" },
      { label: "ex-label-barcan", value: "∀x □P(x) ⊢ □∀x P(x)" }
    ],
    "ex-category-theories": [
      { label: "ex-label-add-ident", value: "x + 0 = x" },
      { label: "ex-label-succ-inj", value: "s(x) = s(y) ⇒ x = y" },
      { label: "ex-label-ord-irref", value: "¬(x < x)" },
      { label: "ex-label-add-comp", value: "x < y ⇒ x + z < y + z" }
    ]
  },
  sequent: {
    "ex-category-propositional": [
      { label: "ex-label-basic-id", value: "φ ⊢ φ" },
      { label: "ex-label-double-negation", value: "⊢ φ⇒¬¬φ" },
      { label: "ex-label-mp", value: "φ, φ⇒ψ ⊢ ψ" },
      { label: "ex-label-demorgan", value: "¬(φ∧ψ) ⊢ ¬φ, ¬ψ" },
      { label: "ex-label-excluded-middle", value: "⊢ φ∨¬φ" },
      { label: "ex-label-distributivity", value: "φ∧(ψ∨θ) ⊢ (φ∧ψ)∨(φ∧θ)" },
      { label: "ex-label-empty-concl", value: "φ, ¬φ ⊢ " },
      { label: "ex-label-complex-chain", value: "φ⇒ψ, ψ⇒θ ⊢ φ⇒θ" },
      { label: "ex-label-multi-formula", value: "ψ,φ ⊢ (φ⇒ψ)∧(ψ⇒θ)" },
      { label: "ex-label-deriv-ex", value: "φ\nφ⇒ψ\n————————————————\nψ" }
    ],
    "ex-category-predicate": [
      { label: "ex-label-univ-left", value: "∀x P(x) ⊢ P(a)" },
      { label: "ex-label-exis-right", value: "P(a) ⊢ ∃x P(x)" },
      { label: "ex-label-quant-exch", value: "¬∀x P(x) ⊢ ∃x ¬P(x)" },
      { label: "ex-label-pred-dist", value: "∀x (P(x) ∧ Q(x)) ⊢ ∀x P(x), ∀x Q(x)" }
    ],
    "ex-category-theories": [
      { label: "ex-label-arith-ax1", value: "s(x) = s(y) ⊢ x = y" },
      { label: "ex-label-arith-ax4", value: " ⊢ x + 0 = x" },
      { label: "ex-label-ord-ax2", value: "x < y, y < z ⊢ x < z" },
      { label: "ex-label-ord-ax4", value: "x < y ⊢ x + z < y + z" }
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
      chip.setAttribute('data-i18n', catKey);
      
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
      emptyMsg.textContent = t("modal-no-examples");
      emptyMsg.setAttribute('data-i18n', "modal-no-examples");
      contentArea.appendChild(emptyMsg);
      return;
    }

    examples.forEach(ex => {
      const item = document.createElement('div');
      item.className = 'example-item';

      const label = document.createElement('div');
      label.className = 'example-label';
      label.textContent = t(ex.label);
      label.setAttribute('data-i18n', ex.label);

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
