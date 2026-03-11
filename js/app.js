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
    calendar: 'カレンダー',
    rewards: '報酬管理',
    chatrooms: 'チャットマスタ',
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
  const typeIcons = { task_due: '⏰', task_assigned: '📋', report_created: '📝' };

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
            <div class="notif-type-icon ${n.type}">${typeIcons[n.type] || '🔔'}</div>
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

// ── タスク作成モーダル ──
function openTaskModal() {
  const modal = document.getElementById('task-create-modal');
  const clientSelect = document.getElementById('new-task-client');
  const assigneeSelect = document.getElementById('new-task-assignee');

  clientSelect.innerHTML = MOCK_DATA.clients.filter(c => c.isActive).map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');

  assigneeSelect.innerHTML = MOCK_DATA.users.filter(u => u.isActive && u.role !== 'admin').map(u =>
    `<option value="${u.id}">${u.name}</option>`
  ).join('');

  document.getElementById('new-task-title').value = '';
  document.getElementById('new-task-due').value = '';
  document.getElementById('new-task-status').value = '未着手';

  modal.classList.add('show');
}

function closeTaskModal() {
  document.getElementById('task-create-modal').classList.remove('show');
}

function submitNewTask() {
  const title = document.getElementById('new-task-title').value.trim();
  const clientId = document.getElementById('new-task-client').value;
  const assigneeId = document.getElementById('new-task-assignee').value;
  const dueDate = document.getElementById('new-task-due').value;
  const status = document.getElementById('new-task-status').value;

  if (!title) { alert('タスク名を入力してください'); return; }
  if (!dueDate) { alert('期限を入力してください'); return; }

  const newId = 'tk-' + String(MOCK_DATA.tasks.length + 1).padStart(3, '0');
  const now = new Date().toISOString().slice(0, 10);

  MOCK_DATA.tasks.push({
    id: newId,
    clientId,
    assigneeUserId: assigneeId,
    title,
    status,
    dueDate,
    createdAt: now,
  });

  closeTaskModal();

  // 現在のページを再描画
  if (currentPage === 'tasks') navigateTo('tasks');
  else if (currentPage === 'dashboard') navigateTo('dashboard');
  else alert(`タスク「${title}」を作成しました`);
}

// ── 顧客追加・編集モーダル ──
let editingClientId = null;

function openClientEditModal(clientId) {
  openClientModal(clientId);
}

function openClientModal(clientId) {
  editingClientId = clientId || null;
  const modal = document.getElementById('client-create-modal');
  const mainSelect = document.getElementById('new-client-main');
  const subSelect = document.getElementById('new-client-sub');
  const fiscalSelect = document.getElementById('new-client-fiscal');

  const staffOptions = MOCK_DATA.users.filter(u => u.isActive && u.role !== 'admin').map(u =>
    `<option value="${u.id}">${u.name}</option>`
  ).join('');
  mainSelect.innerHTML = staffOptions;
  subSelect.innerHTML = '<option value="">なし</option>' + staffOptions;

  fiscalSelect.innerHTML = Array.from({length: 12}, (_, i) =>
    `<option value="${i + 1}" ${i + 1 === 3 ? 'selected' : ''}>${i + 1}月</option>`
  ).join('');

  // モーダルタイトル更新
  const modalTitle = modal.querySelector('.modal-header h3') || modal.querySelector('.modal-header h2');
  if (modalTitle) modalTitle.textContent = editingClientId ? '顧客情報編集' : '新規顧客登録';

  if (editingClientId) {
    const c = getClientById(editingClientId);
    if (c) {
      document.getElementById('new-client-name').value = c.name || '';
      document.getElementById('new-client-type').value = c.clientType || '法人';
      document.getElementById('new-client-sales').value = c.monthlySales || '';
      document.getElementById('new-client-address').value = c.address || '';
      document.getElementById('new-client-tel').value = c.tel || '';
      document.getElementById('new-client-industry').value = c.industry || '';
      document.getElementById('new-client-representative').value = c.representative || '';
      document.getElementById('new-client-taxoffice').value = c.taxOffice || '';
      document.getElementById('new-client-main').value = c.mainUserId || '';
      document.getElementById('new-client-sub').value = c.subUserId || '';
      document.getElementById('new-client-fiscal').value = c.fiscalMonth || 3;
      document.getElementById('new-client-cw-id').value = c.cwAccountId || '';
      document.getElementById('new-client-cw-name').value = c.cwAccountName || '';
    }
  } else {
    document.getElementById('new-client-name').value = '';
    document.getElementById('new-client-type').value = '法人';
    document.getElementById('new-client-sales').value = '';
    document.getElementById('new-client-address').value = '';
    document.getElementById('new-client-tel').value = '';
    document.getElementById('new-client-industry').value = '';
    document.getElementById('new-client-representative').value = '';
    document.getElementById('new-client-taxoffice').value = '';
    document.getElementById('new-client-cw-id').value = '';
    document.getElementById('new-client-cw-name').value = '';
  }

  modal.classList.add('show');
}

function closeClientModal() {
  document.getElementById('client-create-modal').classList.remove('show');
}

function submitNewClient() {
  const name = document.getElementById('new-client-name').value.trim();
  const clientType = document.getElementById('new-client-type').value;
  const fiscalMonth = parseInt(document.getElementById('new-client-fiscal').value);
  const mainUserId = document.getElementById('new-client-main').value;
  const subUserId = document.getElementById('new-client-sub').value || null;
  const monthlySales = parseInt(document.getElementById('new-client-sales').value) || 0;
  const address = document.getElementById('new-client-address').value.trim();
  const tel = document.getElementById('new-client-tel').value.trim();
  const industry = document.getElementById('new-client-industry').value.trim();
  const representative = document.getElementById('new-client-representative').value.trim();
  const taxOffice = document.getElementById('new-client-taxoffice').value.trim();
  const cwAccountId = document.getElementById('new-client-cw-id').value.trim();
  const cwAccountName = document.getElementById('new-client-cw-name').value.trim();

  if (!name) { alert('顧客名を入力してください'); return; }
  if (!monthlySales) { alert('月額報酬を入力してください'); return; }

  if (editingClientId) {
    // 編集モード
    const c = getClientById(editingClientId);
    if (c) {
      c.name = name;
      c.clientType = clientType;
      c.fiscalMonth = fiscalMonth;
      c.mainUserId = mainUserId;
      c.subUserId = subUserId;
      c.mgrUserId = mainUserId;
      c.monthlySales = monthlySales;
      c.address = address;
      c.tel = tel;
      c.industry = industry;
      c.representative = representative;
      c.taxOffice = taxOffice;
      c.cwAccountId = cwAccountId;
      c.cwAccountName = cwAccountName;
    }
    closeClientModal();
    navigateTo('client-detail', { id: editingClientId });
    editingClientId = null;
  } else {
    // 新規作成モード
    const nextCode = String(parseInt(MOCK_DATA.clients[MOCK_DATA.clients.length - 1].clientCode) + 1).padStart(6, '0');
    const newId = 'c-' + String(MOCK_DATA.clients.length + 1).padStart(3, '0');

    MOCK_DATA.clients.push({
      id: newId,
      clientCode: nextCode,
      name,
      clientType,
      fiscalMonth,
      isActive: true,
      mainUserId,
      subUserId,
      mgrUserId: mainUserId,
      monthlySales,
      address,
      tel,
      industry,
      representative,
      taxOffice,
      memo: '',
      establishDate: '',
      cwAccountId,
      cwAccountName,
    });

    closeClientModal();

    if (currentPage === 'clients') navigateTo('clients');
    else navigateTo('client-detail', { id: newId });
  }
}

// ── 職員追加モーダル ──
let editingStaffId = null;

function openStaffModal(staffId) {
  editingStaffId = staffId || null;
  const modal = document.getElementById('staff-create-modal');
  const deptSelect = document.getElementById('new-staff-deptId');

  deptSelect.innerHTML = '<option value="">選択してください</option>' +
    MOCK_DATA.departments.filter(d => d.status === 1)
      .map(d => `<option value="${d.deptId}">${d.deptName}</option>`).join('');

  // モーダルタイトル更新
  const modalTitle = modal.querySelector('.modal-header h3');
  if (modalTitle) modalTitle.textContent = editingStaffId ? '職員情報編集' : '新規職員登録';

  if (editingStaffId) {
    const u = getUserById(editingStaffId);
    if (u) {
      document.getElementById('new-staff-lastName').value = u.lastName || '';
      document.getElementById('new-staff-firstName').value = u.firstName || '';
      document.getElementById('new-staff-lastNameKana').value = u.lastNameKana || '';
      document.getElementById('new-staff-firstNameKana').value = u.firstNameKana || '';
      document.getElementById('new-staff-email').value = u.email || '';
      document.getElementById('new-staff-tel').value = u.tel || '';
      document.getElementById('new-staff-mobile').value = u.mobile || '';
      document.getElementById('new-staff-position').value = u.position || '';
      document.getElementById('new-staff-employmentType').value = u.employmentType || '正社員';
      document.getElementById('new-staff-joinDate').value = u.joinDate || '';
      document.getElementById('new-staff-role').value = u.role || 'member';
      document.getElementById('new-staff-staffFlag').value = u.staffFlag || '税務';
      document.getElementById('new-staff-memo').value = u.memo || '';
      document.getElementById('new-staff-deptId').value = u.deptId || '';
    }
  } else {
    document.getElementById('new-staff-lastName').value = '';
    document.getElementById('new-staff-firstName').value = '';
    document.getElementById('new-staff-lastNameKana').value = '';
    document.getElementById('new-staff-firstNameKana').value = '';
    document.getElementById('new-staff-email').value = '';
    document.getElementById('new-staff-tel').value = '';
    document.getElementById('new-staff-mobile').value = '';
    document.getElementById('new-staff-position').value = '';
    document.getElementById('new-staff-employmentType').value = '正社員';
    document.getElementById('new-staff-joinDate').value = '';
    document.getElementById('new-staff-role').value = 'member';
    document.getElementById('new-staff-staffFlag').value = '税務';
    document.getElementById('new-staff-memo').value = '';
  }

  modal.classList.add('show');
}

function closeStaffModal() {
  document.getElementById('staff-create-modal').classList.remove('show');
}

function submitNewStaff() {
  const lastName = document.getElementById('new-staff-lastName').value.trim();
  const firstName = document.getElementById('new-staff-firstName').value.trim();
  const lastNameKana = document.getElementById('new-staff-lastNameKana').value.trim();
  const firstNameKana = document.getElementById('new-staff-firstNameKana').value.trim();
  const email = document.getElementById('new-staff-email').value.trim();
  const tel = document.getElementById('new-staff-tel').value.trim();
  const mobile = document.getElementById('new-staff-mobile').value.trim();
  const deptIdVal = document.getElementById('new-staff-deptId').value;
  const deptId = deptIdVal ? parseInt(deptIdVal) : null;
  const position = document.getElementById('new-staff-position').value.trim();
  const employmentType = document.getElementById('new-staff-employmentType').value;
  const joinDate = document.getElementById('new-staff-joinDate').value;
  const role = document.getElementById('new-staff-role').value;
  const staffFlag = document.getElementById('new-staff-staffFlag').value;
  const memo = document.getElementById('new-staff-memo').value.trim();

  if (!lastName) { alert('姓を入力してください'); return; }
  if (!email) { alert('メールアドレスを入力してください'); return; }

  const name = firstName ? lastName + ' ' + firstName : lastName;

  if (editingStaffId) {
    const u = getUserById(editingStaffId);
    if (u) {
      u.lastName = lastName; u.firstName = firstName;
      u.lastNameKana = lastNameKana; u.firstNameKana = firstNameKana;
      u.name = name; u.email = email; u.tel = tel; u.mobile = mobile;
      u.deptId = deptId; u.position = position; u.employmentType = employmentType;
      u.joinDate = joinDate; u.role = role; u.staffFlag = staffFlag; u.memo = memo;
      u.loginId = email.split('@')[0];
    }
    closeStaffModal();
    navigateTo('staff-detail', { id: editingStaffId });
    editingStaffId = null;
  } else {
    const nextCode = 'A' + String(MOCK_DATA.users.length + 1).padStart(3, '0');
    const newId = 'u-' + String(MOCK_DATA.users.length + 1).padStart(3, '0');
    const loginId = email.split('@')[0];

    MOCK_DATA.users.push({
      id: newId, staffCode: nextCode, lastName, firstName,
      lastNameKana, firstNameKana, name, email, tel, mobile,
      role, deptId, team: null, position, employmentType,
      joinDate, memo, loginId, isActive: true, baseRatio: null, staffFlag,
    });

    closeStaffModal();

    if (currentPage === 'staff') navigateTo('staff');
    else alert(`職員「${name}」を登録しました`);
  }
}

// ── タスク編集モーダル ──
function openTaskEditModal(taskId) {
  const t = MOCK_DATA.tasks.find(x => x.id === taskId);
  if (!t) return;
  const modal = document.getElementById('task-edit-modal');
  document.getElementById('edit-task-id').value = t.id;
  document.getElementById('edit-task-title').value = t.title;
  document.getElementById('edit-task-status').value = t.status;
  document.getElementById('edit-task-due').value = t.dueDate;

  const assigneeSelect = document.getElementById('edit-task-assignee');
  assigneeSelect.innerHTML = MOCK_DATA.users.filter(u => u.isActive && u.role !== 'admin').map(u =>
    `<option value="${u.id}" ${u.id === t.assigneeUserId ? 'selected' : ''}>${u.name}</option>`
  ).join('');

  modal.classList.add('show');
}

function closeTaskEditModal() {
  document.getElementById('task-edit-modal').classList.remove('show');
}

function submitEditTask() {
  const id = document.getElementById('edit-task-id').value;
  const t = MOCK_DATA.tasks.find(x => x.id === id);
  if (!t) return;
  t.title = document.getElementById('edit-task-title').value.trim();
  t.assigneeUserId = document.getElementById('edit-task-assignee').value;
  t.status = document.getElementById('edit-task-status').value;
  t.dueDate = document.getElementById('edit-task-due').value;
  closeTaskEditModal();
  navigateTo('task-detail', { id });
}

function deleteTask() {
  const id = document.getElementById('edit-task-id').value;
  if (!confirm('このタスクを削除しますか？')) return;
  MOCK_DATA.tasks = MOCK_DATA.tasks.filter(x => x.id !== id);
  closeTaskEditModal();
  navigateTo('tasks');
}

// ── 工数入力モーダル ──
function openTimesheetModal() {
  const modal = document.getElementById('timesheet-create-modal');
  document.getElementById('new-ts-user').innerHTML = MOCK_DATA.users.filter(u => u.isActive).map(u =>
    `<option value="${u.id}">${u.name}</option>`
  ).join('');
  document.getElementById('new-ts-client').innerHTML = MOCK_DATA.clients.filter(c => c.isActive).map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');
  document.getElementById('new-ts-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('new-ts-hours').value = '';
  document.getElementById('new-ts-desc').value = '';
  modal.classList.add('show');
}

function closeTimesheetModal() {
  document.getElementById('timesheet-create-modal').classList.remove('show');
}

function submitNewTimeEntry() {
  const userId = document.getElementById('new-ts-user').value;
  const clientId = document.getElementById('new-ts-client').value;
  const date = document.getElementById('new-ts-date').value;
  const hours = parseFloat(document.getElementById('new-ts-hours').value);
  const description = document.getElementById('new-ts-desc').value.trim();

  if (!hours || hours <= 0) { alert('時間を入力してください'); return; }
  if (!description) { alert('作業内容を入力してください'); return; }

  const newId = 'te-' + String(MOCK_DATA.timeEntries.length + 1).padStart(3, '0');
  MOCK_DATA.timeEntries.push({ id: newId, userId, clientId, taskId: null, date, hours, description });
  closeTimesheetModal();
  if (currentPage === 'timesheet') navigateTo('timesheet');
  else alert('工数を登録しました');
}

// ── 報告書作成モーダル ──
function openReportModal() {
  const modal = document.getElementById('report-create-modal');
  document.getElementById('new-rp-type').value = '業務報告書';
  document.getElementById('new-rp-category').value = '確定申告';
  document.getElementById('new-rp-client').value = '';
  document.getElementById('new-rp-title').value = '';
  document.getElementById('new-rp-rank').value = 'B';
  document.getElementById('new-rp-attach').checked = false;
  modal.classList.add('show');
}

function closeReportModal() {
  document.getElementById('report-create-modal').classList.remove('show');
}

function submitNewReport() {
  const title = document.getElementById('new-rp-title').value.trim();
  const clientName = document.getElementById('new-rp-client').value.trim();
  const type = document.getElementById('new-rp-type').value;
  const category = document.getElementById('new-rp-category').value;
  const rank = document.getElementById('new-rp-rank').value;
  const hasAttachment = document.getElementById('new-rp-attach').checked;

  if (!title) { alert('タイトルを入力してください'); return; }

  const newId = 'rp-' + String(MOCK_DATA.reports.length + 1).padStart(3, '0');

  MOCK_DATA.reports.push({
    id: newId, createdAt: new Date().toISOString(),
    authorId: MOCK_DATA.currentUser.id, type, category,
    clientName, title, rank, readStatus: '一時保存中', hasAttachment,
  });
  closeReportModal();
  if (currentPage === 'reports') navigateTo('reports');
  else alert(`報告書「${title}」を作成しました`);
}

// ── 進捗管理表 作成モーダル ──
function openProgressCreateModal(type) {
  const modal = document.getElementById('progress-create-modal');
  document.getElementById('pg-modal-title').textContent = `進捗管理表の作成（${type}）`;
  document.getElementById('new-pg-manager').innerHTML = MOCK_DATA.users.filter(u => u.isActive && (u.role === 'admin' || u.role === 'team_leader')).map(u =>
    `<option value="${u.id}">${u.name}</option>`
  ).join('');
  document.getElementById('new-pg-name').value = '';
  document.getElementById('new-pg-category').value = '法人決算';

  if (type === '中間申告・予定納付') {
    document.getElementById('new-pg-category').value = '中間申告';
    document.getElementById('new-pg-columns').value = '資料回収, 中間計算, 申告書作成, レビュー, 電子申告';
  } else if (type === 'サンプル') {
    document.getElementById('new-pg-columns').value = '資料回収, 記帳確認, 決算整理, 申告書作成, レビュー, 電子申告, 納品';
  } else {
    document.getElementById('new-pg-columns').value = '';
  }

  // ドロップダウンを閉じる
  const menu = document.getElementById('pg-create-menu');
  if (menu) menu.style.display = 'none';

  modal.classList.add('show');
}

function closeProgressCreateModal() {
  document.getElementById('progress-create-modal').classList.remove('show');
}

function submitNewProgress() {
  const name = document.getElementById('new-pg-name').value.trim();
  const category = document.getElementById('new-pg-category').value;
  const managerId = document.getElementById('new-pg-manager').value;
  const columnsText = document.getElementById('new-pg-columns').value.trim();

  if (!name) { alert('管理表名を入力してください'); return; }
  if (!columnsText) { alert('工程列を入力してください'); return; }

  const columns = columnsText.split(',').map(c => c.trim()).filter(Boolean);
  const newId = 'ps-' + String(MOCK_DATA.progressSheets.length + 1).padStart(3, '0');

  MOCK_DATA.progressSheets.push({
    id: newId, name, category, status: '利用中',
    managerId, createdAt: new Date().toISOString().slice(0, 10),
    columns, targets: [],
  });
  closeProgressCreateModal();
  if (currentPage === 'progress') navigateTo('progress');
  else alert(`進捗管理表「${name}」を作成しました`);
}

// ── 進捗管理表 設定変更モーダル ──
function openProgressSettingsModal(sheetId) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const modal = document.getElementById('progress-settings-modal');
  document.getElementById('edit-pg-id').value = s.id;
  document.getElementById('edit-pg-name').value = s.name;
  document.getElementById('edit-pg-status').value = s.status;

  document.getElementById('edit-pg-manager').innerHTML = MOCK_DATA.users.filter(u => u.isActive && (u.role === 'admin' || u.role === 'team_leader')).map(u =>
    `<option value="${u.id}" ${u.id === s.managerId ? 'selected' : ''}>${u.name}</option>`
  ).join('');

  modal.classList.add('show');
}

function closeProgressSettingsModal() {
  document.getElementById('progress-settings-modal').classList.remove('show');
}

function submitEditProgress() {
  const id = document.getElementById('edit-pg-id').value;
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  s.name = document.getElementById('edit-pg-name').value.trim();
  s.status = document.getElementById('edit-pg-status').value;
  s.managerId = document.getElementById('edit-pg-manager').value;
  closeProgressSettingsModal();
  if (currentPage === 'progress') navigateTo('progress');
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
  registerPage('staff-detail', renderStaffDetail);
  registerPage('timesheet', renderTimesheet);
  registerPage('reports', renderReports);
  registerPage('calendar', renderCalendar);
  registerPage('rewards', renderRewards);
  registerPage('chatrooms', renderChatRooms);
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
      <button class="btn btn-primary" onclick="openClientModal()">+ 新規顧客</button>
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
    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>基本情報</h3><button class="btn btn-primary btn-sm" onclick="openClientEditModal('${c.id}')">編集</button></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">顧客コード</div><div class="detail-value">${c.clientCode}</div></div>
          <div class="detail-row"><div class="detail-label">顧客名</div><div class="detail-value">${c.name}</div></div>
          <div class="detail-row"><div class="detail-label">種別</div><div class="detail-value"><span class="type-badge ${c.clientType === '法人' ? 'type-corp' : 'type-individual'}">${c.clientType}</span></div></div>
          <div class="detail-row"><div class="detail-label">決算月</div><div class="detail-value">${c.fiscalMonth}月</div></div>
          <div class="detail-row"><div class="detail-label">月額報酬（税抜）</div><div class="detail-value">${c.monthlySales.toLocaleString()}円</div></div>
          <div class="detail-row"><div class="detail-label">住所</div><div class="detail-value">${c.address || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">電話番号</div><div class="detail-value">${c.tel || '-'}</div></div>
          ${c.clientType === '法人' ? `<div class="detail-row"><div class="detail-label">代表者</div><div class="detail-value">${c.representative || '-'}</div></div>` : ''}
          ${c.clientType === '法人' ? `<div class="detail-row"><div class="detail-label">設立日</div><div class="detail-value">${formatDate(c.establishDate)}</div></div>` : ''}
          <div class="detail-row"><div class="detail-label">業種</div><div class="detail-value">${c.industry || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">管轄税務署</div><div class="detail-value">${c.taxOffice || '-'}</div></div>
          ${c.memo ? `<div class="detail-row"><div class="detail-label">備考</div><div class="detail-value">${c.memo}</div></div>` : ''}
          <div class="detail-row"><div class="detail-label">ステータス</div><div class="detail-value">${c.isActive ? '有効' : '無効'}</div></div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-header"><h3>担当者</h3></div>
          <div class="card-body">
            <div class="detail-row"><div class="detail-label">主担当</div><div class="detail-value">${main?.name || '-'}</div></div>
            <div class="detail-row"><div class="detail-label">副担当</div><div class="detail-value">${sub?.name || '-'}</div></div>
            <div class="detail-row"><div class="detail-label">担当税理士</div><div class="detail-value">${mgr?.name || '-'}</div></div>
            <div class="detail-row"><div class="detail-label">外部リンク</div><div class="detail-value"><a href="#" onclick="event.preventDefault();window.open('https://www.dropbox.com','_blank')">Dropboxフォルダを開く</a></div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>Chatwork連携</h3></div>
          <div class="card-body">
            <div class="detail-row"><div class="detail-label">CWアカウントID</div><div class="detail-value">${c.cwAccountId ? c.cwAccountId : '<span style="color:var(--gray-400)">未設定</span>'}</div></div>
            <div class="detail-row"><div class="detail-label">CW表示名</div><div class="detail-value">${c.cwAccountName || '<span style="color:var(--gray-400)">未設定</span>'}</div></div>
            <div class="detail-row"><div class="detail-label">メンション</div><div class="detail-value">${c.cwAccountId ? '<code style="background:var(--gray-100);padding:2px 6px;border-radius:3px;font-size:12px;">[To:' + c.cwAccountId + ']' + (c.cwAccountName || c.name) + 'さん</code>' : '<span style="color:var(--gray-400)">-</span>'}</div></div>
            ${(() => {
              const rooms = getChatRoomsByClient(c.id);
              if (rooms.length === 0) return '<div class="detail-row"><div class="detail-label">関連ルーム</div><div class="detail-value"><span style="color:var(--gray-400)">なし</span></div></div>';
              return rooms.map(r => `<div class="detail-row"><div class="detail-label">関連ルーム</div><div class="detail-value"><a href="${r.roomUrl}" target="_blank">${r.roomName}</a></div></div>`).join('');
            })()}
          </div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:24px">
      <div class="card-header"><h3>関連タスク</h3><button class="btn btn-primary btn-sm" onclick="openTaskModal()">+ タスク追加</button></div>
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
    <div style="margin-top:24px;text-align:right;">
      <button class="btn btn-danger" onclick="deleteClient('${c.id}')" style="background:var(--danger);color:#fff;border:none;">顧客を削除</button>
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
      <button class="btn btn-primary" onclick="openTaskModal()">+ 新規タスク</button>
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
        <div class="card-header"><h3>タスク情報</h3><button class="btn btn-secondary btn-sm" onclick="openTaskEditModal('${t.id}')">編集</button></div>
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
          <a href="#" class="dropdown-item" onclick="event.preventDefault();openProgressCreateModal('通常')">進捗管理表の作成（通常版）</a>
          <a href="#" class="dropdown-item" onclick="event.preventDefault();openProgressCreateModal('中間申告・予定納付')">進捗管理表の作成（中間申告・予定納付）</a>
          <a href="#" class="dropdown-item" onclick="event.preventDefault();openProgressCreateModal('サンプル')">サンプルから作成</a>
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
                      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();openProgressSettingsModal('${s.id}')">設定変更</button>
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
      <button class="btn btn-secondary btn-sm" onclick="exportProgressCSV('${sheet.id}')">エクスポート</button>
      <button class="btn btn-secondary btn-sm" onclick="bulkStatusUpdate('${sheet.id}')">一括操作</button>
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
            return `<td class="pg-step-cell"><span class="status-badge ${getStatusClass(val)}" style="cursor:pointer;" onclick="event.stopPropagation();cycleProgressStatus('${sheet.id}','${t.clientId}','${c}')">${val}</span></td>`;
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

function cycleProgressStatus(sheetId, clientId, colName) {
  const cycle = ['未着手', '進行中', '完了', '差戻し'];
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const target = sheet.targets.find(t => t.clientId === clientId);
  if (!target) return;
  const current = target.steps[colName] || '未着手';
  const idx = cycle.indexOf(current);
  target.steps[colName] = cycle[(idx + 1) % cycle.length];
  navigateTo('progress-detail', { id: sheetId });
}

function exportProgressCSV(sheetId) {
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const header = ['顧客コード', '顧客名', ...sheet.columns];
  const rows = sheet.targets.map(t => {
    const client = getClientById(t.clientId);
    return [client?.clientCode || '', client?.name || '', ...sheet.columns.map(c => t.steps[c] || '未着手')];
  });
  const csvContent = [header, ...rows].map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sheet.name + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function bulkStatusUpdate(sheetId) {
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const status = prompt('一括変更先のステータスを選択してください:\n1: 未着手\n2: 進行中\n3: 完了\n\n番号を入力');
  const map = { '1': '未着手', '2': '進行中', '3': '完了' };
  const target = map[status];
  if (!target) return;
  sheet.targets.forEach(t => {
    sheet.columns.forEach(c => {
      if (t.steps[c] !== '完了') t.steps[c] = target;
    });
  });
  navigateTo('progress-detail', { id: sheetId });
}

// ===========================
// 職員一覧
// ===========================
function getDeptName(deptId) {
  if (!deptId) return '-';
  const dept = MOCK_DATA.departments.find(d => d.deptId === deptId);
  return dept ? dept.deptName : '-';
}

function renderStaff(el) {
  const deptOptions = MOCK_DATA.departments.filter(d => d.status === 1)
    .map(d => `<option value="${d.deptId}">${d.deptName}</option>`).join('');
  const empTypes = [...new Set(MOCK_DATA.users.map(u => u.employmentType).filter(Boolean))];
  const empTypeOptions = empTypes.map(t => `<option value="${t}">${t}</option>`).join('');

  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="氏名・コード・フリガナで検索..." id="staff-search">
      <select class="filter-select" id="staff-role-filter">
        <option value="">全ロール</option>
        <option value="admin">管理者</option>
        <option value="team_leader">チームリーダー</option>
        <option value="member">メンバー</option>
      </select>
      <select class="filter-select" id="staff-dept-filter">
        <option value="">全部署</option>
        ${deptOptions}
      </select>
      <select class="filter-select" id="staff-emptype-filter">
        <option value="">全雇用形態</option>
        ${empTypeOptions}
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openStaffModal()">+ 職員追加</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>コード</th><th>氏名</th><th>フリガナ</th><th>メール</th><th>部署</th><th>役職</th><th>雇用形態</th><th>ステータス</th></tr></thead>
          <tbody id="staff-table-body"></tbody>
        </table>
      </div>
    </div>
  `;
  renderStaffTable();

  document.getElementById('staff-search').addEventListener('input', renderStaffTable);
  document.getElementById('staff-role-filter').addEventListener('change', renderStaffTable);
  document.getElementById('staff-dept-filter').addEventListener('change', renderStaffTable);
  document.getElementById('staff-emptype-filter').addEventListener('change', renderStaffTable);
}

function renderStaffTable() {
  const search = (document.getElementById('staff-search')?.value || '').toLowerCase();
  const roleFilter = document.getElementById('staff-role-filter')?.value || '';
  const deptFilter = document.getElementById('staff-dept-filter')?.value || '';
  const empTypeFilter = document.getElementById('staff-emptype-filter')?.value || '';

  let users = MOCK_DATA.users.filter(u => {
    if (search) {
      const kana = ((u.lastNameKana || '') + ' ' + (u.firstNameKana || '')).toLowerCase();
      const fullName = ((u.lastName || '') + ' ' + (u.firstName || '')).toLowerCase();
      if (!u.name.toLowerCase().includes(search) && !u.staffCode.toLowerCase().includes(search) && !kana.includes(search) && !fullName.includes(search)) return false;
    }
    if (roleFilter && u.role !== roleFilter) return false;
    if (deptFilter && String(u.deptId) !== deptFilter) return false;
    if (empTypeFilter && u.employmentType !== empTypeFilter) return false;
    return true;
  });

  const tbody = document.getElementById('staff-table-body');
  tbody.innerHTML = users.map(u => {
    const displayName = (u.lastName || '') + (u.firstName ? ' ' + u.firstName : '');
    const displayKana = (u.lastNameKana || '') + (u.firstNameKana ? ' ' + u.firstNameKana : '');
    return `
    <tr class="clickable" onclick="navigateTo('staff-detail',{id:'${u.id}'})">
      <td>${u.staffCode || '-'}</td>
      <td><strong>${displayName || u.name}</strong></td>
      <td>${displayKana || '-'}</td>
      <td>${u.email || '-'}</td>
      <td>${getDeptName(u.deptId)}</td>
      <td>${u.position || '-'}</td>
      <td>${u.employmentType || '-'}</td>
      <td>
        <button class="btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-primary'}" onclick="event.stopPropagation();toggleStaffActive('${u.id}')" style="font-size:11px;padding:3px 8px;">
          ${u.isActive ? '有効 ✓' : '無効'}
        </button>
      </td>
    </tr>`;
  }).join('');
}

function toggleStaffActive(userId) {
  const u = MOCK_DATA.users.find(x => x.id === userId);
  if (!u) return;
  const action = u.isActive ? '無効' : '有効';
  if (!confirm(`${u.name} を${action}にしますか？`)) return;
  u.isActive = !u.isActive;
  renderStaffTable();
}

// ===========================
// 職員詳細
// ===========================
function renderStaffDetail(el, params) {
  const u = getUserById(params.id);
  if (!u) { el.innerHTML = '<div class="empty-state"><div class="icon">?</div><p>職員が見つかりません</p></div>'; return; }
  document.getElementById('header-title').textContent = `職員詳細 - ${u.name}`;
  const displayKana = (u.lastNameKana || '') + (u.firstNameKana ? ' ' + u.firstNameKana : '');
  const clients = MOCK_DATA.clients.filter(c => c.mainUserId === u.id || c.subUserId === u.id);

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('staff')">&larr; 職員一覧に戻る</a></div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>基本情報</h3><button class="btn btn-primary btn-sm" onclick="openStaffModal('${u.id}')">編集</button></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">職員コード</div><div class="detail-value">${u.staffCode || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">氏名</div><div class="detail-value">${u.name}</div></div>
          <div class="detail-row"><div class="detail-label">フリガナ</div><div class="detail-value">${displayKana || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">メール</div><div class="detail-value">${u.email || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">電話番号</div><div class="detail-value">${u.tel || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">携帯番号</div><div class="detail-value">${u.mobile || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">部署</div><div class="detail-value">${getDeptName(u.deptId)}</div></div>
          <div class="detail-row"><div class="detail-label">役職</div><div class="detail-value">${u.position || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">雇用形態</div><div class="detail-value">${u.employmentType || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">入社日</div><div class="detail-value">${formatDate(u.joinDate)}</div></div>
          ${u.memo ? `<div class="detail-row"><div class="detail-label">備考</div><div class="detail-value">${u.memo}</div></div>` : ''}
          <div class="detail-row"><div class="detail-label">ステータス</div><div class="detail-value">${u.isActive ? '有効' : '無効'}</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>アカウント情報</h3></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">ログインID</div><div class="detail-value">${u.loginId || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">ロール</div><div class="detail-value"><span class="type-badge type-corp">${getRoleBadge(u.role)}</span></div></div>
          <div class="detail-row"><div class="detail-label">チーム</div><div class="detail-value">${u.team || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">分類</div><div class="detail-value">${u.staffFlag || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">基本比率</div><div class="detail-value">${u.baseRatio != null ? u.baseRatio + '%' : '-'}</div></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:24px">
      <div class="card-header"><h3>担当顧客一覧</h3></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>コード</th><th>顧客名</th><th>種別</th><th>決算月</th><th>担当区分</th><th>月額報酬</th></tr></thead>
            <tbody>
              ${clients.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:var(--gray-400)">担当顧客なし</td></tr>' : clients.map(c => {
                const role = c.mainUserId === u.id ? '主担当' : '副担当';
                return `<tr class="clickable" onclick="navigateTo('client-detail',{id:'${c.id}'})">
                  <td>${c.clientCode}</td>
                  <td><strong>${c.name}</strong></td>
                  <td><span class="type-badge ${c.clientType === '法人' ? 'type-corp' : 'type-individual'}">${c.clientType}</span></td>
                  <td>${c.fiscalMonth}月</td>
                  <td>${role}</td>
                  <td>${c.monthlySales.toLocaleString()}円</td>
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
      <button class="btn btn-primary" onclick="openTimesheetModal()">+ 工数入力</button>
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
// 報告書一覧
// ===========================
let rpPage = 1;
const rpPerPage = 20;
let rpReadFilter = '全て';      // 全て / 未読
let rpTypeFilter = '両方';      // 両方 / 業務報告書 / 日報
let rpSearchState = { category: '', author: '', period: '1年以内', dateFrom: '', dateTo: '', ranks: [], attachOnly: false, draftOnly: false, keyword: '', client: '' };
const rpExpandedSet = new Set();

function renderReports(el) {
  rpPage = 1;
  rpReadFilter = '全て';
  rpTypeFilter = '両方';
  rpSearchState = { category: '', author: '', period: '1年以内', dateFrom: '', dateTo: '', ranks: [], attachOnly: false, draftOnly: false, keyword: '', client: '' };

  el.innerHTML = `
    <div class="rp-header-bar">
      <h2>報告書一覧</h2>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="rpMarkAllRead()">全てを既読にする</button>
        <button class="btn btn-primary btn-sm" onclick="openReportModal()">+ 新規報告書</button>
      </div>
    </div>

    <div class="rp-tabs">
      <button class="rp-tab active" data-rf="全て" onclick="rpSetReadFilter(this)">全て</button>
      <button class="rp-tab" data-rf="未読" onclick="rpSetReadFilter(this)">未読</button>
      <span class="rp-tab-sep">|</span>
      <button class="rp-tab" onclick="rpExpandAll()">全て開く</button>
      <button class="rp-tab" onclick="rpCollapseAll()">全て閉じる</button>
      <span class="rp-tab-sep">|</span>
      <span class="rp-view-label">表示：</span>
      <button class="rp-tab active" data-tf="両方" onclick="rpSetTypeFilter(this)">両方</button>
      <button class="rp-tab" data-tf="業務報告書" onclick="rpSetTypeFilter(this)">業務報告書</button>
      <button class="rp-tab" data-tf="日報" onclick="rpSetTypeFilter(this)">日報</button>
    </div>

    <div class="rp-layout">
      <div>
        <div class="rp-list" id="rp-list-body"></div>
        <div class="rp-pagination" id="rp-pagination"></div>
      </div>
      <div class="rp-search-panel">
        <h4>検索</h4>
        <div class="rp-search-group">
          <label>種別：</label>
          <select id="rp-s-category">
            <option value="">すべて</option>
            <option value="確定申告">確定申告</option>
            <option value="決算業務">決算業務</option>
            <option value="月次業務">月次業務</option>
            <option value="その他">その他</option>
            <option value="日報">日報</option>
          </select>
        </div>
        <div class="rp-search-group">
          <label>顧客：</label>
          <input type="text" id="rp-s-client" placeholder="顧客名で検索...">
        </div>
        <div class="rp-search-group">
          <label>作成者：</label>
          <select id="rp-s-author">
            <option value="">すべて</option>
            ${MOCK_DATA.users.filter(u => u.isActive).map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
          </select>
        </div>
        <div class="rp-search-group">
          <label>期間：</label>
          <div class="rp-period-btns">
            <button class="rp-period-btn active" data-p="1年以内" onclick="rpSetPeriod(this)">1年以内</button>
            <button class="rp-period-btn" data-p="2年以内" onclick="rpSetPeriod(this)">2年以内</button>
            <button class="rp-period-btn" data-p="全て" onclick="rpSetPeriod(this)">全て</button>
          </div>
          <div class="rp-date-range">
            <input type="date" id="rp-s-from">
            <span>～</span>
            <input type="date" id="rp-s-to">
          </div>
        </div>
        <div class="rp-search-group">
          <label>ランク：</label>
          <div class="rp-rank-btns" id="rp-rank-btns">
            <button class="rp-rank-btn" data-rank="A" onclick="rpToggleRank(this)">A</button>
            <button class="rp-rank-btn" data-rank="B" onclick="rpToggleRank(this)">B</button>
            <button class="rp-rank-btn" data-rank="C" onclick="rpToggleRank(this)">C</button>
            <button class="rp-rank-btn" data-rank="日報" onclick="rpToggleRank(this)">日報</button>
          </div>
        </div>
        <div class="rp-search-group">
          <label>オプション：</label>
          <div class="rp-search-opts">
            <label><input type="checkbox" id="rp-s-attach"> 添付ファイルのみ</label>
            <label><input type="checkbox" id="rp-s-draft"> 一時保存中のみ</label>
          </div>
        </div>
        <div class="rp-search-group">
          <label>キーワード：</label>
          <input type="text" id="rp-s-keyword" placeholder="キーワード検索...">
        </div>
        <div class="rp-search-actions">
          <button class="btn btn-primary btn-sm" onclick="rpDoSearch()">検索</button>
          <button class="btn btn-secondary btn-sm" onclick="rpClearSearch()">検索クリア</button>
        </div>
      </div>
    </div>
  `;
  rpRenderList();
}

function rpGetFiltered() {
  let reports = [...MOCK_DATA.reports];
  // 既読フィルタ
  if (rpReadFilter === '未読') reports = reports.filter(r => r.readStatus === '未読');
  // タイプフィルタ
  if (rpTypeFilter !== '両方') reports = reports.filter(r => r.type === rpTypeFilter);
  // 検索条件
  const s = rpSearchState;
  if (s.category) reports = reports.filter(r => r.category === s.category);
  if (s.client) reports = reports.filter(r => (r.clientName || '').includes(s.client));
  if (s.author) reports = reports.filter(r => r.authorId === s.author);
  if (s.ranks.length > 0) reports = reports.filter(r => s.ranks.includes(r.rank));
  if (s.attachOnly) reports = reports.filter(r => r.hasAttachment);
  if (s.draftOnly) reports = reports.filter(r => r.readStatus === '一時保存中');
  if (s.keyword) {
    const kw = s.keyword.toLowerCase();
    reports = reports.filter(r => r.title.toLowerCase().includes(kw) || (r.clientName || '').toLowerCase().includes(kw));
  }
  if (s.dateFrom) reports = reports.filter(r => r.createdAt >= s.dateFrom);
  if (s.dateTo) reports = reports.filter(r => r.createdAt <= s.dateTo + 'T23:59:59');
  // 期間プリセット
  if (s.period !== '全て' && !s.dateFrom && !s.dateTo) {
    const now = new Date();
    const years = s.period === '1年以内' ? 1 : 2;
    const cutoff = new Date(now.getFullYear() - years, now.getMonth(), now.getDate()).toISOString();
    reports = reports.filter(r => r.createdAt >= cutoff);
  }
  reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return reports;
}

function rpRenderList() {
  const all = rpGetFiltered();
  const totalPages = Math.max(1, Math.ceil(all.length / rpPerPage));
  if (rpPage > totalPages) rpPage = totalPages;
  const start = (rpPage - 1) * rpPerPage;
  const page = all.slice(start, start + rpPerPage);

  const body = document.getElementById('rp-list-body');
  if (all.length === 0) {
    body.innerHTML = '<div class="empty-state" style="padding:40px"><div class="icon">📝</div><p>該当する報告書がありません</p></div>';
  } else {
    body.innerHTML = page.map(r => {
      const author = getUserById(r.authorId);
      const isUnread = r.readStatus === '未読';
      const isDraft = r.readStatus === '一時保存中';
      const badgeClass = isUnread ? 'rp-badge-unread' : isDraft ? 'rp-badge-draft' : 'rp-badge-read';
      const badgeText = isUnread ? '未読' : isDraft ? '一時保存中' : '';
      const isExpanded = rpExpandedSet.has(r.id);
      return `<div class="rp-row ${isUnread ? 'unread' : ''}" onclick="rpClickReport('${r.id}')">
        <span class="rp-row-date">${formatDate(r.createdAt)}</span>
        <span class="rp-row-author">${author?.name || '-'}</span>
        <span class="rp-row-title">${r.hasAttachment ? '<span class="attach-icon">📎</span>' : ''}${r.title}</span>
        ${badgeText ? `<span class="rp-row-badge ${badgeClass}">${badgeText}</span>` : '<span></span>'}
      </div>${isExpanded ? `<div class="rp-row-detail" style="padding:8px 16px 12px;font-size:13px;color:var(--gray-500);background:var(--gray-50);border-bottom:1px solid var(--gray-200);"><strong>タイトル：</strong>${r.title}<br><strong>種別：</strong>${r.category || r.type || '-'}　<strong>ランク：</strong>${r.rank || '-'}　<strong>顧客：</strong>${r.clientName || '-'}</div>` : ''}`;
    }).join('');
  }

  // ページネーション
  const pag = document.getElementById('rp-pagination');
  pag.innerHTML = `
    <button onclick="rpGoPage(1)" ${rpPage <= 1 ? 'disabled' : ''}>&laquo;最初</button>
    <button onclick="rpGoPage(${rpPage - 1})" ${rpPage <= 1 ? 'disabled' : ''}>&lsaquo;前</button>
    <span class="page-info">${rpPage} / ${totalPages}</span>
    <button onclick="rpGoPage(${rpPage + 1})" ${rpPage >= totalPages ? 'disabled' : ''}>次&rsaquo;</button>
    <button onclick="rpGoPage(${totalPages})" ${rpPage >= totalPages ? 'disabled' : ''}>最後&raquo;</button>
  `;
}

function rpGoPage(n) { rpPage = n; rpRenderList(); }

function rpSetReadFilter(btn) {
  rpReadFilter = btn.dataset.rf;
  btn.closest('.rp-tabs').querySelectorAll('[data-rf]').forEach(b => b.classList.toggle('active', b === btn));
  rpPage = 1;
  rpRenderList();
}

function rpSetTypeFilter(btn) {
  rpTypeFilter = btn.dataset.tf;
  btn.closest('.rp-tabs').querySelectorAll('[data-tf]').forEach(b => b.classList.toggle('active', b === btn));
  rpPage = 1;
  rpRenderList();
}

function rpMarkAllRead() {
  MOCK_DATA.reports.forEach(r => { if (r.readStatus === '未読') r.readStatus = '既読'; });
  rpRenderList();
}

function rpClickReport(id) {
  const r = MOCK_DATA.reports.find(x => x.id === id);
  if (r && r.readStatus === '未読') r.readStatus = '既読';
  if (rpExpandedSet.has(id)) {
    rpExpandedSet.delete(id);
  } else {
    rpExpandedSet.add(id);
  }
  rpRenderList();
}

function rpExpandAll() {
  const all = rpGetFiltered();
  const start = (rpPage - 1) * rpPerPage;
  const page = all.slice(start, start + rpPerPage);
  page.forEach(r => rpExpandedSet.add(r.id));
  rpRenderList();
}
function rpCollapseAll() {
  rpExpandedSet.clear();
  rpRenderList();
}

function rpSetPeriod(btn) {
  rpSearchState.period = btn.dataset.p;
  btn.closest('.rp-period-btns').querySelectorAll('.rp-period-btn').forEach(b => b.classList.toggle('active', b === btn));
}

function rpToggleRank(btn) {
  btn.classList.toggle('active');
  const rank = btn.dataset.rank;
  const idx = rpSearchState.ranks.indexOf(rank);
  if (idx >= 0) rpSearchState.ranks.splice(idx, 1);
  else rpSearchState.ranks.push(rank);
}

function rpDoSearch() {
  rpSearchState.category = document.getElementById('rp-s-category').value;
  rpSearchState.client = document.getElementById('rp-s-client').value.trim();
  rpSearchState.author = document.getElementById('rp-s-author').value;
  rpSearchState.dateFrom = document.getElementById('rp-s-from').value;
  rpSearchState.dateTo = document.getElementById('rp-s-to').value;
  rpSearchState.attachOnly = document.getElementById('rp-s-attach').checked;
  rpSearchState.draftOnly = document.getElementById('rp-s-draft').checked;
  rpSearchState.keyword = document.getElementById('rp-s-keyword').value.trim();
  rpPage = 1;
  rpRenderList();
}

function rpClearSearch() {
  rpSearchState = { category: '', author: '', period: '1年以内', dateFrom: '', dateTo: '', ranks: [], attachOnly: false, draftOnly: false, keyword: '', client: '' };
  document.getElementById('rp-s-category').value = '';
  document.getElementById('rp-s-client').value = '';
  document.getElementById('rp-s-author').value = '';
  document.getElementById('rp-s-from').value = '';
  document.getElementById('rp-s-to').value = '';
  document.getElementById('rp-s-attach').checked = false;
  document.getElementById('rp-s-draft').checked = false;
  document.getElementById('rp-s-keyword').value = '';
  document.querySelectorAll('.rp-rank-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.rp-period-btn').forEach(b => b.classList.toggle('active', b.dataset.p === '1年以内'));
  rpPage = 1;
  rpRenderList();
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
// ── 外部連携ステート ──
let integrationStates = {
  dropbox: { connected: true, account: 'libetax@dropbox.com', date: '2025-08-15' },
  freee: { connected: true, account: 'リベ大税理士法人', date: '2025-06-01' },
  chatwork: { connected: true, account: 'リベ大税理士法人', date: '2025-05-20' },
  slack: { connected: false },
  google: { connected: true, account: 'libetax.jp', date: '2025-04-01' },
  zoom: { connected: false },
  eltax: { connected: true, account: '利用者識別番号: 1234567890', date: '2025-09-01' },
  etax: { connected: true, account: '利用者識別番号: 0987654321', date: '2025-09-01' },
};

const integrationDefs = [
  { key: 'dropbox', name: 'Dropbox', icon: '📁', description: '顧客資料フォルダとの自動連携' },
  { key: 'freee', name: 'freee会計', icon: '📊', description: '仕訳データ・試算表の自動取込' },
  { key: 'chatwork', name: 'Chatwork', icon: '💬', description: '顧客・チーム間メッセージ連携' },
  { key: 'slack', name: 'Slack', icon: '📢', description: 'チーム内通知・アラート配信' },
  { key: 'google', name: 'Google Workspace', icon: '📧', description: 'Gmail・カレンダー・Drive連携' },
  { key: 'zoom', name: 'Zoom', icon: '🎥', description: 'ミーティング予約・録画管理' },
  { key: 'eltax', name: 'eLTAX', icon: '🏛️', description: '地方税電子申告連携' },
  { key: 'etax', name: 'e-Tax', icon: '🏛️', description: '国税電子申告連携' },
];

function toggleIntegration(key) {
  const st = integrationStates[key];
  if (!st) return;
  if (st.connected) {
    if (!confirm(`${key} の接続を切断しますか？`)) return;
    st.connected = false;
    delete st.account;
    delete st.date;
  } else {
    const today = new Date().toISOString().slice(0, 10);
    st.connected = true;
    st.account = key + '@example.com';
    st.date = today;
  }
  const content = document.getElementById('page-content');
  if (content) renderIntegrations(content);
}

function testIntegration(key) {
  const el = document.getElementById('int-flash-' + key);
  if (!el) return;
  el.innerHTML = '<div style="background:#d1ecf1;border:1px solid #bee5eb;border-radius:6px;color:#0c5460;font-size:12px;padding:6px 10px;margin-top:8px;">接続テスト成功</div>';
  setTimeout(() => { if (el) el.innerHTML = ''; }, 2000);
}

function renderIntegrations(el) {
  const connected = integrationDefs.filter(d => integrationStates[d.key]?.connected).length;

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent-green">
        <div class="stat-label">接続済み</div>
        <div class="stat-value">${connected}</div>
        <div class="stat-sub">サービス</div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">未接続</div>
        <div class="stat-value">${integrationDefs.length - connected}</div>
        <div class="stat-sub">サービス</div>
      </div>
    </div>

    <div class="int-grid">
      ${integrationDefs.map(d => {
        const st = integrationStates[d.key] || { connected: false };
        return `
        <div class="card int-card">
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="font-size:28px;">${d.icon}</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:15px;">${d.name}</div>
                <div style="font-size:12px;color:var(--gray-500);">${d.description}</div>
              </div>
              <span class="status-badge ${st.connected ? 'status-done' : 'status-todo'}">${st.connected ? '接続済み' : '未接続'}</span>
            </div>
            ${st.connected ? `
              <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
                <div>アカウント: ${st.account}</div>
                <div>接続日: ${formatDate(st.date)}</div>
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-secondary btn-sm" onclick="alert('同期設定画面（${d.name}）')">設定</button>
                <button class="btn btn-secondary btn-sm" onclick="testIntegration('${d.key}')">テスト</button>
                <button class="btn btn-danger btn-sm" onclick="toggleIntegration('${d.key}')">切断</button>
              </div>
              <div id="int-flash-${d.key}"></div>
            ` : `
              <button class="btn btn-primary btn-sm" onclick="toggleIntegration('${d.key}')">接続する</button>
            `}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

// ===========================
// マイ設定
// ===========================
let settingsActiveTab = 0;

function settingsFlash(containerId, msg) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-info" style="padding:8px 12px;background:#d1ecf1;border:1px solid #bee5eb;border-radius:6px;color:#0c5460;font-size:13px;margin-bottom:12px;">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 2000);
}

function settingsRerender() {
  const content = document.getElementById('page-content');
  if (content) renderSettings(content);
}

function saveOfficeInfo() {
  MOCK_DATA.office.aoName = document.getElementById('set-ao-name').value;
  MOCK_DATA.office.address = document.getElementById('set-ao-address').value;
  MOCK_DATA.office.tel = document.getElementById('set-ao-tel').value;
  MOCK_DATA.office.email = document.getElementById('set-ao-email').value;
  settingsRerender();
  setTimeout(() => settingsFlash('office-flash', '保存しました'), 50);
}

function saveSecuritySettings() {
  MOCK_DATA.securitySettings.allowedIpList = document.getElementById('set-sec-ip').value;
  MOCK_DATA.securitySettings.maxLoginAttempts = parseInt(document.getElementById('set-sec-attempts').value) || 5;
  MOCK_DATA.securitySettings.lockoutDuration = parseInt(document.getElementById('set-sec-lockout').value) || 30;
  MOCK_DATA.securitySettings.sessionTimeout = parseInt(document.getElementById('set-sec-session').value) || 30;
  MOCK_DATA.securitySettings.passwordMinLength = parseInt(document.getElementById('set-sec-pwlen').value) || 8;
  MOCK_DATA.securitySettings.passwordRequireNumber = document.getElementById('set-sec-pwnum').checked ? 1 : 0;
  MOCK_DATA.securitySettings.passwordRequireSymbol = document.getElementById('set-sec-pwsym').checked ? 1 : 0;
  settingsRerender();
  setTimeout(() => settingsFlash('security-flash', '保存しました'), 50);
}

function addDepartment() {
  const name = prompt('部署名を入力してください');
  if (!name) return;
  const code = prompt('部署コードを入力してください');
  if (!code) return;
  const maxId = MOCK_DATA.departments.reduce((m, d) => Math.max(m, d.deptId), 0);
  const maxSort = MOCK_DATA.departments.reduce((m, d) => Math.max(m, d.sortOrder), 0);
  MOCK_DATA.departments.push({ deptId: maxId + 1, deptName: name, deptCode: code, parentDeptId: null, sortOrder: maxSort + 1, status: 1 });
  settingsRerender();
}

function editDepartment(deptId) {
  const d = MOCK_DATA.departments.find(x => x.deptId === deptId);
  if (!d) return;
  const name = prompt('新しい部署名を入力してください', d.deptName);
  if (!name) return;
  d.deptName = name;
  settingsRerender();
}

function deleteDepartment(deptId) {
  if (!confirm('この部署を削除しますか？')) return;
  MOCK_DATA.departments = MOCK_DATA.departments.filter(x => x.deptId !== deptId);
  settingsRerender();
}

function savePersonalSettings() {
  const name = document.getElementById('set-personal-name').value.trim();
  const email = document.getElementById('set-personal-email').value.trim();
  if (!name) { alert('表示名を入力してください'); return; }
  if (!email) { alert('メールアドレスを入力してください'); return; }
  MOCK_DATA.currentUser.name = name;
  MOCK_DATA.currentUser.email = email;
  const fullUser = getUserById(MOCK_DATA.currentUser.id);
  if (fullUser) { fullUser.name = name; fullUser.email = email; }
  // サイドバーも更新
  const sidebarName = document.querySelector('.sidebar-user .name');
  const sidebarAvatar = document.querySelector('.sidebar-user .avatar');
  if (sidebarName) sidebarName.textContent = name;
  if (sidebarAvatar) sidebarAvatar.textContent = name[0];
  settingsRerender();
  setTimeout(() => settingsFlash('personal-flash', '保存しました'), 50);
}

function issueUserId() {
  const input = prompt('職員名またはスタッフコードを入力してください');
  if (!input) return;
  const user = MOCK_DATA.users.find(u => u.name === input || u.staffCode === input);
  if (!user) { alert('該当する職員が見つかりません'); return; }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let tmpPassword = '';
  for (let i = 0; i < 12; i++) tmpPassword += chars[Math.floor(Math.random() * chars.length)];
  alert(`ユーザーID発行完了\n\nログインID: ${user.loginId}\n仮パスワード: ${tmpPassword}\n\n※ 初回ログイン時にパスワード変更が必要です`);
}

function deleteClient(clientId) {
  const c = getClientById(clientId);
  if (!c) return;
  if (!confirm(`顧客「${c.name}」を削除しますか？\nこの操作は取り消せません。`)) return;
  MOCK_DATA.clients = MOCK_DATA.clients.filter(x => x.id !== clientId);
  navigateTo('clients');
}

function renderSettings(el) {
  const u = MOCK_DATA.currentUser;
  const fullUser = getUserById(u.id);
  const office = MOCK_DATA.office;
  const sec = MOCK_DATA.securitySettings;
  const depts = MOCK_DATA.departments;

  const tabs = [
    { key: 'personal', label: '個人設定' },
    { key: 'staff', label: 'スタッフ管理' },
    { key: 'office', label: 'オフィス管理' },
    { key: 'security', label: 'セキュリティ管理' },
    { key: 'crm', label: 'CRM設定' },
    { key: 'features', label: '機能設定' },
  ];

  const logoutOpts = [5,10,15,30,60,120].map(m =>
    `<option value="${m}" ${office.logoutTime === m ? 'selected' : ''}>${m}分</option>`
  ).join('');

  const inputStyle = 'width:200px;padding:6px 10px;border:1px solid var(--gray-200);border-radius:6px;font-size:13px;';

  const panels = {
    personal: `
      <div class="detail-grid">
        <div class="card">
          <div class="card-header"><h3>マイ設定</h3></div>
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
              <div style="width:64px;height:64px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:600;">${u.name[0]}</div>
              <div>
                <div style="font-size:18px;font-weight:600;">${u.name}</div>
                <div style="font-size:13px;color:var(--gray-500);">${u.email} / ${getRoleBadge(u.role)}</div>
              </div>
            </div>
            <div id="personal-flash"></div>
            <div class="form-group"><label>表示名</label><input type="text" id="set-personal-name" value="${u.name}"></div>
            <div class="form-group"><label>メールアドレス</label><input type="email" id="set-personal-email" value="${u.email}"></div>
            <div class="form-group"><label>所属チーム</label><input type="text" value="${fullUser?.team || '（なし）'}" disabled style="background:var(--gray-50);"></div>
            <button class="btn btn-primary" onclick="savePersonalSettings()">保存</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>パスワード変更</h3></div>
          <div class="card-body">
            <div id="pw-flash"></div>
            <div class="form-group"><label>現在のパスワード</label><input type="password" placeholder="現在のパスワード"></div>
            <div class="form-group"><label>新しいパスワード</label><input type="password" placeholder="新しいパスワード"></div>
            <div class="form-group"><label>新しいパスワード（確認）</label><input type="password" placeholder="もう一度入力"></div>
            <button class="btn btn-primary" onclick="settingsFlash('pw-flash','パスワードを変更しました')">変更する</button>
          </div>
        </div>
      </div>`,

    staff: `
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header"><h3>スタッフ管理</h3></div>
        <div class="card-body">
          <div class="settings-list">
            <div class="settings-row">
              <div><div class="settings-label">職員一覧</div><div class="settings-desc">登録済み職員の一覧を表示</div></div>
              <button class="btn btn-secondary btn-sm" onclick="navigateTo('staff')">職員一覧へ</button>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">ユーザーID発行</div><div class="settings-desc">新しいユーザーIDを発行します</div></div>
              <button class="btn btn-primary btn-sm" onclick="issueUserId()">発行</button>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">ログアウト時間設定</div><div class="settings-desc">無操作時の自動ログアウトまでの時間</div></div>
              <select class="filter-select" style="width:120px;" onchange="MOCK_DATA.office.logoutTime=parseInt(this.value);settingsFlash('logout-flash','保存しました')">${logoutOpts}</select>
              <span id="logout-flash" style="margin-left:8px;"></span>
            </div>
          </div>
        </div>
      </div>`,

    office: `
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header"><h3>オフィス情報</h3></div>
        <div class="card-body">
          <div id="office-flash"></div>
          <div class="form-group"><label>事務所名</label><input type="text" id="set-ao-name" value="${office.aoName}" style="${inputStyle}width:100%;"></div>
          <div class="form-group"><label>住所</label><input type="text" id="set-ao-address" value="${office.address}" style="${inputStyle}width:100%;"></div>
          <div class="form-group"><label>電話番号</label><input type="text" id="set-ao-tel" value="${office.tel}" style="${inputStyle}width:100%;"></div>
          <div class="form-group"><label>メール</label><input type="email" id="set-ao-email" value="${office.email}" style="${inputStyle}width:100%;"></div>
          <button class="btn btn-primary" onclick="saveOfficeInfo()">保存</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <h3>部署一覧</h3>
          <button class="btn btn-primary btn-sm" onclick="addDepartment()">追加</button>
        </div>
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>部署コード</th><th>部署名</th><th>表示順</th><th>状態</th><th>操作</th></tr></thead>
              <tbody>
                ${depts.map(d => `<tr>
                  <td>${d.deptCode}</td><td>${d.deptName}</td><td>${d.sortOrder}</td>
                  <td><span class="status-badge ${d.status === 1 ? 'status-done' : 'status-todo'}">${d.status === 1 ? '有効' : '無効'}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="editDepartment(${d.deptId})">編集</button>
                    <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="deleteDepartment(${d.deptId})">削除</button>
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`,

    security: `
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header"><h3>セキュリティ管理</h3></div>
        <div class="card-body">
          <div id="security-flash"></div>
          <div class="form-group">
            <label>IPアドレス制限</label>
            <textarea id="set-sec-ip" rows="3" placeholder="許可するIPアドレス（改行区切り、空欄＝制限なし）" style="${inputStyle}width:100%;height:auto;">${sec.allowedIpList}</textarea>
          </div>
          <div class="form-group">
            <label>ログイン試行上限（回）</label>
            <input type="number" id="set-sec-attempts" value="${sec.maxLoginAttempts}" min="1" style="${inputStyle}">
          </div>
          <div class="form-group">
            <label>ロックアウト時間（分）</label>
            <input type="number" id="set-sec-lockout" value="${sec.lockoutDuration}" min="1" style="${inputStyle}">
          </div>
          <div class="form-group">
            <label>セッションタイムアウト（分）</label>
            <input type="number" id="set-sec-session" value="${sec.sessionTimeout}" min="1" style="${inputStyle}">
          </div>
          <div class="form-group">
            <label>パスワード最低文字数</label>
            <input type="number" id="set-sec-pwlen" value="${sec.passwordMinLength}" min="1" style="${inputStyle}">
          </div>
          <div class="form-group" style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="set-sec-pwnum" ${sec.passwordRequireNumber ? 'checked' : ''}>
            <label for="set-sec-pwnum" style="margin:0;">数字必須</label>
          </div>
          <div class="form-group" style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="set-sec-pwsym" ${sec.passwordRequireSymbol ? 'checked' : ''}>
            <label for="set-sec-pwsym" style="margin:0;">記号必須</label>
          </div>
          <button class="btn btn-primary" onclick="saveSecuritySettings()">保存</button>
        </div>
      </div>`,

    crm: `
      <div class="card">
        <div class="card-header"><h3>CRM権限設定</h3></div>
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>機能</th><th>管理者</th><th>TL</th><th>メンバー</th></tr></thead>
              <tbody>
                <tr><td>顧客情報 閲覧</td><td>&#10003;</td><td>&#10003;</td><td>&#10003;</td></tr>
                <tr><td>顧客情報 編集</td><td>&#10003;</td><td>&#10003;</td><td>-</td></tr>
                <tr><td>顧客 新規登録</td><td>&#10003;</td><td>&#10003;</td><td>-</td></tr>
                <tr><td>顧客 削除</td><td>&#10003;</td><td>-</td><td>-</td></tr>
                <tr><td>報酬情報 閲覧</td><td>&#10003;</td><td>&#10003;</td><td>担当のみ</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`,

    features: `
      <div class="card">
        <div class="card-header"><h3>機能設定</h3></div>
        <div class="card-body">
          <div class="settings-list">
            <div class="settings-row">
              <div><div class="settings-label">グループウェア</div><div class="settings-desc">社内掲示板・メッセージ機能</div></div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">電子会議室</div><div class="settings-desc">オンライン会議予約・管理</div></div>
              <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">共有フォルダ</div><div class="settings-desc">ファイル共有・ドキュメント管理</div></div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">AI機能</div><div class="settings-desc">AIアシスタント・自動分析</div></div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
          </div>
        </div>
      </div>`,
  };

  const activeKey = tabs[settingsActiveTab]?.key || 'personal';

  el.innerHTML = `
    <div class="tab-bar" id="settings-tabs">
      ${tabs.map((t, i) => `<button class="tab-btn ${i === settingsActiveTab ? 'active' : ''}" data-tab="${t.key}" data-idx="${i}">${t.label}</button>`).join('')}
    </div>
    <div id="settings-panel" style="margin-top:24px;">${panels[activeKey]}</div>
  `;

  document.querySelectorAll('#settings-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settingsActiveTab = parseInt(btn.dataset.idx);
      document.querySelectorAll('#settings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('settings-panel').innerHTML = panels[btn.dataset.tab] || '';
    });
  });
}

// ===========================
// チャットマスタ
// ===========================
function renderChatRooms(el) {
  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="ルーム名・顧客名で検索..." id="cr-search">
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openChatRoomModal()">+ ルーム追加</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>ルーム名</th><th>ルームID</th><th>紐づけ顧客</th><th>備考</th><th style="width:60px"></th></tr></thead>
          <tbody id="cr-table-body"></tbody>
        </table>
      </div>
    </div>
    <div class="card" style="margin-top:24px">
      <div class="card-header"><h3>メンション一括コピー</h3></div>
      <div class="card-body">
        <p style="font-size:13px;color:var(--gray-500);margin-bottom:12px;">ルームを選択すると、そのルームに紐づく顧客のChatworkメンションを一括コピーできます。</p>
        <div style="display:flex;gap:12px;align-items:flex-end;">
          <div class="form-group" style="flex:1;margin-bottom:0;">
            <label>対象ルーム</label>
            <select id="cr-mention-room" style="width:100%;padding:8px 12px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;">
              <option value="">-- ルームを選択 --</option>
              ${MOCK_DATA.chatRooms.map(r => `<option value="${r.id}">${r.roomName}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-secondary" onclick="copyMentions()">メンションをコピー</button>
        </div>
        <pre id="cr-mention-preview" style="margin-top:12px;padding:12px;background:var(--gray-50);border-radius:6px;font-size:12px;white-space:pre-wrap;display:none;"></pre>
      </div>
    </div>
  `;
  renderChatRoomTable();
  document.getElementById('cr-search').addEventListener('input', renderChatRoomTable);
  document.getElementById('cr-mention-room').addEventListener('change', previewMentions);
}

function renderChatRoomTable() {
  const search = (document.getElementById('cr-search')?.value || '').toLowerCase();
  let rooms = MOCK_DATA.chatRooms;
  if (search) {
    rooms = rooms.filter(r => {
      if (r.roomName.toLowerCase().includes(search)) return true;
      return r.clientIds.some(cid => {
        const c = getClientById(cid);
        return c && c.name.toLowerCase().includes(search);
      });
    });
  }

  const tbody = document.getElementById('cr-table-body');
  tbody.innerHTML = rooms.map(r => {
    const clientNames = r.clientIds.map(cid => {
      const c = getClientById(cid);
      return c ? `<a href="#" onclick="event.preventDefault();navigateTo('client-detail',{id:'${cid}'})">${c.name}</a>` : cid;
    }).join(', ');
    return `<tr>
      <td><strong>${r.roomName}</strong></td>
      <td style="font-family:monospace;font-size:12px;">${r.roomId}</td>
      <td>${clientNames}</td>
      <td style="color:var(--gray-500);font-size:12px;">${r.memo || '-'}</td>
      <td><button class="btn btn-secondary btn-sm" onclick="openChatRoomModal('${r.id}')">編集</button></td>
    </tr>`;
  }).join('');
}

function previewMentions() {
  const roomId = document.getElementById('cr-mention-room').value;
  const pre = document.getElementById('cr-mention-preview');
  if (!roomId) { pre.style.display = 'none'; return; }

  const room = getChatRoomById(roomId);
  if (!room) { pre.style.display = 'none'; return; }

  const mentions = room.clientIds.map(cid => {
    const c = getClientById(cid);
    if (!c || !c.cwAccountId) return null;
    return `[To:${c.cwAccountId}]${c.cwAccountName || c.name}さん`;
  }).filter(Boolean);

  if (mentions.length === 0) {
    pre.textContent = '（CWアカウントIDが設定されている顧客がいません）';
  } else {
    pre.textContent = mentions.join('\n');
  }
  pre.style.display = 'block';
}

function copyMentions() {
  const pre = document.getElementById('cr-mention-preview');
  if (!pre || pre.style.display === 'none' || !pre.textContent) {
    alert('ルームを選択してください');
    return;
  }
  navigator.clipboard.writeText(pre.textContent).then(() => {
    alert('メンションをクリップボードにコピーしました');
  });
}

let editingChatRoomId = null;

function openChatRoomModal(roomId) {
  editingChatRoomId = roomId || null;
  const modal = document.getElementById('chatroom-create-modal');
  const title = document.getElementById('chatroom-modal-title');
  const deleteBtn = document.getElementById('cr-delete-btn');

  // 顧客チェックボックスを生成
  const checkboxes = document.getElementById('cr-client-checkboxes');
  checkboxes.innerHTML = MOCK_DATA.clients.filter(c => c.isActive).map(c =>
    `<label style="display:flex;align-items:center;gap:6px;font-size:13px;padding:4px 0;cursor:pointer;">
      <input type="checkbox" value="${c.id}" class="cr-client-cb"> ${c.name}
      ${c.cwAccountId ? '<span style="font-size:11px;color:var(--gray-400);">(CW: ' + c.cwAccountId + ')</span>' : '<span style="font-size:11px;color:var(--warning);">(CW未設定)</span>'}
    </label>`
  ).join('');

  if (editingChatRoomId) {
    title.textContent = 'チャットルーム編集';
    deleteBtn.style.display = '';
    const r = getChatRoomById(editingChatRoomId);
    if (r) {
      document.getElementById('edit-chatroom-id').value = r.id;
      document.getElementById('new-cr-name').value = r.roomName;
      document.getElementById('new-cr-roomid').value = r.roomId;
      document.getElementById('new-cr-url').value = r.roomUrl;
      document.getElementById('new-cr-memo').value = r.memo || '';
      document.querySelectorAll('.cr-client-cb').forEach(cb => {
        cb.checked = r.clientIds.includes(cb.value);
      });
    }
  } else {
    title.textContent = 'チャットルーム登録';
    deleteBtn.style.display = 'none';
    document.getElementById('edit-chatroom-id').value = '';
    document.getElementById('new-cr-name').value = '';
    document.getElementById('new-cr-roomid').value = '';
    document.getElementById('new-cr-url').value = '';
    document.getElementById('new-cr-memo').value = '';
    document.querySelectorAll('.cr-client-cb').forEach(cb => { cb.checked = false; });
  }

  modal.classList.add('show');
}

function closeChatRoomModal() {
  document.getElementById('chatroom-create-modal').classList.remove('show');
  editingChatRoomId = null;
}

function submitChatRoom() {
  const roomName = document.getElementById('new-cr-name').value.trim();
  const roomId = document.getElementById('new-cr-roomid').value.trim();
  const roomUrl = document.getElementById('new-cr-url').value.trim();
  const memo = document.getElementById('new-cr-memo').value.trim();
  const clientIds = [...document.querySelectorAll('.cr-client-cb:checked')].map(cb => cb.value);

  if (!roomName) { alert('ルーム名を入力してください'); return; }
  if (!roomId) { alert('ルームIDを入力してください'); return; }

  if (editingChatRoomId) {
    const r = getChatRoomById(editingChatRoomId);
    if (r) {
      r.roomName = roomName;
      r.roomId = roomId;
      r.roomUrl = roomUrl || `https://www.chatwork.com/#!rid${roomId}`;
      r.clientIds = clientIds;
      r.memo = memo;
    }
  } else {
    const newId = 'cr-' + String(MOCK_DATA.chatRooms.length + 1).padStart(3, '0');
    MOCK_DATA.chatRooms.push({
      id: newId,
      roomId,
      roomName,
      roomUrl: roomUrl || `https://www.chatwork.com/#!rid${roomId}`,
      clientIds,
      memo,
    });
  }

  closeChatRoomModal();
  if (currentPage === 'chatrooms') navigateTo('chatrooms');
}

function deleteChatRoom() {
  if (!editingChatRoomId) return;
  if (!confirm('このチャットルームを削除しますか？')) return;
  const idx = MOCK_DATA.chatRooms.findIndex(r => r.id === editingChatRoomId);
  if (idx >= 0) MOCK_DATA.chatRooms.splice(idx, 1);
  closeChatRoomModal();
  navigateTo('chatrooms');
}
