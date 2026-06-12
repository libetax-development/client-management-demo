// ===========================
// スポット報酬台帳（案件管理） #439/#440 モック
// 既存「SPOT報酬」タブ（spot_entries=スタッフ按分・clients.spotFees）とは別概念。
// 正本: docs/research/20260611-issue439-441-spot-rewards-plan.md §2.5 確定仕様
// ===========================

// §2.5-1: billing_method 3値必須
const SPOT_LEDGER_BILLING = [
  { v: 'nichizei', label: '日税' },
  { v: 'invoice', label: '請求書' },
  { v: 'adjustment', label: '報酬調整用' },
];

// §2.5-3: category 8値 + 自由メモ
const SPOT_LEDGER_CATEGORIES = [
  '法人税申告', '消費税申告', '所得税申告', '年末調整',
  '記帳代行SPOT', '税務相談', '相続税申告', 'その他',
];

function spotLedgerBillingLabel(v) {
  return (SPOT_LEDGER_BILLING.find(b => b.v === v) || {}).label || v;
}

function initSpotLedgerData() {
  if (MOCK_DATA.spotRewards) return;
  MOCK_DATA.spotRewards = [
    { id: 'sr-001', clientId: 'c-001', occurredAt: '2026-03-05', amount: 100000, billing: 'nichizei', category: '法人税申告', description: '期限後申告対応', staffUserId: 'u-003', exportedAt: '2026-03-31', deletedAt: null },
    { id: 'sr-002', clientId: 'c-002', occurredAt: '2026-03-10', amount: 55000, billing: 'invoice', category: '年末調整', description: '年調追加作業', staffUserId: 'u-004', exportedAt: null, deletedAt: null },
    { id: 'sr-003', clientId: 'c-003', occurredAt: '2026-03-12', amount: 30000, billing: 'nichizei', category: '税務相談', description: '不動産譲渡の事前相談', staffUserId: 'u-005', exportedAt: null, deletedAt: null },
    { id: 'sr-004', clientId: 'c-004', occurredAt: '2026-03-12', amount: 30000, billing: 'nichizei', category: '税務相談', description: '株式譲渡の相談', staffUserId: 'u-005', exportedAt: null, deletedAt: null },
    { id: 'sr-005', clientId: 'c-005', occurredAt: '2026-03-18', amount: -20000, billing: 'adjustment', category: 'その他', description: '前月過大計上の調整', staffUserId: 'u-002', exportedAt: null, deletedAt: null },
    { id: 'sr-006', clientId: 'c-001', occurredAt: '2026-02-14', amount: 80000, billing: 'nichizei', category: '消費税申告', description: '', staffUserId: 'u-003', exportedAt: '2026-02-28', deletedAt: null },
    { id: 'sr-007', clientId: 'c-006', occurredAt: '2026-02-20', amount: 120000, billing: 'invoice', category: '相続税申告', description: '相続税申告（着手金）', staffUserId: 'u-006', exportedAt: null, deletedAt: null },
  ];
}

function getSpotLedgerRows() {
  initSpotLedgerData();
  return MOCK_DATA.spotRewards.filter(r => !r.deletedAt);
}

// ---------------------------
// 一覧ビュー
// ---------------------------
function renderSpotLedgerView() {
  initSpotLedgerData();
  const month = document.getElementById('rw-month-filter')?.value || '2026-03';
  const billingF = document.getElementById('sl-billing-filter')?.value || '';
  const categoryF = document.getElementById('sl-category-filter')?.value || '';
  const staffF = document.getElementById('sl-staff-filter')?.value || '';
  const pendingOnly = document.getElementById('sl-pending-only')?.checked || false;

  const title = document.getElementById('rw-table-title');
  title.textContent = 'スポット報酬台帳（案件管理）';

  // 台帳専用コントロール（初回のみ生成）
  const controls = document.getElementById('sl-controls');
  if (controls && !controls.dataset.ready) {
    const staffOpts = getActiveUsers().map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('');
    controls.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">
        <select class="filter-select" id="sl-billing-filter">
          <option value="">回収方法：すべて</option>
          ${SPOT_LEDGER_BILLING.map(b => `<option value="${b.v}">${b.label}</option>`).join('')}
        </select>
        <select class="filter-select" id="sl-category-filter">
          <option value="">カテゴリ：すべて</option>
          ${SPOT_LEDGER_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select class="filter-select" id="sl-staff-filter">
          <option value="">担当：すべて</option>
          ${staffOpts}
        </select>
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--gray-600);cursor:pointer;">
          <input type="checkbox" id="sl-pending-only"> 日税未出力のみ
        </label>
        <div class="spacer"></div>
        <button class="btn btn-csv btn-sm" onclick="exportSpotLedgerNichizeiCSV()">日税CSV出力</button>
        <button class="btn btn-primary btn-sm" onclick="openSpotLedgerModal()">+ スポット報酬を登録</button>
      </div>`;
    controls.dataset.ready = '1';
    ['sl-billing-filter', 'sl-category-filter', 'sl-staff-filter', 'sl-pending-only'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', renderSpotLedgerView);
    });
  }

  const rows = getSpotLedgerRows()
    .filter(r => r.occurredAt.slice(0, 7) === month)
    .filter(r => !billingF || r.billing === billingF)
    .filter(r => !categoryF || r.category === categoryF)
    .filter(r => !staffF || r.staffUserId === staffF)
    .filter(r => !pendingOnly || (r.billing === 'nichizei' && !r.exportedAt))
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const nichizeiPending = getSpotLedgerRows().filter(r => r.occurredAt.slice(0, 7) === month && r.billing === 'nichizei' && !r.exportedAt).length;
  document.getElementById('rw-summary').innerHTML = `
    ${buildStatCard('blue', '台帳合計（税抜）', total.toLocaleString(), '円')}
    ${buildStatCard('green', '件数', String(rows.length), '件')}
    ${buildStatCard(nichizeiPending > 0 ? 'orange' : 'green', '日税未出力', String(nichizeiPending), '件')}
  `;

  const billingBadge = (b) => {
    const cls = b === 'nichizei' ? 'status-todo' : b === 'invoice' ? 'status-done' : 'status-outline';
    return `<span class="status-badge ${cls}" style="font-size:11px;">${spotLedgerBillingLabel(b)}</span>`;
  };

  document.getElementById('rw-thead').innerHTML =
    '<tr><th>発生日</th><th>顧客名</th><th>カテゴリ</th><th>内容</th><th>金額（税抜）</th><th>回収方法</th><th>担当</th><th>日税出力</th><th></th></tr>';
  document.getElementById('rw-tbody').innerHTML = rows.length === 0
    ? '<tr><td colspan="9" style="text-align:center;color:var(--gray-400);">該当するスポット報酬はありません</td></tr>'
    : rows.map(r => {
        const client = getClientById(r.clientId);
        const staff = getUserById(r.staffUserId);
        const exportedCell = r.billing !== 'nichizei'
          ? '<span style="color:var(--gray-400);font-size:11px;">対象外</span>'
          : r.exportedAt
            ? `<span style="color:var(--success);font-size:11px;">✓ ${escapeHtml(r.exportedAt)}</span>`
            : '<span style="color:var(--warning);font-size:11px;">未出力</span>';
        return `<tr>
          <td>${escapeHtml(r.occurredAt)}</td>
          <td><strong>${escapeHtml(client?.name || '-')}</strong></td>
          <td>${escapeHtml(r.category)}</td>
          <td>${escapeHtml(r.description || '-')}</td>
          <td style="text-align:right;${r.amount < 0 ? 'color:var(--danger);' : ''}"><strong>${r.amount.toLocaleString()}円</strong></td>
          <td>${billingBadge(r.billing)}</td>
          <td>${escapeHtml(staff?.name || '-')}</td>
          <td>${exportedCell}</td>
          <td style="white-space:nowrap;">
            <button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="openSpotLedgerModal('${r.id}')">編集</button>
            <button class="btn btn-secondary btn-sm" style="font-size:11px;color:var(--danger);" onclick="deleteSpotLedgerEntry('${r.id}')">削除</button>
          </td>
        </tr>`;
      }).join('');
}

// ---------------------------
// 登録 / 編集ダイアログ
// ---------------------------
function openSpotLedgerModal(id) {
  initSpotLedgerData();
  const row = id ? MOCK_DATA.spotRewards.find(r => r.id === id) : null;
  const clientOpts = getActiveClients().map(c =>
    `<option value="${c.id}" ${row?.clientId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
  const staffOpts = getActiveUsers().map(u =>
    `<option value="${u.id}" ${row?.staffUserId === u.id ? 'selected' : ''}>${escapeHtml(u.name)}</option>`).join('');
  const billingOpts = SPOT_LEDGER_BILLING.map(b =>
    `<option value="${b.v}" ${row?.billing === b.v ? 'selected' : ''}>${b.label}</option>`).join('');
  const categoryOpts = SPOT_LEDGER_CATEGORIES.map(c =>
    `<option value="${c}" ${row?.category === c ? 'selected' : ''}>${c}</option>`).join('');

  const exportedNote = row?.exportedAt
    ? `<div style="background:var(--warning-bg,#fef3c7);border:1px solid var(--warning,#f59e0b);border-radius:6px;padding:8px 12px;font-size:12px;margin-bottom:12px;">⚠ この行は ${escapeHtml(row.exportedAt)} に日税CSVへ出力済みです。修正した場合は再提出の要否を確認してください。</div>`
    : '';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'spot-ledger-modal';
  modal.innerHTML = `
    <div class="modal modal-wide">
      <div class="modal-header">
        <h3>${row ? 'スポット報酬を編集' : 'スポット報酬を登録'}</h3>
        <button class="btn-icon" onclick="closeSpotLedgerModal()">&times;</button>
      </div>
      <div class="modal-body">
        ${exportedNote}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group"><label>顧客 <span style="color:var(--danger);">*</span></label>
            <select id="sl-f-client"><option value="">選択してください</option>${clientOpts}</select></div>
          <div class="form-group"><label>発生日 <span style="color:var(--danger);">*</span></label>
            <input type="date" id="sl-f-date" value="${row?.occurredAt || ''}"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group"><label>金額（税抜） <span style="color:var(--danger);">*</span></label>
            <input type="number" id="sl-f-amount" step="1" placeholder="100000" value="${row != null && row.amount != null ? row.amount : ''}">
            <div style="font-size:11px;color:var(--gray-400);margin-top:2px;">税抜で入力。報酬調整用はマイナス額も可</div></div>
          <div class="form-group"><label>回収方法 <span style="color:var(--danger);">*</span></label>
            <select id="sl-f-billing"><option value="">選択してください（必須）</option>${billingOpts}</select>
            <div style="font-size:11px;color:var(--gray-400);margin-top:2px;">「報酬調整用」は日税CSVの対象外</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group"><label>カテゴリ <span style="color:var(--danger);">*</span></label>
            <select id="sl-f-category"><option value="">選択してください</option>${categoryOpts}</select></div>
          <div class="form-group"><label>担当</label>
            <select id="sl-f-staff"><option value="">（未設定）</option>${staffOpts}</select></div>
        </div>
        <div class="form-group"><label>内容（自由メモ）</label>
          <input type="text" id="sl-f-desc" placeholder="例: 期限後申告対応" value="${escapeHtml(row?.description || '')}"></div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px;">
          <button class="btn btn-secondary" onclick="closeSpotLedgerModal()">キャンセル</button>
          <button class="btn btn-primary" onclick="saveSpotLedgerEntry('${row?.id || ''}')">${row ? '更新' : '登録'}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  if (row) document.getElementById('sl-f-client').value = row.clientId;
}

function closeSpotLedgerModal() {
  document.getElementById('spot-ledger-modal')?.remove();
}

function saveSpotLedgerEntry(editId) {
  const clientId = document.getElementById('sl-f-client')?.value;
  const occurredAt = document.getElementById('sl-f-date')?.value;
  const amountRaw = document.getElementById('sl-f-amount')?.value;
  const billing = document.getElementById('sl-f-billing')?.value;
  const category = document.getElementById('sl-f-category')?.value;
  const staffUserId = document.getElementById('sl-f-staff')?.value || null;
  const description = document.getElementById('sl-f-desc')?.value?.trim() || '';

  // §2.5-1/-3: 必須チェック（回収方法は空欄不可）
  const missing = [];
  if (!clientId) missing.push('顧客');
  if (!occurredAt) missing.push('発生日');
  if (amountRaw === '' || isNaN(parseInt(amountRaw, 10))) missing.push('金額');
  if (!billing) missing.push('回収方法');
  if (!category) missing.push('カテゴリ');
  if (missing.length > 0) {
    alert(`必須項目が未入力です: ${missing.join(' / ')}`);
    return;
  }
  const amount = parseInt(amountRaw, 10);

  // §2.5-6: UNIQUE 制約の代わりに UI 警告（同一 顧客×発生日×カテゴリ×金額）
  const dups = getSpotLedgerRows().filter(r =>
    r.id !== editId && r.clientId === clientId && r.occurredAt === occurredAt &&
    r.category === category && r.amount === amount);
  if (dups.length > 0) {
    const client = getClientById(clientId);
    const lines = dups.map(d => {
      const staff = getUserById(d.staffUserId);
      return `・${d.occurredAt} ${client?.name || ''} / ${d.category} / ${d.amount.toLocaleString()}円 / 担当:${staff?.name || '-'} / ${d.description || '(内容なし)'}`;
    }).join('\n');
    const ok = confirm(`⚠ 同じ内容の登録が既に ${dups.length} 件あります:\n\n${lines}\n\n重複登録の可能性があります。このまま登録しますか？`);
    if (!ok) return;
  }

  if (editId) {
    const row = MOCK_DATA.spotRewards.find(r => r.id === editId);
    if (row) Object.assign(row, { clientId, occurredAt, amount, billing, category, staffUserId, description });
  } else {
    MOCK_DATA.spotRewards.push({
      id: generateId('sr-', MOCK_DATA.spotRewards),
      clientId, occurredAt, amount, billing, category, staffUserId, description,
      exportedAt: null, deletedAt: null,
    });
  }
  closeSpotLedgerModal();
  renderSpotLedgerView();
}

function deleteSpotLedgerEntry(id) {
  const row = MOCK_DATA.spotRewards.find(r => r.id === id);
  if (!row) return;
  const client = getClientById(row.clientId);
  if (!confirm(`スポット報酬「${row.occurredAt} ${client?.name || ''} ${row.amount.toLocaleString()}円」を削除しますか？`)) return;
  row.deletedAt = new Date().toISOString();
  renderSpotLedgerView();
}

// ---------------------------
// 日税CSV出力（§2.5-1: nichizei のみ / §2.5-5: 税抜のまま）
// 列フォーマットは日税RPAサンプル待ち（仮: 日税コード/顧客名/発生日/カテゴリ/金額税抜/内容）
// ---------------------------
function exportSpotLedgerNichizeiCSV() {
  const month = document.getElementById('rw-month-filter')?.value || '2026-03';
  const all = getSpotLedgerRows().filter(r => r.occurredAt.slice(0, 7) === month && r.billing === 'nichizei');
  const pending = all.filter(r => !r.exportedAt);
  const exported = all.filter(r => r.exportedAt);

  if (all.length === 0) { alert(`${month} の日税対象（回収方法=日税）の行がありません`); return; }

  let target = pending;
  if (pending.length === 0) {
    const re = confirm(`${month} の日税対象 ${all.length} 件は全て出力済みです。\n再出力しますか？`);
    if (!re) return;
    target = all;
  } else if (exported.length > 0) {
    alert(`未出力 ${pending.length} 件を出力します（出力済み ${exported.length} 件はスキップ。再出力が必要な場合は全件出力済みの状態で実行してください）`);
  }

  const header = ['日税コード', '顧客名', '発生日', 'カテゴリ', '金額(税抜)', '内容'];
  const rows = target.map(r => {
    const c = getClientById(r.clientId);
    return [c?.nichizeiCode || '(未登録)', c?.name || '-', r.occurredAt, r.category, r.amount, r.description || ''];
  });
  downloadCSV(`日税スポット報酬_${month}.csv`, header, rows);

  // 出力成功後にスタンプ（本実装では Server Action で一括 UPDATE）
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  target.forEach(r => { r.exportedAt = today; });
  renderSpotLedgerView();
}
