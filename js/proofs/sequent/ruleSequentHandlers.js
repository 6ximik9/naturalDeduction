import { RULES } from './rulesSequent.js';

export const SEQUENT_CALCULUS_RULES = [
  // Pravidlo identity a rezu
  "$$\\frac{}{\\Gamma, \\phi \\vdash \\Delta, \\phi} \\; (id)$$ ",
  "$$\\frac{\\Gamma \\vdash \\Lambda, \\phi \\quad \\phi, \\Delta \\vdash \\Sigma}{\\Gamma, \\Delta \\vdash \\Lambda, \\Sigma} \\; (cut)$$ ",

  // Negácia
  "$$\\frac{\\Gamma \\vdash \\Delta, \\phi}{\\Gamma, \\neg\\phi \\vdash \\Delta} \\; (\\neg l)$$ ",
  "$$\\frac{\\Gamma, \\phi \\vdash \\Delta}{\\Gamma \\vdash \\Delta, \\neg\\phi} \\; (\\neg r)$$ ",

  // Konjunkcia
  "$$\\frac{\\Gamma, \\phi \\vdash \\Delta}{\\Gamma, \\phi \\wedge \\psi \\vdash \\Delta} \\; (\\wedge l1)$$ ",
  "$$\\frac{\\Gamma, \\psi \\vdash \\Delta}{\\Gamma, \\phi \\wedge \\psi \\vdash \\Delta} \\; (\\wedge l2)$$ ",
  "$$\\frac{\\Gamma \\vdash \\Delta, \\phi \\quad \\Gamma \\vdash \\Delta, \\psi}{\\Gamma \\vdash \\Delta, \\phi \\wedge \\psi} \\; (\\wedge r)$$ ",

  // Disjunkcia
  "$$\\frac{\\Gamma \\vdash \\Delta, \\phi}{\\Gamma \\vdash \\Delta, \\phi \\vee \\psi} \\; (\\vee r1)$$ ",
  "$$\\frac{\\Gamma \\vdash \\Delta, \\psi}{\\Gamma \\vdash \\Delta, \\phi \\vee \\psi} \\; (\\vee r2)$$ ",
  "$$\\frac{\\Gamma, \\phi \\vdash \\Delta \\quad \\Gamma, \\psi \\vdash \\Delta}{\\Gamma, \\phi \\vee \\psi \\vdash \\Delta} \\; (\\vee l)$$ ",

  // Implikácia
  "$$\\frac{\\Gamma, \\phi \\vdash \\Delta, \\psi}{\\Gamma \\vdash \\Delta, \\phi \\Rightarrow \\psi} \\; (\\Rightarrow r)$$ ",
  "$$\\frac{\\Gamma \\vdash \\Lambda, \\phi \\quad \\Delta, \\psi \\vdash \\Sigma}{\\Gamma, \\Delta, \\phi \\Rightarrow \\psi \\vdash \\Lambda, \\Sigma} \\; (\\Rightarrow l)$$ ",

  // Konštanty
  "$$\\frac{\\Gamma \\vdash \\Delta}{\\Gamma, \\top \\vdash \\Delta} \\; (\\top l)$$ ",
  "$$\\frac{}{\\Gamma \\vdash \\Delta, \\top} \\; (\\top r)$$ ",
  "$$\\frac{\\Gamma \\vdash \\Delta}{\\Gamma \\vdash \\Delta, \\bot} \\; (\\bot r)$$ ",
  "$$\\frac{}{\\Gamma, \\bot \\vdash \\Delta} \\; (\\bot l)$$ ",

  // Štrukturálne pravidlá
  "$$\\frac{\\Gamma \\vdash \\Delta}{\\Gamma, \\phi \\vdash \\Delta} \\; (wl)$$ ",
  "$$\\frac{\\Gamma \\vdash \\Delta}{\\Gamma \\vdash \\Delta, \\phi} \\; (wr)$$ ",
  "$$\\frac{\\Gamma, \\phi, \\phi \\vdash \\Delta}{\\Gamma, \\phi \\vdash \\Delta} \\; (cl)$$ ",
  "$$\\frac{\\Gamma \\vdash \\Delta, \\phi, \\phi}{\\Gamma \\vdash \\Delta, \\phi} \\; (cr)$$ ",
  "$$\\frac{\\Gamma, \\psi, \\phi \\vdash \\Delta}{\\Gamma, \\phi, \\psi \\vdash \\Delta} \\; (exl)$$ ",
  "$$\\frac{\\Gamma \\vdash \\Delta, \\psi, \\phi}{\\Gamma \\vdash \\Delta, \\phi, \\psi} \\; (exr)$$ "
];

// Helper to extract rule name (e.g., "(id)" -> "id") from LaTeX string
export function getRuleName(latexString) {
    // Matches (name)$$ at the end, allowing for whitespace
    const match = latexString.match(/\(([^)]+)\)\s*\$\$\s*$/);
    if (match) {
        // Remove spaces and backslashes
        return match[1].replace(/\\/g, '').replace(/\s/g, '');
    }
    return "unknown";
}

// Map clean rule names to handler functions
export const ruleSequentHandlers = {
    "id": { action: () => RULES.id() },
    "cut": { action: () => RULES.cut() },
    
    "negl": { action: () => RULES.negLeft() },
    "negr": { action: () => RULES.negRight() },
    // Aliases for neg
    "lnotl": { action: () => RULES.negLeft() },
    "lnotr": { action: () => RULES.negRight() },
    
    "landl1": { action: () => RULES.andLeft1() },
    "wedgel1": { action: () => RULES.andLeft1() }, // Alias
    
    "landl2": { action: () => RULES.andLeft2() },
    "wedgel2": { action: () => RULES.andLeft2() }, // Alias
    
    "landr": { action: () => RULES.andRight() },
    "wedger": { action: () => RULES.andRight() }, // Alias
    
    "lorr1": { action: () => RULES.orRight1() },
    "veer1": { action: () => RULES.orRight1() }, // Alias
    
    "lorr2": { action: () => RULES.orRight2() },
    "veer2": { action: () => RULES.orRight2() }, // Alias
    
    "lorl": { action: () => RULES.orLeft() },
    "veel": { action: () => RULES.orLeft() }, // Alias
    
    "Rightarrowr": { action: () => RULES.implRight() },
    "to_r": { action: () => RULES.implRight() }, // Alias just in case
    
    "Rightarrowl": { action: () => RULES.implLeft() },
    "to_l": { action: () => RULES.implLeft() }, // Alias
    
    "topl": { action: () => RULES.topLeft() },
    "topr": { action: () => RULES.topRight() },
    "botr": { action: () => RULES.botRight() },
    "botl": { action: () => RULES.botLeft() },
    
    "wl": { action: () => RULES.weakLeft() },
    "wr": { action: () => RULES.weakRight() },
    
    "cl": { action: () => RULES.contrLeft() },
    "cr": { action: () => RULES.contrRight() },
    
    "exl": { action: () => RULES.exchLeft() },
    "exr": { action: () => RULES.exchRight() }
};
