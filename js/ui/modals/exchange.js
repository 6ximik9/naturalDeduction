import * as deductive from '../../core/deductiveEngine.js';

/**
 * Creates a modal for reordering formulas (Exchange rule)
 * Allows users to drag and drop formulas horizontally to reorder them
 * @param {string} title - Modal title (e.g., "Exchange Left")
 * @param {Array<Object>} formulas - Array of formula objects to reorder
 * @returns {Promise<Array<Object>>} Promise that resolves with the reordered array of formulas
 */
export function createExchangeModal(title, formulas) {
    return new Promise((resolve, reject) => {
        // Clone formulas to work with a local copy
        let currentFormulas = [...formulas];

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
            maxWidth: '800px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative',
            animation: 'modalSlideIn 0.3s ease-out'
        });

        // Add styles for horizontal drag and drop
        if (!document.getElementById('exchange-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'exchange-modal-styles';
            style.textContent = `
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes modalSlideOut {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to { opacity: 0; transform: translateY(-20px) scale(0.95); }
                }
                .formula-list {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                    padding: 16px;
                    border: 2px dashed #e0e0e0;
                    border-radius: 8px;
                    background-color: #fafafa;
                    min-height: 80px;
                }
                .formula-item {
                    background-color: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    padding: 4px 12px;
                    cursor: grab;
                    user-select: none;
                    font-family: 'Times New Roman', serif;
                    font-size: 20px;
                    line-height: 1.2;
                    display: flex;
                    align-items: center;
                    transition: transform 0.2s ease, box-shadow 0.2s ease; /* Smooth movement */
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .formula-item:hover {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }
                .formula-item.dragging {
                    opacity: 0.5;
                    cursor: grabbing;
                    transform: scale(1.05);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.15);
                    z-index: 10;
                }
                /* Remove drag-over style as we will shift elements instead */
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

        // Description
        const description = document.createElement('p');
        description.textContent = 'Drag and drop formulas to reorder them:';
        Object.assign(description.style, {
            margin: '0',
            fontSize: '16px',
            color: '#666',
            textAlign: 'center'
        });

        // Formula List Container
        const listContainer = document.createElement('div');
        listContainer.className = 'formula-list';

        // Helper to find the element after the cursor
        function getDragAfterElement(container, x) {
            const draggableElements = [...container.querySelectorAll('.formula-item:not(.dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = x - box.left - box.width / 2;
                // We want the element whose center is just AFTER the cursor (negative offset, closest to 0)
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        // Function to render the list
        function renderList() {
            listContainer.innerHTML = '';
            
            // Allow dropping on the container itself to trigger reordering
            listContainer.addEventListener('dragover', (e) => {
                e.preventDefault(); // Allow drop
                const afterElement = getDragAfterElement(listContainer, e.clientX);
                const draggable = document.querySelector('.dragging');
                if (draggable) {
                    if (afterElement == null) {
                        listContainer.appendChild(draggable);
                    } else {
                        listContainer.insertBefore(draggable, afterElement);
                    }
                }
            });

            currentFormulas.forEach((formula, index) => {
                const item = document.createElement('div');
                item.className = 'formula-item';
                item.draggable = true;
                // Store formula index in dataset just for initial reference, 
                // but real order is determined by DOM order
                item.dataset.originalIndex = index; 
                item.textContent = deductive.convertToLogicalExpression(formula);

                // Drag Events
                item.addEventListener('dragstart', (e) => {
                    item.classList.add('dragging');
                    // e.dataTransfer.setData('text/plain', index); // Not strictly needed with live DOM sorting
                    e.dataTransfer.effectAllowed = 'move';
                });

                item.addEventListener('dragend', () => {
                    item.classList.remove('dragging');
                });
                
                // Note: 'drop' event on individual items is not needed with container-level sorting

                listContainer.appendChild(item);
            });
        }

        // Initial render
        renderList();

        // Action Buttons
        const actionContainer = document.createElement('div');
        Object.assign(actionContainer.style, { display: 'flex', gap: '12px', marginTop: '24px' });

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Apply Order';
        Object.assign(saveButton.style, {
            flex: '1',
            padding: '16px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
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
                reject(new Error('Cancelled'));
            }, 200);
        };

        saveButton.addEventListener('click', () => {
            // Reconstruct the array based on new DOM order
            const newOrder = [];
            const items = listContainer.querySelectorAll('.formula-item');
            items.forEach(item => {
                const originalIndex = parseInt(item.dataset.originalIndex);
                newOrder.push(currentFormulas[originalIndex]);
            });
            
            modalOverlay.style.animation = 'modalSlideOut 0.2s ease-in forwards';
            setTimeout(() => {
                if (modalOverlay.parentNode) modalOverlay.parentNode.removeChild(modalOverlay);
                resolve(newOrder);
            }, 200);
        });

        cancelButton.addEventListener('click', closeModal);

        // Assemble Modal
        modal.appendChild(modalTitle);
        modal.appendChild(description);
        modal.appendChild(listContainer);
        actionContainer.appendChild(cancelButton);
        actionContainer.appendChild(saveButton);
        modal.appendChild(actionContainer);
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        // Click outside to close
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    });
}
