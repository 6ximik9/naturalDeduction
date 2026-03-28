import { t } from '../../core/i18n';

/**
 * Creates a confirmation modal when returning to the editor
 * @param {string} currentFormula - The current formula to save if "Edit Introduction" is chosen
 * @returns {Promise<string>} Resolves with 'yes', 'edit', or rejects on 'cancel'
 */
export function createReturnConfirmModal(currentFormula) {
  return new Promise((resolve, reject) => {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    Object.assign(modalOverlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '2000',
      backdropFilter: 'blur(2px)'
    });

    // Modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    Object.assign(modal.style, {
      background: 'var(--col-bg-white)',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '440px',
      padding: '40px 32px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid var(--col-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
      animation: 'modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      color: 'var(--col-text-main)',
      textAlign: 'center'
    });

    // Add styles if needed
    if (!document.getElementById('return-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'return-modal-styles';
      style.textContent = `
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        .modal-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        .modal-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }
        .modal-btn i {
          font-size: 20px;
        }
      `;
      document.head.appendChild(style);
    }

    // Modal Title/Message
    const modalMessage = document.createElement('div');
    modalMessage.textContent = t('confirm-return-main');
    modalMessage.setAttribute('data-i18n', 'confirm-return-main');
    Object.assign(modalMessage.style, {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.5',
      color: 'var(--col-text-main)',
      padding: '0 10px',
      marginBottom: '8px'
    });

    // Buttons Container
    const actionContainer = document.createElement('div');
    Object.assign(actionContainer.style, { 
      display: 'flex', 
      flexDirection: 'column',
      gap: '10px', 
      marginTop: '8px' 
    });

    const createButton = (text, iconClass, isSecondary = false, i18nKey = null) => {
      const btn = document.createElement('button');
      btn.className = 'modal-btn';
      btn.innerHTML = `<i class="${iconClass}"></i> <span>${text}</span>`;
      if (i18nKey) {
          const span = btn.querySelector('span');
          if (span) span.setAttribute('data-i18n', i18nKey);
      }
      
      if (isSecondary) {
        Object.assign(btn.style, {
          backgroundColor: 'transparent',
          color: 'var(--col-text-muted)',
          border: '1px solid transparent',
          marginTop: '4px',
          fontSize: '15px'
        });
        btn.addEventListener('mouseenter', () => {
          btn.style.color = 'var(--col-text-main)';
          btn.style.backgroundColor = 'rgba(0,0,0,0.03)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.color = 'var(--col-text-muted)';
          btn.style.backgroundColor = 'transparent';
        });
      } else {
        Object.assign(btn.style, {
          backgroundColor: 'var(--col-bg-white)',
          color: 'var(--col-text-main)',
          border: '1px solid var(--col-border)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        });
        btn.addEventListener('mouseenter', () => {
          btn.style.borderColor = 'var(--col-accent)';
          btn.style.color = 'var(--col-accent)';
          btn.style.backgroundColor = 'rgba(59, 130, 246, 0.04)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.borderColor = 'var(--col-border)';
          btn.style.color = 'var(--col-text-main)';
          btn.style.backgroundColor = 'var(--col-bg-white)';
        });
      }
      return btn;
    };

    const editButton = createButton(t('modal-btn-edit-intro'), 'ri-edit-box-line', false, 'modal-btn-edit-intro');
    const yesButton = createButton(t('modal-btn-yes'), 'ri-eraser-line', false, 'modal-btn-yes');
    const startButton = createButton(t('nav-show-start'), 'ri-home-4-line', false, 'nav-show-start');
    const cancelButton = createButton(t('modal-btn-cancel'), 'ri-close-line', true, 'modal-btn-cancel');

    const closeModal = () => {
      modalOverlay.style.animation = 'modalSlideOut 0.2s ease-in forwards';
      setTimeout(() => {
        if (modalOverlay.parentNode) modalOverlay.parentNode.removeChild(modalOverlay);
      }, 200);
    };

    yesButton.addEventListener('click', () => {
      closeModal();
      resolve('yes');
    });

    editButton.addEventListener('click', () => {
      closeModal();
      resolve('edit');
    });

    startButton.addEventListener('click', () => {
      closeModal();
      resolve('start');
    });

    cancelButton.addEventListener('click', () => {
      closeModal();
      reject(new Error('Cancelled'));
    });

    // Assemble
    modal.appendChild(modalMessage);
    actionContainer.appendChild(editButton);
    actionContainer.appendChild(yesButton);
    actionContainer.appendChild(startButton);
    actionContainer.appendChild(cancelButton);
    modal.appendChild(actionContainer);
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
  });
}
