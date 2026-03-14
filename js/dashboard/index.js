// ===========================
// ダッシュボード
// ===========================
function renderDashboard(el) {
  const tasks = MOCK_DATA.tasks;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter(t => t.status !== '完了' && t.dueDate < today).length;
  const inProgress = tasks.filter(t => t.status === '進行中').length;
  const todo = tasks.filter(t => t.status === '未着手').length;
  const returned = tasks.filter(t => t.status === '差戻し').length;

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent-red">
        <div class="stat-label">期限超過</div>
        <div class="stat-value">${overdue}</div>
        <div class="stat-sub">件のタスク</div>
      </div>
      <div class="stat-card accent-blue">
        <div class="stat-label">進行中</div>
        <div class="stat-value">${inProgress}</div>
        <div class="stat-sub">件のタスク</div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">未着手</div>
        <div class="stat-value">${todo}</div>
        <div class="stat-sub">件のタスク</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-label">差戻し</div>
        <div class="stat-value">${returned}</div>
        <div class="stat-sub">件 要対応</div>
      </div>
    </div>

    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>通知</h3></div>
        <div class="card-body">
          <ul class="notification-list">
            ${MOCK_DATA.notifications.map(n => `
              <li class="notification-item">
                <div class="notification-dot ${n.isRead ? 'read' : 'unread'}"></div>
                <div>
                  <div class="notification-text">${n.message}</div>
                  <div class="notification-time">${formatDate(n.createdAt)}</div>
                </div>
              </li>
            `).join('')}
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
                    <td><span class="status-badge ${getStatusClass(t.status)}">${t.status}</span></td>
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

registerPage('dashboard', renderDashboard);
