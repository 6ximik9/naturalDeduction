import {typeProof} from "../index";
import {clearItems} from "../proofs/fitch/FitchProof";
import * as deductive from '../core/deductiveEngine';
import {t} from '../core/i18n';

// Global reference for Sequent Context
let sequentContextRef = { treeRoot: null };
let latexSequentListenerAdded = false;

// --- Modal Elements ---
const latexModal = document.getElementById('latexModal');
const latexInfo = document.getElementById('latexInfo');
const closeBtn = document.querySelector('.closeLatex');
const navbarItems = document.querySelectorAll('#latexModal .helpNavbarItem');
const copyBtn = document.getElementById('copyLatexCode');

// --- Helper Functions ---

/**
 * Traverses the proof tree in the DOM to extract proof steps.
 * Used for Gentzen mode.
 */
function getLate(element) {
  let results = [];

  function traverse(node) {
    const childDivs = Array.from(node.children);
    
    // Filter useful children
    const divElements = childDivs.filter(child =>
      child.tagName.toLowerCase() === 'div' &&
      !child.className.includes('nameRule')
    );
    const labelElements = childDivs.filter(child => child.tagName.toLowerCase() === 'label');
    const rule = childDivs.filter(child =>
      child.tagName.toLowerCase() === 'div' &&
      child.className.includes('nameRule')
    );

    if (labelElements.length > 0) {
      results.push(labelElements[0].textContent);
    }

    if (divElements.length === 1) {
      if (rule.length > 0) {
        results.push('unary');
        results.push(rule[0].textContent);
      }
      traverse(divElements[0]);
    } else if (divElements.length === 2) {
      if (rule.length > 0) {
        results.push('binary');
        results.push(rule[0].textContent);
      }
      traverse(divElements[1]);
      results.push('axiom');
      traverse(divElements[0]);
    } else if (divElements.length === 3) {
      if (rule.length > 0) {
        results.push('trinary');
        results.push(rule[0].textContent);
      }
      traverse(divElements[2]);
      results.push('axiom');
      traverse(divElements[1]);
      results.push('axiom');
      traverse(divElements[0]);
    }
  }

  traverse(element);
  results.push('axiom');
  return results;
}

/**
 * Transforms the extracted proof array into bussproofs LaTeX commands.
 */
function transformArray(inputArray) {
  const transformed = [];
  transformed.push('\\begin{prooftree}');
  let i = 0;
  while (i < inputArray.length) {
    const type = inputArray[i];
    if (i + 1 < inputArray.length) {
      const value = inputArray[i + 1];
      if (type === 'unary') {
        transformed.push(`\\UnaryInfC{$${latexEdit(value, 0)}$}`);
      } else if (type === 'binary') {
        transformed.push(`\\BinaryInfC{$${latexEdit(value, 0)}$}`);
      } else if (type === 'trinary') {
        transformed.push(`\\TrinaryInfC{$${latexEdit(value, 0)}$}`);
      } else if (type === 'axiom') {
        transformed.push(`\\AxiomC{$${latexEdit(value, 0)}$}`);
      } else {
        transformed.push(`\\RightLabel{$${latexEdit(type, 1)}$}`);
        i += 1;
        continue;
      }
      i += 2;
    }
  }
  transformed.push('\\end{prooftree}');
  return transformed;
}

/**
 * Replaces symbols with their LaTeX equivalents.
 */
function latexEdit(str, mode) {
  const replacements = {
    'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
    'ε': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
    'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu',
    'ν': '\\nu', 'ξ': '\\xi', 'ο': '\\omicron', 'π': '\\pi',
    'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon',
    'φ': '\\phi', 'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
    'Α': '\\Alpha', 'Β': '\\Beta', 'Γ': '\\Gamma', 'Δ': '\\Delta',
    'Ε': '\\Epsilon', 'Ζ': '\\Zeta', 'Η': '\\Eta', 'Θ': '\\Theta',
    'Ι': '\\Iota', 'Κ': '\\Kappa', 'Λ': '\\Lambda', 'Μ': '\\Mu',
    'Ν': '\\Nu', 'Ξ': '\\Xi', 'Ο': '\\Omicron', 'Π': '\\Pi',
    'Ρ': '\\Rho', 'Σ': '\\Sigma', 'Τ': '\\Tau', 'Υ': '\\Upsilon',
    'Φ': '\\Phi', 'Χ': '\\Chi', 'Ψ': '\\Psi', 'Ω': '\\Omega',
    '⇒': ' \\Rightarrow ', '->': ' \\rightarrow ', '→': ' \\rightarrow ',
    '∨': ' \\lor ', 'OR': ' \\lor ', 'or': ' \\lor ', '|': ' \\lor ', '||': ' \\lor ',
    '∧': ' \\land ', 'AND': ' \\land ', 'and': ' \\land ', '&': ' \\land ', '&&': ' \\land ',
    '~': ' \\neg ', ' ¬': ' \\neg ', '!': ' \\neg ',
    '∀': ' \\forall ', '∃': ' \\exists ',
    '⊤': ' \\top ', '⊥': ' \\bot ',
    '<=': ' \\le ', '>=': ' \\ge ',
    '≠': ' \\neq ', '!=': ' \\neq ',
    '*': ' \\cdot '
  };

  const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);

  sortedKeys.forEach(key => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (mode === 0) {
      str = str.replace(regex, replacements[key]);
    } else {
      str = str.replace(regex, replacements[key] + ' ');
    }
  });

  return str;
}

// --- Content Generation Logic ---

function generateGentzenContent(isDocument) {
    const proofContainer = document.querySelector('.proof-element_level-0');
    if (!proofContainer) return "";
    
    const proofTexts = getLate(proofContainer).reverse();
    const proofBody = transformArray(proofTexts).join('\n');

    if (isDocument) {
        return "\\documentclass{article}\n" +
               "\\usepackage{bussproofs} %https://ctan.org/pkg/bussproofs \n\n" +
               "\\begin{document}\n\n" +
               proofBody + 
               "\n\n\\end{document}";
    }
    return proofBody;
}

// Global vars for Fitch recursion
let level = "";
let indexTest = 0;
let outputArray = [];

function printElementAndChildren(element) {
  if (indexTest !== 0) {
    level += "\\fa"
  }
  var outJustDiv = document.getElementById('out_just').children;
  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));
  const children = Array.from(element.children);
  
  children.forEach((child, index) => {
    if (child.classList.contains('fitch_branch')) {
      indexTest++;
      printElementAndChildren(child); 
    } else {
      let output;
      let rule;
      if (child.style.borderBottom === '1px solid black') {
        const elementIndex = allFitchFormulas.indexOf(child);
        rule = outJustDiv[elementIndex].textContent;
        output = level + "\\fj $$" + latexEdit(child.textContent.replaceAll("", " "), 0) + "$$";
      } else {
        const elementIndex = allFitchFormulas.indexOf(child);
        rule = outJustDiv[elementIndex].textContent;
        output = level + "\\fa $$" + latexEdit(child.textContent.replaceAll("", " "), 0) + "$$";
      }
      outputArray.push(output + " & $" + latexEdit(rule.replace(" ", " \\quad "), 1) + "$\\\\");
    }
  });
  level = level.replace("\\fa", "");
}

function generateFitchContent(isDocument) {
    clearItems();
    indexTest = 0;
    level = "";
    outputArray = [];

    const branch = document.querySelectorAll('.fitch_branch');
    if (branch.length === 0) return "";

    outputArray.push("\\begin{fitch}");
    printElementAndChildren(branch[0]);
    outputArray.push("\\end{fitch}");

    const proofBody = outputArray.join('\n');

    if (isDocument) {
         return "\\documentclass{article}\n" +
            "\\usepackage{fitch} %http://www.actual.world/resources/tex/sty/kluwer/edited/fitch.sty \n\n" +
            "\\begin{document}\n\n" +
            proofBody + 
            "\n\n\\end{document}";
    }
    return proofBody;
}

function generateSequentLatex(node) {
  let result = "";

  if (node.children) {
    node.children.forEach(child => {
      result += generateSequentLatex(child);
    });
  }

  const left = node.antecedent.map(f => deductive.convertToLogicalExpression(f)).join(', ');
  const right = node.succedent.map(f => deductive.convertToLogicalExpression(f)).join(', ');
  const content = `$${latexEdit(left + ' \\vdash ' + right, 0)}$`;

  if (!node.children || node.children.length === 0) {
    result += `\\AxiomC{${content}}\n`;
  } else {
    if (node.ruleApplied) {
      result += `\\RightLabel{$${latexEdit(node.ruleApplied, 1)}$}\n`;
    }

    if (node.children.length === 1) {
      result += `\\UnaryInfC{${content}}\n`;
    } else if (node.children.length === 2) {
      result += `\\BinaryInfC{${content}}\n`;
    } else if (node.children.length === 3) {
      result += `\\TrinaryInfC{${content}}\n`;
    } else {
      result += `\\UnaryInfC{${content}}\n`;
    }
  }

  return result;
}

function generateSequentContent(isDocument) {
    if (!sequentContextRef.treeRoot) return "";
    
    const latexStr = generateSequentLatex(sequentContextRef.treeRoot);
    const proofBody = `\\begin{prooftree}\n${latexStr}\n\\end{prooftree}`;

    if (isDocument) {
        return "\\documentclass{article}\n" +
            "\\usepackage{bussproofs} %https://ctan.org/pkg/bussproofs \n\n" +
            "\\begin{document}\n\n" +
            proofBody +
            "\n\n\\end{document}";
    }
    return proofBody;
}

// --- UI Logic ---

function setActiveTab(index) {
    // Update active class
    navbarItems.forEach(item => item.classList.remove('active'));
    if (navbarItems[index]) {
        navbarItems[index].classList.add('active');
    }
    
    // Update content
    const isDocument = (index === 1); // 0 = Proof, 1 = Document
    let content = "";

    if (typeProof === 0) { // Gentzen
        content = generateGentzenContent(isDocument);
    } else if (typeProof === 1) { // Fitch
        content = generateFitchContent(isDocument);
    } else if (typeProof === 2) { // Sequent
        content = generateSequentContent(isDocument);
    }

    if (latexInfo) {
        latexInfo.textContent = content;
    }
}

// Attach Tab Listeners
navbarItems.forEach((item, index) => {
    item.addEventListener('click', () => setActiveTab(index));
});

function openModal() {
    latexModal.style.display = 'flex';
    setActiveTab(0); // Default to Proof tab
}

function attachListener() {
    const btn = document.getElementById('sb-latex') || document.getElementById('latex');
    if (!btn) return;
    
    // Replace button to remove old listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Validation Checks
        if (typeProof === 0) { // Gentzen
            const allProofLabels = document.querySelectorAll('label#proofText');
            const previousLabels = document.querySelectorAll('label.previous');
            if (allProofLabels.length !== previousLabels.length) {
                if (!window.confirm(t("confirm-latex-incomplete"))) return;
            }
        } else if (typeProof === 1) { // Fitch
            const fitchBranchElements = document.querySelectorAll('.fitch_branch:not(.finished)');
            if (fitchBranchElements.length > 0) {
                 if (!window.confirm(t("confirm-proof-unfinished"))) return;
            }
        }

        openModal();
    });
}

// --- Exports ---

export function latexGentzen() {
    attachListener();
}

export function latexFitch() {
    attachListener();
}

export function latexSequent(context) {
    sequentContextRef = context;
    if (!latexSequentListenerAdded) {
        latexSequentListenerAdded = true;
        attachListener();
    }
}

// --- Event Listeners (Global) ---

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        latexModal.style.display = 'none';
    });
}

if (latexModal) {
    latexModal.addEventListener('click', (e) => {
        if (e.target === latexModal) {
             latexModal.style.display = 'none';
        }
    });
}

if (copyBtn) {
    copyBtn.addEventListener('click', async function () {
        const textToCopy = latexInfo.textContent;
        const icon = copyBtn.querySelector('i');
        const originalClass = icon ? icon.className : '';

        try {
            await navigator.clipboard.writeText(textToCopy);
            
            // Success Feedback
            if (icon) {
                icon.className = 'ri-check-line';
                setTimeout(() => {
                    icon.className = originalClass || 'ri-file-copy-line';
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback
            const textarea = document.createElement("textarea");
            textarea.value = textToCopy;
            textarea.style.position = "fixed";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
             if (icon) {
                icon.className = 'ri-check-line';
                setTimeout(() => {
                    icon.className = originalClass || 'ri-file-copy-line';
                }, 2000);
            }
        }
    });
}
