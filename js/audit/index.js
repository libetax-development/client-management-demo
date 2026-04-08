// ===========================
// 監査ログ
// ===========================
let auditPage = 1;
const auditPerPage = 20;

function renderAudit(el) {
  auditPage = 1;

  const eventTypes = [...new Set(MOCK_DATA.auditLogs.map(l => l.eventType))];

  el.innerHTML = `
    <div class="toolbar">
      <select class="filter-select" id="audit-event-filter">
        <option value="">全イベント</option>
        ${eventTypes.map(t => `<option value="${t}">${getAuditEventLabel(t)}</option>`).join('')}
      </select>
      <select class="filter-select" id="audit-user-filter">
        <option value="">全ユーザー</option>
        ${buildUserOptions()}
      </select>
      <div class="spacer"></div>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>日時</th><th>ユーザー</th><th>イベント種別</th><th>テーブル</th><th>レコードID</th></tr></thead>
          <tbody id="audit-table-body"></tbody>
        </table>
      </div>
      <div id="audit-pagination" class="rp-pagination"></div>
    </div>
  `;
  renderAuditTable();
  bindFilters(['audit-event-filter', 'audit-user-filter'], () => { auditPage = 1; renderAuditTable(); });
}

function getAuditEventLabel(eventType) {
  const map = {
    client_created: '顧客作成', client_updated: '顧客更新',
    task_created: 'タスク作成', task_updated: 'タスク更新',
    login_success: 'ログイン成功', login_failed: 'ログイン失敗',
  };
  return map[eventType] || eventType;
}

function renderAuditTable() {
  const eventFilter = document.getElementById('audit-event-filter')?.value || '';
  const userFilter = document.getElementById('audit-user-filter')?.value || '';

  let logs = MOCK_DATA.auditLogs.filter(l => {
    if (eventFilter && l.eventType !== eventFilter) return false;
    if (userFilter && l.userId !== userFilter) return false;
    return true;
  });

  // 新しい順
  logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = logs.length;
  const totalPages = Math.max(1, Math.ceil(total / auditPerPage));
  const start = (auditPage - 1) * auditPerPage;
  const pageItems = logs.slice(start, start + auditPerPage);

  renderTableBody('audit-table-body', pageItems, l => {
    const user = getUserById(l.userId);
    return `<tr>
      <td>${formatDateTime(l.createdAt)}</td>
      <td>${escapeHtml(user?.name || '-')}</td>
      <td>${getAuditEventLabel(l.eventType)}</td>
      <td>${l.tableName || '-'}</td>
      <td style="font-family:monospace;font-size:12px;">${l.recordId || '-'}</td>
    </tr>`;
  }, 5);

  // ページネーション
  const pag = document.getElementById('audit-pagination');
  if (pag) {
    pag.innerHTML = `
      <button onclick="auditPage=Math.max(1,auditPage-1);renderAuditTable()" ${auditPage <= 1 ? 'disabled' : ''}>← 前</button>
      <span class="page-info">${auditPage} / ${totalPages}</span>
      <button onclick="auditPage=Math.min(${totalPages},auditPage+1);renderAuditTable()" ${auditPage >= totalPages ? 'disabled' : ''}>次 →</button>
      <span style="margin-left:8px;font-size:11px;">(全${total}件)</span>
    `;
  }
}

registerPage('audit', renderAudit);
