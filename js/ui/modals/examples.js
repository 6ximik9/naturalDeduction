import { editor } from '../monacoEditor';
import { typeProof } from '../../index';
import { t } from '../../core/i18n';

const EXAMPLES_DATA = {
  gentzen: [
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
  fitch: [
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
  sequent: [
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
  ]
};

export function initExamplesModal() {
  const modal = document.getElementById('examples-modal');
  const openBtn = document.getElementById('pasteExampleBtn');
  const closeBtn = document.getElementById('close-examples-modal');
  const tabButtons = document.querySelectorAll('.example-tab-btn');
  const contentArea = document.getElementById('example-list-content');

  if (!modal || !openBtn) return;

  openBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.classList.add('show');

    // Set default tab based on typeProof
    let system = 'gentzen';
    if (typeProof === 1) system = 'fitch';
    if (typeProof === 2) system = 'sequent';

    renderExamples(system);
    setActiveTab(system);
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
      const system = btn.dataset.system;
      renderExamples(system);
      setActiveTab(system);
    };
  });

  function setActiveTab(system) {
    tabButtons.forEach(btn => {
      if (btn.dataset.system === system) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function renderExamples(system) {
    contentArea.innerHTML = '';
    const examples = EXAMPLES_DATA[system] || [];

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
