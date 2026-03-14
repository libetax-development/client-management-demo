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

// 顧客削除
function deleteClient(clientId) {
  const c = getClientById(clientId);
  if (!c) return;
  if (!confirm(`顧客「${c.name}」を削除しますか？\nこの操作は取り消せません。`)) return;
  MOCK_DATA.clients = MOCK_DATA.clients.filter(x => x.id !== clientId);
  navigateTo('clients');
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

registerPage('clients', renderClients);
registerPage('client-detail', renderClientDetail);
