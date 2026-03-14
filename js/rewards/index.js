// ===========================
// 報酬管理
// ===========================
function renderRewards(el) {
  el.innerHTML = `
    <div class="toolbar">
      <select class="filter-select" id="rw-month-filter">
        <option value="2026-03">2026年3月</option>
        <option value="2026-02">2026年2月</option>
        <option value="2026-01">2026年1月</option>
      </select>
      <div class="spacer"></div>
    </div>

    <div class="view-tabs" id="rw-tabs">
      <button class="view-tab active" data-view="by-staff">職員別</button>
      <button class="view-tab" data-view="by-client">顧客別</button>
    </div>

    <div class="stats-grid" id="rw-summary"></div>

    <div class="card">
      <div class="card-header"><h3 id="rw-table-title">職員別 報酬集計</h3></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead id="rw-thead"></thead>
            <tbody id="rw-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  let activeView = 'by-staff';
  function refresh() {
    const month = document.getElementById('rw-month-filter')?.value || '2026-03';
    renderRewardData(month, activeView);
  }

  document.getElementById('rw-tabs').addEventListener('click', e => {
    if (e.target.dataset.view) {
      activeView = e.target.dataset.view;
      document.querySelectorAll('#rw-tabs .view-tab').forEach(b => b.classList.toggle('active', b.dataset.view === activeView));
      refresh();
    }
  });
  document.getElementById('rw-month-filter').addEventListener('change', refresh);
  refresh();
}

function renderRewardData(month, viewType) {
  const rewards = MOCK_DATA.rewards.filter(r => r.month === month);
  const totalAmount = rewards.reduce((sum, r) => sum + r.amount, 0);
  const totalClients = new Set(rewards.map(r => r.clientId)).size;
  const totalStaff = new Set(rewards.map(r => r.userId)).size;

  document.getElementById('rw-summary').innerHTML = `
    <div class="stat-card accent-blue">
      <div class="stat-label">報酬合計</div>
      <div class="stat-value">${totalAmount.toLocaleString()}</div>
      <div class="stat-sub">円</div>
    </div>
    <div class="stat-card accent-green">
      <div class="stat-label">対象職員</div>
      <div class="stat-value">${totalStaff}</div>
      <div class="stat-sub">名</div>
    </div>
    <div class="stat-card accent-yellow">
      <div class="stat-label">対象顧客</div>
      <div class="stat-value">${totalClients}</div>
      <div class="stat-sub">社</div>
    </div>
  `;

  const thead = document.getElementById('rw-thead');
  const tbody = document.getElementById('rw-tbody');
  const title = document.getElementById('rw-table-title');

  if (viewType === 'by-staff') {
    title.textContent = '職員別 報酬集計';
    thead.innerHTML = '<tr><th>職員名</th><th>分類</th><th>基準割合</th><th>担当顧客数</th><th>報酬計</th></tr>';
    const grouped = {};
    rewards.forEach(r => {
      if (!grouped[r.userId]) grouped[r.userId] = { total: 0, clients: new Set() };
      grouped[r.userId].total += r.amount;
      grouped[r.userId].clients.add(r.clientId);
    });

    tbody.innerHTML = Object.entries(grouped).map(([uid, data]) => {
      const user = getUserById(uid);
      return `<tr>
        <td><strong>${user?.name || '-'}</strong></td>
        <td>${user?.staffFlag || '-'}</td>
        <td>${user?.baseRatio != null ? user.baseRatio + '%' : '-'}</td>
        <td>${data.clients.size}社</td>
        <td><strong>${data.total.toLocaleString()}円</strong></td>
      </tr>`;
    }).join('');
  } else {
    title.textContent = '顧客別 報酬内訳';
    thead.innerHTML = '<tr><th>顧客名</th><th>種別</th><th>月額報酬</th><th>担当者</th><th>配分額</th></tr>';
    const grouped = {};
    rewards.forEach(r => {
      if (!grouped[r.clientId]) grouped[r.clientId] = [];
      grouped[r.clientId].push(r);
    });

    let rows = '';
    Object.entries(grouped).forEach(([cid, rws]) => {
      const client = getClientById(cid);
      rws.forEach((r, i) => {
        const user = getUserById(r.userId);
        rows += `<tr>
          ${i === 0 ? `<td rowspan="${rws.length}"><strong>${client?.name || '-'}</strong></td><td rowspan="${rws.length}"><span class="type-badge ${client?.clientType === '法人' ? 'type-corp' : 'type-individual'}">${client?.clientType}</span></td><td rowspan="${rws.length}">${client?.monthlySales?.toLocaleString() || '-'}円</td>` : ''}
          <td>${user?.name || '-'}</td>
          <td>${r.amount.toLocaleString()}円</td>
        </tr>`;
      });
    });
    tbody.innerHTML = rows;
  }
}

registerPage('rewards', renderRewards);
