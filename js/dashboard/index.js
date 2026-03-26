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
      <div class="card-header" style="background:var(--danger-light);border-bottom:1px solid #fecaca;">
        <h3 style="color:var(--danger);display:flex;align-items:center;gap:8px;">&#x1f514; 納付期限アラート <span style="font-size:12px;font-weight:400;color:var(--gray-500);">${taxAlerts.length}件</span></h3>
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
      <div class="stat-card accent-red clickable" onclick="dashFilterTasks('overdue')">
        <div class="stat-label">期限超過</div>
        <div class="stat-value">${overdue}</div>
        <div class="stat-sub">件のタスク</div>
      </div>
      <div class="stat-card accent-blue clickable" onclick="dashFilterTasks('進行中')">
        <div class="stat-label">進行中</div>
        <div class="stat-value">${inProgress}</div>
        <div class="stat-sub">件のタスク</div>
      </div>
      <div class="stat-card accent-yellow clickable" onclick="dashFilterTasks('未着手')">
        <div class="stat-label">未着手</div>
        <div class="stat-value">${todo}</div>
        <div class="stat-sub">件のタスク</div>
      </div>
      <div class="stat-card accent-green clickable" onclick="dashFilterTasks('差戻し')">
        <div class="stat-label">差戻し</div>
        <div class="stat-value">${returned}</div>
        <div class="stat-sub">件 要対応</div>
      </div>
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

registerPage('dashboard', renderDashboard);
