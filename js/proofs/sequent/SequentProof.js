
import {CharStreams, CommonTokenStream, ParseTreeWalker} from 'antlr4';
import GrammarLexer from '../../../my_antlr/GrammarLexer.js';
import GrammarParser from '../../../my_antlr/GrammarParser.js';
import MyGrammarListener from '../../../my_antlr/MyGrammarListener.js';
import * as deductive from '../../core/deductiveEngine.js';
import {formulaToString} from "../../core/formatter.js";
import {shakeElement, typeProof} from "../../index.js";
import {SEQUENT_CALCULUS_RULES, getRuleName, ruleSequentHandlers} from "./ruleSequentHandlers.js";
import {RULE_CHECKS} from "./rulesSequent.js";
import {latexSequent} from "../../ui/latexGen.js";
import {saveStateSequent, addNextLastButtonClickSequent, clearStateHistory} from "../../state/stateManager.js";
import {createTreeD3} from "../../ui/tree.js";

let hintToggleState = false;

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

    setupTabListeners();
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

    // Clear selection after rule application
    if (side) {
        // Remove highlight from formulas
        document.querySelectorAll('.sequent-formula').forEach(el => {
            el.classList.remove('selected');
            el.style.backgroundColor = '';
        });
        // Remove highlight from sequent label
        const label = side.querySelector('#proofText');
        if (label) {
            label.style.background = '';
        }
        
        side = null;
        selectedFormulaIndex = { side: null, index: -1 };
        
        // Hide menu as nothing is selected
        document.getElementById('proof-menu').className = 'hidden';
        const buttonContainer = document.getElementById('button-container');
        if (buttonContainer) buttonContainer.innerHTML = '';
    }

    saveStateSequent();
}

/**
 * Mark a branch as closed (axiom application).
 */
export function closeBranch(sequentNode, ruleName) {
    if (!sequentNode || !sequentNode.domElement) return;

    sequentNode.isClosed = true;

    // Clear selection of formulas
    document.querySelectorAll('.sequent-formula').forEach(el => {
        el.classList.remove('selected');
        el.style.backgroundColor = '';
    });
    
    // Clear selection of the whole sequent
    if (sequentNode.domElement) {
        const label = sequentNode.domElement.querySelector('#proofText');
        if (label) {
            label.style.background = '';
        }
    }

    selectedFormulaIndex = { side: null, index: -1 };
    
    // Clear global side selection
    if (side === sequentNode.domElement) {
        side = null;
        // Clear buttons as nothing is selected
        const buttonContainer = document.getElementById('button-container');
        if (buttonContainer) {
            buttonContainer.innerHTML = '';
        }
        // Hide the proof menu (buttons and tabs)
        document.getElementById('proof-menu').className = 'hidden';
    }

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
    if (sequentNode.isClosed || sequentNode.children.length > 0) return;

    // Ensure menu is visible
    document.getElementById('proof-menu').className = 'proof-menu';

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

    // if (hintToggleState) {
    //     hintToggleState = false;
    // }
    generateSequentButtons();
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
    if (sequentNode.isClosed || sequentNode.children.length > 0) return;

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

    const treeTab = document.getElementById('tab4');
    if (treeTab && treeTab.checked && typeProof === 2) {
        renderTreeView();
    }
    
    // if (hintToggleState) {
    //     hintToggleState = false;
    //     generateSequentButtons();
    // }
    generateSequentButtons();
}

function generateSequentButtons() {
    const treeTab = document.getElementById('tab4');
    if (treeTab && treeTab.checked && typeProof === 2) {
        return;
    }

    const buttonContainer = document.getElementById('button-container');
    buttonContainer.innerHTML = '';
    // Set position relative for absolute positioning of hint button
    buttonContainer.style.position = 'relative';

    let rulesToDisplay = SEQUENT_CALCULUS_RULES;

    if (hintToggleState) {
        const currentSeq = getActiveSequent();
        rulesToDisplay = SEQUENT_CALCULUS_RULES.filter(ruleLatex => {
            const ruleName = getRuleName(ruleLatex);
            const check = RULE_CHECKS[ruleName];
            try {
                // If check exists, run it. If not, default to false (hide) in hint mode.
                return check ? check(currentSeq, selectedFormulaIndex) : false;
            } catch (e) {
                console.warn(`Error checking rule ${ruleName}:`, e);
                return false;
            }
        });
    }

    rulesToDisplay.forEach(ruleLatex => {
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

    // generateHintButton(buttonContainer); // Removed in favor of sidebar toggle
}

export function toggleSmartMode() {
    hintToggleState = !hintToggleState;
    generateSequentButtons();
    return hintToggleState;
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

let tabListenersInitialized = false;

function setupTabListeners() {
    if (tabListenersInitialized) return;
    tabListenersInitialized = true;

    const tabToggles = document.querySelectorAll('input[name="tab-toggle"]');
    tabToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            if (typeProof !== 2) return;
            const tabId = this.id;
            
            if (tabId === 'tab4') {
                renderTreeView();
            } else {
                generateSequentButtons();
            }
        });
    });
}

function renderTreeView() {
    const buttonContainer = document.getElementById('button-container');
    buttonContainer.innerHTML = '';
    
    if (!side) {
        buttonContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Select a formula or sequent in the proof tree to view its structure.</div>';
        return;
    }
    
    const currentSeq = domToSequentMap.get(side);
    if (!currentSeq) return;
    
    let formula;
    
    if (selectedFormulaIndex.index !== -1) {
        // A specific formula is selected
        const formulas = selectedFormulaIndex.side === 'left' ? currentSeq.antecedent : currentSeq.succedent;
        formula = formulas[selectedFormulaIndex.index];
    } else {
        // The whole sequent is selected
        formula = {
            type: 'sequent',
            premises: currentSeq.antecedent,
            conclusion: currentSeq.succedent
        };
    }
    
    // Container for SVG
    let svgContainer = document.createElement("div");
    svgContainer.style.width = "100%";
    svgContainer.style.maxWidth = "1000px";
    svgContainer.style.overflow = "auto";
    svgContainer.style.height = "auto";
    svgContainer.style.margin = "0 auto";
    svgContainer.style.display = "block";

    let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("id", "sequentTreeSvg"); // Add specific ID for D3 selection
    svgElement.setAttribute("width", "1000");
    svgElement.setAttribute("height", "1000");

    svgContainer.appendChild(svgElement);
    buttonContainer.appendChild(svgContainer);
    
    try {
        let size = createTreeD3(formula);
        svgElement.setAttribute("width", (Math.max(1000, size[0] + 50)).toString());
        svgElement.setAttribute("height", (size[1] + 100).toString());
    } catch (e) {
        console.error("Tree render error:", e);
        buttonContainer.innerHTML = '<div style="padding: 20px; color: red;">Error rendering tree. Select a formula to view.</div>';
    }
}

function generateHintButton(container) {
    const helpButton = document.createElement('button');
    helpButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      z-index: 10;
      width: 48px;
      height: 48px;
    `;
    
    helpButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 40 40">
          <path fill="#b6dcfe" d="M14.5,29.833V28c0-1.914-1.168-3.76-2.52-5.897C10.349,19.525,8.5,16.603,8.5,13 C8.5,6.659,13.659,1.5,20,1.5S31.5,6.659,31.5,13c0,3.603-1.849,6.525-3.48,9.103C26.668,24.24,25.5,26.086,25.5,28v1.833H14.5z"></path>
          <path fill="#4788c7" d="M20,2c6.065,0,11,4.935,11,11c0,3.458-1.808,6.315-3.402,8.835C26.262,23.947,25,25.941,25,28v1.333 h-5h-5V28c0-2.059-1.262-4.053-2.598-6.165C10.808,19.315,9,16.458,9,13C9,6.935,13.935,2,20,2 M20,1C13.373,1,8,6.373,8,13 c0,6.667,6,10.958,6,15v2.333h6h6V28c0-4.042,6-8.333,6-15C32,6.373,26.627,1,20,1L20,1z"></path>
          <path fill="#fff" d="M22.714,11.335c0.502,0,0.974,0.195,1.329,0.55c0.733,0.733,0.733,1.925,0,2.657l-1.75,1.75 L22,16.586V17v12h-4V17v-0.414l-0.293-0.293l-1.75-1.75c-0.733-0.733-0.733-1.925,0-2.657c0.355-0.355,0.827-0.55,1.329-0.55 c0.502,0,0.974,0.195,1.329,0.55l0.679,0.679L20,13.271l0.707-0.707l0.679-0.679C21.741,11.531,22.212,11.335,22.714,11.335 M22.714,10.335c-0.737,0-1.474,0.281-2.036,0.843L20,11.857l-0.679-0.679c-0.562-0.562-1.299-0.843-2.036-0.843 c-0.737,0-1.474,0.281-2.036,0.843c-1.124,1.124-1.124,2.947,0,4.071L17,17v13h6V17l1.75-1.75c1.124-1.124,1.124-2.947,0-4.071 C24.188,10.616,23.451,10.335,22.714,10.335L22.714,10.335z"></path>
          <path fill="#4788c7" d="M20 31A4 4 0 1 0 20 39A4 4 0 1 0 20 31Z"></path>
          <path fill="#dff0fe" d="M17,36.5c-1.378,0-2.5-1.122-2.5-2.5v-5.5h11V34c0,1.378-1.122,2.5-2.5,2.5H17z"></path>
          <path fill="#4788c7" d="M25,29v5c0,1.103-0.897,2-2,2h-6c-1.103,0-2-0.897-2-2v-5H25 M26,28H14v6c0,1.657,1.343,3,3,3h6 c1.657,0,3-1.343,3-3V28L26,28z"></path>
          <path fill="#4788c7" d="M25.5 31h-6c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h6c.275 0 .5.225.5.5l0 0C26 30.775 25.775 31 25.5 31zM25.5 33h-6c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h6c.275 0 .5.225.5.5l0 0C26 32.775 25.775 33 25.5 33zM25.5 35h-6c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h6c.275 0 .5.225.5.5l0 0C26 34.775 25.775 35 25.5 35zM16.5 33h-2c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h2c.275 0 .5.225.5.5l0 0C17 32.775 16.775 33 16.5 33zM16.5 35H15c-.55 0-1-.45-1-1l0 0h2.5c.275 0 .5.225.5.5l0 0C17 34.775 16.775 35 16.5 35zM16.5 31h-2c-.275 0-.5-.225-.5-.5l0 0c0-.275.225-.5.5-.5h2c.275 0 .5.225.5.5l0 0C17 30.775 16.775 31 16.5 31z"></path>
      </svg>
    `;

    helpButton.onmouseenter = () => {
        if (!hintToggleState) {
            helpButton.style.backgroundColor = 'rgba(0, 97, 161, 0.1)';
        }
    };
    helpButton.onmouseleave = () => {
        updateHintButtonAppearance(helpButton);
    };

    helpButton.onclick = () => {
        hintToggleState = !hintToggleState;
        updateHintButtonAppearance(helpButton);
        generateSequentButtons();
        console.log("Hint button clicked (Sequent)");
    };

    updateHintButtonAppearance(helpButton);
    container.appendChild(helpButton);
}

function updateHintButtonAppearance(btn) {
    if (hintToggleState) {
        btn.style.backgroundColor = 'rgba(0, 97, 161, 0.2)';
        btn.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2)';
        btn.style.transform = 'scale(0.95)';
    } else {
        btn.style.backgroundColor = 'transparent';
        btn.style.boxShadow = 'none';
        btn.style.transform = 'scale(1)';
    }
}
