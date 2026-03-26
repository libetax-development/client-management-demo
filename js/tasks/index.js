// ===========================
// タスク一覧
// ===========================
function renderTasks(el) {
  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="タスク名・顧客名で検索..." id="task-search">
      <select class="filter-select" id="task-status-filter">
        <option value="">全ステータス</option>
        <option value="overdue">期限超過</option>
        <option value="未着手">未着手</option>
        <option value="進行中">進行中</option>
        <option value="完了">完了</option>
        <option value="差戻し">差戻し</option>
      </select>
      <select class="filter-select" id="task-assignee-filter">
        <option value="">全担当者</option>
        ${buildUserOptions()}
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openTaskModal()">+ 新規タスク</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>顧客名</th><th>タスク名</th><th>担当者</th><th>期限</th><th>状態</th></tr></thead>
          <tbody id="task-table-body"></tbody>
        </table>
      </div>
    </div>
  `;
  // ダッシュボードからのフィルタ適用
  if (typeof dashTaskFilter !== 'undefined' && dashTaskFilter) {
    const sel = document.getElementById('task-status-filter');
    if (sel) sel.value = dashTaskFilter;
    dashTaskFilter = '';
  }
  renderTaskTable();
  bindFilters(['task-search', 'task-status-filter', 'task-assignee-filter'], renderTaskTable);
}

function renderTaskTable() {
  const search = (document.getElementById('task-search')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('task-status-filter')?.value || '';
  const assigneeFilter = document.getElementById('task-assignee-filter')?.value || '';

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  let tasks = MOCK_DATA.tasks.filter(t => {
    const client = getClientById(t.clientId);
    if (search && !t.title.toLowerCase().includes(search) && !(client?.name || '').toLowerCase().includes(search)) return false;
    if (statusFilter === 'overdue') {
      if (t.status === '完了' || t.dueDate >= today) return false;
    } else if (statusFilter && t.status !== statusFilter) return false;
    if (assigneeFilter && t.assigneeUserId !== assigneeFilter) return false;
    return true;
  });

  tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  renderTableBody('task-table-body', tasks, t => {
    const client = getClientById(t.clientId);
    const assignee = getUserById(t.assigneeUserId);
    return `<tr class="clickable" onclick="navigateTo('task-detail',{id:'${t.id}'})">
      <td>${client?.name || '-'}</td>
      <td><strong>${t.title}</strong></td>
      <td>${assignee?.name || '-'}</td>
      <td>${formatDate(t.dueDate)}</td>
      <td>${renderStatusBadge(t.status)}</td>
    </tr>`;
  }, 5);
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
          <div class="detail-row"><div class="detail-label">タスク名</div><div class="detail-value">${t.title}</div></div>
          <div class="detail-row"><div class="detail-label">顧客</div><div class="detail-value"><a href="#" onclick="event.preventDefault();navigateTo('client-detail',{id:'${t.clientId}'})">${client?.name || '-'}</a></div></div>
          <div class="detail-row"><div class="detail-label">担当者</div><div class="detail-value">${assignee?.name || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">ステータス</div><div class="detail-value">${renderStatusBadge(t.status)}</div></div>
          <div class="detail-row"><div class="detail-label">期限</div><div class="detail-value">${formatDate(t.dueDate)}</div></div>
          <div class="detail-row"><div class="detail-label">作成日</div><div class="detail-value">${formatDate(t.createdAt)}</div></div>
        </div>
      </div>
      <div>
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
      <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px;">${author?.name || '-'} - ${formatDate(c.createdAt)}</div>
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
    createdAt: new Date().toISOString(),
  });

  input.value = '';
  renderTaskComments(taskId);
}

registerPage('tasks', renderTasks);
registerPage('task-detail', renderTaskDetail);
