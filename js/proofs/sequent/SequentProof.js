
import {CharStreams, CommonTokenStream, ParseTreeWalker} from 'antlr4';
import GrammarLexer from '../../../my_antlr/GrammarLexer.js';
import GrammarParser from '../../../my_antlr/GrammarParser.js';
import MyGrammarListener from '../../../my_antlr/MyGrammarListener.js';
import * as deductive from '../../core/deductiveEngine.js';
import {formulaToString} from "../../core/formatter.js";
import {shakeElement, typeProof} from "../../index.js";
import {SEQUENT_CALCULUS_RULES, getRuleName, ruleSequentHandlers} from "./ruleSequentHandlers.js";
import {latexSequent} from "../../ui/latexGen.js";
import {saveStateSequent, addNextLastButtonClickSequent, clearStateHistory} from "../../state/stateManager.js";


// Context for Sequent Calculus
export let sequentContext = {
    treeRoot: null
};

export let sequentState = 0;

export function setSequentState(val) {
    sequentState = val;
}

export function setSequentContext(val) {
    sequentContext.treeRoot = val.treeRoot;
}

// Represents a Sequent: Γ ⊢ Δ
export class Sequent {
    constructor(antecedent = [], succedent = []) {
        this.antecedent = antecedent; // Array of formula objects
        this.succedent = succedent;   // Array of formula objects
        this.children = [];           // Child sequents
        this.ruleApplied = null;      // Name of the rule applied
        this.level = 0;               // Tree level
        this.domElement = null;       // Reference to DOM element
        this.isClosed = false;        // Is this branch closed (axiom/id)?
    }
}

export let side; // Currently selected element (wrapper div) represents the ACTIVE sequent node
export let selectedFormulaIndex = { side: null, index: -1 }; // { side: 'left'|'right', index: number }
export let currentLevel = 0; // Global level counter (similar to Gentzen)

export function setSide(val) {
    side = val;
}

export function setCurrentLevel(val) {
    currentLevel = val;
}

export function setSelectedFormulaIndex(val) {
    selectedFormulaIndex = val;
}

// Map from DOM element ID to Sequent object for easy retrieval
let domToSequentMap = new WeakMap();

/**
 * Parses the input expression and initializes the Sequent Proof.
 */
export function parseExpression(text) {
    if (!text || text.trim().length === 0) {
        shakeElement('enter', 5);
        return;
    }

    document.getElementById('enterFormula').className = 'hidden';
    document.getElementById('proof-menu').className = 'proof-menu';

    latexSequent(sequentContext);

    const proofContainer = document.getElementById('proof');
    proofContainer.innerHTML = '';

    clearStateHistory();
    currentLevel = 0;
    sequentState = 0;

    let leftParts = [];
    let rightParts = [];

    if (text.includes('⊢')) {
        const sides = text.split('⊢');
        if (sides[0].trim()) leftParts = splitFormulas(sides[0]);
        if (sides[1].trim()) rightParts = splitFormulas(sides[1]);
    } else {
        rightParts = [text.trim()];
    }

    const antecedent = leftParts.map(str => parseFormula(str));
    const succedent = rightParts.map(str => parseFormula(str));

    const rootSequent = new Sequent(antecedent, succedent);
    rootSequent.level = 0;
    sequentContext.treeRoot = rootSequent;

    // Create the initial tree node
    createSequentNode(rootSequent, proofContainer);

    // Select the root initially
    if (rootSequent.domElement) {
        selectSequent(rootSequent.domElement, rootSequent);
    }

    generateSequentButtons();
    addNextLastButtonClickSequent();
    addOrRemoveParenthesesSequent();
    saveStateSequent();
    document.getElementById('undo_redo').style.display = 'flex';
}

/**
 * Rebuilds the visual tree from the Sequent Context (used for state restoration).
 */
export function rebuildTree(rootNode) {
    const proofContainer = document.getElementById('proof');
    proofContainer.innerHTML = '';
    domToSequentMap = new WeakMap(); // Reset map

    if (!rootNode) return;

    renderSequentTree(rootNode, proofContainer);
    generateSequentButtons();

    // Try to restore selection if side was saved, but side is a DOM element which is now gone.
    // We might default to selecting the root or the last active node if we could track it.
    // For now, select root.
    if (rootNode.domElement) {
        selectSequent(rootNode.domElement, rootNode);
    }
}

/**
 * Recursively renders the Sequent Tree.
 */
function renderSequentTree(sequentNode, container) {
    // 1. Create the node UI
    const levelDiv = createSequentNode(sequentNode, container);

    // Explicitly append non-root nodes to the container
    if (sequentNode.level > 0 && container) {
        container.appendChild(levelDiv);
    }

    // 2. If it has children, render the inference structure
    if (sequentNode.children && sequentNode.children.length > 0) {
        const parentLevelDiv = levelDiv; // createSequentNode returns the level wrapper

        const inferenceRow = document.createElement('div');
        inferenceRow.style.display = 'flex';
        inferenceRow.style.flexDirection = 'row';
        inferenceRow.style.alignItems = 'flex-end';
        inferenceRow.style.justifyContent = 'center';
        inferenceRow.style.gap = '0px';
        inferenceRow.style.position = 'relative';
        inferenceRow.style.marginLeft = '45px';
        inferenceRow.style.marginRight = '45px';

        const premisesGroup = document.createElement('div');
        premisesGroup.style.display = 'flex';
        premisesGroup.style.flexDirection = 'column';
        premisesGroup.style.alignItems = 'center';

        const nodesContainer = document.createElement('div');
        nodesContainer.style.display = 'flex';
        nodesContainer.style.flexDirection = 'row';
        nodesContainer.style.gap = '80px';
        nodesContainer.style.justifyContent = 'center';
        nodesContainer.style.alignItems = 'flex-end';
        nodesContainer.style.borderBottom = '2px solid black';
        nodesContainer.style.paddingBottom = '3px';
        nodesContainer.style.marginBottom = '0px';

        sequentNode.children.forEach(child => {
            renderSequentTree(child, nodesContainer);
        });

        premisesGroup.appendChild(nodesContainer);

        const ruleLabel = deductive.createLineLevel(sequentNode.ruleApplied || '');
        ruleLabel.style.position = 'absolute';
        ruleLabel.style.right = '-45px';
        ruleLabel.style.bottom = '-15px';
        ruleLabel.style.width = '45px';
        ruleLabel.style.textAlign = 'left';
        ruleLabel.style.whiteSpace = 'nowrap';

        inferenceRow.appendChild(premisesGroup);
        inferenceRow.appendChild(ruleLabel);

        parentLevelDiv.insertBefore(inferenceRow, parentLevelDiv.firstChild);
    }
    // 3. If closed (axiom), render closure line
    else if (sequentNode.isClosed) {
        const parentLevelDiv = levelDiv;

        const inferenceRow = document.createElement('div');
        inferenceRow.style.display = 'flex';
        inferenceRow.style.flexDirection = 'row';
        inferenceRow.style.alignItems = 'flex-end';
        inferenceRow.style.justifyContent = 'center';
        inferenceRow.style.gap = '0px';
        inferenceRow.style.position = 'relative';
        inferenceRow.style.marginLeft = '45px';
        inferenceRow.style.marginRight = '45px';

        const closureLine = document.createElement('div');
        closureLine.style.borderBottom = '2px solid black';
        closureLine.style.width = '100px';
        closureLine.style.marginBottom = '0px';

        const ruleLabel = deductive.createLineLevel(sequentNode.ruleApplied || '');
        ruleLabel.style.position = 'absolute';
        ruleLabel.style.right = '-45px';
        ruleLabel.style.bottom = '-10px';
        ruleLabel.style.width = '45px';
        ruleLabel.style.textAlign = 'left';
        ruleLabel.style.whiteSpace = 'nowrap';

        inferenceRow.appendChild(closureLine);
        inferenceRow.appendChild(ruleLabel);

        parentLevelDiv.insertBefore(inferenceRow, parentLevelDiv.firstChild);
        sequentNode.domElement.classList.add('closed');
    }
}

/**
 * Creates a visual node for a Sequent in the DOM.
 */
export function createSequentNode(sequentNode, container) {
    // Level wrapper
    const levelDiv = document.createElement('div');
    levelDiv.className = `proof-element_level-${sequentNode.level}`;
    levelDiv.style.display = 'flex';
    levelDiv.style.flexDirection = 'column';
    levelDiv.style.alignItems = 'center';
    levelDiv.style.flexShrink = '0'; // Prevent shrinking

    const proofDiv = document.createElement('div');
    proofDiv.className = 'proof-content';
    proofDiv.style.whiteSpace = 'nowrap';

    // Store reference in WeakMap
    domToSequentMap.set(proofDiv, sequentNode);
    sequentNode.domElement = proofDiv;

    // Render Antecedent
    const leftHtml = sequentNode.antecedent.map((f, i) =>
        `<span class="sequent-formula" data-side="left" data-index="${i}">${formatFormula(f)}</span>`
    ).join(', ');

    // Render Succedent
    const rightHtml = sequentNode.succedent.map((f, i) =>
        `<span class="sequent-formula" data-side="right" data-index="${i}">${formatFormula(f)}</span>`
    ).join(', ');

    const turnstile = `<span class="turnstile"> ⊢ </span>`;

    proofDiv.innerHTML = `<label id="proofText">${leftHtml || ''}${turnstile}${rightHtml || ''}</label>`;

    // Add interactivity
    proofDiv.querySelectorAll('.sequent-formula').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            handleFormulaClick(el, sequentNode);
        });
    });

    proofDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        selectSequent(proofDiv, sequentNode);
    });

    levelDiv.appendChild(proofDiv);

    // For the initial root call:
    if (sequentNode.level === 0 && container) {
        container.appendChild(levelDiv);
    }

    return levelDiv;
}

/**
 * Adds new premises using Flexbox layout to prevent overlap.
 */
export function addChildrenToTree(parentSequent, newSequents, ruleName) {
    if (!parentSequent || !parentSequent.domElement) return;

    const parentLevelDiv = parentSequent.domElement.parentNode;

    // Main container for the "inference step" (Premises + Line + Rule Name)
    // Using Flexbox Row to place Rule Name to the right, occupying real space.
    const inferenceRow = document.createElement('div');
    inferenceRow.style.display = 'flex';
    inferenceRow.style.flexDirection = 'row';
    inferenceRow.style.alignItems = 'flex-end'; // Align to bottom (line level)
    inferenceRow.style.justifyContent = 'center';
    inferenceRow.style.gap = '0px';
    // Key fix for centering: Add symmetric margins to reserve space for the label
    // without shifting the center.
    inferenceRow.style.position = 'relative';
    inferenceRow.style.marginLeft = '45px';
    inferenceRow.style.marginRight = '45px';

    // Container for Premises + Line
    const premisesGroup = document.createElement('div');
    premisesGroup.style.display = 'flex';
    premisesGroup.style.flexDirection = 'column'; // Premises above line
    premisesGroup.style.alignItems = 'center';

            // Container for the premises nodes themselves

            const nodesContainer = document.createElement('div');

            nodesContainer.style.display = 'flex';

            nodesContainer.style.flexDirection = 'row';

            nodesContainer.style.gap = '80px';

            nodesContainer.style.justifyContent = 'center';    nodesContainer.style.alignItems = 'flex-end';
    nodesContainer.style.borderBottom = '2px solid black'; // The inference line
    nodesContainer.style.paddingBottom = '3px';
    nodesContainer.style.marginBottom = '0px'; // No margin, line is at absolute bottom

    newSequents.forEach(seq => {
        seq.level = parentSequent.level + 1;
        const node = createSequentNode(seq, null);
        nodesContainer.appendChild(node);
        parentSequent.children.push(seq);
    });

    premisesGroup.appendChild(nodesContainer);

    // Rule Label (Absolute positioned in the reserved margin area)
    const ruleLabel = deductive.createLineLevel(ruleName);
    ruleLabel.style.position = 'absolute';
    ruleLabel.style.right = '-45px'; // Move into the right margin
    ruleLabel.style.bottom = '-15px'; // Align baseline with line
    ruleLabel.style.width = '45px';  // Constrain width to margin (or allow overflow)
    ruleLabel.style.textAlign = 'left';
    ruleLabel.style.whiteSpace = 'nowrap';
    // ruleLabel.style.fontSize = '14px'; // Removed to match tree font size

    parentSequent.ruleApplied = ruleName;

    inferenceRow.appendChild(premisesGroup);
    inferenceRow.appendChild(ruleLabel);

    // Insert
    parentLevelDiv.insertBefore(inferenceRow, parentLevelDiv.firstChild);

    currentLevel++;

    if (newSequents.length > 0) {
        selectSequent(newSequents[0].domElement, newSequents[0]);
    }

    saveStateSequent();
}

/**
 * Mark a branch as closed (axiom application).
 */
export function closeBranch(sequentNode, ruleName) {
    if (!sequentNode || !sequentNode.domElement) return;

    sequentNode.isClosed = true;

    // Clear selection
    document.querySelectorAll('.sequent-formula').forEach(el => {
        el.classList.remove('selected');
        el.style.backgroundColor = '';
    });
    selectedFormulaIndex = { side: null, index: -1 };

    const parentLevelDiv = sequentNode.domElement.parentNode;

    // Flex structure for Axiom closure
    const inferenceRow = document.createElement('div');
    inferenceRow.style.display = 'flex';
    inferenceRow.style.flexDirection = 'row';
    inferenceRow.style.alignItems = 'flex-end';
    inferenceRow.style.justifyContent = 'center';
    inferenceRow.style.gap = '0px';
    inferenceRow.style.position = 'relative';
    inferenceRow.style.marginLeft = '45px';
    inferenceRow.style.marginRight = '45px';

    const closureLine = document.createElement('div');
    closureLine.style.borderBottom = '2px solid black';
    closureLine.style.width = '100px';
    closureLine.style.marginBottom = '0px';
    // Empty div acts as the line

    const ruleLabel = deductive.createLineLevel(ruleName);
    ruleLabel.style.position = 'absolute';
    ruleLabel.style.right = '-45px';
    ruleLabel.style.bottom = '-10px';
    ruleLabel.style.width = '45px';
    ruleLabel.style.textAlign = 'left';
    ruleLabel.style.whiteSpace = 'nowrap';
    // ruleLabel.style.fontSize = '14px';

    sequentNode.ruleApplied = ruleName;

    inferenceRow.appendChild(closureLine);
    inferenceRow.appendChild(ruleLabel);

    parentLevelDiv.insertBefore(inferenceRow, parentLevelDiv.firstChild);

    sequentNode.domElement.classList.add('closed');
    saveStateSequent();
}


// --- Helper Functions ---

export function getActiveSequent() {
    if (!side) return null;
    return domToSequentMap.get(side);
}

function selectSequent(domElement, sequentNode) {
    side = domElement;

    // Clear all highlights (both formulas and whole labels)
    document.querySelectorAll('.sequent-formula').forEach(el => {
        el.classList.remove('selected');
        el.style.backgroundColor = '';
    });
    document.querySelectorAll('#proofText').forEach(el => {
        el.style.background = '';
    });

    // Highlight the whole sequent label
    const label = side.querySelector('#proofText');
    if (label) {
        label.style.background = 'rgba(136,190,213,0.78)';
    }

    selectedFormulaIndex = { side: null, index: -1 };

    // Disable parentheses buttons when whole sequent is selected
    const addBtn = document.getElementById('addParentheses');
    const delBtn = document.getElementById('deleteParentheses');
    const retBtn = document.getElementById('returnUserInput');
    if (addBtn) addBtn.disabled = true;
    if (delBtn) delBtn.disabled = true;
    if (retBtn) retBtn.disabled = true;
    if (addBtn) addBtn.classList.add('disabled-action-btn');
    if (delBtn) delBtn.classList.add('disabled-action-btn');
    if (retBtn) retBtn.classList.add('disabled-action-btn');
}

function parseFormula(text) {
    try {
        const chars = CharStreams.fromString(text);
        const lexer = new GrammarLexer(chars);
        const tokens = new CommonTokenStream(lexer);
        const parser = new GrammarParser(tokens);
        parser.removeErrorListeners();
        const tree = parser.formula();
        const listener = new MyGrammarListener();
        ParseTreeWalker.DEFAULT.walk(listener, tree);
        return listener.stack.pop();
    } catch (e) {
        console.error("Error parsing formula:", text, e);
        return { type: 'atom', value: text };
    }
}

function splitFormulas(text) {
    const parts = [];
    let current = '';
    let parenDepth = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;

        if (char === ',' && parenDepth === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current.trim()) parts.push(current.trim());
    return parts.filter(s => s.length > 0);
}

function formatFormula(formulaObj) {
    return deductive.convertToLogicalExpression(formulaObj);
}

function handleFormulaClick(element, sequentNode) {
    if (sequentNode.isClosed) return;

    if (sequentNode.domElement !== side) {
        selectSequent(sequentNode.domElement, sequentNode);
    }

    // Clear highlights (especially the whole sequent highlight from selectSequent)
    document.querySelectorAll('.sequent-formula').forEach(el => {
        el.classList.remove('selected');
        el.style.backgroundColor = '';
    });
    document.querySelectorAll('#proofText').forEach(el => {
        el.style.background = '';
    });

    element.classList.add('selected');
    element.style.backgroundColor = '#e3f2fd';

    selectedFormulaIndex = {
        side: element.dataset.side,
        index: parseInt(element.dataset.index)
    };

    // Enable parentheses buttons when a formula is selected, but disable 'Original Proof' as it is the default state
    const addBtn = document.getElementById('addParentheses');
    const delBtn = document.getElementById('deleteParentheses');
    const retBtn = document.getElementById('returnUserInput');
    
    if (addBtn) {
        addBtn.disabled = false;
        addBtn.classList.remove('disabled-action-btn');
    }
    if (delBtn) {
        delBtn.disabled = false;
        delBtn.classList.remove('disabled-action-btn');
    }
    if (retBtn) {
        retBtn.disabled = true;
        retBtn.classList.add('disabled-action-btn');
    }
}

function generateSequentButtons() {
    const buttonContainer = document.getElementById('button-container');
    buttonContainer.innerHTML = '';

    SEQUENT_CALCULUS_RULES.forEach(ruleLatex => {
        const btn = document.createElement('button');
        btn.className = 'button';
        btn.innerHTML = ruleLatex;

        const ruleName = getRuleName(ruleLatex);

        btn.onclick = () => {
            if (ruleSequentHandlers[ruleName]) {
                try {
                    ruleSequentHandlers[ruleName].action();
                } catch (e) {
                    console.error(`Error executing rule "${ruleName}":`, e);
                }
            } else {
                console.warn(`No handler found for rule: "${ruleName}"`);
            }
        };

        buttonContainer.appendChild(btn);
    });

    if (window.MathJax) {
        window.MathJax.typesetPromise([buttonContainer]).catch(err => console.warn('MathJax error:', err));
    }
}

function addOrRemoveParenthesesSequent() {
    const addBtn = document.getElementById('addParentheses');
    const delBtn = document.getElementById('deleteParentheses');
    const retBtn = document.getElementById('returnUserInput');

    if (!addBtn || !delBtn || !retBtn) return;

    // Helper to get the currently selected formula element and its data
    function getSelectedFormulaData() {
        if (!side || selectedFormulaIndex.index === -1) return null;
        
        const sequentNode = domToSequentMap.get(side);
        if (!sequentNode) return null;

        const formulas = selectedFormulaIndex.side === 'left' ? sequentNode.antecedent : sequentNode.succedent;
        const formulaObj = formulas[selectedFormulaIndex.index];
        
        // Find the specific span element
        const selector = `.sequent-formula[data-side="${selectedFormulaIndex.side}"][data-index="${selectedFormulaIndex.index}"]`;
        const span = side.querySelector(selector);
        
        return { formulaObj, span };
    }

    function resetBtn(btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        return newBtn;
    }

    const newAddBtn = resetBtn(addBtn);
    const newDelBtn = resetBtn(delBtn);
    const newRetBtn = resetBtn(retBtn);

    // Helper to manage button states - defined AFTER resetting buttons to use the new references
    function updateButtons(clickedBtn) {
        // Enable all first
        [newAddBtn, newDelBtn, newRetBtn].forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled-action-btn');
        });

        // Disable the active one
        if (clickedBtn) {
            clickedBtn.disabled = true;
            clickedBtn.classList.add('disabled-action-btn');
        }
    }

    newAddBtn.addEventListener('click', function () {
        const data = getSelectedFormulaData();
        if (data && data.span) {
            data.span.textContent = formulaToString(data.formulaObj, 1); // 1 = full parens
            updateButtons(newAddBtn);
        }
    });

    newDelBtn.addEventListener('click', function () {
        const data = getSelectedFormulaData();
        if (data && data.span) {
            data.span.textContent = formulaToString(deductive.getProof(data.formulaObj), 0); // 0 = minimal parens
            updateButtons(newDelBtn);
        }
    });

    newRetBtn.addEventListener('click', function () {
        const data = getSelectedFormulaData();
        if (data && data.span) {
            // Restore default formatting as a "return to user input" equivalent
            data.span.textContent = deductive.convertToLogicalExpression(data.formulaObj);
            updateButtons(newRetBtn);
        } else {
             // Shake if nothing selected
             // shakeButton(newRetBtn); // Need to import shakeButton or define it
        }
    });
}
