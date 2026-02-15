import * as treeLevel from "./tree";
import {side} from '../index';
import {processExpression} from '../index';
import {checkWithAntlr} from '../core/deductiveEngine';


let fontSize = 32;

function isAppOpen() {
  // Перевіряємо, чи браузер має можливість визначення активних вікон
  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    // Перевіряємо, чи є активні вікна відкритого браузера
    if (window.document.hidden || window.document.visibilityState !== 'visible') {
      // return false; // Якщо вікна не видимі, то застосунок не відкритий
    }
    fontSize = 20;
  }
   // Якщо оточення виконання не є браузером, повертаємо null
}

isAppOpen();

// Знаходимо кнопку, яка відкриває модальне вікно
var modalButton = document.getElementById('helpBtn');
// Знаходимо модальне вікно
var helpModal = document.getElementById('helpModal');

// Показати модальне вікно при кліку на кнопку
modalButton.addEventListener('click', function () {
  console.log("test");
  helpModal.style.display = 'flex'; // Змінюємо стиль, щоб показати модальне вікно
  setGeneral();
});

// Закрити модальне вікно при кліку на кнопку закриття
var closeButton = document.querySelector('.closeHelp');
closeButton.addEventListener('click', function () {
  helpModal.style.display = 'none'; // Закриваємо модальне вікно

  document.querySelectorAll('.helpNavbarItem').forEach(function (item, index) {

    if (index !== 0) {
      item.style.color = 'rgb(80, 80, 80)';
    } else {
      item.style.color = 'rgba(0, 97, 161, 0.66)';
    }
  });

});

helpModal.addEventListener('click', function (event) {
  if (event.target === helpModal) {
    helpModal.style.display = 'none'; // Закриваємо модальне вікно
    document.querySelectorAll('.helpNavbarItem').forEach(function (item, index) {
      if (index !== 0) {
        item.style.color = 'rgb(80, 80, 80)';
      } else {
        item.style.color = 'rgba(0, 97, 161, 0.66)';
      }
    });
  }
});


// Знаходимо всі елементи з класом helpNavbarItem
var navbarItems = document.querySelectorAll('.helpNavbarItem');
var helpDiv = document.querySelector('.help');
var info = document.getElementById('info');

// Додаємо обробник подій для кожного елементу
navbarItems.forEach(function (item) {
  item.addEventListener('click', function (event) {
    // Змінюємо колір всіх елементів на стандартний
    navbarItems.forEach(function (navItem) {
      navItem.style.color = 'rgb(80, 80, 80)';
    });
    // Отримуємо елемент, на який був зроблений клік
    var clickedItem = event.target;

    if (clickedItem.textContent === 'General') {
      setGeneral();
    } else if (clickedItem.textContent === 'Syntax') {
      info.innerHTML = '';
      helpDiv.style.height = '600px';
      info.appendChild(createMathTable());
    } else if (clickedItem.textContent === 'Axioms') {
      info.innerHTML = '';
      helpDiv.style.height = '600px';
      setAxioms();
    } else {
      info.innerHTML = '';
      helpDiv.style.height = '600px';
      helpInput();
    }
    // Змінюємо колір клікнутого елементу
    clickedItem.style.color = 'rgba(0, 97, 161, 0.66)';

  });
});

function setAxioms() {
    var robinsonHeader = document.createElement('div');
    robinsonHeader.textContent = 'Robinson Arithmetic';
    robinsonHeader.style.fontSize = fontSize + 'px';
    robinsonHeader.style.fontWeight = 'bold';
    robinsonHeader.style.marginBottom = '10px';
    robinsonHeader.style.marginTop = '10px';
    
    var ax1 = createHelpItem('Axiom 1', 's(x) ≠ 0', 'Zero is not a successor of any number.', '');
    var ax2 = createHelpItem('Axiom 2', 's(x) = s(y) ⇒ x = y', 'Successor function is injective.', '');
    var ax3 = createHelpItem('Axiom 3', 'x + 0 = x', 'Identity element for addition.', '');
    var ax4 = createHelpItem('Axiom 4', 'x + s(y) = s(x + y)', 'Recursive definition of addition.', '');
    var ax5 = createHelpItem('Axiom 5', 'x * 0 = 0', 'Multiplication by zero.', '');
    var ax6 = createHelpItem('Axiom 6', 'x * s(y) = (x * y) + x', 'Recursive definition of multiplication.', '');
    var ax7 = createHelpItem('Axiom 7', 'x = x', 'Reflexivity of equality.', '');

    var orderHeader = document.createElement('div');
    orderHeader.textContent = 'Linear Order';
    orderHeader.style.fontSize = fontSize + 'px';
    orderHeader.style.fontWeight = 'bold';
    orderHeader.style.marginBottom = '10px';
    orderHeader.style.marginTop = '20px';

    var ord1 = createHelpItem('Order 1', '¬(x < x)', 'Irreflexivity of strict order.', '');
    var ord2 = createHelpItem('Order 2', 'x < y ∧ y < z ⇒ x < z', 'Transitivity of order.', '');
    var ord3 = createHelpItem('Order 3', 'x < y ∨ x = y ∨ y < x', 'Trichotomy law (linearity).', '');

    info.appendChild(robinsonHeader);
    info.appendChild(ax1);
    info.appendChild(ax2);
    info.appendChild(ax3);
    info.appendChild(ax4);
    info.appendChild(ax5);
    info.appendChild(ax6);
    info.appendChild(ax7);

    info.appendChild(orderHeader);
    info.appendChild(ord1);
    info.appendChild(ord2);
    info.appendChild(ord3);
}

function setGeneral() {
  helpDiv.style.height = '600px';
  info.innerHTML = '';
  // var run = createHelpItem('Proof by deduction', 'Proof', 'Click to start the proof by natural deduction', '../img/play.svg');
  // var paste = createHelpItem('Example', 'Paste example', 'Click to insert an example or sample. This helps you add an example faster and demonstrate an idea or problem.', '');
  // var font = createHelpItem('Setting font size', 'Font size', 'Tap to change the font size. This will allow you to adjust the font to the right size to make it easier to enter information.', '');

  var run = createHelpItem('Proof by deduction', 'Proof', 'Click to start the proof by natural deduction', 'play');
  var paste = createHelpItem('Example', 'Paste example', 'Click to insert an example or sample. This helps you add an example faster and demonstrate an idea or problem.', '');
  var font = createHelpItem('Setting font size', 'Font size', 'Tap to change the font size. This will allow you to adjust the font to the right size to make it easier to enter information.', '');

  info.appendChild(run);
  info.appendChild(paste);
  info.appendChild(font);
}


function createHelpItem(title, buttonText, description, svgPath) {
  // Створюємо елемент заголовка
  var titleElement = document.createElement('span');
  titleElement.classList.add('helpItemExampleName');
  titleElement.style.color = 'rgb(33, 33, 33)';
  titleElement.textContent = title;
  titleElement.style.whiteSpace = "nowrap";
  titleElement.style.fontSize = fontSize + 'px';

  // Створюємо кнопку
  var button = document.createElement('button');
  button.classList.add('buttonWithIcon');
  button.style.background = 'rgb(255, 255, 255)';
  button.style.color = 'rgb(33, 33, 33)';
  button.style.boxShadow = 'rgba(0, 0, 0, 0.25) 0px 2px 5px 0px';
  button.style.fontSize = fontSize + 'px';
  if (svgPath === 'play') {
    button.innerHTML = `
  <span class="buttonText">${buttonText}</span>
  <div class="buttonIcon" style="margin: 0px 0px 0px 10px; height: 100%; width: 24px;">
    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#0061a1">
      <g id="SVGRepo_bgCarrier" stroke-width="0"/>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.24000000000000005"/>
      <g id="SVGRepo_iconCarrier">
        <path d="M3 12L3 18.9671C3 21.2763 5.53435 22.736 7.59662 21.6145L10.7996 19.8727M3 8L3 5.0329C3 2.72368 5.53435 1.26402 7.59661 2.38548L20.4086 9.35258C22.5305 10.5065 22.5305 13.4935 20.4086 14.6474L14.0026 18.131" stroke="#0061a1" stroke-width="2.4" stroke-linecap="round"/>
      </g>
    </svg>
  </div>`;
  } else {
    button.innerHTML = `
    <span class="buttonText">${buttonText}</span>
    <div class="buttonIcon" style="margin: 0px 0px 0px 10px; height: 100%; width: 24px;">
    <img src="${svgPath}" alt="SVG Icon" style="height: 100%; width: 100%;">
  </div>
`;
  }

  if (svgPath === '') {
    button.innerHTML = `
    <span class="buttonText">${buttonText}</span>
`;
  }


  // Створюємо елемент опису
  var descriptionElement = document.createElement('p');
  descriptionElement.classList.add('helpDescription');
  descriptionElement.style.color = 'rgb(33, 33, 33)';
  descriptionElement.textContent = description;
  descriptionElement.style.fontSize = fontSize + 'px';

  // Створюємо контейнер для всіх елементів
  var helpItem = document.createElement('div');
  helpItem.classList.add('helpItem');
  helpItem.style.borderBottomWidth = '1px';
  helpItem.style.borderBottomStyle = 'solid';
  helpItem.style.borderBottomColor = 'rgb(243, 243, 243)';

  // Додаємо елементи до контейнера
  var itemExample = document.createElement('div');
  itemExample.classList.add('helpItemExample');
  itemExample.appendChild(titleElement);
  var itemComponent = document.createElement('div');
  itemComponent.classList.add('helpItemExampleComponent');
  itemComponent.appendChild(button);
  itemExample.appendChild(itemComponent);
  helpItem.appendChild(itemExample);

  // Додаємо роздільник
  var divider = document.createElement('div');
  divider.classList.add('helpItemDivider');
  divider.style.color = 'rgb(65, 143, 137)';
  divider.textContent = '—';
  helpItem.appendChild(divider);

  // Додаємо опис
  helpItem.appendChild(descriptionElement);

  // Повертаємо створений елемент
  return helpItem;
}


function createMathTable() {
// Define the symbols and their corresponding codes
  const symbols = [
    {symbol1: 'αΑ', code1: '\\alpha \\Alpha', symbol2: 'βΒ', code2: '\\beta \\Beta'},
    {symbol1: 'γΓ', code1: '\\gamma \\Gamma', symbol2: 'δΔ', code2: '\\delta \\Delta'},
    {symbol1: 'ϵΕ', code1: '\\epsilon \\Epsilon', symbol2: 'ζΖ', code2: '\\zeta \\Zeta'},
    {symbol1: 'ηΗ', code1: '\\eta \\Eta', symbol2: 'θΘ', code2: '\\theta \\Theta'},
    {symbol1: 'ιΙ', code1: '\\iota \\Iota', symbol2: 'κΚ', code2: '\\kappa \\Kappa'},
    {symbol1: 'λΛ', code1: '\\lambda \\Lambda', symbol2: 'μΜ', code2: '\\mu \\Mu'},
    {symbol1: 'νΝ', code1: '\\nu \\Nu', symbol2: 'ξΞ', code2: '\\xi \\Xi'},
    {symbol1: 'οΟ', code1: '\\omicron \\Omicron', symbol2: 'πΠ', code2: '\\pi \\Pi'},
    {symbol1: 'ρΡ', code1: '\\rho \\Rho', symbol2: 'σΣ', code2: '\\sigma \\Sigma'},
    {symbol1: 'τΤ', code1: '\\tau \\Tau', symbol2: 'υΥ', code2: '\\upsilon \\Upsilon'},
    {symbol1: 'ϕΦ', code1: '\\phi \\Phi', symbol2: 'χΧ', code2: '\\chi \\Chi'},
    {symbol1: 'ψΨ', code1: '\\psi \\Psi', symbol2: 'ωΩ', code2: '\\omega \\Omega'}
  ];


  // Create the table element
  const table = document.createElement('table');
  table.classList.add('wikitable');

  // Create table body
  const tbody = document.createElement('tbody');

  // Loop through symbols and generate table rows
  for (let i = 0; i < symbols.length; i++) {
    const symbol1 = symbols[i].symbol1;
    const code1 = symbols[i].code1;
    const symbol2 = symbols[i].symbol2;
    const code2 = symbols[i].code2;

    const row = document.createElement('tr');

    const symbolCell1 = document.createElement('td');
    const symbolSpan1 = document.createElement('span');
    symbolSpan1.innerHTML = symbol1;
    symbolCell1.appendChild(symbolSpan1);
    row.appendChild(symbolCell1);

    const codeCell1 = document.createElement('td');
    const codeCode1 = document.createElement('code');
    codeCode1.textContent = code1;
    codeCell1.appendChild(codeCode1);
    row.appendChild(codeCell1);

    const symbolCell2 = document.createElement('td');
    const symbolSpan2 = document.createElement('span');
    symbolSpan2.innerHTML = symbol2;
    symbolCell2.appendChild(symbolSpan2);
    row.appendChild(symbolCell2);

    const codeCell2 = document.createElement('td');
    const codeCode2 = document.createElement('code');
    codeCode2.textContent = code2;
    codeCell2.appendChild(codeCode2);
    row.appendChild(codeCell2);

    tbody.appendChild(row);
  }

  // Append table body to table
  table.appendChild(tbody);

  // Create a div to contain the table
  const container = document.createElement('div');
  container.className = 'tableInfo';
  // Add the "Greek letters" header with styles
  const greekLettersHeader = document.createElement('div');
  greekLettersHeader.textContent = 'Greek letters';
  greekLettersHeader.id = 'greekLettersHeader';
  greekLettersHeader.style.fontSize = fontSize + 'px';
  greekLettersHeader.style.fontWeight = 'bold';
  greekLettersHeader.style.marginBottom = '10px';


  const logicalSymbols = [
    { symbol: '⇒', code: '\\Rightarrow', input: '->, =>' },
    { symbol: '∨', code: '\\lor', input: '|, or' },
    { symbol: '∧', code: '\\land', input: '&, and' },
    { symbol: '¬', code: '\\neg', input: '!, ~' },
    { symbol: '∀', code: '\\forall', input: 'forall, ALL' },
    { symbol: '∃', code: '\\exists', input: 'exists, EX' },
    { symbol: '=', code: '=', input: '=' },
    { symbol: '≠', code: '\\neq', input: '!=, <>' },
    { symbol: '⊤', code: '\\top', input: 'TRUE' },
    { symbol: '⊥', code: '\\bot', input: 'FALSE' },
    { symbol: 's(x)', code: 's(x)', input: 's(0)' },
    { symbol: '+', code: '+', input: '+, add' },
    { symbol: '*', code: '*', input: '*, mult' },
    { symbol: '⊢', code: '\\vdash', input: '|-' }
  ];



  const tableLogic = document.createElement('table');
  tableLogic.classList.add('wikitable');

  // Header row for Logic table
  const logicHead = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['Symbol', 'Latex', 'Keyboard Input'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.style.textAlign = 'left';
      th.style.padding = '8px';
      headRow.appendChild(th);
  });
  logicHead.appendChild(headRow);
  tableLogic.appendChild(logicHead);

  // Create table body
  const tbodyLogic = document.createElement('tbody');

  // Loop through symbols and generate table rows
  for (let i = 0; i < logicalSymbols.length; i++) {
    const symbol1 = logicalSymbols[i].symbol;
    const code1 = logicalSymbols[i].code;
    const input1 = logicalSymbols[i].input;

    const row = document.createElement('tr');

    const symbolCell1 = document.createElement('td');
    const symbolSpan1 = document.createElement('span');
    symbolSpan1.innerHTML = symbol1;
    symbolCell1.appendChild(symbolSpan1);
    row.appendChild(symbolCell1);

    const codeCell1 = document.createElement('td');
    const codeCode1 = document.createElement('span');
    codeCode1.textContent = code1;
    codeCell1.appendChild(codeCode1);
    row.appendChild(codeCell1);
    
    const inputCell1 = document.createElement('td');
    const inputCode1 = document.createElement('code');
    inputCode1.textContent = input1;
    inputCell1.appendChild(inputCode1);
    row.appendChild(inputCell1);

    tbodyLogic.appendChild(row);
  }

  const operationHeader = document.createElement('div');
  operationHeader.textContent = 'Operations & Syntax';
  operationHeader.id = 'operationHeader';
  operationHeader.style.fontSize = fontSize + 'px';
  operationHeader.style.fontWeight = 'bold';
  operationHeader.style.marginBottom = '10px';
  operationHeader.style.marginTop = '26px';

  // Append table body to table
  tableLogic.appendChild(tbodyLogic);


  container.appendChild(greekLettersHeader);
  container.appendChild(table);

  container.appendChild(operationHeader);
  container.appendChild(tableLogic);

  return container;
}

function helpInput() {
  // Case sensitivity note
  var caseNote = createHelpItem('Case Sensitivity', 'P(x) vs x', 'Use UPPERCASE letters for Predicates/Relations (e.g., P, Q, R) and lowercase letters for Variables/Functions (e.g., x, y, f, g).', '');
  
  var inline = createHelpItem('Inline', '(A⇒B)∧(B⇒C)⇒(A⇒C)', 'The user can enter logical formulas in a single line. The program will automatically identify the formula and allow you to make operations on it.', '');
  var multiline = createHelpItem('Multiline', 'A⇒B<br>B⇒C<br>C<br>————————<br>(A⇒B)∧(B⇒C)⇒(A⇒C)',
    'In this mode, the user can enter logical formulas one per line. All hypotheses are entered above the line, and the result or proven statement is entered below the line', '');
  var proves = createHelpItem('Formal proof', 'A⇒B, C ⊢ (B⇒C)⇒(A⇒C)',
    'In this mode, the user can enter logical formulas one by one, separated a comma. All hypotheses are entered before the symbol ⊢, and the result or proven statement is entered after', '');

  info.appendChild(caseNote);
  info.appendChild(inline);
  info.appendChild(multiline);
  info.appendChild(proves);
}


var button = document.getElementById('redirectButton');
// Додаємо обробник події 'click', який виконається при натисканні на кнопку
button.addEventListener('click', function () {
  // Виконуємо редірект
  console.log("123123");
  window.open('https://forms.gle/k3v3sXibjAMzaqQ1A', '_blank');
});


