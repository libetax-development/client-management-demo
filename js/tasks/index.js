// ===========================
// タスク一覧
// ===========================
let taskPage = 1;
const taskPerPage = 20;

function renderTasks(el) {
  taskPage = 1;
  el.innerHTML = `
    <!-- フィルタードロワーオーバーレイ -->
    <div class="filter-drawer-overlay" id="task-filter-overlay"></div>
    <!-- フィルタードロワー本体 -->
    <div class="filter-drawer" id="task-filter-drawer">
      <div class="filter-drawer-header">
        フィルター
        <button class="btn-icon" id="task-filter-close" title="閉じる">&times;</button>
      </div>
      <div class="filter-drawer-body">
        <div class="filter-drawer-group">
          <label>検索</label>
          <input type="text" class="search-input" placeholder="タスク名・顧客名で検索..." id="task-search-drawer">
        </div>
        <div class="filter-drawer-group">
          <label>ステータス</label>
          <select class="filter-select" id="task-status-filter-drawer">
            <option value="">全ステータス</option>
            <option value="incomplete" selected>未完了</option>
            <option value="overdue">期限超過</option>
            <option value="未着手">未着手</option>
            <option value="進行中">進行中</option>
            <option value="完了">完了</option>
          </select>
        </div>
        ${MOCK_DATA.currentUser.role === 'admin' ? `
        <div class="filter-drawer-group">
          <label>担当者</label>
          <select class="filter-select" id="task-assignee-filter-drawer">
            <option value="">全担当者</option>
            ${buildUserOptions()}
          </select>
        </div>` : ''}
      </div>
      <div class="filter-drawer-footer">
        <button class="btn btn-secondary" style="width:100%" id="task-filter-reset">リセット</button>
      </div>
    </div>

    <div class="toolbar">
      <!-- モバイル用フィルターボタン -->
      <button class="btn btn-secondary btn-sm toolbar-filter-mobile" id="task-filter-open">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        フィルター
        <span class="filter-badge" id="task-filter-badge" style="display:none"></span>
      </button>
      <!-- モバイル用検索（md未満のみ） -->
      <input type="text" class="search-input toolbar-filter-mobile" placeholder="タスク名・顧客名で検索..." id="task-search" style="flex:1">
      <!-- PCインラインフィルター（md以上のみ） -->
      <div class="toolbar-inline-filters" style="display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap;">
        <input type="text" class="search-input" placeholder="タスク名・顧客名で検索..." id="task-search-pc" style="min-width:200px;flex:1">
        <select class="filter-select" id="task-status-filter">
          <option value="">全ステータス</option>
          <option value="incomplete" selected>未完了</option>
          <option value="overdue">期限超過</option>
          <option value="未着手">未着手</option>
          <option value="進行中">進行中</option>
          <option value="完了">完了</option>
        </select>
        ${MOCK_DATA.currentUser.role === 'admin' ? `
        <select class="filter-select" id="task-assignee-filter">
          <option value="">全担当者</option>
          ${buildUserOptions()}
        </select>` : ''}
      </div>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openTaskModal()">+ 新規タスク</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>タスク名</th><th>顧客名</th><th>担当者</th><th>ステータス</th><th>期限日</th></tr></thead>
          <tbody id="task-table-body"></tbody>
        </table>
      </div>
      <div id="task-pagination" class="rp-pagination"></div>
    </div>
  `;

  // ダッシュボードからのフィルタ適用
  if (typeof dashTaskFilter !== 'undefined' && dashTaskFilter) {
    ['task-status-filter', 'task-status-filter-drawer'].forEach(id => {
      const sel = document.getElementById(id);
      if (sel) sel.value = dashTaskFilter;
    });
    dashTaskFilter = '';
  }
  // デフォルト担当フィルタ: adminは全員、それ以外は自分
  if (MOCK_DATA.currentUser.role !== 'admin') {
    ['task-assignee-filter', 'task-assignee-filter-drawer'].forEach(id => {
      const sel = document.getElementById(id);
      if (sel) sel.value = MOCK_DATA.currentUser.id;
    });
  }

  // ドロワー開閉
  const drawer = document.getElementById('task-filter-drawer');
  const overlay = document.getElementById('task-filter-overlay');
  const openDrawer = () => { drawer.classList.add('open'); overlay.classList.add('show'); };
  const closeDrawer = () => { drawer.classList.remove('open'); overlay.classList.remove('show'); };
  document.getElementById('task-filter-open')?.addEventListener('click', openDrawer);
  document.getElementById('task-filter-close')?.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // バッジ更新
  function updateFilterBadge() {
    const search = document.getElementById('task-search')?.value || document.getElementById('task-search-pc')?.value || '';
    const status = document.getElementById('task-status-filter-drawer')?.value || document.getElementById('task-status-filter')?.value || '';
    const assignee = document.getElementById('task-assignee-filter-drawer')?.value || document.getElementById('task-assignee-filter')?.value || '';
    const count = (search ? 1 : 0) + (status && status !== 'incomplete' ? 1 : 0) + (assignee ? 1 : 0);
    const badge = document.getElementById('task-filter-badge');
    if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }
  }

  // ドロワー内フィルター → PC側に同期して再描画
  function syncFromDrawer() {
    const drawerStatus = document.getElementById('task-status-filter-drawer');
    const drawerAssignee = document.getElementById('task-assignee-filter-drawer');
    const pcStatus = document.getElementById('task-status-filter');
    const pcAssignee = document.getElementById('task-assignee-filter');
    if (drawerStatus && pcStatus) pcStatus.value = drawerStatus.value;
    if (drawerAssignee && pcAssignee) pcAssignee.value = drawerAssignee.value;
  }

  // PC側フィルター → ドロワーに同期
  function syncFromPC() {
    const pcStatus = document.getElementById('task-status-filter');
    const pcAssignee = document.getElementById('task-assignee-filter');
    const drawerStatus = document.getElementById('task-status-filter-drawer');
    const drawerAssignee = document.getElementById('task-assignee-filter-drawer');
    if (pcStatus && drawerStatus) drawerStatus.value = pcStatus.value;
    if (pcAssignee && drawerAssignee) drawerAssignee.value = pcAssignee.value;
  }

  // リセット
  document.getElementById('task-filter-reset')?.addEventListener('click', () => {
    ['task-search', 'task-search-pc', 'task-search-drawer'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['task-status-filter', 'task-status-filter-drawer'].forEach(id => { const el = document.getElementById(id); if (el) el.value = 'incomplete'; });
    ['task-assignee-filter', 'task-assignee-filter-drawer'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    taskPage = 1;
    renderTaskTable();
    updateFilterBadge();
    closeDrawer();
  });

  // PC側イベント
  ['task-search-pc', 'task-status-filter', 'task-assignee-filter'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => { syncFromPC(); taskPage = 1; renderTaskTable(); updateFilterBadge(); });
    document.getElementById(id)?.addEventListener('change', () => { syncFromPC(); taskPage = 1; renderTaskTable(); updateFilterBadge(); });
  });
  // モバイル検索
  document.getElementById('task-search')?.addEventListener('input', () => { taskPage = 1; renderTaskTable(); updateFilterBadge(); });
  // ドロワー側イベント
  ['task-search-drawer', 'task-status-filter-drawer', 'task-assignee-filter-drawer'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => { syncFromDrawer(); taskPage = 1; renderTaskTable(); updateFilterBadge(); });
    document.getElementById(id)?.addEventListener('change', () => { syncFromDrawer(); taskPage = 1; renderTaskTable(); updateFilterBadge(); });
  });

  renderTaskTable();
  updateFilterBadge();
}

function renderTaskTable() {
  const search = (
    document.getElementById('task-search')?.value ||
    document.getElementById('task-search-pc')?.value ||
    ''
  ).toLowerCase();
  const statusFilter = document.getElementById('task-status-filter')?.value || '';
  const assigneeFilter = document.getElementById('task-assignee-filter')?.value || '';

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  let tasks = filterByKeyword(MOCK_DATA.tasks, search, ['title', t => getClientById(t.clientId)?.name || '']);
  if (statusFilter === 'incomplete') {
    tasks = tasks.filter(t => t.status !== '完了');
  } else if (statusFilter === 'overdue') {
    tasks = tasks.filter(t => t.status !== '完了' && t.dueDate < today);
  } else {
    tasks = filterByField(tasks, 'status', statusFilter);
  }
  tasks = filterByField(tasks, 'assigneeUserId', assigneeFilter);

  tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const total = tasks.length;
  const totalPages = Math.max(1, Math.ceil(total / taskPerPage));
  const start = (taskPage - 1) * taskPerPage;
  const pageItems = tasks.slice(start, start + taskPerPage);

  renderTableBody('task-table-body', pageItems, t => {
    const client = getClientById(t.clientId);
    const assignee = getUserById(t.assigneeUserId);
    return `<tr class="clickable" onclick="navigateTo('task-detail',{id:'${t.id}'})">
      <td><strong>${escapeHtml(t.title)}</strong></td>
      <td>${client ? escapeHtml(client.name) : '<span style="color:var(--gray-400);font-size:12px;">（個人タスク）</span>'}</td>
      <td>${escapeHtml(assignee?.name || '-')}</td>
      <td onclick="event.stopPropagation()">${renderTaskStatusSelect(t)}</td>
      <td>${formatDate(t.dueDate)}</td>
    </tr>`;
  }, 5);

  const pag = document.getElementById('task-pagination');
  if (pag && total > taskPerPage) {
    pag.innerHTML = `
      <button onclick="taskPage=Math.max(1,taskPage-1);renderTaskTable()" ${taskPage <= 1 ? 'disabled' : ''}>← 前</button>
      <span class="page-info">${taskPage} / ${totalPages}</span>
      <button onclick="taskPage=Math.min(${totalPages},taskPage+1);renderTaskTable()" ${taskPage >= totalPages ? 'disabled' : ''}>次 →</button>
      <span style="margin-left:8px;font-size:11px;">(全${total}件)</span>
    `;
  } else if (pag) {
    pag.innerHTML = '';
  }
}

/** タスクのステータス遷移ルール */
function getTaskTransitions(status) {
  switch (status) {
    case '未着手': return ['進行中'];
    case '進行中': return ['完了'];
    case '完了': return ['進行中'];
    case '差戻し': return ['進行中'];
    default: return [];
  }
}

/** タスク一覧用ステータスセレクト */
function renderTaskStatusSelect(t) {
  const transitions = getTaskTransitions(t.status);
  const options = [`<option value="${t.status}" selected>${t.status}</option>`]
    .concat(transitions.map(s => `<option value="${s}">${s}</option>`))
    .join('');
  return `<select class="status-select status-${statusClass(t.status)}" onchange="changeTaskStatus('${t.id}', this.value)">${options}</select>`;
}

/** ステータスのCSSクラス名 */
function statusClass(status) {
  switch (status) {
    case '未着手': return 'todo';
    case '進行中': return 'in-progress';
    case '完了': return 'done';
    case '差戻し': return 'returned';
    default: return '';
  }
}

/** タスクステータス変更 */
function changeTaskStatus(taskId, newStatus) {
  const task = MOCK_DATA.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    if (newStatus === '完了') task.completedAt = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }) + 'T' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo' });
    renderTaskTable();
  }
}

/** タスク詳細用ステータス遷移ボタン（モバイルflex-wrap対応） */
function renderTaskStatusActions(task) {
  const container = document.getElementById('task-status-actions');
  if (!container) return;
  const transitions = getTaskTransitions(task.status);
  if (transitions.length === 0) { container.innerHTML = ''; return; }

  const TRANSITION_MAP = {
    '未着手->進行中': { label: '進行中にする', cls: 'btn-primary' },
    '進行中->完了': { label: '完了にする', cls: 'btn-primary' },
    '完了->進行中': { label: '進行中に戻す', cls: 'btn-secondary' },
    '差戻し->進行中': { label: '進行中にする', cls: 'btn-primary' },
  };

  const buttons = transitions.map(to => {
    const key = `${task.status}->${to}`;
    const meta = TRANSITION_MAP[key] || { label: to + 'にする', cls: 'btn-primary' };
    return `<button class="btn ${meta.cls} btn-sm" onclick="changeTaskStatusDetail('${task.id}','${to}')">${meta.label}</button>`;
  }).join('');

  container.innerHTML = `<div class="status-actions-row">${buttons}</div>`;
}

function changeTaskStatusDetail(taskId, newStatus) {
  const task = MOCK_DATA.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.status = newStatus;
  if (newStatus === '完了') {
    task.completedAt = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }) + 'T' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo' });
  } else {
    task.completedAt = null;
  }
  // ステータスバッジを更新
  const statusEl = document.querySelector('.detail-value .status-badge');
  if (statusEl) {
    statusEl.outerHTML = renderStatusBadge(newStatus);
  }
  renderTaskStatusActions(task);
}

// ===========================
// タスク詳細
// ===========================
function renderTaskDetail(el, params) {
  const t = MOCK_DATA.tasks.find(tk => tk.id === params.id);
  if (!t) { el.innerHTML = renderEmptyState('タスクが見つかりません'); return; }
  const client = getClientById(t.clientId);
  const assignee = getUserById(t.assigneeUserId);
  document.getElementById('header-title').textContent = `タスク詳細 - ${t.title}`;

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('tasks')">&larr; タスク一覧に戻る</a></div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>タスク情報</h3><button class="btn btn-secondary btn-sm" onclick="openTaskEditModal('${t.id}')">編集</button></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">タスク名</div><div class="detail-value">${escapeHtml(t.title)}</div></div>
          ${t.description ? `<div class="detail-row"><div class="detail-label">説明</div><div class="detail-value">${escapeHtml(t.description)}</div></div>` : ''}
          <div class="detail-row"><div class="detail-label">顧客</div><div class="detail-value">${client ? `<a href="#" onclick="event.preventDefault();navigateTo('client-detail',{id:'${t.clientId}'})">${escapeHtml(client.name)}</a>` : '<span style="color:var(--gray-500);">（個人タスク）</span>'}</div></div>
          <div class="detail-row"><div class="detail-label">担当者</div><div class="detail-value">${escapeHtml(assignee?.name || '-')}</div></div>
          <div class="detail-row"><div class="detail-label">ステータス</div><div class="detail-value">${renderStatusBadge(t.status)}</div></div>
          <div class="detail-row"><div class="detail-label">期限</div><div class="detail-value">${formatDate(t.dueDate)}</div></div>
          <div class="detail-row"><div class="detail-label">作成日</div><div class="detail-value">${formatDate(t.createdAt)}</div></div>
          ${t.completedAt ? `<div class="detail-row"><div class="detail-label">完了日</div><div class="detail-value">${formatDateTime(t.completedAt)}</div></div>` : ''}
          ${t.templateRunId ? `<div class="detail-row"><div class="detail-label">テンプレート</div><div class="detail-value"><a href="#" onclick="event.preventDefault();navigateTo('template-detail',{id:'${t.templateRunId}'})">テンプレートから生成</a></div></div>` : ''}
          <div class="status-actions" id="task-status-actions"></div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-header"><h3>ファイル</h3></div>
          <div class="card-body">
            <div id="task-files-list"></div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <input type="text" class="search-input" id="task-file-name" style="width:140px;font-size:12px;" placeholder="ファイル名">
              <input type="text" class="search-input" id="task-file-url" style="flex:1;width:auto;font-size:12px;" placeholder="URL">
              <button class="btn btn-secondary btn-sm" id="task-file-add">追加</button>
            </div>
          </div>
        </div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-header">
            <h3>チェックリスト <span id="checklist-count" style="font-size:12px;font-weight:400;color:var(--gray-500);"></span></h3>
            <div style="display:flex;gap:6px;align-items:center;">
              <select id="checklist-template-select" class="filter-select" style="font-size:12px;padding:4px 8px;width:auto;">
                <option value="">テンプレート選択...</option>
                ${MOCK_DATA.checklistTemplates.map(tpl => '<option value="' + tpl.id + '">' + escapeHtml(tpl.name) + '</option>').join('')}
              </select>
              <button class="btn btn-secondary btn-sm" id="checklist-template-add">追加</button>
            </div>
          </div>
          <div class="card-body">
            <div id="checklist-items"></div>
            <div style="display:flex;gap:8px;margin-top:12px;">
              <input type="text" class="search-input" id="checklist-new-item" style="flex:1;width:auto;font-size:13px;" placeholder="+ 項目を追加...">
              <button class="btn btn-primary btn-sm" id="checklist-add-btn">追加</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>コメント</h3></div>
          <div class="card-body">
            <div id="task-comments-list"></div>
            <div style="display:flex;gap:8px;">
              <input type="text" class="search-input" id="task-comment-input" style="flex:1;width:auto" placeholder="コメントを入力...">
              <button class="btn btn-primary btn-sm" id="task-comment-send">送信</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  renderTaskComments(t.id);
  renderChecklist(t);
  renderTaskFiles(t.id);
  renderTaskStatusActions(t);

  document.getElementById('task-file-add').addEventListener('click', () => addTaskFile(t.id));
  document.getElementById('task-comment-send').addEventListener('click', () => submitTaskComment(t.id));
  document.getElementById('task-comment-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitTaskComment(t.id); }
  });

  // チェックリスト: テンプレートから追加
  document.getElementById('checklist-template-add').addEventListener('click', () => {
    const select = document.getElementById('checklist-template-select');
    const tplId = select.value;
    if (!tplId) { alert('テンプレートを選択してください'); return; }
    const tpl = MOCK_DATA.checklistTemplates.find(x => x.id === tplId);
    if (!tpl) return;
    if (!t.checklist) t.checklist = [];
    tpl.items.forEach(text => {
      const newId = 'cl-' + String(Date.now()) + '-' + String(Math.random()).slice(2, 6);
      t.checklist.push({ id: newId, text: text, checked: false });
    });
    select.value = '';
    renderChecklist(t);
  });

  // チェックリスト: 新規項目追加
  document.getElementById('checklist-add-btn').addEventListener('click', () => addChecklistItem(t));
  document.getElementById('checklist-new-item').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addChecklistItem(t); }
  });
}

function renderTaskComments(taskId) {
  const comments = getTaskComments(taskId);
  const container = document.getElementById('task-comments-list');
  if (comments.length === 0) {
    container.innerHTML = '<div style="padding:12px;color:var(--gray-400);font-size:13px;">コメントはまだありません</div>';
    return;
  }
  container.innerHTML = comments.map(c => {
    const author = getUserById(c.authorId);
    return `<div class="info-box" style="margin-bottom:8px;">
      <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px;">${escapeHtml(author?.name || '-')} - ${formatDate(c.createdAt)}</div>
      <div style="font-size:13px;">${escapeHtml(c.body)}</div>
    </div>`;
  }).join('');
}

// ===========================
// チェックリスト
// ===========================
function renderChecklist(task) {
  const items = task.checklist || [];
  const container = document.getElementById('checklist-items');
  const countEl = document.getElementById('checklist-count');
  const checked = items.filter(i => i.checked).length;
  countEl.textContent = items.length > 0 ? '(' + checked + ' / ' + items.length + ')' : '';

  if (items.length === 0) {
    container.innerHTML = '<div style="padding:8px 0;color:var(--gray-400);font-size:13px;">チェックリスト項目はありません</div>';
    return;
  }

  container.innerHTML = items.map((item, idx) => {
    return '<div class="checklist-item" data-idx="' + idx + '" style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray-100);">'
      + '<input type="checkbox" class="checklist-check" data-idx="' + idx + '"' + (item.checked ? ' checked' : '') + '>'
      + '<span class="checklist-text" data-idx="' + idx + '" style="flex:1;font-size:13px;cursor:pointer;' + (item.checked ? 'text-decoration:line-through;color:var(--gray-400);' : '') + '">' + escapeHtml(item.text) + '</span>'
      + '<button class="btn-icon checklist-delete" data-idx="' + idx + '" title="削除" style="font-size:14px;color:var(--gray-400);">×</button>'
      + '</div>';
  }).join('');

  // チェックボックスイベント
  container.querySelectorAll('.checklist-check').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const i = parseInt(e.target.dataset.idx);
      items[i].checked = e.target.checked;
      renderChecklist(task);
    });
  });

  // テキストクリック → 編集モード
  container.querySelectorAll('.checklist-text').forEach(span => {
    span.addEventListener('click', (e) => {
      const i = parseInt(e.target.dataset.idx);
      const item = items[i];
      const parent = e.target.parentElement;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = item.text;
      input.className = 'search-input';
      input.style.cssText = 'flex:1;width:auto;font-size:13px;padding:4px 8px;';
      e.target.replaceWith(input);
      input.focus();
      input.select();

      const finishEdit = () => {
        const newText = input.value.trim();
        if (newText && newText !== item.text) {
          item.text = newText;
        }
        renderChecklist(task);
      };
      input.addEventListener('blur', finishEdit);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
        if (ev.key === 'Escape') { input.value = item.text; input.blur(); }
      });
    });
  });

  // 削除ボタン
  container.querySelectorAll('.checklist-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = parseInt(e.target.dataset.idx);
      items.splice(i, 1);
      renderChecklist(task);
    });
  });
}

function addChecklistItem(task) {
  const input = document.getElementById('checklist-new-item');
  const text = input.value.trim();
  if (!text) return;
  if (!task.checklist) task.checklist = [];
  const newId = 'cl-' + String(Date.now()) + '-' + String(Math.random()).slice(2, 6);
  task.checklist.push({ id: newId, text: text, checked: false });
  input.value = '';
  renderChecklist(task);
}

function submitTaskComment(taskId) {
  const input = document.getElementById('task-comment-input');
  const body = input.value.trim();
  if (!body) return;

  const newId = generateId('tc-', MOCK_DATA.taskComments);
  MOCK_DATA.taskComments.push({
    id: newId,
    taskId: taskId,
    authorId: MOCK_DATA.currentUser.id,
    body: body,
    createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }) + 'T' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo' }),
  });

  input.value = '';
  renderTaskComments(taskId);
}

// ===========================
// タスクファイル
// ===========================
function renderTaskFiles(taskId) {
  const files = getTaskFiles(taskId);
  const container = document.getElementById('task-files-list');
  if (!container) return;
  if (files.length === 0) {
    container.innerHTML = '<div style="padding:8px 0;color:var(--gray-400);font-size:13px;">ファイルはありません</div>';
    return;
  }
  container.innerHTML = files.map(f => {
    const uploader = getUserById(f.uploadedBy);
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray-100);">
      <a href="${escapeHtml(sanitizeUrl(f.fileUrl))}" target="_blank" style="flex:1;font-size:13px;">${escapeHtml(f.fileName)}</a>
      <span style="font-size:11px;color:var(--gray-400);">${escapeHtml(uploader?.name || '-')} ${formatDate(f.createdAt)}</span>
      <button class="btn-icon" onclick="removeTaskFile('${f.id}','${taskId}')" title="削除" style="font-size:14px;color:var(--gray-400);">&times;</button>
    </div>`;
  }).join('');
}

function addTaskFile(taskId) {
  const fileName = getValTrim('task-file-name');
  const fileUrl = getValTrim('task-file-url');
  if (!fileName || !fileUrl) { alert('ファイル名とURLを入力してください'); return; }

  MOCK_DATA.taskFiles.push({
    id: generateId('tf-', MOCK_DATA.taskFiles),
    taskId, fileName, fileUrl, uploadedBy: MOCK_DATA.currentUser.id,
    createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }) + 'T' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo' }),
  });
  resetForm(['task-file-name', 'task-file-url']);
  renderTaskFiles(taskId);
}

function removeTaskFile(fileId, taskId) {
  const idx = MOCK_DATA.taskFiles.findIndex(f => f.id === fileId);
  if (idx >= 0) MOCK_DATA.taskFiles.splice(idx, 1);
  renderTaskFiles(taskId);
}

registerPage('tasks', renderTasks);
registerPage('task-detail', renderTaskDetail);
