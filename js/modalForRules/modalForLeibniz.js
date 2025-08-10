import * as monaco from 'monaco-editor';
import {checkRule} from "../index";
import {currentLevel, side} from "../GentzenProof";
import * as deductive from "../deductiveEngine";
import {createEditor, hasEditorErrors, clearEditorErrors, getEditorErrors} from "../monacoEditor";
import {has} from "mobx";

/**
 * Creates a modal for Leibniz rule operations
 * Allows users to select parts of a formula and replace them using Monaco editor
 * @param {Object} formula - The parsed formula object to make clickable
 * @param {string} formulaString - The string representation of the formula
 * @param {string} direction - The direction of the equality: 'a=b' or 'b=a'
 * @returns {Promise<Object>} Promise that resolves with selected element and replacement
 */
export function createModalForLeibniz(formula, formulaString, direction = 'a=b') {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!formula || !formulaString) {
      reject(new Error('No formula provided for Leibniz operation'));
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

    // Add CSS animation
    if (!document.getElementById('modal-animations')) {
      const style = document.createElement('style');
      style.id = 'modal-animations';
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
    modalTitle.textContent = 'Leibniz Rule - Select Formula Element';
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
    description.textContent = 'Click on any part of the formula below to select it for replacement:';
    Object.assign(description.style, {
      margin: '0',
      fontSize: '16px',
      color: '#666',
      textAlign: 'center',
      lineHeight: '1.5'
    });

    // Create formula container
    const formulaContainer = document.createElement('div');
    formulaContainer.className = 'formula-container';

    // Create clickable formula elements
    let selectedElement = null;
    let selectedPath = null;

    // Generate clickable formula
    const clickableFormula = generateClickableFormula(formula, formulaString, (element, path, text) => {
      // If clicking the same element, deselect it
      if (selectedElement === element) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
        selectedPath = null;
        selectedTextDisplay.textContent = 'No element selected';

        // Disable Monaco editor
        disableEditor();

        // Validate form to update button state
        validateForm();
        return;
      }

      // Deselect previous element
      if (selectedElement) {
        selectedElement.classList.remove('selected');
      }

      // Select new element
      selectedElement = element;
      selectedPath = path;
      element.classList.add('selected');

      // Update selected text display
      selectedTextDisplay.textContent = `Selected: ${text}`;

      // Enable Monaco editor
      enableEditor();

      // Validate form to update button state
      validateForm();
    });

    formulaContainer.appendChild(clickableFormula);

    // Create selected text display
    const selectedTextDisplay = document.createElement('div');
    selectedTextDisplay.textContent = 'No element selected';
    Object.assign(selectedTextDisplay.style, {
      fontSize: '24px',
      color: '#666',
      textAlign: 'center',
      fontStyle: 'italic',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '6px'
    });

    // Create Monaco editor container
    const editorLabel = document.createElement('label');
    editorLabel.textContent = 'Enter replacement (select a formula element first):';
    Object.assign(editorLabel.style, {
      fontSize: '16px',
      fontWeight: '600',
      color: '#6c757d'  // Grayed out initially
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

    // Create Monaco editor (initially disabled)
    let monacoEditor;
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
        const replacementNode = parseReplacementText(monacoEditor.getValue().trim());
        const modifiedFormula = replaceNodeAtPath(JSON.parse(JSON.stringify(formula)), selectedPath, replacementNode);
        const value = getNodeText(modifiedFormula);

        console.log(value);
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

    // Function to enable the editor when an element is selected
    function enableEditor() {
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
      monacoEditor.updateOptions({ readOnly: true });
      monacoEditor.setValue('');
      editorContainer.style.opacity = '0.6';
      editorContainer.style.pointerEvents = 'none';
      editorLabel.textContent = 'Enter replacement (select a formula element first):';
      editorLabel.style.color = '#6c757d';
    }

    // Form validation function
    function validateForm() {
      const hasSelectedElement = selectedPath !== null;
      const replacementNode = parseReplacementText(monacoEditor.getValue().trim());
      const modifiedFormula = replaceNodeAtPath(JSON.parse(JSON.stringify(formula)), selectedPath, replacementNode);
      const value = getNodeText(modifiedFormula);
      if(!value) return;
      let hasValidInput = value.length > 0;

      // Check for syntax errors
      if (hasValidInput) {
        // Clear any existing errors first
        clearEditorErrors(monacoEditor);

        // Run the grammar check
        const checkResult = checkRule(1, value, monacoEditor);
        hasValidInput = checkResult === 0;
      }

      const isValid = hasSelectedElement && hasValidInput;

      applyButton.disabled = !isValid;
      applyButton.style.opacity = isValid ? '1' : '0.6';
      applyButton.style.cursor = isValid ? 'pointer' : 'not-allowed';

      return isValid;
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
    applyButton.textContent = 'Apply Replacement';
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
        showNotification('Please complete all required fields with valid input.', 'warning');
        return;
      }

      const replacement = monacoEditor.getValue().trim();

      try {
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
        // Parse the replacement text to get the replacement node
        const replacementNode = parseReplacementText(replacement);

        // Create a copy of the original formula and perform the replacement
        const modifiedFormula = replaceNodeAtPath(JSON.parse(JSON.stringify(formula)), selectedPath, replacementNode);

        // Convert the modified formula back to string
        const modifiedFormulaString = getNodeText(modifiedFormula);

        // Get the original selected text
        const originalSelectedNode = getNodeAtPath(formula, selectedPath);
        const originalSelectedText = getNodeText(originalSelectedNode);

        // Create the right side based on direction
        let rightSide;
        if (direction === 'b=a') {
          rightSide = `${originalSelectedText}=${replacement}`;
        } else {
          // Default: 'a=b'
          rightSide = `${replacement}=${originalSelectedText}`;
        }

        const result = {
          left: modifiedFormulaString,
          right: rightSide
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
        console.error('Error in modal apply:', error);
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
    modal.appendChild(selectedTextDisplay);
    modal.appendChild(editorLabel);
    modal.appendChild(editorContainer);
    modal.appendChild(errorDisplay);
    modal.appendChild(actionContainer);

    // Append modal to overlay
    modalOverlay.appendChild(modal);

    // Append overlay to body
    document.body.appendChild(modalOverlay);

    // Focus management for accessibility - focus the modal itself initially
    setTimeout(() => {
      modal.focus();
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
 * Creates a clickable element for a formula node
 * @param {Object} node - The formula node
 * @param {Array} path - The path to this node in the formula tree
 * @param {Function} onElementClick - Callback function when an element is clicked
 * @returns {HTMLElement} The clickable element
 */
function createClickableElement(node, path, onElementClick) {
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
      break;

    case 'atom':
      content = node.value;
      break;

    case 'successor':
      childElements.push(document.createTextNode('s('));
      if (node.term) {
        childElements.push(createClickableElement(node.term, [...path, 'term'], onElementClick));
      }
      childElements.push(document.createTextNode(')'));
      break;

    case 'addition':
      if (node.left && node.right) {
        childElements.push(createClickableElement(node.left, [...path, 'left'], onElementClick));
        childElements.push(document.createTextNode('+'));
        childElements.push(createClickableElement(node.right, [...path, 'right'], onElementClick));
      }
      break;

    case 'multiplication':
      if (node.left && node.right) {
        childElements.push(createClickableElement(node.left, [...path, 'left'], onElementClick));
        childElements.push(document.createTextNode('*'));
        childElements.push(createClickableElement(node.right, [...path, 'right'], onElementClick));
      }
      break;

    case 'equality':
      if (node.left && node.right) {
        childElements.push(createClickableElement(node.left, [...path, 'left'], onElementClick));
        childElements.push(document.createTextNode('='));
        childElements.push(createClickableElement(node.right, [...path, 'right'], onElementClick));
      }
      break;

    case 'function':
      childElements.push(document.createTextNode((node.name || '') + '('));
      if (node.terms && Array.isArray(node.terms)) {
        node.terms.forEach((term, index) => {
          if (index > 0) childElements.push(document.createTextNode(', '));
          childElements.push(createClickableElement(term, [...path, 'terms', index], onElementClick));
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
            childElements.push(createClickableElement(term, [...path, 'terms', index], onElementClick));
          });
        }
        childElements.push(document.createTextNode(')'));
      }
      break;

    case 'parenthesis':
      childElements.push(document.createTextNode('('));
      if (node.value) {
        childElements.push(createClickableElement(node.value, [...path, 'value'], onElementClick));
      }
      childElements.push(document.createTextNode(')'));
      break;

    case 'negation':
      const negSymbols = '¬'.repeat(node.count || 1);
      content = negSymbols;
      if (node.operand) {
        childElements.push(createClickableElement(node.operand, [...path, 'operand'], onElementClick));
      }
      break;

    case 'conjunction':
    case 'disjunction':
    case 'implication':
      const op = node.type === 'conjunction' ? '∧' :
                 node.type === 'disjunction' ? '∨' : '⇒';

      if (node.left && node.right) {
        childElements.push(createClickableElement(node.left, [...path, 'left'], onElementClick));
        childElements.push(document.createTextNode(op));
        childElements.push(createClickableElement(node.right, [...path, 'right'], onElementClick));
      }
      break;

    case 'quantifier':
      childElements.push(document.createTextNode((node.quantifier || '') + (node.variable || '')));
      if (node.expression) {
        childElements.push(createClickableElement(node.expression, [...path, 'expression'], onElementClick));
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
    onElementClick(element, path, nodeText);
  });

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
 * Parses replacement text into a simple node structure
 * @param {string} replacementText - The replacement text entered by user
 * @returns {Object} A simple node representing the replacement
 */
function parseReplacementText(replacementText) {
  // For now, create a simple node structure
  // This could be enhanced to parse more complex expressions if needed
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

  // For more complex expressions, create a generic node
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
    return replacementNode;
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
    current[parseInt(lastKey)] = replacementNode;
  } else {
    current[lastKey] = replacementNode;
  }

  return formula;
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
