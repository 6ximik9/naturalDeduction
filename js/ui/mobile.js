document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-overlay');

  if (!menuBtn || !overlay) return;

  function getActiveSidebar() {
    const homeSidebar = document.getElementById('sidebar-home');
    const proofSidebar = document.getElementById('sidebar-proof');
    if (homeSidebar && homeSidebar.style.display !== 'none') return homeSidebar;
    if (proofSidebar && proofSidebar.style.display !== 'none') return proofSidebar;
    return null;
  }

  function toggleSidebar() {
    const activeSidebar = getActiveSidebar();
    if (activeSidebar) {
      moveSettingsForMobile(activeSidebar);
      activeSidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }
  }

  function closeSidebar() {
    const sidebars = document.querySelectorAll('.sidebar');
    sidebars.forEach(sidebar => sidebar.classList.remove('open'));
    overlay.classList.remove('active');
  }

  menuBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);

  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      if (window.innerWidth <= 768) {
        // Prevent closing if the clicked element is the "Paste Example" button
        // or inside the "Paste Example" dropdown list
        const isPasteExampleBtn = event.currentTarget.id === 'pasteExampleBtn';
        
        if (!isPasteExampleBtn) {
          closeSidebar();
        }
      }
    });
  });

  // Also handle closing when clicking on an actual example item in the list
  const exampleItems = document.querySelectorAll('#exampleList li');
  exampleItems.forEach(item => {
    item.addEventListener('click', () => {
       if (window.innerWidth <= 768) {
         closeSidebar();
       }
    });
  });

  // Function to move settings into sidebar or header
  function moveSettingsForMobile(targetSidebar) {
    const isMobile = window.innerWidth <= 768;
    const headerLeft = document.querySelector('.header-left');
    const headerRight = document.querySelector('.header-right');
    const fontSelectContainer = document.querySelector('.custom-select');
    const langSwitcher = document.querySelector('.top-header .lang-switcher');
    
    if (isMobile) {
      if (!targetSidebar) return;
      
      let mobileContainer = targetSidebar.querySelector('.mobile-settings-container');
      if (!mobileContainer) {
        mobileContainer = document.createElement('div');
        mobileContainer.className = 'mobile-settings-container';
        mobileContainer.style.padding = '16px 12px';
        mobileContainer.style.borderTop = '1px solid var(--col-border)';
        mobileContainer.style.display = 'flex';
        mobileContainer.style.flexDirection = 'column';
        mobileContainer.style.gap = '16px';
        
        // Find Support menu group and insert before it
        const menuGroups = targetSidebar.querySelectorAll('.menu-group');
        const supportGroup = Array.from(menuGroups).find(g => {
          const title = g.querySelector('.menu-title');
          return title && title.textContent === 'Support' || title && title.getAttribute('data-i18n') === 'nav-support';
        });
        
        if (supportGroup) {
          targetSidebar.insertBefore(mobileContainer, supportGroup);
        } else {
          targetSidebar.appendChild(mobileContainer);
        }
      }

      if (fontSelectContainer && fontSelectContainer.parentElement !== mobileContainer) {
        mobileContainer.appendChild(fontSelectContainer);
        fontSelectContainer.style.width = '100%'; 
        const select = fontSelectContainer.querySelector('select');
        if (select) {
          select.style.border = '1px solid var(--col-border)';
          select.style.borderRadius = '8px';
          select.style.backgroundColor = 'var(--col-bg-main)';
        }
      }
      if (langSwitcher && langSwitcher.parentElement !== mobileContainer) {
        mobileContainer.appendChild(langSwitcher);
        langSwitcher.style.display = 'flex';
        langSwitcher.style.justifyContent = 'space-between';
        langSwitcher.style.width = '100%';
        langSwitcher.style.backgroundColor = 'var(--col-bg-main)';
        langSwitcher.style.borderRadius = '8px';
        langSwitcher.style.padding = '4px';
      }
    } else {
      // Move back to header
      if (fontSelectContainer && headerLeft && fontSelectContainer.parentElement !== headerLeft) {
        headerLeft.appendChild(fontSelectContainer);
        fontSelectContainer.style.width = 'auto';
        const select = fontSelectContainer.querySelector('select');
        if (select) {
          select.style.border = 'none';
          select.style.backgroundColor = 'transparent';
        }
      }
      if (langSwitcher && headerRight && langSwitcher.parentElement !== headerRight) {
        // Insert before theme toggle
        const themeToggle = headerRight.querySelector('.theme-toggle');
        if (themeToggle) {
          headerRight.insertBefore(langSwitcher, themeToggle);
        } else {
          headerRight.appendChild(langSwitcher);
        }
        langSwitcher.style.width = 'auto';
        langSwitcher.style.backgroundColor = 'transparent';
        langSwitcher.style.padding = '0';
      }
    }
  }

  // Handle resize events
  window.addEventListener('resize', () => {
    moveSettingsForMobile(getActiveSidebar());
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });

  // Initial call
  moveSettingsForMobile(getActiveSidebar());
  
  // Watch for sidebar changes (when proof/home toggles)
  const observer = new MutationObserver(() => {
    if (window.innerWidth <= 768) {
       moveSettingsForMobile(getActiveSidebar());
    }
  });
  
  const homeSidebar = document.getElementById('sidebar-home');
  const proofSidebar = document.getElementById('sidebar-proof');
  if (homeSidebar) observer.observe(homeSidebar, { attributes: true, attributeFilter: ['style'] });
  if (proofSidebar) observer.observe(proofSidebar, { attributes: true, attributeFilter: ['style'] });
});