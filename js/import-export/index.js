// ===========================
// インポート/エクスポート
// ===========================
function renderImportExport(el) {
  el.innerHTML = `
    <div class="view-tabs" id="ie-tabs" style="margin-bottom:16px;">
      <button class="view-tab active" data-ietab="import">インポート</button>
      <button class="view-tab" data-ietab="export">エクスポート</button>
      <button class="view-tab" data-ietab="ie-template">テンプレート</button>
    </div>

    <div id="ietab-import">
      <div class="card">
        <div class="card-header"><h3>CSVインポート</h3></div>
        <div class="card-body">
          <div class="form-group">
            <label>インポート対象</label>
            <select id="ie-import-target" class="filter-select">
              <option value="clients">顧客</option>
              <option value="tasks">タスク</option>
              <option value="users">職員</option>
            </select>
          </div>
          <div class="form-group">
            <label>CSVファイル</label>
            <input type="file" id="ie-import-file" accept=".csv" style="font-size:13px;">
          </div>
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <button class="btn btn-secondary" onclick="ieRunDryRun()">ドライラン（プレビュー）</button>
            <button class="btn btn-primary" onclick="ieRunImport()">インポート実行</button>
          </div>
          <div id="ie-import-result"></div>
        </div>
      </div>
    </div>

    <div id="ietab-export" style="display:none;">
      <div class="card">
        <div class="card-header"><h3>CSVエクスポート</h3></div>
        <div class="card-body">
          <div class="form-group">
            <label>エクスポート対象</label>
            <select id="ie-export-target" class="filter-select">
              <option value="clients">顧客</option>
              <option value="tasks">タスク</option>
              <option value="users">職員</option>
              <option value="timeEntries">工数</option>
            </select>
          </div>
          <div class="form-group">
            <label>フィルタ</label>
            <select id="ie-export-filter" class="filter-select">
              <option value="all">全件</option>
              <option value="active">有効のみ</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="ieRunExport()">CSV出力</button>
        </div>
      </div>
    </div>

    <div id="ietab-ie-template" style="display:none;">
      <div class="card">
        <div class="card-header"><h3>CSVテンプレート</h3></div>
        <div class="card-body">
          <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px;">インポート用のCSVテンプレートをダウンロードできます。</p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--gray-50);border-radius:6px;">
              <div>
                <div style="font-size:14px;font-weight:500;">顧客テンプレート</div>
                <div style="font-size:12px;color:var(--gray-400);">顧客情報のインポート用</div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="ieDownloadTemplate('clients')">ダウンロード</button>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--gray-50);border-radius:6px;">
              <div>
                <div style="font-size:14px;font-weight:500;">タスクテンプレート</div>
                <div style="font-size:12px;color:var(--gray-400);">タスク情報のインポート用</div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="ieDownloadTemplate('tasks')">ダウンロード</button>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--gray-50);border-radius:6px;">
              <div>
                <div style="font-size:14px;font-weight:500;">職員テンプレート</div>
                <div style="font-size:12px;color:var(--gray-400);">職員情報のインポート用</div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="ieDownloadTemplate('users')">ダウンロード</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // タブ切り替え
  document.getElementById('ie-tabs').addEventListener('click', e => {
    const tab = e.target.dataset?.ietab;
    if (!tab) return;
    document.querySelectorAll('#ie-tabs .view-tab').forEach(b => b.classList.toggle('active', b.dataset.ietab === tab));
    ['import', 'export', 'ie-template'].forEach(t => {
      const el = document.getElementById('ietab-' + t);
      if (el) el.style.display = t === tab ? '' : 'none';
    });
  });
}

// ===========================
// ドライラン
// ===========================
function ieRunDryRun() {
  const target = document.getElementById('ie-import-target')?.value || 'clients';
  const fileInput = document.getElementById('ie-import-file');
  const resultDiv = document.getElementById('ie-import-result');

  if (!fileInput?.files?.length) {
    resultDiv.innerHTML = '<div class="alert alert-warning">CSVファイルを選択してください</div>';
    return;
  }

  resultDiv.innerHTML = `
    <div class="alert alert-info">
      <strong>ドライラン結果（モック）</strong><br>
      対象: ${document.getElementById('ie-import-target')?.value || 'clients'}<br>
      ファイル: ${escapeHtml(fileInput.files[0].name)}<br>
      行数: 推定10行<br>
      新規: 8件 / 更新: 2件 / エラー: 0件<br>
      <span style="font-size:12px;color:var(--gray-500);">※ モックのため実際の解析は行いません</span>
    </div>
  `;
}

// ===========================
// インポート実行
// ===========================
function ieRunImport() {
  const fileInput = document.getElementById('ie-import-file');
  const resultDiv = document.getElementById('ie-import-result');

  if (!fileInput?.files?.length) {
    resultDiv.innerHTML = '<div class="alert alert-warning">CSVファイルを選択してください</div>';
    return;
  }

  resultDiv.innerHTML = `
    <div class="alert alert-info">
      <strong>インポート完了（モック）</strong><br>
      新規: 8件 / 更新: 2件 / エラー: 0件<br>
      <span style="font-size:12px;color:var(--gray-500);">※ モックのため実際のインポートは行いません</span>
    </div>
  `;
}

// ===========================
// エクスポート
// ===========================
function ieRunExport() {
  const target = document.getElementById('ie-export-target')?.value || 'clients';
  const filter = document.getElementById('ie-export-filter')?.value || 'all';

  if (target === 'clients') {
    let data = MOCK_DATA.clients;
    if (filter === 'active') data = data.filter(c => c.isActive);
    const header = ['コード', '顧客名', '種別', '決算月', '主担当', '月額報酬', '住所', '電話番号'];
    const rows = data.map(c => {
      const main = getAssigneeUser(c.id, 'main');
      return [c.clientCode, c.name, c.clientType, c.fiscalMonth + '月', main?.name || '', c.monthlySales, c.address, c.tel];
    });
    downloadCSV('clients_export.csv', header, rows);
  } else if (target === 'tasks') {
    const data = MOCK_DATA.tasks;
    const header = ['タスクID', '顧客名', 'タスク名', '担当者', '期限', 'ステータス'];
    const rows = data.map(t => {
      const client = getClientById(t.clientId);
      const assignee = getUserById(t.assigneeUserId);
      return [t.id, client?.name || '', t.title, assignee?.name || '', t.dueDate, t.status];
    });
    downloadCSV('tasks_export.csv', header, rows);
  } else if (target === 'users') {
    let data = MOCK_DATA.users;
    if (filter === 'active') data = data.filter(u => u.isActive);
    const header = ['コード', '氏名', 'メール', '部署', '役職', '雇用形態'];
    const rows = data.map(u => [u.staffCode, u.name, u.email, getDeptName(u.deptId), u.position, u.employmentType]);
    downloadCSV('users_export.csv', header, rows);
  } else if (target === 'timeEntries') {
    const data = MOCK_DATA.timeEntries;
    const header = ['日付', '職員', '顧客', '時間(h)', '作業内容'];
    const rows = data.map(te => {
      const user = getUserById(te.userId);
      const client = getClientById(te.clientId);
      return [te.date, user?.name || '', client?.name || '', te.hours, te.description];
    });
    downloadCSV('timeentries_export.csv', header, rows);
  }
}

// ===========================
// テンプレートダウンロード
// ===========================
function ieDownloadTemplate(type) {
  if (type === 'clients') {
    downloadCSV('template_clients.csv', ['顧客名', '種別', '決算月', '主担当コード', '住所', '電話番号', '月額報酬', '契約ステータス'], [['株式会社サンプル', '法人', '3', 'A003', '東京都千代田区1-1-1', '03-0000-0000', '50000', '契約中']]);
  } else if (type === 'tasks') {
    downloadCSV('template_tasks.csv', ['顧客ID', 'タスク名', '担当者ID', '期限', 'ステータス'], [['c-001', '月次記帳チェック', 'u-003', '2026-04-15', '未着手']]);
  } else if (type === 'users') {
    downloadCSV('template_users.csv', ['姓', '名', 'メール', '部署ID', '役職', '雇用形態', 'ロール'], [['山田', '太郎', 'yamada@libetax.jp', '1', 'スタッフ', '正社員', 'member']]);
  }
}

registerPage('import-export', renderImportExport);
