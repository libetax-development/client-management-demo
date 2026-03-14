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

  // カスタムフィールド入力エリアを生成
  const cfArea = document.getElementById('client-custom-fields-area');
  const customFields = (MOCK_DATA.customFields || []).slice().sort((a, b) => a.order - b.order);
  if (customFields.length > 0) {
    cfArea.innerHTML = `
      <div style="border-top:1px solid var(--gray-200);padding-top:16px;margin-top:8px;">
        <div style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:12px;">カスタム項目</div>
        ${customFields.map(cf => {
          let input = '';
          const inputId = 'cf-val-' + cf.id;
          if (cf.type === 'textarea') {
            input = `<textarea id="${inputId}" rows="2" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:6px;font-size:13px;resize:vertical;"></textarea>`;
          } else if (cf.type === 'date') {
            input = `<input type="date" id="${inputId}">`;
          } else if (cf.type === 'number') {
            input = `<input type="number" id="${inputId}">`;
          } else {
            input = `<input type="text" id="${inputId}">`;
          }
          return `<div class="form-group"><label>${cf.name}</label>${input}</div>`;
        }).join('')}
      </div>`;
  } else {
    cfArea.innerHTML = '';
  }

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
      if (document.getElementById('new-client-annual-fee')) document.getElementById('new-client-annual-fee').value = c.annualFee || '';
      // カスタムフィールド値セット
      const cfv = c.customFieldValues || {};
      customFields.forEach(cf => {
        const el = document.getElementById('cf-val-' + cf.id);
        if (el) el.value = cfv[cf.id] || '';
      });
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
    if (document.getElementById('new-client-annual-fee')) document.getElementById('new-client-annual-fee').value = '';
    // カスタムフィールド初期化
    customFields.forEach(cf => {
      const el = document.getElementById('cf-val-' + cf.id);
      if (el) el.value = '';
    });
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
  const annualFee = parseInt(document.getElementById('new-client-annual-fee')?.value) || 0;
  const cwAccountId = document.getElementById('new-client-cw-id').value.trim();

  if (!name) { alert('顧客名を入力してください'); return; }
  if (!monthlySales) { alert('月額報酬を入力してください'); return; }

  // カスタムフィールド値を収集
  const customFieldValues = {};
  (MOCK_DATA.customFields || []).forEach(cf => {
    const el = document.getElementById('cf-val-' + cf.id);
    if (el && el.value.trim()) customFieldValues[cf.id] = el.value.trim();
  });

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
      c.annualFee = annualFee;
      c.address = address;
      c.tel = tel;
      c.industry = industry;
      c.representative = representative;
      c.taxOffice = taxOffice;
      c.cwAccountId = cwAccountId;
      c.customFieldValues = customFieldValues;
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
      annualFee,
      spotFees: [],
      address,
      tel,
      industry,
      representative,
      taxOffice,
      memo: '',
      establishDate: '',
      cwAccountId,
      cwRoomUrls: [],
      relatedClientIds: [],
      customFieldValues,
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
  registerPage('report-detail', renderReportDetail);
  registerPage('calendar', renderCalendar);
  registerPage('rewards', renderRewards);
  registerPage('chatrooms', renderChatRooms);
  registerPage('integrations', renderIntegrations);
  registerPage('automation', renderAutomation);
  registerPage('ai', renderAI);
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
      <button class="btn btn-csv btn-sm" onclick="exportClientCSV()">CSV出力</button>
      <button class="btn btn-csv btn-sm" onclick="importClientCSV()">CSV取り込み</button>
      <button class="btn btn-primary" onclick="navigateTo('client-detail',{id:'new'})">+ 新規顧客</button>
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
let clientEditMode = false;

function renderClientDetail(el, params) {
  const isNew = params.id === 'new';
  const editing = isNew || clientEditMode;
  const c = isNew ? null : getClientById(params.id);
  if (!isNew && !c) { el.innerHTML = '<div class="empty-state"><div class="icon">?</div><p>顧客が見つかりません</p></div>'; return; }

  const staffOptions = MOCK_DATA.users.filter(u => u.isActive && u.role !== 'admin').map(u =>
    `<option value="${u.id}">${u.name}</option>`
  ).join('');
  const fiscalOptions = Array.from({length: 12}, (_, i) =>
    `<option value="${i + 1}">${i + 1}月</option>`
  ).join('');

  const customFields = (MOCK_DATA.customFields || []).slice().sort((a, b) => a.order - b.order);
  const cfValues = c ? (c.customFieldValues || {}) : {};

  if (isNew) {
    document.getElementById('header-title').textContent = '新規顧客登録';
  } else {
    document.getElementById('header-title').textContent = editing ? `顧客編集 - ${c.name}` : `顧客詳細 - ${c.name}`;
  }

  // ヘルパー: 閲覧モードの値表示
  const val = (v, fallback) => v || `<span style="color:var(--gray-400)">${fallback || '-'}</span>`;
  // ヘルパー: インライン入力
  const inp = (id, v, type, placeholder) => {
    if (type === 'select-staff') return `<select id="${id}" class="inline-edit-input">${'<option value="">なし</option>' + staffOptions}</select>`;
    if (type === 'select-fiscal') return `<select id="${id}" class="inline-edit-input">${fiscalOptions}</select>`;
    if (type === 'select-type') return `<select id="${id}" class="inline-edit-input"><option value="法人">法人</option><option value="個人">個人</option></select>`;
    if (type === 'number') return `<input type="number" id="${id}" class="inline-edit-input" value="${v || ''}" placeholder="${placeholder || ''}" min="0" step="1000">`;
    if (type === 'date') return `<input type="date" id="${id}" class="inline-edit-input" value="${v || ''}">`;
    if (type === 'textarea') return `<textarea id="${id}" class="inline-edit-input" rows="2" placeholder="${placeholder || ''}">${v || ''}</textarea>`;
    return `<input type="text" id="${id}" class="inline-edit-input" value="${v || ''}" placeholder="${placeholder || ''}">`;
  };

  const tasks = c ? getTasksByClient(c.id) : [];

  // 担当者情報（閲覧モード用）
  const main = c ? getUserById(c.mainUserId) : null;
  const sub = c ? getUserById(c.subUserId) : null;
  const mgr = c ? getUserById(c.mgrUserId) : null;

  // SPOT報酬
  const spotFees = c ? (c.spotFees || []) : [];

  // CWルームURL
  const cwRoomUrls = c ? (c.cwRoomUrls || []) : [];

  // 関連顧客
  const relatedClientIds = c ? (c.relatedClientIds || []) : [];
  const otherClients = c ? MOCK_DATA.clients.filter(oc => oc.id !== c.id && !relatedClientIds.includes(oc.id)) : MOCK_DATA.clients;

  // SPOT報酬ビューHTML
  const spotFeesViewHtml = spotFees.length === 0
    ? '<span style="color:var(--gray-400)">なし</span>'
    : `<table class="spot-fee-table"><thead><tr><th>タイミング</th><th>金額</th><th>内容</th></tr></thead><tbody>${spotFees.map(sf =>
        `<tr><td>${sf.timing}</td><td>${(sf.amount || 0).toLocaleString()}円</td><td>${sf.description || ''}</td></tr>`
      ).join('')}</tbody></table>`;

  // SPOT報酬編集HTML
  const spotFeesEditHtml = `
    <div id="spot-fees-edit-area">
      ${spotFees.map((sf, i) =>
        `<div class="spot-fee-edit-item" data-index="${i}" style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:12px;">
          <span>${sf.timing}</span> <span>${(sf.amount || 0).toLocaleString()}円</span> <span>${sf.description || ''}</span>
          <button class="spot-fee-del" onclick="removeSpotFee(${i},'${c?.id || ''}')">&times;</button>
        </div>`
      ).join('')}
      <div class="spot-fee-add-row">
        <input type="text" id="add-sf-timing" placeholder="2026-05" style="width:90px;">
        <input type="number" id="add-sf-amount" placeholder="金額" min="0" step="1000">
        <input type="text" id="add-sf-desc" class="spot-fee-desc-input" placeholder="内容">
        <button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="addSpotFee('${c?.id || ''}')">追加</button>
      </div>
    </div>`;

  // CWルームURL ビューHTML
  const cwRoomUrlsViewHtml = cwRoomUrls.length === 0
    ? '<span style="color:var(--gray-400)">なし</span>'
    : `<div class="cw-room-list">${cwRoomUrls.map(r =>
        `<div class="cw-room-item"><a href="${r.url}" target="_blank">${r.name || r.url}</a></div>`
      ).join('')}</div>`;

  // CWルームURL 編集HTML
  const cwRoomUrlsEditHtml = `
    <div id="cw-room-urls-edit-area">
      ${cwRoomUrls.map((r, i) =>
        `<div class="cw-room-item" data-index="${i}">
          <span style="font-size:12px;">${r.name || r.url}</span>
          <button class="cw-room-del" onclick="removeCwRoomUrl(${i},'${c?.id || ''}')">&times;</button>
        </div>`
      ).join('')}
      <div class="cw-room-add-row">
        <input type="text" id="add-cwroom-url" class="cw-room-url-input" placeholder="https://www.chatwork.com/#!rid...">
        <input type="text" id="add-cwroom-name" class="cw-room-name-input" placeholder="表示名">
        <button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="addCwRoomUrl('${c?.id || ''}')">追加</button>
      </div>
    </div>`;

  // 関連顧客ビューHTML
  const relatedClientsViewHtml = relatedClientIds.length === 0
    ? '<span style="color:var(--gray-400)">なし</span>'
    : relatedClientIds.map(rid => {
        const rc = getClientById(rid);
        if (!rc) return '';
        return `<div class="related-client-item"><a href="#" onclick="event.preventDefault();navigateTo('client-detail',{id:'${rc.id}'})">${rc.name}</a> <span class="type-badge ${rc.clientType === '法人' ? 'type-corp' : 'type-individual'}" style="font-size:10px;">${rc.clientType}</span></div>`;
      }).join('');

  // 関連顧客編集HTML
  const relatedClientsEditHtml = `
    <div id="related-clients-edit-area">
      ${relatedClientIds.map((rid, i) => {
        const rc = getClientById(rid);
        if (!rc) return '';
        return `<div class="related-client-item">
          <span style="font-size:12px;">${rc.name} (${rc.clientType})</span>
          <button class="related-client-del" onclick="removeRelatedClient('${c?.id || ''}','${rid}')">&times;</button>
        </div>`;
      }).join('')}
      ${otherClients.length > 0 ? `
        <div class="related-client-add-row">
          <select id="add-related-client-select">
            <option value="">顧客を選択...</option>
            ${otherClients.map(oc => `<option value="${oc.id}">${oc.name} (${oc.clientType})</option>`).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="addRelatedClient('${c?.id || ''}')">追加</button>
        </div>
      ` : ''}
    </div>`;

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('clients')">&larr; 顧客一覧に戻る</a></div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-header">
        <h3>${isNew ? '新規顧客登録' : '顧客情報'}</h3>
        <div style="display:flex;gap:8px;">
          ${editing
            ? `<button class="btn btn-primary btn-sm" onclick="saveClientInline('${isNew ? 'new' : c.id}')">保存</button>
               <button class="btn btn-secondary btn-sm" onclick="${isNew ? "navigateTo('clients')" : `clientEditMode=false;navigateTo('client-detail',{id:'${c.id}'})`}">キャンセル</button>`
            : `<button class="btn btn-primary btn-sm" onclick="clientEditMode=true;navigateTo('client-detail',{id:'${c.id}'})">編集</button>`
          }
        </div>
      </div>
      <div class="card-body">

        <div class="detail-section-title">基本情報</div>
        ${!isNew ? `<div class="detail-row"><div class="detail-label">顧客コード</div><div class="detail-value">${c.clientCode}</div></div>` : ''}
        <div class="detail-row"><div class="detail-label">顧客名</div><div class="detail-value">${editing ? inp('ed-name', c?.name, 'text', '例: 株式会社サンプル商事') : val(c.name)}</div></div>
        <div class="detail-row"><div class="detail-label">種別</div><div class="detail-value">${editing ? inp('ed-type', '', 'select-type') : `<span class="type-badge ${c.clientType === '法人' ? 'type-corp' : 'type-individual'}">${c.clientType}</span>`}</div></div>
        <div class="detail-row"><div class="detail-label">決算月</div><div class="detail-value">${editing ? inp('ed-fiscal', '', 'select-fiscal') : c.fiscalMonth + '月'}</div></div>
        <div class="detail-row"><div class="detail-label">月額報酬（税抜）</div><div class="detail-value">${editing ? inp('ed-sales', c?.monthlySales, 'number', '50000') : (c.monthlySales || 0).toLocaleString() + '円'}</div></div>
        <div class="detail-row"><div class="detail-label">年1申告報酬（税抜）</div><div class="detail-value">${editing ? inp('ed-annualfee', c?.annualFee, 'number', '150000') : (c?.annualFee || 0).toLocaleString() + '円'}</div></div>
        <div class="detail-row"><div class="detail-label">SPOT報酬</div><div class="detail-value">${editing ? spotFeesEditHtml : spotFeesViewHtml}</div></div>
        <div class="detail-row"><div class="detail-label">住所</div><div class="detail-value">${editing ? inp('ed-address', c?.address, 'text', '例: 東京都千代田区大手町1-1-1') : val(c.address)}</div></div>
        <div class="detail-row"><div class="detail-label">電話番号</div><div class="detail-value">${editing ? inp('ed-tel', c?.tel, 'text', '例: 03-1234-5678') : val(c.tel)}</div></div>
        <div class="detail-row"><div class="detail-label">代表者</div><div class="detail-value">${editing ? inp('ed-representative', c?.representative, 'text', '例: 山本 太郎') : val(c?.representative)}</div></div>
        <div class="detail-row"><div class="detail-label">業種</div><div class="detail-value">${editing ? inp('ed-industry', c?.industry, 'text', '例: 卸売業') : val(c.industry)}</div></div>
        <div class="detail-row"><div class="detail-label">管轄税務署</div><div class="detail-value">${editing ? inp('ed-taxoffice', c?.taxOffice, 'text', '例: 千代田税務署') : val(c.taxOffice)}</div></div>
        ${!editing && c.memo ? `<div class="detail-row"><div class="detail-label">備考</div><div class="detail-value">${c.memo}</div></div>` : ''}
        ${!isNew ? `<div class="detail-row"><div class="detail-label">ステータス</div><div class="detail-value">${c.isActive ? '有効' : '無効'}</div></div>` : ''}

        ${!isNew ? `
        <div class="detail-section-title">関連顧客</div>
        <div class="detail-row"><div class="detail-label">関連顧客</div><div class="detail-value">${editing ? relatedClientsEditHtml : relatedClientsViewHtml}</div></div>
        ` : ''}

        <div class="detail-section-title">担当者</div>
        <div class="detail-row"><div class="detail-label">担当税理士</div><div class="detail-value">${editing ? inp('ed-mgr', '', 'select-staff') : val(mgr?.name)}</div></div>
        <div class="detail-row"><div class="detail-label">主担当</div><div class="detail-value">${editing ? inp('ed-main', '', 'select-staff') : val(main?.name)}</div></div>
        <div class="detail-row"><div class="detail-label">副担当</div><div class="detail-value">${editing ? inp('ed-sub', '', 'select-staff') : val(sub?.name)}</div></div>
        ${!editing ? `<div class="detail-row"><div class="detail-label">外部リンク</div><div class="detail-value"><a href="#" onclick="event.preventDefault();window.open('https://www.dropbox.com','_blank')">Dropboxフォルダを開く</a></div></div>` : ''}

        <div class="detail-section-title">Chatwork連携</div>
        <div class="detail-row"><div class="detail-label">CWアカウントID</div><div class="detail-value">${editing ? inp('ed-cwid', c?.cwAccountId, 'text', '例: 1234567') : val(c?.cwAccountId, '未設定')}</div></div>
        ${!editing ? `
          <div class="detail-row"><div class="detail-label">メンション</div><div class="detail-value">${c.cwAccountId ? '<code style="background:var(--gray-100);padding:2px 6px;border-radius:3px;font-size:12px;">[To:' + c.cwAccountId + ']' + c.name + 'さん</code>' : val('', '-')}</div></div>
        ` : ''}
        <div class="detail-row"><div class="detail-label">CWルームURL</div><div class="detail-value">${editing ? cwRoomUrlsEditHtml : cwRoomUrlsViewHtml}</div></div>

        ${customFields.length > 0 || editing ? `
          <div class="detail-section-title" style="display:flex;align-items:center;justify-content:space-between;">
            カスタム項目
            ${editing ? '<button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="openCustomFieldModal()">項目設定</button>' : ''}
          </div>
          ${customFields.map(cf => {
            if (editing) {
              let cfInp = '';
              const cfId = 'cf-val-' + cf.id;
              const cfVal = cfValues[cf.id] || '';
              if (cf.type === 'textarea') cfInp = `<textarea id="${cfId}" class="inline-edit-input" rows="2">${cfVal}</textarea>`;
              else if (cf.type === 'date') cfInp = `<input type="date" id="${cfId}" class="inline-edit-input" value="${cfVal}">`;
              else if (cf.type === 'number') cfInp = `<input type="number" id="${cfId}" class="inline-edit-input" value="${cfVal}">`;
              else cfInp = `<input type="text" id="${cfId}" class="inline-edit-input" value="${cfVal}">`;
              return `<div class="detail-row"><div class="detail-label">${cf.name}</div><div class="detail-value">${cfInp}</div></div>`;
            }
            return `<div class="detail-row"><div class="detail-label">${cf.name}</div><div class="detail-value">${val(cfValues[cf.id])}</div></div>`;
          }).join('')}
        ` : ''}
      </div>
    </div>

    ${!isNew ? `
    <div class="card" style="margin-bottom:16px">
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
    <div style="text-align:right;">
      <button class="btn btn-danger" onclick="deleteClient('${c.id}')" style="background:var(--danger);color:#fff;border:none;">顧客を削除</button>
    </div>
    ` : ''}
  `;

  // 編集モード: selectの値をセット（innerHTML後でないと反映されない）
  if (editing) {
    const setVal = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
    setVal('ed-type', c?.clientType || '法人');
    setVal('ed-fiscal', c?.fiscalMonth || 3);
    setVal('ed-mgr', c?.mgrUserId || '');
    setVal('ed-main', c?.mainUserId || '');
    setVal('ed-sub', c?.subUserId || '');
  }
}

function saveClientInline(id) {
  const isNew = id === 'new';
  const name = (document.getElementById('ed-name')?.value || '').trim();
  const clientType = document.getElementById('ed-type')?.value || '法人';
  const fiscalMonth = parseInt(document.getElementById('ed-fiscal')?.value) || 3;
  const monthlySales = parseInt(document.getElementById('ed-sales')?.value) || 0;
  const annualFee = parseInt(document.getElementById('ed-annualfee')?.value) || 0;
  const address = (document.getElementById('ed-address')?.value || '').trim();
  const tel = (document.getElementById('ed-tel')?.value || '').trim();
  const representative = (document.getElementById('ed-representative')?.value || '').trim();
  const industry = (document.getElementById('ed-industry')?.value || '').trim();
  const taxOffice = (document.getElementById('ed-taxoffice')?.value || '').trim();
  const mgrUserId = document.getElementById('ed-mgr')?.value || '';
  const mainUserId = document.getElementById('ed-main')?.value || '';
  const subUserId = document.getElementById('ed-sub')?.value || null;
  const cwAccountId = (document.getElementById('ed-cwid')?.value || '').trim();

  // カスタムフィールド値
  const customFieldValues = {};
  (MOCK_DATA.customFields || []).forEach(cf => {
    const el = document.getElementById('cf-val-' + cf.id);
    if (el && el.value.trim()) customFieldValues[cf.id] = el.value.trim();
  });

  if (!name) { alert('顧客名を入力してください'); return; }

  if (isNew) {
    const lastCode = MOCK_DATA.clients.length > 0 ? MOCK_DATA.clients[MOCK_DATA.clients.length - 1].clientCode : '030449';
    const nextCode = String(parseInt(lastCode) + 1).padStart(6, '0');
    const newId = 'c-' + String(MOCK_DATA.clients.length + 1).padStart(3, '0');
    MOCK_DATA.clients.push({
      id: newId, clientCode: nextCode, name, clientType, fiscalMonth,
      isActive: true, mainUserId, subUserId, mgrUserId: mgrUserId || mainUserId,
      monthlySales, annualFee, spotFees: [], address, tel, industry, representative, taxOffice,
      memo: '', establishDate: '', cwAccountId, cwRoomUrls: [], relatedClientIds: [], customFieldValues,
    });
    clientEditMode = false;
    navigateTo('client-detail', { id: newId });
  } else {
    const c = getClientById(id);
    if (c) {
      c.name = name; c.clientType = clientType; c.fiscalMonth = fiscalMonth;
      c.mgrUserId = mgrUserId || mainUserId; c.mainUserId = mainUserId; c.subUserId = subUserId;
      c.monthlySales = monthlySales; c.annualFee = annualFee;
      c.address = address; c.tel = tel;
      c.industry = industry; c.representative = representative; c.taxOffice = taxOffice;
      c.cwAccountId = cwAccountId;
      c.customFieldValues = customFieldValues;
    }
    clientEditMode = false;
    navigateTo('client-detail', { id });
  }
}

// SPOT報酬の追加・削除
function addSpotFee(clientId) {
  const timing = (document.getElementById('add-sf-timing')?.value || '').trim();
  const amount = parseInt(document.getElementById('add-sf-amount')?.value) || 0;
  const description = (document.getElementById('add-sf-desc')?.value || '').trim();
  if (!timing || !amount) { alert('タイミングと金額を入力してください'); return; }
  const c = getClientById(clientId);
  if (!c) return;
  if (!c.spotFees) c.spotFees = [];
  c.spotFees.push({ id: 'sf-' + Date.now(), timing, amount, description });
  navigateTo('client-detail', { id: clientId });
}

function removeSpotFee(index, clientId) {
  const c = getClientById(clientId);
  if (!c || !c.spotFees) return;
  c.spotFees.splice(index, 1);
  navigateTo('client-detail', { id: clientId });
}

// CWルームURLの追加・削除
function addCwRoomUrl(clientId) {
  const url = (document.getElementById('add-cwroom-url')?.value || '').trim();
  const name = (document.getElementById('add-cwroom-name')?.value || '').trim();
  if (!url) { alert('URLを入力してください'); return; }
  const c = getClientById(clientId);
  if (!c) return;
  if (!c.cwRoomUrls) c.cwRoomUrls = [];
  c.cwRoomUrls.push({ url, name: name || url });
  navigateTo('client-detail', { id: clientId });
}

function removeCwRoomUrl(index, clientId) {
  const c = getClientById(clientId);
  if (!c || !c.cwRoomUrls) return;
  c.cwRoomUrls.splice(index, 1);
  navigateTo('client-detail', { id: clientId });
}

// 関連顧客の追加・削除
function addRelatedClient(clientId) {
  const select = document.getElementById('add-related-client-select');
  if (!select || !select.value) { alert('顧客を選択してください'); return; }
  const targetId = select.value;
  const c = getClientById(clientId);
  const target = getClientById(targetId);
  if (!c || !target) return;
  if (!c.relatedClientIds) c.relatedClientIds = [];
  if (!target.relatedClientIds) target.relatedClientIds = [];
  if (!c.relatedClientIds.includes(targetId)) c.relatedClientIds.push(targetId);
  if (!target.relatedClientIds.includes(clientId)) target.relatedClientIds.push(clientId);
  navigateTo('client-detail', { id: clientId });
}

function removeRelatedClient(clientId, targetId) {
  const c = getClientById(clientId);
  const target = getClientById(targetId);
  if (c && c.relatedClientIds) c.relatedClientIds = c.relatedClientIds.filter(id => id !== targetId);
  if (target && target.relatedClientIds) target.relatedClientIds = target.relatedClientIds.filter(id => id !== clientId);
  navigateTo('client-detail', { id: clientId });
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
            <div id="task-comments-list"></div>
            <div style="display:flex;gap:8px;">
              <input type="text" class="search-input" id="task-comment-input" style="flex:1;width:auto" placeholder="コメントを入力...">
              <button class="btn btn-primary btn-sm" id="task-comment-send">送信</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  renderTaskComments(t.id);

  document.getElementById('task-comment-send').addEventListener('click', () => submitTaskComment(t.id));
  document.getElementById('task-comment-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitTaskComment(t.id); }
  });
}

function renderTaskComments(taskId) {
  const comments = getTaskComments(taskId);
  const container = document.getElementById('task-comments-list');
  if (comments.length === 0) {
    container.innerHTML = '<div style="padding:12px;color:var(--gray-400);font-size:13px;">コメントはまだありません</div>';
    return;
  }
  container.innerHTML = comments.map(c => {
    const author = getUserById(c.authorId);
    return `<div style="padding:12px;background:var(--gray-50);border-radius:6px;margin-bottom:8px;">
      <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px;">${author?.name || '-'} - ${formatDate(c.createdAt)}</div>
      <div style="font-size:13px;">${escapeHtml(c.body)}</div>
    </div>`;
  }).join('');
}

function submitTaskComment(taskId) {
  const input = document.getElementById('task-comment-input');
  const body = input.value.trim();
  if (!body) return;

  const newId = 'tc-' + String(MOCK_DATA.taskComments.length + 1).padStart(3, '0');
  MOCK_DATA.taskComments.push({
    id: newId,
    taskId: taskId,
    authorId: MOCK_DATA.currentUser.id,
    body: body,
    createdAt: new Date().toISOString(),
  });

  input.value = '';
  renderTaskComments(taskId);
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
      <button class="btn btn-csv btn-sm" onclick="exportStaffCSV()">CSV出力</button>
      <button class="btn btn-csv btn-sm" onclick="importStaffCSV()">CSV取り込み</button>
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
  navigateTo('report-detail', { id });
}

// ===========================
// 報告書詳細
// ===========================
function renderReportDetail(el, params) {
  const r = MOCK_DATA.reports.find(x => x.id === params.id);
  if (!r) { el.innerHTML = '<div class="empty-state"><div class="icon">?</div><p>報告書が見つかりません</p></div>'; return; }
  const author = getUserById(r.authorId);
  document.getElementById('header-title').textContent = `報告書詳細 - ${r.title}`;

  // モック本文を種別に応じて生成
  const mockBody = generateReportBody(r);

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('reports')">&larr; 報告書一覧に戻る</a></div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-header">
          <h3>${r.title}</h3>
          <div style="display:flex;gap:8px;">
            <span class="rp-row-badge ${r.readStatus === '未読' ? 'rp-badge-unread' : r.readStatus === '一時保存中' ? 'rp-badge-draft' : 'rp-badge-read'}">${r.readStatus}</span>
          </div>
        </div>
        <div class="card-body">
          <div style="white-space:pre-wrap;font-size:13px;line-height:1.8;color:var(--gray-700);">${escapeHtml(mockBody)}</div>
          ${r.hasAttachment ? '<div style="margin-top:16px;padding:12px;background:var(--gray-50);border-radius:6px;"><span style="font-size:13px;">&#128206; 添付ファイル: <a href="#" onclick="event.preventDefault();alert(\'ファイルを開きます（モック）\')">' + r.title.slice(0, 20) + '_資料.pdf</a></span></div>' : ''}
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><h3>報告書情報</h3></div>
          <div class="card-body">
            <div class="detail-row"><div class="detail-label">作成者</div><div class="detail-value">${author?.name || '-'}</div></div>
            <div class="detail-row"><div class="detail-label">作成日時</div><div class="detail-value">${formatDate(r.createdAt)}</div></div>
            <div class="detail-row"><div class="detail-label">種別</div><div class="detail-value">${r.type}</div></div>
            <div class="detail-row"><div class="detail-label">業務分類</div><div class="detail-value">${r.category}</div></div>
            <div class="detail-row"><div class="detail-label">顧客</div><div class="detail-value">${r.clientName || '-'}</div></div>
            <div class="detail-row"><div class="detail-label">ランク</div><div class="detail-value"><span class="rp-rank-display rp-rank-${r.rank}">${r.rank}</span></div></div>
            <div class="detail-row"><div class="detail-label">添付ファイル</div><div class="detail-value">${r.hasAttachment ? 'あり' : 'なし'}</div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>操作</h3></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="alert('Chatworkに転送しました（モック）')">Chatworkに転送</button>
            <button class="btn btn-secondary btn-sm" onclick="alert('PDFをダウンロードしました（モック）')">PDF出力</button>
            ${r.readStatus === '一時保存中' ? '<button class="btn btn-primary btn-sm" onclick="rpSubmitDraft(\'' + r.id + '\')">提出する</button>' : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function rpSubmitDraft(id) {
  const r = MOCK_DATA.reports.find(x => x.id === id);
  if (r) {
    r.readStatus = '未読';
    navigateTo('report-detail', { id });
  }
}

function generateReportBody(r) {
  if (r.type === '日報') {
    return `【日報】${r.title}

■ 本日の業務内容
・顧客対応（面談・メール・チャット）
・書類作成・チェック業務
・社内ミーティング参加

■ 明日の予定
・申告書類の最終確認
・顧客フォローアップ

■ 所感・連絡事項
特になし`;
  }
  const templates = {
    '確定申告': `【確定申告】${r.clientName}

■ 作業内容
${r.title}

■ 実施事項
・会計帳簿のチェック（仕訳内容・勘定科目の確認）
・前年度との比較分析
・不明点の洗い出しと顧客への確認事項整理

■ 確認事項
・売上計上基準の確認が必要
・経費の按分比率について顧客に確認中

■ 次のアクション
・顧客からの回答待ち → 回答後に申告書ドラフト作成予定
・レビュー依頼予定日: 未定`,

    '決算業務': `【決算業務】${r.clientName}

■ 作業内容
${r.title}

■ 実施事項
・決算整理仕訳の確認
・減価償却費の計算
・引当金の計上確認

■ 特記事項
・固定資産台帳との照合完了
・税効果会計の適用確認中

■ 次のアクション
・申告書作成に着手予定`,

    '月次業務': `【月次業務】${r.clientName}

■ 作業内容
${r.title}

■ 実施事項
・月次試算表の作成
・前月比較分析
・資金繰り表の更新

■ 連絡事項
・異常値なし
・顧客への月次報告完了`,
  };
  return templates[r.category] || `【${r.category}】${r.clientName}

■ 作業内容
${r.title}

■ 実施事項
・業務対応実施

■ 備考
特になし`;
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
      <select class="filter-select" id="cal-type-filter">
        <option value="">全て表示</option>
        <option value="task">タスク期限のみ</option>
        <option value="event">イベントのみ</option>
      </select>
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
    <div id="cal-day-detail" style="display:none;margin-top:16px;"></div>
  `;

  function draw() {
    document.getElementById('cal-title').textContent = `${calYear}年${calMonth + 1}月`;
    const userFilter = document.getElementById('cal-user-filter')?.value || '';
    const typeFilter = document.getElementById('cal-type-filter')?.value || '';
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date().toISOString().slice(0, 10);

    let tasks = typeFilter !== 'event' ? MOCK_DATA.tasks.filter(t => {
      if (userFilter && t.assigneeUserId !== userFilter) return false;
      return true;
    }) : [];

    let events = typeFilter !== 'task' ? MOCK_DATA.calendarEvents.filter(e => {
      if (userFilter && e.userId && e.userId !== userFilter) return false;
      return true;
    }) : [];

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
      const dayEvents = events.filter(e => e.date === dateStr);
      const allItems = [];

      dayTasks.forEach(t => {
        const client = getClientById(t.clientId);
        allItems.push({ html: `<div class="cal-event ${getStatusClass(t.status)}" title="${client?.name}: ${t.title}">${client?.name?.slice(0, 6) || ''} ${t.title.slice(0, 8)}</div>` });
      });
      dayEvents.forEach(e => {
        const typeClass = e.type === 'deadline' ? 'cal-event-deadline' : e.type === 'internal' ? 'cal-event-internal' : 'cal-event-meeting';
        const timeStr = e.time ? e.time + ' ' : '';
        allItems.push({ html: `<div class="cal-event ${typeClass}" title="${e.title}${e.location ? ' (' + e.location + ')' : ''}">${timeStr}${e.title.slice(0, 10)}</div>` });
      });

      html += `<div class="cal-day ${isToday ? 'cal-today' : ''} ${dow === 0 ? 'cal-sun' : dow === 6 ? 'cal-sat' : ''}" data-date="${dateStr}" style="cursor:pointer;">
        <div class="cal-date">${d}</div>
        ${allItems.slice(0, 3).map(i => i.html).join('')}
        ${allItems.length > 3 ? `<div class="cal-more">+${allItems.length - 3}件</div>` : ''}
      </div>`;
    }

    document.getElementById('cal-grid').innerHTML = html;

    // 日付クリックで詳細表示
    document.querySelectorAll('.cal-day[data-date]').forEach(cell => {
      cell.addEventListener('click', () => showCalDayDetail(cell.dataset.date, userFilter, typeFilter));
    });
  }

  function showCalDayDetail(dateStr, userFilter, typeFilter) {
    const detail = document.getElementById('cal-day-detail');
    const dayTasks = typeFilter !== 'event' ? MOCK_DATA.tasks.filter(t => {
      if (t.dueDate !== dateStr) return false;
      if (userFilter && t.assigneeUserId !== userFilter) return false;
      return true;
    }) : [];
    const dayEvents = typeFilter !== 'task' ? MOCK_DATA.calendarEvents.filter(e => {
      if (e.date !== dateStr) return false;
      if (userFilter && e.userId && e.userId !== userFilter) return false;
      return true;
    }) : [];

    if (dayTasks.length === 0 && dayEvents.length === 0) {
      detail.style.display = 'none';
      return;
    }

    const d = new Date(dateStr);
    const dateLabel = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

    let html = `<div class="card">
      <div class="card-header"><h3>${dateLabel} の予定</h3><button class="btn-icon" onclick="document.getElementById('cal-day-detail').style.display='none'">&times;</button></div>
      <div class="card-body">`;

    if (dayEvents.length > 0) {
      html += '<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:600;color:var(--gray-500);margin-bottom:8px;">イベント</div>';
      html += dayEvents.map(e => {
        const user = e.userId ? getUserById(e.userId) : null;
        const client = e.clientId ? getClientById(e.clientId) : null;
        const typeLabel = { meeting: '面談', internal: '社内', deadline: '期限' }[e.type] || e.type;
        return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--gray-100);">
          <span class="cal-event-type-badge cal-event-${e.type}" style="font-size:11px;padding:2px 8px;border-radius:4px;font-weight:600;">${typeLabel}</span>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;">${e.time ? e.time + ' ' : ''}${e.title}</div>
            <div style="font-size:11px;color:var(--gray-400);">${[user?.name, client?.name, e.location].filter(Boolean).join(' / ')}</div>
          </div>
        </div>`;
      }).join('');
      html += '</div>';
    }

    if (dayTasks.length > 0) {
      html += '<div><div style="font-size:12px;font-weight:600;color:var(--gray-500);margin-bottom:8px;">タスク期限</div>';
      html += dayTasks.map(t => {
        const client = getClientById(t.clientId);
        const assignee = getUserById(t.assigneeUserId);
        return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--gray-100);cursor:pointer;" onclick="navigateTo('task-detail',{id:'${t.id}'})">
          <span class="status-badge ${getStatusClass(t.status)}">${t.status}</span>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;">${t.title}</div>
            <div style="font-size:11px;color:var(--gray-400);">${client?.name || '-'} / ${assignee?.name || '-'}</div>
          </div>
        </div>`;
      }).join('');
      html += '</div>';
    }

    html += '</div></div>';
    detail.innerHTML = html;
    detail.style.display = 'block';
  }

  document.getElementById('cal-prev').addEventListener('click', () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } draw(); });
  document.getElementById('cal-next').addEventListener('click', () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } draw(); });
  document.getElementById('cal-user-filter').addEventListener('change', draw);
  document.getElementById('cal-type-filter').addEventListener('change', draw);
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
  chatwork: { connected: true, account: 'リベ大税理士法人', date: '2025-05-20', webhookUrl: 'https://api.chatwork.com/v2/webhook/xxxxx', roomId: '300000001', lastSync: '2026-03-11T08:30:00' },
  google: { connected: true, account: 'hiro@libetax.jp', date: '2025-04-01', calendars: [{ name: '業務カレンダー', checked: true }, { name: '面談カレンダー', checked: true }, { name: '期限カレンダー', checked: false }], syncDirection: 'bidirectional', lastSync: '2026-03-11T07:00:00' },
  dropbox: { connected: true, account: 'libetax@dropbox.com', date: '2025-08-15', rootPath: '/リベ大税理士法人/顧客資料', usedStorage: '45.2 GB', totalStorage: '2 TB', autoCreateFolder: true, namingRule: '{顧客コード}_{顧客名}', lastSync: '2026-03-11T06:00:00' },
  zoom: { connected: false, account: '', date: '', lastSync: null },
  freee: { connected: true, account: 'リベ大税理士法人', date: '2025-06-01', lastSync: '2026-03-10T22:00:00' },
  slack: { connected: false },
  eltax: { connected: true, account: '利用者識別番号: 1234567890', date: '2025-09-01', lastSync: '2026-03-10T18:00:00' },
  etax: { connected: true, account: '利用者識別番号: 0987654321', date: '2025-09-01', lastSync: '2026-03-10T18:00:00' },
};

const integrationDefs = [
  { key: 'chatwork', name: 'Chatwork', icon: '💬', description: '顧客・チーム間メッセージ連携' },
  { key: 'google', name: 'Googleカレンダー', icon: '📅', description: 'スケジュール・面談予約連携' },
  { key: 'dropbox', name: 'Dropbox', icon: '📁', description: '顧客資料フォルダとの自動連携' },
  { key: 'zoom', name: 'Zoom', icon: '🎥', description: 'ミーティング予約・録画管理' },
  { key: 'freee', name: 'freee会計', icon: '📊', description: '仕訳データ・試算表の自動取込' },
  { key: 'slack', name: 'Slack', icon: '📢', description: 'チーム内通知・アラート配信' },
  { key: 'eltax', name: 'eLTAX', icon: '🏛️', description: '地方税電子申告連携' },
  { key: 'etax', name: 'e-Tax', icon: '🏛️', description: '国税電子申告連携' },
];

// ── 外部連携: mock upcoming events for Google Calendar ──
const mockUpcomingEvents = [
  { date: '2026-03-12', time: '10:00', title: '株式会社サンプル商事 月次面談' },
  { date: '2026-03-14', time: '14:00', title: '株式会社リベ不動産 決算打ち合わせ' },
  { date: '2026-03-15', time: '09:00', title: '確定申告期限（個人）' },
];

const mockZoomMeetings = [
  { date: '2026-03-10', title: '株式会社CRAT zoom面談', duration: '45分', recordingUrl: '#' },
  { date: '2026-03-07', title: '田中一郎 確定申告相談', duration: '30分', recordingUrl: '#' },
  { date: '2026-03-05', title: 'チーム定例ミーティング', duration: '60分', recordingUrl: '#' },
];

let intExpandedCards = {};

function toggleIntegration(key) {
  const st = integrationStates[key];
  if (!st) return;
  if (st.connected) {
    if (!confirm(`${integrationDefs.find(d => d.key === key)?.name || key} の接続を切断しますか？`)) return;
    st.connected = false;
    delete st.account;
    delete st.date;
    st.lastSync = null;
  } else {
    const today = new Date().toISOString().slice(0, 10);
    st.connected = true;
    st.lastSync = new Date().toISOString();
    if (key === 'chatwork') { st.account = 'リベ大税理士法人'; st.webhookUrl = ''; st.roomId = ''; }
    else if (key === 'google') { st.account = 'hiro@libetax.jp'; st.calendars = [{ name: '業務カレンダー', checked: true }, { name: '面談カレンダー', checked: false }, { name: '期限カレンダー', checked: false }]; st.syncDirection = 'bidirectional'; }
    else if (key === 'dropbox') { st.account = 'libetax@dropbox.com'; st.rootPath = ''; st.usedStorage = '45.2 GB'; st.totalStorage = '2 TB'; st.autoCreateFolder = false; st.namingRule = '{顧客コード}_{顧客名}'; }
    else if (key === 'zoom') { st.account = 'hiro@libetax.jp'; }
    else { st.account = key + '@example.com'; }
    st.date = today;
  }
  const content = document.getElementById('page-content');
  if (content) renderIntegrations(content);
}

function toggleIntCard(key) {
  intExpandedCards[key] = !intExpandedCards[key];
  const content = document.getElementById('page-content');
  if (content) renderIntegrations(content);
}

function intFlash(elementId, msg, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const bg = type === 'success' ? '#d1ecf1' : type === 'warning' ? '#fff3cd' : '#d1ecf1';
  const border = type === 'success' ? '#bee5eb' : type === 'warning' ? '#ffeeba' : '#bee5eb';
  const color = type === 'success' ? '#0c5460' : type === 'warning' ? '#856404' : '#0c5460';
  el.innerHTML = `<div style="background:${bg};border:1px solid ${border};border-radius:6px;color:${color};font-size:12px;padding:6px 10px;margin-top:8px;">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 3000);
}

function chatworkTestSend() {
  intFlash('int-flash-chatwork', 'テストメッセージを送信しました', 'success');
}

function saveChatworkSettings() {
  const st = integrationStates.chatwork;
  st.webhookUrl = document.getElementById('int-cw-webhook')?.value || '';
  st.roomId = document.getElementById('int-cw-roomid')?.value || '';
  intFlash('int-flash-chatwork', '設定を保存しました', 'success');
}

function toggleGoogleCalendar(idx) {
  const st = integrationStates.google;
  if (st.calendars && st.calendars[idx]) {
    st.calendars[idx].checked = !st.calendars[idx].checked;
  }
}

function setGoogleSyncDirection(val) {
  integrationStates.google.syncDirection = val;
}

function saveDropboxSettings() {
  const st = integrationStates.dropbox;
  st.rootPath = document.getElementById('int-dbx-root')?.value || '';
  st.namingRule = document.getElementById('int-dbx-naming')?.value || '';
  intFlash('int-flash-dropbox', '設定を保存しました', 'success');
}

function toggleDropboxAutoCreate() {
  integrationStates.dropbox.autoCreateFolder = !integrationStates.dropbox.autoCreateFolder;
  const content = document.getElementById('page-content');
  if (content) renderIntegrations(content);
}

function zoomCreateMeeting() {
  intFlash('int-flash-zoom', '会議を作成しました: https://zoom.us/j/1234567890 (コピー済み)', 'success');
}

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
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
        const expanded = intExpandedCards[d.key];
        return `
        <div class="card int-card">
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;cursor:pointer;" onclick="toggleIntCard('${d.key}')">
              <div style="font-size:28px;">${d.icon}</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:15px;">${d.name}</div>
                <div style="font-size:12px;color:var(--gray-500);">${d.description}</div>
              </div>
              <span class="status-badge ${st.connected ? 'status-done' : 'status-todo'}">${st.connected ? '接続済み' : '未接続'}</span>
              <span style="font-size:12px;color:var(--gray-400);transition:transform .2s;display:inline-block;${expanded ? 'transform:rotate(180deg)' : ''}">▼</span>
            </div>
            ${st.connected && st.lastSync ? `<div style="font-size:11px;color:var(--gray-400);margin-bottom:8px;">最終同期: ${formatDateTime(st.lastSync)}</div>` : ''}
            ${expanded ? renderIntegrationDetails(d.key, st) : renderIntegrationSummary(d.key, st)}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function renderIntegrationSummary(key, st) {
  if (!st.connected) {
    return `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('${key}')">接続する</button>`;
  }
  return `
    <div style="background:var(--gray-50);border-radius:6px;padding:8px 12px;font-size:12px;color:var(--gray-600);margin-bottom:8px;">
      アカウント: ${st.account}
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();toggleIntCard('${key}')">詳細設定</button>
      <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('${key}')">切断</button>
    </div>`;
}

function renderIntegrationDetails(key, st) {
  if (key === 'chatwork') return renderChatworkDetails(st);
  if (key === 'google') return renderGoogleDetails(st);
  if (key === 'dropbox') return renderDropboxDetails(st);
  if (key === 'zoom') return renderZoomDetails(st);
  // fallback for other integrations
  if (!st.connected) {
    return `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('${key}')">接続する</button>`;
  }
  return `
    <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
      <div>アカウント: ${st.account}</div>
      <div>接続日: ${formatDate(st.date)}</div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();alert('同期設定画面')">設定</button>
      <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('${key}')">切断</button>
    </div>
    <div id="int-flash-${key}"></div>`;
}

function renderChatworkDetails(st) {
  if (!st.connected) {
    return `
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('chatwork')">接続する</button>`;
  }
  return `
    <div class="int-detail-section">
      <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
        <div style="font-weight:600;margin-bottom:4px;">接続アカウント</div>
        <div>${st.account}</div>
        <div style="margin-top:4px;">接続日: ${formatDate(st.date)}</div>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:12px;">Webhook URL</label>
        <input type="text" id="int-cw-webhook" value="${st.webhookUrl || ''}" placeholder="https://api.chatwork.com/v2/webhook/..." style="font-size:12px;padding:6px 8px;">
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:12px;">通知先ルームID</label>
        <input type="text" id="int-cw-roomid" value="${st.roomId || ''}" placeholder="300000001" style="font-size:12px;padding:6px 8px;">
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();saveChatworkSettings()">設定保存</button>
        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();chatworkTestSend()">テスト送信</button>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('chatwork')">切断</button>
      </div>
      <div id="int-flash-chatwork"></div>
    </div>`;
}

function renderGoogleDetails(st) {
  if (!st.connected) {
    return `
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('google')">Googleアカウント連携</button>`;
  }
  const cals = st.calendars || [];
  const dir = st.syncDirection || 'bidirectional';
  return `
    <div class="int-detail-section">
      <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
        <div style="font-weight:600;margin-bottom:4px;">接続アカウント</div>
        <div>${st.account}</div>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-700);margin-bottom:6px;">カレンダー選択</div>
        ${cals.map((c, i) => `
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:4px;cursor:pointer;">
            <input type="checkbox" ${c.checked ? 'checked' : ''} onchange="event.stopPropagation();toggleGoogleCalendar(${i})"> ${c.name}
          </label>
        `).join('')}
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-700);margin-bottom:6px;">同期方向</div>
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:4px;cursor:pointer;">
          <input type="radio" name="gcal-sync" value="bidirectional" ${dir === 'bidirectional' ? 'checked' : ''} onchange="event.stopPropagation();setGoogleSyncDirection('bidirectional')"> 双方向
        </label>
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:4px;cursor:pointer;">
          <input type="radio" name="gcal-sync" value="readonly" ${dir === 'readonly' ? 'checked' : ''} onchange="event.stopPropagation();setGoogleSyncDirection('readonly')"> 読み取りのみ
        </label>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-700);margin-bottom:6px;">直近の予定</div>
        <div style="border:1px solid var(--gray-200);border-radius:6px;overflow:hidden;">
          ${mockUpcomingEvents.map(e => `
            <div style="padding:8px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;display:flex;gap:8px;">
              <span style="color:var(--primary);font-weight:600;white-space:nowrap;">${e.date.slice(5)} ${e.time}</span>
              <span style="color:var(--gray-700);">${e.title}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('google')">切断</button>
      </div>
    </div>`;
}

function renderDropboxDetails(st) {
  if (!st.connected) {
    return `
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('dropbox')">Dropbox連携</button>`;
  }
  return `
    <div class="int-detail-section">
      <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
        <div style="font-weight:600;margin-bottom:4px;">接続アカウント</div>
        <div>${st.account}</div>
        <div style="margin-top:4px;">使用容量: <span style="font-weight:600;">${st.usedStorage || '0 GB'}</span> / ${st.totalStorage || '2 TB'}</div>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:12px;">ルートフォルダパス</label>
        <div style="display:flex;gap:6px;">
          <input type="text" id="int-dbx-root" value="${st.rootPath || ''}" placeholder="/リベ大税理士法人/顧客資料" style="font-size:12px;padding:6px 8px;flex:1;">
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();alert('フォルダ選択画面（モック）')">参照</button>
        </div>
      </div>
      <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:13px;font-weight:500;color:var(--gray-800);">顧客フォルダ自動作成</div>
          <div style="font-size:11px;color:var(--gray-400);">新規顧客追加時に自動でフォルダを作成</div>
        </div>
        <label class="toggle" onclick="event.stopPropagation();">
          <input type="checkbox" ${st.autoCreateFolder ? 'checked' : ''} onchange="toggleDropboxAutoCreate()">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:12px;">命名規則</label>
        <input type="text" id="int-dbx-naming" value="${st.namingRule || ''}" placeholder="{顧客コード}_{顧客名}" style="font-size:12px;padding:6px 8px;">
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();saveDropboxSettings()">設定保存</button>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('dropbox')">切断</button>
      </div>
      <div id="int-flash-dropbox"></div>
    </div>`;
}

function renderZoomDetails(st) {
  if (!st.connected) {
    return `
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('zoom')">Zoom連携</button>`;
  }
  return `
    <div class="int-detail-section">
      <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
        <div style="font-weight:600;margin-bottom:4px;">接続アカウント</div>
        <div>${st.account}</div>
      </div>
      <div style="margin-bottom:12px;">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();zoomCreateMeeting()">会議作成</button>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-700);margin-bottom:6px;">最近の会議</div>
        <div style="border:1px solid var(--gray-200);border-radius:6px;overflow:hidden;">
          ${mockZoomMeetings.map(m => `
            <div style="padding:8px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:500;color:var(--gray-800);">${m.title}</span>
                <span style="color:var(--gray-400);font-size:11px;">${m.duration}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
                <span style="color:var(--gray-500);">${m.date}</span>
                <a href="${m.recordingUrl}" style="font-size:11px;" onclick="event.stopPropagation();event.preventDefault();alert('録画ファイルを開きます（モック）')">録画を見る</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('zoom')">切断</button>
      </div>
      <div id="int-flash-zoom"></div>
    </div>`;
}

// ===========================
// 自動化設定
// ===========================

function getAutoTypeBadge(type) {
  const map = {
    reminder: { label: 'リマインド', cls: 'auto-type-reminder' },
    auto_create: { label: '自動生成', cls: 'auto-type-create' },
    cleanup: { label: 'クリーンアップ', cls: 'auto-type-cleanup' },
    escalation: { label: 'エスカレーション', cls: 'auto-type-escalation' },
  };
  const m = map[type] || { label: type, cls: '' };
  return `<span class="auto-type-badge ${m.cls}">${m.label}</span>`;
}

function toggleAutomationRule(ruleId) {
  const rule = MOCK_DATA.automationRules.find(r => r.id === ruleId);
  if (rule) {
    rule.enabled = !rule.enabled;
    const content = document.getElementById('page-content');
    if (content) renderAutomation(content);
  }
}

function runAutomationRule(ruleId) {
  const rule = MOCK_DATA.automationRules.find(r => r.id === ruleId);
  if (!rule) return;
  const targetCount = Math.floor(Math.random() * 8) + 1;
  rule.lastRun = new Date().toISOString();
  // Add to log
  const newLog = {
    id: 'al-' + String(MOCK_DATA.automationLog.length + 1).padStart(3, '0'),
    timestamp: rule.lastRun,
    ruleId: rule.id,
    ruleName: rule.name,
    result: '成功',
    targetCount: targetCount,
  };
  MOCK_DATA.automationLog.unshift(newLog);
  const content = document.getElementById('page-content');
  if (content) renderAutomation(content);
  setTimeout(() => {
    intFlash('auto-flash-' + ruleId, `ルール「${rule.name}」を実行しました。対象: ${targetCount}件`, 'success');
  }, 50);
}

function openAutomationModal() {
  document.getElementById('new-auto-name').value = '';
  document.getElementById('new-auto-type').value = 'reminder';
  document.getElementById('new-auto-trigger').value = '';
  document.getElementById('new-auto-action').value = '';
  document.getElementById('new-auto-target').value = '';
  document.getElementById('automation-create-modal').classList.add('show');
}

function closeAutomationModal() {
  document.getElementById('automation-create-modal').classList.remove('show');
}

function submitNewAutomationRule() {
  const name = document.getElementById('new-auto-name').value.trim();
  const type = document.getElementById('new-auto-type').value;
  const trigger = document.getElementById('new-auto-trigger').value.trim();
  const action = document.getElementById('new-auto-action').value.trim();
  const target = document.getElementById('new-auto-target').value.trim();
  if (!name) { alert('ルール名を入力してください'); return; }
  if (!trigger) { alert('トリガーを入力してください'); return; }
  if (!action) { alert('アクションを入力してください'); return; }
  const newRule = {
    id: 'ar-' + String(MOCK_DATA.automationRules.length + 1).padStart(3, '0'),
    name, type, enabled: true, trigger, action, target, lastRun: null,
  };
  MOCK_DATA.automationRules.push(newRule);
  closeAutomationModal();
  const content = document.getElementById('page-content');
  if (content) renderAutomation(content);
}

function renderAutomation(el) {
  const rules = MOCK_DATA.automationRules;
  const logs = MOCK_DATA.automationLog;
  const enabledCount = rules.filter(r => r.enabled).length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyRuns = logs.filter(l => l.timestamp && l.timestamp.slice(0, 7) === thisMonth).length;
  const lastRun = logs.length > 0 ? formatDateTime(logs[0].timestamp) : '-';

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent-blue">
        <div class="stat-label">有効なルール</div>
        <div class="stat-value">${enabledCount}</div>
        <div class="stat-sub">${rules.length}件中</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-label">今月の実行回数</div>
        <div class="stat-value">${monthlyRuns}</div>
        <div class="stat-sub">回</div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">最終実行</div>
        <div class="stat-value" style="font-size:16px;">${lastRun}</div>
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <h3 style="font-size:16px;font-weight:600;">ルール一覧</h3>
      <button class="btn btn-primary btn-sm" onclick="openAutomationModal()">+ ルール追加</button>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>有効</th>
              <th>ルール名</th>
              <th>種別</th>
              <th>トリガー</th>
              <th>アクション</th>
              <th>対象</th>
              <th>最終実行</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${rules.map(r => `
              <tr>
                <td>
                  <label class="toggle">
                    <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="toggleAutomationRule('${r.id}')">
                    <span class="toggle-slider"></span>
                  </label>
                </td>
                <td style="font-weight:500;">${r.name}</td>
                <td>${getAutoTypeBadge(r.type)}</td>
                <td style="font-size:12px;color:var(--gray-600);">${r.trigger}</td>
                <td style="font-size:12px;color:var(--gray-600);">${r.action}</td>
                <td style="font-size:12px;color:var(--gray-600);">${r.target}</td>
                <td style="font-size:12px;color:var(--gray-400);">${r.lastRun ? formatDateTime(r.lastRun) : '-'}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="runAutomationRule('${r.id}')" ${!r.enabled ? 'disabled style="opacity:0.5"' : ''}>今すぐ実行</button>
                  <div id="auto-flash-${r.id}"></div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <h3 style="font-size:16px;font-weight:600;margin-bottom:12px;">実行ログ（直近10件）</h3>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>実行日時</th>
              <th>ルール名</th>
              <th>結果</th>
              <th>対象件数</th>
            </tr>
          </thead>
          <tbody>
            ${logs.slice(0, 10).map(l => `
              <tr>
                <td style="font-size:12px;">${formatDateTime(l.timestamp)}</td>
                <td style="font-weight:500;">${l.ruleName}</td>
                <td><span class="status-badge status-done">${l.result}</span></td>
                <td style="font-size:13px;">${l.targetCount}件</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
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
    return `[To:${c.cwAccountId}]${c.name}さん`;
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

// ===========================
// 顧客詳細からのルーム紐づけ/解除
// ===========================
function linkRoomToClient(clientId) {
  const select = document.getElementById('link-room-select');
  if (!select || !select.value) { alert('ルームを選択してください'); return; }
  const room = getChatRoomById(select.value);
  if (!room) return;
  if (!room.clientIds.includes(clientId)) {
    room.clientIds.push(clientId);
  }
  navigateTo('client-detail', { id: clientId });
}

function unlinkRoomFromClient(roomId, clientId) {
  const room = getChatRoomById(roomId);
  if (!room) return;
  room.clientIds = room.clientIds.filter(id => id !== clientId);
  navigateTo('client-detail', { id: clientId });
}

// ===========================
// CSV ユーティリティ
// ===========================
function csvEscape(val) {
  const s = String(val == null ? '' : val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function downloadCSV(filename, header, rows) {
  const csvContent = [header.map(csvEscape).join(','), ...rows.map(r => r.map(csvEscape).join(','))].join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const lines = [];
  let current = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push(field);
        field = '';
      } else if (ch === '\r') {
        // skip
      } else if (ch === '\n') {
        current.push(field);
        field = '';
        lines.push(current);
        current = [];
      } else {
        field += ch;
      }
    }
  }
  if (field || current.length > 0) {
    current.push(field);
    lines.push(current);
  }
  return lines;
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

// ===========================
// 顧客CSV出力・取り込み
// ===========================
function exportClientCSV() {
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

  const customFields = (MOCK_DATA.customFields || []).slice().sort((a, b) => a.order - b.order);
  const cfHeaders = customFields.map(cf => cf.name);
  const cfIds = customFields.map(cf => cf.id);

  const header = ['clientCode', 'name', 'clientType', 'fiscalMonth', 'address', 'tel', 'representative', 'industry', 'taxOffice', 'monthlySales', 'annualFee', 'spotFees', 'cwAccountId', ...cfHeaders];
  const rows = clients.map(c => {
    const cfv = c.customFieldValues || {};
    const spotFeesJson = (c.spotFees && c.spotFees.length > 0) ? JSON.stringify(c.spotFees) : '';
    return [c.clientCode, c.name, c.clientType, c.fiscalMonth, c.address || '', c.tel || '', c.representative || '', c.industry || '', c.taxOffice || '', c.monthlySales || 0, c.annualFee || 0, spotFeesJson, c.cwAccountId || '', ...cfIds.map(id => cfv[id] || '')];
  });

  downloadCSV('顧客一覧.csv', header, rows);
}

function importClientCSV() {
  const input = document.getElementById('csv-import-input');
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    input.value = '';
    try {
      const text = await readFileAsText(file);
      const lines = parseCSV(text);
      if (lines.length < 2) { alert('CSVデータが不足しています'); return; }
      const header = lines[0].map(h => h.trim().replace(/^\uFEFF/, ''));
      const customFields = (MOCK_DATA.customFields || []).slice().sort((a, b) => a.order - b.order);
      let imported = 0;
      let updated = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        if (row.length < 2 || !row.some(v => v.trim())) continue;
        const obj = {};
        header.forEach((h, idx) => { obj[h] = (row[idx] || '').trim(); });

        const existing = MOCK_DATA.clients.find(c => c.clientCode === obj.clientCode);
        if (existing) {
          // 更新
          if (obj.name) existing.name = obj.name;
          if (obj.clientType) existing.clientType = obj.clientType;
          if (obj.fiscalMonth) existing.fiscalMonth = parseInt(obj.fiscalMonth) || existing.fiscalMonth;
          if (obj.address !== undefined) existing.address = obj.address;
          if (obj.tel !== undefined) existing.tel = obj.tel;
          if (obj.representative !== undefined) existing.representative = obj.representative;
          if (obj.industry !== undefined) existing.industry = obj.industry;
          if (obj.taxOffice !== undefined) existing.taxOffice = obj.taxOffice;
          if (obj.monthlySales) existing.monthlySales = parseInt(obj.monthlySales) || existing.monthlySales;
          if (obj.annualFee) existing.annualFee = parseInt(obj.annualFee) || existing.annualFee;
          if (obj.spotFees) { try { existing.spotFees = JSON.parse(obj.spotFees); } catch(e) {} }
          if (obj.cwAccountId !== undefined) existing.cwAccountId = obj.cwAccountId;
          // カスタムフィールド
          if (!existing.customFieldValues) existing.customFieldValues = {};
          customFields.forEach(cf => {
            if (obj[cf.name] !== undefined && obj[cf.name] !== '') {
              existing.customFieldValues[cf.id] = obj[cf.name];
            }
          });
          updated++;
        } else {
          // 新規
          const newId = 'c-' + String(MOCK_DATA.clients.length + 1).padStart(3, '0');
          const code = obj.clientCode || String(parseInt(MOCK_DATA.clients[MOCK_DATA.clients.length - 1].clientCode) + 1).padStart(6, '0');
          const cfv = {};
          customFields.forEach(cf => {
            if (obj[cf.name]) cfv[cf.id] = obj[cf.name];
          });
          MOCK_DATA.clients.push({
            id: newId,
            clientCode: code,
            name: obj.name || '名称未設定',
            clientType: obj.clientType || '法人',
            fiscalMonth: parseInt(obj.fiscalMonth) || 3,
            isActive: true,
            mainUserId: MOCK_DATA.users[1]?.id || 'u-002',
            subUserId: null,
            mgrUserId: MOCK_DATA.users[1]?.id || 'u-002',
            monthlySales: parseInt(obj.monthlySales) || 0,
            annualFee: parseInt(obj.annualFee) || 0,
            spotFees: obj.spotFees ? (function(){ try { return JSON.parse(obj.spotFees); } catch(e) { return []; } })() : [],
            address: obj.address || '',
            tel: obj.tel || '',
            representative: obj.representative || '',
            industry: obj.industry || '',
            taxOffice: obj.taxOffice || '',
            memo: '',
            establishDate: '',
            cwAccountId: obj.cwAccountId || '',
            cwRoomUrls: [],
            relatedClientIds: [],
            customFieldValues: cfv,
          });
          imported++;
        }
      }
      alert(`CSV取り込み完了\n新規: ${imported}件\n更新: ${updated}件`);
      if (currentPage === 'clients') navigateTo('clients');
    } catch (err) {
      alert('CSVファイルの読み込みに失敗しました: ' + err.message);
    }
  };
  input.click();
}

// ===========================
// 職員CSV出力・取り込み
// ===========================
function exportStaffCSV() {
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

  const header = ['staffCode', 'lastName', 'firstName', 'lastNameKana', 'firstNameKana', 'email', 'tel', 'mobile', 'deptId', 'position', 'employmentType', 'joinDate', 'role', 'staffFlag', 'memo'];
  const rows = users.map(u => [u.staffCode || '', u.lastName || '', u.firstName || '', u.lastNameKana || '', u.firstNameKana || '', u.email || '', u.tel || '', u.mobile || '', u.deptId || '', u.position || '', u.employmentType || '', u.joinDate || '', u.role || '', u.staffFlag || '', u.memo || '']);

  downloadCSV('職員一覧.csv', header, rows);
}

function importStaffCSV() {
  const input = document.getElementById('csv-import-input');
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    input.value = '';
    try {
      const text = await readFileAsText(file);
      const lines = parseCSV(text);
      if (lines.length < 2) { alert('CSVデータが不足しています'); return; }
      const header = lines[0].map(h => h.trim().replace(/^\uFEFF/, ''));
      let imported = 0;
      let updated = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        if (row.length < 2 || !row.some(v => v.trim())) continue;
        const obj = {};
        header.forEach((h, idx) => { obj[h] = (row[idx] || '').trim(); });

        const existing = MOCK_DATA.users.find(u => u.staffCode === obj.staffCode);
        if (existing) {
          if (obj.lastName) existing.lastName = obj.lastName;
          if (obj.firstName !== undefined) existing.firstName = obj.firstName;
          if (obj.lastNameKana) existing.lastNameKana = obj.lastNameKana;
          if (obj.firstNameKana !== undefined) existing.firstNameKana = obj.firstNameKana;
          existing.name = (existing.lastName || '') + (existing.firstName ? ' ' + existing.firstName : '');
          if (obj.email) existing.email = obj.email;
          if (obj.tel !== undefined) existing.tel = obj.tel;
          if (obj.mobile !== undefined) existing.mobile = obj.mobile;
          if (obj.deptId) existing.deptId = parseInt(obj.deptId) || existing.deptId;
          if (obj.position !== undefined) existing.position = obj.position;
          if (obj.employmentType) existing.employmentType = obj.employmentType;
          if (obj.joinDate) existing.joinDate = obj.joinDate;
          if (obj.role) existing.role = obj.role;
          if (obj.staffFlag) existing.staffFlag = obj.staffFlag;
          if (obj.memo !== undefined) existing.memo = obj.memo;
          updated++;
        } else {
          const newId = 'u-' + String(MOCK_DATA.users.length + 1).padStart(3, '0');
          const code = obj.staffCode || 'A' + String(MOCK_DATA.users.length + 1).padStart(3, '0');
          const lastName = obj.lastName || '名称未設定';
          const firstName = obj.firstName || '';
          const name = firstName ? lastName + ' ' + firstName : lastName;
          MOCK_DATA.users.push({
            id: newId,
            staffCode: code,
            lastName,
            firstName,
            lastNameKana: obj.lastNameKana || '',
            firstNameKana: obj.firstNameKana || '',
            name,
            email: obj.email || '',
            tel: obj.tel || '',
            mobile: obj.mobile || '',
            role: obj.role || 'member',
            deptId: obj.deptId ? parseInt(obj.deptId) : null,
            team: null,
            position: obj.position || '',
            employmentType: obj.employmentType || '正社員',
            joinDate: obj.joinDate || '',
            memo: obj.memo || '',
            loginId: (obj.email || '').split('@')[0] || '',
            isActive: true,
            baseRatio: null,
            staffFlag: obj.staffFlag || '税務',
          });
          imported++;
        }
      }
      alert(`CSV取り込み完了\n新規: ${imported}件\n更新: ${updated}件`);
      if (currentPage === 'staff') navigateTo('staff');
    } catch (err) {
      alert('CSVファイルの読み込みに失敗しました: ' + err.message);
    }
  };
  input.click();
}

// ===========================
// カスタムフィールド設定
// ===========================
function openCustomFieldModal() {
  document.getElementById('custom-field-modal').classList.add('show');
  renderCustomFieldList();
}

function closeCustomFieldModal() {
  document.getElementById('custom-field-modal').classList.remove('show');
  // 詳細ページを再描画
  if (currentPage === 'client-detail') {
    const hash = location.hash.slice(1);
    const [page, id] = hash.split('/');
    if (id) navigateTo('client-detail', { id });
  }
}

function renderCustomFieldList() {
  if (!MOCK_DATA.customFields) MOCK_DATA.customFields = [];
  const fields = MOCK_DATA.customFields.slice().sort((a, b) => a.order - b.order);
  const container = document.getElementById('cf-field-list');
  const typeLabels = { text: 'テキスト', number: '数値', date: '日付', select: '選択肢', textarea: 'テキストエリア' };

  container.innerHTML = fields.length === 0
    ? '<div style="padding:12px;color:var(--gray-400);font-size:13px;">カスタムフィールドがありません</div>'
    : fields.map(cf => `
      <div class="cf-row" draggable="true" data-cf-id="${cf.id}">
        <span class="cf-handle">&#9776;</span>
        <span class="cf-name" id="cf-name-display-${cf.id}">${cf.name}</span>
        <span class="cf-type">${typeLabels[cf.type] || cf.type}</span>
        <div class="cf-actions">
          <button class="btn btn-secondary btn-sm" onclick="editCustomFieldName('${cf.id}')">編集</button>
          <button class="btn btn-sm" style="color:var(--danger);background:none;border:none;cursor:pointer;" onclick="deleteCustomField('${cf.id}')">削除</button>
        </div>
      </div>
    `).join('');

  // ドラッグ&ドロップ設定
  initCustomFieldDragDrop();
}

function initCustomFieldDragDrop() {
  const container = document.getElementById('cf-field-list');
  const rows = container.querySelectorAll('.cf-row');
  let draggedEl = null;

  rows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      draggedEl = row;
      row.classList.add('cf-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', row.dataset.cfId);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('cf-dragging');
      rows.forEach(r => r.classList.remove('cf-drag-over'));
      draggedEl = null;
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedEl && draggedEl !== row) {
        row.classList.add('cf-drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('cf-drag-over');
    });

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('cf-drag-over');
      if (!draggedEl || draggedEl === row) return;

      const draggedId = draggedEl.dataset.cfId;
      const targetId = row.dataset.cfId;

      // 並び替え
      const fields = MOCK_DATA.customFields.slice().sort((a, b) => a.order - b.order);
      const draggedIdx = fields.findIndex(f => f.id === draggedId);
      const targetIdx = fields.findIndex(f => f.id === targetId);

      if (draggedIdx < 0 || targetIdx < 0) return;

      const [moved] = fields.splice(draggedIdx, 1);
      fields.splice(targetIdx, 0, moved);

      // order を再割り当て
      fields.forEach((f, i) => { f.order = i + 1; });

      renderCustomFieldList();
    });
  });
}

function addCustomField() {
  const nameInput = document.getElementById('cf-new-name');
  const typeSelect = document.getElementById('cf-new-type');
  const name = nameInput.value.trim();
  const type = typeSelect.value;
  if (!name) { alert('フィールド名を入力してください'); return; }

  if (!MOCK_DATA.customFields) MOCK_DATA.customFields = [];
  const maxOrder = MOCK_DATA.customFields.reduce((m, f) => Math.max(m, f.order), 0);
  const maxNum = MOCK_DATA.customFields.reduce((m, f) => {
    const n = parseInt(f.id.replace('cf-', ''));
    return Math.max(m, n);
  }, 0);
  const newId = 'cf-' + String(maxNum + 1).padStart(3, '0');

  MOCK_DATA.customFields.push({ id: newId, name, type, order: maxOrder + 1 });
  nameInput.value = '';
  typeSelect.value = 'text';
  renderCustomFieldList();
}

function editCustomFieldName(cfId) {
  const cf = MOCK_DATA.customFields.find(f => f.id === cfId);
  if (!cf) return;
  const newName = prompt('新しいフィールド名を入力してください', cf.name);
  if (!newName || !newName.trim()) return;
  cf.name = newName.trim();
  renderCustomFieldList();
}

function deleteCustomField(cfId) {
  if (!confirm('このカスタムフィールドを削除しますか？\n全顧客のこの項目の値も削除されます。')) return;
  MOCK_DATA.customFields = MOCK_DATA.customFields.filter(f => f.id !== cfId);
  // 全顧客からこのフィールドの値を削除
  MOCK_DATA.clients.forEach(c => {
    if (c.customFieldValues) delete c.customFieldValues[cfId];
  });
  renderCustomFieldList();
}

// ===========================
// AIアシスタント
// ===========================
let aiActiveTab = 'qa';
let aiChatMessages = [];
let aiSuggestions = [];

function renderAI(el) {
  const tabs = [
    { key: 'qa', label: '社内Q&A' },
    { key: 'draft', label: '顧客対応下書き' },
    { key: 'suggest', label: 'タスク提案' },
  ];

  el.innerHTML = `
    <div class="tab-bar" id="ai-tabs">
      ${tabs.map(t => `<button class="tab-btn ${t.key === aiActiveTab ? 'active' : ''}" data-tab="${t.key}">${t.label}</button>`).join('')}
    </div>
    <div id="ai-panel"></div>
  `;

  document.querySelectorAll('#ai-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      aiActiveTab = btn.dataset.tab;
      document.querySelectorAll('#ai-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAIPanel();
    });
  });

  if (aiChatMessages.length === 0) {
    aiChatMessages = [
      { role: 'user', text: '法人の決算期変更の手続きを教えてください' },
      { role: 'ai', text: '法人の決算期変更の手続きについてご説明します。\n\n**1. 株主総会の決議**\n定款変更が必要なため、株主総会の特別決議（議決権の2/3以上）を行います。\n\n**2. 定款の変更**\n事業年度に関する条項を新しい決算月に変更します。\n\n**3. 税務署への届出**\n「異動届出書」を所轄税務署に提出します。届出期限は変更後遅滞なく提出が必要です。\n\n**4. 都道府県・市区町村への届出**\n地方税の届出も必要です。各自治体の窓口に届出書を提出してください。\n\n**5. その他の届出**\n- 社会保険事務所への届出\n- 取引先への通知\n- 会計システムの設定変更\n\n**注意点:**\n- 変更初年度は事業年度が1年未満になる場合があります\n- 消費税の課税期間にも影響するため、慎重にご検討ください' },
      { role: 'user', text: '確定申告の電子申告の手順は？' },
      { role: 'ai', text: '確定申告の電子申告（e-Tax）の手順をご案内します。\n\n**事前準備:**\n1. 利用者識別番号の取得（初回のみ）\n2. 電子証明書の取得（マイナンバーカード等）\n3. ICカードリーダーの準備（またはスマートフォン）\n4. e-Taxソフトのインストール\n\n**申告手順:**\n1. **e-Taxソフトを起動**し、利用者識別番号でログイン\n2. **申告書の作成** - 所得税、消費税等の該当する申告書を選択\n3. **各項目を入力** - 収入金額、所得金額、控除額等\n4. **電子署名の付与** - マイナンバーカード等で署名\n5. **送信** - 申告データをe-Taxサーバーに送信\n6. **受信通知の確認** - 送信完了後、受信通知で受付番号を確認\n\n**当事務所での運用:**\n- 税理士の電子署名で代理送信を行います\n- 送信前にレビュー担当者の確認を必ず受けてください\n- 送信完了後は報告書に受付番号を記載してください' },
    ];
  }

  renderAIPanel();
}

function renderAIPanel() {
  const panel = document.getElementById('ai-panel');
  if (!panel) return;

  if (aiActiveTab === 'qa') renderAIQA(panel);
  else if (aiActiveTab === 'draft') renderAIDraft(panel);
  else if (aiActiveTab === 'suggest') renderAISuggest(panel);
}

function renderAIQA(panel) {
  panel.innerHTML = `
    <div class="card" style="display:flex;flex-direction:column;height:calc(100vh - 220px);min-height:400px;">
      <div class="ai-chat-area" id="ai-chat-area"></div>
      <div class="ai-chat-input-area">
        <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="質問を入力してください..." autocomplete="off">
        <button class="btn btn-primary" id="ai-chat-send">送信</button>
      </div>
    </div>
  `;

  renderAIChatMessages();

  const input = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');

  sendBtn.addEventListener('click', () => sendAIChat());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) sendAIChat();
  });
}

function renderAIChatMessages() {
  const area = document.getElementById('ai-chat-area');
  if (!area) return;

  area.innerHTML = aiChatMessages.map(m => {
    if (m.role === 'user') {
      return `<div class="ai-msg ai-msg-user"><div class="ai-msg-bubble ai-msg-bubble-user">${escapeHtml(m.text)}</div></div>`;
    } else if (m.role === 'typing') {
      return `<div class="ai-msg ai-msg-ai"><div class="ai-msg-avatar">AI</div><div class="ai-msg-bubble ai-msg-bubble-ai"><span class="ai-typing"><span>.</span><span>.</span><span>.</span></span> AIが考えています...</div></div>`;
    } else {
      return `<div class="ai-msg ai-msg-ai"><div class="ai-msg-avatar">AI</div><div class="ai-msg-bubble ai-msg-bubble-ai">${formatAIText(m.text)}</div></div>`;
    }
  }).join('');

  area.scrollTop = area.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatAIText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function sendAIChat() {
  const input = document.getElementById('ai-chat-input');
  const text = input.value.trim();
  if (!text) return;

  aiChatMessages.push({ role: 'user', text });
  input.value = '';
  renderAIChatMessages();

  setTimeout(() => {
    aiChatMessages.push({ role: 'typing', text: '' });
    renderAIChatMessages();

    setTimeout(() => {
      aiChatMessages = aiChatMessages.filter(m => m.role !== 'typing');
      const response = getAIMockResponse(text);
      aiChatMessages.push({ role: 'ai', text: response });
      renderAIChatMessages();
    }, 1500);
  }, 500);
}

function getAIMockResponse(question) {
  const q = question.toLowerCase();

  if (q.includes('決算')) {
    return '決算に関するご質問ですね。\n\n**決算業務の基本フロー:**\n1. 資料回収（請求書・領収書・通帳コピー等）\n2. 記帳確認・仕訳修正\n3. 決算整理仕訳の入力\n4. 勘定科目内訳書の作成\n5. 法人税・地方税・消費税の申告書作成\n6. レビュー担当者による確認\n7. 電子申告\n8. 納品（申告書控え・決算書の送付）\n\n**期限について:**\n- 法人税の申告期限は事業年度終了日の翌日から2ヶ月以内です\n- 延長届出を提出している場合は3ヶ月以内となります\n\n詳細な手順は社内マニュアル「決算業務フロー」をご確認ください。';
  }

  if (q.includes('確定申告')) {
    return '確定申告に関するご質問ですね。\n\n**確定申告の主なスケジュール:**\n- 1月：資料回収開始\n- 2月16日〜3月15日：所得税の確定申告期間\n- 3月31日：消費税の確定申告期限\n\n**当事務所での対応フロー:**\n1. 顧客へ資料依頼メール送信\n2. 資料回収・不足資料の催促\n3. 会計帳簿のチェック\n4. 申告書の作成\n5. レビュー担当者による確認\n6. 電子申告（税理士代理送信）\n7. 申告完了報告・控えの送付\n\n**注意事項:**\n- 医療費控除、ふるさと納税等の資料を忘れずに回収\n- 不動産所得がある場合は減価償却の確認を\n- 青色申告特別控除の要件を満たしているか確認';
  }

  if (q.includes('年末調整')) {
    return '年末調整に関するご質問ですね。\n\n**年末調整の業務フロー:**\n1. **11月上旬** - 顧客へ年末調整資料の配布依頼\n2. **11月中旬〜12月上旬** - 資料回収\n   - 扶養控除等申告書\n   - 保険料控除申告書\n   - 住宅ローン控除申告書\n3. **12月中旬** - 年末調整計算の実施\n4. **12月下旬** - 源泉所得税の納付（1/10期限）\n5. **1月** - 関連書類の作成・提出\n   - 給与支払報告書（市区町村へ）\n   - 法定調書合計表（税務署へ）\n   - 償却資産申告書（市区町村へ）\n\n**進捗管理表について:**\n当事務所では「年末調整管理表」で各顧客の進捗を管理しています。\n各工程のステータスを随時更新してください。';
  }

  if (q.includes('インボイス') || q.includes('適格請求書')) {
    return 'インボイス制度についてのご案内です。\n\n**インボイス制度の概要:**\n- 2023年10月1日から開始された適格請求書等保存方式\n- 適格請求書発行事業者の登録が必要\n\n**当事務所での確認ポイント:**\n1. 顧客が適格請求書発行事業者に登録済みか確認\n2. 発行するインボイスの記載事項が正しいか確認\n3. 受領したインボイスの保存が適切か確認\n4. 免税事業者との取引の経過措置の適用確認\n\n**経過措置:**\n- 2026年9月30日まで：80%控除可能\n- 2029年9月30日まで：50%控除可能\n\n詳細は社内マニュアル「インボイス制度対応ガイド」をご確認ください。';
  }

  if (q.includes('消費税')) {
    return '消費税に関するご質問ですね。\n\n**消費税の基本:**\n- 基準期間の課税売上高が1,000万円を超える場合に課税事業者\n- 簡易課税制度の選択も検討（基準期間の課税売上高5,000万円以下）\n\n**申告期限:**\n- 法人：事業年度終了日の翌日から2ヶ月以内\n- 個人：翌年3月31日\n\n**当事務所でのチェックポイント:**\n1. 課税区分の確認（課税・非課税・免税・不課税）\n2. 仕入税額控除の要件確認\n3. 簡易課税の場合は事業区分の確認\n4. 中間申告の要否確認';
  }

  return '申し訳ございません、その質問についてはまだ学習中です。社内マニュアルをご確認ください。\n\nお急ぎの場合は、以下をお試しください：\n- 社内Wiki（SharePoint）で関連キーワードを検索\n- チームリーダーに直接ご確認\n- 税務相談窓口（内線: 201）にお問い合わせ';
}

function renderAIDraft(panel) {
  const activeClients = MOCK_DATA.clients.filter(c => c.isActive);

  panel.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="form-group">
            <label>顧客</label>
            <select id="ai-draft-client">
              <option value="">-- 顧客を選択 --</option>
              ${activeClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>テンプレート</label>
            <select id="ai-draft-template">
              <option value="資料依頼メール">資料依頼メール</option>
              <option value="決算報告メール">決算報告メール</option>
              <option value="確定申告完了報告">確定申告完了報告</option>
              <option value="面談日程調整">面談日程調整</option>
              <option value="請求書送付案内">請求書送付案内</option>
              <option value="フリーテキスト">フリーテキスト</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>補足情報（任意）</label>
          <textarea id="ai-draft-notes" rows="3" placeholder="追加で含めたい内容があれば入力してください..." style="width:100%;padding:10px 12px;border:1px solid var(--gray-300);border-radius:6px;font-size:14px;resize:vertical;"></textarea>
        </div>
        <button class="btn btn-primary" id="ai-draft-generate">下書き生成</button>
      </div>
    </div>

    <div id="ai-draft-result" style="display:none;margin-top:16px;">
      <div class="card">
        <div class="card-header">
          <h3>生成された下書き</h3>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" id="ai-draft-copy">コピー</button>
            <button class="btn btn-primary btn-sm" id="ai-draft-cw">Chatworkに送信</button>
          </div>
        </div>
        <div class="card-body">
          <div class="ai-draft-output" id="ai-draft-output"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('ai-draft-generate').addEventListener('click', generateAIDraft);
  document.getElementById('ai-draft-copy').addEventListener('click', copyAIDraft);
  document.getElementById('ai-draft-cw').addEventListener('click', () => {
    alert('下書きをChatworkに送信しました');
  });
}

function generateAIDraft() {
  const clientId = document.getElementById('ai-draft-client').value;
  const template = document.getElementById('ai-draft-template').value;
  const notes = document.getElementById('ai-draft-notes').value.trim();

  if (!clientId) {
    alert('顧客を選択してください');
    return;
  }

  const client = getClientById(clientId);
  if (!client) return;

  const resultDiv = document.getElementById('ai-draft-result');
  const outputDiv = document.getElementById('ai-draft-output');
  const generateBtn = document.getElementById('ai-draft-generate');

  generateBtn.disabled = true;
  generateBtn.textContent = '生成中...';
  resultDiv.style.display = 'none';

  setTimeout(() => {
    const draft = generateMockDraft(client, template, notes);
    outputDiv.innerHTML = formatAIText(draft);
    resultDiv.style.display = '';
    generateBtn.disabled = false;
    generateBtn.textContent = '下書き生成';
  }, 1000);
}

function generateMockDraft(client, template, notes) {
  const mention = client.cwAccountId ? `[To:${client.cwAccountId}]${client.name}様\n\n` : '';
  const mainUser = getUserById(client.mainUserId);
  const senderName = mainUser ? mainUser.name : 'ひろ';
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  const drafts = {
    '資料依頼メール': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${client.clientType === '法人' ? `${client.fiscalMonth}月決算` : '確定申告'}に向けまして、以下の資料のご準備をお願いいたします。\n\n**ご準備いただきたい資料:**\n${client.clientType === '法人' ? '1. 総勘定元帳（会計ソフトからの出力）\n2. 請求書・領収書の綴り\n3. 預金通帳のコピー（全口座）\n4. 売掛金・買掛金の残高明細\n5. 固定資産の取得・売却に関する資料\n6. 借入金の返済予定表' : '1. 源泉徴収票\n2. 医療費の明細書・領収書\n3. 社会保険料控除証明書\n4. 生命保険料控除証明書\n5. ふるさと納税の寄附金受領証明書\n6. 不動産収入に関する資料（該当する場合）'}\n\n**ご送付期限:** ${dateStr}から2週間以内\n\n資料は郵送またはChatworkでのデータ送付のいずれでも構いません。\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    '決算報告メール': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${client.name}様の${client.fiscalMonth}月期決算につきまして、ご報告申し上げます。\n\n**決算概要:**\n- 事業年度: 令和7年${client.fiscalMonth}月期\n- 申告書の提出: 完了\n- 納税額: 後日改めてご案内いたします\n\n**今後のスケジュール:**\n1. 決算報告書の送付（1週間以内）\n2. 納税のご案内\n3. 来期の税務スケジュールの確認\n\n決算報告書は準備でき次第お送りいたします。\nご確認いただき、ご不明な点がございましたらお知らせください。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    '確定申告完了報告': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${client.name}様の令和7年分確定申告につきまして、電子申告が完了いたしましたのでご報告申し上げます。\n\n**申告内容:**\n- 申告種別: 所得税確定申告\n- 申告日: ${dateStr}\n- 申告方法: 電子申告（e-Tax）\n\n**今後の対応:**\n- 申告書の控えは後日郵送いたします\n- 納税がある場合は別途ご案内いたします\n- 還付がある場合は1〜2ヶ月程度で振込されます\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    '面談日程調整': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${client.clientType === '法人' ? `${client.fiscalMonth}月期の決算` : '確定申告'}に関しまして、面談のお時間をいただきたくご連絡いたしました。\n\n**面談の目的:**\n${client.clientType === '法人' ? '- 決算前の確認事項の整理\n- 来期の税務対策のご相談\n- 経営に関するご質問への対応' : '- 申告内容の最終確認\n- 控除漏れがないかの確認\n- 来年に向けたアドバイス'}\n\n**候補日時:**\n1. ○月○日（○） 10:00〜11:00\n2. ○月○日（○） 14:00〜15:00\n3. ○月○日（○） 16:00〜17:00\n\n面談方法はZoom、対面のいずれも対応可能です。\nご都合のよい日時をお知らせいただけますと幸いです。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    '請求書送付案内': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${today.getMonth() + 1}月分の請求書をお送りいたします。\n\n**請求内容:**\n- 月額顧問料: ${(client.monthlySales || 0).toLocaleString()}円（税抜）\n- 消費税: ${Math.floor((client.monthlySales || 0) * 0.1).toLocaleString()}円\n- 合計: ${Math.floor((client.monthlySales || 0) * 1.1).toLocaleString()}円（税込）\n\n**お支払期限:** 翌月末日\n\n請求書はPDFにて添付しております。\nお振込先は請求書に記載の口座宛にお願いいたします。\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    'フリーテキスト': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${notes || 'ここにメッセージ本文を入力してください。'}\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nよろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,
  };

  return drafts[template] || drafts['フリーテキスト'];
}

function copyAIDraft() {
  const output = document.getElementById('ai-draft-output');
  if (!output) return;
  const text = output.innerText || output.textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('下書きをクリップボードにコピーしました');
  });
}

function renderAISuggest(panel) {
  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
      <button class="btn btn-primary" id="ai-suggest-run">分析実行</button>
      <span id="ai-suggest-status" style="font-size:13px;color:var(--gray-500);"></span>
    </div>
    <div id="ai-suggest-summary" style="display:none;margin-bottom:20px;"></div>
    <div id="ai-suggest-list"></div>
  `;

  document.getElementById('ai-suggest-run').addEventListener('click', runAISuggestions);

  if (aiSuggestions.length > 0) {
    renderAISuggestionResults();
  }
}

function runAISuggestions() {
  const btn = document.getElementById('ai-suggest-run');
  const status = document.getElementById('ai-suggest-status');
  btn.disabled = true;
  btn.textContent = '分析中...';
  status.textContent = 'AIがデータを分析しています...';

  setTimeout(() => {
    aiSuggestions = generateAISuggestions();
    btn.disabled = false;
    btn.textContent = '分析実行';
    status.textContent = '';
    renderAISuggestionResults();
  }, 1500);
}

function generateAISuggestions() {
  const suggestions = [];
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  MOCK_DATA.clients.filter(c => c.isActive).forEach(client => {
    const fiscalMonth = client.fiscalMonth;
    const currentMonth = today.getMonth() + 1;
    let monthsUntilFiscal = fiscalMonth - currentMonth;
    if (monthsUntilFiscal < 0) monthsUntilFiscal += 12;
    if (monthsUntilFiscal <= 3 && monthsUntilFiscal > 0 && client.clientType === '法人') {
      const existingTasks = MOCK_DATA.tasks.filter(t => t.clientId === client.id && t.title.includes('決算'));
      if (existingTasks.length === 0) {
        suggestions.push({
          id: 'sg-' + suggestions.length,
          title: `${client.name}の${fiscalMonth}月決算準備が必要です`,
          description: `決算月まで${monthsUntilFiscal}ヶ月です。法人決算テンプレートの適用をお勧めします。資料回収や記帳確認を早めに開始しましょう。`,
          priority: monthsUntilFiscal <= 1 ? '高' : '中',
          clientId: client.id,
          taskTitle: `${fiscalMonth}月決算 資料回収・準備`,
          type: 'fiscal',
        });
      }
    }
  });

  MOCK_DATA.clients.filter(c => c.isActive).forEach(client => {
    const tasks = MOCK_DATA.tasks.filter(t => t.clientId === client.id);
    if (tasks.length === 0) {
      suggestions.push({
        id: 'sg-' + suggestions.length,
        title: `${client.name}にタスクが未登録です`,
        description: `この顧客にはタスクが1件も登録されていません。月次業務や年次業務のタスクを作成することをお勧めします。`,
        priority: '低',
        clientId: client.id,
        taskTitle: '月次記帳チェック',
        type: 'no_task',
      });
    }
  });

  MOCK_DATA.tasks.filter(t => t.status !== '完了' && t.dueDate < todayStr).forEach(task => {
    const client = getClientById(task.clientId);
    const assignee = getUserById(task.assigneeUserId);
    if (client) {
      suggestions.push({
        id: 'sg-' + suggestions.length,
        title: `${client.name}「${task.title}」が期限超過です`,
        description: `期限${formatDate(task.dueDate)}を過ぎています。担当: ${assignee ? assignee.name : '未割当'}。フォローアップタスクの作成または期限の延長を検討してください。`,
        priority: '高',
        clientId: task.clientId,
        taskTitle: `${task.title}（フォローアップ）`,
        type: 'overdue',
      });
    }
  });

  MOCK_DATA.tasks.filter(t => t.status === '差戻し').forEach(task => {
    const client = getClientById(task.clientId);
    const assignee = getUserById(task.assigneeUserId);
    if (client) {
      suggestions.push({
        id: 'sg-' + suggestions.length,
        title: `${client.name}「${task.title}」が差戻し中です`,
        description: `差戻しされたタスクが未対応です。担当: ${assignee ? assignee.name : '未割当'}。早急に修正対応を行ってください。`,
        priority: '高',
        clientId: task.clientId,
        taskTitle: `${task.title}（修正対応）`,
        type: 'returned',
      });
    }
  });

  MOCK_DATA.progressSheets.filter(ps => ps.status === '利用中').forEach(sheet => {
    sheet.targets.forEach(target => {
      const unfinishedSteps = Object.values(target.steps).filter(s => s === '未着手').length;
      const totalSteps = Object.keys(target.steps).length;
      if (unfinishedSteps > totalSteps / 2) {
        const client = getClientById(target.clientId);
        if (client) {
          const alreadySuggested = suggestions.some(s => s.clientId === target.clientId && s.type === 'progress');
          if (!alreadySuggested) {
            suggestions.push({
              id: 'sg-' + suggestions.length,
              title: `${client.name}の「${sheet.name}」進捗が遅れています`,
              description: `${totalSteps}工程中${unfinishedSteps}工程が未着手です。進捗管理表の更新と作業の着手を検討してください。`,
              priority: '中',
              clientId: target.clientId,
              taskTitle: `${sheet.name} 進捗対応`,
              type: 'progress',
            });
          }
        }
      }
    });
  });

  return suggestions;
}

function renderAISuggestionResults() {
  const summaryDiv = document.getElementById('ai-suggest-summary');
  const listDiv = document.getElementById('ai-suggest-list');

  if (!summaryDiv || !listDiv) return;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const overdueTasks = MOCK_DATA.tasks.filter(t => t.status !== '完了' && t.dueDate < todayStr).length;
  const currentMonth = today.getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextMonthClients = MOCK_DATA.clients.filter(c => c.isActive && c.clientType === '法人' && c.fiscalMonth === nextMonth).length;

  summaryDiv.style.display = '';
  summaryDiv.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent-blue">
        <div class="stat-label">提案数</div>
        <div class="stat-value">${aiSuggestions.length}<span style="font-size:14px;font-weight:400;color:var(--gray-500);">件</span></div>
      </div>
      <div class="stat-card accent-red">
        <div class="stat-label">期限超過タスク</div>
        <div class="stat-value">${overdueTasks}<span style="font-size:14px;font-weight:400;color:var(--gray-500);">件</span></div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">来月決算の顧客</div>
        <div class="stat-value">${nextMonthClients}<span style="font-size:14px;font-weight:400;color:var(--gray-500);">社</span></div>
      </div>
    </div>
  `;

  if (aiSuggestions.length === 0) {
    listDiv.innerHTML = `<div class="empty-state"><div class="icon">&#x2705;</div><p>現在、AIからの提案はありません。すべて順調です。</p></div>`;
    return;
  }

  listDiv.innerHTML = aiSuggestions.map(sg => {
    const priorityColors = { '高': 'var(--danger)', '中': 'var(--warning)', '低': 'var(--gray-400)' };
    const priorityBg = { '高': 'var(--danger-light)', '中': 'var(--warning-light)', '低': 'var(--gray-100)' };
    return `
      <div class="ai-suggestion-card" id="ai-sg-${sg.id}">
        <div class="ai-sg-icon">&#x1f4a1;</div>
        <div class="ai-sg-content">
          <div class="ai-sg-header">
            <div class="ai-sg-title">${escapeHtml(sg.title)}</div>
            <span class="ai-sg-priority" style="background:${priorityBg[sg.priority]};color:${priorityColors[sg.priority]};">${sg.priority}</span>
          </div>
          <div class="ai-sg-desc">${escapeHtml(sg.description)}</div>
          <div class="ai-sg-actions">
            <button class="btn btn-primary btn-sm" onclick="createSuggestedTask('${sg.id}')">タスク作成</button>
            <button class="btn btn-secondary btn-sm" onclick="dismissSuggestion('${sg.id}')">無視する</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function createSuggestedTask(sgId) {
  const sg = aiSuggestions.find(s => s.id === sgId);
  if (!sg) return;

  const client = getClientById(sg.clientId);
  if (!client) return;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateStr = dueDate.toISOString().slice(0, 10);

  const newTask = {
    id: 'tk-' + String(MOCK_DATA.tasks.length + 1).padStart(3, '0'),
    clientId: sg.clientId,
    assigneeUserId: client.mainUserId || 'u-003',
    title: sg.taskTitle,
    status: '未着手',
    dueDate: dueDateStr,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  MOCK_DATA.tasks.push(newTask);
  aiSuggestions = aiSuggestions.filter(s => s.id !== sgId);

  const card = document.getElementById('ai-sg-' + sgId);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateX(20px)';
    setTimeout(() => {
      card.remove();
      renderAISuggestionResults();
    }, 300);
  }

  alert(`タスク「${sg.taskTitle}」を作成しました（期限: ${formatDate(dueDateStr)}）`);
}

function dismissSuggestion(sgId) {
  aiSuggestions = aiSuggestions.filter(s => s.id !== sgId);
  const card = document.getElementById('ai-sg-' + sgId);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateX(20px)';
    setTimeout(() => {
      card.remove();
      renderAISuggestionResults();
    }, 300);
  }
}
