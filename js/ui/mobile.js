export function getActiveSidebar() {
  const homeSidebar = document.getElementById('sidebar-home');
  const proofSidebar = document.getElementById('sidebar-proof');
  if (homeSidebar && homeSidebar.style.display !== 'none') return homeSidebar;
  if (proofSidebar && proofSidebar.style.display !== 'none') return proofSidebar;
  return null;
}

export function openSidebar() {
  const activeSidebar = getActiveSidebar();
  const overlay = document.getElementById('mobile-overlay');
  if (activeSidebar) {
    activeSidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
  }
}

export function closeSidebar() {
  const sidebars = document.querySelectorAll('.sidebar');
  const overlay = document.getElementById('mobile-overlay');
  sidebars.forEach(sidebar => sidebar.classList.remove('open'));
  if (overlay) overlay.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-overlay');

  if (!menuBtn || !overlay) return;

  function toggleSidebar() {
    const activeSidebar = getActiveSidebar();
    if (activeSidebar) {
      if (activeSidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }
  }

  menuBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Close sidebar when clicking a link (optional, depends on preference)
  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Uncomment if you want the sidebar to close after selecting a tool
      // closeSidebar();
    });
  });

  // Handle resize events to ensure sidebar is closed when going back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
});
