// ===========================
// 顧客一覧
// ===========================
// 顧客一覧の列定義
const CLIENT_COLUMNS = [
  { key: 'code', label: 'コード', visible: true },
  { key: 'name', label: '顧客名', visible: true, required: true },
  { key: 'type', label: '種別', visible: true },
  { key: 'fiscal', label: '決算月', visible: true },
  { key: 'main', label: '主担当', visible: true },
  { key: 'sales', label: '売上（税抜）', visible: true },
  { key: 'status', label: '状態', visible: true },
];

function renderClients(el) {
  const fiscalOpts = Array.from({length: 12}, (_, i) => `<option value="${i+1}">${i+1}月</option>`).join('');

  el.innerHTML = `
    <div class="toolbar" style="flex-wrap:wrap;gap:8px;">
      <input type="text" class="search-input" placeholder="顧客名・コードで検索..." id="client-search">
      <select class="filter-select" id="client-type-filter">
        <option value="">全種別</option>
        <option value="法人">法人</option>
        <option value="個人">個人</option>
      </select>
      <select class="filter-select" id="client-status-filter">
        <option value="active" selected>有効</option>
        <option value="">全ステータス</option>
        <option value="inactive">無効</option>
      </select>
      <select class="filter-select" id="client-main-filter">
        <option value="">全担当者</option>
        ${buildUserOptions()}
      </select>
      <select class="filter-select" id="client-fiscal-filter">
        <option value="">全決算月</option>
        ${fiscalOpts}
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
    </div>
  `;
  renderClientTable();
  bindFilters(['client-search', 'client-type-filter', 'client-status-filter', 'client-main-filter', 'client-fiscal-filter'], renderClientTable);

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

function renderClientTable() {
  const search = (document.getElementById('client-search')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('client-type-filter')?.value || '';
  const statusFilter = document.getElementById('client-status-filter')?.value || '';
  const mainFilter = document.getElementById('client-main-filter')?.value || '';
  const fiscalFilter = document.getElementById('client-fiscal-filter')?.value || '';

  let clients = MOCK_DATA.clients.filter(c => {
    if (search && !c.name.toLowerCase().includes(search) && !c.clientCode.includes(search)) return false;
    if (typeFilter && c.clientType !== typeFilter) return false;
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;
    if (mainFilter && c.mainUserId !== mainFilter) return false;
    if (fiscalFilter && String(c.fiscalMonth) !== fiscalFilter) return false;
    return true;
  });

  // thead更新
  const visibleCols = CLIENT_COLUMNS.filter(c => c.visible);
  const thead = document.getElementById('client-thead-row');
  if (thead) thead.innerHTML = visibleCols.map(c => `<th>${c.label}</th>`).join('');

  const colMap = {
    code: c => `<td>${c.clientCode}</td>`,
    name: c => `<td><strong>${c.name}</strong></td>`,
    type: c => `<td>${renderTypeBadge(c.clientType)}</td>`,
    fiscal: c => `<td>${c.fiscalMonth}月</td>`,
    main: c => { const m = getUserById(c.mainUserId); return `<td>${m?.name || '-'}</td>`; },
    sales: c => `<td>${c.monthlySales.toLocaleString()}円</td>`,
    status: c => `<td>${c.isActive ? '<span style="color:var(--success)">有効</span>' : '<span style="color:var(--gray-400)">無効</span>'}</td>`,
  };

  renderTableBody('client-table-body', clients, c => {
    const cells = visibleCols.map(col => colMap[col.key](c)).join('');
    return `<tr class="clickable" onclick="navigateTo('client-detail',{id:'${c.id}'})">${cells}</tr>`;
  }, visibleCols.length);
}

// ===========================
// 顧客詳細
// ===========================
let clientEditMode = false;

function renderClientDetail(el, params) {
  const isNew = params.id === 'new';
  const editing = isNew || clientEditMode;
  const c = isNew ? null : getClientById(params.id);
  if (!isNew && !c) { el.innerHTML = renderEmptyState('顧客が見つかりません'); return; }

  const staffOptions = buildUserOptions('staff');
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
        return `<div class="related-client-item"><a href="#" onclick="event.preventDefault();navigateTo('client-detail',{id:'${rc.id}'})">${rc.name}</a> ${renderTypeBadge(rc.clientType)}</div>`;
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

  // 業種選択肢
  const industryOptions = ['卸売業','製造業','不動産業','不動産賃貸','小売業','サービス業','IT・ソフトウェア','建設業','飲食業','医療・福祉','農業','NPO・福祉','フリーランス（IT）','その他'].map(i =>
    `<option value="${i}" ${c?.industry === i ? 'selected' : ''}>${i}</option>`
  ).join('');

  // 契約ステータス選択肢
  const contractStatusOptions = ['契約中','契約終了','休止中','見込み'].map(s =>
    `<option value="${s}" ${c?.contractStatus === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  // 決算月選択肢（「個人」含む）
  const fiscalOptionsWithPersonal = Array.from({length: 12}, (_, i) =>
    `<option value="${i + 1}">${i + 1}月</option>`
  ).join('') + '<option value="personal">個人（12月）</option>';

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
        <div class="view-tabs" id="client-detail-tabs" style="margin-bottom:16px;">
          <button class="view-tab active" data-ctab="basic">基本情報</button>
          <button class="view-tab" data-ctab="tax">税務・申告</button>
          <button class="view-tab" data-ctab="contact">連絡先・連携</button>
        </div>

        <div id="ctab-basic">
          <div class="detail-section-title">基本情報</div>
          ${!isNew ? `<div class="detail-row"><div class="detail-label">顧客コード</div><div class="detail-value">${c.clientCode}</div></div>` : ''}
          <div class="detail-row"><div class="detail-label">契約ステータス</div><div class="detail-value">${editing ? `<select id="ed-contractStatus" class="inline-edit-input">${contractStatusOptions}</select>` : val(c?.contractStatus, '未設定')}</div></div>
          <div class="detail-row"><div class="detail-label">顧客名</div><div class="detail-value">${editing ? inp('ed-name', c?.name, 'text', '例: 株式会社サンプル商事') : val(c.name)}</div></div>
          <div class="detail-row"><div class="detail-label">種別</div><div class="detail-value">${editing ? inp('ed-type', '', 'select-type') : renderTypeBadge(c.clientType)}</div></div>
          <div class="detail-row"><div class="detail-label">決算月</div><div class="detail-value">${editing ? `<select id="ed-fiscal" class="inline-edit-input">${fiscalOptionsWithPersonal}</select>` : (c.fiscalMonth === 'personal' ? '個人（12月）' : c.fiscalMonth + '月')}</div></div>
          <div class="detail-row"><div class="detail-label">業種</div><div class="detail-value">${editing ? `<select id="ed-industry-select" class="inline-edit-input"><option value="">選択...</option>${industryOptions}<option value="_other">その他（手入力）</option></select>` : val(c?.industry)}</div></div>
          <div class="detail-row"><div class="detail-label">月額報酬（税抜）</div><div class="detail-value">${editing ? inp('ed-sales', c?.monthlySales, 'number', '50000') : (c.monthlySales || 0).toLocaleString() + '円'}</div></div>
          <div class="detail-row"><div class="detail-label">年1申告報酬（税抜）</div><div class="detail-value">${editing ? inp('ed-annualfee', c?.annualFee, 'number', '150000') : (c?.annualFee || 0).toLocaleString() + '円'}</div></div>
          <div class="detail-row"><div class="detail-label">消費税申告報酬（税抜）</div><div class="detail-value">${editing ? inp('ed-consumptionTaxFee', c?.consumptionTaxFee, 'number', '50000') : (c?.consumptionTaxFee || 0).toLocaleString() + '円'}</div></div>
          <div class="detail-row"><div class="detail-label">消費税申告頻度</div><div class="detail-value">${editing ? `<select id="ed-consumptionTaxFreq" class="inline-edit-input"><option value="年1回" ${c?.consumptionTaxFreq === '年1回' ? 'selected' : ''}>年1回</option><option value="四半期" ${c?.consumptionTaxFreq === '四半期' ? 'selected' : ''}>四半期</option><option value="毎月" ${c?.consumptionTaxFreq === '毎月' ? 'selected' : ''}>毎月</option><option value="なし" ${c?.consumptionTaxFreq === 'なし' || !c?.consumptionTaxFreq ? 'selected' : ''}>なし</option></select>` : val(c?.consumptionTaxFreq, 'なし')}</div></div>
          <div class="detail-row"><div class="detail-label">SPOT報酬</div><div class="detail-value">${editing ? spotFeesEditHtml : spotFeesViewHtml}</div></div>
          <div class="detail-row"><div class="detail-label">住所</div><div class="detail-value">${editing ? inp('ed-address', c?.address, 'text', '例: 東京都千代田区大手町1-1-1') : val(c.address)}</div></div>
          <div class="detail-row"><div class="detail-label">電話番号</div><div class="detail-value">${editing ? inp('ed-tel', c?.tel, 'text', '例: 03-1234-5678') : val(c.tel)}</div></div>
          <div class="detail-row"><div class="detail-label">代表者</div><div class="detail-value">${editing ? inp('ed-representative', c?.representative, 'text', '例: 山本 太郎') : val(c?.representative)}</div></div>
          <div class="detail-row"><div class="detail-label">管轄税務署</div><div class="detail-value">${editing ? inp('ed-taxoffice', c?.taxOffice, 'text', '例: 千代田税務署') : val(c.taxOffice)}</div></div>
          <div class="detail-row"><div class="detail-label">契約終了日</div><div class="detail-value">${editing ? inp('ed-contractEndDate', c?.contractEndDate, 'date') : val(c?.contractEndDate ? formatDate(c.contractEndDate) : '')}</div></div>
          ${!editing && c?.memo ? `<div class="detail-row"><div class="detail-label">備考</div><div class="detail-value">${c.memo}</div></div>` : ''}

          ${!isNew ? `
          <div class="detail-section-title">関連顧客</div>
          <div class="detail-row"><div class="detail-label">関連顧客</div><div class="detail-value">${editing ? relatedClientsEditHtml : relatedClientsViewHtml}</div></div>
          ` : ''}

          <div class="detail-section-title">担当者</div>
          <div class="detail-row"><div class="detail-label">担当税理士</div><div class="detail-value">${editing ? inp('ed-mgr', '', 'select-staff') : val(mgr?.name)}</div></div>
          <div class="detail-row"><div class="detail-label">主担当</div><div class="detail-value">${editing ? inp('ed-main', '', 'select-staff') : val(main?.name)}</div></div>
          <div class="detail-row"><div class="detail-label">副担当</div><div class="detail-value">${editing ? inp('ed-sub', '', 'select-staff') : val(sub?.name)}</div></div>
        </div>

        <div id="ctab-tax" style="display:none;">
          <div class="detail-section-title">税務情報</div>
          <div class="detail-row"><div class="detail-label">日税コード</div><div class="detail-value">${editing ? inp('ed-nichizeiCode', c?.nichizeiCode, 'text', '例: NT-001234') : val(c?.nichizeiCode)}</div></div>
          <div class="detail-row"><div class="detail-label">管理表No</div><div class="detail-value">${editing ? inp('ed-managementNo', c?.managementNo, 'text', '例: M-0450') : val(c?.managementNo)}</div></div>
          <div class="detail-row"><div class="detail-label">e-Tax利用者識別番号</div><div class="detail-value">${editing ? inp('ed-etaxId', c?.etaxId, 'text', '例: 0012345678901234') : val(c?.etaxId)}</div></div>
          <div class="detail-row"><div class="detail-label">eLTAX利用者ID</div><div class="detail-value">${editing ? inp('ed-eltaxId', c?.eltaxId, 'text', '例: LT001234') : val(c?.eltaxId)}</div></div>

          <div class="detail-section-title">納付情報</div>
          <div class="detail-row"><div class="detail-label">ダイレクト納付</div><div class="detail-value">${editing ? `<select id="ed-directDebit" class="inline-edit-input"><option value="true" ${c?.paymentInfo?.directDebit ? 'selected' : ''}>設定済み</option><option value="false" ${!c?.paymentInfo?.directDebit ? 'selected' : ''}>未設定</option></select>` : (c?.paymentInfo?.directDebit ? '<span style="color:var(--success)">設定済み</span>' : '<span style="color:var(--gray-400)">未設定</span>')}</div></div>
          <div class="detail-row"><div class="detail-label">ダイレクト納付書類依頼状況</div><div class="detail-value">${editing ? inp('ed-directDebitStatus', c?.directDebitStatus, 'text', '例: 設定済み / 依頼中 / 未依頼') : val(c?.directDebitStatus)}</div></div>
          <div class="detail-row"><div class="detail-label">振替口座</div><div class="detail-value">${editing ? inp('ed-transferAccount', c?.paymentInfo?.transferAccount, 'text', '例: 三井住友銀行 大手町支店') : val(c?.paymentInfo?.transferAccount)}</div></div>
          <div class="detail-row"><div class="detail-label">納付備考</div><div class="detail-value">${editing ? inp('ed-paymentRemarks', c?.paymentInfo?.remarks, 'textarea', '納付に関する備考') : val(c?.paymentInfo?.remarks)}</div></div>
        </div>

        <div id="ctab-contact" style="display:none;">
          <div class="detail-section-title">連絡先</div>
          <div class="detail-row"><div class="detail-label">メールアドレス</div><div class="detail-value">${editing ? inp('ed-email', c?.email, 'text', '例: info@example.com') : val(c?.email)}</div></div>
          <div class="detail-row"><div class="detail-label">シティネーム</div><div class="detail-value">${editing ? inp('ed-cityName', c?.cityName, 'text', '例: やまもとたろう') : val(c?.cityName)}</div></div>
          <div class="detail-row"><div class="detail-label">シティURL</div><div class="detail-value">${editing ? inp('ed-cityUrl', c?.cityUrl, 'text', 'https://libecity.com/user/...') : (c?.cityUrl ? `<a href="${escapeHtml(c.cityUrl)}" target="_blank">${escapeHtml(c.cityUrl)}</a>` : val(''))}</div></div>

          <div class="detail-section-title">Chatwork連携</div>
          <div class="detail-row"><div class="detail-label">CWアカウントID</div><div class="detail-value">${editing ? inp('ed-cwid', c?.cwAccountId, 'text', '例: 1234567') : val(c?.cwAccountId, '未設定')}</div></div>
        ${!editing ? `
          <div class="detail-row"><div class="detail-label">メンション</div><div class="detail-value">${c.cwAccountId ? '<code style="background:var(--gray-100);padding:2px 6px;border-radius:3px;font-size:12px;">[To:' + c.cwAccountId + ']' + c.name + 'さん</code>' : val('', '-')}</div></div>
        ` : ''}
        <div class="detail-row"><div class="detail-label">CWルームURL</div><div class="detail-value">${editing ? cwRoomUrlsEditHtml : cwRoomUrlsViewHtml}</div></div>

          <div class="detail-section-title">外部サービス</div>
          <div class="detail-row"><div class="detail-label">Dropbox</div><div class="detail-value">${editing ? inp('ed-dropboxPath', c?.dropboxPath, 'text', '例: /リベ税/顧客/顧客名') : (c?.dropboxPath ? `<a href="#" onclick="event.preventDefault();window.open('https://www.dropbox.com','_blank')">${escapeHtml(c.dropboxPath)}</a>` : val(''))}</div></div>

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
    </div>

    ${(!isNew && !editing) ? renderTaxScheduleCard(c) : ''}

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
                  <td>${renderStatusBadge(t.status)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><h3>報告書サマリー</h3><span style="font-size:11px;color:var(--gray-400);margin-left:8px;">AI自動生成（準備中）</span></div>
      <div class="card-body">
        ${renderReportSummaryCard(c)}
      </div>
    </div>
    <div style="text-align:right;">
      <button class="btn btn-danger" onclick="deleteClient('${c.id}')" style="background:var(--danger);color:#fff;border:none;">顧客を削除</button>
    </div>
    ` : ''}
  `;

  // タブ切り替え
  document.getElementById('client-detail-tabs')?.addEventListener('click', e => {
    const tab = e.target.dataset?.ctab;
    if (!tab) return;
    document.querySelectorAll('#client-detail-tabs .view-tab').forEach(b => b.classList.toggle('active', b.dataset.ctab === tab));
    ['basic', 'tax', 'contact'].forEach(t => {
      const el = document.getElementById('ctab-' + t);
      if (el) el.style.display = t === tab ? '' : 'none';
    });
  });

  // 編集モード: selectの値をセット（innerHTML後でないと反映されない）
  if (editing) {
    const setVal = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
    setVal('ed-type', c?.clientType || '法人');
    setVal('ed-fiscal', c?.fiscalMonth === 'personal' ? 'personal' : (c?.fiscalMonth || 3));
    setVal('ed-mgr', c?.mgrUserId || '');
    setVal('ed-main', c?.mainUserId || '');
    setVal('ed-sub', c?.subUserId || '');
  }
}

function saveClientInline(id) {
  const isNew = id === 'new';
  const name = getValTrim('ed-name');
  const clientType = getVal('ed-type', '法人');
  const fiscalRaw = getVal('ed-fiscal', '3');
  const fiscalMonth = fiscalRaw === 'personal' ? 'personal' : parseInt(fiscalRaw) || 3;
  const monthlySales = getValInt('ed-sales');
  const annualFee = getValInt('ed-annualfee');
  const address = getValTrim('ed-address');
  const tel = getValTrim('ed-tel');
  const representative = getValTrim('ed-representative');
  const industrySelect = getVal('ed-industry-select', '');
  const industry = industrySelect === '_other' ? getValTrim('ed-industry') : (industrySelect || getValTrim('ed-industry'));
  const taxOffice = getValTrim('ed-taxoffice');
  const mgrUserId = getVal('ed-mgr', '');
  const mainUserId = getVal('ed-main', '');
  const subUserId = getVal('ed-sub') || null;
  const cwAccountId = getValTrim('ed-cwid');
  // 新規フィールド
  const contractStatus = getVal('ed-contractStatus', '');
  const contractEndDate = getVal('ed-contractEndDate', '');
  const nichizeiCode = getValTrim('ed-nichizeiCode');
  const managementNo = getValTrim('ed-managementNo');
  const etaxId = getValTrim('ed-etaxId');
  const eltaxId = getValTrim('ed-eltaxId');
  const directDebitStatus = getValTrim('ed-directDebitStatus');
  const email = getValTrim('ed-email');
  const cityName = getValTrim('ed-cityName');
  const cityUrl = getValTrim('ed-cityUrl');
  const dropboxPath = getValTrim('ed-dropboxPath');
  const consumptionTaxFee = getValInt('ed-consumptionTaxFee');
  const consumptionTaxFreq = getVal('ed-consumptionTaxFreq', 'なし');
  const paymentInfo = {
    directDebit: getVal('ed-directDebit', 'false') === 'true',
    transferAccount: getValTrim('ed-transferAccount'),
    remarks: getValTrim('ed-paymentRemarks'),
  };

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
    const newId = generateId('c-', MOCK_DATA.clients);
    MOCK_DATA.clients.push({
      id: newId, clientCode: nextCode, name, clientType, fiscalMonth,
      isActive: true, mainUserId, subUserId, mgrUserId: mgrUserId || mainUserId,
      monthlySales, annualFee, spotFees: [], address, tel, industry, representative, taxOffice,
      memo: '', establishDate: '', cwAccountId, cwRoomUrls: [], relatedClientIds: [], customFieldValues,
      contractStatus, contractEndDate, nichizeiCode, managementNo, etaxId, eltaxId, directDebitStatus,
      email, cityName, cityUrl, dropboxPath, consumptionTaxFee, consumptionTaxFreq, paymentInfo,
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
      c.contractStatus = contractStatus; c.contractEndDate = contractEndDate;
      c.nichizeiCode = nichizeiCode; c.managementNo = managementNo;
      c.etaxId = etaxId; c.eltaxId = eltaxId; c.directDebitStatus = directDebitStatus;
      c.email = email; c.cityName = cityName; c.cityUrl = cityUrl;
      c.dropboxPath = dropboxPath; c.paymentInfo = paymentInfo;
      c.consumptionTaxFee = consumptionTaxFee; c.consumptionTaxFreq = consumptionTaxFreq;
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

  const mainFilter = document.getElementById('client-main-filter')?.value || '';
  const fiscalFilter = document.getElementById('client-fiscal-filter')?.value || '';

  let clients = MOCK_DATA.clients.filter(c => {
    if (search && !c.name.toLowerCase().includes(search) && !c.clientCode.includes(search)) return false;
    if (typeFilter && c.clientType !== typeFilter) return false;
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;
    if (mainFilter && c.mainUserId !== mainFilter) return false;
    if (fiscalFilter && String(c.fiscalMonth) !== fiscalFilter) return false;
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
  const customFields = (MOCK_DATA.customFields || []).slice().sort((a, b) => a.order - b.order);

  runCSVImport((obj) => {
    const existing = MOCK_DATA.clients.find(c => c.clientCode === obj.clientCode);
    if (existing) {
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
      if (!existing.customFieldValues) existing.customFieldValues = {};
      customFields.forEach(cf => {
        if (obj[cf.name] !== undefined && obj[cf.name] !== '') existing.customFieldValues[cf.id] = obj[cf.name];
      });
      return 'updated';
    } else {
      const newId = generateId('c-', MOCK_DATA.clients);
      const code = obj.clientCode || String(parseInt(MOCK_DATA.clients[MOCK_DATA.clients.length - 1].clientCode) + 1).padStart(6, '0');
      const cfv = {};
      customFields.forEach(cf => { if (obj[cf.name]) cfv[cf.id] = obj[cf.name]; });
      MOCK_DATA.clients.push({
        id: newId, clientCode: code, name: obj.name || '名称未設定',
        clientType: obj.clientType || '法人', fiscalMonth: parseInt(obj.fiscalMonth) || 3,
        isActive: true, mainUserId: MOCK_DATA.users[1]?.id || 'u-002', subUserId: null,
        mgrUserId: MOCK_DATA.users[1]?.id || 'u-002',
        monthlySales: parseInt(obj.monthlySales) || 0, annualFee: parseInt(obj.annualFee) || 0,
        spotFees: obj.spotFees ? (function(){ try { return JSON.parse(obj.spotFees); } catch(e) { return []; } })() : [],
        address: obj.address || '', tel: obj.tel || '', representative: obj.representative || '',
        industry: obj.industry || '', taxOffice: obj.taxOffice || '', memo: '', establishDate: '',
        cwAccountId: obj.cwAccountId || '', cwRoomUrls: [], relatedClientIds: [], customFieldValues: cfv,
      });
      return 'imported';
    }
  }, () => { if (currentPage === 'clients') navigateTo('clients'); });
}

function renderReportSummaryCard(c) {
  const clientReports = MOCK_DATA.reports.filter(r => r.clientName === c.name);
  if (clientReports.length === 0) return '<div style="text-align:center;color:var(--gray-400);padding:16px;">この顧客の報告書はまだありません</div>';
  const sorted = [...clientReports].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const cardStyle = 'background:#fff;padding:10px;border-radius:6px;border:1px dashed var(--gray-300);';
  return `
    <div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="font-size:18px;">🤖</span>
        <span style="font-size:13px;font-weight:600;color:var(--gray-600);">AIによる顧客状況サマリー</span>
        <span style="font-size:11px;color:var(--gray-400);margin-left:auto;">今後実装予定</span>
      </div>
      <div style="color:var(--gray-400);font-size:13px;line-height:1.8;">
        この機能では、${escapeHtml(c.name)}に関する全ての業務報告書（${clientReports.length}件）をAIが分析し、<br>
        以下の情報を自動で集約・要約します：
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0;">
          <div style="${cardStyle}"><div style="font-weight:600;color:var(--gray-500);margin-bottom:4px;">📋 対応履歴の要約</div><div style="font-size:12px;color:var(--gray-400);">直近の対応内容・経緯を時系列で要約</div></div>
          <div style="${cardStyle}"><div style="font-weight:600;color:var(--gray-500);margin-bottom:4px;">⚠️ 未解決事項</div><div style="font-size:12px;color:var(--gray-400);">確認待ち・保留中の事項を自動抽出</div></div>
          <div style="${cardStyle}"><div style="font-weight:600;color:var(--gray-500);margin-bottom:4px;">📊 業務傾向</div><div style="font-size:12px;color:var(--gray-400);">月次・決算・確定申告等の業務バランス</div></div>
          <div style="${cardStyle}"><div style="font-weight:600;color:var(--gray-500);margin-bottom:4px;">💡 次のアクション</div><div style="font-size:12px;color:var(--gray-400);">報告書から抽出した次回対応事項</div></div>
        </div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--gray-400);">関連報告書: ${clientReports.length}件（直近: ${formatDate(sorted[0]?.createdAt)}）</div>
  `;
}

// ── 顧客詳細: 納付スケジュールカード ──
function renderTaxScheduleCard(client) {
  if (!client || !client.fiscalMonth) return '';

  const settings = MOCK_DATA.taxAlertSettings;
  if (!settings || !settings.enabled) return '';

  const now = new Date();
  const currentMonth = parseInt(now.toLocaleDateString('en-US', { timeZone: 'Asia/Tokyo', month: 'numeric' }));
  const leadMonths = settings.leadMonths || 0;

  const deadlines = getTaxDeadlines(client.fiscalMonth);

  const rows = deadlines.map(function(d) {
    if (!settings.types[d.type]) return '';

    let statusLabel = '対応不要';
    let rowStyle = '';
    for (var i = 0; i <= leadMonths; i++) {
      const checkMonth = ((currentMonth - 1 + i) % 12) + 1;
      if (d.deadlineMonth === checkMonth) {
        if (i === 0) {
          statusLabel = '今月対応';
          rowStyle = 'background:var(--danger-light);';
        } else {
          statusLabel = '来月対応';
          rowStyle = 'background:var(--warning-light);';
        }
        break;
      }
    }

    const typeColor = d.type === 'settlement' ? 'var(--primary)' : (d.type === 'interimPayment' ? 'var(--danger)' : 'var(--warning)');

    return `<tr style="${rowStyle}">
      <td><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:500;background:${typeColor};color:#fff;">${escapeHtml(d.label)}</span></td>
      <td>${d.deadlineMonth}月</td>
      <td>${escapeHtml(statusLabel)}</td>
    </tr>`;
  }).join('');

  return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><h3>納付スケジュール</h3><span style="font-size:11px;color:var(--gray-400);margin-left:8px;">決算月: ${client.fiscalMonth}月</span></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>種別</th><th>期限月</th><th>ステータス</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

registerPage('clients', renderClients);
registerPage('client-detail', renderClientDetail);
