// ===========================
// Issue #763 SPOT取込 差分確認モック
// 管理者だけが開ける入口は spot-ledger.js 側で制御する。
// ===========================

const SPOT_IMPORT_NEW_ROWS = [
  { id: 'sheet-201', clientId: 'c-008', occurredAt: '2026-08-02', amount: 70000, billing: 'invoice', category: '所得税申告', description: '準確定申告', staffUserId: 'u-005' },
  { id: 'sheet-202', clientId: 'c-009', occurredAt: '2026-08-06', amount: 55000, billing: 'nichizei', category: '消費税申告', description: '消費税還付申告', staffUserId: 'u-003' },
  { id: 'sheet-203', clientId: 'c-010', occurredAt: '2026-08-11', amount: 30000, billing: 'invoice', category: '税務相談', description: '補助金の税務相談', staffUserId: 'u-006' },
  { id: 'sheet-204', clientId: 'c-003', occurredAt: '2026-08-16', amount: 85000, billing: 'nichizei', category: '所得税申告', description: '譲渡所得申告', staffUserId: 'u-005' },
  { id: 'sheet-205', clientId: 'c-005', occurredAt: '2026-08-21', amount: -8000, billing: 'adjustment', category: 'その他', description: '報酬額の端数調整', staffUserId: 'u-006' },
  { id: 'sheet-206', clientId: 'c-004', occurredAt: '2026-08-26', amount: 48000, billing: 'invoice', category: '記帳代行SPOT', description: '追加記帳120仕訳', staffUserId: 'u-003' },
];

const SPOT_IMPORT_MATCH_IDS = [
  'sr-101', 'sr-102', 'sr-103', 'sr-104',
  'sr-105', 'sr-106', 'sr-107', 'sr-108',
];

const SPOT_IMPORT_CHANGE_ROWS = [
  { currentId: 'sr-109', sheet: { amount: 150000, billing: 'invoice', category: '法人税申告', description: '法人税申告一式' } },
  { currentId: 'sr-110', sheet: { amount: 50000, billing: 'nichizei', category: '消費税申告', description: '中間申告' } },
  { currentId: 'sr-111', sheet: { amount: 35000, billing: 'invoice', category: 'その他', description: '届出書作成' } },
];

const SPOT_IMPORT_SYSTEM_ONLY_IDS = ['sr-112', 'sr-113'];

let spotImportState = null;

function spotImportLedgerRow(id) {
  return MOCK_DATA.spotRewards.find(row => row.id === id);
}

function spotImportDisplayValue(field, value) {
  if (field === 'amount') return `${Number(value).toLocaleString()}円`;
  if (field === 'billing') return spotLedgerBillingLabel(value);
  return value || '—';
}

function spotImportRowCells(row, includeCheck, checked) {
  const client = getClientById(row.clientId);
  const staff = getUserById(row.staffUserId);
  return `
    ${includeCheck ? `<td class="spot-import-check-cell"><input type="checkbox" class="spot-import-new-check" value="${escapeHtml(row.id)}" ${checked ? 'checked' : ''} aria-label="${escapeHtml(client?.name || '')}を取り込む"></td>` : ''}
    <td>${escapeHtml(row.occurredAt)}</td>
    <td><strong>${escapeHtml(client?.name || '—')}</strong></td>
    <td>${escapeHtml(row.category)}</td>
    <td>${escapeHtml(row.description || '—')}</td>
    <td class="${row.amount < 0 ? 'spot-import-negative' : ''}">${row.amount.toLocaleString()}円</td>
    <td>${escapeHtml(spotLedgerBillingLabel(row.billing))}</td>
    <td>${escapeHtml(staff?.name || '—')}</td>`;
}

function spotImportSectionHeader(kind, title, count, help, actionHtml = '') {
  return `
    <div class="spot-import-section-header">
      <div>
        <span class="status-badge spot-import-badge-${kind}">${escapeHtml(title)} ${count}件</span>
        <span class="spot-import-section-help">${escapeHtml(help)}</span>
      </div>
      ${actionHtml}
    </div>`;
}

function openSpotImportModal() {
  initSpotLedgerData();
  if (MOCK_DATA.currentUser.role !== 'admin') return;
  closeSpotImportModal();
  spotImportState = { step: 1, month: '2026-08', loading: false, result: null };

  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'spot-import-modal';
  modal.innerHTML = `
    <div class="modal spot-import-modal" role="dialog" aria-modal="true" aria-labelledby="spot-import-title">
      <div class="modal-header">
        <div>
          <h3 id="spot-import-title">SPOT報酬をシートから取り込む</h3>
          <div class="spot-import-admin-note">管理者専用・Googleスプレッドシートとの突き合わせ</div>
        </div>
        <button class="btn-icon" onclick="closeSpotImportModal()" aria-label="閉じる">&times;</button>
      </div>
      <div class="spot-import-steps" id="spot-import-steps"></div>
      <div class="modal-body" id="spot-import-body"></div>
      <div class="modal-footer" id="spot-import-footer"></div>
    </div>`;
  document.body.appendChild(modal);
  renderSpotImportStep();
}

function closeSpotImportModal() {
  document.getElementById('spot-import-modal')?.remove();
}

function renderSpotImportSteps() {
  const labels = ['1. 対象月', '2. 差分確認', '3. 取込結果'];
  document.getElementById('spot-import-steps').innerHTML = labels.map((label, i) => {
    const n = i + 1;
    const cls = n === spotImportState.step ? 'active' : n < spotImportState.step ? 'done' : '';
    return `<div class="spot-import-step ${cls}">${n < spotImportState.step ? '✓ ' : ''}${label}</div>`;
  }).join('');
}

function renderSpotImportStep() {
  renderSpotImportSteps();
  if (spotImportState.step === 1) renderSpotImportMonthStep();
  if (spotImportState.step === 2) renderSpotImportDiffStep();
  if (spotImportState.step === 3) renderSpotImportResultStep();
}

function renderSpotImportMonthStep() {
  document.getElementById('spot-import-body').innerHTML = `
    <div class="spot-import-month-wrap ${spotImportState.loading ? 'is-loading' : ''}">
      <div class="spot-import-intro">
        シートとシステムのデータを比較してから、取り込む行を選べます。システムにだけあるデータは変更・削除されません。
      </div>
      <div class="form-group spot-import-month-field">
        <label for="spot-import-month">対象月</label>
        <input type="month" id="spot-import-month" value="${escapeHtml(spotImportState.month)}" min="2026-01" max="2026-12">
        <div class="spot-import-field-error" id="spot-import-month-error" role="alert"></div>
      </div>
      ${spotImportState.loading ? '<div class="spot-import-loading"><span class="spot-import-spinner"></span>シートを読み込み、差分を確認しています…</div>' : ''}
    </div>`;
  document.getElementById('spot-import-footer').innerHTML = `
    <button class="btn btn-secondary" onclick="closeSpotImportModal()" ${spotImportState.loading ? 'disabled' : ''}>キャンセル</button>
    <button class="btn btn-primary" id="spot-import-check-btn" onclick="checkSpotImportDiff()" ${spotImportState.loading ? 'disabled' : ''}>差分を確認</button>`;
}

function checkSpotImportDiff() {
  const monthInput = document.getElementById('spot-import-month');
  const month = monthInput?.value;
  if (!month) {
    document.getElementById('spot-import-month-error').textContent = '対象月を選んでください';
    monthInput?.focus();
    return;
  }
  spotImportState.month = month;
  spotImportState.loading = true;
  renderSpotImportStep();
  window.setTimeout(() => {
    if (!document.getElementById('spot-import-modal')) return;
    spotImportState.loading = false;
    spotImportState.step = 2;
    renderSpotImportStep();
  }, 450);
}

function renderSpotImportSummary() {
  return `<div class="spot-import-summary">
    ${buildStatCard('blue', '新規', SPOT_IMPORT_NEW_ROWS.length, '件・既定で取込')}
    ${buildStatCard('green', '一致', SPOT_IMPORT_MATCH_IDS.length, '件・処理なし')}
    ${buildStatCard('yellow', '変更', SPOT_IMPORT_CHANGE_ROWS.length, '件・要確認')}
    ${buildStatCard('red', 'システムのみ', SPOT_IMPORT_SYSTEM_ONLY_IDS.length, '件・保持')}
  </div>`;
}

function renderSpotImportNewSection() {
  const rows = SPOT_IMPORT_NEW_ROWS.map(row => `<tr>${spotImportRowCells(row, true, true)}</tr>`).join('');
  return `<section class="spot-import-section">
    ${spotImportSectionHeader('new', '新規', SPOT_IMPORT_NEW_ROWS.length, 'シートにのみある行です。既定で取り込みます。',
      '<button class="btn btn-secondary btn-sm" id="spot-import-new-toggle" onclick="toggleSpotImportNew()">すべて解除</button>')}
    <div class="spot-import-table-wrap"><table class="spot-import-table">
      <thead><tr><th>取込</th><th>発生日</th><th>顧客名</th><th>カテゴリ</th><th>備考</th><th>金額（税抜）</th><th>回収方法</th><th>担当</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>`;
}

function renderSpotImportChangeCard(change) {
  const current = spotImportLedgerRow(change.currentId);
  const sheet = { ...current, ...change.sheet };
  const fields = [
    ['amount', '金額（税抜）'],
    ['billing', '回収方法'],
    ['category', 'カテゴリ'],
    ['description', '備考'],
  ];
  const cells = fields.map(([field, label]) => {
    const changed = current[field] !== sheet[field];
    return `<tr class="${changed ? 'is-different' : ''}">
      <th>${label}${changed ? '<span class="spot-import-changed-label">変更</span>' : ''}</th>
      <td>${escapeHtml(spotImportDisplayValue(field, current[field]))}</td>
      <td>${escapeHtml(spotImportDisplayValue(field, sheet[field]))}</td>
    </tr>`;
  }).join('');
  const client = getClientById(current.clientId);
  return `<article class="spot-import-change-card">
    <label class="spot-import-change-title">
      <input type="checkbox" class="spot-import-change-check" value="${escapeHtml(current.id)}">
      <span><strong>${escapeHtml(client?.name || '—')}</strong><small>${escapeHtml(current.occurredAt)}・このデータ取り込む？</small></span>
    </label>
    <div class="spot-import-table-wrap"><table class="spot-import-compare-table">
      <thead><tr><th>項目</th><th>現在の値</th><th>シートの値</th></tr></thead>
      <tbody>${cells}</tbody>
    </table></div>
  </article>`;
}

function renderSpotImportChangeSection() {
  return `<section class="spot-import-section">
    ${spotImportSectionHeader('change', '変更', SPOT_IMPORT_CHANGE_ROWS.length, '違う項目を確認し、取り込む行だけ選んでください。',
      '<button class="btn btn-secondary btn-sm" id="spot-import-change-toggle" onclick="toggleSpotImportChanges()">すべて選択</button>')}
    <div class="spot-import-change-list">${SPOT_IMPORT_CHANGE_ROWS.map(renderSpotImportChangeCard).join('')}</div>
  </section>`;
}

function renderSpotImportMatchSection() {
  const previewRows = SPOT_IMPORT_MATCH_IDS.slice(0, 3).map(id => {
    const row = spotImportLedgerRow(id);
    return `<tr>${spotImportRowCells(row, false, false)}</tr>`;
  }).join('');
  return `<details class="spot-import-section spot-import-details">
    <summary>${spotImportSectionHeader('match', '一致', SPOT_IMPORT_MATCH_IDS.length, '内容が同じため、処理はありません。')}</summary>
    <div class="spot-import-table-wrap"><table class="spot-import-table">
      <thead><tr><th>発生日</th><th>顧客名</th><th>カテゴリ</th><th>備考</th><th>金額（税抜）</th><th>回収方法</th><th>担当</th></tr></thead>
      <tbody>${previewRows}</tbody>
    </table></div>
    <div class="spot-import-preview-note">先頭3件を表示しています（全${SPOT_IMPORT_MATCH_IDS.length}件）</div>
  </details>`;
}

function renderSpotImportSystemOnlySection() {
  const rows = SPOT_IMPORT_SYSTEM_ONLY_IDS.map(id => `<tr>${spotImportRowCells(spotImportLedgerRow(id), false, false)}</tr>`).join('');
  return `<section class="spot-import-section spot-import-protected">
    ${spotImportSectionHeader('protected', 'システムのみ', SPOT_IMPORT_SYSTEM_ONLY_IDS.length, '画面から入力されたデータです。')}
    <div class="spot-import-protected-note">🔒 この行は取込の対象外です（画面から入力されたデータのため保持されます）</div>
    <div class="spot-import-table-wrap"><table class="spot-import-table">
      <thead><tr><th>発生日</th><th>顧客名</th><th>カテゴリ</th><th>備考</th><th>金額（税抜）</th><th>回収方法</th><th>担当</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>`;
}

function renderSpotImportDiffStep() {
  document.getElementById('spot-import-body').innerHTML = `
    <div class="spot-import-diff-intro"><strong>${escapeHtml(spotImportState.month)}</strong> の差分です。新規は選択済み、変更は未選択です。</div>
    ${renderSpotImportSummary()}
    ${renderSpotImportNewSection()}
    ${renderSpotImportChangeSection()}
    ${renderSpotImportMatchSection()}
    ${renderSpotImportSystemOnlySection()}`;
  document.getElementById('spot-import-footer').innerHTML = `
    <button class="btn btn-secondary" onclick="spotImportBackToMonth()">戻る</button>
    <span class="spot-import-selection-count" id="spot-import-selection-count"></span>
    <button class="btn btn-primary" onclick="executeSpotImport()">選んだ行を取り込む</button>`;
  document.querySelectorAll('.spot-import-new-check,.spot-import-change-check').forEach(input => {
    input.addEventListener('change', updateSpotImportSelection);
  });
  updateSpotImportSelection();
}

function spotImportBackToMonth() {
  spotImportState.step = 1;
  renderSpotImportStep();
}

function toggleSpotImportNew() {
  const checks = [...document.querySelectorAll('.spot-import-new-check')];
  const selectAll = checks.some(check => !check.checked);
  checks.forEach(check => { check.checked = selectAll; });
  updateSpotImportSelection();
}

function toggleSpotImportChanges() {
  const checks = [...document.querySelectorAll('.spot-import-change-check')];
  const selectAll = checks.some(check => !check.checked);
  checks.forEach(check => { check.checked = selectAll; });
  updateSpotImportSelection();
}

function updateSpotImportSelection() {
  const newChecks = [...document.querySelectorAll('.spot-import-new-check')];
  const changeChecks = [...document.querySelectorAll('.spot-import-change-check')];
  const newCount = newChecks.filter(check => check.checked).length;
  const changeCount = changeChecks.filter(check => check.checked).length;
  document.getElementById('spot-import-selection-count').textContent = `選択中：新規 ${newCount}件・変更 ${changeCount}件`;
  document.getElementById('spot-import-new-toggle').textContent = newCount === newChecks.length ? 'すべて解除' : 'すべて選択';
  document.getElementById('spot-import-change-toggle').textContent = changeCount === changeChecks.length ? 'すべて解除' : 'すべて選択';
}

function executeSpotImport() {
  const newIds = [...document.querySelectorAll('.spot-import-new-check:checked')].map(input => input.value);
  const changeIds = [...document.querySelectorAll('.spot-import-change-check:checked')].map(input => input.value);

  SPOT_IMPORT_NEW_ROWS.filter(row => newIds.includes(row.id)).forEach(row => {
    if (MOCK_DATA.spotRewards.some(existing => existing.importSourceId === row.id)) return;
    MOCK_DATA.spotRewards.push({
      ...row, id: generateId('sr-', MOCK_DATA.spotRewards), importSourceId: row.id,
      exportedAt: null, deletedAt: null,
    });
  });
  SPOT_IMPORT_CHANGE_ROWS.filter(change => changeIds.includes(change.currentId)).forEach(change => {
    Object.assign(spotImportLedgerRow(change.currentId), change.sheet);
  });

  spotImportState.result = {
    newCount: newIds.length,
    changeCount: changeIds.length,
    skipCount: SPOT_IMPORT_NEW_ROWS.length + SPOT_IMPORT_CHANGE_ROWS.length - newIds.length - changeIds.length,
  };
  spotImportState.step = 3;
  renderSpotImportStep();
}

function renderSpotImportResultStep() {
  const result = spotImportState.result;
  const protectedRows = SPOT_IMPORT_SYSTEM_ONLY_IDS.map(id => {
    const row = spotImportLedgerRow(id);
    return `<li><strong>${escapeHtml(getClientById(row.clientId)?.name || '—')}</strong><span>${escapeHtml(row.occurredAt)}・${row.amount.toLocaleString()}円・${escapeHtml(row.description)}</span></li>`;
  }).join('');
  document.getElementById('spot-import-body').innerHTML = `
    <div class="spot-import-result">
      <div class="spot-import-result-icon">✓</div>
      <h4>取込が完了しました</h4>
      <p>${escapeHtml(spotImportState.month)} の選択した行を台帳へ反映しました。</p>
      <div class="spot-import-result-summary">
        <div><strong>${result.newCount}</strong><span>新規取込</span></div>
        <div><strong>${result.changeCount}</strong><span>変更取込</span></div>
        <div><strong>${result.skipCount}</strong><span>スキップ</span></div>
      </div>
      <div class="spot-import-retained">
        <strong>システムのみ ${SPOT_IMPORT_SYSTEM_ONLY_IDS.length}件はそのまま保持されています</strong>
        <ul>${protectedRows}</ul>
      </div>
    </div>`;
  document.getElementById('spot-import-footer').innerHTML = `
    <button class="btn btn-primary" onclick="finishSpotImport()">台帳に戻る</button>`;
}

function finishSpotImport() {
  closeSpotImportModal();
  renderSpotLedgerView();
}
