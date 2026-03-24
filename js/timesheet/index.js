// ===========================
// 工数管理
// ===========================
function renderTimesheet(el) {
  const now = new Date();
  let tsViewMode = 'day'; // 'day' | 'week' | 'month'
  let tsCurrentDate = new Date(2026, 2, 7); // モックデータに合わせた初期値

  function dateStrFromDate(dt) {
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  function getWeekStart(dt) {
    const d = new Date(dt);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); // 月曜始まり（日曜は前週の月曜）
    return d;
  }

  function getWeekEnd(dt) {
    const d = getWeekStart(dt);
    d.setDate(d.getDate() + 6); // 日曜
    return d;
  }

  function getDateLabel() {
    const y = tsCurrentDate.getFullYear();
    const m = tsCurrentDate.getMonth() + 1;
    const d = tsCurrentDate.getDate();
    if (tsViewMode === 'day') {
      const dow = ['日', '月', '火', '水', '木', '金', '土'][tsCurrentDate.getDay()];
      return `${y}年${m}月${d}日（${dow}）`;
    } else if (tsViewMode === 'week') {
      const ws = getWeekStart(tsCurrentDate);
      const we = getWeekEnd(tsCurrentDate);
      return `${ws.getFullYear()}年 ${ws.getMonth() + 1}/${ws.getDate()}〜${we.getMonth() + 1}/${we.getDate()}`;
    } else {
      return `${y}年${m}月`;
    }
  }

  function getNavLabels() {
    return { day: ['前日', '次日'], week: ['前週', '次週'], month: ['前月', '次月'] }[tsViewMode];
  }

  el.innerHTML = `
    <div class="toolbar" style="flex-wrap:wrap;gap:8px;">
      <select class="filter-select" id="ts-user-filter">
        <option value="">全職員</option>
        ${buildUserOptions()}
      </select>
      <button class="btn btn-secondary" id="ts-prev">&larr; <span id="ts-prev-label">前日</span></button>
      <h3 id="ts-title" style="margin:0 12px;min-width:160px;text-align:center;font-size:15px;"></h3>
      <button class="btn btn-secondary" id="ts-next"><span id="ts-next-label">次日</span> &rarr;</button>
      <div class="view-tabs" style="margin:0 8px;">
        <button class="view-tab active" data-ts-view="day">日</button>
        <button class="view-tab" data-ts-view="week">週</button>
        <button class="view-tab" data-ts-view="month">月</button>
      </div>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openTimesheetModal()">+ 工数入力</button>
    </div>

    <div class="stats-grid" id="ts-summary"></div>

    <div class="card">
      <div class="card-header"><h3>工数一覧</h3></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>日付</th><th>職員</th><th>顧客</th><th>作業内容</th><th>時間</th><th>操作</th></tr></thead>
            <tbody id="ts-table-body"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function filterEntries() {
    const userFilter = document.getElementById('ts-user-filter')?.value || '';

    let entries = MOCK_DATA.timeEntries.filter(e => {
      if (userFilter && e.userId !== userFilter) return false;

      if (tsViewMode === 'day') {
        return e.date === dateStrFromDate(tsCurrentDate);
      } else if (tsViewMode === 'week') {
        const ws = getWeekStart(tsCurrentDate);
        const we = getWeekEnd(tsCurrentDate);
        const wsStr = dateStrFromDate(ws);
        const weStr = dateStrFromDate(we);
        return e.date >= wsStr && e.date <= weStr;
      } else {
        // month
        const y = tsCurrentDate.getFullYear();
        const m = tsCurrentDate.getMonth();
        const monthStart = `${y}-${String(m + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(y, m + 1, 0).getDate();
        const monthEnd = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        return e.date >= monthStart && e.date <= monthEnd;
      }
    });

    return entries;
  }

  function renderData() {
    // ナビラベル更新
    const labels = getNavLabels();
    document.getElementById('ts-prev-label').textContent = labels[0];
    document.getElementById('ts-next-label').textContent = labels[1];
    document.getElementById('ts-title').textContent = getDateLabel();

    let entries = filterEntries();
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
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editTimeEntry('${e.id}')" style="font-size:11px;">編集</button>
          <button class="btn-icon" onclick="deleteTimeEntry('${e.id}')" style="color:var(--danger);">&times;</button>
        </td>
      </tr>`;
    }, 6);
  }

  // ── ナビゲーション ──
  document.getElementById('ts-prev').addEventListener('click', () => {
    if (tsViewMode === 'day') {
      tsCurrentDate.setDate(tsCurrentDate.getDate() - 1);
    } else if (tsViewMode === 'week') {
      tsCurrentDate.setDate(tsCurrentDate.getDate() - 7);
    } else {
      tsCurrentDate.setMonth(tsCurrentDate.getMonth() - 1);
    }
    renderData();
  });

  document.getElementById('ts-next').addEventListener('click', () => {
    if (tsViewMode === 'day') {
      tsCurrentDate.setDate(tsCurrentDate.getDate() + 1);
    } else if (tsViewMode === 'week') {
      tsCurrentDate.setDate(tsCurrentDate.getDate() + 7);
    } else {
      tsCurrentDate.setMonth(tsCurrentDate.getMonth() + 1);
    }
    renderData();
  });

  // ── ビュー切替タブ ──
  document.querySelectorAll('[data-ts-view]').forEach(tab => {
    tab.addEventListener('click', () => {
      tsViewMode = tab.dataset.tsView;
      document.querySelectorAll('[data-ts-view]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderData();
    });
  });

  document.getElementById('ts-user-filter').addEventListener('change', renderData);
  renderData();
}

function editTimeEntry(id) {
  openTimesheetModal(id);
}

function deleteTimeEntry(id) {
  if (!confirm('この工数エントリを削除しますか？')) return;
  MOCK_DATA.timeEntries = MOCK_DATA.timeEntries.filter(e => e.id !== id);
  // ページ再描画
  navigateTo('timesheet');
}

registerPage('timesheet', renderTimesheet);
