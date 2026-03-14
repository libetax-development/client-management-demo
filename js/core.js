// ===========================
// クライアント管理システム UIモック
// ===========================

// ── ページ管理 ──
const pages = {};
let currentPage = null;

function registerPage(name, initFn) { pages[name] = initFn; }

function navigateTo(pageName, params = {}) {
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageName);
  });
  currentPage = pageName;
  const content = document.getElementById('page-content');
  const header = document.getElementById('header-title');

  if (pages[pageName]) {
    pages[pageName](content, params);
  }

  // ヘッダータイトル更新
  const titles = {
    dashboard: 'ダッシュボード',
    clients: '顧客一覧',
    'client-detail': '顧客詳細',
    tasks: 'タスク一覧',
    'task-detail': 'タスク詳細',
    progress: '進捗管理表',
    'progress-detail': '進捗管理表 詳細',
    staff: '職員一覧',
    'staff-detail': '職員詳細',
    timesheet: '工数管理',
    reports: '報告書',
    'report-detail': '報告書詳細',
    calendar: 'カレンダー',
    rewards: '報酬管理',
    chatrooms: 'チャットマスタ',
    integrations: '外部連携',
    automation: '自動化設定',
    ai: 'AIアシスタント',
    settings: 'マイ設定',
  };
  header.textContent = titles[pageName] || pageName;

  // URL hash更新
  history.pushState(null, '', `#${pageName}${params.id ? '/' + params.id : ''}`);
}

// ── 初期化 ──
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initNotificationBell();

  // URLハッシュから復元
  const hash = location.hash.slice(1);
  if (hash === 'login' || !hash) {
    showLoginPage();
  } else {
    const [page, id] = hash.split('/');
    navigateTo(page, id ? { id } : {});
  }
});

// ── ログイン画面 ──
function showLoginPage() {
  document.getElementById('app-layout').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  history.pushState(null, '', '#login');
}

function doLogin() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-layout').style.display = 'flex';
  navigateTo('dashboard');
}

// ── サイドバー ──
function initSidebar() {
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(a.dataset.page);
      closeSidebar();
    });
  });

  // ユーザー情報
  const u = MOCK_DATA.currentUser;
  document.querySelector('.sidebar-user .name').textContent = u.name;
  document.querySelector('.sidebar-user .role').textContent = getRoleBadge(u.role);
  document.querySelector('.sidebar-user .avatar').textContent = u.name[0];

  // ハンバーガーメニュー
  const hamburger = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('sidebar-overlay');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('open');
      overlay.classList.toggle('show');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }
}

function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('show');
}

// ── 通知ドロップダウン ──
function initNotificationBell() {
  const unread = MOCK_DATA.notifications.filter(n => !n.isRead).length;
  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }

  const bell = document.getElementById('notif-bell');
  const dropdown = document.getElementById('notif-dropdown');
  if (bell && dropdown) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('show');
      dropdown.classList.toggle('show');
      if (!isOpen) renderNotifDropdown();
    });
    document.addEventListener('click', () => dropdown.classList.remove('show'));
    dropdown.addEventListener('click', (e) => e.stopPropagation());
  }
}

function renderNotifDropdown() {
  const dropdown = document.getElementById('notif-dropdown');
  const notifications = MOCK_DATA.notifications;
  const typeIcons = { task_due: '\u23f0', task_assigned: '\ud83d\udccb', report_created: '\ud83d\udcdd' };

  dropdown.innerHTML = `
    <div class="notif-dropdown-header">
      <h4>通知</h4>
      <button class="btn btn-sm btn-secondary" onclick="markAllRead()">すべて既読</button>
    </div>
    <div class="notif-dropdown-body">
      ${notifications.length === 0
        ? '<div style="padding:24px;text-align:center;color:var(--gray-400);font-size:13px;">通知はありません</div>'
        : notifications.map(n => `
          <div class="notif-dropdown-item ${n.isRead ? '' : 'unread'}" onclick="onNotifClick('${n.id}')">
            <div class="notif-type-icon ${n.type}">${typeIcons[n.type] || '\ud83d\udd14'}</div>
            <div>
              <div class="notif-dropdown-text">${n.message}</div>
              <div class="notif-dropdown-time">${formatRelativeTime(n.createdAt)}</div>
            </div>
          </div>
        `).join('')}
    </div>
    <div class="notif-dropdown-footer">
      <a href="#" onclick="event.preventDefault();document.getElementById('notif-dropdown').classList.remove('show');navigateTo('dashboard')">すべての通知を見る</a>
    </div>
  `;
}

function formatRelativeTime(iso) {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}時間前`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}日前`;
  return formatDate(iso);
}

function onNotifClick(notifId) {
  const n = MOCK_DATA.notifications.find(x => x.id === notifId);
  if (n) n.isRead = true;
  updateNotifBadge();
  renderNotifDropdown();
}

function markAllRead() {
  MOCK_DATA.notifications.forEach(n => n.isRead = true);
  updateNotifBadge();
  renderNotifDropdown();
}

function updateNotifBadge() {
  const unread = MOCK_DATA.notifications.filter(n => !n.isRead).length;
  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }
}
