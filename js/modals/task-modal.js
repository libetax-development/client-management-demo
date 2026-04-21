// ===========================
// タスク関連モーダル
// ===========================

// ── タスク作成モーダル ──
function openTaskModal() {
  document.getElementById('new-task-client').innerHTML =
    '<option value="">（指定なし／個人タスク）</option>' + buildClientOptions(true);
  document.getElementById('new-task-assignee').innerHTML = buildUserOptions('staff');
  resetForm(['new-task-title', 'new-task-due']);
  document.getElementById('new-task-status').value = '未着手';
  showModal('task-create-modal');
}

function submitNewTask() {
  const title = getValTrim('new-task-title');
  const clientId = getVal('new-task-client');
  const assigneeId = getVal('new-task-assignee');
  const dueDate = getVal('new-task-due');
  const status = getVal('new-task-status');

  if (!title) { alert('タスク名を入力してください'); return; }
  if (!dueDate) { alert('期限を入力してください'); return; }

  MOCK_DATA.tasks.push({
    id: generateId('tk-', MOCK_DATA.tasks),
    clientId: clientId || null,
    assigneeUserId: assigneeId, title, status, dueDate,
    createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }),
  });

  hideModal('task-create-modal');
  if (currentPage === 'tasks') navigateTo('tasks');
  else if (currentPage === 'dashboard') navigateTo('dashboard');
  else alert(`タスク「${title}」を作成しました`);
}

// ── タスク編集モーダル ──
function openTaskEditModal(taskId) {
  const t = MOCK_DATA.tasks.find(x => x.id === taskId);
  if (!t) return;
  setFormValues({
    'edit-task-id': t.id, 'edit-task-title': t.title,
    'edit-task-status': t.status, 'edit-task-due': t.dueDate,
  });

  const assigneeSelect = document.getElementById('edit-task-assignee');
  assigneeSelect.innerHTML = getActiveUsers().filter(u => u.role !== 'admin').map(u =>
    `<option value="${u.id}" ${u.id === t.assigneeUserId ? 'selected' : ''}>${escapeHtml(u.name)}</option>`
  ).join('');

  showModal('task-edit-modal');
}

function submitEditTask() {
  const id = getVal('edit-task-id');
  const t = MOCK_DATA.tasks.find(x => x.id === id);
  if (!t) return;
  t.title = getValTrim('edit-task-title');
  t.assigneeUserId = getVal('edit-task-assignee');
  t.status = getVal('edit-task-status');
  t.dueDate = getVal('edit-task-due');
  hideModal('task-edit-modal');
  navigateTo('task-detail', { id });
}

function deleteTask() {
  const id = getVal('edit-task-id');
  const task = MOCK_DATA.tasks.find(x => x.id === id);
  if (!confirm(`タスク「${task ? task.title : id}」を削除しますか？\nこの操作は取り消せません。`)) return;
  MOCK_DATA.tasks = MOCK_DATA.tasks.filter(x => x.id !== id);
  hideModal('task-edit-modal');
  navigateTo('tasks');
}
