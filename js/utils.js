// ===========================
// ユーティリティ関数
// ===========================

// --- 担当者アサインメント（多対多）ヘルパー ---
// フラットフィールド → clientAssignments配列を初期化
function initClientAssignments() {
  if (MOCK_DATA.clientAssignments.length > 0) return;
  var idx = 0;
  var roleMap = [
    { flat: 'mainUserId', role: 'main' },
    { flat: 'subUserId', role: 'sub' },
    { flat: 'mgrUserId', role: 'reviewer' },
    { flat: 'bookkeeperId', role: 'bookkeeping_main' },
    { flat: 'bookkeepingSubId', role: 'bookkeeping_sub' },
  ];
  MOCK_DATA.clients.forEach(function(c) {
    roleMap.forEach(function(rm) {
      if (c[rm.flat]) {
        idx++;
        MOCK_DATA.clientAssignments.push({
          id: 'ca-' + String(idx).padStart(3, '0'),
          clientId: c.id,
          userId: c[rm.flat],
          role: rm.role,
          startDate: c.contractStartDate || '2024-04-01',
          endDate: null,
        });
      }
    });
  });
}

// 指定クライアント・ロールの現在の担当者ユーザーIDを取得
function getAssigneeUserId(clientId, role) {
  var a = MOCK_DATA.clientAssignments.find(function(x) {
    return x.clientId === clientId && x.role === role && !x.endDate;
  });
  return a ? a.userId : null;
}

// 指定クライアント・ロールの現在の担当者ユーザーオブジェクトを取得
function getAssigneeUser(clientId, role) {
  var uid = getAssigneeUserId(clientId, role);
  return uid ? getUserById(uid) : null;
}

// 指定クライアントの全現在担当者を取得
function getClientAssignments(clientId) {
  return MOCK_DATA.clientAssignments.filter(function(x) {
    return x.clientId === clientId && !x.endDate;
  });
}

// 担当者を変更（旧担当クローズ→新担当追加）
function upsertAssignment(clientId, role, newUserId) {
  // 現在のアクティブアサインメントを確認
  var current = MOCK_DATA.clientAssignments.find(function(a) {
    return a.clientId === clientId && a.role === role && !a.endDate;
  });
  // 同一担当者ならスキップ（履歴を無駄に増やさない）
  if (current && current.userId === newUserId) return;
  var today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  // 旧担当をクローズ
  if (current) {
    current.endDate = today;
  }
  // 新担当を追加
  if (newUserId) {
    var maxId = MOCK_DATA.clientAssignments.reduce(function(m, a) {
      var n = parseInt(a.id.replace('ca-', ''));
      return n > m ? n : m;
    }, 0);
    MOCK_DATA.clientAssignments.push({
      id: 'ca-' + String(maxId + 1).padStart(3, '0'),
      clientId: clientId,
      userId: newUserId,
      role: role,
      startDate: today,
      endDate: null,
    });
  }
  // フラットフィールドも同期（後方互換）
  var c = getClientById(clientId);
  if (c) {
    var flatMap = { main: 'mainUserId', sub: 'subUserId', reviewer: 'mgrUserId', bookkeeping_main: 'bookkeeperId', bookkeeping_sub: 'bookkeepingSubId' };
    if (flatMap[role]) c[flatMap[role]] = newUserId || null;
  }
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

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ── UI共通ヘルパー ──

// ID生成（削除後の重複を防ぐため最大ID+1方式）
function generateId(prefix, collection) {
  let max = 0;
  collection.forEach(function(item) {
    if (item.id && item.id.startsWith(prefix)) {
      var num = parseInt(item.id.slice(prefix.length), 10);
      if (num > max) max = num;
    }
  });
  return prefix + String(max + 1).padStart(3, '0');
}

// 次の顧客コードを生成
function generateClientCode() {
  let max = 0;
  MOCK_DATA.clients.forEach(function(c) {
    var num = parseInt(c.clientCode, 10);
    if (num > max) max = num;
  });
  return String(max + 1).padStart(6, '0');
}

// 空状態表示
function renderEmptyState(message, icon) {
  return `<div class="empty-state"><div class="icon">${icon || '?'}</div><p>${message}</p></div>`;
}

// テーブル空行
function renderEmptyRow(colspan, message) {
  return `<tr><td colspan="${colspan}" style="text-align:center;color:var(--gray-400);padding:24px;">${message || '該当するデータがありません'}</td></tr>`;
}

// ステータス値 → CSSクラス変換
function getStatusClass(status) {
  if (status === '未着手') return 'status-todo';
  if (status === '進行中') return 'status-progress';
  if (status === '完了') return 'status-done';
  if (status === '差戻し') return 'status-returned';
  return 'status-outline';
}

// ステータスバッジHTML
function renderStatusBadge(status) {
  return `<span class="status-badge ${getStatusClass(status)}">${status}</span>`;
}

// 種別バッジHTML
function renderTypeBadge(clientType) {
  return `<span class="type-badge ${clientType === '法人' ? 'type-corp' : 'type-individual'}">${clientType}</span>`;
}

// 契約ステータスバッジHTML
function renderContractStatusBadge(status) {
  const cls = status === '契約完了' || status === '契約中' ? 'status-badge status-done'
    : status === '見込み' ? 'status-badge status-todo'
    : 'status-badge status-outline';
  return `<span class="${cls}" style="font-size:11px;">${status}</span>`;
}

// selectのoptions生成
function buildUserOptions(filter) {
  let users = getActiveUsers();
  if (filter === 'staff') users = users.filter(u => u.role !== 'admin');
  if (filter === 'leaders') users = users.filter(u => u.role === 'admin' || u.role === 'team_leader');
  return users.map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('');
}

function buildClientOptions(activeOnly) {
  const clients = activeOnly ? getActiveClients() : MOCK_DATA.clients;
  return clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

// フォーム値取得ヘルパー
function getVal(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback !== undefined ? fallback : '';
  return el.value;
}

function getValTrim(id) {
  return (getVal(id) || '').trim();
}

function getValInt(id, fallback) {
  return parseInt(getVal(id)) || (fallback !== undefined ? fallback : 0);
}

// バリデーション
function requireField(id, message) {
  const val = getValTrim(id);
  if (!val) { alert(message); return null; }
  return val;
}

// テーブル本体レンダリング
function renderTableBody(tbodyId, items, rowRenderer, emptyColspan, emptyMessage) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  if (items.length === 0) {
    tbody.innerHTML = renderEmptyRow(emptyColspan, emptyMessage);
    return;
  }
  tbody.innerHTML = items.map(rowRenderer).join('');
}

// 共通フィルタ関数
function filterByKeyword(items, keyword, fields) {
  if (!keyword) return items;
  const kw = keyword.toLowerCase();
  return items.filter(item => fields.some(f => {
    const val = typeof f === 'function' ? f(item) : (item[f] || '');
    return String(val).toLowerCase().includes(kw);
  }));
}
function filterByField(items, fieldName, value) {
  if (!value) return items;
  return items.filter(item => item[fieldName] === value);
}

// フィルタ要素へのイベントバインド
function bindFilters(ids, handler) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const event = el.tagName === 'SELECT' ? 'change' : el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(event, handler);
  });
}

// stat-card HTML生成
function buildStatCard(accent, label, value, sub, opts = {}) {
  const cls = ['stat-card', `accent-${accent}`,
    opts.clickable ? 'clickable' : '',
    opts.active ? 'stat-card-active' : ''
  ].filter(Boolean).join(' ');
  const onclick = opts.onclick ? ` onclick="${opts.onclick}"` : '';
  const style = opts.style ? ` style="${opts.style}"` : '';
  return `<div class="${cls}"${onclick}${style}><div class="stat-label">${label}</div><div class="stat-value"${opts.valueStyle ? ` style="${opts.valueStyle}"` : ''}>${value}</div><div class="stat-sub">${sub}</div></div>`;
}

// カスタムフィールド入力HTML生成
function buildCustomFieldInput(cf, value, extraClass) {
  const id = 'cf-val-' + cf.id;
  const cls = extraClass || '';
  const val = value || '';
  if (cf.type === 'textarea') return `<textarea id="${id}" class="${cls}" rows="2" style="width:100%;padding:8px;border:1px solid var(--gray-200);border-radius:6px;font-size:13px;resize:vertical;">${val}</textarea>`;
  if (cf.type === 'date') return `<input type="date" id="${id}" class="${cls}" value="${val}">`;
  if (cf.type === 'number') return `<input type="number" id="${id}" class="${cls}" value="${val}">`;
  return `<input type="text" id="${id}" class="${cls}" value="${val}">`;
}

// モーダル表示・非表示
function showModal(id) { document.getElementById(id).classList.add('show'); }
function hideModal(id) { document.getElementById(id).classList.remove('show'); }

// フォーム値一括セット { elementId: value, ... }
function setFormValues(map) {
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!val;
    else el.value = val != null ? val : '';
  });
}

// フォーム値一括リセット（指定IDの値を空にする）
function resetForm(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
}

// ── 納付期限計算ヘルパー ──

// 顧客の決算月から税務イベント一覧を返す
function getTaxDeadlines(fiscalMonth) {
  const deadlines = [];
  const addMonth = (base, offset) => ((base - 1 + offset) % 12) + 1;

  deadlines.push({ type: 'settlement', label: '決算申告', deadlineMonth: addMonth(fiscalMonth, 2) });
  deadlines.push({ type: 'interim1', label: '中間申告(1回目)', deadlineMonth: addMonth(fiscalMonth, 5) });
  deadlines.push({ type: 'interimPayment', label: '中間予定納付', deadlineMonth: addMonth(fiscalMonth, 8) });
  deadlines.push({ type: 'interim2', label: '中間申告(2回目)', deadlineMonth: addMonth(fiscalMonth, 11) });
  deadlines.push({ type: 'consumptionTaxReview', label: '翌期消費税検討', deadlineMonth: addMonth(fiscalMonth, 1) });

  return deadlines;
}

// 今月対応が必要な税務アラートを全顧客分返す
function getTaxAlerts() {
  const settings = MOCK_DATA.taxAlertSettings;
  if (!settings || !settings.enabled) return [];

  const now = new Date();
  // JST基準で現在月・日を取得
  const currentMonth = parseInt(now.toLocaleDateString('en-US', { timeZone: 'Asia/Tokyo', month: 'numeric' }));
  const currentDay = parseInt(now.toLocaleDateString('en-US', { timeZone: 'Asia/Tokyo', day: 'numeric' }));
  // 前月21日以降なら翌月分も表示
  const showNextMonth = currentDay >= 21;

  const alerts = [];
  getActiveClients().forEach(function(client) {
    const deadlines = getTaxDeadlines(client.fiscalMonth);
    deadlines.forEach(function(d) {
      if (!settings.types[d.type]) return;
      // 当月分は常に表示、翌月分は21日以降のみ表示
      const maxLead = showNextMonth ? settings.leadMonths : 0;
      for (var i = 0; i <= maxLead; i++) {
        const checkMonth = ((currentMonth - 1 + i) % 12) + 1;
        if (d.deadlineMonth === checkMonth) {
          alerts.push({
            clientId: client.id,
            clientName: client.name,
            clientCode: client.clientCode,
            fiscalMonth: client.fiscalMonth,
            type: d.type,
            label: d.label,
            deadlineMonth: d.deadlineMonth,
            isCurrentMonth: i === 0,
            monthsUntil: i,
          });
        }
      }
    });
  });

  // 当月を先に、その後来月の順
  alerts.sort(function(a, b) { return a.monthsUntil - b.monthsUntil || a.clientName.localeCompare(b.clientName); });
  return alerts;
}

// 税務イベント種別の色クラスを返す
function getTaxAlertColorClass(type) {
  if (type === 'settlement') return 'accent-blue';
  if (type === 'interim1' || type === 'interim2') return 'accent-yellow';
  if (type === 'interimPayment') return 'accent-red';
  if (type === 'consumptionTaxReview') return 'accent-green';
  return '';
}

// CSV取り込み共通フレームワーク
function runCSVImport(processRow, onComplete) {
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
        const result = processRow(obj);
        if (result === 'imported') imported++;
        else if (result === 'updated') updated++;
      }
      alert(`CSV取り込み完了\n新規: ${imported}件\n更新: ${updated}件`);
      if (onComplete) onComplete();
    } catch (err) {
      alert('CSVファイルの読み込みに失敗しました: ' + err.message);
    }
  };
  input.click();
}

// パスワードマスク切り替え（閲覧モード）
function togglePasswordMask(btn) {
  var span = btn.parentElement.querySelector('.pw-mask');
  if (!span) return;
  if (span.textContent === '••••••••') {
    var cid = span.getAttribute('data-cid');
    var field = span.getAttribute('data-field');
    var client = cid && field ? MOCK_DATA.clients.find(function(c) { return c.id === cid; }) : null;
    span.textContent = (client ? client[field] : '') || '';
    btn.textContent = '🔒';
    btn.title = 'マスクする';
  } else {
    span.textContent = '••••••••';
    btn.textContent = '👁';
    btn.title = '表示切替';
  }
}

// パスワードフィールド切り替え（編集モード）
function togglePasswordField(inputId, btn) {
  var field = document.getElementById(inputId);
  if (!field) return;
  if (field.type === 'password') {
    field.type = 'text';
    btn.textContent = '🔒';
    btn.title = 'マスクする';
  } else {
    field.type = 'password';
    btn.textContent = '👁';
    btn.title = '表示切替';
  }
}
