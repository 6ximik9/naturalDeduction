export const LOGIC_MODES = {
  VL: 'VL', // Propositional Logic
  PL: 'PL'  // Predicate Logic
};

export const LOGIC_PARADIGMS = {
  CLASSICAL: 'CLASSICAL',
  INTUITIONISTIC: 'INTUITIONISTIC'
};

export const logicSettings = {
  mode: LOGIC_MODES.VL,
  paradigm: LOGIC_PARADIGMS.CLASSICAL,
  theories: {
    robinson: false,
    order: false
  }
};

export function setLogicMode(mode) {
  logicSettings.mode = mode;
}

export function setLogicParadigm(paradigm) {
  logicSettings.paradigm = paradigm;
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

export function isIntuitionistic() {
  return logicSettings.paradigm === LOGIC_PARADIGMS.INTUITIONISTIC;
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
