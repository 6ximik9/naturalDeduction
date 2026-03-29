import { setLogicMode, setLogicParadigm, setTheory, LOGIC_MODES, LOGIC_PARADIGMS, isVL, logicSettings } from '../../state/logicSettings';

export function initStartScreen() {
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');
  const tourBtn = document.getElementById('tour-btn');
  const skipCheckbox = document.getElementById('skip-start-screen');
  
  if (!startScreen || !startBtn) return;

  if (tourBtn) {
    tourBtn.addEventListener('click', () => {
      import('../tour').then(module => {
        module.startTour();
      });
    });
  }

  const logicModeRadios = document.querySelectorAll('input[name="logic-mode"]');
  const logicParadigmRadios = document.querySelectorAll('input[name="logic-paradigm"]');
  const proofSystemRadios = document.querySelectorAll('input[name="proof-system"]');
  const theoryRobinson = document.getElementById('theory-robinson');
  const theoryOrder = document.getElementById('theory-order');
  const robinsonContainer = document.getElementById('theory-robinson-container');
  const orderContainer = document.getElementById('theory-order-container');

  // --- Load Saved Settings ---
  const savedSettings = JSON.parse(localStorage.getItem('logicProofSettings') || '{}');
  if (savedSettings.mode) {
    const radio = document.querySelector(`input[name="logic-mode"][value="${savedSettings.mode}"]`);
    if (radio) radio.checked = true;
  }
  if (savedSettings.paradigm) {
    const radio = document.querySelector(`input[name="logic-paradigm"][value="${savedSettings.paradigm}"]`);
    if (radio) radio.checked = true;
  }
  if (savedSettings.system) {
    const radio = document.querySelector(`input[name="proof-system"][value="${savedSettings.system}"]`);
    if (radio) radio.checked = true;
  }
  if (savedSettings.robinson !== undefined) theoryRobinson.checked = savedSettings.robinson;
  if (savedSettings.order !== undefined) theoryOrder.checked = savedSettings.order;

  const shouldSkip = localStorage.getItem('skipStartScreen') === 'true';
  if (skipCheckbox && shouldSkip) skipCheckbox.checked = true;

  // --- Skip Logic ---
  // Check if we arrived here via "Home" button (we can check URL or a session flag)
  // For now, let's assume Home button reload should ALWAYS show the screen to allow changes.
  const isReloadViaHome = sessionStorage.getItem('isHomeReload') === 'true';
  sessionStorage.removeItem('isHomeReload');

  const returnToEditor = sessionStorage.getItem('returnToEditor') === 'true';
  sessionStorage.removeItem('returnToEditor');

  if ((shouldSkip && !isReloadViaHome) || returnToEditor) {
    applyAllSettings();
    startScreen.classList.add('hidden');
    // Still need to init sidebar and filters
    initSidebarSettings();
    applyLogicFilters();
    return;
  }

  function applyAllSettings() {
    // 1. Get Logic Mode
    const selectedLogic = document.querySelector('input[name="logic-mode"]:checked').value;
    setLogicMode(LOGIC_MODES[selectedLogic]);

    // 1.5 Get Logic Paradigm
    const selectedParadigm = document.querySelector('input[name="logic-paradigm"]:checked').value;
    setLogicParadigm(LOGIC_PARADIGMS[selectedParadigm]);

    // 2. Get Theories
    setTheory('robinson', theoryRobinson.checked);
    setTheory('order', theoryOrder.checked);

    // 3. Save to localStorage for next skip
    localStorage.setItem('logicProofSettings', JSON.stringify({
      mode: selectedLogic,
      paradigm: selectedParadigm,
      system: document.querySelector('input[name="proof-system"]:checked').value,
      robinson: theoryRobinson.checked,
      order: theoryOrder.checked
    }));

    // 4. Sync sidebar state
    syncSidebarState();

    // 5. Get Proof System (trigger the nav click)
    const selectedSystem = document.querySelector('input[name="proof-system"]:checked').value;
    const navLink = document.getElementById(`nav-${selectedSystem}`);
    if (navLink) {
      navLink.click();
    }
  }

  function updateTheoriesAvailability() {
    const selectedLogic = document.querySelector('input[name="logic-mode"]:checked').value;
    const selectedSystem = document.querySelector('input[name="proof-system"]:checked').value;
    
    // Theories are only available for PL AND (Gentzen OR Fitch)
    const shouldDisable = (selectedLogic === 'VL') || (selectedSystem === 'sequent');
    const theoriesTitle = document.querySelector('[data-i18n="start-theories"]');
    
    if (shouldDisable) {
      theoryRobinson.disabled = true;
      theoryRobinson.checked = false;
      theoryOrder.disabled = true;
      theoryOrder.checked = false;
      
      robinsonContainer.classList.add('disabled');
      orderContainer.classList.add('disabled');
      if (theoriesTitle) theoriesTitle.style.opacity = '0.5';
    } else {
      theoryRobinson.disabled = false;
      theoryOrder.disabled = false;
      
      robinsonContainer.classList.remove('disabled');
      orderContainer.classList.remove('disabled');
      if (theoriesTitle) theoriesTitle.style.opacity = '1';
    }
  }

  // Handle Logic Mode change
  logicModeRadios.forEach(radio => {
    radio.addEventListener('change', updateTheoriesAvailability);
  });

  // Handle Proof System change
  proofSystemRadios.forEach(radio => {
    radio.addEventListener('change', updateTheoriesAvailability);
  });

  // Initial check
  updateTheoriesAvailability();

  // Handle Start Button click
  startBtn.addEventListener('click', () => {
    // Save skip preference
    if (skipCheckbox && skipCheckbox.checked) {
      localStorage.setItem('skipStartScreen', 'true');
    } else {
      localStorage.setItem('skipStartScreen', 'false');
    }

    applyAllSettings();

    // Hide start screen
    startScreen.classList.add('hidden');
    
    // Apply UI Filters (hide quantifiers if VL)
    applyLogicFilters();
  });

  initSidebarSettings();
}

function initSidebarSettings() {
  // Listeners for Sidebar logic toggles
  const sidebarRadios = document.querySelectorAll('input[name="sb-logic-mode"]');
  const sidebarParadigmRadios = document.querySelectorAll('input[name="sb-logic-paradigm"]');
  const sidebarRobinsons = document.querySelectorAll('#sb-theory-robinson');
  const sidebarOrders = document.querySelectorAll('#sb-theory-order');

  sidebarRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const mode = e.target.value;
      setLogicMode(LOGIC_MODES[mode]);
      
      // If VL, disable theories
      if (mode === 'VL') {
        setTheory('robinson', false);
        setTheory('order', false);
      }
      
      syncSidebarState();
      applyLogicFilters();
    });
  });

  sidebarParadigmRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const paradigm = e.target.value;
      setLogicParadigm(LOGIC_PARADIGMS[paradigm]);
      syncSidebarState();
      applyLogicFilters();
    });
  });

  sidebarRobinsons.forEach(cb => {
    cb.addEventListener('change', (e) => {
      setTheory('robinson', e.target.checked);
      syncSidebarState();
      applyLogicFilters();
    });
  });

  sidebarOrders.forEach(cb => {
    cb.addEventListener('change', (e) => {
      setTheory('order', e.target.checked);
      syncSidebarState();
      applyLogicFilters();
    });
  });

  // Listener for system changes in sidebar to update theories availability
  const systemLinks = document.querySelectorAll('#nav-gentzen, #nav-fitch, #nav-sequent');
  systemLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Small delay to ensure index.js has updated the 'active' class
      setTimeout(() => {
        syncSidebarState();
        applyLogicFilters();
      }, 50);
    });
  });
}

function syncSidebarState() {
  const isVl = isVL();
  const isSequent = document.getElementById('nav-sequent')?.classList.contains('active');
  const shouldDisableTheories = isVl || isSequent;
  
  // If sequent is active, force theories to false in state (since they are not used)
  if (isSequent) {
    setTheory('robinson', false);
    setTheory('order', false);
  }

  // Sync logic mode and paradigm radios
  document.querySelectorAll(`input[name="sb-logic-mode"][value="${logicSettings.mode}"]`).forEach(r => r.checked = true);
  document.querySelectorAll(`input[name="sb-logic-paradigm"][value="${logicSettings.paradigm}"]`).forEach(r => r.checked = true);

  // Sync theory checkboxes and containers
  const theoryContainers = document.querySelectorAll('#sb-theories-container');
  const robinsons = document.querySelectorAll('#sb-theory-robinson');
  const orders = document.querySelectorAll('#sb-theory-order');

  robinsons.forEach(cb => {
    cb.checked = logicSettings.theories.robinson;
    cb.disabled = shouldDisableTheories;
  });

  orders.forEach(cb => {
    cb.checked = logicSettings.theories.order;
    cb.disabled = shouldDisableTheories;
  });

  theoryContainers.forEach(c => {
    if (shouldDisableTheories) {
      c.style.opacity = '0.5';
      c.style.filter = 'grayscale(1)';
      c.style.pointerEvents = 'none';
    } else {
      c.style.opacity = '1';
      c.style.filter = 'none';
      c.style.pointerEvents = 'auto';
    }
  });
}

export function applyLogicFilters() {
  // Hide quantifier buttons in VL mode
  if (isVL()) {
    document.body.classList.add('logic-vl-mode');
  } else {
    document.body.classList.remove('logic-vl-mode');
  }

  // Handle Axioms tab visibility based on theories
  const hasAxioms = (!isVL() && logicSettings.theories.robinson) || (!isVL() && logicSettings.theories.order);
  
  if (!hasAxioms) {
    document.body.classList.add('hide-axioms-tab');
    const tab3 = document.getElementById('tab3');
    if (tab3 && tab3.checked) {
      const tab1 = document.getElementById('tab1');
      if (tab1) {
        tab1.checked = true;
        tab1.dispatchEvent(new Event('change', { bubbles: true }));
        // Also update sidebar active link
        document.querySelectorAll('.menu-group .nav-link').forEach(el => el.classList.remove('active'));
        const sbRules = document.getElementById('sb-rules');
        if (sbRules) sbRules.classList.add('active');
      }
    }
  } else {
    document.body.classList.remove('hide-axioms-tab');
    const tab3 = document.getElementById('tab3');
    if (tab3 && tab3.checked) {
       // Re-trigger the tab generation to update the axioms shown
       tab3.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

