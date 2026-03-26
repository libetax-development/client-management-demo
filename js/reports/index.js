// ===========================
// 報告書一覧
// ===========================
let rpPage = 1;
const rpPerPage = 20;
let rpReadFilter = '全て';      // 全て / 未読
let rpTypeFilter = '両方';      // 両方 / 業務報告書 / 日報
let rpSearchState = { category: '', author: '', period: '1年以内', dateFrom: '', dateTo: '', ranks: [], attachOnly: false, draftOnly: false, keyword: '', client: '' };
const rpExpandedSet = new Set();
let rpInitialClient = '';

function navigateToReportsWithClient(clientName) {
  rpInitialClient = clientName;
  navigateTo('reports');
}

function renderReports(el) {
  rpPage = 1;
  rpReadFilter = '全て';
  rpTypeFilter = '両方';
  rpSearchState = { category: '', author: '', period: '1年以内', dateFrom: '', dateTo: '', ranks: [], attachOnly: false, draftOnly: false, keyword: '', client: '' };

  // 進捗管理表からの顧客フィルタ遷移
  if (rpInitialClient) {
    rpSearchState.client = rpInitialClient;
    rpInitialClient = '';
  }

  el.innerHTML = `
    <div class="rp-header-bar">
      <h2>報告書一覧</h2>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="rpMarkAllRead()">全てを既読にする</button>
        <button class="btn btn-primary btn-sm" onclick="openReportModal()">+ 新規報告書</button>
      </div>
    </div>

    <div class="rp-tabs">
      <button class="rp-tab active" data-rf="全て" onclick="rpSetReadFilter(this)">全て</button>
      <button class="rp-tab" data-rf="未読" onclick="rpSetReadFilter(this)">未読</button>
      <span class="rp-tab-sep">|</span>
      <button class="rp-tab" onclick="rpExpandAll()">全て開く</button>
      <button class="rp-tab" onclick="rpCollapseAll()">全て閉じる</button>
      <span class="rp-tab-sep">|</span>
      <span class="rp-view-label">表示：</span>
      <button class="rp-tab active" data-tf="両方" onclick="rpSetTypeFilter(this)">両方</button>
      <button class="rp-tab" data-tf="業務報告書" onclick="rpSetTypeFilter(this)">業務報告書</button>
      <button class="rp-tab" data-tf="日報" onclick="rpSetTypeFilter(this)">日報</button>
    </div>

    <div class="rp-layout">
      <div>
        <div class="rp-list" id="rp-list-body"></div>
        <div class="rp-pagination" id="rp-pagination"></div>
      </div>
      <div class="rp-search-panel">
        <h4>検索</h4>
        <div class="rp-search-group">
          <label>種別：</label>
          <select id="rp-s-category">
            <option value="">すべて</option>
            <option value="確定申告">確定申告</option>
            <option value="決算業務">決算業務</option>
            <option value="月次業務">月次業務</option>
            <option value="その他">その他</option>
            <option value="日報">日報</option>
          </select>
        </div>
        <div class="rp-search-group">
          <label>顧客：</label>
          <input type="text" id="rp-s-client" placeholder="顧客名で検索...">
        </div>
        <div class="rp-search-group">
          <label>作成者：</label>
          <select id="rp-s-author">
            <option value="">すべて</option>
            ${buildUserOptions()}
          </select>
        </div>
        <div class="rp-search-group">
          <label>期間：</label>
          <div class="rp-period-btns">
            <button class="rp-period-btn active" data-p="1年以内" onclick="rpSetPeriod(this)">1年以内</button>
            <button class="rp-period-btn" data-p="2年以内" onclick="rpSetPeriod(this)">2年以内</button>
            <button class="rp-period-btn" data-p="全て" onclick="rpSetPeriod(this)">全て</button>
          </div>
          <div class="rp-date-range">
            <input type="date" id="rp-s-from">
            <span>～</span>
            <input type="date" id="rp-s-to">
          </div>
        </div>
        <div class="rp-search-group">
          <label>ランク：</label>
          <div class="rp-rank-btns" id="rp-rank-btns">
            <button class="rp-rank-btn" data-rank="A" onclick="rpToggleRank(this)">A</button>
            <button class="rp-rank-btn" data-rank="B" onclick="rpToggleRank(this)">B</button>
            <button class="rp-rank-btn" data-rank="C" onclick="rpToggleRank(this)">C</button>
            <button class="rp-rank-btn" data-rank="日報" onclick="rpToggleRank(this)">日報</button>
          </div>
        </div>
        <div class="rp-search-group">
          <label>オプション：</label>
          <div class="rp-search-opts">
            <label><input type="checkbox" id="rp-s-attach"> 添付ファイルのみ</label>
            <label><input type="checkbox" id="rp-s-draft"> 一時保存中のみ</label>
          </div>
        </div>
        <div class="rp-search-group">
          <label>キーワード：</label>
          <input type="text" id="rp-s-keyword" placeholder="キーワード検索...">
        </div>
        <div class="rp-search-actions">
          <button class="btn btn-primary btn-sm" onclick="rpDoSearch()">検索</button>
          <button class="btn btn-secondary btn-sm" onclick="rpClearSearch()">検索クリア</button>
        </div>
      </div>
    </div>
  `;
  // 顧客フィルタが設定されている場合、検索欄に反映して期間を「全て」に
  if (rpSearchState.client) {
    document.getElementById('rp-s-client').value = rpSearchState.client;
    rpSearchState.period = '全て';
    document.querySelectorAll('.rp-period-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.p === '全て'); });
  }
  rpRenderList();
}

function rpGetFiltered() {
  let reports = [...MOCK_DATA.reports];
  // 既読フィルタ
  if (rpReadFilter === '未読') reports = reports.filter(r => r.readStatus === '未読');
  // タイプフィルタ
  if (rpTypeFilter !== '両方') reports = reports.filter(r => r.type === rpTypeFilter);
  // 検索条件
  const s = rpSearchState;
  if (s.category) reports = reports.filter(r => r.category === s.category);
  if (s.client) reports = reports.filter(r => (r.clientName || '').includes(s.client));
  if (s.author) reports = reports.filter(r => r.authorId === s.author);
  if (s.ranks.length > 0) reports = reports.filter(r => s.ranks.includes(r.rank));
  if (s.attachOnly) reports = reports.filter(r => r.hasAttachment);
  if (s.draftOnly) reports = reports.filter(r => r.readStatus === '一時保存中');
  if (s.keyword) {
    const kw = s.keyword.toLowerCase();
    reports = reports.filter(r => r.title.toLowerCase().includes(kw) || (r.clientName || '').toLowerCase().includes(kw));
  }
  if (s.dateFrom) reports = reports.filter(r => r.createdAt >= s.dateFrom);
  if (s.dateTo) reports = reports.filter(r => r.createdAt <= s.dateTo + 'T23:59:59');
  // 期間プリセット
  if (s.period !== '全て' && !s.dateFrom && !s.dateTo) {
    const now = new Date();
    const years = s.period === '1年以内' ? 1 : 2;
    const cutoff = new Date(now.getFullYear() - years, now.getMonth(), now.getDate()).toISOString();
    reports = reports.filter(r => r.createdAt >= cutoff);
  }
  reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return reports;
}

function rpRenderList() {
  const all = rpGetFiltered();
  const totalPages = Math.max(1, Math.ceil(all.length / rpPerPage));
  if (rpPage > totalPages) rpPage = totalPages;
  const start = (rpPage - 1) * rpPerPage;
  const page = all.slice(start, start + rpPerPage);

  const body = document.getElementById('rp-list-body');
  if (all.length === 0) {
    body.innerHTML = renderEmptyState('該当する報告書がありません', '\ud83d\udcdd');
  } else {
    body.innerHTML = page.map(r => {
      const author = getUserById(r.authorId);
      const isUnread = r.readStatus === '未読';
      const isDraft = r.readStatus === '一時保存中';
      const badgeClass = isUnread ? 'rp-badge-unread' : isDraft ? 'rp-badge-draft' : 'rp-badge-read';
      const badgeText = isUnread ? '未読' : isDraft ? '一時保存中' : '';
      const isExpanded = rpExpandedSet.has(r.id);
      return `<div class="rp-row ${isUnread ? 'unread' : ''}" onclick="rpClickReport('${r.id}')">
        <span class="rp-row-date">${formatDate(r.createdAt)}</span>
        <span class="rp-row-author">${escapeHtml(author?.name || '-')}</span>
        <span class="rp-row-title">${r.hasAttachment ? '<span class="attach-icon">\ud83d\udcce</span>' : ''}${escapeHtml(r.title)}</span>
        ${badgeText ? `<span class="rp-row-badge ${badgeClass}">${badgeText}</span>` : '<span></span>'}
      </div>${isExpanded ? `<div class="rp-row-detail" style="padding:8px 16px 12px;font-size:13px;color:var(--gray-500);background:var(--gray-50);border-bottom:1px solid var(--gray-200);"><strong>タイトル：</strong>${escapeHtml(r.title)}<br><strong>種別：</strong>${escapeHtml(r.category || r.type || '-')}\u3000<strong>ランク：</strong>${escapeHtml(r.rank || '-')}\u3000<strong>顧客：</strong>${escapeHtml(r.clientName || '-')}</div>` : ''}`;
    }).join('');
  }

  // ページネーション
  const pag = document.getElementById('rp-pagination');
  pag.innerHTML = `
    <button onclick="rpGoPage(1)" ${rpPage <= 1 ? 'disabled' : ''}>&laquo;最初</button>
    <button onclick="rpGoPage(${rpPage - 1})" ${rpPage <= 1 ? 'disabled' : ''}>&lsaquo;前</button>
    <span class="page-info">${rpPage} / ${totalPages}</span>
    <button onclick="rpGoPage(${rpPage + 1})" ${rpPage >= totalPages ? 'disabled' : ''}>次&rsaquo;</button>
    <button onclick="rpGoPage(${totalPages})" ${rpPage >= totalPages ? 'disabled' : ''}>最後&raquo;</button>
  `;
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
                <a href="${escapeHtml(lnk.url)}" target="_blank" rel="noopener" style="flex:1;font-size:13px;word-break:break-all;">${escapeHtml(lnk.label || lnk.url)}</a>
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
