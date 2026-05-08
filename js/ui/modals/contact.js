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
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const messageField = contactForm.querySelector('textarea[name="message"]');
      if (messageField.value.trim().length < 10) {
        alert(t('contact-error-short'));
        return;
      }

      const data = new FormData(contactForm);
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      
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
        alert('Failed to send message. Please try again later.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });
  }
}
