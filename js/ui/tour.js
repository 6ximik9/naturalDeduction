import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { t } from '../core/i18n';
import { editor } from './monacoEditor';
import { openSidebar, closeSidebar } from './mobile';

/**
 * Starts the application tour using driver.js
 */
export function startTour() {
  const isMobile = () => window.innerWidth <= 768;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    disableActiveInteraction: true,
    nextBtnText: t('tour-next'),
    prevBtnText: t('tour-prev'),
    doneBtnText: t('tour-done'),
    allowClose: true,
    onHighlightStarted: (element) => {
      document.body.classList.add('tour-active');
      // Use instant scroll to ensure the element is in its final position 
      // BEFORE driver.js calculates the highlight overlay position.
      // This prevents the "jumping" effect where the highlight is in the wrong place.
      if (element) {
        element.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "nearest"
        });
      }

      if (!isMobile()) return;
      
      const sidebarSteps = [
        '#sidebar-home', 
        '#tour-font-selector', 
        '#tour-editor-data', 
        '#tour-editor-support',
        '#helpBtn',
        '#sb-help',
        '#sidebar-proof',
        '#tour-proof-data',
        '#tour-proof-live-control'
      ];
      
      const isSidebarElement = element && sidebarSteps.some(selector => 
        element.id === selector.replace('#', '') || element.closest(selector)
      );

      if (isSidebarElement) {
        openSidebar();
      } else {
        closeSidebar();
      }
    },
    onHighlighted: (element) => {
      // After highlight is active, if it's a sidebar element on mobile, 
      // we might need a tiny second scroll adjustment because the sidebar 
      // opening animation (300ms) can shift the element.
      if (isMobile() && element && element.closest('.sidebar')) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }, 300);
      }
    },
    onDeselected: () => {
       // Optional: additional cleanup if needed
    },
    onDestroyed: () => {
      document.body.classList.remove('tour-active');
      if (isMobile()) {
        closeSidebar();
      }
    },
    steps: [
      { 
        element: '#start-screen .start-container', 
        popover: { 
          title: t('tour-welcome-title'), 
          description: t('tour-welcome-desc'), 
          side: "center", 
          align: 'start' 
        } 
      },
      { 
        element: '#start-screen .start-controls', 
        popover: { 
          title: t('tour-lang-theme-title'), 
          description: t('tour-lang-theme-desc'), 
          side: "bottom", 
          align: isMobile() ? 'center' : 'end' 
        } 
      },
      { 
        element: '#tour-system-section', 
        popover: { 
          title: t('tour-system-title'), 
          description: t('tour-system-desc'), 
          side: "bottom", 
          align: isMobile() ? 'center' : 'start' 
        } 
      },
      { 
        element: '#tour-logic-section', 
        popover: { 
          title: t('tour-logic-title'), 
          description: t('tour-logic-desc'), 
          side: "bottom", 
          align: isMobile() ? 'center' : 'start' 
        } 
      },
      { 
        element: '#tour-theories-part', 
        popover: { 
          title: t('tour-theories-title'), 
          description: t('tour-theories-desc'), 
          side: "bottom", 
          align: isMobile() ? 'center' : 'start' 
        } 
      },
      { 
        element: '#tour-settings-part', 
        popover: { 
          title: t('tour-settings-title'), 
          description: t('tour-settings-desc'), 
          side: "bottom", 
          align: isMobile() ? 'center' : 'start' 
        } 
      },
      { 
        element: '#start-btn', 
        popover: { 
          title: t('tour-start-btn-title'), 
          description: t('tour-start-btn-desc'), 
          side: "top", 
          align: 'center' 
        } 
      },
      {
        element: '#sidebar-home',
        disablePrev: true,
        popover: { 
          title: t('tour-sidebar-title'), 
          description: t('tour-sidebar-desc'), 
          side: isMobile() ? "bottom" : "right", 
          align: 'start' 
        }
      },
      {
        element: '#tour-font-selector',
        popover: { 
          title: t('tour-font-title'), 
          description: t('tour-font-desc'), 
          side: isMobile() ? "bottom" : "right", 
          align: 'start' 
        }
      },
      {
        element: '#tour-editor-data',
        popover: { 
          title: t('tour-editor-data-title'), 
          description: t('tour-editor-data-desc'), 
          side: isMobile() ? "bottom" : "right", 
          align: 'start' 
        }
      },
      {
        element: '#tour-editor-support',
        popover: { 
          title: t('tour-editor-support-title'), 
          description: t('tour-editor-support-desc'), 
          side: isMobile() ? "bottom" : "right", 
          align: 'start' 
        }
      },
      {
        element: '#editor',
        popover: { 
          title: t('tour-editor-title'), 
          description: t('tour-editor-desc'), 
          side: "top", 
          align: 'start' 
        }
      },
      {
        element: '#helpBtn',
        popover: { 
          title: t('tour-help-title'), 
          description: t('tour-help-desc'), 
          side: isMobile() ? "bottom" : "right", 
          align: 'start' 
        }
      },
      {
        element: '#enter',
        popover: { 
          title: t('tour-proof-btn-title'), 
          description: t('tour-proof-btn-desc'), 
          side: "top", 
          align: 'center' 
        }
      },
      {
        element: '#proof-tools',
        disablePrev: true,
        popover: { 
          title: t('tour-tools-title'), 
          description: t('tour-tools-desc'), 
          side: isMobile() ? "bottom" : "right", 
          align: 'start' 
        }
      },
      {
        element: '#proof-container',
        popover: { 
          title: t('tour-area-title'), 
          description: t('tour-area-desc'), 
          side: "top", 
          align: 'end' 
        }
      },
      {
        element: '#download-btn',
        popover: { 
          title: t('tour-latex-title'), 
          description: t('tour-latex-desc'), 
          side: "bottom", 
          align: 'end' 
        }
      },
      {
        element: '#fullscreen-btn',
        popover: { 
          title: t('tour-fullscreen-title'), 
          description: t('tour-fullscreen-desc'), 
          side: "bottom", 
          align: 'end' 
        }
      },
      {
        element: '#tour-proof-data',
        popover: { 
          title: t('tour-data-title'), 
          description: t('tour-data-desc'), 
          side: isMobile() ? "bottom" : "right", 
          align: 'start' 
        }
      },
      {
        element: '#tour-proof-live-control',
        popover: { 
          title: t('tour-live-control-title'), 
          description: t('tour-live-control-desc'), 
          side: isMobile() ? "bottom" : "right", 
          align: 'start' 
        }
      }
    ],
    onNextClick: () => {
      const step = driverObj.getActiveStep();
      if (!step) return;

      if (step.element === '#start-btn') {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
          startBtn.click();
        }
      } else if (step.element === '#enter') {
        const enterBtn = document.getElementById('enter');
        if (enterBtn) {
          enterBtn.click();
        }
      } else {
        driverObj.moveNext();
      }
    },
    onPrevClick: () => {
      const step = driverObj.getActiveStep();
      // Prevent going back if the current step is marked with disablePrev
      if (step && step.disablePrev) {
        return;
      }
      driverObj.movePrevious();
    }
  });

  // Handle manual clicks on the actual buttons to advance the tour
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (driverObj.isActive()) {
        const step = driverObj.getActiveStep();
        if (step && step.element === '#start-btn') {
          if (editor) {
            editor.setValue('A ∧ B → A');
          }
          // Fast transition for start screen
          setTimeout(() => driverObj.moveNext(), 100);
        }
      }
    });
  }

  const enterBtn = document.getElementById('enter');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      if (driverObj.isActive()) {
        const step = driverObj.getActiveStep();
        if (step && step.element === '#enter') {
          // Fast transition for proof area
          setTimeout(() => driverObj.moveNext(), 200);
        }
      }
    });
  }

  driverObj.drive();

  // If start screen is hidden, jump to relevant step
  const startScreen = document.getElementById('start-screen');
  const proofTools = document.getElementById('proof-tools');
  const isProofActive = proofTools && (proofTools.style.display !== 'none' && proofTools.offsetParent !== null);

  const findStepIndex = (selector) => {
    return driverObj.getConfig().steps.findIndex(s => s.element === selector);
  };

  if (isProofActive) {
    const proofIndex = findStepIndex('#proof-tools');
    if (proofIndex !== -1) {
      setTimeout(() => driverObj.moveTo(proofIndex), 100);
    }
  } else if (startScreen && startScreen.classList.contains('hidden')) {
    if (editor) {
      editor.setValue('A ∧ B → A');
    }
    const sidebarIndex = findStepIndex('#sidebar-home');
    if (sidebarIndex !== -1) {
      setTimeout(() => driverObj.moveTo(sidebarIndex), 100);
    }
  }
}
