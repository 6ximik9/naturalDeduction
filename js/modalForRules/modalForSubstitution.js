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

/**
 * Creates a modal for quantifier substitution similar to modalForLeibniz
 * Takes a quantified formula like ∀xR(y,c,x) or ∃xR(y,c,x), highlights the quantified variable,
 * and allows user to enter a replacement term, returning the formula without quantifier
 * @param {Object} formula - The parsed formula object containing quantifier
 * @param {string} formulaString - The string representation of the formula
 * @returns {Promise<Object>} Promise that resolves with {formula: string, substitution: string}
 */
export function createModalForQuantifierSubstitution(formula, formulaString) {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!formula || !formulaString) {
      reject(new Error('No formula provided for quantifier substitution'));
      return;
    }

    // Extract quantifier information
    const quantifierInfo = extractQuantifierInfo(formula);
    if (!quantifierInfo) {
      reject(new Error('Formula does not contain a quantifier'));
      return;
    }

    const { quantifierType, variable, operand } = quantifierInfo;

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
      maxWidth: '800px',
      padding: '32px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
      animation: 'modalSlideIn 0.3s ease-out',
      maxHeight: '90vh',
      overflow: 'auto'
    });

    // Add CSS animation if not already present
    if (!document.getElementById('quantifier-substitution-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'quantifier-substitution-modal-styles';
      style.textContent = `
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-20px) scale(0.95); }
        }
        .quantifier-variable {
          // background-color: #ffeb3b;
          background-color: #e3f2fd;
          color: #333;
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: bold;
          // border: 2px solid #fbc02d;
          border: 2px solid #2196f3;
        }
        .formula-container {
          font-size: 28px;
          font-family: 'Times New Roman', serif;
          text-align: center;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background-color: #fafafa;
          line-height: 1.5;
        }
        .editor-container {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          transition: border-color 0.2s ease;
        }
        .editor-container:focus-within {
          border-color: #007bff;
        }
        .editor-error {
          border-color: #dc3545 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Create modal title
    const modalTitle = document.createElement('h2');
    modalTitle.id = 'modal-title';
    modalTitle.textContent = `${quantifierType === 'forall' ? 'Universal' : 'Existential'} Quantifier Substitution`;
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
    description.textContent = `Variable "${variable}" will be replaced with your input term:`;
    Object.assign(description.style, {
      margin: '0',
      fontSize: '16px',
      color: '#666',
      textAlign: 'center',
      lineHeight: '1.5'
    });

    // Create formula container with highlighted variables
    const formulaContainer = document.createElement('div');
    formulaContainer.className = 'formula-container';

    // Generate formula with highlighted quantified variables
    const highlightedFormula = generateHighlightedFormula(operand, variable);
    formulaContainer.appendChild(highlightedFormula);

    // Create Monaco editor container
    const editorLabel = document.createElement('label');
    editorLabel.textContent = `Enter replacement term for "${variable}":`;
    Object.assign(editorLabel.style, {
      fontSize: '16px',
      fontWeight: '600',
      color: '#2c3e50'
    });

    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    Object.assign(editorContainer.style, {
      height: '150px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      padding: '4px',
      backgroundColor: '#fff',
      transition: 'border-color 0.2s ease'
    });

    // Create Monaco editor
    let monacoEditor;
    try {
      monacoEditor = editorMonaco.createEditor(editorContainer);
      monacoEditor.setValue('');
      monacoEditor.updateOptions({
        fontSize: 24,
        lineHeight: 1.4,
        padding: { top: 8, bottom: 8 },
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      });
    } catch (error) {
      console.warn('Could not create modal editor:', error);
      throw new Error('Failed to initialize Monaco editor');
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
        const replacementTerm = monacoEditor.getValue().trim();
        let hasErrors = false;
        let errorMessage = '';

        // Check for syntax errors using the same validation as the main editor
        if (replacementTerm.length > 0) {
          // Clear any existing errors first
          editorMonaco.clearEditorErrors(monacoEditor);

          // Run the grammar check which will set specific error markers
          const checkResult = checkRule(1, replacementTerm, monacoEditor);

          if (checkResult !== 0) {
            hasErrors = true;
            // Get the specific error messages from Monaco markers
            const model = monacoEditor.getModel();
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
    monacoEditor.onDidChangeModelContent(validateInput);

    // Form validation function
    function validateForm() {
      const replacementTerm = monacoEditor.getValue().trim();
      let hasValidInput = replacementTerm.length > 0;

      // Check for syntax errors
      if (hasValidInput) {
        // Clear any existing errors first
        editorMonaco.clearEditorErrors(monacoEditor);

        // Run the grammar check
        const checkResult = checkRule(1, replacementTerm, monacoEditor);
        hasValidInput = checkResult === 0;
      }

      applyButton.disabled = !hasValidInput;
      applyButton.style.opacity = hasValidInput ? '1' : '0.6';
      applyButton.style.cursor = hasValidInput ? 'pointer' : 'not-allowed';

      return hasValidInput;
    }

    // Create action buttons container
    const actionContainer = document.createElement('div');
    Object.assign(actionContainer.style, {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    });

    // Create apply button
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Substitution';
    applyButton.disabled = true;
    Object.assign(applyButton.style, {
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
    applyButton.addEventListener('mouseenter', () => {
      if (!applyButton.disabled) {
        applyButton.style.backgroundColor = '#218838';
        applyButton.style.transform = 'translateY(-1px)';
      }
    });

    applyButton.addEventListener('mouseleave', () => {
      if (!applyButton.disabled) {
        applyButton.style.backgroundColor = '#28a745';
        applyButton.style.transform = 'translateY(0)';
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

    // Apply button click handler
    applyButton.addEventListener('click', async () => {
      if (!validateForm()) {
        showNotification('Please enter a valid replacement term.', 'warning');
        return;
      }

      const replacementTerm = monacoEditor.getValue().trim();

      try {
        // Additional syntax validation
        try {
          deductive.checkWithAntlr(replacementTerm);
        } catch (parseError) {
          showNotification('Invalid syntax in the replacement term. Please check your input.', 'error');
          editorContainer.classList.add('editor-error');
          return;
        }

        // Perform the substitution on the operand (formula without quantifier)
        const substitutedFormula = performSubstitution(operand, variable, replacementTerm);

        // Create the result object with formula and substitution notation
        const result = {
          formula: substitutedFormula,
          substitution: `${variable}/${replacementTerm}`
        };

        cleanup();
        modalOverlay.style.animation = 'modalSlideOut 0.2s ease-in forwards';
        setTimeout(() => {
          if (modalOverlay.parentNode) {
            modalOverlay.parentNode.removeChild(modalOverlay);
          }
        }, 200);
        originalResolve(result);
      } catch (error) {
        console.error('Error in quantifier substitution modal:', error);
        showNotification('An error occurred. Please try again.', 'error');
      }
    });

    // Cancel button handler
    cancelButton.addEventListener('click', closeModal);

    actionContainer.appendChild(cancelButton);
    actionContainer.appendChild(applyButton);

    // Create close button
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

    // Keyboard event handlers
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Enter' && e.ctrlKey && !applyButton.disabled) {
        applyButton.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(validationTimeout);
      if (monacoEditor) {
        monacoEditor.dispose();
      }
    };

    // Store original resolve and reject
    const originalResolve = resolve;
    const originalReject = reject;

    // Append elements to modal
    modal.appendChild(closeButton);
    modal.appendChild(modalTitle);
    modal.appendChild(description);
    modal.appendChild(formulaContainer);
    modal.appendChild(editorLabel);
    modal.appendChild(editorContainer);
    modal.appendChild(errorDisplay);
    modal.appendChild(actionContainer);

    // Append modal to overlay
    modalOverlay.appendChild(modal);

    // Append overlay to body
    document.body.appendChild(modalOverlay);

    // Focus management for accessibility - focus the editor initially
    setTimeout(() => {
      monacoEditor.focus();
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

/**
 * Extracts quantifier information from a formula
 * @param {Object} formula - The parsed formula object
 * @returns {Object|null} Object with quantifierType, variable, and operand, or null if no quantifier
 */
function extractQuantifierInfo(formula) {
  if (!formula) return null;

  // Check for new grammar format (forall/exists)
  if (formula.type === 'forall' || formula.type === 'exists') {
    return {
      quantifierType: formula.type,
      variable: formula.variable,
      operand: formula.operand
    };
  }

  // Check for legacy quantifier format
  if (formula.type === 'quantifier') {
    const quantifierType = formula.quantifier === '∀' ? 'forall' : 'exists';
    return {
      quantifierType: quantifierType,
      variable: formula.variable.value || formula.variable,
      operand: formula.expression
    };
  }

  return null;
}

/**
 * Generates a highlighted formula with the quantified variable highlighted
 * @param {Object} operand - The operand part of the quantifier (formula without quantifier)
 * @param {string} variable - The variable to highlight
 * @returns {HTMLElement} The highlighted formula element
 */
function generateHighlightedFormula(operand, variable) {
  const container = document.createElement('div');

  // Generate the formula with highlighted variables
  const formulaElement = createHighlightedElement(operand, variable);
  container.appendChild(formulaElement);

  return container;
}

/**
 * Creates a highlighted element for a formula node, highlighting the specified variable
 * @param {Object} node - The formula node
 * @param {string} targetVariable - The variable to highlight
 * @returns {HTMLElement} The highlighted element
 */
function createHighlightedElement(node, targetVariable) {
  if (!node) return document.createTextNode('');

  const element = document.createElement('span');

  let content = '';
  let childElements = [];

  switch (node.type) {
    case 'constant':
    case 'number':
      content = node.value || node.name;
      break;

    case 'variable':
      content = node.value || node.name;
      // Highlight if this is the target variable
      if (content === targetVariable) {
        element.className = 'quantifier-variable';
      }
      break;

    case 'atom':
      content = node.value;
      break;

    case 'successor':
      childElements.push(document.createTextNode('s('));
      if (node.term) {
        childElements.push(createHighlightedElement(node.term, targetVariable));
      }
      childElements.push(document.createTextNode(')'));
      break;

    case 'addition':
      if (node.left && node.right) {
        childElements.push(createHighlightedElement(node.left, targetVariable));
        childElements.push(document.createTextNode('+'));
        childElements.push(createHighlightedElement(node.right, targetVariable));
      }
      break;

    case 'multiplication':
      if (node.left && node.right) {
        childElements.push(createHighlightedElement(node.left, targetVariable));
        childElements.push(document.createTextNode('*'));
        childElements.push(createHighlightedElement(node.right, targetVariable));
      }
      break;

    case 'equality':
      if (node.left && node.right) {
        childElements.push(createHighlightedElement(node.left, targetVariable));
        childElements.push(document.createTextNode('='));
        childElements.push(createHighlightedElement(node.right, targetVariable));
      }
      break;

    case 'function':
      childElements.push(document.createTextNode((node.name || '') + '('));
      if (node.terms && Array.isArray(node.terms)) {
        node.terms.forEach((term, index) => {
          if (index > 0) childElements.push(document.createTextNode(', '));
          childElements.push(createHighlightedElement(term, targetVariable));
        });
      }
      childElements.push(document.createTextNode(')'));
      break;

    case 'predicate':
      if (node.symbol && node.terms) {
        const symbolName = node.symbol.name || node.symbol.value;
        childElements.push(document.createTextNode(symbolName + '('));
        if (Array.isArray(node.terms)) {
          node.terms.forEach((term, index) => {
            if (index > 0) childElements.push(document.createTextNode(', '));
            childElements.push(createHighlightedElement(term, targetVariable));
          });
        }
        childElements.push(document.createTextNode(')'));
      }
      break;

    case 'parenthesis':
      childElements.push(document.createTextNode('('));
      if (node.value) {
        childElements.push(createHighlightedElement(node.value, targetVariable));
      }
      childElements.push(document.createTextNode(')'));
      break;

    case 'negation':
      const negSymbols = '¬'.repeat(node.count || 1);
      content = negSymbols;
      if (node.operand) {
        childElements.push(createHighlightedElement(node.operand, targetVariable));
      }
      break;

    case 'conjunction':
    case 'disjunction':
    case 'implication':
      const op = node.type === 'conjunction' ? '∧' :
                 node.type === 'disjunction' ? '∨' : '⇒';

      if (node.left && node.right) {
        childElements.push(createHighlightedElement(node.left, targetVariable));
        childElements.push(document.createTextNode(op));
        childElements.push(createHighlightedElement(node.right, targetVariable));
      }
      break;

    case 'forall':
    case 'exists':
      // Nested quantifiers
      const quantSymbol = node.type === 'forall' ? '∀' : '∃';
      childElements.push(document.createTextNode(quantSymbol + node.variable + ' '));
      if (node.operand) {
        childElements.push(createHighlightedElement(node.operand, targetVariable));
      }
      break;

    case 'quantifier':
      // Legacy quantifier format
      childElements.push(document.createTextNode((node.quantifier || '') + (node.variable || '') + ' '));
      if (node.expression) {
        childElements.push(createHighlightedElement(node.expression, targetVariable));
      }
      break;

    default:
      content = node.value || node.name || node.type || '?';
      break;
  }

  // Add content if any
  if (content) {
    element.appendChild(document.createTextNode(content));
  }

  // Add child elements
  childElements.forEach(child => {
    element.appendChild(child);
  });

  return element;
}

/**
 * Performs substitution of a variable with a replacement term in a formula
 * @param {Object} operand - The formula operand (without quantifier)
 * @param {string} variable - The variable to replace
 * @param {string} replacementTerm - The replacement term
 * @returns {string} The formula string after substitution
 */
function performSubstitution(operand, variable, replacementTerm) {
  // Create a deep copy of the operand to avoid modifying the original
  const operandCopy = JSON.parse(JSON.stringify(operand));

  // Parse the replacement term into a node structure
  const replacementNode = parseReplacementTerm(replacementTerm);

  // Perform the substitution
  substituteVariable(operandCopy, variable, replacementNode);

  // Convert back to string
  return getNodeText(operandCopy);
}

/**
 * Recursively substitutes a variable with a replacement node in a formula
 * @param {Object} node - The formula node to process
 * @param {string} variable - The variable to replace
 * @param {Object} replacementNode - The replacement node
 */
function substituteVariable(node, variable, replacementNode) {
  if (!node || typeof node !== 'object') return;

  // If this is a variable node that matches our target, replace it
  if (node.type === 'variable') {
    const nodeVariable = node.value || node.name;
    if (nodeVariable === variable) {
      // Replace the properties of this node with the replacement node
      Object.keys(node).forEach(key => delete node[key]);
      Object.assign(node, JSON.parse(JSON.stringify(replacementNode)));
      return;
    }
  }

  // Recursively process all properties
  for (let key in node) {
    if (node.hasOwnProperty(key)) {
      if (Array.isArray(node[key])) {
        // Handle arrays (like terms, operands)
        node[key].forEach(item => substituteVariable(item, variable, replacementNode));
      } else if (typeof node[key] === 'object' && node[key] !== null) {
        substituteVariable(node[key], variable, replacementNode);
      }
    }
  }
}

/**
 * Parses a replacement term string into a node structure
 * @param {string} replacementTerm - The replacement term string
 * @returns {Object} A node representing the replacement term
 */
function parseReplacementTerm(replacementTerm) {
  const trimmed = replacementTerm.trim();

  // Check if it's a successor function like s(0), s(s(0)), etc.
  if (trimmed.startsWith('s(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(2, -1);
    return {
      type: 'successor',
      term: parseReplacementTerm(inner)
    };
  }

  // Check if it's a simple constant/variable/number
  if (/^[a-zA-Z0-9]+$/.test(trimmed)) {
    // Determine if it's a number or constant/variable
    if (/^\d+$/.test(trimmed)) {
      return {
        type: 'number',
        value: trimmed
      };
    } else {
      return {
        type: 'constant',
        value: trimmed
      };
    }
  }

  // For more complex expressions, create a generic constant node
  return {
    type: 'constant',
    value: trimmed
  };
}

/**
 * Gets the text representation of a formula node
 * @param {Object} node - The formula node
 * @returns {string} The text representation
 */
function getNodeText(node) {
  if (!node) return '';

  switch (node.type) {
    case 'constant':
    case 'variable':
    case 'number':
      return node.value || node.name;

    case 'atom':
      return node.value;

    case 'successor':
      return `s(${getNodeText(node.term)})`;

    case 'addition':
      if (node.left && node.right) {
        return `${getNodeText(node.left)}+${getNodeText(node.right)}`;
      }
      break;

    case 'multiplication':
      if (node.left && node.right) {
        return `${getNodeText(node.left)}*${getNodeText(node.right)}`;
      }
      break;

    case 'equality':
      if (node.left && node.right) {
        return `${getNodeText(node.left)}=${getNodeText(node.right)}`;
      }
      break;

    case 'function':
      const funcName = node.name || '';
      const funcArgs = node.terms ? node.terms.map(getNodeText).join(', ') : '';
      return `${funcName}(${funcArgs})`;

    case 'predicate':
      if (node.symbol && node.terms) {
        const symbolName = node.symbol.name || node.symbol.value;
        const predArgs = node.terms.map(getNodeText).join(', ');
        return `${symbolName}(${predArgs})`;
      }
      break;

    case 'parenthesis':
      return `(${getNodeText(node.value)})`;

    case 'negation':
      const negSymbols = '¬'.repeat(node.count || 1);
      return `${negSymbols}${getNodeText(node.operand)}`;

    case 'conjunction':
    case 'disjunction':
    case 'implication':
      const op = node.type === 'conjunction' ? '∧' :
                 node.type === 'disjunction' ? '∨' : '⇒';

      if (node.left && node.right) {
        return `${getNodeText(node.left)}${op}${getNodeText(node.right)}`;
      }
      break;

    case 'forall':
    case 'exists':
      const quantSymbol = node.type === 'forall' ? '∀' : '∃';
      const variable = node.variable || '';
      const operand = getNodeText(node.operand);
      // Add space between quantifier+variable and operand unless operand starts with parenthesis
      const needsSpace = operand && !operand.startsWith('(');
      return `${quantSymbol}${variable}${needsSpace ? ' ' : ''}${operand}`;

    case 'quantifier':
      // Legacy quantifier format
      const quantSymbol2 = node.quantifier || '';
      const variable2 = node.variable || '';
      const expression = getNodeText(node.expression);
      // Add space between quantifier+variable and expression unless expression starts with parenthesis
      const needsSpace2 = expression && !expression.startsWith('(');
      return `${quantSymbol2}${variable2}${needsSpace2 ? ' ' : ''}${expression}`;

    default:
      return node.value || node.name || node.type || '?';
  }

  return '';
}
