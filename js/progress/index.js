// ===========================
// 進捗管理表（一覧）
// ===========================
function renderProgress(el) {
  el.innerHTML = `
    <div class="toolbar">
      <button class="btn btn-primary" id="pg-create-btn">+ 作成</button>
      <button class="btn btn-secondary" onclick="navigateTo('templates')">テンプレート管理</button>
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
      container.innerHTML = renderEmptyState('該当する進捗管理表がありません');
      return;
    }

    if (viewMode === 'list') {
      container.innerHTML = `
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead><tr>
                <th>分類</th><th>進捗管理表名</th><th>対象</th>
                <th>未完了（担当先）</th><th>未完了（全体）</th>
                <th>完了（担当先）</th><th>完了（全体）</th>
                <th>管理者</th><th>操作</th>
              </tr></thead>
              <tbody>
                ${sheets.map(s => {
                  const mgr = getUserById(s.managerId);
                  const totalTargets = s.targets.length;
                  const incomplete = s.targets.filter(t => Object.values(t.steps).some(v => v !== '完了')).length;
                  const myTargets = s.targets.filter(t => {
                    const c = getClientById(t.clientId);
                    return c && getAssigneeUserId(c.id, 'main') === MOCK_DATA.currentUser.id;
                  });
                  const myIncomplete = myTargets.filter(t => Object.values(t.steps).some(v => v !== '完了')).length;
                  const myComplete = myTargets.length - myIncomplete;
                  const complete = totalTargets - incomplete;
                  return `<tr class="clickable" onclick="navigateTo('progress-detail',{id:'${s.id}'})">
                    <td><span class="type-badge type-corp">${escapeHtml(s.category)}</span></td>
                    <td><strong>${escapeHtml(s.name)}</strong></td>
                    <td>${totalTargets}件</td>
                    <td>${myIncomplete > 0 ? `<span class="count-badge count-warn">${myIncomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${incomplete > 0 ? `<span class="count-badge count-warn">${incomplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${myComplete > 0 ? `<span class="count-badge" style="background:var(--success-light);color:var(--success);">${myComplete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${complete > 0 ? `<span class="count-badge" style="background:var(--success-light);color:var(--success);">${complete}</span>` : '<span style="color:var(--gray-400)">0</span>'}</td>
                    <td>${escapeHtml(mgr?.name || '-')}</td>
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
              <h3>${escapeHtml(s.name)}</h3>
              <span class="type-badge type-corp">${escapeHtml(s.category)}</span>
            </div>
            <div class="card-body">
              <div class="pg-progress-bar"><div class="pg-progress-fill" style="width:${pct}%"></div></div>
              <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gray-500);margin-top:8px;">
                <span>${complete}/${totalTargets}件 完了</span>
                <span>${pct}%</span>
              </div>
              <div style="margin-top:12px;font-size:12px;color:var(--gray-500);">管理者: ${escapeHtml(mgr?.name || '-')}</div>
              <div style="margin-top:8px;text-align:right;">
                <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();openProgressSettingsModal('${s.id}')">設定変更</button>
              </div>
            </div>
          </div>
        `;
      }).join('')}</div>`;
    }
  }

  document.getElementById('pg-create-btn').addEventListener('click', () => {
    openProgressCreateModal();
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
  if (!sheet) { el.innerHTML = renderEmptyState('進捗管理表が見つかりません'); return; }
  document.getElementById('header-title').textContent = `進捗管理表 - ${sheet.name}`;

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <a href="#" onclick="event.preventDefault();navigateTo('progress')">&larr; 進捗管理表一覧に戻る</a>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="saveAsProgressTemplate('${sheet.id}')">テンプレートとして保存</button>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('templates')">テンプレート管理</button>
      </div>
    </div>

    <div class="toolbar" style="flex-wrap:wrap;">
      <select class="filter-select" id="pd-assignee-filter">
        <option value="">全担当者</option>
        ${buildUserOptions()}
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

  let pdStatusFilter = '';

  function draw() {
    const assigneeFilter = document.getElementById('pd-assignee-filter')?.value || '';
    const mainOnly = document.getElementById('pd-main-only')?.checked || false;
    const search = (document.getElementById('pd-search')?.value || '').toLowerCase();
    const incompleteOnly = document.getElementById('pd-incomplete-only')?.checked || false;

    let targets = sheet.targets.filter(t => {
      const client = getClientById(t.clientId);
      if (!client) return false;
      if (assigneeFilter && getAssigneeUserId(client.id, 'main') !== assigneeFilter && getAssigneeUserId(client.id, 'sub') !== assigneeFilter) return false;
      if (mainOnly && getAssigneeUserId(client.id, 'main') !== MOCK_DATA.currentUser.id) return false;
      if (search && !client.name.toLowerCase().includes(search) && !client.clientCode.includes(search)) return false;
      if (incompleteOnly && Object.values(t.steps).every(v => v === '完了')) return false;
      if (pdStatusFilter === 'complete' && Object.values(t.steps).some(v => v !== '完了')) return false;
      if (pdStatusFilter === 'incomplete' && Object.values(t.steps).every(v => v === '完了')) return false;
      if (pdStatusFilter === 'returned' && !Object.values(t.steps).some(v => v === '差戻し')) return false;
      return true;
    });

    // Summary
    const totalAll = sheet.targets.length;
    const completeAll = sheet.targets.filter(t => Object.values(t.steps).every(v => v === '完了')).length;
    const incompleteAll = totalAll - completeAll;
    const returnedAll = sheet.targets.filter(t => Object.values(t.steps).some(v => v === '差戻し')).length;

    document.getElementById('pd-summary').innerHTML = `
      ${buildStatCard('blue', '対象件数', totalAll, '件', { clickable: true, active: pdStatusFilter === '', onclick: "window._pdFilter('')" })}
      ${buildStatCard('green', '完了', completeAll, '件', { clickable: true, active: pdStatusFilter === 'complete', onclick: "window._pdFilter('complete')" })}
      ${buildStatCard('yellow', '未完了', incompleteAll, '件', { clickable: true, active: pdStatusFilter === 'incomplete', onclick: "window._pdFilter('incomplete')" })}
      ${buildStatCard('red', '差戻し', returnedAll, '件', { clickable: true, active: pdStatusFilter === 'returned', onclick: "window._pdFilter('returned')" })}
    `;

    // Table header
    const stepColCount = sheet.columns.length + (sheet.showReportLink ? 1 : 0);
    // 固定列: 60+140+72+72=344, 工程列: 72px each, 備考: 120px
    const tableWidth = 344 + (stepColCount * 72) + 120;
    const table = document.querySelector('.pg-detail-table');
    if (table) table.style.width = tableWidth + 'px';

    document.getElementById('pd-thead').innerHTML = `<tr>
      <th class="pg-fixed pg-col-code">コード</th>
      <th class="pg-fixed pg-col-name">顧客名</th>
      <th class="pg-fixed pg-col-main">主担当</th>
      <th class="pg-fixed pg-col-sub">副担当</th>
      ${sheet.columns.map(c => `<th class="pg-step-col">${c}</th>`).join('')}
      ${sheet.showReportLink ? '<th class="pg-step-col">報告書</th>' : ''}
      <th style="width:120px;">備考</th>
    </tr>`;

    // Table body
    const colCount = 4 + sheet.columns.length + (sheet.showReportLink ? 1 : 0) + 1;
    document.getElementById('pd-tbody').innerHTML = targets.length === 0
      ? renderEmptyRow(colCount)
      : targets.map(t => {
        const client = getClientById(t.clientId);
        const main = client ? getAssigneeUser(client.id, 'main') : null;
        const sub = client ? getAssigneeUser(client.id, 'sub') : null;
        // 報告書件数
        let reportCell = '';
        if (sheet.showReportLink) {
          const clientName = client?.name || '';
          const reportCount = MOCK_DATA.reports.filter(r => r.clientName === clientName).length;
          if (reportCount > 0) {
            const safeClientName = clientName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            reportCell = `<td style="text-align:center;"><span class="count-badge" style="background:var(--primary-light,#e0e7ff);color:var(--primary);cursor:pointer;" onclick="event.stopPropagation();navigateToReportsWithClient('${safeClientName}')" title="報告書一覧を表示">${reportCount}</span></td>`;
          } else {
            reportCell = '<td style="text-align:center;color:var(--gray-400);font-size:12px;">-</td>';
          }
        }
        return `<tr>
          <td class="pg-fixed pg-col-code" style="font-size:11px;color:var(--gray-500);">${client?.clientCode || '-'}</td>
          <td class="pg-fixed pg-col-name"><strong style="font-size:12px;">${escapeHtml(client?.name || '-')}</strong></td>
          <td class="pg-fixed pg-col-main" style="font-size:12px;">${escapeHtml(main?.name || '-')}</td>
          <td class="pg-fixed pg-col-sub" style="font-size:12px;">${escapeHtml(sub?.name || '-')}</td>
          ${sheet.columns.map(c => {
            const val = t.steps[c] || '未着手';
            const doneDate = t.completedDates && t.completedDates[c] ? t.completedDates[c] : '';
            let cellContent = '';
            if (val === '完了') {
              cellContent = doneDate
                ? `<span class="pg-date-done" onclick="event.stopPropagation();openStatusSelect('${sheet.id}','${t.clientId}','${c}',this)">${escapeHtml(doneDate)}</span>`
                : `<span class="pg-date-done" onclick="event.stopPropagation();openStatusSelect('${sheet.id}','${t.clientId}','${c}',this)">&#10003;</span>`;
            } else if (val === '進行中') {
              cellContent = `<span class="pg-status-wip" onclick="event.stopPropagation();openStatusSelect('${sheet.id}','${t.clientId}','${c}',this)">進行中</span>`;
            } else if (val === '差戻し') {
              cellContent = `<span class="pg-status-returned" onclick="event.stopPropagation();openStatusSelect('${sheet.id}','${t.clientId}','${c}',this)">差戻し</span>`;
            } else {
              // 未着手: 空白表示、クリックで変更可能
              cellContent = `<span class="pg-status-empty" onclick="event.stopPropagation();openStatusSelect('${sheet.id}','${t.clientId}','${c}',this)">&nbsp;</span>`;
            }
            return `<td class="pg-step-cell">${cellContent}</td>`;
          }).join('')}
          ${reportCell}
          <td class="pg-note-cell" style="font-size:12px;color:var(--gray-500);max-width:200px;min-width:120px;cursor:pointer;white-space:pre-wrap;text-align:left;" onclick="event.stopPropagation();editProgressNote('${sheet.id}','${t.clientId}',this)" title="クリックでメモ編集">${t.note ? escapeHtml(t.note) : '<span style="color:var(--gray-300)">メモを追加...</span>'}</td>
        </tr>`;
      }).join('');

    document.getElementById('pd-count').textContent = `${targets.length}/${sheet.targets.length}件 表示中`;
  }

  window._pdFilter = (f) => {
    pdStatusFilter = pdStatusFilter === f ? '' : f;
    draw();
  };

  bindFilters(['pd-assignee-filter', 'pd-main-only', 'pd-search', 'pd-incomplete-only'], draw);
  draw();
}

function openStatusSelect(sheetId, clientId, colName, span) {
  const td = span.closest('td');
  if (td.querySelector('select')) return; // 二重起動防止
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const target = sheet.targets.find(t => t.clientId === clientId);
  if (!target) return;
  const current = target.steps[colName] || '未着手';
  const statuses = ['未着手', '進行中', '完了', '差戻し'];
  const sel = document.createElement('select');
  sel.style.cssText = 'font-size:12px;padding:2px 4px;border:1px solid var(--primary);border-radius:4px;max-width:72px;';
  statuses.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    if (s === current) opt.selected = true;
    sel.appendChild(opt);
  });
  span.style.display = 'none';
  td.insertBefore(sel, span);
  sel.focus();
  const save = () => {
    const newVal = sel.value;
    target.steps[colName] = newVal;
    if (!target.completedDates) target.completedDates = {};
    if (newVal === '完了') {
      // JST基準で MM/DD 形式の日付を設定
      const now = new Date();
      const parts = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }).split('-');
      target.completedDates[colName] = `${parseInt(parts[1])}/${parseInt(parts[2])}`;
    } else {
      delete target.completedDates[colName];
    }
    navigateTo('progress-detail', { id: sheetId });
  };
  sel.addEventListener('change', save);
  sel.addEventListener('blur', () => {
    sel.remove();
    span.style.display = '';
  });
}


function editProgressNote(sheetId, clientId, td) {
  if (td.querySelector('textarea')) return; // 二重起動防止
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const target = sheet.targets.find(t => t.clientId === clientId);
  if (!target) return;
  const current = target.note || '';
  const textarea = document.createElement('textarea');
  textarea.value = current;
  textarea.style.cssText = 'width:100%;min-height:48px;font-size:12px;border:1px solid var(--primary);border-radius:4px;padding:4px;resize:vertical;';
  td.innerHTML = '';
  td.appendChild(textarea);
  textarea.focus();
  let saved = false;
  const save = () => {
    if (saved) return;
    saved = true;
    target.note = textarea.value.trim();
    td.innerHTML = target.note ? escapeHtml(target.note) : '<span style="color:var(--gray-300)">メモを追加...</span>';
    td.style.cssText += 'white-space:pre-wrap;';
  };
  textarea.addEventListener('blur', save);
  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); textarea.blur(); }
    if (e.key === 'Escape') { textarea.value = current; textarea.blur(); }
  });
}

function exportProgressCSV(sheetId) {
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const header = ['顧客コード', '顧客名', ...sheet.columns, '備考'];
  const rows = sheet.targets.map(t => {
    const client = getClientById(t.clientId);
    return [client?.clientCode || '', client?.name || '', ...sheet.columns.map(c => t.steps[c] || '未着手'), t.note || ''];
  });
  downloadCSV(sheet.name + '.csv', header, rows);
}

function bulkStatusUpdate(sheetId) {
  const sheet = MOCK_DATA.progressSheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const status = prompt('一括変更先のステータスを選択してください:\n1: 未着手\n2: 進行中\n3: 完了\n\n番号を入力');
  const map = { '1': '未着手', '2': '進行中', '3': '完了' };
  const target = map[status];
  if (!target) return;
  const now = new Date();
  const parts = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }).split('-');
  const todayMD = `${parseInt(parts[1])}/${parseInt(parts[2])}`;
  sheet.targets.forEach(t => {
    if (!t.completedDates) t.completedDates = {};
    sheet.columns.forEach(c => {
      if (t.steps[c] !== '完了') {
        t.steps[c] = target;
        if (target === '完了') {
          t.completedDates[c] = todayMD;
        } else {
          delete t.completedDates[c];
        }
      }
    });
  });
  navigateTo('progress-detail', { id: sheetId });
}

registerPage('progress', renderProgress);
registerPage('progress-detail', renderProgressDetail);
