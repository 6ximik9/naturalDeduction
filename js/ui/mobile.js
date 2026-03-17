document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-overlay');

  if (!menuBtn || !overlay) return;

  function getActiveSidebar() {
    const homeSidebar = document.getElementById('sidebar-home');
    const proofSidebar = document.getElementById('sidebar-proof');
    if (homeSidebar && homeSidebar.style.display !== 'none') return homeSidebar;
    if (proofSidebar && proofSidebar.style.display !== 'none') return proofSidebar;
    return null;
  }

  function toggleSidebar() {
    const activeSidebar = getActiveSidebar();
    if (activeSidebar) {
      activeSidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }
  }

  function closeSidebar() {
    const sidebars = document.querySelectorAll('.sidebar');
    sidebars.forEach(sidebar => sidebar.classList.remove('open'));
    overlay.classList.remove('active');
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
