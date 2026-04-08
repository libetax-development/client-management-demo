// ===========================
// ダッシュボード
// ===========================
function renderDashboard(el) {
  const tasks = MOCK_DATA.tasks;
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });

  // 今週末（JST）を計算
  const now = new Date();
  const jstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const dayOfWeek = jstNow.getDay(); // 0=Sun
  const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const endOfWeek = new Date(jstNow);
  endOfWeek.setDate(endOfWeek.getDate() + daysToSunday);
  const endOfWeekStr = endOfWeek.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });

  // サマリー計算
  const incompleteTasks = tasks.filter(t => t.status !== '完了').length;
  const overdueTasks = tasks.filter(t => t.status !== '完了' && t.dueDate < today).length;
  const thisWeekTasks = tasks.filter(t => t.status !== '完了' && t.dueDate >= today && t.dueDate <= endOfWeekStr).length;
  const activeClients = getActiveClients().length;

  // 今日のタスク
  const todayTasks = tasks.filter(t => t.status !== '完了' && t.dueDate === today);

  el.innerHTML = `
    <!-- サマリーカード 2x2 -->
    <div class="summary-grid">
      <div class="summary-card" onclick="navigateTo('tasks')">
        <div class="summary-icon bg-gray">&#x2705;</div>
        <div class="summary-data">
          <div class="summary-value">${incompleteTasks}</div>
          <div class="summary-label">未完了タスク</div>
        </div>
      </div>
      <div class="summary-card ${overdueTasks > 0 ? 'variant-danger' : ''}" onclick="dashFilterTasks('overdue')">
        <div class="summary-icon ${overdueTasks > 0 ? 'bg-red' : 'bg-gray'}">&#x26a0;</div>
        <div class="summary-data">
          <div class="summary-value">${overdueTasks}</div>
          <div class="summary-label">期限超過</div>
        </div>
      </div>
      <div class="summary-card ${thisWeekTasks > 0 ? 'variant-warning' : ''}" onclick="dashFilterTasks('thisWeek')">
        <div class="summary-icon ${thisWeekTasks > 0 ? 'bg-yellow' : 'bg-gray'}">&#x1f551;</div>
        <div class="summary-data">
          <div class="summary-value">${thisWeekTasks}</div>
          <div class="summary-label">今週期限</div>
        </div>
      </div>
      <div class="summary-card" onclick="navigateTo('clients')">
        <div class="summary-icon bg-gray">&#x1f465;</div>
        <div class="summary-data">
          <div class="summary-value">${activeClients}</div>
          <div class="summary-label">担当顧客数</div>
        </div>
      </div>
    </div>

    <!-- 下段: 今日のタスク + 通知 -->
    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>今日のタスク</h3></div>
        <div class="card-body">
          ${todayTasks.length === 0
            ? '<div style="padding:24px;text-align:center;color:var(--gray-400);font-size:13px;">今日が期限のタスクはありません</div>'
            : `<div class="table-wrapper">
                <table>
                  <thead><tr><th>顧客</th><th>タスク</th><th>ステータス</th></tr></thead>
                  <tbody>
                    ${todayTasks.map(t => {
                      const client = getClientById(t.clientId);
                      return `<tr class="clickable" onclick="navigateTo('task-detail',{id:'${t.id}'})">
                        <td>${escapeHtml(client?.name || '-')}</td>
                        <td><strong>${escapeHtml(t.title)}</strong></td>
                        <td>${renderStatusBadge(t.status)}</td>
                      </tr>`;
                    }).join('')}
                  </tbody>
                </table>
              </div>`
          }
        </div>
      </div>

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
                  <div class="notification-text">${escapeHtml(n.message)}</div>
                  <div class="notification-time">${formatRelativeTime(n.createdAt)}</div>
                </div>
              </li>`;
            }).join('')}
          </ul>
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
