import * as treeLevel from "./tree";
import {side} from '../index';
import {processExpression} from '../index';
import {checkWithAntlr} from '../core/deductiveEngine';

// Modal Elements
const helpModal = document.getElementById('helpModal');
const closeButton = document.querySelector('.closeHelp');
const navbarItems = document.querySelectorAll('#helpModal .helpNavbarItem');
const info = document.getElementById('info');

// Open Modal Buttons (Home Sidebar & Proof Sidebar)
const openButtons = [
    document.getElementById('helpBtn'),
    document.getElementById('sb-help')
];

openButtons.forEach(btn => {
    if (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            helpModal.style.display = 'flex';
            // Default to General tab if empty or just reset
            setActiveTab(0);
        });
    }
});

// Close Modal Logic
if (closeButton) {
    closeButton.addEventListener('click', function () {
        helpModal.style.display = 'none';
    });
}

if (helpModal) {
    helpModal.addEventListener('click', function (event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
}

// Tabs Logic
navbarItems.forEach(function (item, index) {
    item.addEventListener('click', function () {
        setActiveTab(index);
    });
});

function setActiveTab(index) {
    // Update Active Class
    navbarItems.forEach(item => item.classList.remove('active'));
    if (navbarItems[index]) {
        navbarItems[index].classList.add('active');
    }

    // Update Content
    if (!info) return;
    info.innerHTML = '';
    
    // Determine content based on text
    const tabName = navbarItems[index].textContent.trim();

    if (tabName === 'General') {
        setGeneral();
    } else if (tabName === 'Syntax') {
        info.appendChild(createMathTable());
    } else if (tabName === 'Axioms') {
        setAxioms();
    } else if (tabName === 'Input') {
        helpInput();
    }
}


// --- Content Generators ---

function createCard(title, subtitle, description, iconClass) {
    const card = document.createElement('div');
    card.className = 'help-item-card';

    // Icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'help-icon';
    const icon = document.createElement('i');
    icon.className = iconClass;
    iconDiv.appendChild(icon);

    // Content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'help-content';

    const titleEl = document.createElement('span');
    titleEl.className = 'help-item-title';
    titleEl.textContent = title;
    
    contentDiv.appendChild(titleEl);

    if (subtitle) {
        const subtitleEl = document.createElement('div');
        subtitleEl.className = 'help-item-subtitle';
        subtitleEl.innerHTML = subtitle;
        contentDiv.appendChild(subtitleEl);
    }

    const descEl = document.createElement('div'); // changed to div for block content
    descEl.className = 'help-item-desc';
    descEl.innerHTML = description; 

    contentDiv.appendChild(descEl);

    card.appendChild(iconDiv);
    card.appendChild(contentDiv);

    return card;
}

function setGeneral() {
    info.appendChild(createCard('Proof by deduction', 'Proof', 'Click the "Proof" button (or Play icon) to start the natural deduction environment.', 'ri-play-fill'));
    info.appendChild(createCard('Example', 'Paste example', 'Use "Paste Example" in the sidebar to load pre-defined problems and demonstrate the solver capabilities.', 'ri-file-text-line'));
    info.appendChild(createCard('Appearance', 'Font size', 'Use the font size selector in the top header to adjust text size for better readability.', 'ri-text'));
}

function setAxioms() {
    const createHeader = (text) => {
        const h = document.createElement('div');
        h.className = 'section-header';
        h.textContent = text;
        return h;
    };

    info.appendChild(createHeader('Robinson Arithmetic'));
    const axioms = [
        ['Axiom 1', 's(x) ≠ 0', 'Zero is not a successor of any number.'],
        ['Axiom 2', 's(x) = s(y) ⇒ x = y', 'Successor function is injective.'],
        ['Axiom 3', 'x + 0 = x', 'Identity element for addition.'],
        ['Axiom 4', 'x + s(y) = s(x + y)', 'Recursive definition of addition.'],
        ['Axiom 5', 'x * 0 = 0', 'Multiplication by zero.'],
        ['Axiom 6', 'x * s(y) = (x * y) + x', 'Recursive definition of multiplication.'],
        ['Axiom 7', 'x = x', 'Reflexivity of equality.']
    ];
    axioms.forEach(ax => info.appendChild(createCard(ax[0], ax[1], ax[2], 'ri-bookmark-line')));


    info.appendChild(createHeader('Linear Order'));
    const orders = [
        ['Order 1', '¬(x < x)', 'Irreflexivity of strict order.'],
        ['Order 2', 'x < y ∧ y < z ⇒ x < z', 'Transitivity of order.'],
        ['Order 3', 'x < y ∨ x = y ∨ y < x', 'Trichotomy law (linearity).']
    ];
    orders.forEach(ord => info.appendChild(createCard(ord[0], ord[1], ord[2], 'ri-sort-asc')));
}

function helpInput() {
    info.appendChild(createCard('Case Sensitivity', 'P(x) vs x', 'Use <b>UPPERCASE</b> letters for Predicates/Relations (e.g., P, Q, R) and <b>lowercase</b> letters for Variables/Functions (e.g., x, y, f, g).', 'ri-edit-box-line'));
    info.appendChild(createCard('Inline', '(A⇒B)∧(B⇒C)⇒(A⇒C)', 'Enter logical formulas in a single line. The program will automatically identify the formula.', 'ri-text-spacing'));
    info.appendChild(createCard('Multiline', 'A⇒B<br>B⇒C<br>C<br>————————<br>(A⇒B)∧(B⇒C)⇒(A⇒C)', 'Formulas one per line. Hypotheses above the line, conclusion below.', 'ri-list-check'));
    info.appendChild(createCard('Formal proof', 'A⇒B, C ⊢ (B⇒C)⇒(A⇒C)', 'Formulas separated by comma. Hypotheses before ⊢, conclusion after.', 'ri-function-line'));
}

function createMathTable() {
    const container = document.createElement('div');

    const greekHeader = document.createElement('div');
    greekHeader.className = 'section-header';
    greekHeader.textContent = 'Greek Letters';
    container.appendChild(greekHeader);

    // Greek Table
    const greekTable = document.createElement('table');
    greekTable.className = 'help-table';
    greekTable.innerHTML = `
        <thead>
            <tr><th>Symbol</th><th>LaTeX</th><th>Symbol</th><th>LaTeX</th></tr>
        </thead>
        <tbody>
            <tr><td>α Α</td><td><code>\\alpha \\Alpha</code></td><td>β Β</td><td><code>\\beta \\Beta</code></td></tr>
            <tr><td>γ Γ</td><td><code>\\gamma \\Gamma</code></td><td>δ Δ</td><td><code>\\delta \\Delta</code></td></tr>
            <tr><td>ε Ε</td><td><code>\\epsilon \\Epsilon</code></td><td>ζ Ζ</td><td><code>\\zeta \\Zeta</code></td></tr>
            <tr><td>η Η</td><td><code>\\eta \\Eta</code></td><td>θ Θ</td><td><code>\\theta \\Theta</code></td></tr>
            <tr><td>ι Ι</td><td><code>\\iota \\Iota</code></td><td>κ Κ</td><td><code>\\kappa \\Kappa</code></td></tr>
            <tr><td>λ Λ</td><td><code>\\lambda \\Lambda</code></td><td>μ Μ</td><td><code>\\mu \\Mu</code></td></tr>
            <tr><td>ν Ν</td><td><code>\\nu \\Nu</code></td><td>ξ Ξ</td><td><code>\\xi \\Xi</code></td></tr>
            <tr><td>ο Ο</td><td><code>\\omicron \\Omicron</code></td><td>π Π</td><td><code>\\pi \\Pi</code></td></tr>
            <tr><td>ρ Ρ</td><td><code>\\rho \\Rho</code></td><td>σ Σ</td><td><code>\\sigma \\Sigma</code></td></tr>
            <tr><td>τ Τ</td><td><code>\\tau \\Tau</code></td><td>υ Υ</td><td><code>\\upsilon \\Upsilon</code></td></tr>
            <tr><td>φ Φ</td><td><code>\\phi \\Phi</code></td><td>χ Χ</td><td><code>\\chi \\Chi</code></td></tr>
            <tr><td>ψ Ψ</td><td><code>\\psi \\Psi</code></td><td>ω Ω</td><td><code>\\omega \\Omega</code></td></tr>
        </tbody>
    `;
    container.appendChild(greekTable);


    const logicHeader = document.createElement('div');
    logicHeader.className = 'section-header';
    logicHeader.textContent = 'Operations & Syntax';
    container.appendChild(logicHeader);

    // Logic Table
    const logicTable = document.createElement('table');
    logicTable.className = 'help-table';
    logicTable.innerHTML = `
        <thead>
            <tr><th>Symbol</th><th>LaTeX</th><th>Keyboard Input</th></tr>
        </thead>
        <tbody>
            <tr><td>⇒</td><td><code>\\Rightarrow</code></td><td><code>-></code>, <code>=></code></td></tr>
            <tr><td>∨</td><td><code>\\lor</code></td><td><code>|</code>, <code>or</code></td></tr>
            <tr><td>∧</td><td><code>\\land</code></td><td><code>&</code>, <code>and</code></td></tr>
            <tr><td>¬</td><td><code>\\neg</code></td><td><code>!</code>, <code>~</code></td></tr>
            <tr><td>∀</td><td><code>\\forall</code></td><td><code>forall</code>, <code>ALL</code></td></tr>
            <tr><td>∃</td><td><code>\\exists</code></td><td><code>exists</code>, <code>EX</code></td></tr>
            <tr><td>=</td><td><code>=</code></td><td><code>=</code></td></tr>
            <tr><td>≠</td><td><code>\\neq</code></td><td><code>!=</code>, <code><></code></td></tr>
            <tr><td>⊤</td><td><code>\\top</code></td><td><code>TRUE</code></td></tr>
            <tr><td>⊥</td><td><code>\\bot</code></td><td><code>FALSE</code></td></tr>
            <tr><td>s(x)</td><td><code>s(x)</code></td><td><code>s(0)</code></td></tr>
            <tr><td>+</td><td><code>+</code></td><td><code>+</code>, <code>add</code></td></tr>
            <tr><td>*</td><td><code>*</code></td><td><code>*</code>, <code>mult</code></td></tr>
            <tr><td>⊢</td><td><code>\\vdash</code></td><td><code>|-</code></td></tr>
        </tbody>
    `;
    container.appendChild(logicTable);

    return container;
}


// --- Latex Modal Logic ---
const latexCloseBtn = document.querySelector('.closeLatex');
const latexModal = document.getElementById('latexModal');
if (latexCloseBtn && latexModal) {
    latexCloseBtn.addEventListener('click', () => {
        latexModal.style.display = 'none';
    });
    
    // Also close on background click
    latexModal.addEventListener('click', (e) => {
        if (e.target === latexModal) {
            latexModal.style.display = 'none';
        }
    });
}

// Redirect Button (Feedback)
const redirectButton = document.getElementById('redirectButton');
if (redirectButton) {
    redirectButton.addEventListener('click', function (e) {
        e.preventDefault();
        window.open('https://forms.gle/k3v3sXibjAMzaqQ1A', '_blank');
    });
}

// Support Feedback Button in Proof Sidebar
const sbFeedback = document.getElementById('sb-feedback');
if (sbFeedback) {
    sbFeedback.addEventListener('click', function(e) {
         e.preventDefault();
         window.open('https://forms.gle/k3v3sXibjAMzaqQ1A', '_blank');
    });
}
