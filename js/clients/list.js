// ===========================
// 顧客一覧
// ===========================
// 顧客一覧の列定義
let clientPage = 1;
const clientPerPage = 20;

const CLIENT_COLUMNS = [
  { key: 'code', label: 'コード', visible: true },
  { key: 'name', label: '顧客名', visible: true, required: true },
  { key: 'type', label: '種別', visible: true },
  { key: 'fiscal', label: '決算月', visible: true },
  { key: 'main', label: '主担当', visible: true },
  { key: 'sub', label: '副担当', visible: true },
  { key: 'mgr', label: '税理士', visible: true },
  { key: 'bookkeeper', label: '記帳担当', visible: true },
  { key: 'status', label: 'ステータス', visible: true },
];

function renderClients(el) {
  el.innerHTML = `
    <div class="toolbar" style="flex-wrap:wrap;gap:8px;">
      <input type="text" class="search-input" placeholder="顧客名・コードで検索..." id="client-search">
      <select class="filter-select" id="client-type-filter">
        <option value="">全種別</option>
        <option value="法人">法人</option>
        <option value="個人">個人</option>
      </select>
      <select class="filter-select" id="client-status-filter">
        <option value="契約中" selected>契約中</option>
        <option value="">全ステータス</option>
        <optgroup label="契約中">
          <option value="契約完了">契約完了</option>
          <option value="契約書手続中">契約書手続中</option>
          <option value="スポット依頼">スポット依頼</option>
        </optgroup>
        <optgroup label="検討中">
          <option value="見込み">見込み</option>
          <option value="顧問契約検討中">顧問契約検討中</option>
          <option value="チャット作成済">チャット作成済</option>
          <option value="Zoom">Zoom</option>
          <option value="初回メール送信済">初回メール送信済</option>
          <option value="コンタクト送信済">コンタクト送信済</option>
        </optgroup>
        <optgroup label="終了・休止">
          <option value="契約解除">契約解除</option>
          <option value="休止中">休止中</option>
          <option value="失注">失注</option>
        </optgroup>
      </select>
      <select class="filter-select" id="client-main-filter">
        <option value="">全担当者</option>
        ${buildUserOptions()}
      </select>
      <div class="spacer"></div>
      <div style="position:relative;">
        <button class="btn btn-secondary btn-sm" id="client-col-toggle-btn" title="表示列の設定">列 ▼</button>
        <div id="client-col-dropdown" style="display:none;position:absolute;right:0;top:100%;margin-top:4px;background:#fff;border:1px solid var(--gray-200);border-radius:8px;padding:8px 12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:100;min-width:160px;">
          ${CLIENT_COLUMNS.filter(c => !c.required).map(c => `
            <label style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:13px;cursor:pointer;">
              <input type="checkbox" class="client-col-check" data-key="${c.key}" ${c.visible ? 'checked' : ''}> ${c.label}
            </label>
          `).join('')}
        </div>
      </div>
      <button class="btn btn-csv btn-sm" onclick="exportClientCSV()">CSV出力</button>
      <button class="btn btn-csv btn-sm" onclick="exportTatsujinCSV()">達人形式</button>
      <button class="btn btn-csv btn-sm" onclick="importClientCSV()">CSV取り込み</button>
      <button class="btn btn-primary" onclick="navigateTo('client-detail',{id:'new'})">+ 新規顧客</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr id="client-thead-row"></tr></thead>
          <tbody id="client-table-body"></tbody>
        </table>
      </div>
      <div id="client-pagination" class="rp-pagination"></div>
    </div>
  `;
  clientPage = 1;
  // デフォルト担当フィルタ: adminは全員、それ以外は自分
  if (MOCK_DATA.currentUser.role !== 'admin') {
    const mainSel = document.getElementById('client-main-filter');
    if (mainSel) mainSel.value = MOCK_DATA.currentUser.id;
  }
  renderClientTable();
  bindFilters(['client-search', 'client-type-filter', 'client-status-filter', 'client-main-filter'], () => { clientPage = 1; renderClientTable(); });

  // 列表示トグル
  const toggleBtn = document.getElementById('client-col-toggle-btn');
  const dropdown = document.getElementById('client-col-dropdown');
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  // 前回のリスナーを除去してから登録（ページ再訪問時のリーク防止）
  if (window._clientColClose) document.removeEventListener('click', window._clientColClose);
  window._clientColClose = () => { const d = document.getElementById('client-col-dropdown'); if (d) d.style.display = 'none'; };
  document.addEventListener('click', window._clientColClose);
  dropdown.addEventListener('click', (e) => e.stopPropagation());
  dropdown.querySelectorAll('.client-col-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const col = CLIENT_COLUMNS.find(c => c.key === cb.dataset.key);
      if (col) col.visible = cb.checked;
      renderClientTable();
    });
  });
}

// 契約ステータスのグループ定義
const CONTRACT_STATUS_GROUPS = {
  '契約中': ['契約中', '契約完了', '契約書手続中', 'スポット依頼'],
  '検討中': ['見込み', '顧問契約検討中', 'チャット作成済', 'Zoom', '初回メール送信済', 'コンタクト送信済'],
  '終了・休止': ['契約解除', '休止中', '失注'],
};

function getFilteredClients() {
  const search = (document.getElementById('client-search')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('client-type-filter')?.value || '';
  const statusFilter = document.getElementById('client-status-filter')?.value || '';
  const mainFilter = document.getElementById('client-main-filter')?.value || '';

  return MOCK_DATA.clients.filter(c => {
    if (search && !c.name.toLowerCase().includes(search) && !c.clientCode.includes(search)) return false;
    if (typeFilter && c.clientType !== typeFilter) return false;
    if (statusFilter) {
      const cs = c.contractStatus || '契約中';
      const group = CONTRACT_STATUS_GROUPS[statusFilter];
      if (group) {
        if (!group.includes(cs)) return false;
      } else {
        if (cs !== statusFilter) return false;
      }
    }
    if (mainFilter && getAssigneeUserId(c.id, 'main') !== mainFilter) return false;
    return true;
  });
}

function renderClientTable() {
  let clients = getFilteredClients();

  // thead更新
  const visibleCols = CLIENT_COLUMNS.filter(c => c.visible);
  const thead = document.getElementById('client-thead-row');
  if (thead) thead.innerHTML = visibleCols.map(c => `<th>${c.label}</th>`).join('');

  const colMap = {
    code: c => `<td style="font-family:monospace;font-size:12px;">${c.clientCode}</td>`,
    name: c => `<td><strong>${escapeHtml(c.name)}</strong></td>`,
    type: c => `<td>${renderTypeBadge(c.clientType)}</td>`,
    fiscal: c => `<td>${c.fiscalMonth ? c.fiscalMonth + '月' : '-'}</td>`,
    main: c => { const m = getAssigneeUser(c.id, 'main'); return `<td>${escapeHtml(m?.name || '-')}</td>`; },
    sub: c => { const m = getAssigneeUser(c.id, 'sub'); return `<td>${escapeHtml(m?.name || '-')}</td>`; },
    mgr: c => { const m = getAssigneeUser(c.id, 'reviewer'); return `<td>${escapeHtml(m?.name || '-')}</td>`; },
    bookkeeper: c => { const m = getAssigneeUser(c.id, 'bookkeeping_main'); return `<td>${escapeHtml(m?.name || '-')}</td>`; },
    status: c => { const cs = c.contractStatus || '契約中'; return `<td>${renderContractStatusBadge(cs)}</td>`; },
  };

  const total = clients.length;
  const totalPages = Math.max(1, Math.ceil(total / clientPerPage));
  const start = (clientPage - 1) * clientPerPage;
  const pageItems = clients.slice(start, start + clientPerPage);

  renderTableBody('client-table-body', pageItems, c => {
    const cells = visibleCols.map(col => colMap[col.key](c)).join('');
    return `<tr class="clickable" onclick="navigateTo('client-detail',{id:'${c.id}'})">${cells}</tr>`;
  }, visibleCols.length);

  const pag = document.getElementById('client-pagination');
  if (pag && total > clientPerPage) {
    pag.innerHTML = `
      <button onclick="clientPage=Math.max(1,clientPage-1);renderClientTable()" ${clientPage <= 1 ? 'disabled' : ''}>← 前</button>
      <span class="page-info">${clientPage} / ${totalPages}</span>
      <button onclick="clientPage=Math.min(${totalPages},clientPage+1);renderClientTable()" ${clientPage >= totalPages ? 'disabled' : ''}>次 →</button>
      <span style="margin-left:8px;font-size:11px;">(全${total}件)</span>
    `;
  } else if (pag) {
    pag.innerHTML = '';
  }
}

registerPage('clients', renderClients);
