// ===========================
// リンク集
// ===========================
function renderLinks(el) {
  const links = MOCK_DATA.externalLinks || [];

  el.innerHTML = `
    <div class="toolbar">
      <div class="spacer"></div>
      <button class="btn btn-primary btn-sm" id="links-add-btn">+ リンク追加</button>
    </div>

    ${links.length === 0 ? renderEmptyState('リンクはまだ登録されていません') : ''}

    <div id="links-list">
      ${renderLinkGroups(links)}
    </div>

    <div id="links-add-form" style="display:none;margin-top:16px;">
      <div class="card">
        <div class="card-header"><h3>リンク追加</h3></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">カテゴリ</div><div class="detail-value">
            <select id="link-add-category" class="inline-edit-input">
              <option value="報酬">報酬</option>
              <option value="マニュアル">マニュアル</option>
              <option value="ツール">ツール</option>
              <option value="その他">その他</option>
            </select>
          </div></div>
          <div class="detail-row"><div class="detail-label">タイトル</div><div class="detail-value"><input type="text" id="link-add-title" class="inline-edit-input" placeholder="例: SPOT報酬リスト"></div></div>
          <div class="detail-row"><div class="detail-label">URL</div><div class="detail-value"><input type="text" id="link-add-url" class="inline-edit-input" placeholder="https://..."></div></div>
          <div class="detail-row"><div class="detail-label">説明</div><div class="detail-value"><input type="text" id="link-add-desc" class="inline-edit-input" placeholder="任意"></div></div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button class="btn btn-primary btn-sm" onclick="submitNewLink()">追加</button>
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('links-add-form').style.display='none'">キャンセル</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('links-add-btn').addEventListener('click', () => {
    document.getElementById('links-add-form').style.display = '';
  });
}

function renderLinkGroups(links) {
  const groups = {};
  links.forEach(l => {
    const cat = l.category || 'その他';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(l);
  });

  return Object.entries(groups).map(([category, items]) => `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header"><h3>${escapeHtml(category)}</h3></div>
      <div class="card-body" style="padding:0;">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>タイトル</th><th>説明</th><th>操作</th></tr></thead>
            <tbody>
              ${items.map(l => `<tr>
                <td><a href="${escapeHtml(sanitizeUrl(l.url))}" target="_blank" rel="noopener">${escapeHtml(l.title)}</a></td>
                <td style="font-size:12px;color:var(--gray-500);">${escapeHtml(l.description || '')}</td>
                <td><button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="removeExternalLink('${l.id}')">削除</button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `).join('');
}

function submitNewLink() {
  const title = getValTrim('link-add-title');
  const url = getValTrim('link-add-url');
  const category = getVal('link-add-category', 'その他');
  const description = getValTrim('link-add-desc');
  if (!title || !url) { alert('タイトルとURLを入力してください'); return; }
  if (!MOCK_DATA.externalLinks) MOCK_DATA.externalLinks = [];
  MOCK_DATA.externalLinks.push({
    id: 'el-' + Date.now(),
    title, url, category, description,
  });
  navigateTo('links');
}

function removeExternalLink(id) {
  if (!MOCK_DATA.externalLinks) return;
  MOCK_DATA.externalLinks = MOCK_DATA.externalLinks.filter(l => l.id !== id);
  navigateTo('links');
}

registerPage('links', renderLinks);
