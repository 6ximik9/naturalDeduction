
import * as sequentProof from './SequentProof.js';
import { Sequent, addChildrenToTree, closeBranch, getActiveSequent, selectedFormulaIndex } from './SequentProof.js';
import * as deductive from '../../core/deductiveEngine.js';
import { createInputModal } from '../../ui/modals/input.js';
import { createExchangeModal } from '../../ui/modals/exchange.js';

// --- Logic Helpers ---

/**
 * Helper to safely unwrap parentheses using deductiveEngine logic.
 */
function unwrap(formula) {
    return deductive.getProof(formula);
}

/**
 * Checks if two formulas are structurally equal.
 */
function areFormulasEqual(f1, f2) {
    const s1 = deductive.convertToLogicalExpression(unwrap(f1));
    const s2 = deductive.convertToLogicalExpression(unwrap(f2));
    return s1 === s2;
}

/**
 * Creates a deep copy of a Sequent's formula arrays.
 */
function cloneSequentData(sequent) {
    return {
        ant: [...sequent.antecedent],
        suc: [...sequent.succedent]
    };
}

// --- Rules Implementation ---

export const RULES = {
    // --- Identity & Cut ---

    // Identity: Γ, A ⊢ A, Δ
    id: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        const intersection = currentSeq.antecedent.find(a => 
            currentSeq.succedent.some(s => areFormulasEqual(a, s))
        );

        if (intersection) {
            closeBranch(currentSeq, "id");
        } else {
            console.warn("Rule 'id' not applicable: No common formula found.");
        }
    },

    cut: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        createInputModal('Cut Rule', 'Enter cut formula (φ):')
            .then((formulaStr) => {
                try {
                    // Validate and parse the formula
                    let parsed = deductive.checkWithAntlr(formulaStr);

                    // Handle array result (if user entered "A, B" or similar)
                    if (Array.isArray(parsed)) {
                        if (parsed.length !== 1) {
                            alert("Please enter exactly one formula for the Cut rule.");
                            return;
                        }
                        parsed = parsed[0];
                    }

                    // Ensure we get a clean proof object (AST)
                    const formula = deductive.getProof(parsed);

                    if (!formula) {
                        alert("Invalid formula.");
                        return;
                    }

                    // Prepare data for new branches
                    const { ant, suc } = cloneSequentData(currentSeq);

                    // Branch 1: Γ ⊢ Δ, φ
                    // (Original antecedent, Original succedent + φ)
                    const seq1 = new Sequent([...ant], [...suc, formula]);

                    // Branch 2: φ, Γ ⊢ Δ
                    // (φ + Original antecedent, Original succedent)
                    // Note: Adding to the start of antecedent for visibility
                    const seq2 = new Sequent([formula, ...ant], [...suc]);

                    addChildrenToTree(currentSeq, [seq1, seq2], "cut");

                } catch (e) {
                    console.error("Error applying cut rule:", e);
                    alert("Error parsing the formula. Please checks syntax.");
                }
            })
            .catch((err) => {
                // User cancelled the modal
                console.log("Cut rule cancelled:", err);
            });
    },

    // --- Logical Rules ---

    // AND Left 1: Γ, A ∧ B ⊢ Δ  ==>  Γ, A ⊢ Δ
    andLeft1: () => {
        applyLeftRule((formula) => {
            const f = unwrap(formula);
            if (f.type !== 'conjunction') return null;
            return [f.left || f.operands[0]]; 
        }, "∧l1");
    },

    // AND Left 2: Γ, A ∧ B ⊢ Δ  ==>  Γ, B ⊢ Δ
    andLeft2: () => {
        applyLeftRule((formula) => {
            const f = unwrap(formula);
            if (f.type !== 'conjunction') return null;
            return [f.right || f.operands[1]];
        }, "∧l2");
    },

    // AND Right: Γ ⊢ A ∧ B, Δ  ==>  Γ ⊢ A, Δ  AND  Γ ⊢ B, Δ
    andRight: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        if (selectedFormulaIndex.side !== 'right') {
            alert("Please select a formula on the RIGHT side.");
            return;
        }

        const idx = selectedFormulaIndex.index;
        const targetFormula = unwrap(currentSeq.succedent[idx]);

        if (targetFormula.type !== 'conjunction') {
            alert("Selected formula is not a conjunction.");
            return;
        }

        const { ant, suc } = cloneSequentData(currentSeq);
        suc.splice(idx, 1);

        const A = targetFormula.left || targetFormula.operands[0];
        const B = targetFormula.right || targetFormula.operands[1];

        const seq1 = new Sequent([...ant], [...suc, A]);
        const seq2 = new Sequent([...ant], [...suc, B]);

        addChildrenToTree(currentSeq, [seq1, seq2], "∧r");
    },

    // OR Left: Γ, A ∨ B ⊢ Δ  ==>  Γ, A ⊢ Δ  AND  Γ, B ⊢ Δ
    orLeft: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        if (selectedFormulaIndex.side !== 'left') {
            alert("Please select a formula on the LEFT side.");
            return;
        }

        const idx = selectedFormulaIndex.index;
        const targetFormula = unwrap(currentSeq.antecedent[idx]);

        if (targetFormula.type !== 'disjunction') {
            alert("Selected formula is not a disjunction.");
            return;
        }

        const { ant, suc } = cloneSequentData(currentSeq);
        ant.splice(idx, 1);

        const A = targetFormula.left || targetFormula.operands[0];
        const B = targetFormula.right || targetFormula.operands[1];

        const seq1 = new Sequent([...ant, A], [...suc]);
        const seq2 = new Sequent([...ant, B], [...suc]);

        addChildrenToTree(currentSeq, [seq1, seq2], "∨l");
    },
    
    // OR Right 1: Γ ⊢ A ∨ B, Δ  ==>  Γ ⊢ A, Δ
    orRight1: () => {
        applyRightRule((formula) => {
            const f = unwrap(formula);
            if (f.type !== 'disjunction') return null;
            return [f.left || f.operands[0]];
        }, "∨r1");
    },

    // OR Right 2: Γ ⊢ A ∨ B, Δ  ==>  Γ ⊢ B, Δ
    orRight2: () => {
        applyRightRule((formula) => {
            const f = unwrap(formula);
            if (f.type !== 'disjunction') return null;
            return [f.right || f.operands[1]];
        }, "∨r2");
    },

    // Negation Left: Γ, ¬A ⊢ Δ  ==>  Γ ⊢ A, Δ
    negLeft: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        if (selectedFormulaIndex.side !== 'left') return;
        
        const idx = selectedFormulaIndex.index;
        const targetFormula = unwrap(currentSeq.antecedent[idx]);

        if (targetFormula.type !== 'negation') return;

        const { ant, suc } = cloneSequentData(currentSeq);
        ant.splice(idx, 1); 
        
        let A;
        // Handle double negation count > 1
        if (targetFormula.count && targetFormula.count > 1) {
            // Create a new negation with count - 1
            A = { ...targetFormula, count: targetFormula.count - 1 };
        } else {
            // Just one negation, take the operand
            A = targetFormula.operand || targetFormula.value;
        }
        
        const newSeq = new Sequent([...ant], [...suc, A]);
        addChildrenToTree(currentSeq, [newSeq], "¬l");
    },

    // Negation Right: Γ ⊢ ¬A, Δ  ==>  Γ, A ⊢ Δ
    negRight: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        if (selectedFormulaIndex.side !== 'right') return;
        
        const idx = selectedFormulaIndex.index;
        const targetFormula = unwrap(currentSeq.succedent[idx]);

        if (targetFormula.type !== 'negation') return;

        const { ant, suc } = cloneSequentData(currentSeq);
        suc.splice(idx, 1); 
        
        let A;
        if (targetFormula.count && targetFormula.count > 1) {
            A = { ...targetFormula, count: targetFormula.count - 1 };
        } else {
            A = targetFormula.operand || targetFormula.value;
        }
        
        const newSeq = new Sequent([...ant, A], [...suc]);
        addChildrenToTree(currentSeq, [newSeq], "¬r");
    },

    // Implication Right: Γ ⊢ A ⇒ B, Δ  ==>  Γ, A ⊢ B, Δ
    implRight: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        if (selectedFormulaIndex.side !== 'right') return;
        
        const idx = selectedFormulaIndex.index;
        const targetFormula = unwrap(currentSeq.succedent[idx]);

        if (targetFormula.type !== 'implication') return;

        const { ant, suc } = cloneSequentData(currentSeq);
        suc.splice(idx, 1);
        
        const A = targetFormula.left || targetFormula.operands[0];
        const B = targetFormula.right || targetFormula.operands[1];

        const newSeq = new Sequent([...ant, A], [...suc, B]);
        addChildrenToTree(currentSeq, [newSeq], "⇒r");
    },

    // Implication Left: Γ, A ⇒ B ⊢ Δ  ==>  Γ ⊢ A, Δ  AND  Γ, B ⊢ Δ
    implLeft: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        if (selectedFormulaIndex.side !== 'left') return;
        
        const idx = selectedFormulaIndex.index;
        const targetFormula = unwrap(currentSeq.antecedent[idx]);

        if (targetFormula.type !== 'implication') return;

        const { ant, suc } = cloneSequentData(currentSeq);
        ant.splice(idx, 1);

        const A = targetFormula.left || targetFormula.operands[0];
        const B = targetFormula.right || targetFormula.operands[1];

        const seq1 = new Sequent([...ant], [...suc, A]);
        const seq2 = new Sequent([...ant, B], [...suc]);

        addChildrenToTree(currentSeq, [seq1, seq2], "⇒l");
    },

    // --- Structural ---
    
    weakLeft: () => {
        applyLeftRule(() => [], "wl"); 
    },

    weakRight: () => {
        applyRightRule(() => [], "wr");
    },
    
    contrLeft: () => {
        applyLeftRule((f) => [f, f], "cl");
    },

    contrRight: () => {
        applyRightRule((f) => [f, f], "cr");
    },

    exchLeft: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        createExchangeModal("Exchange Left (Antecedent)", currentSeq.antecedent)
            .then(newAntecedent => {
                // Check if anything actually changed to avoid cluttering history
                const isChanged = JSON.stringify(newAntecedent) !== JSON.stringify(currentSeq.antecedent);
                if (isChanged) {
                    const { suc } = cloneSequentData(currentSeq);
                    // newAntecedent is already an array of formula objects
                    addChildrenToTree(currentSeq, [new Sequent(newAntecedent, suc)], "exl");
                }
            })
            .catch(err => console.log("Exchange cancelled"));
    },

    exchRight: () => {
        const currentSeq = getActiveSequent();
        if (!currentSeq || currentSeq.isClosed) return;

        createExchangeModal("Exchange Right (Succedent)", currentSeq.succedent)
            .then(newSuccedent => {
                const isChanged = JSON.stringify(newSuccedent) !== JSON.stringify(currentSeq.succedent);
                if (isChanged) {
                    const { ant } = cloneSequentData(currentSeq);
                    addChildrenToTree(currentSeq, [new Sequent(ant, newSuccedent)], "exr");
                }
            })
            .catch(err => console.log("Exchange cancelled"));
    },

    // --- Quantifiers (Group 1: Substitution) ---

    // Universal Left: Γ, ∀x φ ⊢ Δ  ==>  Γ, φ[t/x] ⊢ Δ
    forallLeft: () => {
        applyQuantifierSubstitutionRule('left', 'forall', '∀l');
    },

    // Existential Right: Γ ⊢ Δ, ∃x φ  ==>  Γ ⊢ Δ, φ[t/x]
    existsRight: () => {
        applyQuantifierSubstitutionRule('right', 'exists', '∃r');
    },

    // --- Quantifiers (Group 2: Fresh Variable) ---
    
    // Universal Right: Γ ⊢ Δ, ∀x φ  ==>  Γ ⊢ Δ, φ[y/x] (y fresh)
    forallRight: () => {
        applyQuantifierEigenvariableRule('right', 'forall', '∀r');
    },

    // Existential Left: Γ, ∃x φ ⊢ Δ  ==>  Γ, φ[y/x] ⊢ Δ (y fresh)
    existsLeft: () => {
        applyQuantifierEigenvariableRule('left', 'exists', '∃l');
    },

    topLeft: () => {},
    topRight: () => { closeBranch(getActiveSequent(), "⊤r"); },
    botLeft: () => { closeBranch(getActiveSequent(), "⊥l"); },
    botRight: () => {},
};


// --- Helper Wrapper for Single-Premise Rules ---

/**
 * Handles ∀L and ∃R rules which require term substitution.
 */
function applyQuantifierSubstitutionRule(side, quantType, ruleName) {
    const currentSeq = getActiveSequent();
    if (!currentSeq || currentSeq.isClosed) return;

    if (selectedFormulaIndex.side !== side) {
        alert(`Please select a formula on the ${side.toUpperCase()} side.`);
        return;
    }

    const idx = selectedFormulaIndex.index;
    const formulas = side === 'left' ? currentSeq.antecedent : currentSeq.succedent;
    const targetFormula = unwrap(formulas[idx]);

    // Check type
    if (targetFormula.type !== quantType) {
        // Handle legacy 'quantifier' type if necessary
        if (targetFormula.type === 'quantifier') {
            const isForall = targetFormula.quantifier === '∀' || targetFormula.quantifier === 'forall';
            const isExists = targetFormula.quantifier === '∃' || targetFormula.quantifier === 'exists';
            
            if ((quantType === 'forall' && !isForall) || (quantType === 'exists' && !isExists)) {
                alert(`Selected formula is not a ${quantType === 'forall' ? 'universal' : 'existential'} quantifier.`);
                return;
            }
        } else {
            alert(`Selected formula is not a ${quantType === 'forall' ? 'universal' : 'existential'} quantifier.`);
            return;
        }
    }

    // Extract variable and operand
    let variableName = targetFormula.variable;
    // Handle object vs string variable
    if (typeof variableName === 'object') variableName = variableName.name || variableName.value;
    
    let operand = targetFormula.operand || targetFormula.expression;

    createInputModal(`${ruleName} Substitution`, `Enter term (t) to substitute for "${variableName}":`)
        .then(termStr => {
            try {
                let parsedTerm = deductive.checkWithAntlr(termStr);
                if (Array.isArray(parsedTerm)) parsedTerm = parsedTerm[0];
                const term = deductive.getProof(parsedTerm);

                if (!term) {
                    alert("Invalid term.");
                    return;
                }

                // Deep copy operand
                const newFormula = JSON.parse(JSON.stringify(operand));
                
                // Perform substitution
                substituteVariable(newFormula, variableName, term);

                const { ant, suc } = cloneSequentData(currentSeq);
                
                if (side === 'left') {
                    ant.splice(idx, 1, newFormula);
                } else {
                    suc.splice(idx, 1, newFormula);
                }

                addChildrenToTree(currentSeq, [new Sequent(ant, suc)], ruleName);

            } catch (e) {
                console.error("Substitution error:", e);
                alert("Error parsing term.");
            }
        })
        .catch(err => console.log("Substitution cancelled"));
}

/**
 * Handles ∀R and ∃L rules which require a FRESH variable (Eigenvariable condition).
 */
function applyQuantifierEigenvariableRule(side, quantType, ruleName) {
    const currentSeq = getActiveSequent();
    if (!currentSeq || currentSeq.isClosed) return;

    if (selectedFormulaIndex.side !== side) {
        alert(`Please select a formula on the ${side.toUpperCase()} side.`);
        return;
    }

    const idx = selectedFormulaIndex.index;
    const formulas = side === 'left' ? currentSeq.antecedent : currentSeq.succedent;
    const targetFormula = unwrap(formulas[idx]);

    // Check type
    if (targetFormula.type !== quantType) {
        if (targetFormula.type === 'quantifier') {
            const isForall = targetFormula.quantifier === '∀' || targetFormula.quantifier === 'forall';
            const isExists = targetFormula.quantifier === '∃' || targetFormula.quantifier === 'exists';
            
            if ((quantType === 'forall' && !isForall) || (quantType === 'exists' && !isExists)) {
                alert(`Selected formula is not a ${quantType === 'forall' ? 'universal' : 'existential'} quantifier.`);
                return;
            }
        } else {
            alert(`Selected formula is not a ${quantType === 'forall' ? 'universal' : 'existential'} quantifier.`);
            return;
        }
    }

    let variableName = targetFormula.variable;
    if (typeof variableName === 'object') variableName = variableName.name || variableName.value;
    let operand = targetFormula.operand || targetFormula.expression;

    createInputModal(`${ruleName} (Eigenvariable)`, `Enter FRESH variable (y) to substitute for "${variableName}":`)
        .then(newVarStr => {
            try {
                let parsedVar = deductive.checkWithAntlr(newVarStr);
                if (Array.isArray(parsedVar)) parsedVar = parsedVar[0];
                const newVarTerm = deductive.getProof(parsedVar);
                
                if (!newVarTerm) {
                    alert("Invalid input.");
                    return;
                }

                // Extract name
                const newVarName = newVarTerm.name || newVarTerm.value; 
                
                // --- Freshness Check (Eigenvariable Condition) ---
                const allFormulas = [...currentSeq.antecedent, ...currentSeq.succedent];
                let isFresh = true;
                
                for (const f of allFormulas) {
                    const vars = deductive.extractConstantsOrVariables(unwrap(f));
                    if (vars.includes(newVarName)) {
                        isFresh = false;
                        break;
                    }
                }
                
                if (!isFresh) {
                    alert(`Variable "${newVarName}" is NOT fresh. It already appears in the sequent.`);
                    // Re-open the modal so user can try again immediately
                    applyQuantifierEigenvariableRule(side, quantType, ruleName);
                    return;
                }

                // Substitution
                const newFormula = JSON.parse(JSON.stringify(operand));
                substituteVariable(newFormula, variableName, newVarTerm);

                const { ant, suc } = cloneSequentData(currentSeq);
                
                if (side === 'left') {
                    ant.splice(idx, 1, newFormula);
                } else {
                    suc.splice(idx, 1, newFormula);
                }

                addChildrenToTree(currentSeq, [new Sequent(ant, suc)], ruleName);

            } catch (e) {
                console.error("Eigenvariable error:", e);
                alert("Error parsing input.");
            }
        })
        .catch(err => console.log("Eigenvariable rule cancelled"));
}

/**
 * Recursively substitutes a variable with a replacement node in a formula.
 * Modifies the 'node' object in place.
 */
function substituteVariable(node, variable, replacementNode) {
    if (!node || typeof node !== 'object') return;

    // Check if this node IS the variable
    // Variables can be type 'variable' or sometimes 'atom'/'basicTerm' depending on parser
    if (node.type === 'variable' || (node.type === 'atom' && /^[a-z]/.test(node.value))) {
        const name = node.name || node.value;
        if (name === variable) {
            // Replace content of this node with replacementNode
            Object.keys(node).forEach(key => delete node[key]);
            Object.assign(node, JSON.parse(JSON.stringify(replacementNode)));
            return;
        }
    }

    // Recursively process children
    for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(item => substituteVariable(item, variable, replacementNode));
            } else if (typeof child === 'object' && child !== null) {
                substituteVariable(child, variable, replacementNode);
            }
        }
    }
}

function applyLeftRule(transformFn, ruleName) {
    const currentSeq = getActiveSequent();
    if (!currentSeq || currentSeq.isClosed) return;

    if (selectedFormulaIndex.side !== 'left') {
        alert("Please select a formula on the LEFT side.");
        return;
    }

    const idx = selectedFormulaIndex.index;
    const targetFormula = unwrap(currentSeq.antecedent[idx]);

    const newFormulas = transformFn(targetFormula);
    if (!newFormulas) {
        alert("Rule not applicable to selected formula.");
        return;
    }

    const { ant, suc } = cloneSequentData(currentSeq);
    ant.splice(idx, 1, ...newFormulas);

    const newSeq = new Sequent(ant, suc);
    addChildrenToTree(currentSeq, [newSeq], ruleName);
}

function applyRightRule(transformFn, ruleName) {
    const currentSeq = getActiveSequent();
    if (!currentSeq || currentSeq.isClosed) return;

    if (selectedFormulaIndex.side !== 'right') {
        alert("Please select a formula on the RIGHT side.");
        return;
    }

    const idx = selectedFormulaIndex.index;
    const targetFormula = unwrap(currentSeq.succedent[idx]);

    const newFormulas = transformFn(targetFormula);
    if (!newFormulas) {
        alert("Rule not applicable to selected formula.");
        return;
    }

    const { ant, suc } = cloneSequentData(currentSeq);
    suc.splice(idx, 1, ...newFormulas); 

    const newSeq = new Sequent(ant, suc);
    addChildrenToTree(currentSeq, [newSeq], ruleName);
}
