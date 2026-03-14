// ===========================
// モーダル関連
// ===========================

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
