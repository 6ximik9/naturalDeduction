import * as monaco from 'monaco-editor';
import {checkRule} from "../index";
import {currentLevel, side} from "../GentzenProof";
import * as deductive from "../deductiveEngine";
import {createEditor, hasEditorErrors, clearEditorErrors, getEditorErrors} from "../monacoEditor";
import {convertToSuccessorNotation, convertWithFormatPreservation, applySmartConversion} from "./modalForLeibniz";
import {checkWithAntlr} from "../deductiveEngine";

/**
 * Creates an improved modal for universal quantifier elimination (∀-elimination)
 * Used in rule 16 for selecting replacement constants
 * @param {Array<string>} constants - Array of available constants for replacement (legacy)
 * @param {Object} formula - The parsed formula object to make clickable (new)
 * @param {string} formulaString - The string representation of the formula (new)
 * @returns {Promise<Array<string>>} Promise that resolves with selected constant or replacement
 */
export function createModalForReturn(constants, formula = null, formulaString = null) {
  return new Promise((resolve, reject) => {
    // Determine interface modes
    const hasConstants = constants && Array.isArray(constants) && constants.length > 0;
    const hasFormula = formula && formulaString;
    const useCombinedInterface = hasConstants && hasFormula;
    const useFormulaOnly = !hasConstants && hasFormula;
    const useConstantsOnly = hasConstants && !hasFormula;

    // Validate input - at least one interface must be available
    if (!hasConstants && !hasFormula) {
      reject(new Error('No constants or formula provided for selection'));
      return;
    }

    // Use enhanced conversion with format preservation
    const conversionResult = convertWithFormatPreservation(formulaString);
    formulaString = conversionResult.expression;
    formula = checkWithAntlr(formulaString);

    // Store original formats for smart conversion later
    const originalFormats = conversionResult.originalFormats;

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

    // Add CSS animation and formula styles
    if (!document.getElementById('modal-return-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-return-styles';
      style.textContent = `
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-20px) scale(0.95); }
        }
        .modal-button:focus { outline: 2px solid #007bff; outline-offset: 2px; }
        .formula-element {
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: inline-block;
          margin: 1px;
          position: relative;
        }
        .formula-element:hover {
          background-color: #e3f2fd;
          transform: scale(1.05);
        }
        .formula-element.selected {
          background-color: #2196f3;
          color: white;
          transform: scale(1.1);
        }
        .successor-annotation {
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #666;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 1px 4px;
          border-radius: 3px;
          border: 1px solid #ddd;
          pointer-events: none;
          font-weight: bold;
          min-width: 16px;
          text-align: center;
        }
        .formula-element.successor-element {
          margin-bottom: 22px; /* Add space for annotation */
          min-width: 60px; /* Ensure consistent spacing */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .number-annotation {
          pointer-events: none;
          user-select: none;
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

    // Create modal title with improved typography
    const modalTitle = document.createElement('h2');
    modalTitle.id = 'modal-title';
    let titleText = 'Selection Modal';
    if (useCombinedInterface) {
      titleText = 'Formula and Constant Selection';
    } else if (useFormulaOnly) {
      titleText = 'Formula Element Selection';
    } else if (useConstantsOnly) {
      titleText = 'Universal Quantifier Elimination (∀E)';
    }
    modalTitle.textContent = titleText;
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
    let descriptionText = '';
    if (useCombinedInterface) {
      descriptionText = 'Select constants and click on formula elements for replacement:';
    } else if (useFormulaOnly) {
      descriptionText = 'Click on any part of the formula below to select it for replacement:';
    } else if (useConstantsOnly) {
      descriptionText = 'Select a constant to replace the bound variable in the universal quantifier:';
    }
    description.textContent = descriptionText;
    Object.assign(description.style, {
      margin: '0',
      fontSize: '16px',
      color: '#666',
      textAlign: 'center',
      lineHeight: '1.5'
    });

    // Variables for selection state
    let activeButton = null;
    let selectedConstant = null;
    let selectedElement = null;
    let selectedPath = null;
    let selectedElements = new Set(); // For tracking multiple selections
    let monacoEditor = null;

    // Create button container (when constants are available)
    let buttonContainer = null;
    if (hasConstants) {
      buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      Object.assign(buttonContainer.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginTop: '16px'
      });
    }

    // Create formula container (when formula is available)
    let formulaContainer = null;
    let selectedTextDisplay = null;

    if (hasFormula) {
      // Create formula container
      formulaContainer = document.createElement('div');
      formulaContainer.className = 'formula-container';
      Object.assign(formulaContainer.style, {
        marginTop: hasConstants ? '24px' : '16px' // Add more space if buttons are above
      });

      // Generate clickable formula
      const clickableFormula = generateClickableFormula(formula, formulaString, handleElementClick);
      formulaContainer.appendChild(clickableFormula);

      // Create selected text display
      selectedTextDisplay = document.createElement('div');
      selectedTextDisplay.textContent = 'No element selected';
      Object.assign(selectedTextDisplay.style, {
        fontSize: '24px',
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '6px',
        marginTop: '16px'
      });
    }

    // Enhanced button state management function
    const updateButtonState = (targetButton, isActive, isHovered = false) => {
      // if (isActive) {
      //   Object.assign(targetButton.style, {
      //     backgroundColor: '#007bff',
      //     borderColor: '#007bff',
      //     color: '#fff',
      //     transform: 'translateY(-2px)',
      //     boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
      //   });
      // } else if (isHovered) {
      //   Object.assign(targetButton.style, {
      //     backgroundColor: '#e9ecef',
      //     borderColor: '#adb5bd',
      //     transform: 'translateY(-1px)',
      //     boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      //   });
      // } else {
      //   Object.assign(targetButton.style, {
      //     backgroundColor: '#f8f9fa',
      //     borderColor: '#e0e0e0',
      //     color: '#495057',
      //     transform: 'translateY(0)',
      //     boxShadow: 'none'
      //   });
      // }
    };

    // Element click handler for formula interface
    function handleElementClick(element, path, text) {
      // In combined interface, clicking formula elements does NOT deselect buttons
      // We want to keep both the button selection and formula element selection
      // Only in formula-only mode should we clear button state
      if (activeButton) {
        updateButtonState(activeButton, false);
        activeButton = null;
        selectedConstant = null;
      }

      // If clicking the same element, deselect it (check this first)
      if (selectedElements.has(JSON.stringify(path))) {
        element.classList.remove('selected');
        selectedElements.delete(JSON.stringify(path));

        if (selectedElements.size === 0) {
          selectedElement = null;
          selectedPath = null;
          selectedTextDisplay.textContent = 'No element selected';
          disableEditor();
        } else {
          // Update display with remaining selections
          updateSelectedDisplay();
        }

        updateElementStates();
        validateForm();
        return;
      }

      // Check if this element can be selected based on current selections
      if (!canSelectElement(path)) {
        return; // Cannot select this element
      }

      // Add to selection
      selectedElements.add(JSON.stringify(path));
      element.classList.add('selected');

      // Set primary selection (for editor purposes)
      selectedElement = element;
      selectedPath = path;

      updateSelectedDisplay();
      updateElementStates();
      enableEditor();
      validateForm();
    }

    // Check if an element can be selected based on current selections
    function canSelectElement(path) {
      if (selectedElements.size === 0) return true;

      // Convert current selections to paths for comparison
      const currentPaths = Array.from(selectedElements).map(p => JSON.parse(p));

      // Check if this path conflicts with any existing selection
      for (const existingPath of currentPaths) {
        if (isPathConflict(path, existingPath)) {
          return false;
        }
      }

      return true;
    }

    // Check if two paths conflict (one is ancestor/descendant of the other)
    function isPathConflict(path1, path2) {
      // Check if path1 is ancestor of path2
      if (path1.length < path2.length) {
        for (let i = 0; i < path1.length; i++) {
          if (path1[i] !== path2[i]) return false;
        }
        return true; // path1 is ancestor of path2
      }

      // Check if path2 is ancestor of path1
      if (path2.length < path1.length) {
        for (let i = 0; i < path2.length; i++) {
          if (path1[i] !== path2[i]) return false;
        }
        return true; // path2 is ancestor of path1
      }

      // Same length - check if they're the same path
      return JSON.stringify(path1) === JSON.stringify(path2);
    }

    // Update the display of selected elements
    function updateSelectedDisplay() {
      if (selectedElements.size === 0) {
        selectedTextDisplay.textContent = 'No element selected';
        return;
      }

      const selectedTexts = Array.from(selectedElements).map(pathStr => {
        const path = JSON.parse(pathStr);
        const node = getNodeAtPath(formula, path);
        return getNodeText(node);
      });

      selectedTextDisplay.textContent = `Selected: ${selectedTexts.join(', ')}`;
    }

    // Update element states (enable/disable based on selection rules)
    function updateElementStates() {
      if (!formulaContainer) return;
      const allElements = formulaContainer.querySelectorAll('.formula-element');

      allElements.forEach(element => {
        const path = JSON.parse(element.dataset.path);

        if (selectedElements.has(JSON.stringify(path))) {
          // This element is selected
          element.classList.remove('disabled');
          return;
        }

        if (canSelectElement(path)) {
          // This element can be selected
          element.classList.remove('disabled');
        } else {
          // This element cannot be selected
          element.classList.add('disabled');
        }
      });
    }

    // Generate buttons based on constants with improved interaction
    if (hasConstants) {
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

      // Enhanced hover and focus effects using the shared updateButtonState function

      button.addEventListener('mouseenter', () => updateButtonState(button, button === activeButton, true));
      button.addEventListener('mouseleave', () => updateButtonState(button, button === activeButton, false));

      button.addEventListener('click', () => {
        // In combined interface, do NOT clear formula selections when button is clicked
        // We want to allow both button and formula selections simultaneously
        // Only clear formula selections in formula-only mode

        clearFormulaSelections();

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

        // Validate form to update save button state
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
    }

    // Clear formula selections helper
    function clearFormulaSelections() {
      if (!hasFormula) return;

      selectedElements.clear();
      selectedElement = null;
      selectedPath = null;

      // Remove selected class from all elements
      const allElements = formulaContainer.querySelectorAll('.formula-element');
      allElements.forEach(el => {
        el.classList.remove('selected', 'disabled');
      });

      selectedTextDisplay.textContent = 'No element selected';
      disableEditor();
    }

    // Create Monaco editor container (when formula is available)
    let editorLabel = null;
    let editorContainer = null;
    let errorDisplay = null;

    if (hasFormula) {
      editorLabel = document.createElement('label');
      editorLabel.textContent = 'Enter replacement (select a formula element first):';
      Object.assign(editorLabel.style, {
        fontSize: '16px',
        fontWeight: '600',
        color: '#6c757d',  // Grayed out initially
        marginTop: '16px'
      });

      editorContainer = document.createElement('div');
      editorContainer.className = 'editor-container';
      Object.assign(editorContainer.style, {
        height: '150px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: '4px',
        backgroundColor: '#fff',
        transition: 'border-color 0.2s ease',
        marginTop: '8px'
      });

      // Create Monaco editor (initially disabled)
      try {
        monacoEditor = createEditor(editorContainer);
        monacoEditor.setValue('');
        monacoEditor.updateOptions({
          fontSize: 24,
          lineHeight: 1.4,
          padding: { top: 8, bottom: 8 },
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          readOnly: true  // Initially disabled
        });
      } catch (error) {
        console.warn('Could not create modal editor:', error);
        throw new Error('Failed to initialize Monaco editor');
      }

      // Add disabled styling to editor container
      editorContainer.style.opacity = '0.6';
      editorContainer.style.pointerEvents = 'none';

      // Error display
      errorDisplay = document.createElement('div');
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
          const replacementNode = parseReplacementText(monacoEditor.getValue().trim());
          const modifiedFormula = replaceNodeAtPath(JSON.parse(JSON.stringify(formula)), selectedPath, replacementNode);
          const value = getNodeText(modifiedFormula);
          if(!value) return;
          // const value = monacoEditor.getValue().trim();
          let hasErrors = false;
          let errorMessage = '';

          // Check for syntax errors using the same validation as the main editor
          if (value.length > 0) {
            // Clear any existing errors first
            clearEditorErrors(monacoEditor);

            // Run the grammar check which will set specific error markers
            const checkResult = checkRule(1, value, monacoEditor);

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

          console.log(hasErrors);
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
    }

    // Function to enable the editor when an element is selected
    function enableEditor() {
      if (!hasFormula || !monacoEditor) return;

      monacoEditor.updateOptions({ readOnly: false });
      editorContainer.style.opacity = '1';
      editorContainer.style.pointerEvents = 'auto';
      editorLabel.textContent = 'Enter replacement:';
      editorLabel.style.color = '#2c3e50';

      // Focus the editor
      setTimeout(() => {
        monacoEditor.focus();
      }, 100);
    }

    // Function to disable the editor
    function disableEditor() {
      if (!hasFormula || !monacoEditor) return;

      monacoEditor.updateOptions({ readOnly: true });
      monacoEditor.setValue('');
      editorContainer.style.opacity = '0.6';
      editorContainer.style.pointerEvents = 'none';
      editorLabel.textContent = 'Enter replacement (select a formula element first):';
      editorLabel.style.color = '#6c757d';
    }

    // Form validation function
    function validateForm() {
      let isValid = false;

      if (useCombinedInterface) {
        // Combined interface - can be valid in multiple scenarios:
        // 1. Only constant selected (can confirm with just constant)
        // 2. Only formula elements selected with valid replacement input
        // 3. Both constant and formula elements selected with valid replacement input
        const hasSelectedConstant = selectedConstant !== null;
        const hasSelectedElement = selectedElements.size > 0;

        if (hasSelectedConstant && !hasSelectedElement) {
          // Only constant selected - this is valid for confirmation
          isValid = true;
        } else if (hasSelectedElement) {
          // Formula elements selected (with or without constant) - need valid replacement input
          let hasValidInput = true;

          if (monacoEditor) {
            const replacementNode = parseReplacementText(monacoEditor.getValue().trim());
            const modifiedFormula = replaceNodeAtPath(JSON.parse(JSON.stringify(formula)), selectedPath, replacementNode);
            const value = getNodeText(modifiedFormula);
            // if(!value) return;
            // const value = monacoEditor.getValue().trim();
            hasValidInput = value.length > 0;

            // Check for syntax errors
            if (hasValidInput) {
              clearEditorErrors(monacoEditor);
              const checkResult = checkRule(1, value, monacoEditor);
              hasValidInput = checkResult === 0;
            }
          }

          isValid = hasValidInput;
        }
      } else if (useFormulaOnly) {
        // Formula only interface - need formula selection with valid input
        const hasSelectedElement = selectedElements.size > 0;
        let hasValidInput = true;

        if (hasSelectedElement && monacoEditor) {
          const replacementNode = parseReplacementText(monacoEditor.getValue().trim());
          const modifiedFormula = replaceNodeAtPath(JSON.parse(JSON.stringify(formula)), selectedPath, replacementNode);
          const value = getNodeText(modifiedFormula);
          if(!value) return;
          // const value = monacoEditor.getValue().trim();
          hasValidInput = value.length > 0;

          // Check for syntax errors
          if (hasValidInput) {
            clearEditorErrors(monacoEditor);
            const checkResult = checkRule(1, value, monacoEditor);
            hasValidInput = checkResult === 0;
          }
        }

        isValid = hasSelectedElement && hasValidInput;
      } else if (useConstantsOnly) {
        // Constants only interface - just check if a constant is selected
        isValid = selectedConstant !== null;
      }

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
      if (!validateForm()) {
        showNotification('Please complete all required fields with valid input.', 'warning');
        return;
      }

      try {
        let result;

        if (useCombinedInterface) {
          // Combined interface - handle different scenarios
          const hasSelectedElement = selectedElements.size > 0;
          const hasSelectedConstant = selectedConstant !== null;

          if (hasSelectedConstant && !hasSelectedElement) {
            // Only constant selected - apply constant replacement to entire formula
            const modifiedFormula = applyConstantReplacement(formula, formulaString, selectedConstant);
            result = {
              selectedConstant: selectedConstant,
              modifiedFormula: modifiedFormula,
              originalFormula: formulaString,
            };
          } else if (hasSelectedElement) {
            // Formula elements selected (with or without constant) - apply both replacements
            const replacement = monacoEditor.getValue().trim();

            // Additional syntax validation
            try {
              const replacementNode = parseReplacementText(monacoEditor.getValue().trim());
              const modifiedFormula = replaceNodeAtPath(JSON.parse(JSON.stringify(formula)), selectedPath, replacementNode);
              const value = getNodeText(modifiedFormula);
              deductive.checkWithAntlr(value);
            } catch (parseError) {
              showNotification('Invalid syntax in the replacement term. Please check your input.', 'error');
              editorContainer.classList.add('editor-error');
              return;
            }

            // Apply both constant replacement and element replacement
            let modifiedFormula = formulaString;

            // First apply constant replacement if a constant is selected
            if (selectedConstant) {
              modifiedFormula = applyConstantReplacement(formula, formulaString, selectedConstant);
            }

            // Then apply element replacements on top of the constant-replaced formula
            // We need to re-parse the formula after constant replacement
            let workingFormula = formula;
            if (selectedConstant) {
              // Create a formula with constant replacements applied
              workingFormula = JSON.parse(JSON.stringify(formula));
              const parts = selectedConstant.split('/');
              if (parts.length === 2) {
                const [oldConstant, newConstant] = parts;
                const replacementNode = { type: 'constant', value: newConstant };
                replaceAllConstantOccurrences(workingFormula, oldConstant, replacementNode);
              }
            }

            // Apply element replacements
            modifiedFormula = applyReplacements(workingFormula, modifiedFormula, selectedElements, replacement);

            result = {
              selectedConstant: selectedConstant, // Always include, even if null
              modifiedFormula: modifiedFormula,
              originalFormula: formulaString,
              replacement: replacement,
              selectedElements: Array.from(selectedElements).map(pathStr => {
                const path = JSON.parse(pathStr);
                const node = getNodeAtPath(formula, path);
                return getNodeText(node);
              })
            };
          }
        } else if (useFormulaOnly) {
          // Formula only interface - apply replacements and return modified formula
          const replacement = monacoEditor.getValue().trim();

          // Additional syntax validation
          try {
            const replacementNode = parseReplacementText(monacoEditor.getValue().trim());
            const modifiedFormula = replaceNodeAtPath(JSON.parse(JSON.stringify(formula)), selectedPath, replacementNode);
            const value = getNodeText(modifiedFormula);
            deductive.checkWithAntlr(value);
            // deductive.checkWithAntlr(replacement);
          } catch (parseError) {
            showNotification('Invalid syntax in the replacement term. Please check your input.', 'error');
            editorContainer.classList.add('editor-error');
            return;
          }

          // Apply replacements to create modified formula
          const modifiedFormula = applyReplacements(formula, formulaString, selectedElements, replacement);

          result = {
            modifiedFormula: modifiedFormula,
            originalFormula: formulaString,
            replacement: replacement,
            selectedElements: Array.from(selectedElements).map(pathStr => {
              const path = JSON.parse(pathStr);
              const node = getNodeAtPath(formula, path);
              return getNodeText(node);
            })
          };
        } else if (useConstantsOnly) {
          // Constants only interface - apply constant replacement if formula is available
          if (formula && formulaString) {
            const modifiedFormula = applyConstantReplacement(formula, formulaString, selectedConstant);
            result = {
              selectedConstant: selectedConstant,
              modifiedFormula: modifiedFormula,
              originalFormula: formulaString
            };
          } else {
            // Legacy format when no formula is available
            result = [selectedConstant];
          }
        }

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

    // Add button container if constants are available
    if (hasConstants) {
      modal.appendChild(buttonContainer);
    }

    // Add formula interface if formula is available
    if (hasFormula) {
      modal.appendChild(formulaContainer);
      modal.appendChild(selectedTextDisplay);
      modal.appendChild(editorLabel);
      modal.appendChild(editorContainer);
      modal.appendChild(errorDisplay);
    }

    modal.appendChild(actionContainer);

    // Append modal to overlay
    modalOverlay.appendChild(modal);

    // Append overlay to body and focus first button
    document.body.appendChild(modalOverlay);

    // Focus management for accessibility
    setTimeout(() => {
      if (hasConstants) {
        const firstButton = buttonContainer.querySelector('button');
        if (firstButton) {
          firstButton.focus();
        }
      } else if (hasFormula) {
        modal.focus();
      }
    }, 100);

    // Initial validation
    validateForm();

    // Click outside to close
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  });
}

/**
 * Generates a clickable formula representation from a parsed formula object
 * @param {Object} formula - The parsed formula object
 * @param {string} formulaString - The string representation of the formula
 * @param {Function} onElementClick - Callback function when an element is clicked
 * @returns {HTMLElement} The clickable formula element
 */
function generateClickableFormula(formula, formulaString, onElementClick) {
  const container = document.createElement('div');

  // Generate clickable elements recursively
  const clickableElement = createClickableElement(formula, [], onElementClick);
  container.appendChild(clickableElement);

  return container;
}

/**
 * Calculates the numeric value of a successor expression
 * @param {Object} node - The successor node
 * @returns {number|null} The numeric value, or null if not a valid successor expression
 */
function calculateSuccessorValue(node) {
  if (node.type !== 'successor') return null;

  let count = 0;
  let current = node;

  // Count nested successors
  while (current && current.type === 'successor') {
    count++;
    current = current.term;
  }

  // Check if we end up with 0 (number node with value '0')
  if (current &&
      ((current.type === 'number' && current.value === '0') ||
       (current.type === 'constant' && current.value === '0'))) {
    return count;
  }

  return null;
}

/**
 * Creates a clickable element for a formula node
 * @param {Object} node - The formula node
 * @param {Array} path - The path to this node in the formula tree
 * @param {Function} onElementClick - Callback function when an element is clicked
 * @param {boolean} isNestedSuccessor - Whether this is a nested successor element
 * @returns {HTMLElement} The clickable element
 */
function createClickableElement(node, path, onElementClick, isNestedSuccessor = false) {
  if (!node) return document.createTextNode('');

  const element = document.createElement('span');
  element.className = 'formula-element';

  // Store the path and node data
  element.dataset.path = JSON.stringify(path);
  element.dataset.nodeType = node.type;

  let content = '';
  let childElements = [];

  switch (node.type) {
    case 'constant':
    case 'variable':
    case 'number':
      content = node.value || node.name;
      // Add debug info for zero and other single characters
      if (content === '0' || content === '1' || content === '2') {
        console.log(`Creating clickable element for "${content}" (type: ${node.type}, path: [${path.join(', ')}])`);
      }
      break;

    case 'atom':
      content = node.value;
      break;

    case 'successor':
      // Add successor-element class for proper spacing only if not nested
      if (!isNestedSuccessor) {
        element.classList.add('successor-element');
      }

      childElements.push(document.createTextNode('s('));
      if (node.term) {
        // Mark nested successors so they don't get annotations
        const childIsNestedSuccessor = node.term.type === 'successor';
        childElements.push(createClickableElement(node.term, [...path, 'term'], onElementClick, childIsNestedSuccessor));
      }
      childElements.push(document.createTextNode(')'));

      // Only add numeric annotation for outermost successor elements
      if (!isNestedSuccessor) {
        const numericValue = calculateSuccessorValue(node);
        if (numericValue !== null) {
          const annotation = document.createElement('span');
          annotation.className = 'successor-annotation number-annotation';
          annotation.textContent = numericValue.toString();
          childElements.push(annotation);
        }
      }
      break;

    case 'addition':
      if (node.left && node.right) {
        childElements.push(createClickableElement(node.left, [...path, 'left'], onElementClick, false));
        childElements.push(document.createTextNode('+'));
        childElements.push(createClickableElement(node.right, [...path, 'right'], onElementClick, false));
      }
      break;

    case 'multiplication':
      if (node.left && node.right) {
        childElements.push(createClickableElement(node.left, [...path, 'left'], onElementClick, false));
        childElements.push(document.createTextNode('*'));
        childElements.push(createClickableElement(node.right, [...path, 'right'], onElementClick, false));
      }
      break;

    case 'equality':
      if (node.left && node.right) {
        childElements.push(createClickableElement(node.left, [...path, 'left'], onElementClick, false));
        childElements.push(document.createTextNode('='));
        childElements.push(createClickableElement(node.right, [...path, 'right'], onElementClick, false));
      }
      break;

    case 'function':
      childElements.push(document.createTextNode((node.name || '') + '('));
      if (node.terms && Array.isArray(node.terms)) {
        node.terms.forEach((term, index) => {
          if (index > 0) childElements.push(document.createTextNode(', '));
          childElements.push(createClickableElement(term, [...path, 'terms', index], onElementClick, false));
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
            childElements.push(createClickableElement(term, [...path, 'terms', index], onElementClick, false));
          });
        }
        childElements.push(document.createTextNode(')'));
      }
      break;

    case 'parenthesis':
      childElements.push(document.createTextNode('('));
      if (node.value) {
        childElements.push(createClickableElement(node.value, [...path, 'value'], onElementClick, false));
      }
      childElements.push(document.createTextNode(')'));
      break;

    case 'negation':
      const negSymbols = '¬'.repeat(node.count || 1);
      content = negSymbols;
      if (node.operand) {
        childElements.push(createClickableElement(node.operand, [...path, 'operand'], onElementClick, false));
      }
      break;

    case 'conjunction':
    case 'disjunction':
    case 'implication':
      const op = node.type === 'conjunction' ? '∧' :
                 node.type === 'disjunction' ? '∨' : '⇒';

      if (node.left && node.right) {
        childElements.push(createClickableElement(node.left, [...path, 'left'], onElementClick, false));
        childElements.push(document.createTextNode(op));
        childElements.push(createClickableElement(node.right, [...path, 'right'], onElementClick, false));
      }
      break;

    case 'forall':
    case 'exists':
      const quantSymbol = node.type === 'forall' ? '∀' : '∃';
      childElements.push(document.createTextNode(quantSymbol + node.variable + ' '));
      if (node.operand) {
        childElements.push(createClickableElement(node.operand, [...path, 'operand'], onElementClick, false));
      }
      break;

    case 'quantifier':
      childElements.push(document.createTextNode((node.quantifier || '') + (node.variable || '') + ' '));
      if (node.expression) {
        childElements.push(createClickableElement(node.expression, [...path, 'expression'], onElementClick, false));
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

  // Add click handler
  element.addEventListener('click', (e) => {
    e.stopPropagation();
    const nodeText = getNodeText(node);
    // Debug logging for number clicks
    if (nodeText === '0' || nodeText === '1' || nodeText === '2') {
      console.log(`Clicked on "${nodeText}" (type: ${node.type}, path: [${path.join(', ')}])`);
    }
    onElementClick(element, path, nodeText);
  });

  // Add a title attribute for better accessibility and debugging
  if (content) {
    element.title = `Click to select "${content}" (${node.type})`;
  }

  return element;
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

/**
 * Gets a node at the specified path in the formula tree
 * @param {Object} formula - The formula object
 * @param {Array} path - The path to the node
 * @returns {Object} The node at the specified path
 */
function getNodeAtPath(formula, path) {
  if (!path || path.length === 0) {
    return formula;
  }

  let current = formula;

  // Navigate to the target node
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (current[key] === undefined) {
      throw new Error(`Invalid path: ${key} not found`);
    }
    current = current[key];
  }

  return current;
}

/**
 * Applies replacements to selected elements in a formula and returns the modified formula string
 * @param {Object} formula - The original parsed formula object
 * @param {string} formulaString - The original formula string
 * @param {Set} selectedElements - Set of selected element paths (as JSON strings)
 * @param {string} replacement - The replacement text
 * @returns {string} The modified formula string with replacements applied
 */
function applyReplacements(formula, formulaString, selectedElements, replacement) {
  // Create a deep copy of the formula to avoid modifying the original
  const formulaCopy = JSON.parse(JSON.stringify(formula));

  // Parse the replacement text into a node structure
  const replacementNode = parseReplacementText(replacement);

  // Convert selected element paths back to arrays and sort by depth (deepest first)
  // This ensures we replace child elements before parent elements
  const selectedPaths = Array.from(selectedElements)
    .map(pathStr => JSON.parse(pathStr))
    .sort((a, b) => b.length - a.length);

  // Apply each replacement
  selectedPaths.forEach(path => {
    try {
      replaceNodeAtPath(formulaCopy, path, replacementNode);
    } catch (error) {
      console.warn('Failed to replace node at path:', path, error);
    }
  });

  // Convert the modified formula back to string
  return getNodeText(formulaCopy);
}

/**
 * Parses replacement text into a simple node structure
 * @param {string} replacementText - The replacement text entered by user
 * @returns {Object} A simple node representing the replacement
 */
function parseReplacementText(replacementText) {
  const trimmed = replacementText.trim();

  // Check if it's a successor function like s(0), s(s(0)), etc.
  if (trimmed.startsWith('s(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(2, -1);
    return {
      type: 'successor',
      term: parseReplacementText(inner)
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
 * Replaces a node at the specified path in the formula tree
 * @param {Object} formula - The formula object (will be modified)
 * @param {Array} path - The path to the node to replace
 * @param {Object} replacementNode - The node to replace with
 * @returns {Object} The modified formula
 */
function replaceNodeAtPath(formula, path, replacementNode) {
  if (!path || path.length === 0) {
    // Replace the entire formula
    Object.keys(formula).forEach(key => delete formula[key]);
    Object.assign(formula, JSON.parse(JSON.stringify(replacementNode)));
    return formula;
  }

  let current = formula;

  // Navigate to the parent of the target node
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current[key] === undefined) {
      throw new Error(`Invalid path: ${key} not found`);
    }
    current = current[key];
  }

  // Replace the target node
  const lastKey = path[path.length - 1];
  if (Array.isArray(current) && !isNaN(lastKey)) {
    current[parseInt(lastKey)] = JSON.parse(JSON.stringify(replacementNode));
  } else {
    current[lastKey] = JSON.parse(JSON.stringify(replacementNode));
  }

  return formula;
}

/**
 * Applies constant replacement throughout the entire formula
 * @param {Object} formula - The original parsed formula object
 * @param {string} formulaString - The original formula string
 * @param {string} constantReplacement - The constant replacement in format "old/new" (e.g., "x/g")
 * @returns {string} The modified formula string with all constant replacements applied
 */
function applyConstantReplacement(formula, formulaString, constantReplacement) {
  // Parse the constant replacement (format: "old/new")
  const parts = constantReplacement.split('/');
  if (parts.length !== 2) {
    // If not in expected format, return original formula
    console.warn('Invalid constant replacement format:', constantReplacement);
    return formulaString;
  }

  console.log(parts);

  const [ newConstant, oldConstant] = parts;

  // Create a deep copy of the formula to avoid modifying the original
  const formulaCopy = JSON.parse(JSON.stringify(formula));

  // Create replacement node for the new constant
  const replacementNode = {
    type: 'constant',
    value: newConstant
  };

  // Recursively replace all occurrences of the old constant
  replaceAllConstantOccurrences(formulaCopy, oldConstant, replacementNode);

  // Convert the modified formula back to string
  return getNodeText(formulaCopy);
}

/**
 * Recursively replaces all occurrences of a constant in a formula tree
 * @param {Object} node - The current node being processed
 * @param {string} oldConstant - The constant to replace
 * @param {Object} replacementNode - The replacement node
 */
function replaceAllConstantOccurrences(node, oldConstant, replacementNode) {
  if (!node || typeof node !== 'object') return;

  // If this is a constant/variable node that matches our target, replace it
  if ((node.type === 'constant' || node.type === 'variable') &&
      (node.value === oldConstant || node.name === oldConstant)) {
    // Replace the properties of this node with the replacement node
    Object.keys(node).forEach(key => delete node[key]);
    Object.assign(node, JSON.parse(JSON.stringify(replacementNode)));
    return;
  }

  // Recursively process all properties
  for (let key in node) {
    if (node.hasOwnProperty(key)) {
      if (Array.isArray(node[key])) {
        // Handle arrays (like terms, operands)
        node[key].forEach(item => replaceAllConstantOccurrences(item, oldConstant, replacementNode));
      } else if (typeof node[key] === 'object' && node[key] !== null) {
        replaceAllConstantOccurrences(node[key], oldConstant, replacementNode);
      }
    }
  }
}
