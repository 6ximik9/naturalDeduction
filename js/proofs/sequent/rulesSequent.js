
import * as sequentProof from './SequentProof.js';
import { Sequent, addChildrenToTree, closeBranch, getActiveSequent, selectedFormulaIndex } from './SequentProof.js';
import * as deductive from '../../core/deductiveEngine.js';

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
        console.log("Cut rule requires user input (not implemented yet)");
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

    exchLeft: () => { console.log("Exchange left - manual reordering?"); },
    exchRight: () => { console.log("Exchange right - manual reordering?"); },

    topLeft: () => {},
    topRight: () => { closeBranch(getActiveSequent(), "⊤r"); },
    botLeft: () => { closeBranch(getActiveSequent(), "⊥l"); },
    botRight: () => {},
};


// --- Helper Wrapper for Single-Premise Rules ---

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
