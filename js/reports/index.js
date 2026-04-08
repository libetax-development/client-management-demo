// ===========================
// 報告書一覧
// ===========================
let rpPage = 1;
const rpPerPage = 20;
let rpInitialClient = '';
let rpReadFilter = 'all';
let rpTypeFilter = 'all';
let rpExpandedSet = new Set();
let rpSearchState = { category: '', author: '', period: '1年以内', dateFrom: '', dateTo: '', ranks: [], attachOnly: false, draftOnly: false, keyword: '', client: '' };

function navigateToReportsWithClient(clientName) {
  rpInitialClient = clientName;
  navigateTo('reports');
}

function renderReports(el) {
  rpPage = 1;

  el.innerHTML = `
    <div class="toolbar" style="flex-wrap:wrap;gap:8px;">
      <input type="text" class="search-input" placeholder="タイトルで検索..." id="rp-search">
      <select class="filter-select" id="rp-type-filter">
        <option value="">全種別</option>
        <option value="業務報告書">業務報告書</option>
        <option value="日報">日報</option>
      </select>
      <select class="filter-select" id="rp-category-filter">
        <option value="">全カテゴリ</option>
        <option value="確定申告">確定申告</option>
        <option value="決算業務">決算業務</option>
        <option value="月次業務">月次業務</option>
        <option value="その他">その他</option>
      </select>
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openReportModal()">+ 報告書作成</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th style="width:40px;"></th><th>タイトル</th><th>顧客</th><th>作成者</th><th>種別</th><th>カテゴリ</th><th>ランク</th><th>作成日</th></tr></thead>
          <tbody id="rp-table-body"></tbody>
        </table>
      </div>
      <div id="rp-pagination" class="rp-pagination"></div>
    </div>
  `;

  // 進捗管理表からの顧客フィルタ遷移
  if (rpInitialClient) {
    document.getElementById('rp-search').value = rpInitialClient;
    rpInitialClient = '';
  }

  rpRenderList();
  bindFilters(['rp-search', 'rp-type-filter', 'rp-category-filter'], () => { rpPage = 1; rpRenderList(); });
}

function rpGetFiltered() {
  let reports = [...MOCK_DATA.reports];
  const search = (document.getElementById('rp-search')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('rp-type-filter')?.value || '';
  const categoryFilter = document.getElementById('rp-category-filter')?.value || '';

  reports = filterByKeyword(reports, search, ['title', 'clientName']);
  reports = filterByField(reports, 'type', typeFilter);
  reports = filterByField(reports, 'category', categoryFilter);

  reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return reports;
}

function rpRenderList() {
  const all = rpGetFiltered();
  const totalPages = Math.max(1, Math.ceil(all.length / rpPerPage));
  if (rpPage > totalPages) rpPage = totalPages;
  const start = (rpPage - 1) * rpPerPage;
  const page = all.slice(start, start + rpPerPage);

  const tbody = document.getElementById('rp-table-body');
  if (all.length === 0) {
    tbody.innerHTML = renderEmptyRow(8, '該当する報告書がありません');
  } else {
    tbody.innerHTML = page.map(r => {
      const author = getUserById(r.authorId);
      const isUnread = r.readStatus === '未読';
      const unreadDot = isUnread ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--primary);"></span>' : '';
      const rowBg = isUnread ? ' style="background:rgba(37,99,235,0.04);"' : '';
      const rankBadge = r.rank
        ? `<span class="status-badge ${r.rank === 'A' ? 'status-done' : r.rank === 'B' ? 'status-todo' : 'status-outline'}" style="font-size:11px;">${r.rank}</span>`
        : '-';
      return `<tr class="clickable" onclick="rpClickReport('${r.id}')"${rowBg}>
        <td style="text-align:center;">${unreadDot}</td>
        <td><strong>${escapeHtml(r.title)}</strong></td>
        <td>${escapeHtml(r.clientName || '-')}</td>
        <td>${escapeHtml(author?.name || '-')}</td>
        <td><span class="status-badge status-outline" style="font-size:11px;">${escapeHtml(r.type)}</span></td>
        <td>${escapeHtml(r.category || '-')}</td>
        <td>${rankBadge}</td>
        <td>${formatDate(r.createdAt)}</td>
      </tr>`;
    }).join('');
  }

  // ページネーション
  const pag = document.getElementById('rp-pagination');
  if (all.length > rpPerPage) {
    pag.innerHTML = `
      <button onclick="rpGoPage(${rpPage - 1})" ${rpPage <= 1 ? 'disabled' : ''}>← 前</button>
      <span class="page-info">${rpPage} / ${totalPages}</span>
      <button onclick="rpGoPage(${rpPage + 1})" ${rpPage >= totalPages ? 'disabled' : ''}>次 →</button>
      <span style="margin-left:8px;font-size:11px;">(全${all.length}件)</span>
    `;
  } else {
    pag.innerHTML = '';
  }
}

function rpGoPage(n) { rpPage = n; rpRenderList(); }

function rpSetReadFilter(btn) {
  rpReadFilter = btn.dataset.rf;
  btn.closest('.rp-tabs').querySelectorAll('[data-rf]').forEach(b => b.classList.toggle('active', b === btn));
  rpPage = 1;
  rpRenderList();
}

function rpSetTypeFilter(btn) {
  rpTypeFilter = btn.dataset.tf;
  btn.closest('.rp-tabs').querySelectorAll('[data-tf]').forEach(b => b.classList.toggle('active', b === btn));
  rpPage = 1;
  rpRenderList();
}

function rpMarkAllRead() {
  MOCK_DATA.reports.forEach(r => { if (r.readStatus === '未読') r.readStatus = '既読'; });
  rpRenderList();
}

function rpClickReport(id) {
  const r = MOCK_DATA.reports.find(x => x.id === id);
  if (r && r.readStatus === '未読') r.readStatus = '既読';
  navigateTo('report-detail', { id });
}

// ===========================
// 報告書詳細
// ===========================
function renderReportDetail(el, params) {
  const r = MOCK_DATA.reports.find(x => x.id === params.id);
  if (!r) { el.innerHTML = renderEmptyState('報告書が見つかりません'); return; }
  const author = getUserById(r.authorId);
  document.getElementById('header-title').textContent = `報告書詳細 - ${r.title}`;

  // bodyフィールドがあればそれを使用、なければモック本文を生成
  const mockBody = r.body || generateReportBody(r);

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('reports')">&larr; 報告書一覧に戻る</a></div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-header">
          <h3>${escapeHtml(r.title)}</h3>
          <div style="display:flex;gap:8px;">
            <span class="rp-row-badge ${r.readStatus === '未読' ? 'rp-badge-unread' : r.readStatus === '一時保存中' ? 'rp-badge-draft' : 'rp-badge-read'}">${escapeHtml(r.readStatus)}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="pre-wrap">${escapeHtml(mockBody)}</div>
          ${r.hasAttachment ? '<div class="info-box" style="margin-top:16px;"><span style="font-size:13px;">&#128206; 添付ファイル: <a href="#" onclick="event.preventDefault();alert(\'ファイルを開きます（モック）\')">' + escapeHtml(r.title.slice(0, 20)) + '_資料.pdf</a></span></div>' : ''}
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><h3>報告書情報</h3></div>
          <div class="card-body">
            <div class="detail-row"><div class="detail-label">作成者</div><div class="detail-value">${escapeHtml(author?.name || '-')}</div></div>
            <div class="detail-row"><div class="detail-label">作成日時</div><div class="detail-value">${formatDate(r.createdAt)}</div></div>
            <div class="detail-row"><div class="detail-label">種別</div><div class="detail-value">${escapeHtml(r.type)}</div></div>
            <div class="detail-row"><div class="detail-label">業務分類</div><div class="detail-value">${escapeHtml(r.category)}</div></div>
            <div class="detail-row"><div class="detail-label">顧客</div><div class="detail-value">${escapeHtml(r.clientName || '-')}</div></div>
            <div class="detail-row"><div class="detail-label">ランク</div><div class="detail-value"><span class="rp-rank-display rp-rank-${r.rank}">${r.rank}</span></div></div>
            <div class="detail-row"><div class="detail-label">添付ファイル</div><div class="detail-value">${r.hasAttachment ? 'あり' : 'なし'}</div></div>
          </div>
        </div>
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><h3>外部リンク</h3></div>
          <div class="card-body">
            <div id="rp-links-list">${(r.links || []).map((lnk, i) => `
              <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray-100);">
                <a href="${escapeHtml(sanitizeUrl(lnk.url))}" target="_blank" rel="noopener" style="flex:1;font-size:13px;word-break:break-all;">${escapeHtml(lnk.label || lnk.url)}</a>
                <button class="btn-icon" title="削除" style="font-size:14px;color:var(--gray-400);" onclick="rpRemoveLink('${r.id}',${i})">×</button>
              </div>
            `).join('') || '<div style="padding:4px 0;font-size:13px;color:var(--gray-400);">リンクはまだありません</div>'}</div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <input type="text" class="search-input" id="rp-link-url" style="flex:2;width:auto;font-size:13px;" placeholder="URL（例: https://drive.google.com/...）">
              <input type="text" class="search-input" id="rp-link-label" style="flex:1;width:auto;font-size:13px;" placeholder="表示名（任意）">
              <button class="btn btn-primary btn-sm" onclick="rpAddLink('${r.id}')">追加</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>操作</h3></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="alert('Chatworkに転送しました（モック）')">Chatworkに転送</button>
            <button class="btn btn-secondary btn-sm" onclick="alert('PDFをダウンロードしました（モック）')">PDF出力</button>
            ${r.readStatus === '一時保存中' ? '<button class="btn btn-primary btn-sm" onclick="rpSubmitDraft(\'' + r.id + '\')">提出する</button>' : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function rpAddLink(reportId) {
  const urlInput = document.getElementById('rp-link-url');
  const labelInput = document.getElementById('rp-link-label');
  const url = urlInput.value.trim();
  if (!url) { alert('URLを入力してください'); return; }
  const r = MOCK_DATA.reports.find(x => x.id === reportId);
  if (!r) return;
  if (!r.links) r.links = [];
  r.links.push({ url: url, label: labelInput.value.trim() || url });
  navigateTo('report-detail', { id: reportId });
}

function rpRemoveLink(reportId, idx) {
  const r = MOCK_DATA.reports.find(x => x.id === reportId);
  if (!r || !r.links) return;
  r.links.splice(idx, 1);
  navigateTo('report-detail', { id: reportId });
}

function rpSubmitDraft(id) {
  const r = MOCK_DATA.reports.find(x => x.id === id);
  if (r) {
    r.readStatus = '未読';
    navigateTo('report-detail', { id });
  }
}

function generateReportBody(r) {
  if (r.type === '日報') {
    return `【日報】${r.title}

■ 本日の業務内容
・顧客対応（面談・メール・チャット）
・書類作成・チェック業務
・社内ミーティング参加

■ 明日の予定
・申告書類の最終確認
・顧客フォローアップ

■ 所感・連絡事項
特になし`;
  }
  const templates = {
    '確定申告': `【確定申告】${r.clientName}

■ 作業内容
${r.title}

■ 実施事項
・会計帳簿のチェック（仕訳内容・勘定科目の確認）
・前年度との比較分析
・不明点の洗い出しと顧客への確認事項整理

■ 確認事項
・売上計上基準の確認が必要
・経費の按分比率について顧客に確認中

■ 次のアクション
・顧客からの回答待ち → 回答後に申告書ドラフト作成予定
・レビュー依頼予定日: 未定`,

    '決算業務': `【決算業務】${r.clientName}

■ 作業内容
${r.title}

■ 実施事項
・決算整理仕訳の確認
・減価償却費の計算
・引当金の計上確認

■ 特記事項
・固定資産台帳との照合完了
・税効果会計の適用確認中

■ 次のアクション
・申告書作成に着手予定`,

    '月次業務': `【月次業務】${r.clientName}

■ 作業内容
${r.title}

■ 実施事項
・月次試算表の作成
・前月比較分析
・資金繰り表の更新

■ 連絡事項
・異常値なし
・顧客への月次報告完了`,
  };
  return templates[r.category] || `【${r.category}】${r.clientName}

■ 作業内容
${r.title}

■ 実施事項
・業務対応実施

■ 備考
特になし`;
}

function rpExpandAll() {
  const all = rpGetFiltered();
  const start = (rpPage - 1) * rpPerPage;
  const page = all.slice(start, start + rpPerPage);
  page.forEach(r => rpExpandedSet.add(r.id));
  rpRenderList();
}
function rpCollapseAll() {
  rpExpandedSet.clear();
  rpRenderList();
}

function rpSetPeriod(btn) {
  rpSearchState.period = btn.dataset.p;
  btn.closest('.rp-period-btns').querySelectorAll('.rp-period-btn').forEach(b => b.classList.toggle('active', b === btn));
}

function rpToggleRank(btn) {
  btn.classList.toggle('active');
  const rank = btn.dataset.rank;
  const idx = rpSearchState.ranks.indexOf(rank);
  if (idx >= 0) rpSearchState.ranks.splice(idx, 1);
  else rpSearchState.ranks.push(rank);
}

function rpDoSearch() {
  rpSearchState.category = document.getElementById('rp-s-category').value;
  rpSearchState.client = document.getElementById('rp-s-client').value.trim();
  rpSearchState.author = document.getElementById('rp-s-author').value;
  rpSearchState.dateFrom = document.getElementById('rp-s-from').value;
  rpSearchState.dateTo = document.getElementById('rp-s-to').value;
  rpSearchState.attachOnly = document.getElementById('rp-s-attach').checked;
  rpSearchState.draftOnly = document.getElementById('rp-s-draft').checked;
  rpSearchState.keyword = document.getElementById('rp-s-keyword').value.trim();
  rpPage = 1;
  rpRenderList();
}

function rpClearSearch() {
  rpSearchState = { category: '', author: '', period: '1年以内', dateFrom: '', dateTo: '', ranks: [], attachOnly: false, draftOnly: false, keyword: '', client: '' };
  document.getElementById('rp-s-category').value = '';
  document.getElementById('rp-s-client').value = '';
  document.getElementById('rp-s-author').value = '';
  document.getElementById('rp-s-from').value = '';
  document.getElementById('rp-s-to').value = '';
  document.getElementById('rp-s-attach').checked = false;
  document.getElementById('rp-s-draft').checked = false;
  document.getElementById('rp-s-keyword').value = '';
  document.querySelectorAll('.rp-rank-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.rp-period-btn').forEach(b => b.classList.toggle('active', b.dataset.p === '1年以内'));
  rpPage = 1;
  rpRenderList();
}

registerPage('reports', renderReports);
registerPage('report-detail', renderReportDetail);
