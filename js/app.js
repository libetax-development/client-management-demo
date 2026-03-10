// ===========================
// MyKomon代替ツール UIモック
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
    views: '管理表（ビュー）',
    staff: '職員一覧',
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
  registerPage('views', renderViews);
  registerPage('staff', renderStaff);
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
// 管理表（ビュー）
// ===========================
function renderViews(el) {
  el.innerHTML = `
    <div class="view-tabs" id="view-tabs">
      <button class="view-tab active" data-view="assignee">担当別ビュー</button>
      <button class="view-tab" data-view="due">期限別ビュー</button>
      <button class="view-tab" data-view="status">ステータス別ビュー</button>
    </div>
    <div class="alert alert-info">Phase 1 では固定ビューのみ提供します。Phase 2 でフィルタ・列・集計をカスタマイズできるビュー定義UIを実装予定です。</div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead id="view-thead"></thead>
          <tbody id="view-tbody"></tbody>
        </table>
      </div>
    </div>
    <div style="margin-top:12px;text-align:right;color:var(--gray-400);font-size:12px;" id="view-count"></div>
  `;

  let activeView = 'assignee';
  document.getElementById('view-tabs').addEventListener('click', e => {
    if (e.target.dataset.view) {
      activeView = e.target.dataset.view;
      document.querySelectorAll('#view-tabs .view-tab').forEach(b => b.classList.toggle('active', b.dataset.view === activeView));
      renderView(activeView);
    }
  });
  renderView(activeView);
}

function renderView(viewType) {
  const thead = document.getElementById('view-thead');
  const tbody = document.getElementById('view-tbody');
  const count = document.getElementById('view-count');
  const tasks = MOCK_DATA.tasks.filter(t => t.status !== '完了');

  if (viewType === 'assignee') {
    thead.innerHTML = '<tr><th>担当者</th><th>顧客名</th><th>タスク名</th><th>ステータス</th><th>期限日</th></tr>';
    const sorted = [...tasks].sort((a, b) => a.assigneeUserId.localeCompare(b.assigneeUserId) || a.dueDate.localeCompare(b.dueDate));
    tbody.innerHTML = sorted.map(t => {
      const assignee = getUserById(t.assigneeUserId);
      const client = getClientById(t.clientId);
      return `<tr><td>${assignee?.name||'-'}</td><td>${client?.name||'-'}</td><td>${t.title}</td><td><span class="status-badge ${getStatusClass(t.status)}">${t.status}</span></td><td>${formatDate(t.dueDate)}</td></tr>`;
    }).join('');
  } else if (viewType === 'due') {
    thead.innerHTML = '<tr><th>期限日</th><th>顧客名</th><th>タスク名</th><th>ステータス</th><th>担当者</th></tr>';
    const sorted = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    tbody.innerHTML = sorted.map(t => {
      const assignee = getUserById(t.assigneeUserId);
      const client = getClientById(t.clientId);
      return `<tr><td>${formatDate(t.dueDate)}</td><td>${client?.name||'-'}</td><td>${t.title}</td><td><span class="status-badge ${getStatusClass(t.status)}">${t.status}</span></td><td>${assignee?.name||'-'}</td></tr>`;
    }).join('');
  } else {
    thead.innerHTML = '<tr><th>ステータス</th><th>顧客名</th><th>タスク名</th><th>担当者</th><th>期限日</th></tr>';
    const order = ['差戻し', '進行中', '未着手'];
    const sorted = [...tasks].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || a.dueDate.localeCompare(b.dueDate));
    tbody.innerHTML = sorted.map(t => {
      const assignee = getUserById(t.assigneeUserId);
      const client = getClientById(t.clientId);
      return `<tr><td><span class="status-badge ${getStatusClass(t.status)}">${t.status}</span></td><td>${client?.name||'-'}</td><td>${t.title}</td><td>${assignee?.name||'-'}</td><td>${formatDate(t.dueDate)}</td></tr>`;
    }).join('');
  }
  count.textContent = `${tasks.length}件（完了タスクを除く）`;
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
