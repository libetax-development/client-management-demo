// ===========================
// ダッシュボード
// ===========================
function renderDashboard(el) {
  const tasks = MOCK_DATA.tasks;
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const overdue = tasks.filter(t => t.status !== '完了' && t.dueDate < today).length;
  const inProgress = tasks.filter(t => t.status === '進行中').length;
  const todo = tasks.filter(t => t.status === '未着手').length;
  const returned = tasks.filter(t => t.status === '差戻し').length;

  // 納付アラート
  const taxAlerts = getTaxAlerts();
  const taxAlertHtml = taxAlerts.length === 0 ? '' : `
    <div class="card tax-alert-card" style="margin-bottom:24px;">
      <div class="card-header" style="background:var(--danger-light);border-bottom:1px solid #fecaca;display:flex;justify-content:space-between;align-items:center;">
        <h3 style="color:var(--danger);display:flex;align-items:center;gap:8px;">&#x1f514; 納付期限アラート <span style="font-size:12px;font-weight:400;color:var(--gray-500);">${taxAlerts.length}件</span></h3>
        <button class="btn btn-primary btn-sm" onclick="createTasksFromAlerts()">タスク一括登録</button>
      </div>
      <div class="card-body" style="padding:0;">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>顧客名</th><th>種別</th><th>期限月</th><th>タイミング</th></tr></thead>
            <tbody>
              ${taxAlerts.map(a => {
                const timingLabel = a.isCurrentMonth ? '今月' : '来月';
                const timingClass = a.isCurrentMonth ? 'status-returned' : 'status-todo';
                const typeColor = a.type === 'settlement' ? 'var(--primary)' : a.type === 'interimPayment' ? 'var(--danger)' : a.type === 'consumptionTaxReview' ? 'var(--success, #22c55e)' : 'var(--warning)';
                return `<tr class="clickable" onclick="navigateTo('client-detail',{id:'${escapeHtml(a.clientId)}'})">
                  <td><strong>${escapeHtml(a.clientName)}</strong> <span style="font-size:11px;color:var(--gray-400);">${escapeHtml(a.clientCode)}</span></td>
                  <td><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:500;background:${typeColor};color:#fff;">${escapeHtml(a.label)}</span></td>
                  <td>${a.deadlineMonth}月</td>
                  <td><span class="status-badge ${timingClass}">${timingLabel}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  el.innerHTML = `
    <div class="stats-grid">
      ${buildStatCard('red', '期限超過', overdue, '件のタスク', { clickable: true, onclick: "dashFilterTasks('overdue')" })}
      ${buildStatCard('blue', '進行中', inProgress, '件のタスク', { clickable: true, onclick: "dashFilterTasks('進行中')" })}
      ${buildStatCard('yellow', '未着手', todo, '件のタスク', { clickable: true, onclick: "dashFilterTasks('未着手')" })}
      ${buildStatCard('green', '差戻し', returned, '件 要対応', { clickable: true, onclick: "dashFilterTasks('差戻し')" })}
    </div>

    ${taxAlertHtml}

    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>通知</h3></div>
        <div class="card-body">
          <ul class="notification-list">
            ${MOCK_DATA.notifications.map(n => {
              const clickAttr = n.linkPage ? ` class="clickable" onclick="dashNotifClick('${escapeHtml(n.id)}')" style="cursor:pointer;"` : '';
              return `
              <li class="notification-item"${clickAttr}>
                <div class="notification-dot ${n.isRead ? 'read' : 'unread'}"></div>
                <div>
                  <div class="notification-text">${n.message}</div>
                  <div class="notification-time">${formatDate(n.createdAt)}</div>
                </div>
              </li>`;
            }).join('')}
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>直近の期限タスク</h3></div>
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>顧客</th><th>タスク</th><th>期限</th><th>状態</th></tr></thead>
              <tbody>
                ${tasks.filter(t => t.status !== '完了').sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5).map(t => {
                  const client = getClientById(t.clientId);
                  return `<tr class="clickable" onclick="navigateTo('task-detail',{id:'${t.id}'})">
                    <td>${client?.name || '-'}</td>
                    <td>${t.title}</td>
                    <td>${formatDate(t.dueDate)}</td>
                    <td>${renderStatusBadge(t.status)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// タスク一覧にフィルタ付きで遷移するためのグローバル変数
let dashTaskFilter = '';

function dashFilterTasks(filter) {
  dashTaskFilter = filter;
  navigateTo('tasks');
}

function dashNotifClick(notifId) {
  const n = MOCK_DATA.notifications.find(x => x.id === notifId);
  if (!n) return;
  n.isRead = true;
  if (n.linkPage) navigateTo(n.linkPage, n.linkParams || {});
}

function createTasksFromAlerts() {
  const alerts = getTaxAlerts();
  if (alerts.length === 0) { alert('登録対象のアラートがありません'); return; }

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const year = parseInt(today.slice(0, 4));
  let created = 0;
  let skipped = 0;

  alerts.forEach(a => {
    const client = getClientById(a.clientId);
    if (!client) return;
    const title = `【${a.label}】${a.clientName}`;
    // 既に同名タスクが存在する場合はスキップ
    const exists = MOCK_DATA.tasks.some(t => t.title === title && t.status !== '完了');
    if (exists) { skipped++; return; }

    // 期限日: 該当月の末日
    const deadlineYear = a.deadlineMonth < parseInt(today.slice(5, 7)) ? year + 1 : year;
    const lastDay = new Date(deadlineYear, a.deadlineMonth, 0).getDate();
    const dueDate = `${deadlineYear}-${String(a.deadlineMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    MOCK_DATA.tasks.push({
      id: generateId('t-', MOCK_DATA.tasks),
      title,
      status: '未着手',
      dueDate,
      clientId: a.clientId,
      assigneeUserId: client.mainUserId,
      checklist: [],
      tags: ['納付'],
    });
    created++;
  });

  alert(`${created}件のタスクを登録しました${skipped > 0 ? `（${skipped}件は既存のためスキップ）` : ''}`);
  navigateTo('dashboard');
}

registerPage('dashboard', renderDashboard);
