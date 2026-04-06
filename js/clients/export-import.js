// ===========================
// 顧客CSV出力・取り込み
// ===========================
function exportClientCSV() {
  let clients = getFilteredClients();

  const customFields = (MOCK_DATA.customFields || []).slice().sort((a, b) => a.order - b.order);
  const cfHeaders = customFields.map(cf => cf.name);
  const cfIds = customFields.map(cf => cf.id);

  const header = ['管理コード', '顧客名', '種別', '決算月', '郵便番号', '住所', '電話番号', 'メールアドレス', '代表者名', '業種', '管轄税務署', '月額報酬', '年1申告報酬', '契約ステータス', '消費税申告区分', 'インボイス登録', '月額記帳代行報酬', '記帳代行契約開始日', '記帳代行契約終了日', 'MF事業者番号', '委任登録', '日税登録', '引落口座カナ', '主担当コード', '副担当コード', 'CWアカウントID', ...cfHeaders];
  const rows = clients.map(c => {
    const cfv = c.customFieldValues || {};
    const mainUser = getAssigneeUser(c.id, 'main');
    const subUser = getAssigneeUser(c.id, 'sub');
    return [c.clientCode, c.name, c.clientType, c.fiscalMonth, c.postalCode || '', c.address || '', c.tel || '', c.email || '', c.representative || '', c.industry || '', c.taxOffice || '', c.monthlySales || 0, c.annualFee || 0, c.contractStatus || '', c.consumptionTaxCategory || '', c.invoiceRegistered || '', c.monthlyBookkeepingFee || 0, c.bookkeepingStartDate || '', c.bookkeepingEndDate || '', c.mfBusinessNo || '', c.delegationStatus || '', c.nichizeiRegistration || '', c.debitAccountKana || '', mainUser?.staffCode || '', subUser?.staffCode || '', c.cwAccountId || '', ...cfIds.map(id => cfv[id] || '')];
  });

  downloadCSV('顧客一覧.csv', header, rows);
}

// FB#41: 達人取込用CSVフォーマット出力
function exportTatsujinCSV() {
  const clients = MOCK_DATA.clients.filter(c => c.isActive);
  const header = [
    '顧客コード', '顧客名', '顧客名フリガナ', '法人個人区分',
    '代表者名', '郵便番号', '住所', '電話番号',
    '決算月', '業種', '管轄税務署',
    'e-Tax利用者識別番号', 'eLTAX利用者ID',
    '日税コード', '管理表No', 'メールアドレス',
  ];

  const rows = clients.map(c => [
    c.clientCode,
    c.name,
    '', // フリガナ（データなし）
    c.clientType === '法人' ? '1' : '2',
    c.representative || '',
    c.postalCode || '',
    c.address || '',
    c.tel || '',
    c.fiscalMonth === 'personal' ? '12' : String(c.fiscalMonth || ''),
    c.industry || '',
    c.taxOffice || '',
    c.etaxId || '',
    c.eltaxId || '',
    c.nichizeiCode || '',
    c.managementNo || '',
    c.email || '',
  ]);

  downloadCSV('顧客_達人取込.csv', header, rows);
}

function importClientCSV() {
  const customFields = (MOCK_DATA.customFields || []).slice().sort((a, b) => a.order - b.order);

  // 日本語ヘッダー→内部フィールド名マッピング
  const keyMap = {
    '管理コード': 'clientCode', '顧客名': 'name', '種別': 'clientType', '決算月': 'fiscalMonth',
    '郵便番号': 'postalCode', '住所': 'address', '電話番号': 'tel', 'メールアドレス': 'email',
    '代表者名': 'representative', '業種': 'industry', '管轄税務署': 'taxOffice',
    '月額報酬': 'monthlySales', '年1申告報酬': 'annualFee', '契約ステータス': 'contractStatus',
    '消費税申告区分': 'consumptionTaxCategory', 'インボイス登録': 'invoiceRegistered',
    '月額記帳代行報酬': 'monthlyBookkeepingFee', '記帳代行契約開始日': 'bookkeepingStartDate',
    '記帳代行契約終了日': 'bookkeepingEndDate', 'MF事業者番号': 'mfBusinessNo',
    '委任登録': 'delegationStatus', '日税登録': 'nichizeiRegistration', '引落口座カナ': 'debitAccountKana',
    '主担当コード': 'mainStaffCode', '副担当コード': 'subStaffCode', 'CWアカウントID': 'cwAccountId',
  };

  runCSVImport((rawObj) => {
    // 日本語ヘッダーを内部名に変換（英語ヘッダーも後方互換で対応）
    const obj = {};
    Object.entries(rawObj).forEach(([k, v]) => { obj[keyMap[k] || k] = v; });

    // 担当コード→UserID変換
    const findUserByCode = (code) => code ? MOCK_DATA.users.find(u => u.staffCode === code) : null;
    const mainUser = findUserByCode(obj.mainStaffCode);
    const subUser = findUserByCode(obj.subStaffCode);

    const existing = MOCK_DATA.clients.find(c => c.clientCode === obj.clientCode);
    if (existing) {
      if (obj.name) existing.name = obj.name;
      if (obj.clientType) existing.clientType = obj.clientType;
      if (obj.fiscalMonth) existing.fiscalMonth = parseInt(obj.fiscalMonth) || existing.fiscalMonth;
      if (obj.address !== undefined) existing.address = obj.address;
      if (obj.tel !== undefined) existing.tel = obj.tel;
      if (obj.email !== undefined) existing.email = obj.email;
      if (obj.representative !== undefined) existing.representative = obj.representative;
      if (obj.industry !== undefined) existing.industry = obj.industry;
      if (obj.taxOffice !== undefined) existing.taxOffice = obj.taxOffice;
      if (obj.monthlySales) existing.monthlySales = parseInt(obj.monthlySales) || existing.monthlySales;
      if (obj.annualFee) existing.annualFee = parseInt(obj.annualFee) || existing.annualFee;
      if (obj.contractStatus) existing.contractStatus = obj.contractStatus;
      if (obj.cwAccountId !== undefined) existing.cwAccountId = obj.cwAccountId;
      if (obj.postalCode !== undefined) existing.postalCode = obj.postalCode;
      if (obj.consumptionTaxCategory !== undefined) existing.consumptionTaxCategory = obj.consumptionTaxCategory;
      if (obj.invoiceRegistered !== undefined) existing.invoiceRegistered = obj.invoiceRegistered;
      if (obj.monthlyBookkeepingFee) existing.monthlyBookkeepingFee = parseInt(obj.monthlyBookkeepingFee) || existing.monthlyBookkeepingFee;
      if (obj.bookkeepingStartDate !== undefined) existing.bookkeepingStartDate = obj.bookkeepingStartDate;
      if (obj.bookkeepingEndDate !== undefined) existing.bookkeepingEndDate = obj.bookkeepingEndDate;
      if (obj.mfBusinessNo !== undefined) existing.mfBusinessNo = obj.mfBusinessNo;
      if (obj.delegationStatus !== undefined) existing.delegationStatus = obj.delegationStatus;
      if (obj.nichizeiRegistration !== undefined) existing.nichizeiRegistration = obj.nichizeiRegistration;
      if (obj.debitAccountKana !== undefined) existing.debitAccountKana = obj.debitAccountKana;
      if (mainUser) { existing.mainUserId = mainUser.id; upsertAssignment(existing.id, 'main', mainUser.id); }
      if (subUser) { existing.subUserId = subUser.id; upsertAssignment(existing.id, 'sub', subUser.id); }
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
        isActive: true, mainUserId: mainUser?.id || MOCK_DATA.users[1]?.id || 'u-002',
        subUserId: subUser?.id || null,
        mgrUserId: mainUser?.id || MOCK_DATA.users[1]?.id || 'u-002',
        monthlySales: parseInt(obj.monthlySales) || 0, annualFee: parseInt(obj.annualFee) || 0,
        spotFees: [], contractStatus: obj.contractStatus || '契約完了',
        address: obj.address || '', tel: obj.tel || '', email: obj.email || '',
        representative: obj.representative || '', debitAccountKana: obj.debitAccountKana || '',
        industry: obj.industry || '', taxOffice: obj.taxOffice || '', memo: '', establishDate: '',
        cwAccountId: obj.cwAccountId || '', cwRoomUrls: [], relatedClientIds: [], customFieldValues: cfv,
        postalCode: obj.postalCode || '', consumptionTaxCategory: obj.consumptionTaxCategory || '',
        invoiceRegistered: obj.invoiceRegistered || '', monthlyBookkeepingFee: parseInt(obj.monthlyBookkeepingFee) || 0,
        bookkeepingStartDate: obj.bookkeepingStartDate || '', bookkeepingEndDate: obj.bookkeepingEndDate || '',
        mfBusinessNo: obj.mfBusinessNo || '', delegationStatus: obj.delegationStatus || '',
        nichizeiRegistration: obj.nichizeiRegistration || '',
      });
      // clientAssignmentsにも追加
      const _mainId = mainUser?.id || MOCK_DATA.users[1]?.id || 'u-002';
      upsertAssignment(newId, 'main', _mainId);
      if (subUser?.id) upsertAssignment(newId, 'sub', subUser.id);
      upsertAssignment(newId, 'reviewer', _mainId);
      return 'imported';
    }
  }, () => { if (currentPage === 'clients') navigateTo('clients'); });
}

// FB#31: 契約書PDF取込→自動入力
function analyzeContractPdf(clientId) {
  const input = document.getElementById('contract-pdf-input-' + clientId);
  const resultEl = document.getElementById('contract-pdf-result-' + clientId);
  if (!input || !input.files || input.files.length === 0) {
    alert('PDFファイルを選択してください');
    return;
  }
  const file = input.files[0];
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    alert('PDFファイルのみ対応しています');
    return;
  }

  resultEl.innerHTML = '<div style="padding:12px;background:var(--gray-50);border-radius:6px;font-size:13px;color:var(--gray-500);">解析中...</div>';

  // PDFからテキスト抽出してAI解析（デモではFileReader + 簡易パース）
  const reader = new FileReader();
  reader.onload = function() {
    // PDFバイナリからテキスト部分を簡易抽出
    const bytes = new Uint8Array(reader.result);
    let text = '';
    for (let i = 0; i < bytes.length; i++) {
      const ch = bytes[i];
      if (ch >= 0x20 && ch < 0x7f) text += String.fromCharCode(ch);
    }

    // 簡易パターンマッチで情報抽出（デモ用）
    const extracted = {};
    const nameMatch = text.match(/(?:甲|委任者|委託者)[^A-Za-z]{0,20}?([\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+(?:株式会社|合同会社|有限会社|[^\s]{2,10}))/);
    const addrMatch = text.match(/((?:東京都|大阪府|北海道|(?:京都|神奈川|埼玉|千葉|[^\s]{2,3})(?:都|府|県))[^\n\r]{5,30})/);
    const telMatch = text.match(/(\d{2,4}[-\s]\d{2,4}[-\s]\d{3,4})/);
    const repMatch = text.match(/(?:代表|代表者|代表取締役)[^\S\n]*[：:]?\s*([\u4e00-\u9fff]{1,4}\s*[\u4e00-\u9fff]{1,4})/);
    const amountMatch = text.match(/(?:月額|顧問料|報酬)[^\d]{0,10}([\d,]+)\s*円/);

    if (nameMatch) extracted.name = nameMatch[1];
    if (addrMatch) extracted.address = addrMatch[1];
    if (telMatch) extracted.tel = telMatch[1];
    if (repMatch) extracted.representative = repMatch[1].trim();
    if (amountMatch) extracted.monthlySales = parseInt(amountMatch[1].replace(/,/g, ''));

    const keys = Object.keys(extracted);
    if (keys.length === 0) {
      resultEl.innerHTML = `
        <div style="padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;">
          <div style="font-weight:600;color:var(--danger);margin-bottom:4px;">自動抽出できませんでした</div>
          <div style="font-size:12px;color:var(--gray-500);">PDFの形式によっては抽出できない場合があります。手動で入力してください。</div>
        </div>`;
      return;
    }

    const labels = { name: '顧客名', address: '住所', tel: '電話番号', representative: '代表者', monthlySales: '月額報酬' };
    const previewRows = keys.map(k => `
      <tr>
        <td style="font-weight:500;">${labels[k] || k}</td>
        <td>${k === 'monthlySales' ? extracted[k].toLocaleString() + '円' : escapeHtml(String(extracted[k]))}</td>
        <td><label><input type="checkbox" class="pdf-apply-check" data-key="${k}" checked> 反映</label></td>
      </tr>
    `).join('');

    resultEl.innerHTML = `
      <div style="padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;">
        <div style="font-weight:600;color:var(--success);margin-bottom:8px;">解析結果（${keys.length}項目を抽出）</div>
        <table style="width:100%;font-size:13px;"><thead><tr><th>項目</th><th>抽出値</th><th>適用</th></tr></thead><tbody>${previewRows}</tbody></table>
        <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="applyContractPdfData('${clientId}')">チェック項目を反映</button>
      </div>`;

    // 抽出データを一時保存
    window._pdfExtracted = extracted;
  };
  reader.readAsArrayBuffer(file);
}

function applyContractPdfData(clientId) {
  const c = getClientById(clientId);
  if (!c || !window._pdfExtracted) return;
  const checks = document.querySelectorAll('.pdf-apply-check:checked');
  let applied = 0;
  checks.forEach(cb => {
    const key = cb.dataset.key;
    if (window._pdfExtracted[key] !== undefined) {
      c[key] = window._pdfExtracted[key];
      applied++;
    }
  });
  window._pdfExtracted = null;
  alert(`${applied}項目を反映しました`);
  navigateTo('client-detail', { id: clientId });
}

// FB#32: CW資料→Dropbox転送
function fetchCwFiles(clientId) {
  const c = getClientById(clientId);
  if (!c) return;
  const listEl = document.getElementById('cw-files-list-' + clientId);
  if (!listEl) return;

  // CWルームURLからルームIDを取得
  const rooms = c.cwRoomUrls || [];
  if (rooms.length === 0) {
    listEl.innerHTML = '<div style="color:var(--gray-400);font-size:13px;">CWルームが設定されていません。</div>';
    return;
  }

  listEl.innerHTML = '<div style="padding:8px;color:var(--gray-500);font-size:13px;">ファイル取得中...</div>';

  // CWルームURLからroom_idを抽出
  const roomIds = rooms.map(r => {
    const match = r.url.match(/rid(\d+)/);
    return match ? match[1] : null;
  }).filter(Boolean);

  if (roomIds.length === 0) {
    listEl.innerHTML = '<div style="color:var(--gray-400);font-size:13px;">ルームIDを取得できませんでした。</div>';
    return;
  }

  // デモデータ: 実環境ではCW API（MCP）経由で取得
  const demoFiles = [
    { id: 'f1', name: '決算資料_2025.pdf', uploadedBy: '山本 太郎', uploadedAt: '2026-03-15', size: '2.4MB' },
    { id: 'f2', name: '領収書_202603.zip', uploadedBy: '山本 太郎', uploadedAt: '2026-03-10', size: '15.8MB' },
    { id: 'f3', name: '給与台帳_2025.xlsx', uploadedBy: '鈴木 一郎', uploadedAt: '2026-02-28', size: '340KB' },
  ];

  const dropboxPath = c.dropboxPath || `/リベ税/顧客/${c.name}`;
  listEl.innerHTML = `
    <div style="margin-bottom:8px;font-size:12px;color:var(--gray-500);">転送先: <code style="background:var(--gray-100);padding:2px 6px;border-radius:3px;">${escapeHtml(dropboxPath)}</code></div>
    <div class="table-wrapper">
      <table style="font-size:13px;">
        <thead><tr><th><input type="checkbox" id="cw-file-all-${clientId}" onclick="toggleCwFileAll('${clientId}',this.checked)" checked></th><th>ファイル名</th><th>アップロード者</th><th>日付</th><th>サイズ</th></tr></thead>
        <tbody>
          ${demoFiles.map(f => `<tr>
            <td><input type="checkbox" class="cw-file-check-${clientId}" value="${f.id}" checked></td>
            <td>${escapeHtml(f.name)}</td>
            <td>${escapeHtml(f.uploadedBy)}</td>
            <td>${f.uploadedAt}</td>
            <td>${f.size}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;">
      <button class="btn btn-primary btn-sm" onclick="transferToDropbox('${clientId}')">選択ファイルをDropboxに転送</button>
    </div>
  `;
}

function toggleCwFileAll(clientId, checked) {
  document.querySelectorAll('.cw-file-check-' + clientId).forEach(cb => { cb.checked = checked; });
}

function transferToDropbox(clientId) {
  const c = getClientById(clientId);
  if (!c) return;
  const checked = document.querySelectorAll('.cw-file-check-' + clientId + ':checked');
  if (checked.length === 0) { alert('転送するファイルを選択してください'); return; }

  const dropboxPath = c.dropboxPath || `/リベ税/顧客/${c.name}`;

  // デモ: 実環境ではDropbox API経由でアップロード
  alert(`${checked.length}件のファイルを「${dropboxPath}」に転送しました（デモ）\n\n※ 実環境ではDropbox API連携が必要です`);
}
