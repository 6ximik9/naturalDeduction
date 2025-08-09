import * as monaco from 'monaco-editor';
import * as editorMonaco from '../monacoEditor';
import {checkRule} from "../index";
import {hasEditorErrors} from "../monacoEditor";
import {currentLevel, side} from "../GentzenProof";
import * as deductive from "../deductiveEngine";

/**
 * Creates an improved modal for term substitution in quantifier rules
 * Used in rules 14 (∃-elimination) and 15 (∀-elimination) for variable substitution
 * @param {Array<string>} constants - Array of available constants/variables for substitution
 * @returns {Promise<Array<string>>} Promise that resolves with [selectedConstant, substitutionTerm]
 */
export function createModal(constants) {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!constants || !Array.isArray(constants) || constants.length === 0) {
      reject(new Error('No constants provided for substitution'));
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
      maxWidth: '700px',
      padding: '32px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
      animation: 'modalSlideIn 0.3s ease-out'
    });

    // Add CSS animations if not already present
    if (!document.getElementById('substitution-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'substitution-modal-styles';
      style.textContent = `
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-20px) scale(0.95); }
        }
        .substitution-button:focus { outline: 2px solid #007bff; outline-offset: 2px; }
        .editor-container { border: 2px solid #e0e0e0; border-radius: 8px; transition: border-color 0.2s ease; }
        .editor-container:focus-within { border-color: #007bff; }
        .editor-error { border-color: #dc3545 !important; }
      `;
      document.head.appendChild(style);
    }

    // Create modal title
    const modalTitle = document.createElement('h2');
    modalTitle.id = 'modal-title';
    modalTitle.textContent = currentLevel === 14 ? 'Existential Quantifier Elimination (∃E)' : 'Universal Quantifier Elimination (∀E)';
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
    description.textContent = 'Select a variable to substitute and enter the replacement term:';
    Object.assign(description.style, {
      margin: '0',
      fontSize: '16px',
      color: '#666',
      textAlign: 'center',
      lineHeight: '1.5'
    });

    // Create variable selection section
    const variableSection = document.createElement('div');
    Object.assign(variableSection.style, {
      marginTop: '16px'
    });

    const variableLabel = document.createElement('label');
    variableLabel.textContent = 'Select variable to substitute:';
    Object.assign(variableLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '12px'
    });

    // Create button container with improved layout
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    Object.assign(buttonContainer.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '10px'
    });

    let activeButton = null;
    let selectedConstant = null;

    // Generate buttons based on constants with improved interaction
    constants.forEach((constant, index) => {
      const button = document.createElement('button');
      button.className = 'substitution-button';
      button.textContent = constant;
      button.setAttribute('data-constant', constant);
      button.setAttribute('tabindex', '0');

      Object.assign(button.style, {
        padding: '12px 16px',
        fontSize: '18px',
        fontWeight: '500',
        cursor: 'pointer',
        border: '2px solid #e0e0e0',
        borderRadius: '6px',
        backgroundColor: '#f8f9fa',
        color: '#495057',
        transition: 'all 0.2s ease',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });

      // Enhanced button state management
      const updateButtonState = (targetButton, isActive, isHovered = false) => {
        if (isActive) {
          Object.assign(targetButton.style, {
            backgroundColor: '#007bff',
            borderColor: '#007bff',
            color: '#fff',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
          });
        } else if (isHovered) {
          Object.assign(targetButton.style, {
            backgroundColor: '#e9ecef',
            borderColor: '#adb5bd',
            transform: 'translateY(-1px)',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
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
          validateForm();
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

        // Update validation
        validateForm();
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

    variableSection.appendChild(variableLabel);
    variableSection.appendChild(buttonContainer);

    // Create term input section
    const termSection = document.createElement('div');
    Object.assign(termSection.style, {
      marginTop: '24px'
    });

    const termLabel = document.createElement('label');
    termLabel.textContent = 'Enter replacement term:';
    Object.assign(termLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '12px'
    });

    // Create editor container with improved styling
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    Object.assign(editorContainer.style, {
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      padding: '4px',
      backgroundColor: '#fff',
      transition: 'border-color 0.2s ease'
    });

    // Create a dedicated editor container for this modal
    const modalEditorContainer = document.createElement('div');
    modalEditorContainer.id = 'modalEditor';
    Object.assign(modalEditorContainer.style, {
      display: 'block',
      width: '100%',
      height: '100px',
      border: 'none',
      borderRadius: '6px',
      fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
      fontSize: '16px',
      lineHeight: '1.5',
      backgroundColor: '#f8f9fa'
    });

    // Create a dedicated Monaco editor instance for this modal
    let modalEditor;
    try {
      modalEditor = editorMonaco.createEditor(modalEditorContainer);
      modalEditor.setValue('');
      modalEditor.updateOptions({
        fontSize: 24,
        lineHeight: 1.4,
        padding: { top: 8, bottom: 8 },
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      });
    } catch (error) {
      console.warn('Could not create modal editor, falling back to main editor:', error);
      // Fallback to main editor if modal editor creation fails
      modalEditor = editorMonaco.editor;
      editorMonaco.clearEditorErrors();
      editorMonaco.editor.setValue('');
      editorMonaco.editor.updateOptions({
        fontSize: 24,
        lineHeight: 1.4,
        padding: { top: 8, bottom: 8 },
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      });
    }

    // Error display
    const errorDisplay = document.createElement('div');
    Object.assign(errorDisplay.style, {
      marginTop: '8px',
      padding: '8px 12px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      borderRadius: '4px',
      fontSize: '14px',
      display: 'none'
    });

    // Real-time validation
    let validationTimeout;
    const validateInput = () => {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        const value = modalEditor.getValue().trim();
        let hasErrors = false;
        let errorMessage = '';

        // Check for syntax errors using the same validation as the main editor
        if (value.length > 0) {
          // Clear any existing errors first
          editorMonaco.clearEditorErrors(modalEditor);

          // Run the grammar check which will set specific error markers
          const checkResult = checkRule(1, value, modalEditor);

          if (checkResult !== 0) {
            hasErrors = true;
            // Get the specific error messages from Monaco markers
            const model = modalEditor.getModel();
            const markers = monaco.editor.getModelMarkers({ resource: model.uri });
            if (markers.length > 0) {
              // Extract just the error message part, removing "Line X, col Y:" prefix
              errorMessage = markers.map(marker => {
                const msg = marker.message;
                const colonIndex = msg.indexOf(': ');
                return colonIndex !== -1 ? msg.substring(colonIndex + 2) : msg;
              }).join(', ');
            } else {
              errorMessage = 'Invalid syntax. Please check your input.';
            }
          }
        }

        // Also check Monaco editor markers if using main editor (fallback case)
        if (modalEditor === editorMonaco.editor && editorMonaco.hasEditorErrors()) {
          hasErrors = true;
          const errors = editorMonaco.getEditorErrors();
          errorMessage = errors.map(msg => {
            const colonIndex = msg.indexOf(': ');
            return colonIndex !== -1 ? msg.substring(colonIndex + 2) : msg;
          }).join(', ');
        }

        if (hasErrors) {
          editorContainer.classList.add('editor-error');
          errorDisplay.textContent = errorMessage;
          errorDisplay.style.display = 'block';
        } else {
          editorContainer.classList.remove('editor-error');
          errorDisplay.style.display = 'none';
        }

        validateForm();
      }, 300);
    };

    // Add input validation listener
    modalEditor.onDidChangeModelContent(validateInput);

    // Append the modal editor container
    editorContainer.appendChild(modalEditorContainer);
    termSection.appendChild(termLabel);
    termSection.appendChild(editorContainer);
    termSection.appendChild(errorDisplay);

    // Form validation function
    function validateForm() {
      const hasSelectedConstant = selectedConstant !== null;
      const value = modalEditor.getValue().trim();
      let hasValidInput = value.length > 0;

      // Check for syntax errors
      if (hasValidInput) {
        // Clear any existing errors first
        editorMonaco.clearEditorErrors(modalEditor);

        // Run the grammar check
        const checkResult = checkRule(1, value, modalEditor);
        hasValidInput = checkResult === 0;

        // Also check Monaco editor markers if using main editor
        if (modalEditor === editorMonaco.editor && editorMonaco.hasEditorErrors()) {
          hasValidInput = false;
        }
      }

      const isValid = hasSelectedConstant && hasValidInput;

      saveButton.disabled = !isValid;
      saveButton.style.opacity = isValid ? '1' : '0.6';
      saveButton.style.cursor = isValid ? 'pointer' : 'not-allowed';

      return isValid;
    }

    // Create action buttons container
    const actionContainer = document.createElement('div');
    Object.assign(actionContainer.style, {
      display: 'flex',
      gap: '12px',
      marginTop: '32px'
    });

    // Create save button with improved styling and validation
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Apply Substitution';
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

    // Enhanced button interactions
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

    // Enhanced save button click handler with comprehensive validation
    saveButton.addEventListener('click', async () => {
      if (!validateForm()) {
        showNotification('Please complete all required fields.', 'warning');
        return;
      }

      const editorValue = modalEditor.getValue().trim();

      try {
        // Enhanced freshness check for rule 15 (∀-elimination)
        if (currentLevel === 15) {
          const checkFresh = deductive.checkWithAntlr(editorValue);
          const hypothesesAll = deductive.getAllHypotheses(side);

          const isElementInArray = hypothesesAll.find(function (item) {
            const itemProof = deductive.getProof(item);
            const checkFreshProof = deductive.getProof(checkFresh);
            return deductive.compareExpressions(itemProof, checkFreshProof);
          });

          if (isElementInArray) {
            showNotification('The entered term is not fresh (it already appears in the hypotheses). Please enter a different term.', 'error');
            editorContainer.classList.add('editor-error');
            return;
          }
        }

        // Additional syntax validation
        try {
          deductive.checkWithAntlr(editorValue);
        } catch (parseError) {
          showNotification('Invalid syntax in the replacement term. Please check your input.', 'error');
          editorContainer.classList.add('editor-error');
          return;
        }

        const result = [selectedConstant, editorValue];
        cleanup();
        modalOverlay.style.animation = 'modalSlideOut 0.2s ease-in forwards';
        setTimeout(() => {
          if (modalOverlay.parentNode) {
            modalOverlay.parentNode.removeChild(modalOverlay);
          }
        }, 200);
        originalResolve(result);

      } catch (error) {
        console.error('Error in substitution modal:', error);
        showNotification('An unexpected error occurred. Please try again.', 'error');
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
        maxWidth: '400px',
        backgroundColor: type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8',
        animation: 'slideInRight 0.3s ease-out'
      });

      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 4000);
    }

    // Keyboard event handlers
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Enter' && e.ctrlKey && !saveButton.disabled) {
        saveButton.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(validationTimeout);
      // Dispose of modal editor if it's not the main editor
      if (modalEditor && modalEditor !== editorMonaco.editor) {
        modalEditor.dispose();
      }
    };

    // Store original resolve and reject
    const originalResolve = resolve;
    const originalReject = reject;

    // Append elements to modal
    modal.appendChild(closeButton);
    modal.appendChild(modalTitle);
    modal.appendChild(description);
    modal.appendChild(variableSection);
    modal.appendChild(termSection);
    modal.appendChild(actionContainer);

    // Append modal to overlay
    modalOverlay.appendChild(modal);

    // Append overlay to body and setup focus management
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

    // Initial validation
    validateForm();
  });
}
