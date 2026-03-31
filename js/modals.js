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
    createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }),
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
      <div class="section-divider">
        <div class="section-title-sm">カスタム項目</div>
        ${customFields.map(cf => `<div class="form-group"><label>${cf.name}</label>${buildCustomFieldInput(cf)}</div>`).join('')}
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
    'new-staff-cwAccountId': '', 'new-staff-photoUrl': '',
    'new-staff-libeProfileUrl': '', 'new-staff-selfIntro': '',
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
        'new-staff-cwAccountId': u.cwAccountId || '',
        'new-staff-photoUrl': u.photoUrl || '',
        'new-staff-libeProfileUrl': u.libeProfileUrl || '',
        'new-staff-selfIntro': u.selfIntro || '',
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
  const cwAccountId = getValTrim('new-staff-cwAccountId');
  const photoUrl = getValTrim('new-staff-photoUrl');
  const libeProfileUrl = getValTrim('new-staff-libeProfileUrl');
  const selfIntro = getValTrim('new-staff-selfIntro');

  if (!lastName) { alert('姓を入力してください'); return; }
  if (!email) { alert('メールアドレスを入力してください'); return; }

  const name = firstName ? lastName + ' ' + firstName : lastName;

  if (editingStaffId) {
    const u = getUserById(editingStaffId);
    if (u) {
      Object.assign(u, { lastName, firstName, lastNameKana, firstNameKana,
        name, email, tel, mobile, deptId, position, employmentType,
        joinDate, role, staffFlag, memo, cwAccountId, photoUrl, libeProfileUrl, selfIntro, loginId: email.split('@')[0] });
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
      joinDate, memo, cwAccountId, photoUrl, libeProfileUrl, selfIntro, loginId: email.split('@')[0], isActive: true,
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
let editingTimesheetId = null;

function openTimesheetModal(entryId) {
  editingTimesheetId = entryId || null;
  document.getElementById('new-ts-user').innerHTML = buildUserOptions();
  document.getElementById('new-ts-client').innerHTML = buildClientOptions(true);

  const modal = document.getElementById('timesheet-create-modal');
  const title = modal.querySelector('.modal-header h3');

  if (editingTimesheetId) {
    const entry = MOCK_DATA.timeEntries.find(e => e.id === editingTimesheetId);
    if (entry) {
      setFormValues({ 'new-ts-user': entry.userId, 'new-ts-client': entry.clientId,
                       'new-ts-date': entry.date, 'new-ts-hours': entry.hours,
                       'new-ts-desc': entry.description });
    }
    if (title) title.textContent = '工数編集';
  } else {
    setFormValues({ 'new-ts-date': new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }) });
    resetForm(['new-ts-hours', 'new-ts-desc']);
    if (title) title.textContent = '工数入力';
  }
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

  if (editingTimesheetId) {
    const entry = MOCK_DATA.timeEntries.find(e => e.id === editingTimesheetId);
    if (entry) {
      Object.assign(entry, { userId, clientId, date, hours, description });
    }
    editingTimesheetId = null;
    closeTimesheetModal();
    if (currentPage === 'timesheet') navigateTo('timesheet');
  } else {
    MOCK_DATA.timeEntries.push({
      id: generateId('te-', MOCK_DATA.timeEntries),
      userId, clientId, taskId: null, date, hours, description,
    });
    closeTimesheetModal();
    if (currentPage === 'timesheet') navigateTo('timesheet');
    else alert('工数を登録しました');
  }
}

// ── 報告書作成モーダル ──
function openReportModal() {
  setFormValues({
    'new-rp-type': '業務報告書', 'new-rp-category': '確定申告',
    'new-rp-rank': 'B', 'new-rp-attach': false,
  });
  resetForm(['new-rp-client', 'new-rp-title']);
  // テンプレートドロップダウンを構築
  const tplSelect = document.getElementById('new-rp-template');
  if (tplSelect) {
    const templates = MOCK_DATA.reportTemplates || [];
    tplSelect.innerHTML = '<option value="">テンプレートを選択...</option>' +
      templates.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
  }
  // 本文をクリア
  const bodyEl = document.getElementById('new-rp-body');
  if (bodyEl) bodyEl.value = '';
  showModal('report-create-modal');
}

function closeReportModal() { hideModal('report-create-modal'); }

function applyReportTemplate() {
  const tplId = getVal('new-rp-template');
  if (!tplId) return;
  const tpl = (MOCK_DATA.reportTemplates || []).find(t => t.id === tplId);
  if (!tpl) return;

  const clientName = getValTrim('new-rp-client') || '';
  const title = getValTrim('new-rp-title') || '';
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

  let body = tpl.body;
  body = body.replace(/\{顧客名\}/g, clientName);
  body = body.replace(/\{タイトル\}/g, title);
  body = body.replace(/\{日付\}/g, dateStr);

  const bodyEl = document.getElementById('new-rp-body');
  if (bodyEl) bodyEl.value = body;
}

function submitNewReport() {
  const title = getValTrim('new-rp-title');
  const clientName = getValTrim('new-rp-client');
  const type = getVal('new-rp-type');
  const category = getVal('new-rp-category');
  const rank = getVal('new-rp-rank');
  const hasAttachment = document.getElementById('new-rp-attach').checked;
  const bodyEl = document.getElementById('new-rp-body');
  const body = bodyEl ? bodyEl.value.trim() : '';

  if (!title) { alert('タイトルを入力してください'); return; }

  MOCK_DATA.reports.push({
    id: generateId('rp-', MOCK_DATA.reports),
    createdAt: new Date().toISOString(),
    authorId: MOCK_DATA.currentUser.id, type, category,
    clientName, title, rank, readStatus: '一時保存中', hasAttachment, body,
  });
  closeReportModal();
  if (currentPage === 'reports') navigateTo('reports');
  else alert(`報告書「${title}」を作成しました`);
}

// ── 進捗管理表 作成モーダル（ステップ式） ──
let pgCurrentStep = 1;
let pgSelectedColumns = [];
let pgSelectedTemplateId = null;

function openProgressCreateModal() {
  pgCurrentStep = 1;
  pgSelectedColumns = [];
  pgSelectedTemplateId = null;

  // Step 2 の初期化
  document.getElementById('new-pg-manager').innerHTML = buildUserOptions('leaders');
  resetForm(['new-pg-name', 'pg-new-column-input', 'pg-template-save-name']);
  document.getElementById('new-pg-category').value = '法人決算';

  // 報告書リンク列チェックボックスの初期値
  document.getElementById('pg-show-report-link').checked = true;

  // 決算月フィルタ
  const fiscalSel = document.getElementById('pg-filter-fiscal');
  fiscalSel.innerHTML = '<option value="">全決算月</option>' +
    Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${i + 1}月</option>`).join('');

  // 主担当フィルタ
  document.getElementById('pg-filter-main').innerHTML = '<option value="">全担当者</option>' + buildUserOptions();

  // テンプレート保存チェック
  document.getElementById('pg-save-template').checked = false;
  document.getElementById('pg-template-name-area').style.display = 'none';

  // テンプレート一覧を描画
  renderProgressTemplateList();

  // ステップ表示を初期化
  pgShowStep(1);
  showModal('progress-create-modal');
}

function closeProgressCreateModal() { hideModal('progress-create-modal'); }

function renderProgressTemplateList() {
  const templates = MOCK_DATA.progressTemplates || [];
  const presets = templates.filter(t => !t.isCustom);
  const customs = templates.filter(t => t.isCustom);

  let html = '';

  // 「空から作成」カード
  html += '<div class="pg-tpl-card" onclick="pgSelectTemplate(null)" style="display:flex;align-items:center;justify-content:center;min-height:80px;border-style:dashed;">';
  html += '<div style="text-align:center;"><div style="font-size:24px;color:var(--gray-400);margin-bottom:4px;">+</div><div style="font-size:13px;color:var(--gray-500);">空から作成</div></div>';
  html += '</div>';

  // プリセット
  presets.forEach(function(t) {
    html += '<div class="pg-tpl-card" onclick="pgSelectTemplate(\'' + t.id + '\')">';
    html += '<div style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:4px;">' + escapeHtml(t.name) + '</div>';
    html += '<div style="font-size:11px;color:var(--gray-500);">' + escapeHtml(t.category) + ' / ' + t.columns.length + '工程</div>';
    html += '<div style="font-size:11px;color:var(--gray-400);margin-top:4px;">' + t.columns.map(function(c) { return escapeHtml(c); }).join(', ') + '</div>';
    html += '</div>';
  });

  // マイテンプレート
  if (customs.length > 0) {
    html += '<div style="grid-column:1/-1;font-size:12px;font-weight:600;color:var(--gray-500);margin-top:8px;">マイテンプレート</div>';
    customs.forEach(function(t) {
      html += '<div class="pg-tpl-card pg-tpl-custom" onclick="pgSelectTemplate(\'' + t.id + '\')">';
      html += '<div style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:4px;">' + escapeHtml(t.name) + '</div>';
      html += '<div style="font-size:11px;color:var(--gray-500);">' + escapeHtml(t.category) + ' / ' + t.columns.length + '工程</div>';
      html += '<div style="font-size:11px;color:var(--gray-400);margin-top:4px;">' + t.columns.map(function(c) { return escapeHtml(c); }).join(', ') + '</div>';
      html += '</div>';
    });
  }

  document.getElementById('pg-template-list').innerHTML = html;
}

function pgSelectTemplate(templateId) {
  pgSelectedTemplateId = templateId;
  if (templateId) {
    var tpl = (MOCK_DATA.progressTemplates || []).find(function(t) { return t.id === templateId; });
    if (tpl) {
      pgSelectedColumns = tpl.columns.slice();
      document.getElementById('new-pg-category').value = tpl.category;
      document.getElementById('pg-show-report-link').checked = tpl.showReportLink !== false;
    }
  } else {
    pgSelectedColumns = [];
  }
  pgCurrentStep = 2;
  pgShowStep(2);
  renderPgColumnsList();
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
  pgFilterClients();
  pgBindClientFilters();
  // 作成モーダルのターゲットモードをリセット
  var radios = document.querySelectorAll('input[name="pg-create-target-mode"]');
  radios.forEach(function(r) { r.checked = r.value === 'manual'; });
  pgCreateTargetModeChanged('manual');
  pgCreateFilterConditions = [];
  pgCreateFilterApplied = false;
}

function pgShowStep(step) {
  pgCurrentStep = step;
  document.getElementById('pg-step-1').style.display = step === 1 ? '' : 'none';
  document.getElementById('pg-step-2').style.display = step === 2 ? '' : 'none';
  document.getElementById('pg-step-3').style.display = step === 3 ? '' : 'none';

  // ステップインジケーター更新
  document.querySelectorAll('#pg-step-indicator .pg-step-dot').forEach(function(dot) {
    var s = parseInt(dot.dataset.step);
    dot.classList.remove('pg-step-active', 'pg-step-done');
    if (s === step) dot.classList.add('pg-step-active');
    else if (s < step) dot.classList.add('pg-step-done');
  });

  // ボタン表示切り替え
  document.getElementById('pg-btn-back').style.display = step > 1 ? '' : 'none';
  document.getElementById('pg-btn-next').style.display = step < 3 ? '' : 'none';
  document.getElementById('pg-btn-create').style.display = step === 3 ? '' : 'none';
}

function pgStepNext() {
  if (pgCurrentStep === 1) {
    // Step 1 → 空から作成として進む
    pgSelectTemplate(null);
  } else if (pgCurrentStep === 2) {
    // バリデーション
    var name = getValTrim('new-pg-name');
    if (!name) { alert('管理表名を入力してください'); return; }
    if (pgSelectedColumns.length === 0) { alert('工程を1つ以上追加してください'); return; }

    // 対象顧客モードに応じてselectedClientsを決定（サマリー表示用）
    var createModeEl = document.querySelector('input[name="pg-create-target-mode"]:checked');
    var createModeVal = createModeEl ? createModeEl.value : 'manual';
    var selectedClients;
    if (createModeVal === 'all') {
      selectedClients = MOCK_DATA.clients.filter(function(c) { return c.isActive; }).map(function(c) { return c.id; });
    } else if (createModeVal === 'filter') {
      selectedClients = pgApplyCreateFilterConditions(pgCreateFilterConditions).map(function(c) { return c.id; });
    } else {
      selectedClients = pgGetSelectedClientIds();
    }
    var mgr = getUserById(getVal('new-pg-manager'));
    var showReportLink = document.getElementById('pg-show-report-link').checked;
    document.getElementById('pg-confirm-summary').innerHTML =
      '<div class="card"><div class="card-body">' +
      '<div class="detail-grid" style="grid-template-columns:120px 1fr;gap:8px 16px;">' +
      '<div style="font-size:12px;color:var(--gray-500);">管理表名</div><div style="font-size:13px;font-weight:600;">' + escapeHtml(name) + '</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">カテゴリ</div><div style="font-size:13px;">' + escapeHtml(getVal('new-pg-category')) + '</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">管理者</div><div style="font-size:13px;">' + (mgr ? escapeHtml(mgr.name) : '-') + '</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">工程数</div><div style="font-size:13px;">' + pgSelectedColumns.length + '工程（' + pgSelectedColumns.map(function(c) { return escapeHtml(c); }).join(' → ') + '）</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">対象顧客数</div><div style="font-size:13px;">' + selectedClients.length + '件</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">報告書リンク</div><div style="font-size:13px;">' + (showReportLink ? 'あり' : 'なし') + '</div>' +
      '</div></div></div>';

    pgShowStep(3);
  }
}

function pgStepBack() {
  if (pgCurrentStep === 2) {
    pgShowStep(1);
    renderProgressTemplateList();
  } else if (pgCurrentStep === 3) {
    pgShowStep(2);
  }
}

// カラム一覧レンダリング
function renderPgColumnsList() {
  var container = document.getElementById('pg-columns-list');
  if (pgSelectedColumns.length === 0) {
    container.innerHTML = '<div style="font-size:12px;color:var(--gray-400);padding:8px;">工程が設定されていません</div>';
    return;
  }
  container.innerHTML = pgSelectedColumns.map(function(col, idx) {
    return '<div class="pg-col-item">' +
      '<span style="font-size:11px;color:var(--gray-400);min-width:20px;">' + (idx + 1) + '</span>' +
      '<span class="pg-col-name" contenteditable="true" data-idx="' + idx + '" onblur="pgRenameColumn(' + idx + ', this.textContent)">' + escapeHtml(col) + '</span>' +
      '<button class="pg-col-remove" onclick="pgRemoveColumn(' + idx + ')" title="削除">&times;</button>' +
      '</div>';
  }).join('');
}

function addProgressColumn() {
  var input = document.getElementById('pg-new-column-input');
  var name = input.value.trim();
  if (!name) return;
  if (pgSelectedColumns.includes(name)) { alert('同名の工程がすでに存在します'); return; }
  pgSelectedColumns.push(name);
  input.value = '';
  renderPgColumnsList();
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
}

function pgRemoveColumn(idx) {
  pgSelectedColumns.splice(idx, 1);
  renderPgColumnsList();
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
}

function pgRenameColumn(idx, newName) {
  var trimmed = newName.trim();
  if (trimmed && idx >= 0 && idx < pgSelectedColumns.length) {
    pgSelectedColumns[idx] = trimmed;
  }
  renderPgColumnsList();
}

// 顧客フィルタ + チェックボックス
function pgBindClientFilters() {
  ['pg-filter-fiscal', 'pg-filter-type', 'pg-filter-main', 'pg-filter-active'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', pgFilterClients);
  });

  // テンプレート保存チェックボックス
  document.getElementById('pg-save-template').addEventListener('change', function() {
    document.getElementById('pg-template-name-area').style.display = this.checked ? '' : 'none';
  });
}

function pgFilterClients() {
  var fiscal = getVal('pg-filter-fiscal');
  var cType = getVal('pg-filter-type');
  var mainUser = getVal('pg-filter-main');
  var activeOnly = getVal('pg-filter-active') === 'active';

  var clients = MOCK_DATA.clients.filter(function(c) {
    if (activeOnly && !c.isActive) return false;
    if (fiscal && c.fiscalMonth !== parseInt(fiscal)) return false;
    if (cType && c.clientType !== cType) return false;
    if (mainUser && c.mainUserId !== mainUser) return false;
    return true;
  });

  var container = document.getElementById('pg-client-list');
  if (clients.length === 0) {
    container.innerHTML = '<div style="font-size:12px;color:var(--gray-400);padding:8px;">該当する顧客がありません</div>';
  } else {
    container.innerHTML = clients.map(function(c) {
      var main = getUserById(c.mainUserId);
      return '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer;">' +
        '<input type="checkbox" class="pg-client-cb" value="' + c.id + '">' +
        '<span>' + escapeHtml(c.name) + '</span>' +
        '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + ' / ' + c.fiscalMonth + '月決算' + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
        '</label>';
    }).join('');
  }

  // チェック変更時のカウント更新
  container.querySelectorAll('.pg-client-cb').forEach(function(cb) {
    cb.addEventListener('change', pgUpdateSelectedCount);
  });
  pgUpdateSelectedCount();
}

function pgSelectAllClients(select) {
  document.querySelectorAll('#pg-client-list .pg-client-cb').forEach(function(cb) {
    cb.checked = select;
  });
  pgUpdateSelectedCount();
}

function pgUpdateSelectedCount() {
  var count = document.querySelectorAll('#pg-client-list .pg-client-cb:checked').length;
  document.getElementById('pg-selected-count').textContent = count + '件選択中';
}

function pgGetSelectedClientIds() {
  var ids = [];
  document.querySelectorAll('#pg-client-list .pg-client-cb:checked').forEach(function(cb) {
    ids.push(cb.value);
  });
  return ids;
}

function submitNewProgress() {
  var name = getValTrim('new-pg-name');
  var category = getVal('new-pg-category');
  var managerId = getVal('new-pg-manager');
  var columns = pgSelectedColumns.slice();
  var selectedClientIds = pgGetSelectedClientIds();

  if (!name) { alert('管理表名を入力してください'); return; }
  if (columns.length === 0) { alert('工程を1つ以上追加してください'); return; }

  var showReportLink = document.getElementById('pg-show-report-link').checked;

  // 対象顧客モードに応じてselectedClientIdsを決定
  var createMode = document.querySelector('input[name="pg-create-target-mode"]:checked');
  createMode = createMode ? createMode.value : 'manual';
  if (createMode === 'all') {
    selectedClientIds = MOCK_DATA.clients.filter(function(c) { return c.isActive; }).map(function(c) { return c.id; });
  } else if (createMode === 'filter') {
    var filtered = pgApplyCreateFilterConditions(pgCreateFilterConditions);
    selectedClientIds = filtered.map(function(c) { return c.id; });
  }

  // マイテンプレート保存
  if (document.getElementById('pg-save-template').checked) {
    var tplName = getValTrim('pg-template-save-name');
    if (!tplName) { alert('テンプレート名を入力してください'); return; }
    MOCK_DATA.progressTemplates.push({
      id: generateId('pt-', MOCK_DATA.progressTemplates),
      name: tplName,
      category: category,
      columns: columns.slice(),
      isCustom: true,
      showReportLink: showReportLink,
    });
  }

  // 対象顧客の targets を構築
  var targets = selectedClientIds.map(function(clientId) {
    var steps = {};
    columns.forEach(function(col) { steps[col] = '未着手'; });
    return { clientId: clientId, steps: steps, note: '' };
  });

  MOCK_DATA.progressSheets.push({
    id: generateId('ps-', MOCK_DATA.progressSheets),
    name: name,
    category: category,
    status: '利用中',
    managerId: managerId,
    createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }),
    columns: columns,
    targets: targets,
    showReportLink: showReportLink,
  });

  closeProgressCreateModal();
  if (currentPage === 'progress') navigateTo('progress');
  else alert('進捗管理表「' + name + '」を作成しました');
}

// ── 進捗管理表 設定変更モーダル ──
function openProgressSettingsModal(sheetId) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;

  document.getElementById('edit-pg-id').value = s.id;
  document.getElementById('edit-pg-name').value = s.name;
  document.getElementById('edit-pg-status').value = s.status;
  document.getElementById('edit-pg-category').value = s.category || '';

  document.getElementById('edit-pg-manager').innerHTML = MOCK_DATA.users
    .filter(u => u.isActive && (u.role === 'admin' || u.role === 'team_leader'))
    .map(u => `<option value="${u.id}" ${u.id === s.managerId ? 'selected' : ''}>${u.name}</option>`)
    .join('');

  // タブ切替ロジック
  const tabsEl = document.getElementById('pg-settings-tabs');
  function activatePgTab(tab) {
    tabsEl.querySelectorAll('.view-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.getElementById('pg-settings-tab-basic').style.display = tab === 'basic' ? '' : 'none';
    document.getElementById('pg-settings-tab-columns').style.display = tab === 'columns' ? '' : 'none';
    document.getElementById('pg-settings-tab-targets').style.display = tab === 'targets' ? '' : 'none';
    if (tab === 'columns') { pgInitSettingsColumnDualList(s.id); }
    if (tab === 'targets') { pgRenderTargetsList(s.id); pgRenderTargetsTab(s.id); }
  }
  // 既存リスナーをクリーン化するためにcloneで置き換え
  const newTabsEl = tabsEl.cloneNode(true);
  tabsEl.parentNode.replaceChild(newTabsEl, tabsEl);
  newTabsEl.addEventListener('click', e => {
    if (e.target.dataset.tab) activatePgTab(e.target.dataset.tab);
  });
  // 基本設定タブをアクティブに戻す
  activatePgTab('basic');

  showModal('progress-settings-modal');
}

function closeProgressSettingsModal() { hideModal('progress-settings-modal'); }

// 工程リスト描画
function pgRenderColumnsList(sheetId) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const container = document.getElementById('pg-settings-columns-list');
  if (!s.columns || s.columns.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--gray-400);padding:8px 0;">工程がありません</p>';
    return;
  }
  container.innerHTML = s.columns.map((col, idx) => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray-100);">
      <span style="font-size:12px;color:var(--gray-400);min-width:20px;text-align:right;">${idx + 1}</span>
      <input type="text" value="${escapeHtml(col)}" data-col-idx="${idx}"
        style="flex:1;padding:6px 10px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;"
        onchange="pgUpdateColumnName('${sheetId}',${idx},this.value)">
      <button class="btn btn-secondary btn-sm" onclick="pgMoveColumn('${sheetId}',${idx},-1)" ${idx === 0 ? 'disabled' : ''} title="上へ" style="padding:4px 8px;">&#8593;</button>
      <button class="btn btn-secondary btn-sm" onclick="pgMoveColumn('${sheetId}',${idx},1)" ${idx === s.columns.length - 1 ? 'disabled' : ''} title="下へ" style="padding:4px 8px;">&#8595;</button>
      <button class="btn btn-secondary btn-sm" onclick="pgRemoveSheetColumn('${sheetId}',${idx})" title="削除" style="padding:4px 8px;color:var(--danger);">&times;</button>
    </div>
  `).join('');
}

// 工程名の即時更新
window.pgUpdateColumnName = function(sheetId, idx, newName) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const trimmed = newName.trim();
  if (!trimmed) return;
  const oldName = s.columns[idx];
  if (oldName === trimmed) return;
  // columns更新
  s.columns[idx] = trimmed;
  // targets.stepsのキー名を連動更新
  s.targets.forEach(t => {
    if (t.steps && Object.prototype.hasOwnProperty.call(t.steps, oldName)) {
      t.steps[trimmed] = t.steps[oldName];
      delete t.steps[oldName];
    }
    if (t.completedDates && Object.prototype.hasOwnProperty.call(t.completedDates, oldName)) {
      t.completedDates[trimmed] = t.completedDates[oldName];
      delete t.completedDates[oldName];
    }
  });
};

// 工程の並べ替え
window.pgMoveColumn = function(sheetId, idx, dir) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= s.columns.length) return;
  // columns配列の入れ替え（stepsはオブジェクトなのでキー順不問）
  const tmp = s.columns[idx];
  s.columns[idx] = s.columns[newIdx];
  s.columns[newIdx] = tmp;
  pgRenderColumnsList(sheetId);
};

// 工程の削除（設定変更モーダル用）
window.pgRemoveSheetColumn = function(sheetId, idx) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const colName = s.columns[idx];
  // 完了データがある場合のみ確認
  const hasData = s.targets.some(t => t.steps && t.steps[colName] && t.steps[colName] !== '未着手');
  if (hasData) {
    if (!confirm(`工程「${colName}」には進捗データがあります。削除してもよろしいですか？`)) return;
  }
  s.columns.splice(idx, 1);
  // targets.stepsからも削除
  s.targets.forEach(t => {
    if (t.steps) delete t.steps[colName];
    if (t.completedDates) delete t.completedDates[colName];
  });
  pgRenderColumnsList(sheetId);
};

// 工程の追加（設定変更モーダル 直接入力）
window.pgAddColumn = function() {
  const id = document.getElementById('edit-pg-id').value;
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const input = document.getElementById('pg-new-col-name');
  const name = input.value.trim();
  if (!name) { alert('工程名を入力してください'); return; }
  if (s.columns.includes(name)) { alert('同名の工程がすでに存在します'); return; }
  s.columns.push(name);
  // 既存targetsに新キーを「未着手」で追加
  s.targets.forEach(t => {
    if (t.steps) t.steps[name] = '未着手';
  });
  input.value = '';
  // 新UIのデュアルリストを更新
  pgSettingsRenderCandidates();
  pgSettingsRenderDisplay(s.columns);
};

// 対象顧客リスト描画
function pgRenderTargetsList(sheetId) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const container = document.getElementById('pg-targets-list');

  if (!s.targets || s.targets.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--gray-400);padding:8px 0;">対象顧客がいません</p>';
  } else {
    container.innerHTML = `
      <div style="max-height:260px;overflow-y:auto;border:1px solid var(--gray-200);border-radius:6px;">
        ${s.targets.map(t => {
          const c = getClientById(t.clientId);
          if (!c) return '';
          return `<label style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--gray-100);cursor:pointer;font-size:13px;">
            <input type="checkbox" class="pg-target-chk" value="${t.clientId}">
            <span style="color:var(--gray-500);min-width:60px;font-size:12px;">${c.clientCode}</span>
            <span>${escapeHtml(c.name)}</span>
          </label>`;
        }).join('')}
      </div>
    `;
  }

  // 未追加顧客のドロップダウン構築
  const existingIds = new Set(s.targets.map(t => t.clientId));
  const available = MOCK_DATA.clients.filter(c => c.isActive && !existingIds.has(c.id));
  const sel = document.getElementById('pg-add-target-client');
  if (available.length === 0) {
    sel.innerHTML = '<option value="">-- 追加できる顧客がありません --</option>';
  } else {
    sel.innerHTML = '<option value="">-- 顧客を選択 --</option>' +
      available.map(c => `<option value="${c.id}">[${c.clientCode}] ${escapeHtml(c.name)}</option>`).join('');
  }
}

// 顧客の追加
window.pgAddTarget = function() {
  const id = document.getElementById('edit-pg-id').value;
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const clientId = document.getElementById('pg-add-target-client').value;
  if (!clientId) { alert('追加する顧客を選択してください'); return; }
  if (s.targets.some(t => t.clientId === clientId)) return;
  // 全工程を「未着手」で初期化
  const steps = {};
  const completedDates = {};
  s.columns.forEach(col => { steps[col] = '未着手'; });
  s.targets.push({ clientId, steps, completedDates, note: '' });
  pgRenderTargetsList(id);
};

// 選択した顧客を削除
window.pgRemoveSelectedTargets = function() {
  const id = document.getElementById('edit-pg-id').value;
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const checked = Array.from(document.querySelectorAll('.pg-target-chk:checked')).map(el => el.value);
  if (checked.length === 0) { alert('削除する顧客を選択してください'); return; }
  if (!confirm(`${checked.length}件の顧客を対象から削除しますか？`)) return;
  s.targets = s.targets.filter(t => !checked.includes(t.clientId));
  pgRenderTargetsList(id);
};

function submitEditProgress() {
  const id = getVal('edit-pg-id');
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const name = getValTrim('edit-pg-name');
  if (!name) { alert('管理表名を入力してください'); return; }
  s.name = name;
  s.status = getVal('edit-pg-status');
  s.managerId = getVal('edit-pg-manager');

  // 対象顧客モードを保存して反映
  var modeEl = document.querySelector('input[name="pg-target-mode"]:checked');
  var mode = modeEl ? modeEl.value : 'manual';
  s.targetMode = mode;
  if (mode === 'all') {
    // アクティブ全顧客でtargetsを再構築
    var activeIds = MOCK_DATA.clients.filter(function(c) { return c.isActive; }).map(function(c) { return c.id; });
    activeIds.forEach(function(clientId) {
      if (!s.targets.some(function(t) { return t.clientId === clientId; })) {
        var steps = {}; var completedDates = {};
        s.columns.forEach(function(col) { steps[col] = '未着手'; });
        s.targets.push({ clientId: clientId, steps: steps, completedDates: completedDates, note: '' });
      }
    });
  } else if (mode === 'filter') {
    // フィルタ条件にマッチする顧客でtargetsを再構築
    s.filterConditions = pgFilterConditions.slice();
    var matched = pgApplyFilterConditions(pgFilterConditions);
    matched.forEach(function(c) {
      if (!s.targets.some(function(t) { return t.clientId === c.id; })) {
        var steps = {}; var completedDates = {};
        s.columns.forEach(function(col) { steps[col] = '未着手'; });
        s.targets.push({ clientId: c.id, steps: steps, completedDates: completedDates, note: '' });
      }
    });
  }

  closeProgressSettingsModal();
  if (currentPage === 'progress') navigateTo('progress');
  else if (currentPage === 'progress-detail') navigateTo('progress-detail', { id });
}

function saveAsProgressTemplate(sheetId) {
  const id = sheetId || getVal('edit-pg-id');
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const tplName = prompt('テンプレート名を入力してください:', s.name + '（テンプレート）');
  if (!tplName || !tplName.trim()) return;
  MOCK_DATA.progressTemplates.push({
    id: generateId('pt-', MOCK_DATA.progressTemplates),
    name: tplName.trim(),
    category: s.category,
    columns: s.columns.slice(),
    isCustom: true,
  });
  alert('マイテンプレート「' + tplName.trim() + '」として保存しました');
}

// ============================================================
// MyKomon風 対象顧客選択（設定変更モーダル用）
// ============================================================

// フィルタ条件フィールド定義
var PG_FILTER_FIELDS = [
  { key: 'clientType', label: '種別', options: ['法人', '個人'] },
  { key: 'fiscalMonth', label: '決算月', options: Array.from({length: 12}, function(_, i) { return (i + 1) + '月'; }) },
  { key: 'isActive', label: 'ステータス', options: ['有効', '無効'] },
  { key: 'mainUserId', label: '主担当者', options: 'users' },
];

// 条件テキストを生成（例: 「種別：個人」AND「ステータス：有効」）
function pgBuildConditionText(conditions, logicName) {
  if (!conditions || conditions.length === 0) return '';
  var logicEl = document.querySelector('input[name="' + (logicName || 'pg-filter-logic') + '"]:checked');
  var logic = logicEl ? logicEl.value : 'AND';
  var parts = conditions.map(function(cond) {
    var field = PG_FILTER_FIELDS.find(function(f) { return f.key === cond.field; });
    var fieldLabel = field ? field.label : cond.field;
    var opLabel = cond.op === '=' ? '' : '≠';
    var valueLabel = cond.value;
    if (field && field.options === 'users') {
      var user = MOCK_DATA.users.find(function(u) { return u.id === cond.value; });
      if (user) valueLabel = user.name;
    }
    return '「' + fieldLabel + (opLabel ? opLabel : '：') + valueLabel + '」';
  });
  return parts.join(' ' + logic + ' ');
}

// 条件テキストを表示エリアに反映
function pgShowConditionText(conditions, logicName, elementId) {
  var el = document.getElementById(elementId || 'pg-filter-condition-text');
  if (!el) return;
  if (!conditions || conditions.length === 0) {
    el.style.display = 'none';
    el.textContent = '';
    return;
  }
  el.textContent = pgBuildConditionText(conditions, logicName);
  el.style.display = '';
}

// 設定変更モーダル用 フィルタ条件の状態
var pgFilterConditions = [];
var pgFilterApplied = false; // 確定済みかどうか

// 「対象顧客」タブを開くときに呼ばれる（sheetIdを引数で受け取れるよう拡張）
function pgRenderTargetsTab(sheetId) {
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s) return;

  // モードをリセット（シートにtargetModeが保存されている場合は復元）
  var mode = s.targetMode || 'manual';
  var radios = document.querySelectorAll('input[name="pg-target-mode"]');
  radios.forEach(function(r) { r.checked = r.value === mode; });

  pgFilterConditions = (s.filterConditions || []).slice();
  pgFilterApplied = (s.filterConditions && s.filterConditions.length > 0);

  // AND/ORロジックを復元
  if (s.filterLogic) {
    var logicRadios = document.querySelectorAll('input[name="pg-filter-logic"]');
    logicRadios.forEach(function(r) { r.checked = r.value === s.filterLogic; });
  }

  pgTargetModeChanged(mode, sheetId);
}

// モード変更時
window.pgTargetModeChanged = function(mode, sheetId) {
  var manualUI = document.getElementById('pg-manual-targets-ui');
  var filterPreview = document.getElementById('pg-filter-preview');
  var allPreview = document.getElementById('pg-all-preview');
  var filterBtn = document.getElementById('pg-filter-condition-btn');
  var conditionText = document.getElementById('pg-filter-condition-text');

  manualUI.style.display = 'none';
  filterPreview.style.display = 'none';
  if (conditionText) conditionText.style.display = 'none';
  allPreview.style.display = 'none';
  if (filterBtn) filterBtn.style.display = 'none';

  if (mode === 'all') {
    allPreview.style.display = '';
    var activeClients = MOCK_DATA.clients.filter(function(c) { return c.isActive; });
    document.getElementById('pg-all-count').textContent = 'アクティブな全顧客: ' + activeClients.length + '件';
    document.getElementById('pg-all-list').innerHTML = activeClients.map(function(c) {
      var main = getUserById(c.mainUserId);
      return '<div style="padding:4px 6px;font-size:13px;display:flex;align-items:center;gap:8px;">' +
        '<span style="color:var(--gray-500);font-size:11px;min-width:60px;">' + escapeHtml(c.clientCode) + '</span>' +
        '<span>' + escapeHtml(c.name) + '</span>' +
        '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
        '</div>';
    }).join('');

  } else if (mode === 'filter') {
    if (filterBtn) filterBtn.style.display = '';
    filterPreview.style.display = '';
    if (pgFilterApplied && pgFilterConditions.length > 0) {
      pgRenderFilterPreview();
      pgShowConditionText(pgFilterConditions, 'pg-filter-logic', 'pg-filter-condition-text');
    } else {
      document.getElementById('pg-filter-match-count').textContent = '条件が設定されていません。「条件設定」ボタンで条件を設定してください。';
      document.getElementById('pg-filter-match-list').innerHTML = '';
      pgShowConditionText([], null, 'pg-filter-condition-text');
    }

  } else {
    // manual
    manualUI.style.display = '';
    var id = document.getElementById('edit-pg-id').value;
    if (id) pgRenderTargetsList(id);
  }
};

function pgRenderFilterPreview() {
  var matched = pgApplyFilterConditions(pgFilterConditions);
  document.getElementById('pg-filter-match-count').textContent = '条件にマッチする顧客: ' + matched.length + '件';
  document.getElementById('pg-filter-match-list').innerHTML = matched.length === 0
    ? '<div style="font-size:12px;color:var(--gray-400);padding:4px;">該当する顧客がありません</div>'
    : matched.map(function(c) {
        var main = getUserById(c.mainUserId);
        return '<div style="padding:4px 6px;font-size:13px;display:flex;align-items:center;gap:8px;">' +
          '<span style="color:var(--gray-500);font-size:11px;min-width:60px;">' + escapeHtml(c.clientCode) + '</span>' +
          '<span>' + escapeHtml(c.name) + '</span>' +
          '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
          '</div>';
      }).join('');
}

// フィルタ条件を MOCK_DATA.clients に適用
function pgApplyFilterConditions(conditions) {
  if (!conditions || conditions.length === 0) return [];
  var logicEl = document.querySelector('input[name="pg-filter-logic"]:checked');
  var logic = logicEl ? logicEl.value : 'AND';
  return MOCK_DATA.clients.filter(function(c) {
    if (logic === 'AND') {
      return conditions.every(function(cond) { return pgMatchCondition(c, cond); });
    } else {
      return conditions.some(function(cond) { return pgMatchCondition(c, cond); });
    }
  });
}

function pgApplyCreateFilterConditions(conditions) {
  if (!conditions || conditions.length === 0) return [];
  var logicEl = document.querySelector('input[name="pg-create-filter-logic"]:checked');
  var logic = logicEl ? logicEl.value : 'AND';
  return MOCK_DATA.clients.filter(function(c) {
    if (logic === 'AND') {
      return conditions.every(function(cond) { return pgMatchCondition(c, cond); });
    } else {
      return conditions.some(function(cond) { return pgMatchCondition(c, cond); });
    }
  });
}

function pgMatchCondition(client, cond) {
  var field = cond.field;
  var op = cond.op;
  var val = cond.value;
  var actual;
  if (field === 'clientType') {
    actual = client.clientType;
  } else if (field === 'fiscalMonth') {
    actual = client.fiscalMonth + '月';
  } else if (field === 'isActive') {
    actual = client.isActive ? '有効' : '無効';
  } else if (field === 'mainUserId') {
    actual = client.mainUserId;
  } else {
    actual = client[field];
  }
  if (op === '=') return actual === val;
  if (op === '!=') return actual !== val;
  return true;
}

// 条件設定ダイアログを開く（設定変更モーダル用）
window.openPgFilterDialog = function() {
  pgRenderFilterConditionsUI();
  showModal('pg-filter-dialog');
};

window.closePgFilterDialog = function() {
  hideModal('pg-filter-dialog');
};

function pgRenderFilterConditionsUI() {
  var container = document.getElementById('pg-filter-conditions');
  if (pgFilterConditions.length === 0) {
    pgFilterConditions.push({ field: 'clientType', op: '=', value: '法人' });
  }
  pgRedrawFilterConditions(container, pgFilterConditions, 'pg-filter-logic');
}

function pgRedrawFilterConditions(container, conditions, logicName) {
  container.innerHTML = conditions.map(function(cond, idx) {
    return pgBuildConditionRow(cond, idx, logicName === 'pg-filter-logic' ? 'settings' : 'create');
  }).join('');
}

function pgBuildConditionRow(cond, idx, context) {
  var prefix = context === 'settings' ? 'pgFilterRowChange' : 'pgCreateFilterRowChange';
  var removePrefix = context === 'settings' ? 'pgRemoveFilterCondition' : 'pgRemoveCreateFilterCondition';

  var fieldOpts = PG_FILTER_FIELDS.map(function(f) {
    return '<option value="' + f.key + '"' + (cond.field === f.key ? ' selected' : '') + '>' + f.label + '</option>';
  }).join('');

  var opOpts = ['=', '!='].map(function(op) {
    var label = op === '=' ? '＝（等しい）' : '≠（等しくない）';
    return '<option value="' + op + '"' + (cond.op === op ? ' selected' : '') + '>' + label + '</option>';
  }).join('');

  var field = PG_FILTER_FIELDS.find(function(f) { return f.key === cond.field; });
  var valueOpts = '';
  if (field) {
    var opts = field.options === 'users'
      ? MOCK_DATA.users.filter(function(u) { return u.isActive; }).map(function(u) { return { v: u.id, l: u.name }; })
      : field.options.map(function(o) { return { v: o, l: o }; });
    valueOpts = opts.map(function(o) {
      return '<option value="' + o.v + '"' + (cond.value === o.v ? ' selected' : '') + '>' + escapeHtml(o.l) + '</option>';
    }).join('');
  }

  return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;" data-cond-idx="' + idx + '">' +
    '<select style="padding:5px 8px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;" onchange="' + prefix + '(' + idx + ',\'field\',this.value)">' + fieldOpts + '</select>' +
    '<select style="padding:5px 8px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;min-width:120px;" onchange="' + prefix + '(' + idx + ',\'op\',this.value)">' + opOpts + '</select>' +
    '<select style="padding:5px 8px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;flex:1;" onchange="' + prefix + '(' + idx + ',\'value\',this.value)">' + valueOpts + '</select>' +
    '<button class="btn-icon" onclick="' + removePrefix + '(' + idx + ')" title="削除" style="color:var(--danger);">&times;</button>' +
    '</div>';
}

window.pgFilterRowChange = function(idx, prop, val) {
  if (!pgFilterConditions[idx]) return;
  pgFilterConditions[idx][prop] = val;
  // フィールドが変わったら値を初期値にリセット
  if (prop === 'field') {
    var field = PG_FILTER_FIELDS.find(function(f) { return f.key === val; });
    if (field) {
      var opts = field.options === 'users'
        ? MOCK_DATA.users.filter(function(u) { return u.isActive; })
        : null;
      pgFilterConditions[idx].value = opts
        ? opts[0].id
        : (field.options[0] || '');
    }
    pgRedrawFilterConditions(document.getElementById('pg-filter-conditions'), pgFilterConditions, 'pg-filter-logic');
  }
};

window.pgAddFilterCondition = function() {
  pgFilterConditions.push({ field: 'clientType', op: '=', value: '法人' });
  pgRedrawFilterConditions(document.getElementById('pg-filter-conditions'), pgFilterConditions, 'pg-filter-logic');
};

window.pgRemoveFilterCondition = function(idx) {
  pgFilterConditions.splice(idx, 1);
  pgRedrawFilterConditions(document.getElementById('pg-filter-conditions'), pgFilterConditions, 'pg-filter-logic');
};

window.pgCheckFilterCount = function() {
  var matched = pgApplyFilterConditions(pgFilterConditions);
  document.getElementById('pg-filter-count-result').textContent = matched.length + '件の顧客が対象です';
};

window.applyPgFilter = function() {
  pgFilterApplied = true;
  closePgFilterDialog();
  // 設定変更モーダルのフィルタプレビューを更新
  pgRenderFilterPreview();
  pgShowConditionText(pgFilterConditions, 'pg-filter-logic', 'pg-filter-condition-text');
  // シートに条件を保存（次回モーダル開時に復元するため）
  var id = document.getElementById('edit-pg-id').value;
  var s = id ? MOCK_DATA.progressSheets.find(function(x) { return x.id === id; }) : null;
  if (s) {
    s.filterConditions = pgFilterConditions.slice();
    s.targetMode = 'filter';
    var logicEl = document.querySelector('input[name="pg-filter-logic"]:checked');
    s.filterLogic = logicEl ? logicEl.value : 'AND';
  }
};

// ============================================================
// MyKomon風 対象顧客選択（作成モーダル用）
// ============================================================

var pgCreateFilterConditions = [];
var pgCreateFilterApplied = false;

window.pgCreateTargetModeChanged = function(mode) {
  var manualArea = document.getElementById('pg-create-manual-area');
  var autoPreview = document.getElementById('pg-create-auto-preview');
  var filterBtn = document.getElementById('pg-create-filter-btn');
  var filterSummary = document.getElementById('pg-create-filter-summary');

  manualArea.style.display = 'none';
  autoPreview.style.display = 'none';
  if (filterBtn) filterBtn.style.display = 'none';
  if (filterSummary) filterSummary.style.display = 'none';

  if (mode === 'all') {
    autoPreview.style.display = '';
    var activeClients = MOCK_DATA.clients.filter(function(c) { return c.isActive; });
    document.getElementById('pg-create-auto-count').textContent = 'アクティブな全顧客: ' + activeClients.length + '件が対象になります';
    document.getElementById('pg-create-auto-list').innerHTML = activeClients.map(function(c) {
      var main = getUserById(c.mainUserId);
      return '<div style="padding:3px 6px;font-size:12px;display:flex;align-items:center;gap:8px;">' +
        '<span style="color:var(--gray-500);font-size:11px;min-width:60px;">' + escapeHtml(c.clientCode) + '</span>' +
        '<span>' + escapeHtml(c.name) + '</span>' +
        '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
        '</div>';
    }).join('');
    // pg-selected-count を更新（submitNewProgress で参照するため）
    document.getElementById('pg-selected-count').textContent = activeClients.length + '件選択中';

  } else if (mode === 'filter') {
    autoPreview.style.display = '';
    if (filterBtn) filterBtn.style.display = '';
    if (pgCreateFilterApplied && pgCreateFilterConditions.length > 0) {
      pgRenderCreateFilterPreview();
      if (filterSummary) {
        filterSummary.style.display = '';
        filterSummary.textContent = pgCreateFilterConditions.length + '件の条件';
      }
    } else {
      document.getElementById('pg-create-auto-count').textContent = '条件が設定されていません。「条件設定」ボタンで条件を設定してください。';
      document.getElementById('pg-create-auto-list').innerHTML = '';
    }

  } else {
    // manual
    manualArea.style.display = '';
  }
};

function pgRenderCreateFilterPreview() {
  var matched = pgApplyCreateFilterConditions(pgCreateFilterConditions);
  document.getElementById('pg-create-auto-count').textContent = '条件にマッチする顧客: ' + matched.length + '件が対象になります';
  document.getElementById('pg-create-auto-list').innerHTML = matched.length === 0
    ? '<div style="font-size:12px;color:var(--gray-400);padding:4px;">該当する顧客がありません</div>'
    : matched.map(function(c) {
        var main = getUserById(c.mainUserId);
        return '<div style="padding:3px 6px;font-size:12px;display:flex;align-items:center;gap:8px;">' +
          '<span style="color:var(--gray-500);font-size:11px;min-width:60px;">' + escapeHtml(c.clientCode) + '</span>' +
          '<span>' + escapeHtml(c.name) + '</span>' +
          '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
          '</div>';
      }).join('');
  // pg-selected-count を更新
  document.getElementById('pg-selected-count').textContent = matched.length + '件選択中';
}

window.openPgCreateFilterDialog = function() {
  pgRenderCreateFilterConditionsUI();
  showModal('pg-create-filter-dialog');
};

window.closePgCreateFilterDialog = function() {
  hideModal('pg-create-filter-dialog');
};

function pgRenderCreateFilterConditionsUI() {
  var container = document.getElementById('pg-create-filter-conditions');
  if (pgCreateFilterConditions.length === 0) {
    pgCreateFilterConditions.push({ field: 'clientType', op: '=', value: '法人' });
  }
  pgRedrawFilterConditions(container, pgCreateFilterConditions, 'pg-create-filter-logic');
}

window.pgCreateFilterRowChange = function(idx, prop, val) {
  if (!pgCreateFilterConditions[idx]) return;
  pgCreateFilterConditions[idx][prop] = val;
  if (prop === 'field') {
    var field = PG_FILTER_FIELDS.find(function(f) { return f.key === val; });
    if (field) {
      var opts = field.options === 'users'
        ? MOCK_DATA.users.filter(function(u) { return u.isActive; })
        : null;
      pgCreateFilterConditions[idx].value = opts
        ? opts[0].id
        : (field.options[0] || '');
    }
    pgRedrawFilterConditions(document.getElementById('pg-create-filter-conditions'), pgCreateFilterConditions, 'pg-create-filter-logic');
  }
};

window.pgAddCreateFilterCondition = function() {
  pgCreateFilterConditions.push({ field: 'clientType', op: '=', value: '法人' });
  pgRedrawFilterConditions(document.getElementById('pg-create-filter-conditions'), pgCreateFilterConditions, 'pg-create-filter-logic');
};

window.pgRemoveCreateFilterCondition = function(idx) {
  pgCreateFilterConditions.splice(idx, 1);
  pgRedrawFilterConditions(document.getElementById('pg-create-filter-conditions'), pgCreateFilterConditions, 'pg-create-filter-logic');
};

window.pgCheckCreateFilterCount = function() {
  var matched = pgApplyCreateFilterConditions(pgCreateFilterConditions);
  document.getElementById('pg-create-filter-count-result').textContent = matched.length + '件の顧客が対象です';
};

window.applyPgCreateFilter = function() {
  pgCreateFilterApplied = true;
  closePgCreateFilterDialog();
  pgRenderCreateFilterPreview();
  var filterSummary = document.getElementById('pg-create-filter-summary');
  if (filterSummary) {
    filterSummary.style.display = '';
    filterSummary.textContent = pgCreateFilterConditions.length + '件の条件';
  }
};

// ============================================================
// 候補⇔表示リスト（設定変更モーダル 工程設定タブ）
// ============================================================

var pgSettingsSelectedCandidateIdx = null;
var pgSettingsSelectedDisplayIdx = null;

// 工程設定タブを開いたときに初期化
function pgInitSettingsColumnDualList(sheetId) {
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s) return;
  pgSettingsSelectedCandidateIdx = null;
  pgSettingsSelectedDisplayIdx = null;
  pgSettingsRenderCandidates();
  pgSettingsRenderDisplay(s.columns);
}

window.pgSettingsRenderCandidates = function() {
  var category = document.getElementById('pg-settings-col-category').value;
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = sheetId ? MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; }) : null;
  var displayCols = s ? s.columns : [];

  var candidates = pgGetCandidatesByCategory(category);
  // 既に表示リストにある項目を除外
  candidates = candidates.filter(function(c) { return !displayCols.includes(c); });

  var container = document.getElementById('pg-settings-col-candidates');
  if (candidates.length === 0) {
    container.innerHTML = '<div style="padding:8px;font-size:12px;color:var(--gray-400);">候補がありません</div>';
    return;
  }
  container.innerHTML = candidates.map(function(c, idx) {
    return '<div class="pg-dual-list-item" data-idx="' + idx + '" data-name="' + escapeHtml(c) + '" onclick="pgSettingsSelectCandidate(' + idx + ', this)" style="padding:6px 10px;font-size:13px;cursor:pointer;border-radius:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(c) + '</div>';
  }).join('');
};

window.pgSettingsSelectCandidate = function(idx, el) {
  pgSettingsSelectedCandidateIdx = idx;
  pgSettingsSelectedDisplayIdx = null;
  document.querySelectorAll('#pg-settings-col-candidates .pg-dual-list-item').forEach(function(item) {
    item.style.background = '';
    item.style.color = '';
  });
  document.querySelectorAll('#pg-settings-col-display .pg-dual-list-item').forEach(function(item) {
    item.style.background = '';
    item.style.color = '';
  });
  el.style.background = 'var(--primary)';
  el.style.color = '#fff';
};

window.pgSettingsSelectDisplay = function(idx, el) {
  pgSettingsSelectedDisplayIdx = idx;
  pgSettingsSelectedCandidateIdx = null;
  document.querySelectorAll('#pg-settings-col-candidates .pg-dual-list-item').forEach(function(item) {
    item.style.background = '';
    item.style.color = '';
  });
  document.querySelectorAll('#pg-settings-col-display .pg-dual-list-item').forEach(function(item) {
    item.style.background = '';
    item.style.color = '';
  });
  el.style.background = 'var(--primary)';
  el.style.color = '#fff';
};

function pgSettingsRenderDisplay(columns) {
  var container = document.getElementById('pg-settings-col-display');
  if (!columns || columns.length === 0) {
    container.innerHTML = '<div style="padding:8px;font-size:12px;color:var(--gray-400);">工程がありません</div>';
    return;
  }
  container.innerHTML = columns.map(function(c, idx) {
    return '<div class="pg-dual-list-item" data-idx="' + idx + '" data-name="' + escapeHtml(c) + '" onclick="pgSettingsSelectDisplay(' + idx + ', this)" style="padding:6px 10px;font-size:13px;cursor:pointer;border-radius:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(c) + '</div>';
  }).join('');
}

window.pgSettingsColAdd = function() {
  var selectedEl = document.querySelector('#pg-settings-col-candidates .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) {
    alert('候補から追加する工程を選択してください');
    return;
  }
  var name = selectedEl.dataset.name;
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s) return;
  if (s.columns.includes(name)) return;
  s.columns.push(name);
  s.targets.forEach(function(t) {
    if (t.steps) t.steps[name] = '未着手';
  });
  pgSettingsSelectedCandidateIdx = null;
  pgSettingsRenderCandidates();
  pgSettingsRenderDisplay(s.columns);
};

window.pgSettingsColRemove = function() {
  var selectedEl = document.querySelector('#pg-settings-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) {
    alert('削除する工程を選択してください');
    return;
  }
  var name = selectedEl.dataset.name;
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s) return;
  var idx = s.columns.indexOf(name);
  if (idx < 0) return;
  var hasData = s.targets.some(function(t) { return t.steps && t.steps[name] && t.steps[name] !== '未着手'; });
  if (hasData && !confirm('工程「' + name + '」には進捗データがあります。削除してもよろしいですか？')) return;
  s.columns.splice(idx, 1);
  s.targets.forEach(function(t) {
    if (t.steps) delete t.steps[name];
    if (t.completedDates) delete t.completedDates[name];
  });
  pgSettingsSelectedDisplayIdx = null;
  pgSettingsRenderCandidates();
  pgSettingsRenderDisplay(s.columns);
};

window.pgSettingsColMoveUp = function() {
  var selectedEl = document.querySelector('#pg-settings-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) return;
  var idx = parseInt(selectedEl.dataset.idx);
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s || idx <= 0) return;
  var tmp = s.columns[idx]; s.columns[idx] = s.columns[idx - 1]; s.columns[idx - 1] = tmp;
  pgSettingsRenderDisplay(s.columns);
  // 移動後に選択状態を維持
  var items = document.querySelectorAll('#pg-settings-col-display .pg-dual-list-item');
  if (items[idx - 1]) { items[idx - 1].style.background = 'var(--primary)'; items[idx - 1].style.color = '#fff'; }
};

window.pgSettingsColMoveDown = function() {
  var selectedEl = document.querySelector('#pg-settings-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) return;
  var idx = parseInt(selectedEl.dataset.idx);
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s || idx >= s.columns.length - 1) return;
  var tmp = s.columns[idx]; s.columns[idx] = s.columns[idx + 1]; s.columns[idx + 1] = tmp;
  pgSettingsRenderDisplay(s.columns);
  var items = document.querySelectorAll('#pg-settings-col-display .pg-dual-list-item');
  if (items[idx + 1]) { items[idx + 1].style.background = 'var(--primary)'; items[idx + 1].style.color = '#fff'; }
};

function pgGetCandidatesByCategory(category) {
  var candidates = MOCK_DATA.progressColumnCandidates || {};
  if (category === 'all') {
    var all = [];
    Object.values(candidates).forEach(function(arr) {
      arr.forEach(function(c) { if (!all.includes(c)) all.push(c); });
    });
    return all;
  }
  return (candidates[category] || []).slice();
}

// ============================================================
// 候補⇔表示リスト（作成モーダル 工程列）
// ============================================================

window.pgCreateRenderCandidates = function() {
  var category = document.getElementById('pg-col-category').value;
  var displayCols = pgSelectedColumns.slice();
  var candidates = pgGetCandidatesByCategory(category).filter(function(c) { return !displayCols.includes(c); });

  var container = document.getElementById('pg-col-candidates');
  if (candidates.length === 0) {
    container.innerHTML = '<div style="padding:8px;font-size:12px;color:var(--gray-400);">候補がありません</div>';
    return;
  }
  container.innerHTML = candidates.map(function(c, idx) {
    return '<div class="pg-dual-list-item" data-idx="' + idx + '" data-name="' + escapeHtml(c) + '" onclick="pgCreateSelectCandidate(this)" style="padding:5px 8px;font-size:12px;cursor:pointer;border-radius:4px;">' + escapeHtml(c) + '</div>';
  }).join('');
};

window.pgCreateSelectCandidate = function(el) {
  document.querySelectorAll('#pg-col-candidates .pg-dual-list-item').forEach(function(item) { item.style.background = ''; item.style.color = ''; });
  document.querySelectorAll('#pg-col-display .pg-dual-list-item').forEach(function(item) { item.style.background = ''; item.style.color = ''; });
  el.style.background = 'var(--primary)'; el.style.color = '#fff';
};

window.pgCreateSelectDisplay = function(el) {
  document.querySelectorAll('#pg-col-candidates .pg-dual-list-item').forEach(function(item) { item.style.background = ''; item.style.color = ''; });
  document.querySelectorAll('#pg-col-display .pg-dual-list-item').forEach(function(item) { item.style.background = ''; item.style.color = ''; });
  el.style.background = 'var(--primary)'; el.style.color = '#fff';
};

function pgCreateRenderDisplay() {
  var container = document.getElementById('pg-col-display');
  if (!pgSelectedColumns || pgSelectedColumns.length === 0) {
    container.innerHTML = '<div style="padding:8px;font-size:12px;color:var(--gray-400);">工程がありません</div>';
    return;
  }
  container.innerHTML = pgSelectedColumns.map(function(c, idx) {
    return '<div class="pg-dual-list-item" data-idx="' + idx + '" data-name="' + escapeHtml(c) + '" onclick="pgCreateSelectDisplay(this)" style="padding:5px 8px;font-size:12px;cursor:pointer;border-radius:4px;">' + escapeHtml(c) + '</div>';
  }).join('');
}

window.pgCreateColAdd = function() {
  var selectedEl = document.querySelector('#pg-col-candidates .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) { alert('候補から追加する工程を選択してください'); return; }
  var name = selectedEl.dataset.name;
  if (pgSelectedColumns.includes(name)) return;
  pgSelectedColumns.push(name);
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
};

window.pgCreateColRemove = function() {
  var selectedEl = document.querySelector('#pg-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) { alert('削除する工程を選択してください'); return; }
  var name = selectedEl.dataset.name;
  var idx = pgSelectedColumns.indexOf(name);
  if (idx >= 0) pgSelectedColumns.splice(idx, 1);
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
};

window.pgCreateColMoveUp = function() {
  var selectedEl = document.querySelector('#pg-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) return;
  var idx = parseInt(selectedEl.dataset.idx);
  if (idx <= 0) return;
  var tmp = pgSelectedColumns[idx]; pgSelectedColumns[idx] = pgSelectedColumns[idx - 1]; pgSelectedColumns[idx - 1] = tmp;
  pgCreateRenderDisplay();
  var items = document.querySelectorAll('#pg-col-display .pg-dual-list-item');
  if (items[idx - 1]) { items[idx - 1].style.background = 'var(--primary)'; items[idx - 1].style.color = '#fff'; }
};

window.pgCreateColMoveDown = function() {
  var selectedEl = document.querySelector('#pg-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) return;
  var idx = parseInt(selectedEl.dataset.idx);
  if (idx >= pgSelectedColumns.length - 1) return;
  var tmp = pgSelectedColumns[idx]; pgSelectedColumns[idx] = pgSelectedColumns[idx + 1]; pgSelectedColumns[idx + 1] = tmp;
  pgCreateRenderDisplay();
  var items = document.querySelectorAll('#pg-col-display .pg-dual-list-item');
  if (items[idx + 1]) { items[idx + 1].style.background = 'var(--primary)'; items[idx + 1].style.color = '#fff'; }
};
