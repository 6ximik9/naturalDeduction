import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { t } from '../core/i18n';
import { editor } from './monacoEditor';

/**
 * Starts the application tour using driver.js
 */
export function startTour() {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    nextBtnText: t('tour-next'),
    prevBtnText: t('tour-prev'),
    doneBtnText: t('tour-done'),
    allowClose: true,
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
          align: 'end' 
        } 
      },
      { 
        element: '#tour-system-section', 
        popover: { 
          title: t('tour-system-title'), 
          description: t('tour-system-desc'), 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-logic-section', 
        popover: { 
          title: t('tour-logic-title'), 
          description: t('tour-logic-desc'), 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-theories-part', 
        popover: { 
          title: t('tour-theories-title'), 
          description: t('tour-theories-desc'), 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-settings-part', 
        popover: { 
          title: t('tour-settings-title'), 
          description: t('tour-settings-desc'), 
          side: "bottom", 
          align: 'start' 
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
        popover: { 
          title: t('tour-sidebar-title'), 
          description: t('tour-sidebar-desc'), 
          side: "right", 
          align: 'start' 
        }
      },
      {
        element: '#tour-font-selector',
        popover: { 
          title: t('tour-font-title'), 
          description: t('tour-font-desc'), 
          side: "right", 
          align: 'start' 
        }
      },
      {
        element: '#tour-editor-data',
        popover: { 
          title: t('tour-editor-data-title'), 
          description: t('tour-editor-data-desc'), 
          side: "right", 
          align: 'start' 
        }
      },
      {
        element: '#tour-editor-support',
        popover: { 
          title: t('tour-editor-support-title'), 
          description: t('tour-editor-support-desc'), 
          side: "right", 
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
        popover: { 
          title: t('tour-tools-title'), 
          description: t('tour-tools-desc'), 
          side: "right", 
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
          side: "right", 
          align: 'start' 
        }
      },
      {
        element: '#tour-proof-live-control',
        popover: { 
          title: t('tour-live-control-title'), 
          description: t('tour-live-control-desc'), 
          side: "right", 
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

  // If start screen is hidden, jump to sidebar step
  const startScreen = document.getElementById('start-screen');
  if (startScreen && startScreen.classList.contains('hidden')) {
    // Always provide a formula for the tour to ensure the walkthrough makes sense
    if (editor) {
      editor.setValue('A ∧ B → A');
    }
    // Skip to sidebar step (index 7)
    setTimeout(() => {
        driverObj.moveTo(7);
    }, 100);
  }
}
