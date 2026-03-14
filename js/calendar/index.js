// ===========================
// カレンダー
// ===========================
function renderCalendar(el) {
  const now = new Date();
  let calYear = now.getFullYear();
  let calMonth = now.getMonth();

  el.innerHTML = `
    <div class="toolbar">
      <button class="btn btn-secondary" id="cal-prev">&larr; 前月</button>
      <h3 id="cal-title" style="margin:0 16px;min-width:140px;text-align:center;"></h3>
      <button class="btn btn-secondary" id="cal-next">次月 &rarr;</button>
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
    </div>
    <div class="card">
      <div class="card-body" style="padding:0;">
        <div class="cal-grid" id="cal-grid"></div>
      </div>
    </div>
    <div id="cal-day-detail" style="display:none;margin-top:16px;"></div>
  `;

  function draw() {
    document.getElementById('cal-title').textContent = `${calYear}年${calMonth + 1}月`;
    const userFilter = document.getElementById('cal-user-filter')?.value || '';
    const typeFilter = document.getElementById('cal-type-filter')?.value || '';
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date().toISOString().slice(0, 10);

    let tasks = typeFilter !== 'event' ? MOCK_DATA.tasks.filter(t => {
      if (userFilter && t.assigneeUserId !== userFilter) return false;
      return true;
    }) : [];

    let events = typeFilter !== 'task' ? MOCK_DATA.calendarEvents.filter(e => {
      if (userFilter && e.userId && e.userId !== userFilter) return false;
      return true;
    }) : [];

    const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];
    let html = dayHeaders.map((d, i) => `<div class="cal-header ${i === 0 ? 'cal-sun' : i === 6 ? 'cal-sat' : ''}">${d}</div>`).join('');

    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-day cal-empty"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === today;
      const dow = (firstDay + d - 1) % 7;
      const dayTasks = tasks.filter(t => t.dueDate === dateStr);
      const dayEvents = events.filter(e => e.date === dateStr);
      const allItems = [];

      dayTasks.forEach(t => {
        const client = getClientById(t.clientId);
        allItems.push({ html: `<div class="cal-event ${getStatusClass(t.status)}" title="${client?.name}: ${t.title}">${client?.name?.slice(0, 6) || ''} ${t.title.slice(0, 8)}</div>` });
      });
      dayEvents.forEach(e => {
        const typeClass = e.type === 'deadline' ? 'cal-event-deadline' : e.type === 'internal' ? 'cal-event-internal' : 'cal-event-meeting';
        const timeStr = e.time ? e.time + ' ' : '';
        allItems.push({ html: `<div class="cal-event ${typeClass}" title="${e.title}${e.location ? ' (' + e.location + ')' : ''}">${timeStr}${e.title.slice(0, 10)}</div>` });
      });

      html += `<div class="cal-day ${isToday ? 'cal-today' : ''} ${dow === 0 ? 'cal-sun' : dow === 6 ? 'cal-sat' : ''}" data-date="${dateStr}" style="cursor:pointer;">
        <div class="cal-date">${d}</div>
        ${allItems.slice(0, 3).map(i => i.html).join('')}
        ${allItems.length > 3 ? `<div class="cal-more">+${allItems.length - 3}件</div>` : ''}
      </div>`;
    }

    document.getElementById('cal-grid').innerHTML = html;

    // 日付クリックで詳細表示
    document.querySelectorAll('.cal-day[data-date]').forEach(cell => {
      cell.addEventListener('click', () => showCalDayDetail(cell.dataset.date, userFilter, typeFilter));
    });
  }

  function showCalDayDetail(dateStr, userFilter, typeFilter) {
    const detail = document.getElementById('cal-day-detail');
    const dayTasks = typeFilter !== 'event' ? MOCK_DATA.tasks.filter(t => {
      if (t.dueDate !== dateStr) return false;
      if (userFilter && t.assigneeUserId !== userFilter) return false;
      return true;
    }) : [];
    const dayEvents = typeFilter !== 'task' ? MOCK_DATA.calendarEvents.filter(e => {
      if (e.date !== dateStr) return false;
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
      html += '<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:600;color:var(--gray-500);margin-bottom:8px;">イベント</div>';
      html += dayEvents.map(e => {
        const user = e.userId ? getUserById(e.userId) : null;
        const client = e.clientId ? getClientById(e.clientId) : null;
        const typeLabel = { meeting: '面談', internal: '社内', deadline: '期限' }[e.type] || e.type;
        return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--gray-100);">
          <span class="cal-event-type-badge cal-event-${e.type}" style="font-size:11px;padding:2px 8px;border-radius:4px;font-weight:600;">${typeLabel}</span>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;">${e.time ? e.time + ' ' : ''}${e.title}</div>
            <div style="font-size:11px;color:var(--gray-400);">${[user?.name, client?.name, e.location].filter(Boolean).join(' / ')}</div>
          </div>
        </div>`;
      }).join('');
      html += '</div>';
    }

    if (dayTasks.length > 0) {
      html += '<div><div style="font-size:12px;font-weight:600;color:var(--gray-500);margin-bottom:8px;">タスク期限</div>';
      html += dayTasks.map(t => {
        const client = getClientById(t.clientId);
        const assignee = getUserById(t.assigneeUserId);
        return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--gray-100);cursor:pointer;" onclick="navigateTo('task-detail',{id:'${t.id}'})">
          ${renderStatusBadge(t.status)}
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;">${t.title}</div>
            <div style="font-size:11px;color:var(--gray-400);">${client?.name || '-'} / ${assignee?.name || '-'}</div>
          </div>
        </div>`;
      }).join('');
      html += '</div>';
    }

    html += '</div></div>';
    detail.innerHTML = html;
    detail.style.display = 'block';
  }

  document.getElementById('cal-prev').addEventListener('click', () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } draw(); });
  document.getElementById('cal-next').addEventListener('click', () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } draw(); });
  document.getElementById('cal-user-filter').addEventListener('change', draw);
  document.getElementById('cal-type-filter').addEventListener('change', draw);
  draw();
}

registerPage('calendar', renderCalendar);
