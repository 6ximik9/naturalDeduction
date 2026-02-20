import * as monaco from 'monaco-editor';
import * as editorMonaco from '../monacoEditor';
import {checkRule} from "../../index";
import * as deductive from "../../core/deductiveEngine";
import {t} from "../../core/i18n";

/**
 * Creates a simple modal for inputting a term
 * Used for rules like Identity Introduction (= I)
 * @param {string} title - Modal title
 * @param {string} label - Input label
 * @returns {Promise<string>} Promise that resolves with the entered term
 */
export function createInputModal(title = t('modal-input-title-default'), label = t('modal-input-label-default')) {
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
      zIndex: '1000',
      backdropFilter: 'blur(2px)'
    });

    // Create modal container
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

    // Add styles if needed (reusing existing animations if present)
    if (!document.getElementById('input-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'input-modal-styles';
      style.textContent = `
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-20px) scale(0.95); }
        }
        .editor-container { border: 2px solid #e0e0e0; border-radius: 8px; transition: border-color 0.2s ease; }
        .editor-container:focus-within { border-color: #007bff; }
        .editor-error { border-color: #dc3545 !important; }
      `;
      document.head.appendChild(style);
    }

    // Modal Title
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = title;
    Object.assign(modalTitle.style, {
      margin: '0',
      fontSize: '28px',
      fontWeight: '600',
      textAlign: 'center',
      color: '#2c3e50'
    });

    // Input Label
    const inputLabel = document.createElement('label');
    inputLabel.textContent = label;
    Object.assign(inputLabel.style, {
      display: 'block',
      fontSize: '16px',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '8px'
    });

    // Editor Container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    Object.assign(editorContainer.style, {
      height: '100px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      padding: '4px',
      backgroundColor: '#fff'
    });

    const modalEditorContainer = document.createElement('div');
    Object.assign(modalEditorContainer.style, {
      width: '100%',
      height: '100%',
      borderRadius: '6px'
    });
    editorContainer.appendChild(modalEditorContainer);

    // Initialize Monaco Editor
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
      console.warn('Fallback to main editor not supported for simple input modal', error);
    }

    // Error Display
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

    // Validation
    const validate = () => {
      const value = modalEditor.getValue().trim();
      let isValid = value.length > 0;

      if (isValid) {
        editorMonaco.clearEditorErrors(modalEditor);
        if (checkRule(1, value, modalEditor) !== 0) {
          isValid = false;
          editorContainer.classList.add('editor-error');
          errorDisplay.textContent = t('modal-invalid-syntax');
          errorDisplay.style.display = 'block';
        } else {
          editorContainer.classList.remove('editor-error');
          errorDisplay.style.display = 'none';
        }
      }

      saveButton.disabled = !isValid;
      saveButton.style.opacity = isValid ? '1' : '0.6';
      saveButton.style.cursor = isValid ? 'pointer' : 'not-allowed';
      return isValid;
    };

    modalEditor.onDidChangeModelContent(validate);

    // Buttons
    const actionContainer = document.createElement('div');
    Object.assign(actionContainer.style, { display: 'flex', gap: '12px', marginTop: '24px' });

    const saveButton = document.createElement('button');
    saveButton.textContent = t('modal-btn-apply');
    saveButton.disabled = true;
    Object.assign(saveButton.style, {
      flex: '1',
      padding: '16px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'not-allowed',
      opacity: '0.6',
      transition: 'all 0.2s ease'
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = t('modal-btn-cancel');
    Object.assign(cancelButton.style, {
      padding: '16px 24px',
      backgroundColor: '#6c757d',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    });

    // Close function
    const closeModal = () => {
      modalOverlay.style.animation = 'modalSlideOut 0.2s ease-in forwards';
      setTimeout(() => {
        if (modalOverlay.parentNode) modalOverlay.parentNode.removeChild(modalOverlay);
        modalEditor.dispose();
        reject(new Error('Cancelled'));
      }, 200);
    };

    saveButton.addEventListener('click', () => {
      if (validate()) {
        const result = modalEditor.getValue().trim();
        modalOverlay.style.animation = 'modalSlideOut 0.2s ease-in forwards';
        setTimeout(() => {
          if (modalOverlay.parentNode) modalOverlay.parentNode.removeChild(modalOverlay);
          modalEditor.dispose();
          resolve(result);
        }, 200);
      }
    });

    cancelButton.addEventListener('click', closeModal);

    // Assemble
    modal.appendChild(modalTitle);
    modal.appendChild(inputLabel);
    modal.appendChild(editorContainer);
    modal.appendChild(errorDisplay);
    actionContainer.appendChild(cancelButton);
    actionContainer.appendChild(saveButton);
    modal.appendChild(actionContainer);
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    setTimeout(() => modalEditor.focus(), 100);
  });
}
