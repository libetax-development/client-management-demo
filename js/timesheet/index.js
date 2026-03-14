// ===========================
// 工数管理
// ===========================
function renderTimesheet(el) {
  el.innerHTML = `
    <div class="toolbar">
      <select class="filter-select" id="ts-user-filter">
        <option value="">全職員</option>
        ${buildUserOptions()}
      </select>
      <input type="date" class="filter-select" id="ts-date-filter" value="2026-03-07">
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openTimesheetModal()">+ 工数入力</button>
    </div>

    <div class="stats-grid" id="ts-summary"></div>

    <div class="card">
      <div class="card-header"><h3>工数一覧</h3></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>日付</th><th>職員</th><th>顧客</th><th>作業内容</th><th>時間</th></tr></thead>
            <tbody id="ts-table-body"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  renderTimesheetData();
  bindFilters(['ts-user-filter', 'ts-date-filter'], renderTimesheetData);
}

function renderTimesheetData() {
  const userFilter = document.getElementById('ts-user-filter')?.value || '';
  const dateFilter = document.getElementById('ts-date-filter')?.value || '';

  let entries = MOCK_DATA.timeEntries.filter(e => {
    if (userFilter && e.userId !== userFilter) return false;
    if (dateFilter && e.date !== dateFilter) return false;
    return true;
  });

  entries.sort((a, b) => b.date.localeCompare(a.date) || a.userId.localeCompare(b.userId));

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const uniqueUsers = new Set(entries.map(e => e.userId)).size;
  const avgHours = uniqueUsers > 0 ? (totalHours / uniqueUsers).toFixed(1) : '0';

  document.getElementById('ts-summary').innerHTML = `
    <div class="stat-card accent-blue">
      <div class="stat-label">合計工数</div>
      <div class="stat-value">${totalHours.toFixed(1)}</div>
      <div class="stat-sub">時間</div>
    </div>
    <div class="stat-card accent-green">
      <div class="stat-label">入力済み人数</div>
      <div class="stat-value">${uniqueUsers}</div>
      <div class="stat-sub">名</div>
    </div>
    <div class="stat-card accent-yellow">
      <div class="stat-label">平均工数/人</div>
      <div class="stat-value">${avgHours}</div>
      <div class="stat-sub">時間</div>
    </div>
    <div class="stat-card accent-red">
      <div class="stat-label">件数</div>
      <div class="stat-value">${entries.length}</div>
      <div class="stat-sub">エントリ</div>
    </div>
  `;

  renderTableBody('ts-table-body', entries, e => {
    const user = getUserById(e.userId);
    const client = getClientById(e.clientId);
    return `<tr>
      <td>${formatDate(e.date)}</td>
      <td>${user?.name || '-'}</td>
      <td>${client?.name || '-'}</td>
      <td>${e.description}</td>
      <td><strong>${e.hours.toFixed(1)}h</strong></td>
    </tr>`;
  }, 5);
}

registerPage('timesheet', renderTimesheet);
