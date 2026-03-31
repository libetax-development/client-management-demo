// ===========================
// ビュー管理
// ===========================

// サンプルビューデータ
const MOCK_VIEWS = [
  {
    id: 'v-001', name: '3月決算 法人のみ', description: '3月決算の法人顧客を抽出',
    visibility: 'public', owner: 'ひろ', teamName: null,
    filters: { clientTypes: ['法人'], fiscalMonths: [3] },
    columns: ['顧客名', '種別', '決算月', '主担当', 'ステータス'],
    sorts: [{ label: '顧客名', direction: 'asc' }],
  },
  {
    id: 'v-002', name: '自分の担当先', description: '自分が主担当の顧客のみ表示',
    visibility: 'private', owner: 'ひろ', teamName: null,
    filters: { assignees: ['ひろ'] },
    columns: ['顧客名', '種別', '決算月', '月額報酬', 'ステータス'],
    sorts: [{ label: '月額報酬', direction: 'desc' }],
  },
  {
    id: 'v-003', name: '法人チーム共有', description: 'チームA共有の法人ビュー',
    visibility: 'team', owner: 'よしはる', teamName: 'チームA',
    filters: { clientTypes: ['法人'], isActive: true },
    columns: ['顧客名', '種別', '決算月', '主担当'],
    sorts: [],
  },
];

function renderViews(el) {
  const privateViews = MOCK_VIEWS.filter(v => v.visibility === 'private');
  const teamViews = MOCK_VIEWS.filter(v => v.visibility === 'team');
  const publicViews = MOCK_VIEWS.filter(v => v.visibility === 'public');

  el.innerHTML = `
    <div class="toolbar">
      <div class="spacer"></div>
      <button class="btn btn-primary btn-sm" id="views-add-btn">+ ビューを作成</button>
    </div>

    ${renderViewSection('自分のビュー（非公開）', privateViews)}
    ${renderViewSection('チームビュー', teamViews)}
    ${renderViewSection('全体公開ビュー', publicViews)}

    ${MOCK_VIEWS.length === 0 ? renderEmptyState('ビューが登録されていません。「ビューを作成」から追加してください。') : ''}
  `;

  document.getElementById('views-add-btn').addEventListener('click', () => {
    showViewFormModal();
  });
}

function renderViewSection(title, views) {
  if (views.length === 0) return '';
  return `
    <div style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <h3 style="font-size:14px;font-weight:600;margin:0;">${escapeHtml(title)}</h3>
        <span style="font-size:12px;color:var(--gray-400);">${views.length}件</span>
      </div>
      <div class="view-card-grid">
        ${views.map(v => renderViewCard(v)).join('')}
      </div>
    </div>
  `;
}

function renderViewCard(v) {
  const badgeStyles = {
    private: 'background:#f1f5f9;color:#64748b;',
    team: 'background:#fff;color:#64748b;border:1px solid #e2e8f0;',
    public: 'background:var(--primary);color:#fff;',
  };
  const badgeLabels = { private: '非公開', team: 'チーム', public: '全体公開' };
  const visibilityBadge = `<span style="font-size:11px;padding:1px 8px;border-radius:4px;${badgeStyles[v.visibility]}">${badgeLabels[v.visibility]}</span>`;

  const filterParts = [];
  if (v.filters.clientTypes) filterParts.push(v.filters.clientTypes.join('/'));
  if (v.filters.fiscalMonths) filterParts.push('決算: ' + v.filters.fiscalMonths.map(m => m + '月').join(', '));
  if (v.filters.isActive === true) filterParts.push('稼働中のみ');
  if (v.filters.assignees) filterParts.push('担当: ' + v.filters.assignees.length + '名指定');

  const sortLabel = v.sorts.map(s => `${s.label}${s.direction === 'asc' ? '↑' : '↓'}`).join(', ');

  return `
    <div class="card" style="margin-bottom:0;">
      <div class="card-header" style="padding:12px 16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <h4 style="font-size:13px;font-weight:600;margin:0 0 4px 0;">${escapeHtml(v.name)}</h4>
            <div style="display:flex;align-items:center;gap:6px;">
              ${visibilityBadge}
              <span style="font-size:11px;color:var(--gray-400);">${escapeHtml(v.owner)}</span>
              ${v.teamName ? `<span style="font-size:11px;color:var(--gray-400);">(${escapeHtml(v.teamName)})</span>` : ''}
            </div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-secondary btn-sm" style="font-size:11px;padding:2px 8px;" onclick="editMockView('${v.id}')">編集</button>
            <button class="btn btn-secondary btn-sm" style="font-size:11px;padding:2px 8px;color:var(--red-500);" onclick="deleteMockView('${v.id}')">削除</button>
          </div>
        </div>
      </div>
      <div class="card-body" style="padding:8px 16px 12px;">
        ${v.description ? `<p style="font-size:12px;color:var(--gray-500);margin:0 0 8px 0;">${escapeHtml(v.description)}</p>` : ''}
        <div style="font-size:11px;color:var(--gray-400);space-y:2px;">
          ${filterParts.length > 0 ? `<div><strong>フィルタ:</strong> ${escapeHtml(filterParts.join(' / '))}</div>` : ''}
          <div><strong>カラム:</strong> ${v.columns.map(c => escapeHtml(c)).join(', ')}</div>
          ${sortLabel ? `<div><strong>ソート:</strong> ${escapeHtml(sortLabel)}</div>` : ''}
        </div>
        <div style="margin-top:8px;">
          <button class="btn btn-secondary btn-sm" style="width:100%;font-size:12px;" onclick="alert('顧客一覧にビューを適用します（モック）')">
            &#x1f441; 顧客一覧に適用
          </button>
        </div>
      </div>
    </div>
  `;
}

function showViewFormModal(editView) {
  const isEdit = !!editView;
  const title = isEdit ? 'ビューを編集' : 'ビューを作成';

  const visibilities = [
    { value: 'private', label: '非公開（自分のみ）' },
    { value: 'team', label: 'チーム共有' },
    { value: 'public', label: '全体公開' },
  ];

  showModal(title, `
    <div class="detail-row"><div class="detail-label">ビュー名 *</div><div class="detail-value">
      <input type="text" id="view-name" class="inline-edit-input" placeholder="例: 3月決算 法人のみ" value="${isEdit ? escapeHtml(editView.name) : ''}">
    </div></div>
    <div class="detail-row"><div class="detail-label">説明</div><div class="detail-value">
      <input type="text" id="view-desc" class="inline-edit-input" placeholder="このビューの用途（任意）" value="${isEdit ? escapeHtml(editView.description || '') : ''}">
    </div></div>
    <div class="detail-row"><div class="detail-label">公開範囲 *</div><div class="detail-value">
      <select id="view-visibility" class="inline-edit-input">
        ${visibilities.map(v => `<option value="${v.value}" ${isEdit && editView.visibility === v.value ? 'selected' : ''}>${v.label}</option>`).join('')}
      </select>
    </div></div>
    <div style="margin-top:16px;">
      <p style="font-size:12px;color:var(--gray-400);">フィルタ・カラム・ソートの詳細設定は本番環境で利用できます</p>
    </div>
  `, () => {
    const name = getValTrim('view-name');
    if (!name) { alert('ビュー名を入力してください'); return; }
    const visibility = getVal('view-visibility', 'private');
    const desc = getValTrim('view-desc');

    if (isEdit) {
      const idx = MOCK_VIEWS.findIndex(v => v.id === editView.id);
      if (idx >= 0) {
        MOCK_VIEWS[idx].name = name;
        MOCK_VIEWS[idx].description = desc;
        MOCK_VIEWS[idx].visibility = visibility;
      }
    } else {
      MOCK_VIEWS.push({
        id: 'v-' + Date.now(), name, description: desc,
        visibility, owner: 'ひろ', teamName: null,
        filters: {}, columns: ['顧客名', '種別', '決算月', '主担当', 'ステータス'],
        sorts: [],
      });
    }
    closeModal();
    navigateTo('views');
  });
}

function editMockView(id) {
  const view = MOCK_VIEWS.find(v => v.id === id);
  if (view) showViewFormModal(view);
}

function deleteMockView(id) {
  const idx = MOCK_VIEWS.findIndex(v => v.id === id);
  if (idx >= 0) {
    MOCK_VIEWS.splice(idx, 1);
    navigateTo('views');
  }
}

registerPage('views', renderViews);
