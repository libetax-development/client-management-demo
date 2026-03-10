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
    timesheet: '工数管理',
    reports: '報告書',
    calendar: 'カレンダー',
    rewards: '報酬管理',
    integrations: '外部連携',
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
  registerAllPages();

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
    });
  });

  // ユーザー情報
  const u = MOCK_DATA.currentUser;
  document.querySelector('.sidebar-user .name').textContent = u.name;
  document.querySelector('.sidebar-user .role').textContent = getRoleBadge(u.role);
  document.querySelector('.sidebar-user .avatar').textContent = u.name[0];
}

// ── 通知ベル ──
function initNotificationBell() {
  const unread = MOCK_DATA.notifications.filter(n => !n.isRead).length;
  const badge = document.querySelector('.notification-bell .badge');
  if (badge) badge.textContent = unread;
}

// ── 全ページ登録 ──
function registerAllPages() {
  registerPage('dashboard', renderDashboard);
  registerPage('clients', renderClients);
  registerPage('client-detail', renderClientDetail);
  registerPage('tasks', renderTasks);
  registerPage('task-detail', renderTaskDetail);
  registerPage('progress', renderProgress);
  registerPage('progress-detail', renderProgressDetail);
  registerPage('staff', renderStaff);
  registerPage('timesheet', renderTimesheet);
  registerPage('reports', renderReports);
  registerPage('calendar', renderCalendar);
  registerPage('rewards', renderRewards);
  registerPage('integrations', renderIntegrations);
  registerPage('settings', renderSettings);
}

// ===========================
// ダッシュボード
// ===========================
function renderDashboard(el) {
  const tasks = MOCK_DATA.tasks;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter(t => t.status !== '完了' && t.dueDate < today).length;
  const inProgress = tasks.filter(t => t.status === '進行中').length;
  const todo = tasks.filter(t => t.status === '未着手').length;
  const returned = tasks.filter(t => t.status === '差戻し').length;

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent-red">
        <div class="stat-label">期限超過</div>
        <div class="stat-value">${overdue}</div>
        <div class="stat-sub">件のタスク</div>
      </div>
      <div class="stat-card accent-blue">
        <div class="stat-label">進行中</div>
        <div class="stat-value">${inProgress}</div>
        <div class="stat-sub">件のタスク</div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">未着手</div>
        <div class="stat-value">${todo}</div>
        <div class="stat-sub">件のタスク</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-label">差戻し</div>
        <div class="stat-value">${returned}</div>
        <div class="stat-sub">件 要対応</div>
      </div>
    </div>

    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>通知</h3></div>
        <div class="card-body">
          <ul class="notification-list">
            ${MOCK_DATA.notifications.map(n => `
              <li class="notification-item">
                <div class="notification-dot ${n.isRead ? 'read' : 'unread'}"></div>
                <div>
                  <div class="notification-text">${n.message}</div>
                  <div class="notification-time">${formatDate(n.createdAt)}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>直近の期限タスク</h3></div>
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>顧客</th><th>タスク</th><th>期限</th><th>状態</th></tr></thead>
              <tbody>
                ${tasks.filter(t => t.status !== '完了').sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5).map(t => {
                  const client = getClientById(t.clientId);
                  return `<tr class="clickable" onclick="navigateTo('task-detail',{id:'${t.id}'})">
                    <td>${client?.name || '-'}</td>
                    <td>${t.title}</td>
                    <td>${formatDate(t.dueDate)}</td>
                    <td><span class="status-badge ${getStatusClass(t.status)}">${t.status}</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===========================
// 顧客一覧
// ===========================
function renderClients(el) {
  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="顧客名・コードで検索..." id="client-search">
      <select class="filter-select" id="client-type-filter">
        <option value="">全種別</option>
        <option value="法人">法人</option>
        <option value="個人">個人</option>
      </select>
      <select class="filter-select" id="client-status-filter">
        <option value="">全ステータス</option>
        <option value="active">有効</option>
        <option value="inactive">無効</option>
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="alert('モックのため操作不可')">+ 新規顧客</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>コード</th><th>顧客名</th><th>種別</th><th>決算月</th><th>主担当</th><th>売上（税抜）</th><th>状態</th></tr></thead>
          <tbody id="client-table-body"></tbody>
        </table>
      </div>
    </div>
  `;
  renderClientTable();

  document.getElementById('client-search').addEventListener('input', renderClientTable);
  document.getElementById('client-type-filter').addEventListener('change', renderClientTable);
  document.getElementById('client-status-filter').addEventListener('change', renderClientTable);
}

function renderClientTable() {
  const search = (document.getElementById('client-search')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('client-type-filter')?.value || '';
  const statusFilter = document.getElementById('client-status-filter')?.value || '';

  let clients = MOCK_DATA.clients.filter(c => {
    if (search && !c.name.toLowerCase().includes(search) && !c.clientCode.includes(search)) return false;
    if (typeFilter && c.clientType !== typeFilter) return false;
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;
    return true;
  });

  const tbody = document.getElementById('client-table-body');
  tbody.innerHTML = clients.map(c => {
    const main = getUserById(c.mainUserId);
    return `<tr class="clickable" onclick="navigateTo('client-detail',{id:'${c.id}'})">
      <td>${c.clientCode}</td>
      <td><strong>${c.name}</strong></td>
      <td><span class="type-badge ${c.clientType === '法人' ? 'type-corp' : 'type-individual'}">${c.clientType}</span></td>
      <td>${c.fiscalMonth}月</td>
      <td>${main?.name || '-'}</td>
      <td>${c.monthlySales.toLocaleString()}円</td>
      <td>${c.isActive ? '<span style="color:var(--success)">有効</span>' : '<span style="color:var(--gray-400)">無効</span>'}</td>
    </tr>`;
  }).join('');
}

// ===========================
// 顧客詳細
// ===========================
function renderClientDetail(el, params) {
  const c = getClientById(params.id);
  if (!c) { el.innerHTML = '<div class="empty-state"><div class="icon">?</div><p>顧客が見つかりません</p></div>'; return; }
  const main = getUserById(c.mainUserId);
  const sub = getUserById(c.subUserId);
  const mgr = getUserById(c.mgrUserId);
  const tasks = getTasksByClient(c.id);
  document.getElementById('header-title').textContent = `顧客詳細 - ${c.name}`;

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('clients')">&larr; 顧客一覧に戻る</a></div>
    <div class="alert alert-warning">この画面は閲覧専用です。編集は team_leader 以上の権限が必要です。</div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>基本情報</h3></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">顧客コード</div><div class="detail-value">${c.clientCode}</div></div>
          <div class="detail-row"><div class="detail-label">顧客名</div><div class="detail-value">${c.name}</div></div>
          <div class="detail-row"><div class="detail-label">種別</div><div class="detail-value"><span class="type-badge ${c.clientType === '法人' ? 'type-corp' : 'type-individual'}">${c.clientType}</span></div></div>
          <div class="detail-row"><div class="detail-label">決算月</div><div class="detail-value">${c.fiscalMonth}月</div></div>
          <div class="detail-row"><div class="detail-label">月額報酬（税抜）</div><div class="detail-value">${c.monthlySales.toLocaleString()}円</div></div>
          <div class="detail-row"><div class="detail-label">ステータス</div><div class="detail-value">${c.isActive ? '有効' : '無効'}</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>担当者</h3></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">主担当</div><div class="detail-value">${main?.name || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">副担当</div><div class="detail-value">${sub?.name || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">担当税理士</div><div class="detail-value">${mgr?.name || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">外部リンク</div><div class="detail-value"><a href="#" onclick="event.preventDefault();alert('Dropbox等の外部リンク（モック）')">Dropboxフォルダを開く</a></div></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:24px">
      <div class="card-header"><h3>関連タスク</h3><button class="btn btn-primary btn-sm" onclick="alert('モックのため操作不可')">+ タスク追加</button></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>タスク名</th><th>担当者</th><th>期限</th><th>状態</th></tr></thead>
            <tbody>
              ${tasks.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--gray-400)">タスクなし</td></tr>' : tasks.map(t => {
                const assignee = getUserById(t.assigneeUserId);
                return `<tr class="clickable" onclick="navigateTo('task-detail',{id:'${t.id}'})">
                  <td>${t.title}</td>
                  <td>${assignee?.name || '-'}</td>
                  <td>${formatDate(t.dueDate)}</td>
                  <td><span class="status-badge ${getStatusClass(t.status)}">${t.status}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ===========================
// タスク一覧
// ===========================
function renderTasks(el) {
  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="タスク名・顧客名で検索..." id="task-search">
      <select class="filter-select" id="task-status-filter">
        <option value="">全ステータス</option>
        <option value="未着手">未着手</option>
        <option value="進行中">進行中</option>
        <option value="完了">完了</option>
        <option value="差戻し">差戻し</option>
      </select>
      <select class="filter-select" id="task-assignee-filter">
        <option value="">全担当者</option>
        ${MOCK_DATA.users.filter(u => u.isActive).map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="alert('モックのため操作不可')">+ 新規タスク</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>顧客名</th><th>タスク名</th><th>担当者</th><th>期限</th><th>状態</th></tr></thead>
          <tbody id="task-table-body"></tbody>
        </table>
      </div>
    </div>
  `;
  renderTaskTable();

  document.getElementById('task-search').addEventListener('input', renderTaskTable);
  document.getElementById('task-status-filter').addEventListener('change', renderTaskTable);
  document.getElementById('task-assignee-filter').addEventListener('change', renderTaskTable);
}

function renderTaskTable() {
  const search = (document.getElementById('task-search')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('task-status-filter')?.value || '';
  const assigneeFilter = document.getElementById('task-assignee-filter')?.value || '';

  let tasks = MOCK_DATA.tasks.filter(t => {
    const client = getClientById(t.clientId);
    if (search && !t.title.toLowerCase().includes(search) && !(client?.name || '').toLowerCase().includes(search)) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (assigneeFilter && t.assigneeUserId !== assigneeFilter) return false;
    return true;
  });

  tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const tbody = document.getElementById('task-table-body');
  tbody.innerHTML = tasks.map(t => {
    const client = getClientById(t.clientId);
    const assignee = getUserById(t.assigneeUserId);
    return `<tr class="clickable" onclick="navigateTo('task-detail',{id:'${t.id}'})">
      <td>${client?.name || '-'}</td>
      <td><strong>${t.title}</strong></td>
      <td>${assignee?.name || '-'}</td>
      <td>${formatDate(t.dueDate)}</td>
      <td><span class="status-badge ${getStatusClass(t.status)}">${t.status}</span></td>
    </tr>`;
  }).join('');
}

// ===========================
// タスク詳細
// ===========================
function renderTaskDetail(el, params) {
  const t = MOCK_DATA.tasks.find(tk => tk.id === params.id);
  if (!t) { el.innerHTML = '<div class="empty-state"><div class="icon">?</div><p>タスクが見つかりません</p></div>'; return; }
  const client = getClientById(t.clientId);
  const assignee = getUserById(t.assigneeUserId);
  document.getElementById('header-title').textContent = `タスク詳細 - ${t.title}`;

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('tasks')">&larr; タスク一覧に戻る</a></div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>タスク情報</h3><button class="btn btn-secondary btn-sm" onclick="alert('モックのため操作不可')">編集</button></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">タスク名</div><div class="detail-value">${t.title}</div></div>
          <div class="detail-row"><div class="detail-label">顧客</div><div class="detail-value"><a href="#" onclick="event.preventDefault();navigateTo('client-detail',{id:'${t.clientId}'})">${client?.name || '-'}</a></div></div>
          <div class="detail-row"><div class="detail-label">担当者</div><div class="detail-value">${assignee?.name || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">ステータス</div><div class="detail-value"><span class="status-badge ${getStatusClass(t.status)}">${t.status}</span></div></div>
          <div class="detail-row"><div class="detail-label">期限</div><div class="detail-value">${formatDate(t.dueDate)}</div></div>
          <div class="detail-row"><div class="detail-label">作成日</div><div class="detail-value">${formatDate(t.createdAt)}</div></div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-header"><h3>チェックリスト</h3></div>
          <div class="card-body">
            <div style="display:flex;flex-direction:column;gap:8px;">
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;"><input type="checkbox" checked> 必要書類の確認</label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;"><input type="checkbox" checked> 仕訳データの確認</label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;"><input type="checkbox"> 申告書ドラフト作成</label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;"><input type="checkbox"> レビュー依頼</label>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>コメント</h3></div>
          <div class="card-body">
            <div style="padding:12px;background:var(--gray-50);border-radius:6px;margin-bottom:12px;">
              <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px;">齋藤 太郎 - 2026/03/08</div>
              <div style="font-size:13px;">仕訳データの確認が完了しました。申告書のドラフトに着手します。</div>
            </div>
            <div style="display:flex;gap:8px;">
              <input type="text" class="search-input" style="flex:1;width:auto" placeholder="コメントを入力...">
              <button class="btn btn-primary btn-sm">送信</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===========================
// 進捗管理表（一覧）
// ===========================
function renderProgress(el) {
  el.innerHTML = `
    <div class="toolbar">
      <div class="dropdown" style="position:relative;">
        <button class="btn btn-primary" id="pg-create-btn">+ 作成</button>
        <div class="dropdown-menu" id="pg-create-menu" style="display:none;position:absolute;top:100%;left:0;margin-top:4px;background:#fff;border:1px solid var(--gray-200);border-radius:6px;box-shadow:var(--shadow-lg);z-index:10;min-width:240px;">
          <a href="#" class="dropdown-item" onclick="event.preventDefault();alert('モックのため操作不可')">進捗管理表の作成（通常版）</a>
          <a href="#" class="dropdown-item" onclick="event.preventDefault();alert('モックのため操作不可')">進捗管理表の作成（中間申告・予定納付）</a>
          <a href="#" class="dropdown-item" onclick="event.preventDefault();alert('モックのため操作不可')">サンプルから作成</a>
        </div>
      </div>
      <div class="spacer"></div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray-500);cursor:pointer;">
        <input type="checkbox" id="pg-show-hidden"> 公開範囲外の進捗管理表を表示
      </label>
    </div>

    <div class="view-tabs" id="pg-tabs">
      <button class="view-tab active" data-tab="active">利用中</button>
      <button class="view-tab" data-tab="ended">終了分</button>
    </div>

    <div class="view-tabs" style="margin-bottom:16px;" id="pg-view-mode">
      <button class="view-tab active" data-mode="list">リスト形式</button>
      <button class="view-tab" data-mode="grid">グリッド形式</button>
    </div>

    <div id="pg-list"></div>
  `;

  let activeTab = 'active';
  let viewMode = 'list';

  function draw() {
    const sheets = MOCK_DATA.progressSheets.filter(s => {
      if (activeTab === 'active') return s.status === '利用中';
      return s.status === '終了';
    });

    const container = document.getElementById('pg-list');

    if (sheets.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">?</div><p>該当する進捗管理表がありません</p></div>';
      return;
    }

    if (viewMode === 'list') {
      container.innerHTML = `
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead><tr>
                <th>分類</th><th>進捗管理表名</th><th>対象</th>
                <th>期限到来（担当先）</th><th>期限到来（全体）</th>
                <th>未完了（担当先）</th><th>未完了（全体）</th>
                <th>管理者</th><th>操作</th>
              </tr></thead>
              <tbody>
                ${sheets.map(s => {
                  const mgr = getUserById(s.managerId);
                  const totalTargets = s.targets.length;
                  const incomplete = s.targets.filter(t => Object.values(t.steps).some(v => v !== '完了')).length;
                  const myTargets = s.targets.filter(t => {
                    const c = getClientById(t.clientId);
                    return c && c.mainUserId === MOCK_DATA.currentUser.id;
                  });
                  const myIncomplete = myTargets.filter(t => Object.values(t.steps).some(v => v !== '完了')).length;
                  return `<tr class="clickable" onclick="navigateTo('progress-detail',{id:'${s.id}'})">
                    <td><span class="type-badge type-corp">${s.category}</span></td>
                    <td><strong>${s.name}</strong></td>
                    <td>${totalTargets}件</td>
                    <td>${myIncomplete > 0 ? `<span class="count-badge count-warn">${myIncomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${incomplete > 0 ? `<span class="count-badge count-warn">${incomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${myIncomplete > 0 ? `<span class="count-badge count-warn">${myIncomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${incomplete > 0 ? `<span class="count-badge count-warn">${incomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${mgr?.name || '-'}</td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();alert('モックのため操作不可')">設定変更</button>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `<div class="pg-grid">${sheets.map(s => {
        const mgr = getUserById(s.managerId);
        const totalTargets = s.targets.length;
        const complete = s.targets.filter(t => Object.values(t.steps).every(v => v === '完了')).length;
        const pct = totalTargets > 0 ? Math.round((complete / totalTargets) * 100) : 0;
        return `
          <div class="card clickable" onclick="navigateTo('progress-detail',{id:'${s.id}'})" style="cursor:pointer;">
            <div class="card-header">
              <h3>${s.name}</h3>
              <span class="type-badge type-corp">${s.category}</span>
            </div>
            <div class="card-body">
              <div class="pg-progress-bar"><div class="pg-progress-fill" style="width:${pct}%"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gray-500);margin-top:8px;">
                <span>${complete}/${totalTargets}件 完了</span>
                <span>${pct}%</span>
              </div>
              <div style="margin-top:12px;font-size:12px;color:var(--gray-500);">管理者: ${mgr?.name || '-'}</div>
            </div>
          </div>
        `;
      }).join('')}</div>`;
    }
  }

  document.getElementById('pg-create-btn').addEventListener('click', () => {
    const menu = document.getElementById('pg-create-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('pg-tabs').addEventListener('click', e => {
    if (e.target.dataset.tab) {
      activeTab = e.target.dataset.tab;
      document.querySelectorAll('#pg-tabs .view-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
      draw();
    }
  });

  document.getElementById('pg-view-mode').addEventListener('click', e => {
    if (e.target.dataset.mode) {
      viewMode = e.target.dataset.mode;
      document.querySelectorAll('#pg-view-mode .view-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === viewMode));
      draw();
    }
  });

  draw();
}

// ===========================
// 進捗管理表（詳細）
// ===========================
function renderProgressDetail(el, params) {
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === params.id);
  if (!sheet) { el.innerHTML = '<div class="empty-state"><div class="icon">?</div><p>進捗管理表が見つかりません</p></div>'; return; }
  document.getElementById('header-title').textContent = `進捗管理表 - ${sheet.name}`;

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('progress')">&larr; 進捗管理表一覧に戻る</a></div>

    <div class="toolbar" style="flex-wrap:wrap;">
      <select class="filter-select" id="pd-assignee-filter">
        <option value="">全担当者</option>
        ${MOCK_DATA.users.filter(u => u.isActive).map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
      </select>
      <label style="display:flex;align-items:center;gap:4px;font-size:12px;">
        <input type="checkbox" id="pd-main-only"> 主担当先のみ
      </label>
      <input type="text" class="search-input" placeholder="キーワード検索..." id="pd-search" style="width:180px;">
      <label style="display:flex;align-items:center;gap:4px;font-size:12px;">
        <input type="checkbox" id="pd-incomplete-only"> 未完了のみ
      </label>
      <div class="spacer"></div>
      <button class="btn btn-secondary btn-sm" onclick="alert('エクスポート機能（モック）')">エクスポート</button>
      <button class="btn btn-secondary btn-sm" onclick="alert('一括操作（モック）')">一括操作</button>
    </div>

    <div class="stats-grid" id="pd-summary"></div>

    <div class="card">
      <div class="card-body" style="padding:0;overflow-x:auto;">
        <table class="pg-detail-table">
          <thead id="pd-thead"></thead>
          <tbody id="pd-tbody"></tbody>
        </table>
      </div>
    </div>
    <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:12px;color:var(--gray-400);" id="pd-count"></div>
    </div>
  `;

  function draw() {
    const assigneeFilter = document.getElementById('pd-assignee-filter')?.value || '';
    const mainOnly = document.getElementById('pd-main-only')?.checked || false;
    const search = (document.getElementById('pd-search')?.value || '').toLowerCase();
    const incompleteOnly = document.getElementById('pd-incomplete-only')?.checked || false;

    let targets = sheet.targets.filter(t => {
      const client = getClientById(t.clientId);
      if (!client) return false;
      if (assigneeFilter && client.mainUserId !== assigneeFilter && client.subUserId !== assigneeFilter) return false;
      if (mainOnly && client.mainUserId !== MOCK_DATA.currentUser.id) return false;
      if (search && !client.name.toLowerCase().includes(search) && !client.clientCode.includes(search)) return false;
      if (incompleteOnly && Object.values(t.steps).every(v => v === '完了')) return false;
      return true;
    });

    // Summary
    const totalAll = sheet.targets.length;
    const completeAll = sheet.targets.filter(t => Object.values(t.steps).every(v => v === '完了')).length;
    const incompleteAll = totalAll - completeAll;
    const returnedAll = sheet.targets.filter(t => Object.values(t.steps).some(v => v === '差戻し')).length;

    document.getElementById('pd-summary').innerHTML = `
      <div class="stat-card accent-blue">
        <div class="stat-label">対象件数</div>
        <div class="stat-value">${totalAll}</div>
        <div class="stat-sub">件</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-label">完了</div>
        <div class="stat-value">${completeAll}</div>
        <div class="stat-sub">件</div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">未完了</div>
        <div class="stat-value">${incompleteAll}</div>
        <div class="stat-sub">件</div>
      </div>
      <div class="stat-card accent-red">
        <div class="stat-label">差戻し</div>
        <div class="stat-value">${returnedAll}</div>
        <div class="stat-sub">件</div>
      </div>
    `;

    // Table header
    document.getElementById('pd-thead').innerHTML = `<tr>
      <th>コード</th><th>顧客名</th><th>主担当</th><th>担当税理士</th>
      ${sheet.columns.map(c => `<th class="pg-step-col">${c}</th>`).join('')}
      <th>備考</th>
    </tr>`;

    // Table body
    document.getElementById('pd-tbody').innerHTML = targets.length === 0
      ? `<tr><td colspan="${4 + sheet.columns.length + 1}" style="text-align:center;color:var(--gray-400);padding:24px;">該当するデータがありません</td></tr>`
      : targets.map(t => {
        const client = getClientById(t.clientId);
        const main = getUserById(client?.mainUserId);
        const mgr = getUserById(client?.mgrUserId);
        return `<tr>
          <td>${client?.clientCode || '-'}</td>
          <td><strong>${client?.name || '-'}</strong></td>
          <td>${main?.name || '-'}</td>
          <td>${mgr?.name || '-'}</td>
          ${sheet.columns.map(c => {
            const val = t.steps[c] || '未着手';
            return `<td class="pg-step-cell"><span class="status-badge ${getStatusClass(val)}" style="cursor:pointer;" onclick="event.stopPropagation();alert('ワンクリックでステータス変更（モック）')">${val}</span></td>`;
          }).join('')}
          <td style="font-size:12px;color:var(--gray-500);max-width:160px;">${t.note || ''}</td>
        </tr>`;
      }).join('');

    document.getElementById('pd-count').textContent = `${targets.length}/${sheet.targets.length}件 表示中`;
  }

  document.getElementById('pd-assignee-filter').addEventListener('change', draw);
  document.getElementById('pd-main-only').addEventListener('change', draw);
  document.getElementById('pd-search').addEventListener('input', draw);
  document.getElementById('pd-incomplete-only').addEventListener('change', draw);
  draw();
}

// ===========================
// 職員一覧
// ===========================
function renderStaff(el) {
  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="氏名・コードで検索..." id="staff-search">
      <select class="filter-select" id="staff-role-filter">
        <option value="">全ロール</option>
        <option value="admin">管理者</option>
        <option value="team_leader">チームリーダー</option>
        <option value="member">メンバー</option>
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="alert('モックのため操作不可')">+ 職員追加</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>コード</th><th>氏名</th><th>ロール</th><th>チーム</th><th>分類</th><th>基準割合</th><th>状態</th></tr></thead>
          <tbody id="staff-table-body"></tbody>
        </table>
      </div>
    </div>
  `;
  renderStaffTable();

  document.getElementById('staff-search').addEventListener('input', renderStaffTable);
  document.getElementById('staff-role-filter').addEventListener('change', renderStaffTable);
}

function renderStaffTable() {
  const search = (document.getElementById('staff-search')?.value || '').toLowerCase();
  const roleFilter = document.getElementById('staff-role-filter')?.value || '';

  let users = MOCK_DATA.users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search) && !u.staffCode.toLowerCase().includes(search)) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  const tbody = document.getElementById('staff-table-body');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.staffCode}</td>
      <td><strong>${u.name}</strong></td>
      <td><span class="role-badge role-${u.role}">${getRoleBadge(u.role)}</span></td>
      <td>${u.team || '-'}</td>
      <td>${u.staffFlag || '-'}</td>
      <td>${u.baseRatio != null ? u.baseRatio + '%' : '-'}</td>
      <td>${u.isActive ? '<span style="color:var(--success)">有効</span>' : '<span style="color:var(--gray-400)">無効</span>'}</td>
    </tr>
  `).join('');
}

// ===========================
// 工数管理
// ===========================
function renderTimesheet(el) {
  el.innerHTML = `
    <div class="toolbar">
      <select class="filter-select" id="ts-user-filter">
        <option value="">全職員</option>
        ${MOCK_DATA.users.filter(u => u.isActive).map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
      </select>
      <input type="date" class="filter-select" id="ts-date-filter" value="2026-03-07">
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="alert('モックのため操作不可')">+ 工数入力</button>
    </div>

    <div class="stats-grid" id="ts-summary"></div>

    <div class="card">
      <div class="card-header"><h3>工数一覧</h3></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>日付</th><th>職員</th><th>顧客</th><th>作業内容</th><th>時間</th></tr></thead>
            <tbody id="ts-table-body"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  renderTimesheetData();
  document.getElementById('ts-user-filter').addEventListener('change', renderTimesheetData);
  document.getElementById('ts-date-filter').addEventListener('change', renderTimesheetData);
}

function renderTimesheetData() {
  const userFilter = document.getElementById('ts-user-filter')?.value || '';
  const dateFilter = document.getElementById('ts-date-filter')?.value || '';

  let entries = MOCK_DATA.timeEntries.filter(e => {
    if (userFilter && e.userId !== userFilter) return false;
    if (dateFilter && e.date !== dateFilter) return false;
    return true;
  });

  entries.sort((a, b) => b.date.localeCompare(a.date) || a.userId.localeCompare(b.userId));

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const uniqueUsers = new Set(entries.map(e => e.userId)).size;
  const avgHours = uniqueUsers > 0 ? (totalHours / uniqueUsers).toFixed(1) : '0';

  document.getElementById('ts-summary').innerHTML = `
    <div class="stat-card accent-blue">
      <div class="stat-label">合計工数</div>
      <div class="stat-value">${totalHours.toFixed(1)}</div>
      <div class="stat-sub">時間</div>
    </div>
    <div class="stat-card accent-green">
      <div class="stat-label">入力済み人数</div>
      <div class="stat-value">${uniqueUsers}</div>
      <div class="stat-sub">名</div>
    </div>
    <div class="stat-card accent-yellow">
      <div class="stat-label">平均工数/人</div>
      <div class="stat-value">${avgHours}</div>
      <div class="stat-sub">時間</div>
    </div>
    <div class="stat-card accent-red">
      <div class="stat-label">件数</div>
      <div class="stat-value">${entries.length}</div>
      <div class="stat-sub">エントリ</div>
    </div>
  `;

  const tbody = document.getElementById('ts-table-body');
  tbody.innerHTML = entries.length === 0
    ? '<tr><td colspan="5" style="text-align:center;color:var(--gray-400);padding:24px;">該当するデータがありません</td></tr>'
    : entries.map(e => {
      const user = getUserById(e.userId);
      const client = getClientById(e.clientId);
      return `<tr>
        <td>${formatDate(e.date)}</td>
        <td>${user?.name || '-'}</td>
        <td>${client?.name || '-'}</td>
        <td>${e.description}</td>
        <td><strong>${e.hours.toFixed(1)}h</strong></td>
      </tr>`;
    }).join('');
}

// ===========================
// 報告書
// ===========================
function renderReports(el) {
  el.innerHTML = `
    <div class="toolbar">
      <select class="filter-select" id="rp-team-filter">
        <option value="">全チーム</option>
        ${MOCK_DATA.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="alert('モックのため操作不可')">+ 新規報告書</button>
    </div>
    <div id="rp-list"></div>
  `;
  renderReportList();
  document.getElementById('rp-team-filter').addEventListener('change', renderReportList);
}

function renderReportList() {
  const teamFilter = document.getElementById('rp-team-filter')?.value || '';
  let reports = MOCK_DATA.reports.filter(r => {
    if (teamFilter && r.teamId !== teamFilter) return false;
    return true;
  });
  reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const container = document.getElementById('rp-list');
  container.innerHTML = reports.length === 0
    ? '<div class="empty-state"><div class="icon">?</div><p>報告書がありません</p></div>'
    : reports.map(r => {
      const author = getUserById(r.authorId);
      const team = MOCK_DATA.teams.find(t => t.id === r.teamId);
      return `
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header">
            <h3>${r.title}</h3>
            <span class="status-badge status-done">${r.status}</span>
          </div>
          <div class="card-body">
            <div style="display:flex;gap:24px;margin-bottom:12px;font-size:12px;color:var(--gray-500);">
              <span>作成者: ${author?.name || '-'}</span>
              <span>チーム: ${team?.name || '-'}</span>
              <span>作成日: ${formatDate(r.createdAt)}</span>
            </div>
            <p style="font-size:13px;color:var(--gray-700);line-height:1.8;">${r.content}</p>
          </div>
        </div>
      `;
    }).join('');
}

// ===========================
// カレンダー
// ===========================
function renderCalendar(el) {
  const now = new Date();
  let calYear = now.getFullYear();
  let calMonth = now.getMonth();

  el.innerHTML = `
    <div class="toolbar">
      <button class="btn btn-secondary" id="cal-prev">&larr; 前月</button>
      <h3 id="cal-title" style="margin:0 16px;min-width:140px;text-align:center;"></h3>
      <button class="btn btn-secondary" id="cal-next">次月 &rarr;</button>
      <div class="spacer"></div>
      <select class="filter-select" id="cal-user-filter">
        <option value="">全担当者</option>
        ${MOCK_DATA.users.filter(u => u.isActive).map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
      </select>
    </div>
    <div class="card">
      <div class="card-body" style="padding:0;">
        <div class="cal-grid" id="cal-grid"></div>
      </div>
    </div>
  `;

  function draw() {
    document.getElementById('cal-title').textContent = `${calYear}年${calMonth + 1}月`;
    const userFilter = document.getElementById('cal-user-filter')?.value || '';
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date().toISOString().slice(0, 10);

    let tasks = MOCK_DATA.tasks.filter(t => {
      if (userFilter && t.assigneeUserId !== userFilter) return false;
      return true;
    });

    const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];
    let html = dayHeaders.map((d, i) => `<div class="cal-header ${i === 0 ? 'cal-sun' : i === 6 ? 'cal-sat' : ''}">${d}</div>`).join('');

    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-day cal-empty"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === today;
      const dow = (firstDay + d - 1) % 7;
      const dayTasks = tasks.filter(t => t.dueDate === dateStr);

      html += `<div class="cal-day ${isToday ? 'cal-today' : ''} ${dow === 0 ? 'cal-sun' : dow === 6 ? 'cal-sat' : ''}">
        <div class="cal-date">${d}</div>
        ${dayTasks.slice(0, 3).map(t => {
          const client = getClientById(t.clientId);
          return `<div class="cal-event ${getStatusClass(t.status)}" title="${client?.name}: ${t.title}">${client?.name?.slice(0, 6) || ''} ${t.title.slice(0, 8)}</div>`;
        }).join('')}
        ${dayTasks.length > 3 ? `<div class="cal-more">+${dayTasks.length - 3}件</div>` : ''}
      </div>`;
    }

    document.getElementById('cal-grid').innerHTML = html;
  }

  document.getElementById('cal-prev').addEventListener('click', () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } draw(); });
  document.getElementById('cal-next').addEventListener('click', () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } draw(); });
  document.getElementById('cal-user-filter').addEventListener('change', draw);
  draw();
}

// ===========================
// 報酬管理
// ===========================
function renderRewards(el) {
  el.innerHTML = `
    <div class="toolbar">
      <select class="filter-select" id="rw-month-filter">
        <option value="2026-03">2026年3月</option>
        <option value="2026-02">2026年2月</option>
        <option value="2026-01">2026年1月</option>
      </select>
      <div class="spacer"></div>
    </div>

    <div class="view-tabs" id="rw-tabs">
      <button class="view-tab active" data-view="by-staff">職員別</button>
      <button class="view-tab" data-view="by-client">顧客別</button>
    </div>

    <div class="stats-grid" id="rw-summary"></div>

    <div class="card">
      <div class="card-header"><h3 id="rw-table-title">職員別 報酬集計</h3></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead id="rw-thead"></thead>
            <tbody id="rw-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  let activeView = 'by-staff';
  function refresh() {
    const month = document.getElementById('rw-month-filter')?.value || '2026-03';
    renderRewardData(month, activeView);
  }

  document.getElementById('rw-tabs').addEventListener('click', e => {
    if (e.target.dataset.view) {
      activeView = e.target.dataset.view;
      document.querySelectorAll('#rw-tabs .view-tab').forEach(b => b.classList.toggle('active', b.dataset.view === activeView));
      refresh();
    }
  });
  document.getElementById('rw-month-filter').addEventListener('change', refresh);
  refresh();
}

function renderRewardData(month, viewType) {
  const rewards = MOCK_DATA.rewards.filter(r => r.month === month);
  const totalAmount = rewards.reduce((sum, r) => sum + r.amount, 0);
  const totalClients = new Set(rewards.map(r => r.clientId)).size;
  const totalStaff = new Set(rewards.map(r => r.userId)).size;

  document.getElementById('rw-summary').innerHTML = `
    <div class="stat-card accent-blue">
      <div class="stat-label">報酬合計</div>
      <div class="stat-value">${totalAmount.toLocaleString()}</div>
      <div class="stat-sub">円</div>
    </div>
    <div class="stat-card accent-green">
      <div class="stat-label">対象職員</div>
      <div class="stat-value">${totalStaff}</div>
      <div class="stat-sub">名</div>
    </div>
    <div class="stat-card accent-yellow">
      <div class="stat-label">対象顧客</div>
      <div class="stat-value">${totalClients}</div>
      <div class="stat-sub">社</div>
    </div>
  `;

  const thead = document.getElementById('rw-thead');
  const tbody = document.getElementById('rw-tbody');
  const title = document.getElementById('rw-table-title');

  if (viewType === 'by-staff') {
    title.textContent = '職員別 報酬集計';
    thead.innerHTML = '<tr><th>職員名</th><th>分類</th><th>基準割合</th><th>担当顧客数</th><th>報酬計</th></tr>';
    const grouped = {};
    rewards.forEach(r => {
      if (!grouped[r.userId]) grouped[r.userId] = { total: 0, clients: new Set() };
      grouped[r.userId].total += r.amount;
      grouped[r.userId].clients.add(r.clientId);
    });

    tbody.innerHTML = Object.entries(grouped).map(([uid, data]) => {
      const user = getUserById(uid);
      return `<tr>
        <td><strong>${user?.name || '-'}</strong></td>
        <td>${user?.staffFlag || '-'}</td>
        <td>${user?.baseRatio != null ? user.baseRatio + '%' : '-'}</td>
        <td>${data.clients.size}社</td>
        <td><strong>${data.total.toLocaleString()}円</strong></td>
      </tr>`;
    }).join('');
  } else {
    title.textContent = '顧客別 報酬内訳';
    thead.innerHTML = '<tr><th>顧客名</th><th>種別</th><th>月額報酬</th><th>担当者</th><th>配分額</th></tr>';
    const grouped = {};
    rewards.forEach(r => {
      if (!grouped[r.clientId]) grouped[r.clientId] = [];
      grouped[r.clientId].push(r);
    });

    let rows = '';
    Object.entries(grouped).forEach(([cid, rws]) => {
      const client = getClientById(cid);
      rws.forEach((r, i) => {
        const user = getUserById(r.userId);
        rows += `<tr>
          ${i === 0 ? `<td rowspan="${rws.length}"><strong>${client?.name || '-'}</strong></td><td rowspan="${rws.length}"><span class="type-badge ${client?.clientType === '法人' ? 'type-corp' : 'type-individual'}">${client?.clientType}</span></td><td rowspan="${rws.length}">${client?.monthlySales?.toLocaleString() || '-'}円</td>` : ''}
          <td>${user?.name || '-'}</td>
          <td>${r.amount.toLocaleString()}円</td>
        </tr>`;
      });
    });
    tbody.innerHTML = rows;
  }
}

// ===========================
// 外部連携
// ===========================
function renderIntegrations(el) {
  const integrations = [
    { id: 'int-dropbox', name: 'Dropbox', icon: '📁', description: '顧客資料フォルダとの自動連携', status: 'connected', connectedAt: '2026-01-15', account: 'libetax-office@dropbox.com' },
    { id: 'int-freee', name: 'freee会計', icon: '📊', description: '仕訳データ・試算表の自動取込', status: 'connected', connectedAt: '2026-02-01', account: 'libetax' },
    { id: 'int-chatwork', name: 'Chatwork', icon: '💬', description: '顧客・チーム間メッセージ連携', status: 'connected', connectedAt: '2025-12-10', account: 'libetax-team' },
    { id: 'int-slack', name: 'Slack', icon: '📢', description: 'チーム内通知・アラート配信', status: 'disconnected', connectedAt: null, account: null },
    { id: 'int-google', name: 'Google Workspace', icon: '📧', description: 'Gmail・カレンダー・Drive連携', status: 'connected', connectedAt: '2026-01-20', account: 'admin@libetax.jp' },
    { id: 'int-zoom', name: 'Zoom', icon: '🎥', description: 'ミーティング予約・録画管理', status: 'disconnected', connectedAt: null, account: null },
    { id: 'int-eltax', name: 'eLTAX', icon: '🏛️', description: '地方税電子申告連携', status: 'connected', connectedAt: '2026-03-01', account: '利用者ID: LT-XXXXX' },
    { id: 'int-etax', name: 'e-Tax', icon: '🏛️', description: '国税電子申告連携', status: 'connected', connectedAt: '2025-11-01', account: '利用者識別番号: XXXX-XXXX' },
  ];

  const connected = integrations.filter(i => i.status === 'connected').length;

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent-green">
        <div class="stat-label">接続済み</div>
        <div class="stat-value">${connected}</div>
        <div class="stat-sub">サービス</div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">未接続</div>
        <div class="stat-value">${integrations.length - connected}</div>
        <div class="stat-sub">サービス</div>
      </div>
    </div>

    <div class="int-grid">
      ${integrations.map(i => `
        <div class="card int-card">
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="font-size:28px;">${i.icon}</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:15px;">${i.name}</div>
                <div style="font-size:12px;color:var(--gray-500);">${i.description}</div>
              </div>
              <span class="status-badge ${i.status === 'connected' ? 'status-done' : 'status-todo'}">${i.status === 'connected' ? '接続済み' : '未接続'}</span>
            </div>
            ${i.status === 'connected' ? `
              <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
                <div>アカウント: ${i.account}</div>
                <div>接続日: ${formatDate(i.connectedAt)}</div>
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-secondary btn-sm" onclick="alert('同期設定画面（モック）')">設定</button>
                <button class="btn btn-secondary btn-sm" onclick="alert('テスト接続（モック）')">テスト</button>
                <button class="btn btn-danger btn-sm" onclick="alert('切断確認（モック）')">切断</button>
              </div>
            ` : `
              <button class="btn btn-primary btn-sm" onclick="alert('OAuth認証画面（モック）')">接続する</button>
            `}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===========================
// マイ設定
// ===========================
function renderSettings(el) {
  const u = MOCK_DATA.currentUser;
  const fullUser = getUserById(u.id);

  el.innerHTML = `
    <div class="detail-grid">
      <div>
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header"><h3>プロフィール</h3></div>
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
              <div style="width:64px;height:64px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:600;">${u.name[0]}</div>
              <div>
                <div style="font-size:18px;font-weight:600;">${u.name}</div>
                <div style="font-size:13px;color:var(--gray-500);">${u.email} / ${getRoleBadge(u.role)}</div>
              </div>
            </div>
            <div class="form-group">
              <label>表示名</label>
              <input type="text" value="${u.name}">
            </div>
            <div class="form-group">
              <label>メールアドレス</label>
              <input type="email" value="${u.email}">
            </div>
            <div class="form-group">
              <label>所属チーム</label>
              <input type="text" value="${fullUser?.team || '（なし）'}" disabled style="background:var(--gray-50);">
            </div>
            <button class="btn btn-primary" onclick="alert('保存しました（モック）')">保存</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>パスワード変更</h3></div>
          <div class="card-body">
            <div class="form-group">
              <label>現在のパスワード</label>
              <input type="password" placeholder="現在のパスワード">
            </div>
            <div class="form-group">
              <label>新しいパスワード</label>
              <input type="password" placeholder="新しいパスワード">
            </div>
            <div class="form-group">
              <label>新しいパスワード（確認）</label>
              <input type="password" placeholder="もう一度入力">
            </div>
            <button class="btn btn-primary" onclick="alert('パスワードを変更しました（モック）')">変更する</button>
          </div>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header"><h3>通知設定</h3></div>
          <div class="card-body">
            <div class="settings-list">
              <div class="settings-row">
                <div>
                  <div class="settings-label">タスク期限通知</div>
                  <div class="settings-desc">期限の3日前・当日に通知</div>
                </div>
                <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">タスク割当通知</div>
                  <div class="settings-desc">新しいタスクが割り当てられた時</div>
                </div>
                <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">差戻し通知</div>
                  <div class="settings-desc">タスクが差し戻された時</div>
                </div>
                <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">報告書通知</div>
                  <div class="settings-desc">チームの報告書が作成された時</div>
                </div>
                <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">メール通知</div>
                  <div class="settings-desc">重要な通知をメールでも受信</div>
                </div>
                <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">Chatwork通知</div>
                  <div class="settings-desc">Chatworkにも通知を送信</div>
                </div>
                <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>表示設定</h3></div>
          <div class="card-body">
            <div class="form-group">
              <label>デフォルト表示ページ</label>
              <select>
                <option selected>ダッシュボード</option>
                <option>タスク一覧</option>
                <option>進捗管理表</option>
              </select>
            </div>
            <div class="form-group">
              <label>1ページあたりの表示件数</label>
              <select>
                <option>20件</option>
                <option selected>50件</option>
                <option>100件</option>
              </select>
            </div>
            <button class="btn btn-primary" onclick="alert('保存しました（モック）')">保存</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
