// ===========================
// テンプレート管理
// ===========================
function renderTemplates(el) {
  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="テンプレート名で検索..." id="tmpl-search">
      <select class="filter-select" id="tmpl-category-filter">
        <option value="">全カテゴリ</option>
        <option value="月次">月次</option>
        <option value="決算">決算</option>
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openTemplateCreateModal()">+ 新規テンプレート</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>名前</th><th>カテゴリ</th><th>タスク定義数</th><th>作成者</th><th>状態</th></tr></thead>
          <tbody id="tmpl-table-body"></tbody>
        </table>
      </div>
    </div>
  `;
  renderTemplateTable();
  bindFilters(['tmpl-search', 'tmpl-category-filter'], renderTemplateTable);
}

function renderTemplateTable() {
  const search = (document.getElementById('tmpl-search')?.value || '').toLowerCase();
  const catFilter = document.getElementById('tmpl-category-filter')?.value || '';

  let items = MOCK_DATA.templates.filter(t => {
    if (search && !t.name.toLowerCase().includes(search)) return false;
    if (catFilter && t.category !== catFilter) return false;
    return true;
  });

  renderTableBody('tmpl-table-body', items, t => {
    const defs = getTemplateDefinitions(t.id);
    const creator = getUserById(t.createdBy);
    return `<tr class="clickable" onclick="navigateTo('template-detail',{id:'${t.id}'})">
      <td><strong>${escapeHtml(t.name)}</strong></td>
      <td>${escapeHtml(t.category)}</td>
      <td>${defs.length}件</td>
      <td>${escapeHtml(creator?.name || '-')}</td>
      <td>${t.isActive ? '<span style="color:var(--success)">有効</span>' : '<span style="color:var(--gray-400)">無効</span>'}</td>
    </tr>`;
  }, 5);
}

// ===========================
// テンプレート詳細
// ===========================
function renderTemplateDetail(el, params) {
  const tmpl = MOCK_DATA.templates.find(t => t.id === params.id);
  if (!tmpl) { el.innerHTML = renderEmptyState('テンプレートが見つかりません'); return; }

  const defs = getTemplateDefinitions(tmpl.id);
  const creator = getUserById(tmpl.createdBy);
  const runs = MOCK_DATA.templateRuns.filter(r => r.templateId === tmpl.id);
  document.getElementById('header-title').textContent = 'テンプレート - ' + tmpl.name;

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('templates')">&larr; テンプレート一覧に戻る</a></div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-header">
          <h3>テンプレート情報</h3>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="openTemplateEditModal('${tmpl.id}')">編集</button>
            <button class="btn btn-primary btn-sm" onclick="openTemplateRunModal('${tmpl.id}')">実行</button>
          </div>
        </div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">名前</div><div class="detail-value">${escapeHtml(tmpl.name)}</div></div>
          <div class="detail-row"><div class="detail-label">説明</div><div class="detail-value">${escapeHtml(tmpl.description || '-')}</div></div>
          <div class="detail-row"><div class="detail-label">カテゴリ</div><div class="detail-value">${escapeHtml(tmpl.category)}</div></div>
          <div class="detail-row"><div class="detail-label">作成者</div><div class="detail-value">${escapeHtml(creator?.name || '-')}</div></div>
          <div class="detail-row"><div class="detail-label">状態</div><div class="detail-value">${tmpl.isActive ? '<span style="color:var(--success)">有効</span>' : '<span style="color:var(--gray-400)">無効</span>'}</div></div>
          <div class="detail-row"><div class="detail-label">作成日</div><div class="detail-value">${formatDate(tmpl.createdAt)}</div></div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-header"><h3>タスク定義 (${defs.length}件)</h3></div>
          <div class="card-body">
            ${defs.length === 0 ? '<div style="color:var(--gray-400);font-size:13px;">タスク定義はありません</div>' :
              `<table style="width:100%;"><thead><tr><th>順序</th><th>タスク名</th><th>相対期限(日)</th><th>チェックリスト</th></tr></thead><tbody>
              ${defs.map(d => `<tr>
                <td>${d.sortOrder}</td>
                <td>${escapeHtml(d.title)}</td>
                <td>+${d.relativeDueDays}日</td>
                <td>${d.checklistItems.length > 0 ? d.checklistItems.map(i => escapeHtml(i)).join(', ') : '-'}</td>
              </tr>`).join('')}
              </tbody></table>`
            }
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>実行履歴</h3></div>
          <div class="card-body">
            ${runs.length === 0 ? '<div style="color:var(--gray-400);font-size:13px;">実行履歴はありません</div>' :
              `<table style="width:100%;"><thead><tr><th>実行日</th><th>対象顧客</th><th>生成タスク数</th></tr></thead><tbody>
              ${runs.map(r => {
                const client = getClientById(r.clientId);
                return `<tr><td>${formatDate(r.runAt)}</td><td>${escapeHtml(client?.name || '-')}</td><td>${r.createdTaskCount || 0}件</td></tr>`;
              }).join('')}
              </tbody></table>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===========================
// テンプレート作成/編集モーダル
// ===========================
function openTemplateCreateModal() {
  document.getElementById('tmpl-modal-title').textContent = '新規テンプレート作成';
  resetForm(['tmpl-edit-name', 'tmpl-edit-desc', 'tmpl-edit-category']);
  document.getElementById('tmpl-edit-id').value = '';
  showModal('tmpl-create-modal');
}

function openTemplateEditModal(tmplId) {
  const tmpl = MOCK_DATA.templates.find(t => t.id === tmplId);
  if (!tmpl) return;
  document.getElementById('tmpl-modal-title').textContent = 'テンプレート編集';
  document.getElementById('tmpl-edit-id').value = tmpl.id;
  document.getElementById('tmpl-edit-name').value = tmpl.name;
  document.getElementById('tmpl-edit-desc').value = tmpl.description || '';
  document.getElementById('tmpl-edit-category').value = tmpl.category || '';
  showModal('tmpl-create-modal');
}

function submitTemplate() {
  const id = document.getElementById('tmpl-edit-id').value;
  const name = getValTrim('tmpl-edit-name');
  const desc = getValTrim('tmpl-edit-desc');
  const category = getValTrim('tmpl-edit-category');
  if (!name) { alert('テンプレート名を入力してください'); return; }

  if (id) {
    const tmpl = MOCK_DATA.templates.find(t => t.id === id);
    if (tmpl) { tmpl.name = name; tmpl.description = desc; tmpl.category = category; }
  } else {
    MOCK_DATA.templates.push({
      id: generateId('tmpl-', MOCK_DATA.templates),
      name, description: desc, category: category || '月次',
      createdBy: MOCK_DATA.currentUser.id, isActive: true,
      createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }),
    });
  }
  hideModal('tmpl-create-modal');
  if (currentPage === 'templates') navigateTo('templates');
  else if (currentPage === 'template-detail') navigateTo('template-detail', { id });
}

// ===========================
// テンプレート実行モーダル
// ===========================
function openTemplateRunModal(tmplId) {
  const tmpl = MOCK_DATA.templates.find(t => t.id === tmplId);
  if (!tmpl) return;
  document.getElementById('tmpl-run-id').value = tmplId;
  document.getElementById('tmpl-run-client').innerHTML = buildClientOptions(true);
  const defs = getTemplateDefinitions(tmplId);
  document.getElementById('tmpl-run-preview').innerHTML = defs.length === 0
    ? '<div style="color:var(--gray-400);font-size:13px;">タスク定義がありません</div>'
    : `<div style="font-size:13px;margin-bottom:8px;">以下のタスクが生成されます:</div>
       <ul style="font-size:13px;margin-left:20px;">${defs.map(d => `<li>${escapeHtml(d.title)} (+${d.relativeDueDays}日)</li>`).join('')}</ul>`;
  showModal('tmpl-run-modal');
}

function submitTemplateRun() {
  const tmplId = document.getElementById('tmpl-run-id').value;
  const clientId = document.getElementById('tmpl-run-client').value;
  if (!clientId) { alert('顧客を選択してください'); return; }

  const defs = getTemplateDefinitions(tmplId);
  const today = new Date();
  let createdCount = 0;

  defs.forEach(d => {
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + d.relativeDueDays);
    const dueDateStr = dueDate.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    const client = getClientById(clientId);

    MOCK_DATA.tasks.push({
      id: generateId('tk-', MOCK_DATA.tasks),
      clientId, assigneeUserId: (client ? getAssigneeUserId(client.id, 'main') : null) || MOCK_DATA.currentUser.id,
      title: d.title, description: '', status: '未着手', dueDate: dueDateStr,
      createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }),
      completedAt: null, templateRunId: tmplId,
      checklist: d.checklistItems.map((text, i) => ({
        id: 'cl-' + Date.now() + '-' + i, text, checked: false,
      })),
    });
    createdCount++;
  });

  MOCK_DATA.templateRuns.push({
    id: generateId('tr-', MOCK_DATA.templateRuns),
    templateId: tmplId, clientId, runAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }),
    createdTaskCount: createdCount, runBy: MOCK_DATA.currentUser.id,
  });

  hideModal('tmpl-run-modal');
  alert(createdCount + '件のタスクを生成しました');
  if (currentPage === 'template-detail') navigateTo('template-detail', { id: tmplId });
}

registerPage('templates', renderTemplates);
registerPage('template-detail', renderTemplateDetail);
