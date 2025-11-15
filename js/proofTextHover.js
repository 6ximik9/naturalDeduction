/**
 * Proof Text Hover Effects
 *
 * Adds hover effects to elements with id="proofText" that convert numbers
 * to successor notation when hovered over.
 *
 * Inspired by the conversion functionality from modalForLeibniz.js
 */

/**
 * Converts numbers in expression to successor notation
 * @param {string} expr - The expression to convert
 * @returns {string} Expression with numbers converted to successor notation
 */
function convertNumbersToSuccessorNotation(expr) {
  /**
   * Encodes a number as successor notation
   * @param {number} num - The number to encode
   * @returns {string} The successor notation (e.g., 0 -> "0", 1 -> "s(0)", 2 -> "s(s(0))")
   */
  function encodeSNotation(num) {
    if (num === 0) return '0';
    return 's('.repeat(num) + '0' + ')'.repeat(num);
  }

  // Replace all numbers in the expression with successor notation
  return expr.replace(/\b\d+\b/g, (match) => encodeSNotation(Number(match)));
}

/**
 * Checks if expression contains any numbers
 * @param {string} expr - The expression to check
 * @returns {boolean} True if expression contains numbers
 */
function containsNumbers(expr) {
  return /\b\d+\b/.test(expr);
}

/**
 * Creates and shows a tooltip with successor notation
 */
function createTooltip(element, convertedText) {
  // Remove any existing tooltip immediately (no animation)
  removeTooltip(true);

  const tooltip = document.createElement('div');
  tooltip.id = 'successor-tooltip-' + Date.now();
  tooltip.className = 'successor-tooltip';
  tooltip.textContent = convertedText;

  Object.assign(tooltip.style, {
    position: 'absolute',
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '24px',
    fontFamily: '"Times New Roman", serif',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: '10000',
    pointerEvents: 'none',
    opacity: '0',
    transform: 'translateY(-5px)',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    maxWidth: '600px',
    wordWrap: 'break-word'
  });

  // Position tooltip below the element, starting from its right edge with extra offset
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  tooltip.style.left = (rect.left + scrollLeft + rect.width + 200) + 'px';
  tooltip.style.top = (rect.top + scrollTop + rect.height + 5) + 'px';
  tooltip.style.transform = 'translateX(-100%) translateY(0)';

  document.body.appendChild(tooltip);

  // Animate in
  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateX(-100%) translateY(5px)';
  });

  return tooltip;
}

/**
 * Removes all tooltips
 * @param {boolean} immediate - If true, remove immediately without animation
 */
function removeTooltip(immediate = false) {
  // Remove all tooltips with the successor-tooltip class
  const existingTooltips = document.querySelectorAll('.successor-tooltip');
  existingTooltips.forEach(tooltip => {
    if (immediate) {
      // Remove immediately without animation
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    } else {
      // Remove with animation
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateX(-100%) translateY(-5px)';
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 200);
    }
  });

  // Also remove any tooltips that might have old ID format
  const oldTooltips = document.querySelectorAll('#successor-tooltip, [id^="successor-tooltip"]');
  oldTooltips.forEach(tooltip => {
    if (!existingTooltips.includes(tooltip)) {
      if (immediate) {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      } else {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateX(-100%) translateY(-5px)';
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 200);
      }
    }
  });
}

/**
 * Handles mouse enter event for proof text elements
 */
function handleProofTextHover(event) {
  const element = event.target;
  const originalText = element.dataset.originalText || element.textContent;

  // Don't show tooltip for elements with 'previous' class
  if (element.classList.contains('previous')) {
    return;
  }

  // Only show tooltip if the text contains numbers
  if (containsNumbers(originalText)) {
    // Remove any existing tooltips first (immediately for smooth transition)
    removeTooltip(true);

    const convertedText = convertNumbersToSuccessorNotation(originalText);

    // Store original styles before changing them
    if (!element.dataset.hoverOriginalStyles) {
      element.dataset.hoverOriginalStyles = JSON.stringify({
        backgroundColor: element.style.backgroundColor || '',
        borderRadius: element.style.borderRadius || '',
        padding: element.style.padding || '',
        boxShadow: element.style.boxShadow || '',
        transition: element.style.transition || ''
      });
    }

    // Add subtle highlighting to the original element (only if not already styled by click)
    const currentBg = element.style.backgroundColor;
    if (!currentBg || currentBg === '' || currentBg === 'transparent') {
      element.style.backgroundColor = '#e8f4fd';
    }

    // Add other hover styles
    element.style.borderRadius = '4px';
    element.style.padding = '2px 4px';
    element.style.transition = 'all 0.2s ease';
    element.style.boxShadow = '0 1px 3px rgba(0, 123, 191, 0.2)';

    // Mark element as currently hovered
    element.dataset.isHovered = 'true';

    // Create and show tooltip
    createTooltip(element, convertedText);
  }
}

/**
 * Handles mouse leave event for proof text elements
 */
function handleProofTextLeave(event) {
  const element = event.target;
  const originalText = element.dataset.originalText || element.textContent;

  // Only remove effects if the text contains numbers and element was hovered
  if (containsNumbers(originalText) && element.dataset.isHovered === 'true') {
    // Remove hover marker
    delete element.dataset.isHovered;

    // Restore original styles
    if (element.dataset.hoverOriginalStyles) {
      const originalStyles = JSON.parse(element.dataset.hoverOriginalStyles);

      // Only restore background if it's our hover color
      if (element.style.backgroundColor === 'rgb(232, 244, 253)') {
        element.style.backgroundColor = originalStyles.backgroundColor;
      }

      // Restore other styles
      element.style.borderRadius = originalStyles.borderRadius;
      element.style.padding = originalStyles.padding;
      element.style.boxShadow = originalStyles.boxShadow;
      element.style.transition = originalStyles.transition;
    }

    // Remove tooltip
    removeTooltip();
  }
}

/**
 * Adds hover effects to proof text elements
 * Call this function whenever new proofText elements are added to the DOM
 */
export function addProofTextHoverEffects() {
  // Remove existing listeners to avoid duplicates
  document.querySelectorAll('#proofText').forEach(element => {
    element.removeEventListener('mouseenter', handleProofTextHover);
    element.removeEventListener('mouseleave', handleProofTextLeave);
  });

  // Add new listeners to all current proofText elements
  document.querySelectorAll('#proofText').forEach(element => {
    if (element.dataset.originalText === undefined) {
      element.dataset.originalText = element.textContent;
    }

    element.addEventListener('mouseenter', handleProofTextHover);
    element.addEventListener('mouseleave', handleProofTextLeave);
  });

  console.log('✨ Added hover effects to proof text elements');
}

/**
 * Initialize hover effects when DOM is ready
 */
export function initializeProofTextHover() {
  // Initial setup
  addProofTextHoverEffects();

  // Set up a MutationObserver to detect when new proofText elements are added
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if any new nodes have proofText elements
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.id === 'proofText' || node.querySelector('#proofText')) {
              shouldUpdate = true;
            }
          }
        });
      }
    });

    if (shouldUpdate) {
      // Debounce updates to avoid excessive calls
      setTimeout(() => {
        addProofTextHoverEffects();
      }, 100);
    }
  });

  // Observe changes to the proof container
  const proofContainer = document.getElementById('proof');
  if (proofContainer) {
    observer.observe(proofContainer, {
      childList: true,
      subtree: true
    });
  }

  console.log('🔍 Initialized proof text hover system with DOM observer');
}
