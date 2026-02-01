
import * as monaco from 'monaco-editor';
import * as editorMonaco from '../monacoEditor';
import { checkRule } from "../../index";
import { hasEditorErrors } from "../monacoEditor";
import { currentLevel, side } from "../../proofs/gentzen/GentzenProof";
import * as deductive from "../../core/deductiveEngine";
import {getProof} from "../../core/deductiveEngine";

let customEditor = null;

/**
 * Creates an advanced modal for existential quantifier introduction (∃I)
 * Used in rule 17 for selecting formulas and performing substitutions
 * @param {Array<string>} formulas - Array of available formulas from hypotheses
 * @returns {Promise<Array<string>>} Promise that resolves with [selectedFormula, selectedConstant, substitutionTerm]
 */
export function createAdvancedModal(formulas) {
  return new Promise((resolve, reject) => {
    // Validate input
    // if (!formulas || !Array.isArray(formulas) || formulas.length === 0) {
    //   reject(new Error('No formulas provided for selection'));
    //   return;
    // }

    // Create modal overlay with improved accessibility
    const modalOverlay = document.createElement('div');
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
    Object.assign(modal.style, {
      background: '#fff',
      borderRadius: '16px',
      width: '95%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      padding: '32px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
      overflow: 'hidden',
      animation: 'modalSlideIn 0.3s ease-out'
    });

    // Add CSS animations if not already present
    if (!document.getElementById('advanced-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'advanced-modal-styles';
      style.textContent = `
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-20px) scale(0.95); }
        }
        .advanced-button:focus { outline: 2px solid #007bff; outline-offset: 2px; }
        .formula-select { border: 2px solid #e0e0e0; transition: border-color 0.2s ease; }
        .formula-select:focus { border-color: #007bff; }
        .editor-section { border: 2px solid #e0e0e0; border-radius: 8px; transition: border-color 0.2s ease; }
        .editor-section:focus-within { border-color: #007bff; }
        .editor-error { border-color: #dc3545 !important; }
      `;
      document.head.appendChild(style);
    }

    // Create modal header
    const header = document.createElement('div');
    Object.assign(header.style, {
      textAlign: 'center',
      marginBottom: '16px'
    });

    const modalTitle = document.createElement('h2');
    modalTitle.id = 'modal-title';
    modalTitle.textContent = 'Existential Quantifier Introduction (∃I)';
    Object.assign(modalTitle.style, {
      margin: '0',
      fontSize: '28px',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '8px'
    });

    const description = document.createElement('p');
    description.textContent = 'Select a formula and specify the substitution to introduce an existential quantifier:';
    Object.assign(description.style, {
      margin: '0',
      fontSize: '16px',
      color: '#666',
      lineHeight: '1.5'
    });

    header.appendChild(modalTitle);
    header.appendChild(description);

    // Create main content area
    const contentArea = document.createElement('div');
    Object.assign(contentArea.style, {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      flex: '1',
      overflow: 'hidden'
    });

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
      transition: 'all 0.2s ease',
      zIndex: '1001'
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

    // Left side: Formula selection
    const leftSide = document.createElement('div');
    Object.assign(leftSide.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    });

    // Formula selection section
    const formulaSection = document.createElement('div');

    const formulaLabel = document.createElement('label');
    formulaLabel.textContent = 'Select formula from hypotheses:';
    Object.assign(formulaLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '12px'
    });

    const formulaSelect = document.createElement('select');
    formulaSelect.className = 'formula-select';
    Object.assign(formulaSelect.style, {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      borderRadius: '8px',
      border: '2px solid #e0e0e0',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease'
    });

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Choose a formula...';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    formulaSelect.appendChild(defaultOption);

    formulas.forEach(formula => {
      const option = document.createElement('option');
      option.value = formula;
      option.textContent = formula;
      formulaSelect.appendChild(option);
    });

    // Custom formula section
    const customFormulaSection = document.createElement('div');

    const customLabel = document.createElement('label');
    customLabel.textContent = 'Or enter custom formula:';
    Object.assign(customLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '12px'
    });

    const customEditorContainer = document.createElement('div');
    customEditorContainer.id = 'customEditorContainer';
    customEditorContainer.className = 'editor-section';
    Object.assign(customEditorContainer.style, {
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      padding: '8px',
      backgroundColor: '#f8f9fa',
      minHeight: '120px',
      display: 'block' // Start visible since "My formula" is the default
    });

    formulaSection.appendChild(formulaLabel);
    formulaSection.appendChild(formulaSelect);

    customFormulaSection.appendChild(customLabel);
    customFormulaSection.appendChild(customEditorContainer);

    leftSide.appendChild(formulaSection);
    leftSide.appendChild(customFormulaSection);

    // Right side: Variable selection and term input
    const rightSide = document.createElement('div');
    Object.assign(rightSide.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    });

    // Variable selection section
    const variableSection = document.createElement('div');

    const variableLabel = document.createElement('label');
    variableLabel.textContent = 'Select variable to substitute:';
    Object.assign(variableLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '12px'
    });

    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
      gap: '10px',
      marginBottom: '16px'
    });

    // Term input section
    const termSection = document.createElement('div');

    const termLabel = document.createElement('label');
    termLabel.textContent = 'Enter replacement term:';
    Object.assign(termLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '12px'
    });

    let activeButton = null;
    let selectedConstant = null;
    let selectedFormula = null;

    function renderButtons(buttonValues) {
      buttonContainer.innerHTML = '';
      activeButton = null;
      selectedConstant = null;

      if (!buttonValues || buttonValues.length === 0) {
        const noVarsMessage = document.createElement('div');
        noVarsMessage.textContent = 'No variables available for substitution';
        Object.assign(noVarsMessage.style, {
          padding: '16px',
          textAlign: 'center',
          color: '#6c757d',
          fontStyle: 'italic',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        });
        buttonContainer.appendChild(noVarsMessage);
        validateForm();
        return;
      }

      buttonValues.forEach((constant) => {
        const button = document.createElement('button');
        button.className = 'advanced-button';
        button.textContent = constant;
        button.setAttribute('data-constant', constant);
        button.setAttribute('tabindex', '0');

        Object.assign(button.style, {
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          border: '2px solid #e0e0e0',
          borderRadius: '6px',
          backgroundColor: '#f8f9fa',
          color: '#495057',
          transition: 'all 0.2s ease',
          minHeight: '44px',
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

      validateForm();
    }

    // Setup main editor for term input
    const termEditorContainer = document.createElement('div');
    termEditorContainer.className = 'editor-section';
    Object.assign(termEditorContainer.style, {
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      padding: '8px',
      backgroundColor: '#fff',
      minHeight: '100px'
    });

    // Create a dedicated editor container for this modal
    const modalEditorContainer = document.createElement('div');
    modalEditorContainer.id = 'modalTermEditor';
    Object.assign(modalEditorContainer.style, {
      display: 'block',
      width: '100%',
      height: '80px',
      border: 'none',
      borderRadius: '6px',
      fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
      fontSize: '16px',
      lineHeight: '1.5',
      backgroundColor: '#f8f9fa'
    });

    // Create a dedicated Monaco editor instance for this modal
    let modalTermEditor;
    try {
      modalTermEditor = editorMonaco.createEditor(modalEditorContainer);
      modalTermEditor.setValue('');
      modalTermEditor.updateOptions({
        fontSize: 20,
        lineHeight: 1.4,
        padding: { top: 8, bottom: 8 },
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      });
    } catch (error) {
      console.warn('Could not create modal term editor, falling back to main editor:', error);
      // Fallback to main editor if modal editor creation fails
      modalTermEditor = editorMonaco.editor;
      editorMonaco.clearEditorErrors();
      editorMonaco.editor.setValue('');
      editorMonaco.editor.updateOptions({
        fontSize: 20,
        lineHeight: 1.4,
        padding: { top: 8, bottom: 8 },
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      });
    }

    // Error display for term input
    const termErrorDisplay = document.createElement('div');
    Object.assign(termErrorDisplay.style, {
      marginTop: '8px',
      padding: '8px 12px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      borderRadius: '4px',
      fontSize: '14px',
      display: 'none'
    });

    // Append the modal editor container
    termEditorContainer.appendChild(modalEditorContainer);
    termSection.appendChild(termLabel);
    termSection.appendChild(termEditorContainer);
    termSection.appendChild(termErrorDisplay);

    // Form validation function
    function validateForm() {
      const hasSelectedFormula = selectedFormula !== null;
      const hasSelectedConstant = selectedConstant !== null;
      const termValue = modalTermEditor.getValue().trim();
      let hasValidTerm = termValue.length > 0;

      // Check for syntax errors in term input
      if (hasValidTerm) {
        // Clear any existing errors first
        editorMonaco.clearEditorErrors(modalTermEditor);

        // Run the grammar check
        const checkResult = checkRule(1, termValue, modalTermEditor);
        hasValidTerm = checkResult === 0;

        // Also check Monaco editor markers if using main editor
        if (modalTermEditor === editorMonaco.editor && editorMonaco.hasEditorErrors()) {
          hasValidTerm = false;
        }
      }

      const isValid = hasSelectedFormula && hasSelectedConstant && hasValidTerm;

      saveButton.disabled = !isValid;
      saveButton.style.opacity = isValid ? '1' : '0.6';
      saveButton.style.cursor = isValid ? 'pointer' : 'not-allowed';

      return isValid;
    }

    // Real-time validation for term input
    let termValidationTimeout;
    const validateTermInput = () => {
      clearTimeout(termValidationTimeout);
      termValidationTimeout = setTimeout(() => {
        const value = modalTermEditor.getValue().trim();
        let hasErrors = false;
        let errorMessage = '';

        // Check for syntax errors using the same validation as the main editor
        if (value.length > 0) {
          // Clear any existing errors first
          editorMonaco.clearEditorErrors(modalTermEditor);

          // Run the grammar check which will set specific error markers
          const checkResult = checkRule(1, value, modalTermEditor);

          if (checkResult !== 0) {
            hasErrors = true;
            // Get the specific error messages from Monaco markers
            const model = modalTermEditor.getModel();
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
        if (modalTermEditor === editorMonaco.editor && editorMonaco.hasEditorErrors()) {
          hasErrors = true;
          const errors = editorMonaco.getEditorErrors();
          errorMessage = errors.map(msg => {
            const colonIndex = msg.indexOf(': ');
            return colonIndex !== -1 ? msg.substring(colonIndex + 2) : msg;
          }).join(', ');
        }

        if (hasErrors) {
          termEditorContainer.classList.add('editor-error');
          termErrorDisplay.textContent = errorMessage;
          termErrorDisplay.style.display = 'block';
        } else {
          termEditorContainer.classList.remove('editor-error');
          termErrorDisplay.style.display = 'none';
        }

        validateForm();
      }, 300);
    };

    // Add input validation listeners
    modalTermEditor.onDidChangeModelContent(validateTermInput);

    // Create action buttons container
    const actionContainer = document.createElement('div');
    Object.assign(actionContainer.style, {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
      gridColumn: '1 / -1'
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

    // Cancel button handler
    cancelButton.addEventListener('click', closeModal);

    // Enhanced save button click handler with comprehensive validation
    saveButton.addEventListener('click', async () => {
      if (!validateForm()) {
        showNotification('Please complete all required fields.', 'warning');
        return;
      }

      const termValue = modalTermEditor.getValue().trim();

      try {
        // Get the selected formula (either from dropdown or custom editor)
        let formulaValue = formulaSelect.value;
        if (formulaValue === 'My formula') {
          formulaValue = customEditor ? customEditor.getValue() : '';
          if (!formulaValue.trim()) {
            showNotification('Please enter a custom formula.', 'warning');
            return;
          }
          if (editorMonaco.hasEditorErrors(customEditor)) {
            showNotification('There are syntax errors in the custom formula.', 'error');
            return;
          }
        }

        // Validate the formula structure for existential quantifier
        try {
          const parsedValue = getProof(deductive.checkWithAntlr(formulaValue));
          console.log(parsedValue);
          if (parsedValue.type !== 'exists') {
            showNotification('The selected formula must be an existential quantifier (∃).', 'error');
            return;
          }
        } catch (e) {
          console.warn("Formula parsing error:", e);
          showNotification('Invalid formula format. Please check your selection.', 'error');
          return;
        }

        // Additional syntax validation for the replacement term
        try {
          deductive.checkWithAntlr(termValue);
        } catch (parseError) {
          showNotification('Invalid syntax in the replacement term. Please check your input.', 'error');
          termEditorContainer.classList.add('editor-error');
          return;
        }

        // Enhanced freshness check for rule 17 (∃-introduction)
        if (currentLevel === 17) {
          const checkFresh = deductive.checkWithAntlr(termValue);
          const hypothesesAll = deductive.getAllHypotheses(side);
          const isElementInArray = hypothesesAll.find(item => {
            const itemProof = deductive.getProof(item);
            const checkFreshProof = deductive.getProof(checkFresh);
            return deductive.compareExpressions(itemProof, checkFreshProof);
          });

          if (isElementInArray) {
            showNotification('The replacement term is not fresh (it already appears in the hypotheses). Please enter a different term.', 'error');
            termEditorContainer.classList.add('editor-error');
            return;
          }
        }

        const result = [formulaValue, selectedConstant, termValue];
        cleanup();
        modalOverlay.style.animation = 'modalSlideOut 0.2s ease-in forwards';
        setTimeout(() => {
          if (modalOverlay.parentNode) {
            modalOverlay.parentNode.removeChild(modalOverlay);
          }
        }, 200);
        originalResolve(result);

      } catch (error) {
        console.error('Error in advanced modal:', error);
        showNotification('An unexpected error occurred. Please try again.', 'error');
      }
    });

    // Enhanced formula selection event handler
    formulaSelect.addEventListener('change', () => {
      const selectedValue = formulaSelect.value;
      selectedFormula = selectedValue;

      if (selectedValue === 'My formula') {
        customEditorContainer.style.display = 'block';
        // Custom editor is already created during initialization
        if (customEditor) {
          // Focus the custom editor
          setTimeout(() => customEditor.focus(), 100);
        }
      } else if (selectedValue) {
        customEditorContainer.style.display = 'none';

        const hasSyntaxError = checkRule(1, selectedValue) !== 0;
        if (hasSyntaxError) {
          renderButtons([]);
          validateForm();
          return;
        }

        try {
          const parsed = deductive.checkWithAntlr(selectedValue);
          const extracted = deductive.extractConstantsOrVariables(parsed);
          console.log("Extracted constants/variables:", extracted);
          if (extracted.length < 1) {
            buttonContainer.innerHTML = '';
            return;
          }
          renderButtons(extracted);
        } catch (e) {
          console.warn("Parsing error:", e);
          buttonContainer.innerHTML = '';
        }
      }
    });

    const myFormulaOption = document.createElement('option');
    myFormulaOption.value = 'My formula';
    myFormulaOption.textContent = 'My formula';
    formulaSelect.appendChild(myFormulaOption);


    formulaSelect.value = 'My formula';

    // Initialize the custom editor immediately since "My formula" is the default
    const newEditor = document.createElement('div');
    newEditor.id = 'customMonacoEditor';
    newEditor.style.height = '100px';
    newEditor.style.border = 'none';
    customEditorContainer.innerHTML = '';
    customEditorContainer.appendChild(newEditor);

    try {
      customEditor = editorMonaco.createEditor(newEditor);
      customEditor.setValue('');
      customEditor.updateOptions({
        fontSize: 20,
        lineHeight: 1.4,
        padding: { top: 8, bottom: 8 },
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      });

      customEditor.onDidChangeModelContent(() => {
        const value = customEditor.getValue().trim();
        selectedFormula = value;

        if (!value) {
          renderButtons([]);
          validateForm();
          return;
        }

        const hasSyntaxError = checkRule(1, value, customEditor) !== 0;
        if (hasSyntaxError) {
          renderButtons([]);
          validateForm();
          return;
        }

        try {
          const parsed = deductive.checkWithAntlr(value);
          const extracted = deductive.extractConstantsOrVariables(parsed);
          renderButtons(extracted);
        } catch (e) {
          console.warn("Parsing error:", e);
          renderButtons([]);
        }

        validateForm();
      });
    } catch (error) {
      console.error('Failed to create custom editor:', error);
    }

    setTimeout(() => {
      formulaSelect.dispatchEvent(new Event('change'));
    }, 0);


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
      clearTimeout(termValidationTimeout);
      // Dispose of modal editor if it's not the main editor
      if (modalTermEditor && modalTermEditor !== editorMonaco.editor) {
        modalTermEditor.dispose();
      }
      // Dispose of custom editor if it exists
      if (customEditor && customEditor !== editorMonaco.editor) {
        customEditor.dispose();
      }
    };

    // Store original resolve and reject
    const originalResolve = resolve;
    const originalReject = reject;

    // Use the existing action container and append buttons
    actionContainer.appendChild(cancelButton);
    actionContainer.appendChild(saveButton);

    // Assemble the variable selection section
    variableSection.appendChild(variableLabel);
    variableSection.appendChild(buttonContainer);

    // Assemble the right side
    rightSide.appendChild(variableSection);
    rightSide.appendChild(termSection);

    // Assemble the content area
    contentArea.appendChild(leftSide);
    contentArea.appendChild(rightSide);

    // Assemble the modal
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(contentArea);
    modal.appendChild(actionContainer);
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Focus management - focus the custom editor after modal is shown
    setTimeout(() => {
      if (customEditor) {
        customEditor.focus();
      }
    }, 200);

    // Click outside to close
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  });
}
