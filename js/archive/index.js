// ===========================
// アーカイブ
// ===========================
function renderArchive(el) {
  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="顧客名・タイトルで検索..." id="arch-search">
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openArchiveAddModal()">+ アーカイブ追加</button>
    </div>
    <div id="archive-list"></div>
  `;
  renderArchiveList();
  bindFilters(['arch-search'], renderArchiveList);
}

function renderArchiveList() {
  const search = (document.getElementById('arch-search')?.value || '').toLowerCase();
  const container = document.getElementById('archive-list');
  if (!container) return;

  // 顧客別にグループ化
  const grouped = {};
  MOCK_DATA.clientArchives.forEach(a => {
    const client = getClientById(a.clientId);
    const clientName = client?.name || '不明な顧客';
    if (search && !clientName.toLowerCase().includes(search) && !a.title.toLowerCase().includes(search)) return;
    if (!grouped[a.clientId]) grouped[a.clientId] = { client, items: [] };
    grouped[a.clientId].items.push(a);
  });

  const groups = Object.values(grouped);
  if (groups.length === 0) {
    container.innerHTML = renderEmptyState('アーカイブはありません');
    return;
  }

  container.innerHTML = groups.map(g => `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header">
        <h3>${escapeHtml(g.client?.name || '不明な顧客')}</h3>
        <span style="font-size:12px;color:var(--gray-400);">${g.items.length}件</span>
      </div>
      <div class="card-body">
        ${g.items.map(a => `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100);">
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:500;margin-bottom:4px;">
                <a href="${escapeHtml(sanitizeUrl(a.url))}" target="_blank">${escapeHtml(a.title)}</a>
              </div>
              ${a.description ? `<div style="font-size:12px;color:var(--gray-500);">${escapeHtml(a.description)}</div>` : ''}
              <div style="font-size:11px;color:var(--gray-400);margin-top:4px;">${formatDate(a.createdAt)}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteArchive('${a.id}')">削除</button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function deleteArchive(archId) {
  const archive = MOCK_DATA.clientArchives.find(a => a.id === archId);
  if (!confirm(`アーカイブ「${archive ? archive.name : archId}」を削除しますか？\nこの操作は取り消せません。`)) return;
  const idx = MOCK_DATA.clientArchives.findIndex(a => a.id === archId);
  if (idx >= 0) MOCK_DATA.clientArchives.splice(idx, 1);
  renderArchiveList();
}

// ===========================
// アーカイブ追加モーダル
// ===========================
function openArchiveAddModal() {
  document.getElementById('arch-add-client').innerHTML = buildClientOptions(false);
  resetForm(['arch-add-title', 'arch-add-url', 'arch-add-desc']);
  showModal('arch-add-modal');
}

function submitArchiveAdd() {
  const clientId = getVal('arch-add-client');
  const title = getValTrim('arch-add-title');
  const url = getValTrim('arch-add-url');
  const desc = getValTrim('arch-add-desc');
  if (!title) { alert('タイトルを入力してください'); return; }
  if (!url) { alert('URLを入力してください'); return; }

  MOCK_DATA.clientArchives.push({
    id: generateId('arch-', MOCK_DATA.clientArchives),
    clientId, title, url, description: desc,
    createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }),
  });

  hideModal('arch-add-modal');
  if (currentPage === 'archive') renderArchiveList();
}

registerPage('archive', renderArchive);
