// ===========================
// カレンダー
// ===========================
function renderCalendar(el) {
  const now = new Date();
  let calYear = now.getFullYear();
  let calMonth = now.getMonth();
  let calViewMode = 'month'; // 'month' | 'week' | 'day'
  let calCurrentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  el.innerHTML = `
    <div class="toolbar" style="flex-wrap:wrap;gap:8px;">
      <button class="btn btn-secondary" id="cal-prev">&larr; <span id="cal-prev-label">前月</span></button>
      <h3 id="cal-title" style="margin:0 16px;min-width:140px;text-align:center;"></h3>
      <button class="btn btn-secondary" id="cal-next"><span id="cal-next-label">次月</span> &rarr;</button>
      <div class="view-tabs" style="margin:0 12px;">
        <button class="view-tab active" data-cal-view="month">月</button>
        <button class="view-tab" data-cal-view="week">週</button>
        <button class="view-tab" data-cal-view="day">日</button>
      </div>
      <div class="spacer"></div>
      <select class="filter-select" id="cal-type-filter">
        <option value="">全て表示</option>
        <option value="task">タスク期限のみ</option>
        <option value="event">イベントのみ</option>
      </select>
      <select class="filter-select" id="cal-user-filter">
        <option value="">全担当者</option>
        ${buildUserOptions()}
      </select>
      <button class="btn btn-primary" id="cal-add-event">+ イベント追加</button>
    </div>
    <div class="card">
      <div class="card-body" style="padding:0;">
        <div class="cal-grid" id="cal-grid"></div>
      </div>
    </div>
    <div id="cal-day-detail" style="display:none;margin-top:16px;"></div>
  `;

  function getTodayStr() {
    return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  }

  function dateStr(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function dateStrFromDate(dt) {
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  function formatTimeRange(startTime, durationMin) {
    if (!startTime) return '';
    if (!durationMin) return startTime;
    const [h, m] = startTime.split(':').map(Number);
    const endTotal = h * 60 + m + durationMin;
    const endH = String(Math.floor(endTotal / 60)).padStart(2, '0');
    const endM = String(endTotal % 60).padStart(2, '0');
    return `${startTime}〜${endH}:${endM}`;
  }

  function getWeekStart(dt) {
    const d = new Date(dt);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); // 月曜始まり
    return d;
  }

  function getFilteredData() {
    const userFilter = document.getElementById('cal-user-filter')?.value || '';
    const typeFilter = document.getElementById('cal-type-filter')?.value || '';
    const tasks = typeFilter !== 'event' ? MOCK_DATA.tasks.filter(t => {
      if (userFilter && t.assigneeUserId !== userFilter) return false;
      return true;
    }) : [];
    const events = typeFilter !== 'task' ? MOCK_DATA.calendarEvents.filter(e => {
      if (userFilter && e.userId && e.userId !== userFilter) return false;
      return true;
    }) : [];
    return { tasks, events, userFilter, typeFilter };
  }

  function updateNavLabels() {
    const labels = { month: ['前月', '次月'], week: ['前週', '次週'], day: ['前日', '次日'] };
    document.getElementById('cal-prev-label').textContent = labels[calViewMode][0];
    document.getElementById('cal-next-label').textContent = labels[calViewMode][1];
  }

  function draw() {
    updateNavLabels();
    if (calViewMode === 'month') drawMonth();
    else if (calViewMode === 'week') drawWeek();
    else drawDay();
  }

  // ── 月表示 ──
  function drawMonth() {
    document.getElementById('cal-title').textContent = `${calYear}年${calMonth + 1}月`;
    const { tasks, events, userFilter, typeFilter } = getFilteredData();
    const rawFirstDay = new Date(calYear, calMonth, 1).getDay();
    const firstDay = rawFirstDay === 0 ? 6 : rawFirstDay - 1; // 月曜始まり（0=月, 6=日）
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = getTodayStr();

    const dayHeaders = ['月', '火', '水', '木', '金', '土', '日'];
    let html = dayHeaders.map((d, i) => `<div class="cal-header ${i === 5 ? 'cal-sat' : i === 6 ? 'cal-sun' : ''}">${d}</div>`).join('');

    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-day cal-empty"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = dateStr(calYear, calMonth, d);
      const isToday = ds === today;
      const dow = (firstDay + d - 1) % 7; // 0=月, 5=土, 6=日
      const holidayName = getHolidayName(ds);
      const dayTasks = tasks.filter(t => t.dueDate === ds);
      const dayEvents = events.filter(e => {
        const eEnd = e.endDate || e.date;
        return e.date <= ds && eEnd >= ds;
      });
      const allItems = [];

      dayTasks.forEach(t => {
        const client = getClientById(t.clientId);
        allItems.push({ html: `<div class="cal-event ${getStatusClass(t.status)}" title="${escapeHtml((client?.name || '') + ': ' + t.title)}" onclick="event.stopPropagation();navigateTo('task-detail',{id:'${t.id}'})" style="cursor:pointer;">${escapeHtml(client?.name?.slice(0, 6) || '')} ${escapeHtml(t.title.slice(0, 8))}</div>` });
      });
      dayEvents.forEach(e => {
        const typeClass = e.type === 'deadline' ? 'cal-event-deadline' : e.type === 'internal' ? 'cal-event-internal' : 'cal-event-meeting';
        const multiDayLabel = e.endDate && e.endDate > e.date ? ' [複数日]' : '';
        const timeStr = e.time ? e.time + ' ' : '';
        allItems.push({ html: `<div class="cal-event ${typeClass}" title="${escapeHtml(e.title + multiDayLabel + (e.location ? ' (' + e.location + ')' : ''))}" onclick="event.stopPropagation();showCalEventDetail('${e.id}')" style="cursor:pointer;">${escapeHtml(timeStr + e.title.slice(0, 10))}${multiDayLabel}</div>` });
      });

      const isHolidayDay = !!holidayName;
      html += `<div class="cal-day ${isToday ? 'cal-today' : ''} ${dow === 6 || isHolidayDay ? 'cal-sun' : dow === 5 ? 'cal-sat' : ''}" data-date="${ds}" style="cursor:pointer;">
        <div class="cal-date">${d}${holidayName ? `<span class="cal-holiday-label">${holidayName}</span>` : ''}</div>
        ${allItems.slice(0, 3).map(i => i.html).join('')}
        ${allItems.length > 3 ? `<div class="cal-more">+${allItems.length - 3}件</div>` : ''}
      </div>`;
    }

    const grid = document.getElementById('cal-grid');
    grid.className = 'cal-grid';
    grid.innerHTML = html;

    document.querySelectorAll('.cal-day[data-date]').forEach(cell => {
      cell.addEventListener('click', () => showCalDayDetail(cell.dataset.date, userFilter, typeFilter));
    });
  }

  // ── 週表示 ──
  function drawWeek() {
    const weekStart = getWeekStart(calCurrentDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const startLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    const endLabel = `${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
    document.getElementById('cal-title').textContent = `${weekStart.getFullYear()}年 ${startLabel}〜${endLabel}`;

    const { tasks, events, userFilter, typeFilter } = getFilteredData();
    const today = getTodayStr();
    const weekDayHeaders = ['月', '火', '水', '木', '金', '土', '日'];
    const hours = [];
    for (let h = 8; h <= 20; h++) hours.push(h);

    // Build dates for the week (月〜日)
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(weekStart);
      dt.setDate(dt.getDate() + i);
      weekDates.push(dt);
    }

    let html = '<table class="cal-week-table" style="width:100%;border-collapse:collapse;font-size:12px;">';
    // Header row
    html += '<thead><tr><th style="width:60px;padding:8px;border:1px solid var(--gray-200);background:var(--gray-50);">時間</th>';
    weekDates.forEach((dt, i) => {
      const ds = dateStrFromDate(dt);
      const isToday = ds === today;
      const holidayName = getHolidayName(ds);
      const isHolidayDay = !!holidayName;
      html += `<th style="padding:8px;border:1px solid var(--gray-200);background:${isToday ? 'var(--primary-light, #e8f0fe)' : isHolidayDay ? '#fff1f2' : 'var(--gray-50)'};text-align:center;${i === 5 ? 'color:var(--primary);' : (i === 6 || isHolidayDay) ? 'color:var(--danger);' : ''}">
        ${weekDayHeaders[i]} ${dt.getDate()}${holidayName ? `<div style="font-size:9px;font-weight:400;">${holidayName}</div>` : ''}
      </th>`;
    });
    html += '</tr></thead><tbody>';

    // Allday row for tasks
    html += '<tr><td style="padding:6px;border:1px solid var(--gray-200);background:var(--gray-50);font-weight:500;text-align:center;font-size:11px;">終日</td>';
    weekDates.forEach(dt => {
      const ds = dateStrFromDate(dt);
      const dayTasks = tasks.filter(t => t.dueDate === ds);
      const alldayEvents = events.filter(e => {
        if (e.time) return false; // 時刻あり → 時間帯行に表示
        const eEnd = e.endDate || e.date;
        return e.date <= ds && eEnd >= ds;
      });
      const items = [];
      dayTasks.forEach(t => {
        const client = getClientById(t.clientId);
        items.push(`<div class="cal-event ${getStatusClass(t.status)}" style="font-size:10px;margin:1px 0;" title="${escapeHtml((client?.name || '') + ': ' + t.title)}">${escapeHtml(t.title.slice(0, 10))}</div>`);
      });
      alldayEvents.forEach(e => {
        const typeClass = e.type === 'deadline' ? 'cal-event-deadline' : e.type === 'internal' ? 'cal-event-internal' : 'cal-event-meeting';
        const multiDayLabel = e.endDate && e.endDate > e.date ? ' [複数日]' : '';
        items.push(`<div class="cal-event ${typeClass}" style="font-size:10px;margin:1px 0;" title="${escapeHtml(e.title + multiDayLabel)}">${escapeHtml(e.title.slice(0, 10))}${multiDayLabel}</div>`);
      });
      html += `<td style="padding:4px;border:1px solid var(--gray-200);vertical-align:top;min-width:100px;">${items.join('')}</td>`;
    });
    html += '</tr>';

    // Time rows
    hours.forEach(h => {
      const timeLabel = `${String(h).padStart(2, '0')}:00`;
      html += `<tr><td style="padding:6px;border:1px solid var(--gray-200);background:var(--gray-50);text-align:center;font-size:11px;">${timeLabel}</td>`;
      weekDates.forEach(dt => {
        const ds = dateStrFromDate(dt);
        const hourEvents = events.filter(e => {
          if (e.date !== ds || !e.time) return false;
          const eHour = parseInt(e.time.split(':')[0], 10);
          return eHour === h;
        });
        const items = hourEvents.map(e => {
          const typeClass = e.type === 'deadline' ? 'cal-event-deadline' : e.type === 'internal' ? 'cal-event-internal' : 'cal-event-meeting';
          const timeRange = formatTimeRange(e.time, e.duration);
          return `<div class="cal-event ${typeClass}" style="font-size:10px;margin:1px 0;cursor:pointer;" title="${escapeHtml(e.title + (e.location ? ' (' + e.location + ')' : ''))}">${escapeHtml(timeRange + ' ' + e.title.slice(0, 10))}</div>`;
        });
        html += `<td style="padding:4px;border:1px solid var(--gray-200);vertical-align:top;height:36px;">${items.join('')}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';

    const grid = document.getElementById('cal-grid');
    grid.className = '';
    grid.innerHTML = html;
  }

  // ── 日表示 ──
  function drawDay() {
    const ds = dateStrFromDate(calCurrentDate);
    const dow = ['日', '月', '火', '水', '木', '金', '土'][calCurrentDate.getDay()];
    const dayHolidayName = getHolidayName(ds);
    document.getElementById('cal-title').textContent = `${calCurrentDate.getFullYear()}年${calCurrentDate.getMonth() + 1}月${calCurrentDate.getDate()}日（${dow}）${dayHolidayName ? ' ' + dayHolidayName : ''}`;

    const { tasks, events } = getFilteredData();
    const today = getTodayStr();
    const isToday = ds === today;
    const hours = [];
    for (let h = 8; h <= 20; h++) hours.push(h);

    const dayTasks = tasks.filter(t => t.dueDate === ds);
    const alldayEvents = events.filter(e => e.date === ds && !e.time);

    let html = '<table style="width:100%;border-collapse:collapse;font-size:13px;max-width:700px;">';

    // Allday row
    if (dayTasks.length > 0 || alldayEvents.length > 0) {
      html += '<tr><td style="padding:8px;border:1px solid var(--gray-200);background:var(--gray-50);width:80px;font-weight:500;text-align:center;">終日</td><td style="padding:8px;border:1px solid var(--gray-200);vertical-align:top;">';
      dayTasks.forEach(t => {
        const client = getClientById(t.clientId);
        html += `<div class="cal-event ${getStatusClass(t.status)}" style="margin:2px 0;" title="${escapeHtml((client?.name || '') + ': ' + t.title)}">${escapeHtml(t.title)}</div>`;
      });
      alldayEvents.forEach(e => {
        const typeClass = e.type === 'deadline' ? 'cal-event-deadline' : e.type === 'internal' ? 'cal-event-internal' : 'cal-event-meeting';
        html += `<div class="cal-event ${typeClass}" style="margin:2px 0;" title="${escapeHtml(e.title)}">${escapeHtml(e.title)}</div>`;
      });
      html += '</td></tr>';
    }

    // Time rows
    hours.forEach(h => {
      const timeLabel = `${String(h).padStart(2, '0')}:00`;
      const hourEvents = events.filter(e => {
        if (e.date !== ds || !e.time) return false;
        return parseInt(e.time.split(':')[0], 10) === h;
      });
      const bgColor = isToday ? 'var(--primary-light, #f8f9ff)' : '';
      html += `<tr>
        <td style="padding:8px;border:1px solid var(--gray-200);background:var(--gray-50);text-align:center;font-size:12px;width:80px;">${timeLabel}</td>
        <td style="padding:8px;border:1px solid var(--gray-200);min-height:40px;height:40px;vertical-align:top;${bgColor ? 'background:' + bgColor + ';' : ''}">`;
      hourEvents.forEach(e => {
        const typeClass = e.type === 'deadline' ? 'cal-event-deadline' : e.type === 'internal' ? 'cal-event-internal' : 'cal-event-meeting';
        const user = e.userId ? getUserById(e.userId) : null;
        const client = e.clientId ? getClientById(e.clientId) : null;
        const timeRange = formatTimeRange(e.time, e.duration);
        const meta = [user?.name, client?.name, e.location].filter(Boolean).map(s => escapeHtml(s)).join(' / ');
        html += `<div class="cal-event ${typeClass}" style="margin:2px 0;padding:4px 8px;">
          <div style="font-weight:500;">${escapeHtml(timeRange + ' ' + e.title)}</div>
          ${meta ? `<div style="font-size:11px;opacity:0.8;">${meta}</div>` : ''}
        </div>`;
      });
      html += '</td></tr>';
    });

    html += '</table>';

    const grid = document.getElementById('cal-grid');
    grid.className = '';
    grid.innerHTML = html;
  }

  function showCalDayDetail(dateStr, userFilter, typeFilter) {
    const detail = document.getElementById('cal-day-detail');
    const dayTasks = typeFilter !== 'event' ? MOCK_DATA.tasks.filter(t => {
      if (t.dueDate !== dateStr) return false;
      if (userFilter && t.assigneeUserId !== userFilter) return false;
      return true;
    }) : [];
    const dayEvents = typeFilter !== 'task' ? MOCK_DATA.calendarEvents.filter(e => {
      const eEnd = e.endDate || e.date;
      if (e.date > dateStr || eEnd < dateStr) return false;
      if (userFilter && e.userId && e.userId !== userFilter) return false;
      return true;
    }) : [];

    if (dayTasks.length === 0 && dayEvents.length === 0) {
      detail.style.display = 'none';
      return;
    }

    const d = new Date(dateStr);
    const dateLabel = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

    let html = `<div class="card">
      <div class="card-header"><h3>${dateLabel} の予定</h3><button class="btn-icon" onclick="document.getElementById('cal-day-detail').style.display='none'">&times;</button></div>
      <div class="card-body">`;

    if (dayEvents.length > 0) {
      html += '<div style="margin-bottom:12px;"><div class="text-label">イベント</div>';
      html += dayEvents.map(e => {
        const user = e.userId ? getUserById(e.userId) : null;
        const client = e.clientId ? getClientById(e.clientId) : null;
        const typeLabel = { meeting: '面談', internal: '社内', deadline: '期限' }[e.type] || e.type;
        return `<div class="list-item-row">
          <span class="cal-event-type-badge cal-event-${e.type}" style="font-size:11px;padding:2px 8px;border-radius:4px;font-weight:600;">${typeLabel}</span>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;">${escapeHtml((e.time ? e.time + ' ' : '') + e.title)}</div>
            <div style="font-size:11px;color:var(--gray-400);">${[user?.name, client?.name, e.location].filter(Boolean).map(s => escapeHtml(s)).join(' / ')}</div>
          </div>
        </div>`;
      }).join('');
      html += '</div>';
    }

    if (dayTasks.length > 0) {
      html += '<div><div class="text-label">タスク期限</div>';
      html += dayTasks.map(t => {
        const client = getClientById(t.clientId);
        const assignee = getUserById(t.assigneeUserId);
        return `<div class="list-item-row" style="cursor:pointer;" onclick="navigateTo('task-detail',{id:'${t.id}'})">
          ${renderStatusBadge(t.status)}
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;">${escapeHtml(t.title)}</div>
            <div style="font-size:11px;color:var(--gray-400);">${escapeHtml(client?.name || '-')} / ${escapeHtml(assignee?.name || '-')}</div>
          </div>
        </div>`;
      }).join('');
      html += '</div>';
    }

    html += '</div></div>';
    detail.innerHTML = html;
    detail.style.display = 'block';
  }

  // ── ナビゲーション ──
  document.getElementById('cal-prev').addEventListener('click', () => {
    if (calViewMode === 'month') {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      calCurrentDate = new Date(calYear, calMonth, 1);
    } else if (calViewMode === 'week') {
      calCurrentDate.setDate(calCurrentDate.getDate() - 7);
      calYear = calCurrentDate.getFullYear();
      calMonth = calCurrentDate.getMonth();
    } else {
      calCurrentDate.setDate(calCurrentDate.getDate() - 1);
      calYear = calCurrentDate.getFullYear();
      calMonth = calCurrentDate.getMonth();
    }
    draw();
  });

  document.getElementById('cal-next').addEventListener('click', () => {
    if (calViewMode === 'month') {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      calCurrentDate = new Date(calYear, calMonth, 1);
    } else if (calViewMode === 'week') {
      calCurrentDate.setDate(calCurrentDate.getDate() + 7);
      calYear = calCurrentDate.getFullYear();
      calMonth = calCurrentDate.getMonth();
    } else {
      calCurrentDate.setDate(calCurrentDate.getDate() + 1);
      calYear = calCurrentDate.getFullYear();
      calMonth = calCurrentDate.getMonth();
    }
    draw();
  });

  // ── ビュー切替タブ ──
  document.querySelectorAll('[data-cal-view]').forEach(tab => {
    tab.addEventListener('click', () => {
      calViewMode = tab.dataset.calView;
      document.querySelectorAll('[data-cal-view]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // 月表示に戻る場合、calYear/calMonthを現在日付に合わせる
      if (calViewMode === 'month') {
        calYear = calCurrentDate.getFullYear();
        calMonth = calCurrentDate.getMonth();
      }
      draw();
    });
  });

  document.getElementById('cal-user-filter').addEventListener('change', draw);
  document.getElementById('cal-type-filter').addEventListener('change', draw);
  document.getElementById('cal-add-event').addEventListener('click', openEventModal);
  draw();
}

function openEventModal() {
  document.getElementById('new-ev-user').innerHTML = '<option value="">なし</option>' + buildUserOptions();
  document.getElementById('new-ev-client').innerHTML = '<option value="">なし</option>' + buildClientOptions(true);
  resetForm(['new-ev-title', 'new-ev-start-date', 'new-ev-end-date', 'new-ev-time', 'new-ev-end-time', 'new-ev-duration', 'new-ev-location', 'new-ev-link-timesheet']);
  setFormValues({ 'new-ev-type': 'meeting' });

  // エラー表示リセット
  const dateErr = document.getElementById('new-ev-date-error');
  const timeErr = document.getElementById('new-ev-time-error');
  if (dateErr) { dateErr.style.display = 'none'; dateErr.textContent = ''; }
  if (timeErr) { timeErr.style.display = 'none'; timeErr.textContent = ''; }

  // 日跨ぎ関連UI初期化（工数連動チェックボックスを通常表示）
  updateTimesheetLinkVisibility();

  // 開始日変更時に終了日をデフォルト同期 + 日跨ぎUI更新
  const startDateEl = document.getElementById('new-ev-start-date');
  const endDateEl = document.getElementById('new-ev-end-date');
  startDateEl.onchange = function () {
    if (!endDateEl.value || endDateEl.value < startDateEl.value) {
      endDateEl.value = startDateEl.value;
    }
    updateTimesheetLinkVisibility();
    clearEventFormErrors();
  };
  endDateEl.onchange = function () {
    updateTimesheetLinkVisibility();
    clearEventFormErrors();
  };

  // 顧客変更時に工数連動チェックボックスの自動ON
  document.getElementById('new-ev-client').onchange = function () {
    const isMultiDay = isEventMultiDay();
    if (!isMultiDay && this.value) {
      document.getElementById('new-ev-link-timesheet').checked = true;
    }
    updateTimesheetLinkVisibility();
  };

  showModal('event-create-modal');
}

// 日跨ぎかどうかを判定
function isEventMultiDay() {
  const startDate = getVal('new-ev-start-date');
  const endDate = getVal('new-ev-end-date');
  return startDate && endDate && endDate > startDate;
}

// 工数連動UIの表示切り替え（日跨ぎ時はdisabled表示）
function updateTimesheetLinkVisibility() {
  const normalGroup = document.getElementById('new-ev-link-timesheet-group');
  const disabledGroup = document.getElementById('new-ev-link-timesheet-disabled-group');
  if (!normalGroup || !disabledGroup) return;
  if (isEventMultiDay()) {
    normalGroup.style.display = 'none';
    disabledGroup.style.display = 'block';
    // 日跨ぎ時はチェックを強制OFF
    const cb = document.getElementById('new-ev-link-timesheet');
    if (cb) cb.checked = false;
  } else {
    normalGroup.style.display = 'flex';
    disabledGroup.style.display = 'none';
  }
}

// エラー表示クリア
function clearEventFormErrors() {
  const dateErr = document.getElementById('new-ev-date-error');
  const timeErr = document.getElementById('new-ev-time-error');
  if (dateErr) { dateErr.style.display = 'none'; dateErr.textContent = ''; }
  if (timeErr) { timeErr.style.display = 'none'; timeErr.textContent = ''; }
}

function submitNewEvent() {
  const title = getValTrim('new-ev-title');
  const startDate = getVal('new-ev-start-date');
  const endDate = getVal('new-ev-end-date');

  clearEventFormErrors();

  if (!title) { alert('タイトルを入力してください'); return; }
  if (!startDate) { alert('開始日を入力してください'); return; }
  if (!endDate) { alert('終了日を入力してください'); return; }

  // バリデーション: endDate < startDate
  if (endDate < startDate) {
    const dateErr = document.getElementById('new-ev-date-error');
    dateErr.textContent = '終了日は開始日以降の日付を選択してください';
    dateErr.style.display = 'block';
    return;
  }

  const startTime = getVal('new-ev-time') || null;
  const endTime = getVal('new-ev-end-time') || null;
  const multiDay = endDate > startDate;

  // 同日かつ終了時刻 < 開始時刻のチェック（日跨ぎ時はスキップ）
  if (!multiDay && startTime && endTime && endTime <= startTime) {
    const timeErr = document.getElementById('new-ev-time-error');
    timeErr.textContent = '終了時刻は開始時刻より後の時刻を選択してください';
    timeErr.style.display = 'block';
    return;
  }

  const linkToTimesheet = !multiDay && !!document.getElementById('new-ev-link-timesheet')?.checked;

  MOCK_DATA.calendarEvents.push({
    id: generateId('ev-', MOCK_DATA.calendarEvents),
    title,
    date: startDate,
    endDate: multiDay ? endDate : null,
    time: startTime,
    endTime: (!multiDay && endTime) ? endTime : null,
    duration: getValInt('new-ev-duration') || null,
    type: getVal('new-ev-type'),
    userId: getVal('new-ev-user') || null,
    clientId: getVal('new-ev-client') || null,
    location: getValTrim('new-ev-location') || null,
    linkToTimesheet,
  });
  hideModal('event-create-modal');
  navigateTo('calendar');
}

function showCalEventDetail(eventId) {
  const e = MOCK_DATA.calendarEvents.find(x => x.id === eventId);
  if (!e) return;
  const user = e.userId ? getUserById(e.userId) : null;
  const client = e.clientId ? getClientById(e.clientId) : null;
  const typeLabel = { meeting: '面談', internal: '社内', deadline: '期限' }[e.type] || e.type;
  const dur = e.duration ? e.duration + '分' : '-';
  const isMultiDay = e.endDate && e.endDate > e.date;
  const dateDisplay = isMultiDay
    ? `${formatDate(e.date)} 〜 ${formatDate(e.endDate)}`
    : formatDate(e.date);
  const timeDisplay = isMultiDay ? '日跨ぎ' : (e.time || '終日');
  const detail = document.getElementById('cal-day-detail');
  detail.innerHTML = `<div class="card">
    <div class="card-header"><h3>イベント詳細</h3><button class="btn-icon" onclick="document.getElementById('cal-day-detail').style.display='none'">&times;</button></div>
    <div class="card-body">
      <div class="detail-row"><div class="detail-label">タイトル</div><div class="detail-value"><strong>${escapeHtml(e.title)}</strong></div></div>
      <div class="detail-row"><div class="detail-label">種別</div><div class="detail-value">${escapeHtml(typeLabel)}</div></div>
      <div class="detail-row"><div class="detail-label">期間</div><div class="detail-value">${dateDisplay}</div></div>
      <div class="detail-row"><div class="detail-label">時間</div><div class="detail-value">${timeDisplay}</div></div>
      ${!isMultiDay ? `<div class="detail-row"><div class="detail-label">所要時間</div><div class="detail-value">${dur}</div></div>` : ''}
      <div class="detail-row"><div class="detail-label">担当者</div><div class="detail-value">${escapeHtml(user?.name || '-')}</div></div>
      ${client ? `<div class="detail-row"><div class="detail-label">顧客</div><div class="detail-value"><a href="#" onclick="event.preventDefault();navigateTo('client-detail',{id:'${client.id}'})">${escapeHtml(client.name)}</a></div></div>` : ''}
      <div class="detail-row"><div class="detail-label">場所</div><div class="detail-value">${e.location ? escapeHtml(e.location) : '-'}</div></div>
    </div>
  </div>`;
  detail.style.display = 'block';
}

registerPage('calendar', renderCalendar);
