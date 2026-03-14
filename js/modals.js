// ===========================
// モーダル関連
// ===========================

// ── タスク作成モーダル ──
function openTaskModal() {
  document.getElementById('new-task-client').innerHTML = buildClientOptions(true);
  document.getElementById('new-task-assignee').innerHTML = buildUserOptions('staff');
  resetForm(['new-task-title', 'new-task-due']);
  document.getElementById('new-task-status').value = '未着手';
  showModal('task-create-modal');
}

function closeTaskModal() { hideModal('task-create-modal'); }

function submitNewTask() {
  const title = getValTrim('new-task-title');
  const clientId = getVal('new-task-client');
  const assigneeId = getVal('new-task-assignee');
  const dueDate = getVal('new-task-due');
  const status = getVal('new-task-status');

  if (!title) { alert('タスク名を入力してください'); return; }
  if (!dueDate) { alert('期限を入力してください'); return; }

  MOCK_DATA.tasks.push({
    id: generateId('tk-', MOCK_DATA.tasks),
    clientId, assigneeUserId: assigneeId, title, status, dueDate,
    createdAt: new Date().toISOString().slice(0, 10),
  });

  closeTaskModal();
  if (currentPage === 'tasks') navigateTo('tasks');
  else if (currentPage === 'dashboard') navigateTo('dashboard');
  else alert(`タスク「${title}」を作成しました`);
}

// ── 顧客追加・編集モーダル ──
let editingClientId = null;

function openClientEditModal(clientId) { openClientModal(clientId); }

function openClientModal(clientId) {
  editingClientId = clientId || null;
  const modal = document.getElementById('client-create-modal');

  const staffOptions = buildUserOptions('staff');
  document.getElementById('new-client-main').innerHTML = staffOptions;
  document.getElementById('new-client-sub').innerHTML = '<option value="">なし</option>' + staffOptions;
  document.getElementById('new-client-fiscal').innerHTML = Array.from({length: 12}, (_, i) =>
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

  const clientFields = ['new-client-name', 'new-client-address', 'new-client-tel',
    'new-client-industry', 'new-client-representative', 'new-client-taxoffice', 'new-client-cw-id'];

  if (editingClientId) {
    const c = getClientById(editingClientId);
    if (c) {
      setFormValues({
        'new-client-name': c.name, 'new-client-type': c.clientType || '法人',
        'new-client-sales': c.monthlySales, 'new-client-address': c.address,
        'new-client-tel': c.tel, 'new-client-industry': c.industry,
        'new-client-representative': c.representative, 'new-client-taxoffice': c.taxOffice,
        'new-client-main': c.mainUserId, 'new-client-sub': c.subUserId,
        'new-client-fiscal': c.fiscalMonth || 3, 'new-client-cw-id': c.cwAccountId,
        'new-client-annual-fee': c.annualFee,
      });
      const cfv = c.customFieldValues || {};
      customFields.forEach(cf => {
        const el = document.getElementById('cf-val-' + cf.id);
        if (el) el.value = cfv[cf.id] || '';
      });
    }
  } else {
    resetForm([...clientFields, 'new-client-sales', 'new-client-annual-fee']);
    document.getElementById('new-client-type').value = '法人';
    customFields.forEach(cf => {
      const el = document.getElementById('cf-val-' + cf.id);
      if (el) el.value = '';
    });
  }

  showModal('client-create-modal');
}

function closeClientModal() { hideModal('client-create-modal'); }

function submitNewClient() {
  const name = getValTrim('new-client-name');
  const clientType = getVal('new-client-type');
  const fiscalMonth = getValInt('new-client-fiscal');
  const mainUserId = getVal('new-client-main');
  const subUserId = getVal('new-client-sub') || null;
  const monthlySales = getValInt('new-client-sales');
  const address = getValTrim('new-client-address');
  const tel = getValTrim('new-client-tel');
  const industry = getValTrim('new-client-industry');
  const representative = getValTrim('new-client-representative');
  const taxOffice = getValTrim('new-client-taxoffice');
  const annualFee = getValInt('new-client-annual-fee');
  const cwAccountId = getValTrim('new-client-cw-id');

  if (!name) { alert('顧客名を入力してください'); return; }
  if (!monthlySales) { alert('月額報酬を入力してください'); return; }

  const customFieldValues = {};
  (MOCK_DATA.customFields || []).forEach(cf => {
    const el = document.getElementById('cf-val-' + cf.id);
    if (el && el.value.trim()) customFieldValues[cf.id] = el.value.trim();
  });

  if (editingClientId) {
    const c = getClientById(editingClientId);
    if (c) {
      Object.assign(c, { name, clientType, fiscalMonth, mainUserId, subUserId,
        mgrUserId: mainUserId, monthlySales, annualFee, address, tel,
        industry, representative, taxOffice, cwAccountId, customFieldValues });
    }
    closeClientModal();
    navigateTo('client-detail', { id: editingClientId });
    editingClientId = null;
  } else {
    const nextCode = String(parseInt(MOCK_DATA.clients[MOCK_DATA.clients.length - 1].clientCode) + 1).padStart(6, '0');
    const newId = generateId('c-', MOCK_DATA.clients);

    MOCK_DATA.clients.push({
      id: newId, clientCode: nextCode, name, clientType, fiscalMonth,
      isActive: true, mainUserId, subUserId, mgrUserId: mainUserId,
      monthlySales, annualFee, spotFees: [], address, tel, industry,
      representative, taxOffice, memo: '', establishDate: '',
      cwAccountId, cwRoomUrls: [], relatedClientIds: [], customFieldValues,
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

  document.getElementById('new-staff-deptId').innerHTML = '<option value="">選択してください</option>' +
    MOCK_DATA.departments.filter(d => d.status === 1)
      .map(d => `<option value="${d.deptId}">${d.deptName}</option>`).join('');

  const modalTitle = modal.querySelector('.modal-header h3');
  if (modalTitle) modalTitle.textContent = editingStaffId ? '職員情報編集' : '新規職員登録';

  const staffFields = {
    'new-staff-lastName': '', 'new-staff-firstName': '',
    'new-staff-lastNameKana': '', 'new-staff-firstNameKana': '',
    'new-staff-email': '', 'new-staff-tel': '', 'new-staff-mobile': '',
    'new-staff-position': '', 'new-staff-employmentType': '正社員',
    'new-staff-joinDate': '', 'new-staff-role': 'member',
    'new-staff-staffFlag': '税務', 'new-staff-memo': '', 'new-staff-deptId': '',
  };

  if (editingStaffId) {
    const u = getUserById(editingStaffId);
    if (u) {
      setFormValues({
        'new-staff-lastName': u.lastName, 'new-staff-firstName': u.firstName,
        'new-staff-lastNameKana': u.lastNameKana, 'new-staff-firstNameKana': u.firstNameKana,
        'new-staff-email': u.email, 'new-staff-tel': u.tel, 'new-staff-mobile': u.mobile,
        'new-staff-position': u.position, 'new-staff-employmentType': u.employmentType || '正社員',
        'new-staff-joinDate': u.joinDate, 'new-staff-role': u.role || 'member',
        'new-staff-staffFlag': u.staffFlag || '税務', 'new-staff-memo': u.memo,
        'new-staff-deptId': u.deptId || '',
      });
    }
  } else {
    setFormValues(staffFields);
  }

  showModal('staff-create-modal');
}

function closeStaffModal() { hideModal('staff-create-modal'); }

function submitNewStaff() {
  const lastName = getValTrim('new-staff-lastName');
  const firstName = getValTrim('new-staff-firstName');
  const lastNameKana = getValTrim('new-staff-lastNameKana');
  const firstNameKana = getValTrim('new-staff-firstNameKana');
  const email = getValTrim('new-staff-email');
  const tel = getValTrim('new-staff-tel');
  const mobile = getValTrim('new-staff-mobile');
  const deptIdVal = getVal('new-staff-deptId');
  const deptId = deptIdVal ? parseInt(deptIdVal) : null;
  const position = getValTrim('new-staff-position');
  const employmentType = getVal('new-staff-employmentType');
  const joinDate = getVal('new-staff-joinDate');
  const role = getVal('new-staff-role');
  const staffFlag = getVal('new-staff-staffFlag');
  const memo = getValTrim('new-staff-memo');

  if (!lastName) { alert('姓を入力してください'); return; }
  if (!email) { alert('メールアドレスを入力してください'); return; }

  const name = firstName ? lastName + ' ' + firstName : lastName;

  if (editingStaffId) {
    const u = getUserById(editingStaffId);
    if (u) {
      Object.assign(u, { lastName, firstName, lastNameKana, firstNameKana,
        name, email, tel, mobile, deptId, position, employmentType,
        joinDate, role, staffFlag, memo, loginId: email.split('@')[0] });
    }
    closeStaffModal();
    navigateTo('staff-detail', { id: editingStaffId });
    editingStaffId = null;
  } else {
    const nextCode = 'A' + String(MOCK_DATA.users.length + 1).padStart(3, '0');
    const newId = generateId('u-', MOCK_DATA.users);

    MOCK_DATA.users.push({
      id: newId, staffCode: nextCode, lastName, firstName,
      lastNameKana, firstNameKana, name, email, tel, mobile,
      role, deptId, team: null, position, employmentType,
      joinDate, memo, loginId: email.split('@')[0], isActive: true,
      baseRatio: null, staffFlag,
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
  setFormValues({
    'edit-task-id': t.id, 'edit-task-title': t.title,
    'edit-task-status': t.status, 'edit-task-due': t.dueDate,
  });

  const assigneeSelect = document.getElementById('edit-task-assignee');
  assigneeSelect.innerHTML = MOCK_DATA.users.filter(u => u.isActive && u.role !== 'admin').map(u =>
    `<option value="${u.id}" ${u.id === t.assigneeUserId ? 'selected' : ''}>${u.name}</option>`
  ).join('');

  showModal('task-edit-modal');
}

function closeTaskEditModal() { hideModal('task-edit-modal'); }

function submitEditTask() {
  const id = getVal('edit-task-id');
  const t = MOCK_DATA.tasks.find(x => x.id === id);
  if (!t) return;
  t.title = getValTrim('edit-task-title');
  t.assigneeUserId = getVal('edit-task-assignee');
  t.status = getVal('edit-task-status');
  t.dueDate = getVal('edit-task-due');
  closeTaskEditModal();
  navigateTo('task-detail', { id });
}

function deleteTask() {
  const id = getVal('edit-task-id');
  if (!confirm('このタスクを削除しますか？')) return;
  MOCK_DATA.tasks = MOCK_DATA.tasks.filter(x => x.id !== id);
  closeTaskEditModal();
  navigateTo('tasks');
}

// ── 工数入力モーダル ──
function openTimesheetModal() {
  document.getElementById('new-ts-user').innerHTML = buildUserOptions();
  document.getElementById('new-ts-client').innerHTML = buildClientOptions(true);
  setFormValues({ 'new-ts-date': new Date().toISOString().slice(0, 10) });
  resetForm(['new-ts-hours', 'new-ts-desc']);
  showModal('timesheet-create-modal');
}

function closeTimesheetModal() { hideModal('timesheet-create-modal'); }

function submitNewTimeEntry() {
  const userId = getVal('new-ts-user');
  const clientId = getVal('new-ts-client');
  const date = getVal('new-ts-date');
  const hours = parseFloat(getVal('new-ts-hours'));
  const description = getValTrim('new-ts-desc');

  if (!hours || hours <= 0) { alert('時間を入力してください'); return; }
  if (!description) { alert('作業内容を入力してください'); return; }

  MOCK_DATA.timeEntries.push({
    id: generateId('te-', MOCK_DATA.timeEntries),
    userId, clientId, taskId: null, date, hours, description,
  });
  closeTimesheetModal();
  if (currentPage === 'timesheet') navigateTo('timesheet');
  else alert('工数を登録しました');
}

// ── 報告書作成モーダル ──
function openReportModal() {
  setFormValues({
    'new-rp-type': '業務報告書', 'new-rp-category': '確定申告',
    'new-rp-rank': 'B', 'new-rp-attach': false,
  });
  resetForm(['new-rp-client', 'new-rp-title']);
  showModal('report-create-modal');
}

function closeReportModal() { hideModal('report-create-modal'); }

function submitNewReport() {
  const title = getValTrim('new-rp-title');
  const clientName = getValTrim('new-rp-client');
  const type = getVal('new-rp-type');
  const category = getVal('new-rp-category');
  const rank = getVal('new-rp-rank');
  const hasAttachment = document.getElementById('new-rp-attach').checked;

  if (!title) { alert('タイトルを入力してください'); return; }

  MOCK_DATA.reports.push({
    id: generateId('rp-', MOCK_DATA.reports),
    createdAt: new Date().toISOString(),
    authorId: MOCK_DATA.currentUser.id, type, category,
    clientName, title, rank, readStatus: '一時保存中', hasAttachment,
  });
  closeReportModal();
  if (currentPage === 'reports') navigateTo('reports');
  else alert(`報告書「${title}」を作成しました`);
}

// ── 進捗管理表 作成モーダル ──
function openProgressCreateModal(type) {
  document.getElementById('pg-modal-title').textContent = `進捗管理表の作成（${type}）`;
  document.getElementById('new-pg-manager').innerHTML = buildUserOptions('leaders');
  resetForm(['new-pg-name']);
  document.getElementById('new-pg-category').value = '法人決算';

  if (type === '中間申告・予定納付') {
    setFormValues({ 'new-pg-category': '中間申告', 'new-pg-columns': '資料回収, 中間計算, 申告書作成, レビュー, 電子申告' });
  } else if (type === 'サンプル') {
    document.getElementById('new-pg-columns').value = '資料回収, 記帳確認, 決算整理, 申告書作成, レビュー, 電子申告, 納品';
  } else {
    document.getElementById('new-pg-columns').value = '';
  }

  const menu = document.getElementById('pg-create-menu');
  if (menu) menu.style.display = 'none';
  showModal('progress-create-modal');
}

function closeProgressCreateModal() { hideModal('progress-create-modal'); }

function submitNewProgress() {
  const name = getValTrim('new-pg-name');
  const category = getVal('new-pg-category');
  const managerId = getVal('new-pg-manager');
  const columnsText = getValTrim('new-pg-columns');

  if (!name) { alert('管理表名を入力してください'); return; }
  if (!columnsText) { alert('工程列を入力してください'); return; }

  const columns = columnsText.split(',').map(c => c.trim()).filter(Boolean);

  MOCK_DATA.progressSheets.push({
    id: generateId('ps-', MOCK_DATA.progressSheets),
    name, category, status: '利用中', managerId,
    createdAt: new Date().toISOString().slice(0, 10),
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
  setFormValues({ 'edit-pg-id': s.id, 'edit-pg-name': s.name, 'edit-pg-status': s.status });

  document.getElementById('edit-pg-manager').innerHTML = MOCK_DATA.users.filter(u => u.isActive && (u.role === 'admin' || u.role === 'team_leader')).map(u =>
    `<option value="${u.id}" ${u.id === s.managerId ? 'selected' : ''}>${u.name}</option>`
  ).join('');

  showModal('progress-settings-modal');
}

function closeProgressSettingsModal() { hideModal('progress-settings-modal'); }

function submitEditProgress() {
  const id = getVal('edit-pg-id');
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  s.name = getValTrim('edit-pg-name');
  s.status = getVal('edit-pg-status');
  s.managerId = getVal('edit-pg-manager');
  closeProgressSettingsModal();
  if (currentPage === 'progress') navigateTo('progress');
}
