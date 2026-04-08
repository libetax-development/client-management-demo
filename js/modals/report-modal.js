// ===========================
// 報告書・タイムシート関連モーダル
// ===========================

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
    hideModal('timesheet-create-modal');
    if (currentPage === 'timesheet') navigateTo('timesheet');
  } else {
    MOCK_DATA.timeEntries.push({
      id: generateId('te-', MOCK_DATA.timeEntries),
      userId, clientId, taskId: null, date, hours, description,
    });
    hideModal('timesheet-create-modal');
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
  // 宛先チェックボックスを構築
  const recipientEl = document.getElementById('new-rp-recipients');
  if (recipientEl) {
    recipientEl.innerHTML = getActiveUsers().map(u =>
      `<label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;padding:2px 0;">
        <input type="checkbox" class="rp-recipient-cb" value="${u.id}"> ${escapeHtml(u.name)}
      </label>`
    ).join('');
    recipientEl.querySelectorAll('.rp-recipient-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const count = recipientEl.querySelectorAll('.rp-recipient-cb:checked').length;
        const countEl = document.getElementById('new-rp-recipients-count');
        if (countEl) countEl.textContent = count > 0 ? `${count}名を選択中` : '';
      });
    });
  }
  const countEl = document.getElementById('new-rp-recipients-count');
  if (countEl) countEl.textContent = '';
  showModal('report-create-modal');
}

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
    createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }) + 'T' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo' }),
    authorId: MOCK_DATA.currentUser.id, type, category,
    clientName, title, rank, readStatus: '一時保存中', hasAttachment, body,
  });
  hideModal('report-create-modal');
  if (currentPage === 'reports') navigateTo('reports');
  else alert(`報告書「${title}」を作成しました`);
}
