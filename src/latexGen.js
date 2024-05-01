import {typeProof} from "./index";
import {clearItems} from "./FitchProof";


function getLate(element) {
  let results = [];

  // Рекурсивна функція для обходу
  function traverse(node) {

    const childDivs = Array.from(node.children);

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

// Знаходимо модальне вікно
var latexModal = document.getElementById('latexModal');
var info = document.getElementById('latexInfo');


export function latexGentzen() {
  document.getElementById('latex').addEventListener('click', function () {

    var allProofLabels = document.querySelectorAll('label#proofText');
    var previousLabels = document.querySelectorAll('label.previous');

    if (allProofLabels.length !== previousLabels.length) {
      var result = window.confirm("Not all branches complete. Latex code generated may be incorrect. Continue?");
      if (!result) {
        return;
      }
    }
    const proofContainer = document.querySelector('.proof-element_level-0');
    const proofTexts = getLate(proofContainer).reverse();
    // console.log(proofTexts.join('\n'));
    info.textContent = transformArray(proofTexts).join('\n');
    latexModal.style.display = 'flex'; // Змінюємо стиль, щоб показати модальне вікно
    document.querySelector('#latexCode').style.height = '600px';
  });
}

export function latexFitch() {
  document.getElementById('latex').addEventListener('click', function () {

    const fitchBranchElements = document.querySelectorAll('.fitch_branch:not(.finished)');
    if (fitchBranchElements.length > 0) {
      let result = window.confirm("The proof is not finished, do you want to continue?");
      if (!result) {
        return;
      }
    }

    clearItems();

    const branch = document.querySelectorAll('.fitch_branch');
    outputArray.push("\\begin{fitch}");
    printElementAndChildren(branch[0]);
    outputArray.push("\\end{fitch}");

    info.textContent = outputArray.join('\n');
    latexModal.style.display = 'flex'; // Змінюємо стиль, щоб показати модальне вікно
    document.querySelector('#latexCode').style.height = '600px';

    indexTest = 0;
    level = "";
    outputArray = [];
  });
}

let level = ""
let indexTest = 0;
let outputArray = [];
function printElementAndChildren(element) {
  if(indexTest!==0)
  {
    level += "\\fa"
  }
  var outJustDiv = document.getElementById('out_just').children;

  const allFitchFormulas = Array.from(document.querySelectorAll('.fitch_formula'));

  const children = Array.from(element.children);
  children.forEach((child, index) => {
    if (child.classList.contains('fitch_branch')) {
      indexTest++;
      printElementAndChildren(child); // Recursively handle nested fitch_branch
    } else {
      let output;
      let rule;
      if (child.style.borderBottom === '1px solid black') {
        const elementIndex = allFitchFormulas.indexOf(child);
          rule = outJustDiv[elementIndex].textContent;
        output = level + "\\fj $$" + latexEdit(child.textContent.replaceAll("", " "), 0) + "$$";
      }
      else{
        const elementIndex = allFitchFormulas.indexOf(child);
        rule = outJustDiv[elementIndex].textContent;
        output =level + "\\fa $$" + latexEdit(child.textContent.replaceAll("", " "), 0)+ "$$";
      }
      outputArray.push(output + " & $" + latexEdit(rule.replace(" ", " \\quad "),1) + "$\\\\");
    }
  });

  level = level.replace("\\fa", "")
}



document.querySelector('.closeLatex').addEventListener('click', function () {
  latexModal.style.display = 'none'; // Закриваємо модальне вікно
});

latexModal.addEventListener('click', function (event) {
  if (event.target === latexModal) {
    latexModal.style.display = 'none'; // Закриваємо модальне вікно
  }
});


document.getElementById('copyLatexCode').addEventListener('click', function () {

  var textToCopy = document.getElementById('latexInfo').innerText;

  var textarea = document.createElement("textarea");
  textarea.textContent = textToCopy;
  textarea.style.position = "fixed";  // Зберігає положення користувача на сторінці
  document.body.appendChild(textarea);

  textarea.select();
  document.execCommand('copy');

  document.body.removeChild(textarea);

  // Змінюємо іконку на кнопці на декілька секунд
  var buttonIcon = document.querySelector('#copyLatexCode .buttonIcon img');
  buttonIcon.src = "../img/copyOk.svg"; // Припустимо, що це шлях до зображення успішного копіювання
  buttonIcon.style.transform = "rotate(360deg)"; // Додаємо обертання іконки

  // Після певного часу повертаємо оригінальну іконку
  setTimeout(function () {
    buttonIcon.src = "../img/copy.svg";
    buttonIcon.style.transform = "rotate(0deg)"; // Повертаємо іконку в початкове положення
  }, 2000); // 3000 мілісекунд (3 секунди)

});


function transformArray(inputArray) {
  const transformed = [];
  transformed.push('\\begin{prooftree}')
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

  transformed.push('\\end{prooftree}')
  return transformed;
}


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
    '⇒': '\\Rightarrow', '->': '\\rightarrow', '→': '\\rightarrow',
    '∨': '\\lor', 'OR': '\\lor', 'or': '\\lor', '|': '\\lor', '||': '\\lor',
    '∧': '\\land', 'AND': '\\land', 'and': '\\land', '&': '\\land', '&&': '\\land',
    '~': '\\neg', '¬': '\\neg', '!': '\\neg'
  };

  // Порядок важливий для запобігання неправильній заміні підрядків
  // Спочатку замінюємо довші ключі, а потім коротші
  const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);

  sortedKeys.forEach(key => {
    // Використовуємо глобальний пошук та заміну з "g" флагом для RegExp

    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (mode === 0) {
      str = str.replace(regex, replacements[key]);
    } else {
      str = str.replace(regex, replacements[key] + ' ');
    }
  });

  return str;
}

