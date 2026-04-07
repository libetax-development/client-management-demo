// ===========================
// 顧客関連モーダル
// ===========================

let editingClientId = null;


function openClientModal(clientId) {
  editingClientId = clientId || null;
  const modal = document.getElementById('client-create-modal');

  const staffOptions = buildUserOptions('staff');
  document.getElementById('new-client-mgr').innerHTML = '<option value="">なし</option>' + staffOptions;
  document.getElementById('new-client-main').innerHTML = staffOptions;
  document.getElementById('new-client-sub').innerHTML = '<option value="">なし</option>' + staffOptions;
  document.getElementById('new-client-bookkeeper').innerHTML = '<option value="">なし</option>' + staffOptions;
  document.getElementById('new-client-bookkeeping-sub').innerHTML = '<option value="">なし</option>' + staffOptions;
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
        'new-client-mgr': getAssigneeUserId(c.id, 'reviewer') || c.mgrUserId || '',
        'new-client-main': getAssigneeUserId(c.id, 'main') || c.mainUserId,
        'new-client-sub': getAssigneeUserId(c.id, 'sub') || c.subUserId,
        'new-client-bookkeeper': getAssigneeUserId(c.id, 'bookkeeping_main') || c.bookkeeperId || '',
        'new-client-bookkeeping-sub': getAssigneeUserId(c.id, 'bookkeeping_sub') || c.bookkeepingSubId || '',
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

function submitNewClient() {
  const name = getValTrim('new-client-name');
  const clientType = getVal('new-client-type');
  const fiscalMonth = getValInt('new-client-fiscal');
  const mgrUserId = getVal('new-client-mgr') || null;
  const mainUserId = getVal('new-client-main');
  const subUserId = getVal('new-client-sub') || null;
  const bookkeeperId = getVal('new-client-bookkeeper') || null;
  const bookkeepingSubId = getVal('new-client-bookkeeping-sub') || null;
  const monthlySales = getValInt('new-client-sales');
  const address = getValTrim('new-client-address');
  const tel = getValTrim('new-client-tel');
  const industry = getValTrim('new-client-industry');
  const representative = getValTrim('new-client-representative');
  const taxOffice = getValTrim('new-client-taxoffice');
  const annualFee = getValInt('new-client-annual-fee');
  const cwAccountId = getValTrim('new-client-cw-id');

  if (!name) { alert('顧客名を入力してください'); return; }
  if (monthlySales === null || monthlySales === undefined || isNaN(monthlySales)) { alert('月額報酬を入力してください'); return; }

  const customFieldValues = {};
  (MOCK_DATA.customFields || []).forEach(cf => {
    const el = document.getElementById('cf-val-' + cf.id);
    if (el && el.value.trim()) customFieldValues[cf.id] = el.value.trim();
  });

  if (editingClientId) {
    const c = getClientById(editingClientId);
    if (c) {
      Object.assign(c, { name, clientType, fiscalMonth, mainUserId, subUserId,
        mgrUserId: mgrUserId || mainUserId, bookkeeperId, bookkeepingSubId,
        monthlySales, annualFee, address, tel,
        industry, representative, taxOffice, cwAccountId, customFieldValues });
      // clientAssignments を同期
      upsertAssignment(editingClientId, 'main', mainUserId);
      upsertAssignment(editingClientId, 'sub', subUserId);
      upsertAssignment(editingClientId, 'reviewer', mgrUserId || mainUserId);
      upsertAssignment(editingClientId, 'bookkeeping_main', bookkeeperId);
      upsertAssignment(editingClientId, 'bookkeeping_sub', bookkeepingSubId);
    }
    hideModal('client-create-modal');
    navigateTo('client-detail', { id: editingClientId });
    editingClientId = null;
  } else {
    const nextCode = generateClientCode();
    const newId = generateId('c-', MOCK_DATA.clients);

    MOCK_DATA.clients.push({
      id: newId, clientCode: nextCode, name, clientType, fiscalMonth,
      isActive: true, mainUserId, subUserId, mgrUserId: mgrUserId || mainUserId,
      bookkeeperId, bookkeepingSubId,
      monthlySales, annualFee, spotFees: [], address, tel, industry,
      representative, taxOffice, memo: '', establishDate: '',
      cwAccountId, cwRoomUrls: [], relatedClientIds: [], customFieldValues,
    });

    // clientAssignments に追加
    upsertAssignment(newId, 'main', mainUserId);
    if (subUserId) upsertAssignment(newId, 'sub', subUserId);
    upsertAssignment(newId, 'reviewer', mgrUserId || mainUserId);
    if (bookkeeperId) upsertAssignment(newId, 'bookkeeping_main', bookkeeperId);
    if (bookkeepingSubId) upsertAssignment(newId, 'bookkeeping_sub', bookkeepingSubId);

    hideModal('client-create-modal');
    if (currentPage === 'clients') navigateTo('clients');
    else navigateTo('client-detail', { id: newId });
  }
}
