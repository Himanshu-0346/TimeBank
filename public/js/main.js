document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const icon = themeToggle ? themeToggle.querySelector('i') : null;

  if (icon) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    }

    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (root.getAttribute('data-theme') === 'dark') {
        root.removeAttribute('data-theme');
        icon.className = 'fa-solid fa-moon';
        localStorage.setItem('theme', 'light');
      } else {
        root.setAttribute('data-theme', 'dark');
        icon.className = 'fa-solid fa-sun';
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // Mobile Sidebar Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('mobile-overlay');

  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  // Socket.io Logic
  if (typeof io !== 'undefined' && window.USER_ID) {
    const socket = io();

    // Join personal room for direct notifications
    socket.emit('join', window.USER_ID);

    // Join skill rooms
    if (window.USER_SKILLS && window.USER_SKILLS.length > 0) {
      socket.emit('joinSkillRooms', window.USER_SKILLS);
    }

    // Listen for new requests matching skills
    socket.on('new_request', (data) => {
      showToast('New Request Match!', `A new request "${data.title}" for ${data.credits} credits matches your skills!`);
      updateNavBadge();
    });

    // Listen for direct notifications (accepted, completed)
    socket.on('notification', (data) => {
      showToast('Notification', data.message);
      updateNavBadge();
    });
  }

  function updateNavBadge() {
    const badge = document.getElementById('nav-notif-badge');
    if (badge) {
      badge.classList.remove('hidden');
      badge.innerText = parseInt(badge.innerText) + 1;
    }
  }

  function showToast(title, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon" style="color: var(--primary-color); font-size: 1.5rem;">
        <i class="fa-solid fa-bell"></i>
      </div>
      <div class="toast-content">
        <h4 style="margin-bottom:0.2rem;">${title}</h4>
        <p style="margin:0; font-size:0.9rem;">${message}</p>
      </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 5000);
  }
});

function markNotifRead(id, element) {
  fetch(`/notifications/mark-read/${id}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        element.style.opacity = '0.5';
        element.querySelector('.badge').remove();
      }
    });
}
