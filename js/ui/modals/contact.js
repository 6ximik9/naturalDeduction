import { t } from "../../core/i18n";

export function initContactModal() {
  const contactBtns = [
    document.getElementById('contactButton'),
    document.getElementById('sb-contact')
  ];
  const contactModal = document.getElementById('contactModal');
  const closeBtn = contactModal?.querySelector('.closeContact');
  const contactForm = document.getElementById('contact-form');
  const successMsg = document.getElementById('contact-success-msg');

  if (!contactModal) return;

  // --- Event Listeners ---
  contactBtns.forEach(btn => {
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      contactModal.style.display = 'flex';
      contactForm.style.display = 'block';
      successMsg.style.display = 'none';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      contactModal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      contactModal.style.display = 'none';
    }
  });

  // AJAX submission for better UX
  if (contactForm) {
    // Helper to update custom validity messages
    const updateValidity = () => {
      const subjectField = contactForm.querySelector('input[name="subject"]');
      const messageField = contactForm.querySelector('textarea[name="message"]');

      if (subjectField.value.trim().length > 0 && subjectField.value.trim().length < 3) {
        subjectField.setCustomValidity(t('contact-error-short-subject'));
      } else {
        subjectField.setCustomValidity('');
      }

      if (messageField.value.trim().length > 0 && messageField.value.trim().length < 10) {
        messageField.setCustomValidity(t('contact-error-short'));
      } else {
        messageField.setCustomValidity('');
      }
    };

    // Update on every input to clear errors as user types
    contactForm.addEventListener('input', updateValidity);

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Update one last time before checking
      updateValidity();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      
      const data = new FormData(contactForm);
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: data,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          contactForm.reset();
          contactForm.style.display = 'none';
          successMsg.style.display = 'block';
          
          // Auto-close after 3 seconds
          setTimeout(() => {
            contactModal.style.display = 'none';
          }, 3000);
        } else {
          const errorData = await response.json();
          alert('Error: ' + (errorData.errors ? errorData.errors.map(e => e.message).join(', ') : 'Unknown error'));
        }
      } catch (error) {
        console.error('Detailed Contact Form Error:', error);
        alert('Failed to send message. Error: ' + error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });
  }
}
