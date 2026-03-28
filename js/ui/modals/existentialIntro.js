import * as monaco from 'monaco-editor';
import * as editorMonaco from '../monacoEditor';
import { checkRule } from "../../index";
import { hasEditorErrors } from "../monacoEditor";
import { currentLevel, side } from "../../proofs/gentzen/GentzenProof";
import * as deductive from "../../core/deductiveEngine";
import {getProof} from "../../core/deductiveEngine";
import {t} from "../../core/i18n";

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
      background: 'var(--col-bg-white)',
      borderRadius: '16px',
      width: '95%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      padding: '32px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      border: '1px solid var(--col-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
      overflow: 'hidden',
      animation: 'modalSlideIn 0.3s ease-out',
      color: 'var(--col-text-main)'
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
        .formula-select { border: 2px solid var(--col-border); transition: border-color 0.2s ease; }
        .formula-select:focus { border-color: #007bff; }
        .editor-section { border: 2px solid var(--col-border); border-radius: 8px; transition: border-color 0.2s ease; }
        .editor-section:focus-within { border-color: #007bff; }
        .editor-error { border-color: #dc3545 !important; }
        
        body.dark-mode .formula-select {
          background-color: var(--col-bg-white);
          color: var(--col-text-main);
        }
        body.dark-mode .advanced-button {
          background-color: var(--col-bg-white) !important;
          color: var(--col-text-main) !important;
          border-color: var(--col-border) !important;
        }
        body.dark-mode .advanced-button:hover {
          background-color: #334155 !important;
        }
        body.dark-mode .editor-section {
          background-color: var(--col-bg-main) !important;
        }
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
    modalTitle.textContent = t('modal-exists-intro-title');
    modalTitle.setAttribute('data-i18n', 'modal-exists-intro-title');
    Object.assign(modalTitle.style, {
      margin: '0',
      fontSize: '28px',
      fontWeight: '600',
      color: 'var(--col-text-main)',
      marginBottom: '8px'
    });

    const description = document.createElement('p');
    description.textContent = t('modal-exists-intro-desc');
    description.setAttribute('data-i18n', 'modal-exists-intro-desc');
    Object.assign(description.style, {
      margin: '0',
      fontSize: '16px',
      color: 'var(--col-text-muted)',
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
      color: 'var(--col-text-muted)',
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
      closeButton.style.backgroundColor = 'rgba(0,0,0,0.05)';
      closeButton.style.color = 'var(--col-text-main)';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.color = 'var(--col-text-muted)';
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
    formulaLabel.textContent = t('modal-select-hyp-formula');
    formulaLabel.setAttribute('data-i18n', 'modal-select-hyp-formula');
    Object.assign(formulaLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: 'var(--col-text-main)',
      marginBottom: '12px'
    });

    const formulaSelect = document.createElement('select');
    formulaSelect.className = 'formula-select';
    Object.assign(formulaSelect.style, {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      borderRadius: '8px',
      border: '2px solid var(--col-border)',
      backgroundColor: 'var(--col-bg-white)',
      color: 'var(--col-text-main)',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease'
    });

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = t('modal-choose-formula');
    defaultOption.setAttribute('data-i18n', 'modal-choose-formula');
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
    customLabel.textContent = t('modal-enter-custom-formula');
    customLabel.setAttribute('data-i18n', 'modal-enter-custom-formula');
    Object.assign(customLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: 'var(--col-text-main)',
      marginBottom: '12px'
    });

    const customEditorContainer = document.createElement('div');
    customEditorContainer.id = 'customEditorContainer';
    customEditorContainer.className = 'editor-section';
    Object.assign(customEditorContainer.style, {
      border: '2px solid var(--col-border)',
      borderRadius: '8px',
      padding: '8px',
      backgroundColor: 'var(--col-bg-main)',
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
    variableLabel.textContent = t('modal-select-var-subst');
    variableLabel.setAttribute('data-i18n', 'modal-select-var-subst');
    Object.assign(variableLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: 'var(--col-text-main)',
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
    termLabel.textContent = t('modal-enter-replacement-term');
    termLabel.setAttribute('data-i18n', 'modal-enter-replacement-term');
    Object.assign(termLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: 'var(--col-text-main)',
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
        noVarsMessage.textContent = t('modal-no-vars-available');
        noVarsMessage.setAttribute('data-i18n', 'modal-no-vars-available');
        Object.assign(noVarsMessage.style, {
          padding: '16px',
          textAlign: 'center',
          color: 'var(--col-text-muted)',
          fontStyle: 'italic',
          backgroundColor: 'var(--col-bg-main)',
          borderRadius: '6px',
          border: '1px solid var(--col-border)'
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
          border: '2px solid var(--col-border)',
          borderRadius: '6px',
          backgroundColor: 'var(--col-bg-main)',
          color: 'var(--col-text-main)',
          transition: 'all 0.2s ease',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        });

        // Enhanced button state management
        const updateButtonState = (targetButton, isActive, isHovered = false) => {
          const isDark = document.body.classList.contains('dark-mode');
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
              backgroundColor: isDark ? '#334155' : '#e9ecef',
              borderColor: isDark ? '#475569' : '#adb5bd',
              transform: 'translateY(-1px)',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
            });
          } else {
            Object.assign(targetButton.style, {
              backgroundColor: 'var(--col-bg-main)',
              borderColor: 'var(--col-border)',
              color: 'var(--col-text-main)',
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
    saveButton.textContent = t('modal-btn-apply-subst');
    saveButton.setAttribute('data-i18n', 'modal-btn-apply-subst');
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
    cancelButton.textContent = t('modal-btn-cancel');
    cancelButton.setAttribute('data-i18n', 'modal-btn-cancel');
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
        showNotification(t('notify-complete-fields'), 'warning');
        return;
      }

      const termValue = modalTermEditor.getValue().trim();

      try {
        // Get the selected formula (either from dropdown or custom editor)
        let formulaValue = formulaSelect.value;
        if (formulaValue === 'My formula') {
          formulaValue = customEditor ? customEditor.getValue() : '';
          if (!formulaValue.trim()) {
            showNotification(t('notify-enter-custom-formula'), 'warning');
            return;
          }
          if (editorMonaco.hasEditorErrors(customEditor)) {
            showNotification(t('notify-syntax-errors-custom'), 'error');
            return;
          }
        }

        // Validate the formula structure for existential quantifier
        try {
          const parsedValue = getProof(deductive.checkWithAntlr(formulaValue));
          console.log(parsedValue);
          if (parsedValue.type !== 'exists') {
            showNotification(t('notify-must-be-exists'), 'error');
            return;
          }
        } catch (e) {
          console.warn("Formula parsing error:", e);
          showNotification(t('notify-invalid-format'), 'error');
          return;
        }

        // Additional syntax validation for the replacement term
        try {
          deductive.checkWithAntlr(termValue);
        } catch (parseError) {
          showNotification(t('notify-invalid-syntax-term'), 'error');
          termEditorContainer.classList.add('editor-error');
          return;
        }

        // Enhanced freshness check for rule 17 (∃-elimination backwards / ∃-introduction backwards)
        if (currentLevel === 17) {
          const checkFresh = deductive.checkWithAntlr(termValue);
          const hypothesesAll = deductive.getAllHypotheses(side, side);
          
          // Get all constants/variables from the replacement term
          const freshTerms = deductive.extractConstantsOrVariables(checkFresh);
          
          let isFresh = true;
          let conflictingTerm = "";

          // 1. Check if any term from replacement appears in hypotheses (Γ)
          for (const hyp of hypothesesAll) {
            // hyp is already a parsed object from getAllHypotheses
            const hypTerms = deductive.extractFreeVariables(hyp);
            for (const term of freshTerms) {
              if (hypTerms.includes(term)) {
                isFresh = false;
                conflictingTerm = term;
                break;
              }
            }
            if (!isFresh) break;
          }

          // 2. Check if any term from replacement appears in the current goal formula (ψ)
          if (isFresh && side) {
            const goalText = side.querySelector('#proofText')?.textContent;
            const goalParsed = deductive.checkWithAntlr(goalText);
            const goalTerms = deductive.extractFreeVariables(goalParsed);
            for (const term of freshTerms) {
              if (goalTerms.includes(term)) {
                isFresh = false;
                conflictingTerm = term;
                break;
              }
            }
          }
          
          // 3. Check if any term from replacement appears in the existential formula (∃x φ)
          if (isFresh) {
             const existsParsed = deductive.checkWithAntlr(formulaValue);
             const existsTerms = deductive.extractFreeVariables(existsParsed);
             for (const term of freshTerms) {
               if (existsTerms.includes(term)) {
                 isFresh = false;
                 conflictingTerm = term;
                 break;
               }
             }
          }

          if (!isFresh) {
            showNotification(t('notify-term-not-fresh').includes('{term}') 
              ? t('notify-term-not-fresh').replace('{term}', conflictingTerm)
              : `${t('notify-term-not-fresh')} (${conflictingTerm})`, 'error');
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
        showNotification(t('notify-unexpected-error'), 'error');
      }
    });

    // Enhanced formula selection event handler
    formulaSelect.addEventListener('change', () => {
      const selectedValue = formulaSelect.value;

      if (selectedValue === 'My formula') {
        selectedFormula = customEditor ? customEditor.getValue().trim() : '';
        customEditorContainer.style.display = 'block';
        // Custom editor is already created during initialization
        if (customEditor) {
          // Trigger manual update of buttons if the editor has value
          const value = customEditor.getValue().trim();
          if (value) {
            try {
              const parsed = deductive.checkWithAntlr(value);
              const extracted = deductive.extractConstantsOrVariables(parsed);
              renderButtons(extracted);
            } catch (e) {
              renderButtons([]);
            }
          }
          // Focus the custom editor
          setTimeout(() => customEditor.focus(), 100);
        }
      } else if (selectedValue) {
        selectedFormula = selectedValue;
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
    myFormulaOption.textContent = t('modal-my-formula');
    myFormulaOption.setAttribute('data-i18n', 'modal-my-formula');
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
      
      // Use (∃x)P(x) as the default value as requested
      let initialValue = '(∃x)P(x)';

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

      // Set initial value after listener is attached
      customEditor.setValue(initialValue);
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
