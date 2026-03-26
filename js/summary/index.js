// ===========================
// 集計
// ===========================
function renderSummary(el) {
  const activeClients = MOCK_DATA.clients.filter(c => c.isActive);
  const allTasks = MOCK_DATA.tasks;
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });

  // 担当者別顧客数
  const staffClientCount = {};
  MOCK_DATA.users.filter(u => u.isActive).forEach(u => {
    staffClientCount[u.id] = { name: u.name, main: 0, sub: 0, total: 0 };
  });
  activeClients.forEach(c => {
    if (c.mainUserId && staffClientCount[c.mainUserId]) {
      staffClientCount[c.mainUserId].main++;
      staffClientCount[c.mainUserId].total++;
    }
    if (c.subUserId && staffClientCount[c.subUserId]) {
      staffClientCount[c.subUserId].sub++;
      staffClientCount[c.subUserId].total++;
    }
  });

  // 担当者別タスク件数
  const staffTaskCount = {};
  MOCK_DATA.users.filter(u => u.isActive).forEach(u => {
    staffTaskCount[u.id] = { name: u.name, active: 0, overdue: 0, completed: 0 };
  });
  allTasks.forEach(t => {
    if (!staffTaskCount[t.assigneeUserId]) return;
    if (t.status === '完了') staffTaskCount[t.assigneeUserId].completed++;
    else {
      staffTaskCount[t.assigneeUserId].active++;
      if (t.dueDate < today) staffTaskCount[t.assigneeUserId].overdue++;
    }
  });

  // 種別別顧客数
  const typeCounts = { '法人': 0, '個人': 0 };
  activeClients.forEach(c => { typeCounts[c.clientType] = (typeCounts[c.clientType] || 0) + 1; });

  // 月額報酬合計
  const totalMonthly = activeClients.reduce((sum, c) => sum + (c.monthlySales || 0), 0);

  el.innerHTML = `
    <div class="stats-grid" style="margin-bottom:24px;">
      ${buildStatCard('blue', '契約中顧客', activeClients.length, '件')}
      ${buildStatCard('green', '法人', typeCounts['法人'] || 0, '件')}
      ${buildStatCard('yellow', '個人', typeCounts['個人'] || 0, '件')}
      ${buildStatCard('red', '月額報酬合計', totalMonthly.toLocaleString(), '円（税抜）', { valueStyle: 'font-size:20px' })}
    </div>

    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>担当者別 顧客数</h3></div>
        <div class="card-body" style="padding:0;">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>担当者</th><th>主担当</th><th>副担当</th><th>合計</th></tr></thead>
              <tbody>
                ${Object.values(staffClientCount).filter(s => s.total > 0).sort((a, b) => b.total - a.total).map(s => `
                  <tr>
                    <td><strong>${escapeHtml(s.name)}</strong></td>
                    <td>${s.main}</td>
                    <td>${s.sub}</td>
                    <td><strong>${s.total}</strong></td>
                  </tr>
                `).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--gray-400)">データなし</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>担当者別 タスク状況</h3></div>
        <div class="card-body" style="padding:0;">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>担当者</th><th>進行中</th><th>期限超過</th><th>完了</th></tr></thead>
              <tbody>
                ${Object.values(staffTaskCount).filter(s => s.active > 0 || s.completed > 0).sort((a, b) => b.active - a.active).map(s => `
                  <tr>
                    <td><strong>${escapeHtml(s.name)}</strong></td>
                    <td>${s.active}</td>
                    <td>${s.overdue > 0 ? `<span style="color:var(--danger);font-weight:600;">${s.overdue}</span>` : '0'}</td>
                    <td>${s.completed}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--gray-400)">データなし</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

registerPage('summary', renderSummary);
