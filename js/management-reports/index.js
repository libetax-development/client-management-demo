// ===========================
// 経営レポート（cm#546/#547 モック）
// ===========================

// メンバー表示トグルON時に「自分」として使うサンプル職員（長谷川 綾・第2チーム）
const MGMT_REPORT_SAMPLE_MEMBER_ID = 'u-006';

function renderManagementReports(el) {
  el.innerHTML = `
    <div class="toolbar">
      <select class="filter-select" id="mr-freq-filter">
        <option value="">提供頻度：すべて</option>
        <option value="monthly">毎月</option>
        <option value="quarterly">四半期</option>
        <option value="semiannual">半期</option>
      </select>
      <div class="spacer"></div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray-500);cursor:pointer;">
        <input type="checkbox" id="mr-member-view"> メンバー表示で確認
      </label>
    </div>

    <div class="card">
      <div class="card-header"><h3>経営レポート 対象クライアント一覧</h3></div>
      <div class="card-body">
        <div id="mr-list-container"></div>
      </div>
    </div>
  `;

  document.getElementById('mr-freq-filter').addEventListener('change', renderManagementReportsList);
  document.getElementById('mr-member-view').addEventListener('change', renderManagementReportsList);

  renderManagementReportsList();
}

function renderManagementReportsList() {
  const container = document.getElementById('mr-list-container');
  if (!container) return;

  const freqFilter = document.getElementById('mr-freq-filter')?.value || '';
  const memberView = document.getElementById('mr-member-view')?.checked || false;

  let clients = getActiveClients();

  // メンバー表示ON: サンプル職員の担当先（主/副）のみに絞る（clientAssignmentsではなくmainUserId/subUserIdで判定）
  if (memberView) {
    clients = clients.filter(c =>
      c.mainUserId === MGMT_REPORT_SAMPLE_MEMBER_ID || c.subUserId === MGMT_REPORT_SAMPLE_MEMBER_ID
    );
  }

  const rows = clients
    .map(c => ({ client: c, settings: getCompanySettings(c.id), conn: getMfConnection(c.id) }))
    .filter(r => !freqFilter || r.settings?.reportFrequency === freqFilter);

  if (rows.length === 0) {
    container.innerHTML = renderEmptyState('該当するクライアントがありません');
    return;
  }

  container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead><tr>
          <th>クライアント名/コード</th><th>連携状態</th><th>最新実績月</th><th>提供頻度</th><th>AI同意</th><th>操作</th>
        </tr></thead>
        <tbody>${rows.map(r => mgmtReportRow(r.client, r.settings, r.conn)).join('')}</tbody>
      </table>
    </div>
  `;
}

// 既存feature（clients/list.js・staff/index.js）と同様、行全体クリックで顧客詳細へ遷移
function mgmtReportRow(client, settings, conn) {
  return `<tr class="clickable" onclick="navigateTo('client-detail',{id:'${client.id}'})">
    <td><strong>${escapeHtml(client.name)}</strong><div style="font-size:11px;color:var(--gray-500);">${escapeHtml(client.clientCode)}</div></td>
    <td>${mgmtConnBadge(conn)}</td>
    <td>${settings?.latestActualMonth ? mgmtFormatMonth(settings.latestActualMonth) : '-'}</td>
    <td>${mgmtFreqLabel(settings?.reportFrequency)}</td>
    <td>${mgmtConsentCell(settings)}</td>
    <td onclick="event.stopPropagation()">${mgmtActionCell(client, settings, conn)}</td>
  </tr>`;
}

// 連携状態バッジ: connected=連携済み(緑) / token_expired=要再認証(赤) / 行なし=未連携(灰枠)
function mgmtConnBadge(conn) {
  if (!conn) return `<span class="status-badge status-outline">未連携</span>`;
  if (conn.status === 'token_expired') return `<span class="status-badge status-returned">要再認証</span>`;
  return `<span class="status-badge status-done">連携済み</span>`;
}

function mgmtFreqLabel(freq) {
  const map = { monthly: '毎月', quarterly: '四半期', semiannual: '半期' };
  return map[freq] || '-';
}

function mgmtFormatMonth(ym) {
  if (!ym) return '-';
  const [y, m] = ym.split('-');
  return `${y}年${parseInt(m, 10)}月`;
}

// AI同意の注記。「同意未取得」はgray-400不可のためwarningトークンで可読色にする
function mgmtConsentCell(settings) {
  if (settings?.aiReportConsentAt) {
    return `同意済み<div style="font-size:11px;color:var(--gray-500);">${formatDate(settings.aiReportConsentAt)}</div>`;
  }
  return `<span style="font-weight:600;color:var(--warning);">同意未取得</span>`;
}

// アクション列: 連携状態×同意×実績月の組み合わせで導線を出し分ける
function mgmtActionCell(client, settings, conn) {
  const hasConsent = !!settings?.aiReportConsentAt;
  const hasData = !!settings?.latestActualMonth;
  const isExpired = conn?.status === 'token_expired';
  const isUnlinked = !conn;

  // 要再認証: 顧客詳細への再連携導線を最優先で出す
  if (isExpired) {
    return `<button class="btn btn-secondary btn-sm" onclick="navigateTo('client-detail',{id:'${client.id}'})">再連携</button>`;
  }

  // 未連携: MF連携導線。同意も未取得なら併記（両方欠落表示）
  if (isUnlinked) {
    const consentNote = hasConsent ? '' : `<div style="font-size:11px;color:var(--warning);margin-top:4px;">同意未取得</div>`;
    return `<button class="btn btn-secondary btn-sm" onclick="navigateTo('client-detail',{id:'${client.id}'})">MF連携</button>${consentNote}`;
  }

  // 連携済み・同意未取得: 生成不可（disabledのみでは視覚的に押せそうに見えるためopacityも付与）
  if (!hasConsent) {
    return `<button class="btn btn-primary btn-sm" disabled style="opacity:.5;cursor:not-allowed;">生成</button><div style="font-size:11px;color:var(--gray-500);margin-top:4px;">同意未取得</div>`;
  }

  // 連携済み・同意済み・実績データ不足: 生成不可
  if (!hasData) {
    return `<button class="btn btn-primary btn-sm" disabled style="opacity:.5;cursor:not-allowed;">生成</button><div style="font-size:11px;color:var(--gray-500);margin-top:4px;">データ不足</div>`;
  }

  // 生成可能
  return `<button class="btn btn-primary btn-sm" id="mr-gen-${client.id}" onclick="mgmtGenerateReport('${client.id}')">生成</button><div id="mr-gen-result-${client.id}" style="margin-top:4px;"></div>`;
}

// レポート生成ダミー処理（実レポート/PDF描画は行わない・2秒後に完了表示のみ）
// setTimeout発火時にフィルタ変更等で再描画されている可能性があるため、
// クロージャでノードを抱えず都度getElementByIdし直す（stale node対策）
function mgmtGenerateReport(clientId) {
  const btn = document.getElementById(`mr-gen-${clientId}`);
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = '生成中...';

  setTimeout(() => {
    const btnNow = document.getElementById(`mr-gen-${clientId}`);
    const resultNow = document.getElementById(`mr-gen-result-${clientId}`);
    if (!btnNow || !resultNow) return; // 再描画等で行が消えていれば何もしない

    btnNow.style.display = 'none';
    resultNow.innerHTML = `
      <span style="font-size:12px;color:#166534;">レポートを生成しました</span>
      <button class="btn btn-secondary btn-sm" disabled style="margin-left:6px;">レポートを表示（準備中）</button>
    `;
  }, 2000);
}

registerPage('management-reports', renderManagementReports);
