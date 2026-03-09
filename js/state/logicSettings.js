export const LOGIC_MODES = {
  VL: 'VL', // Propositional Logic
  PL: 'PL'  // Predicate Logic
};

export const logicSettings = {
  mode: LOGIC_MODES.VL,
  theories: {
    robinson: false,
    order: false
  }
};

export function setLogicMode(mode) {
  logicSettings.mode = mode;
}

export function setTheory(theory, isActive) {
  if (logicSettings.theories.hasOwnProperty(theory)) {
    logicSettings.theories[theory] = isActive;
  }
}

export function isVL() {
  return logicSettings.mode === LOGIC_MODES.VL;
}

export function isPL() {
  return logicSettings.mode === LOGIC_MODES.PL;
}

export function getActiveAxioms(robinsonAxioms, orderAxioms) {
  let activeAxioms = [];
  let robinsonCount = 0;
  
  if (!isVL() && logicSettings.theories.robinson) {
    activeAxioms.push(...robinsonAxioms.map((a, i) => `${i + 1}. ${a}`));
    robinsonCount = robinsonAxioms.length;
  }
  
  if (!isVL() && logicSettings.theories.order) {
    activeAxioms.push(...orderAxioms.map((a, i) => `${i + 1 + robinsonCount}. ${a}`));
  }
  
  return activeAxioms;
}
