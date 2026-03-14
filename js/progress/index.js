// ===========================
// 進捗管理表（一覧）
// ===========================
function renderProgress(el) {
  el.innerHTML = `
    <div class="toolbar">
      <div class="dropdown" style="position:relative;">
        <button class="btn btn-primary" id="pg-create-btn">+ 作成</button>
        <div class="dropdown-menu" id="pg-create-menu" style="display:none;position:absolute;top:100%;left:0;margin-top:4px;background:#fff;border:1px solid var(--gray-200);border-radius:6px;box-shadow:var(--shadow-lg);z-index:10;min-width:240px;">
          <a href="#" class="dropdown-item" onclick="event.preventDefault();openProgressCreateModal('通常')">進捗管理表の作成（通常版）</a>
          <a href="#" class="dropdown-item" onclick="event.preventDefault();openProgressCreateModal('中間申告・予定納付')">進捗管理表の作成（中間申告・予定納付）</a>
          <a href="#" class="dropdown-item" onclick="event.preventDefault();openProgressCreateModal('サンプル')">サンプルから作成</a>
        </div>
      </div>
      <div class="spacer"></div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray-500);cursor:pointer;">
        <input type="checkbox" id="pg-show-hidden"> 公開範囲外の進捗管理表を表示
      </label>
    </div>

    <div class="view-tabs" id="pg-tabs">
      <button class="view-tab active" data-tab="active">利用中</button>
      <button class="view-tab" data-tab="ended">終了分</button>
    </div>

    <div class="view-tabs" style="margin-bottom:16px;" id="pg-view-mode">
      <button class="view-tab active" data-mode="list">リスト形式</button>
      <button class="view-tab" data-mode="grid">グリッド形式</button>
    </div>

    <div id="pg-list"></div>
  `;

  let activeTab = 'active';
  let viewMode = 'list';

  function draw() {
    const sheets = MOCK_DATA.progressSheets.filter(s => {
      if (activeTab === 'active') return s.status === '利用中';
      return s.status === '終了';
    });

    const container = document.getElementById('pg-list');

    if (sheets.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">?</div><p>該当する進捗管理表がありません</p></div>';
      return;
    }

    if (viewMode === 'list') {
      container.innerHTML = `
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead><tr>
                <th>分類</th><th>進捗管理表名</th><th>対象</th>
                <th>期限到来（担当先）</th><th>期限到来（全体）</th>
                <th>未完了（担当先）</th><th>未完了（全体）</th>
                <th>管理者</th><th>操作</th>
              </tr></thead>
              <tbody>
                ${sheets.map(s => {
                  const mgr = getUserById(s.managerId);
                  const totalTargets = s.targets.length;
                  const incomplete = s.targets.filter(t => Object.values(t.steps).some(v => v !== '完了')).length;
                  const myTargets = s.targets.filter(t => {
                    const c = getClientById(t.clientId);
                    return c && c.mainUserId === MOCK_DATA.currentUser.id;
                  });
                  const myIncomplete = myTargets.filter(t => Object.values(t.steps).some(v => v !== '完了')).length;
                  return `<tr class="clickable" onclick="navigateTo('progress-detail',{id:'${s.id}'})">
                    <td><span class="type-badge type-corp">${s.category}</span></td>
                    <td><strong>${s.name}</strong></td>
                    <td>${totalTargets}件</td>
                    <td>${myIncomplete > 0 ? `<span class="count-badge count-warn">${myIncomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${incomplete > 0 ? `<span class="count-badge count-warn">${incomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${myIncomplete > 0 ? `<span class="count-badge count-warn">${myIncomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${incomplete > 0 ? `<span class="count-badge count-warn">${incomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${mgr?.name || '-'}</td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();openProgressSettingsModal('${s.id}')">設定変更</button>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `<div class="pg-grid">${sheets.map(s => {
        const mgr = getUserById(s.managerId);
        const totalTargets = s.targets.length;
        const complete = s.targets.filter(t => Object.values(t.steps).every(v => v === '完了')).length;
        const pct = totalTargets > 0 ? Math.round((complete / totalTargets) * 100) : 0;
        return `
          <div class="card clickable" onclick="navigateTo('progress-detail',{id:'${s.id}'})" style="cursor:pointer;">
            <div class="card-header">
              <h3>${s.name}</h3>
              <span class="type-badge type-corp">${s.category}</span>
            </div>
            <div class="card-body">
              <div class="pg-progress-bar"><div class="pg-progress-fill" style="width:${pct}%"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gray-500);margin-top:8px;">
                <span>${complete}/${totalTargets}件 完了</span>
                <span>${pct}%</span>
              </div>
              <div style="margin-top:12px;font-size:12px;color:var(--gray-500);">管理者: ${mgr?.name || '-'}</div>
            </div>
          </div>
        `;
      }).join('')}</div>`;
    }
  }

  document.getElementById('pg-create-btn').addEventListener('click', () => {
    const menu = document.getElementById('pg-create-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('pg-tabs').addEventListener('click', e => {
    if (e.target.dataset.tab) {
      activeTab = e.target.dataset.tab;
      document.querySelectorAll('#pg-tabs .view-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
      draw();
    }
  });

  document.getElementById('pg-view-mode').addEventListener('click', e => {
    if (e.target.dataset.mode) {
      viewMode = e.target.dataset.mode;
      document.querySelectorAll('#pg-view-mode .view-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === viewMode));
      draw();
    }
  });

  draw();
}

// ===========================
// 進捗管理表（詳細）
// ===========================
function renderProgressDetail(el, params) {
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === params.id);
  if (!sheet) { el.innerHTML = '<div class="empty-state"><div class="icon">?</div><p>進捗管理表が見つかりません</p></div>'; return; }
  document.getElementById('header-title').textContent = `進捗管理表 - ${sheet.name}`;

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('progress')">&larr; 進捗管理表一覧に戻る</a></div>

    <div class="toolbar" style="flex-wrap:wrap;">
      <select class="filter-select" id="pd-assignee-filter">
        <option value="">全担当者</option>
        ${MOCK_DATA.users.filter(u => u.isActive).map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
      </select>
      <label style="display:flex;align-items:center;gap:4px;font-size:12px;">
        <input type="checkbox" id="pd-main-only"> 主担当先のみ
      </label>
      <input type="text" class="search-input" placeholder="キーワード検索..." id="pd-search" style="width:180px;">
      <label style="display:flex;align-items:center;gap:4px;font-size:12px;">
        <input type="checkbox" id="pd-incomplete-only"> 未完了のみ
      </label>
      <div class="spacer"></div>
      <button class="btn btn-secondary btn-sm" onclick="exportProgressCSV('${sheet.id}')">エクスポート</button>
      <button class="btn btn-secondary btn-sm" onclick="bulkStatusUpdate('${sheet.id}')">一括操作</button>
    </div>

    <div class="stats-grid" id="pd-summary"></div>

    <div class="card">
      <div class="card-body" style="padding:0;overflow-x:auto;">
        <table class="pg-detail-table">
          <thead id="pd-thead"></thead>
          <tbody id="pd-tbody"></tbody>
        </table>
      </div>
    </div>
    <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:12px;color:var(--gray-400);" id="pd-count"></div>
    </div>
  `;

  function draw() {
    const assigneeFilter = document.getElementById('pd-assignee-filter')?.value || '';
    const mainOnly = document.getElementById('pd-main-only')?.checked || false;
    const search = (document.getElementById('pd-search')?.value || '').toLowerCase();
    const incompleteOnly = document.getElementById('pd-incomplete-only')?.checked || false;

    let targets = sheet.targets.filter(t => {
      const client = getClientById(t.clientId);
      if (!client) return false;
      if (assigneeFilter && client.mainUserId !== assigneeFilter && client.subUserId !== assigneeFilter) return false;
      if (mainOnly && client.mainUserId !== MOCK_DATA.currentUser.id) return false;
      if (search && !client.name.toLowerCase().includes(search) && !client.clientCode.includes(search)) return false;
      if (incompleteOnly && Object.values(t.steps).every(v => v === '完了')) return false;
      return true;
    });

    // Summary
    const totalAll = sheet.targets.length;
    const completeAll = sheet.targets.filter(t => Object.values(t.steps).every(v => v === '完了')).length;
    const incompleteAll = totalAll - completeAll;
    const returnedAll = sheet.targets.filter(t => Object.values(t.steps).some(v => v === '差戻し')).length;

    document.getElementById('pd-summary').innerHTML = `
      <div class="stat-card accent-blue">
        <div class="stat-label">対象件数</div>
        <div class="stat-value">${totalAll}</div>
        <div class="stat-sub">件</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-label">完了</div>
        <div class="stat-value">${completeAll}</div>
        <div class="stat-sub">件</div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">未完了</div>
        <div class="stat-value">${incompleteAll}</div>
        <div class="stat-sub">件</div>
      </div>
      <div class="stat-card accent-red">
        <div class="stat-label">差戻し</div>
        <div class="stat-value">${returnedAll}</div>
        <div class="stat-sub">件</div>
      </div>
    `;

    // Table header
    document.getElementById('pd-thead').innerHTML = `<tr>
      <th>コード</th><th>顧客名</th><th>主担当</th><th>担当税理士</th>
      ${sheet.columns.map(c => `<th class="pg-step-col">${c}</th>`).join('')}
      <th>備考</th>
    </tr>`;

    // Table body
    document.getElementById('pd-tbody').innerHTML = targets.length === 0
      ? `<tr><td colspan="${4 + sheet.columns.length + 1}" style="text-align:center;color:var(--gray-400);padding:24px;">該当するデータがありません</td></tr>`
      : targets.map(t => {
        const client = getClientById(t.clientId);
        const main = getUserById(client?.mainUserId);
        const mgr = getUserById(client?.mgrUserId);
        return `<tr>
          <td>${client?.clientCode || '-'}</td>
          <td><strong>${client?.name || '-'}</strong></td>
          <td>${main?.name || '-'}</td>
          <td>${mgr?.name || '-'}</td>
          ${sheet.columns.map(c => {
            const val = t.steps[c] || '未着手';
            return `<td class="pg-step-cell"><span class="status-badge ${getStatusClass(val)}" style="cursor:pointer;" onclick="event.stopPropagation();cycleProgressStatus('${sheet.id}','${t.clientId}','${c}')">${val}</span></td>`;
          }).join('')}
          <td style="font-size:12px;color:var(--gray-500);max-width:160px;">${t.note || ''}</td>
        </tr>`;
      }).join('');

    document.getElementById('pd-count').textContent = `${targets.length}/${sheet.targets.length}件 表示中`;
  }

  document.getElementById('pd-assignee-filter').addEventListener('change', draw);
  document.getElementById('pd-main-only').addEventListener('change', draw);
  document.getElementById('pd-search').addEventListener('input', draw);
  document.getElementById('pd-incomplete-only').addEventListener('change', draw);
  draw();
}

function cycleProgressStatus(sheetId, clientId, colName) {
  const cycle = ['未着手', '進行中', '完了', '差戻し'];
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const target = sheet.targets.find(t => t.clientId === clientId);
  if (!target) return;
  const current = target.steps[colName] || '未着手';
  const idx = cycle.indexOf(current);
  target.steps[colName] = cycle[(idx + 1) % cycle.length];
  navigateTo('progress-detail', { id: sheetId });
}

function exportProgressCSV(sheetId) {
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const header = ['顧客コード', '顧客名', ...sheet.columns];
  const rows = sheet.targets.map(t => {
    const client = getClientById(t.clientId);
    return [client?.clientCode || '', client?.name || '', ...sheet.columns.map(c => t.steps[c] || '未着手')];
  });
  const csvContent = [header, ...rows].map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sheet.name + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function bulkStatusUpdate(sheetId) {
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const status = prompt('一括変更先のステータスを選択してください:\n1: 未着手\n2: 進行中\n3: 完了\n\n番号を入力');
  const map = { '1': '未着手', '2': '進行中', '3': '完了' };
  const target = map[status];
  if (!target) return;
  sheet.targets.forEach(t => {
    sheet.columns.forEach(c => {
      if (t.steps[c] !== '完了') t.steps[c] = target;
    });
  });
  navigateTo('progress-detail', { id: sheetId });
}

registerPage('progress', renderProgress);
registerPage('progress-detail', renderProgressDetail);
