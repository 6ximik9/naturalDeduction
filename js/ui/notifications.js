/**
 * Displays a toast notification in the top right corner
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the toast (ms)
 */
export function showToast(message, duration = 5000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const header = document.createElement('div');
  header.className = 'toast-header';
  header.innerHTML = `<span>Rule Notice</span>`;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  };
  
  header.appendChild(closeBtn);
  
  const body = document.createElement('div');
  body.className = 'toast-body';
  body.textContent = message;
  
  toast.appendChild(header);
  toast.appendChild(body);
  container.appendChild(toast);

  let hideTimeout;

  const startHideTimeout = () => {
    hideTimeout = setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('hide');
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 400);
      }
    }, duration);
  };

  const cancelHideTimeout = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  };

  toast.addEventListener('mouseenter', cancelHideTimeout);
  toast.addEventListener('mouseleave', startHideTimeout);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Initial start
  startHideTimeout();
}
