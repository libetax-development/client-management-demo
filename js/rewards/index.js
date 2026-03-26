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
      <button class="btn btn-csv btn-sm" onclick="exportRewardCSV()">CSV出力</button>
      <button class="btn btn-secondary btn-sm" onclick="openRewardAdjustModal()">+ 報酬調整</button>
    </div>

    <div class="view-tabs" id="rw-tabs">
      <button class="view-tab active" data-view="by-staff">職員別</button>
      <button class="view-tab" data-view="by-client">顧客別</button>
      <button class="view-tab" data-view="spot">SPOT報酬</button>
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

  // SPOT報酬の集計（全タブ共通で表示）
  let spotTotal = 0;
  MOCK_DATA.clients.filter(c => c.isActive).forEach(c => {
    (c.spotFees || []).forEach(sf => {
      if (sf.timing === month || sf.timing?.startsWith(month)) {
        spotTotal += sf.amount || 0;
      }
    });
  });
  const grandTotal = totalAmount + spotTotal;

  document.getElementById('rw-summary').innerHTML = `
    <div class="stat-card accent-blue">
      <div class="stat-label">報酬合計</div>
      <div class="stat-value">${grandTotal.toLocaleString()}</div>
      <div class="stat-sub">円${spotTotal > 0 ? `<span style="font-size:11px;color:var(--gray-400);"> (うちSPOT: ${spotTotal.toLocaleString()}円)</span>` : ''}</div>
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
  } else if (viewType === 'by-client') {
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
  } else if (viewType === 'spot') {
    title.textContent = 'SPOT報酬一覧';
    thead.innerHTML = '<tr><th>顧客名</th><th>種別</th><th>時期</th><th>内容</th><th>金額</th><th>主担当</th></tr>';

    // 全顧客のSPOT報酬から該当月のものを抽出
    const spotRows = [];
    MOCK_DATA.clients.filter(c => c.isActive).forEach(c => {
      (c.spotFees || []).forEach(sf => {
        if (sf.timing === month || sf.timing?.startsWith(month)) {
          spotRows.push({ client: c, spot: sf });
        }
      });
    });

    const spotTotal = spotRows.reduce((sum, r) => sum + (r.spot.amount || 0), 0);

    // サマリーにSPOT合計を追加
    document.getElementById('rw-summary').innerHTML += `
      <div class="stat-card accent-red">
        <div class="stat-label">SPOT報酬計</div>
        <div class="stat-value">${spotTotal.toLocaleString()}</div>
        <div class="stat-sub">円</div>
      </div>
    `;

    tbody.innerHTML = spotRows.length === 0
      ? '<tr><td colspan="6" style="text-align:center;color:var(--gray-400);">該当月のSPOT報酬はありません</td></tr>'
      : spotRows.map(r => {
        const main = getUserById(r.client.mainUserId);
        return `<tr class="clickable" onclick="navigateTo('client-detail',{id:'${r.client.id}'})">
          <td><strong>${escapeHtml(r.client.name)}</strong></td>
          <td>${renderTypeBadge(r.client.clientType)}</td>
          <td>${escapeHtml(r.spot.timing || '-')}</td>
          <td>${escapeHtml(r.spot.description || '-')}</td>
          <td><strong>${(r.spot.amount || 0).toLocaleString()}円</strong></td>
          <td>${main?.name || '-'}</td>
        </tr>`;
      }).join('');
  }
}

// FB#33: 報酬CSV出力
function exportRewardCSV() {
  const month = document.getElementById('rw-month-filter')?.value || '2026-03';
  const rewards = MOCK_DATA.rewards.filter(r => r.month === month);
  const adjustments = (MOCK_DATA.rewardAdjustments || []).filter(a => a.month === month);

  const header = ['月度', '職員名', '顧客名', '種別', '金額', '区分'];
  const rows = [];

  rewards.forEach(r => {
    const user = getUserById(r.userId);
    const client = getClientById(r.clientId);
    rows.push([month, user?.name || '-', client?.name || '-', r.type || '税務顧問', r.amount, '報酬']);
  });

  adjustments.forEach(a => {
    const user = getUserById(a.userId);
    const client = a.clientId ? getClientById(a.clientId) : null;
    rows.push([month, user?.name || '-', client?.name || '-', a.reason, a.amount, '調整']);
  });

  // SPOT報酬
  MOCK_DATA.clients.filter(c => c.isActive).forEach(c => {
    (c.spotFees || []).forEach(sf => {
      if (sf.timing === month || sf.timing?.startsWith(month)) {
        const main = getUserById(c.mainUserId);
        rows.push([month, main?.name || '-', c.name, sf.description || 'SPOT', sf.amount || 0, 'SPOT']);
      }
    });
  });

  downloadCSV(`報酬明細_${month}.csv`, header, rows);
}

// FB#34: 報酬調整
function openRewardAdjustModal() {
  const month = document.getElementById('rw-month-filter')?.value || '2026-03';
  const userOpts = MOCK_DATA.users.filter(u => u.isActive).map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('');
  const clientOpts = MOCK_DATA.clients.filter(c => c.isActive).map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

  const adjustments = (MOCK_DATA.rewardAdjustments || []).filter(a => a.month === month);
  const existingRows = adjustments.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--gray-400);">調整データなし</td></tr>' :
    adjustments.map(a => {
      const user = getUserById(a.userId);
      const client = a.clientId ? getClientById(a.clientId) : null;
      return `<tr>
        <td>${user?.name || '-'}</td>
        <td>${client?.name || '（全般）'}</td>
        <td>${escapeHtml(a.reason)}</td>
        <td style="text-align:right;${a.amount < 0 ? 'color:var(--danger);' : ''}">${a.amount.toLocaleString()}円</td>
        <td><button class="btn btn-secondary btn-sm" style="color:var(--danger);font-size:11px;" onclick="deleteRewardAdjust('${a.id}')">削除</button></td>
      </tr>`;
    }).join('');

  const content = document.getElementById('page-content');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'reward-adjust-modal';
  modal.innerHTML = `
    <div class="modal modal-wide">
      <div class="modal-header">
        <h3>報酬調整（${month}）</h3>
        <button class="btn-icon" onclick="closeRewardAdjustModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="table-wrapper" style="margin-bottom:20px;">
          <table>
            <thead><tr><th>職員</th><th>顧客</th><th>理由</th><th>金額</th><th>操作</th></tr></thead>
            <tbody id="rw-adj-list">${existingRows}</tbody>
          </table>
        </div>
        <div style="border-top:1px solid var(--gray-200);padding-top:16px;">
          <div style="font-weight:600;margin-bottom:12px;">新規調整を追加</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group"><label>職員</label><select id="adj-userId">${userOpts}</select></div>
            <div class="form-group"><label>顧客（任意）</label><select id="adj-clientId"><option value="">（全般）</option>${clientOpts}</select></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group"><label>理由</label><select id="adj-reason"><option>未収入金</option><option>過入金返金</option><option>報酬減額</option><option>賞与加算</option><option>その他</option></select></div>
            <div class="form-group"><label>金額（マイナスは控除）</label><input type="number" id="adj-amount" placeholder="-10000"></div>
          </div>
          <button class="btn btn-primary" onclick="submitRewardAdjust('${month}')">追加</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeRewardAdjustModal() {
  const modal = document.getElementById('reward-adjust-modal');
  if (modal) modal.remove();
}

function submitRewardAdjust(month) {
  const userId = document.getElementById('adj-userId')?.value;
  const clientId = document.getElementById('adj-clientId')?.value || null;
  const reason = document.getElementById('adj-reason')?.value;
  const amount = parseInt(document.getElementById('adj-amount')?.value);
  if (!userId || !reason || isNaN(amount)) { alert('全項目を入力してください'); return; }

  if (!MOCK_DATA.rewardAdjustments) MOCK_DATA.rewardAdjustments = [];
  MOCK_DATA.rewardAdjustments.push({
    id: generateId('ra-', MOCK_DATA.rewardAdjustments),
    month, userId, clientId, reason, amount,
  });

  closeRewardAdjustModal();
  const content = document.getElementById('page-content');
  if (content) renderRewards(content);
}

function deleteRewardAdjust(id) {
  if (!confirm('この調整を削除しますか？')) return;
  MOCK_DATA.rewardAdjustments = (MOCK_DATA.rewardAdjustments || []).filter(a => a.id !== id);
  closeRewardAdjustModal();
  const content = document.getElementById('page-content');
  if (content) renderRewards(content);
}

registerPage('rewards', renderRewards);
