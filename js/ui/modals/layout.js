export function initLayoutSettings() {
  const layoutBtns = document.querySelectorAll('.layout-settings-trigger');
  const layoutModal = document.getElementById('layoutModal');
  const closeBtn = layoutModal?.querySelector('.closeLayout');
  const saveBtn = document.getElementById('saveLayoutBtn');
  const layoutChoices = document.querySelectorAll('input[name="layout-choice"]');
  const splitLayout = document.getElementById('proof-split-layout');

  if (layoutBtns.length === 0 || !layoutModal) return;

  // --- Load Saved Layout ---
  const savedLayout = localStorage.getItem('proofLayout') || 'v-left';
  applyLayout(savedLayout);

  const savedSidebar = localStorage.getItem('sidebarPlacement') || 'sb-left';
  applySidebar(savedSidebar);

  // Sync radio buttons with saved layout
  const activeRadio = document.querySelector(`input[name="layout-choice"][value="${savedLayout}"]`);
  if (activeRadio) activeRadio.checked = true;

  const activeSidebarRadio = document.querySelector(`input[name="sidebar-choice"][value="${savedSidebar}"]`);
  if (activeSidebarRadio) activeSidebarRadio.checked = true;

  // --- Event Listeners ---
  layoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        layoutModal.style.display = 'flex';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      layoutModal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === layoutModal) {
      layoutModal.style.display = 'none';
    }
  });

  saveBtn.addEventListener('click', () => {
    const selectedLayout = document.querySelector('input[name="layout-choice"]:checked')?.value || 'v-left';
    localStorage.setItem('proofLayout', selectedLayout);
    applyLayout(selectedLayout);

    const selectedSidebar = document.querySelector('input[name="sidebar-choice"]:checked')?.value || 'sb-left';
    localStorage.setItem('sidebarPlacement', selectedSidebar);
    applySidebar(selectedSidebar);

    layoutModal.style.display = 'none';
    
    // Reset sizes to default 50/50 on layout change to avoid weird distortions
    const leftPanel = document.getElementById('proof-tools');
    const rightPanel = document.getElementById('proof-container');
    if (leftPanel && rightPanel) {
        leftPanel.style.flexBasis = '';
        leftPanel.style.width = '';
        leftPanel.style.height = '';
        rightPanel.style.flexBasis = '';
        rightPanel.style.width = '';
        rightPanel.style.height = '';
    }
    
    // Trigger a resize event to ensure Monaco and D3 (Tree) redraw properly to the new dimensions
    setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
  });
}

export function applyLayout(layoutType) {
  const splitLayout = document.getElementById('proof-split-layout');
  if (!splitLayout) return;

  // Remove all potential layout classes
  splitLayout.classList.remove('v-left', 'v-right', 'h-top', 'h-bottom');
  
  // Add the selected one
  splitLayout.classList.add(layoutType);
}

export function applySidebar(sidebarType) {
  document.body.classList.remove('sb-left', 'sb-right', 'sb-top', 'sb-bottom');
  document.body.classList.add(sidebarType);
}
