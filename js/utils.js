// ===========================
// ユーティリティ関数
// ===========================

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

// ID生成
function generateId(prefix, collection) {
  return prefix + String(collection.length + 1).padStart(3, '0');
}

// 空状態表示
function renderEmptyState(message, icon) {
  return `<div class="empty-state"><div class="icon">${icon || '?'}</div><p>${message}</p></div>`;
}

// テーブル空行
function renderEmptyRow(colspan, message) {
  return `<tr><td colspan="${colspan}" style="text-align:center;color:var(--gray-400);padding:24px;">${message || '該当するデータがありません'}</td></tr>`;
}

// ステータスバッジHTML
function renderStatusBadge(status) {
  return `<span class="status-badge ${getStatusClass(status)}">${status}</span>`;
}

// 種別バッジHTML
function renderTypeBadge(clientType) {
  return `<span class="type-badge ${clientType === '法人' ? 'type-corp' : 'type-individual'}">${clientType}</span>`;
}

// selectのoptions生成
function buildUserOptions(filter) {
  let users = MOCK_DATA.users.filter(u => u.isActive);
  if (filter === 'staff') users = users.filter(u => u.role !== 'admin');
  if (filter === 'leaders') users = users.filter(u => u.role === 'admin' || u.role === 'team_leader');
  return users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}

function buildClientOptions(activeOnly) {
  const clients = activeOnly ? MOCK_DATA.clients.filter(c => c.isActive) : MOCK_DATA.clients;
  return clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
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

// フィルタ要素へのイベントバインド
function bindFilters(ids, handler) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const event = el.tagName === 'SELECT' ? 'change' : el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(event, handler);
  });
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
