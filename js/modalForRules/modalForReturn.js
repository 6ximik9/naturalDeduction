import {checkRule} from "../index";
import {currentLevel, side} from "../GentzenProof";
import * as deductive from "../deductiveEngine";

/**
 * Creates an improved modal for universal quantifier elimination (∀-elimination)
 * Used in rule 16 for selecting replacement constants
 * @param {Array<string>} constants - Array of available constants for replacement
 * @returns {Promise<Array<string>>} Promise that resolves with selected constant
 */
export function createModalForReturn(constants) {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!constants || !Array.isArray(constants) || constants.length === 0) {
      reject(new Error('No constants provided for selection'));
      return;
    }

    // Create modal overlay with improved accessibility
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'modal-title');

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
      zIndex: '1000',
      backdropFilter: 'blur(2px)'
    });

    // Create modal container with improved styling
    const modal = document.createElement('div');
    modal.className = 'modal';
    Object.assign(modal.style, {
      background: '#fff',
      borderRadius: '16px',
      width: '90%',
      maxWidth: '600px',
      padding: '32px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
      animation: 'modalSlideIn 0.3s ease-out'
    });

    // Add CSS animation
    if (!document.getElementById('modal-animations')) {
      const style = document.createElement('style');
      style.id = 'modal-animations';
      style.textContent = `
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-button:focus { outline: 2px solid #007bff; outline-offset: 2px; }
      `;
      document.head.appendChild(style);
    }

    // Create modal title with improved typography
    const modalTitle = document.createElement('h2');
    modalTitle.id = 'modal-title';
    modalTitle.textContent = 'Universal Quantifier Elimination (∀E)';
    Object.assign(modalTitle.style, {
      margin: '0',
      fontSize: '28px',
      fontWeight: '600',
      textAlign: 'center',
      color: '#2c3e50',
      marginBottom: '8px'
    });

    // Add description
    const description = document.createElement('p');
    description.textContent = 'Select a constant to replace the bound variable in the universal quantifier:';
    Object.assign(description.style, {
      margin: '0',
      fontSize: '16px',
      color: '#666',
      textAlign: 'center',
      lineHeight: '1.5'
    });

    // Create button container with improved layout
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    Object.assign(buttonContainer.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px',
      marginTop: '16px'
    });

    let activeButton = null;
    let selectedConstant = null;

    // Generate buttons based on constants with improved interaction
    constants.forEach((constant, index) => {
      const button = document.createElement('button');
      button.className = 'modal-button';
      button.textContent = constant;
      button.setAttribute('data-constant', constant);
      button.setAttribute('tabindex', '0');

      Object.assign(button.style, {
        padding: '16px 20px',
        fontSize: '20px',
        fontWeight: '500',
        cursor: 'pointer',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        color: '#495057',
        transition: 'all 0.2s ease',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });

      // Enhanced hover and focus effects
      const updateButtonState = (targetButton, isActive, isHovered = false) => {
        if (isActive) {
          Object.assign(targetButton.style, {
            backgroundColor: '#007bff',
            borderColor: '#007bff',
            color: '#fff',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
          });
        } else if (isHovered) {
          Object.assign(targetButton.style, {
            backgroundColor: '#e9ecef',
            borderColor: '#adb5bd',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          });
        } else {
          Object.assign(targetButton.style, {
            backgroundColor: '#f8f9fa',
            borderColor: '#e0e0e0',
            color: '#495057',
            transform: 'translateY(0)',
            boxShadow: 'none'
          });
        }
      };

      button.addEventListener('mouseenter', () => updateButtonState(button, button === activeButton, true));
      button.addEventListener('mouseleave', () => updateButtonState(button, button === activeButton, false));

      button.addEventListener('click', () => {
        // If clicking the same button, deselect it
        if (activeButton === button) {
          updateButtonState(button, false);
          activeButton = null;
          selectedConstant = null;

          // Disable save button
          saveButton.disabled = true;
          saveButton.style.opacity = '0.6';
          saveButton.style.cursor = 'not-allowed';
          return;
        }

        // Deselect previous button if any
        if (activeButton) {
          const prevButton = activeButton;
          updateButtonState(prevButton, false);
        }

        // Select current button
        activeButton = button;
        selectedConstant = constant;
        updateButtonState(button, true);

        // Enable save button
        saveButton.disabled = false;
        saveButton.style.opacity = '1';
        saveButton.style.cursor = 'pointer';
      });

      // Keyboard navigation
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });

      buttonContainer.appendChild(button);
    });

    // Create action buttons container
    const actionContainer = document.createElement('div');
    Object.assign(actionContainer.style, {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    });

    // Create save button with improved styling and validation
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Apply Selection';
    saveButton.disabled = true;
    Object.assign(saveButton.style, {
      flex: '1',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'not-allowed',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      opacity: '0.6'
    });

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    Object.assign(cancelButton.style, {
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      backgroundColor: '#6c757d',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    });

    // Enhanced save button interactions
    saveButton.addEventListener('mouseenter', () => {
      if (!saveButton.disabled) {
        saveButton.style.backgroundColor = '#218838';
        saveButton.style.transform = 'translateY(-1px)';
      }
    });

    saveButton.addEventListener('mouseleave', () => {
      if (!saveButton.disabled) {
        saveButton.style.backgroundColor = '#28a745';
        saveButton.style.transform = 'translateY(0)';
      }
    });

    cancelButton.addEventListener('mouseenter', () => {
      cancelButton.style.backgroundColor = '#5a6268';
      cancelButton.style.transform = 'translateY(-1px)';
    });

    cancelButton.addEventListener('mouseleave', () => {
      cancelButton.style.backgroundColor = '#6c757d';
      cancelButton.style.transform = 'translateY(0)';
    });

    // Save button click handler with validation
    saveButton.addEventListener('click', () => {
      if (!selectedConstant) {
        showNotification('Please select a constant first.', 'warning');
        return;
      }

      try {
        const result = [selectedConstant];
        cleanup();
        modalOverlay.style.animation = 'modalSlideOut 0.2s ease-in forwards';
        setTimeout(() => {
          if (modalOverlay.parentNode) {
            modalOverlay.parentNode.removeChild(modalOverlay);
          }
        }, 200);
        originalResolve(result);
      } catch (error) {
        console.error('Error in modal save:', error);
        showNotification('An error occurred. Please try again.', 'error');
      }
    });

    // Cancel button handler
    cancelButton.addEventListener('click', closeModal);

    actionContainer.appendChild(cancelButton);
    actionContainer.appendChild(saveButton);

    // Create close button with improved styling
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close modal');
    Object.assign(closeButton.style, {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'transparent',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      color: '#6c757d',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    });

    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = '#f8f9fa';
      closeButton.style.color = '#495057';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.color = '#6c757d';
    });

    closeButton.addEventListener('click', closeModal);

    // Utility functions
    function closeModal() {
      cleanup();
      modalOverlay.style.animation = 'modalSlideOut 0.2s ease-in forwards';
      setTimeout(() => {
        if (modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
        // Reject the promise to indicate cancellation
        originalReject(new Error('Modal was closed by user'));
      }, 200);
    }

    function showNotification(message, type = 'info') {
      // Create a simple notification system
      const notification = document.createElement('div');
      notification.textContent = message;
      Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '1001',
        backgroundColor: type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8',
        animation: 'slideInRight 0.3s ease-out'
      });

      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }

    // Add slide out animation
    const existingStyle = document.getElementById('modal-animations');
    if (existingStyle) {
      existingStyle.textContent += `
        @keyframes modalSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-20px) scale(0.95); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `;
    }

    // Keyboard event handlers
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Enter' && !saveButton.disabled) {
        saveButton.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
    };

    // Store original resolve and reject
    const originalResolve = resolve;
    const originalReject = reject;

    // Append elements to modal
    modal.appendChild(closeButton);
    modal.appendChild(modalTitle);
    modal.appendChild(description);
    modal.appendChild(buttonContainer);
    modal.appendChild(actionContainer);

    // Append modal to overlay
    modalOverlay.appendChild(modal);

    // Append overlay to body and focus first button
    document.body.appendChild(modalOverlay);

    // Focus management for accessibility
    setTimeout(() => {
      const firstButton = buttonContainer.querySelector('button');
      if (firstButton) {
        firstButton.focus();
      }
    }, 100);

    // Click outside to close
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  });
}
