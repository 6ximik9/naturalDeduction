import * as deductive from "../../core/deductiveEngine";
import { t } from "../../core/i18n";
import { typeProof } from "../../index";

/**
 * Attaches a context panel (hypotheses list) to a modal.
 * @param {HTMLElement} parent - The container where the button and panel will be added.
 * @param {Function} onInsert - Callback function called when a hypothesis is clicked. Receives the formula text.
 * @returns {Object} An object containing methods to manage the panel.
 */
export function attachContextPanel(parent, onInsert) {
    if (!parent) return null;

    // Ensure parent can contain absolute children
    parent.style.position = 'relative';

    // 1. Add Styles (only once)
    if (!document.getElementById('common-context-panel-styles')) {
        const style = document.createElement('style');
        style.id = 'common-context-panel-styles';
        style.textContent = `
            .context-btn {
                position: absolute;
                right: 0;
                top: -50px;
                background: none;
                border: 1px solid var(--col-border);
                border-radius: 4px;
                padding: 4px 12px;
                font-size: 13px;
                cursor: pointer;
                color: var(--col-text-muted);
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                z-index: 10;
            }
            .context-btn:hover {
                background-color: var(--col-bg-main);
                color: var(--col-text-main);
                border-color: var(--col-accent);
            }
            .context-panel {
                background-color: var(--col-bg-main);
                border: 1px solid var(--col-border);
                border-radius: 8px;
                padding: 12px;
                margin-top: 8px;
                margin-bottom: 16px;
                max-height: 185px;
                overflow-y: auto;
                display: none;
                animation: fadeInContext 0.2s ease-out;
                width: 100%;
                box-sizing: border-box;
                clear: both;
            }
            @keyframes fadeInContext {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .context-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 8px;
                color: var(--col-text-main);
                display: block;
            }
            .hypotheses-list {
                margin: 0;
                padding: 0;
                list-style: none;
                font-family: 'Times New Roman', serif;
                font-size: 22px;
                color: var(--col-text-main);
            }
            .hypotheses-list li {
                padding: 8px 12px;
                border-bottom: 1px solid rgba(0,0,0,0.05);
                cursor: pointer;
                transition: background-color 0.2s;
                border-radius: 4px;
                word-break: break-all;
            }
            .hypotheses-list li:hover {
                background-color: var(--col-bg-white);
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .hypotheses-list li:last-child {
                border-bottom: none;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Create Elements
    const contextBtn = document.createElement('button');
    contextBtn.className = 'context-btn';
    contextBtn.type = 'button';
    contextBtn.innerHTML = `<i class="ri-list-check"></i> <span>${t('modal-btn-context')}</span>`;

    const contextPanel = document.createElement('div');
    contextPanel.className = 'context-panel';

    parent.appendChild(contextBtn);
    parent.appendChild(contextPanel);

    let allHypotheses = [];

    // 3. Logic
    contextBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (contextPanel.style.display === 'block') {
            contextPanel.style.display = 'none';
            contextBtn.querySelector('span').textContent = t('modal-btn-context');
            contextBtn.querySelector('span').setAttribute('data-i18n', 'modal-btn-context');
        } else {
            // Fetch hypotheses
            allHypotheses = [];
            try {
                if (typeProof === 0) { // Gentzen
                    const gentzen = await import('../../proofs/gentzen/GentzenProof');
                    if (gentzen.side) allHypotheses = deductive.getAllHypotheses(gentzen.side);
                } else if (typeProof === 2) { // Sequent
                    const sequent = await import('../../proofs/sequent/SequentProof');
                    const activeSeq = sequent.getActiveSequent();
                    if (activeSeq && activeSeq.antecedent && activeSeq.antecedent.length > 0) {
                        allHypotheses = activeSeq.antecedent;
                    } else if (sequent.side) {
                        // Fallback: extract from DOM if the object is not linked
                        const formulaElements = sequent.side.querySelectorAll('.sequent-formula[data-side="left"]');
                        if (formulaElements.length > 0) {
                            allHypotheses = Array.from(formulaElements).map(el => el.textContent.trim());
                        }
                    }
                } else if (typeProof === 1) { // Fitch
                    const fitch = await import('../../proofs/fitch/FitchProof');
                    allHypotheses = fitch.userHypothesesFitch || [];
                }
            } catch (err) {
                console.error("Failed to load hypotheses for context panel:", err);
            }

            renderHypotheses();
            contextPanel.style.display = 'block';
            contextBtn.querySelector('span').textContent = t('modal-btn-hide-context');
            contextBtn.querySelector('span').setAttribute('data-i18n', 'modal-btn-hide-context');
        }
    };

    function renderHypotheses() {
        contextPanel.innerHTML = `<span class="context-title" data-i18n="modal-context-title">${t('modal-context-title')}</span>`;

        if (allHypotheses.length > 0) {
            const list = document.createElement('ul');
            list.className = 'hypotheses-list';
            allHypotheses.forEach(h => {
                const text = typeof h === 'string' ? h : deductive.convertToLogicalExpression(h);
                const li = document.createElement('li');
                li.textContent = text;
                li.title = t('tooltip-select-node'); // "Click to select"
                li.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onInsert) onInsert(text);
                };
                list.appendChild(li);
            });
            contextPanel.appendChild(list);
        } else {
            const empty = document.createElement('div');
            empty.textContent = t('modal-no-hypotheses');
            empty.setAttribute('data-i18n', 'modal-no-hypotheses');
            empty.style.fontStyle = 'italic';
            empty.style.color = 'var(--col-text-muted)';
            contextPanel.appendChild(empty);
        }
    }

    return {
        show: () => { contextBtn.click(); },
        hide: () => { if (contextPanel.style.display === 'block') contextBtn.click(); },
        update: () => { if (contextPanel.style.display === 'block') renderHypotheses(); }
    };
}
