// ===========================
// マイ設定
// ===========================
let settingsActiveTab = 0;

function settingsFlash(containerId, msg) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-info" style="padding:8px 12px;background:#d1ecf1;border:1px solid #bee5eb;border-radius:6px;color:#0c5460;font-size:13px;margin-bottom:12px;">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 2000);
}

function settingsRerender() {
  const content = document.getElementById('page-content');
  if (content) renderSettings(content);
}

function saveOfficeInfo() {
  MOCK_DATA.office.aoName = document.getElementById('set-ao-name').value;
  MOCK_DATA.office.address = document.getElementById('set-ao-address').value;
  MOCK_DATA.office.tel = document.getElementById('set-ao-tel').value;
  MOCK_DATA.office.email = document.getElementById('set-ao-email').value;
  settingsRerender();
  setTimeout(() => settingsFlash('office-flash', '保存しました'), 50);
}

function saveSecuritySettings() {
  MOCK_DATA.securitySettings.allowedIpList = document.getElementById('set-sec-ip').value;
  MOCK_DATA.securitySettings.maxLoginAttempts = parseInt(document.getElementById('set-sec-attempts').value) || 5;
  MOCK_DATA.securitySettings.lockoutDuration = parseInt(document.getElementById('set-sec-lockout').value) || 30;
  MOCK_DATA.securitySettings.sessionTimeout = parseInt(document.getElementById('set-sec-session').value) || 30;
  MOCK_DATA.securitySettings.passwordMinLength = parseInt(document.getElementById('set-sec-pwlen').value) || 8;
  MOCK_DATA.securitySettings.passwordRequireNumber = document.getElementById('set-sec-pwnum').checked ? 1 : 0;
  MOCK_DATA.securitySettings.passwordRequireSymbol = document.getElementById('set-sec-pwsym').checked ? 1 : 0;
  settingsRerender();
  setTimeout(() => settingsFlash('security-flash', '保存しました'), 50);
}

function addDepartment() {
  const name = prompt('部署名を入力してください');
  if (!name) return;
  const code = prompt('部署コードを入力してください');
  if (!code) return;
  const maxId = MOCK_DATA.departments.reduce((m, d) => Math.max(m, d.deptId), 0);
  const maxSort = MOCK_DATA.departments.reduce((m, d) => Math.max(m, d.sortOrder), 0);
  MOCK_DATA.departments.push({ deptId: maxId + 1, deptName: name, deptCode: code, parentDeptId: null, sortOrder: maxSort + 1, status: 1 });
  settingsRerender();
}

function editDepartment(deptId) {
  const d = MOCK_DATA.departments.find(x => x.deptId === deptId);
  if (!d) return;
  const name = prompt('新しい部署名を入力してください', d.deptName);
  if (!name) return;
  d.deptName = name;
  settingsRerender();
}

function deleteDepartment(deptId) {
  if (!confirm('この部署を削除しますか？')) return;
  MOCK_DATA.departments = MOCK_DATA.departments.filter(x => x.deptId !== deptId);
  settingsRerender();
}

function savePersonalSettings() {
  const name = document.getElementById('set-personal-name').value.trim();
  const email = document.getElementById('set-personal-email').value.trim();
  if (!name) { alert('表示名を入力してください'); return; }
  if (!email) { alert('メールアドレスを入力してください'); return; }
  MOCK_DATA.currentUser.name = name;
  MOCK_DATA.currentUser.email = email;
  const fullUser = getUserById(MOCK_DATA.currentUser.id);
  if (fullUser) { fullUser.name = name; fullUser.email = email; }
  // サイドバーも更新
  const sidebarName = document.querySelector('.sidebar-user .name');
  const sidebarAvatar = document.querySelector('.sidebar-user .avatar');
  if (sidebarName) sidebarName.textContent = name;
  if (sidebarAvatar) sidebarAvatar.textContent = name[0];
  settingsRerender();
  setTimeout(() => settingsFlash('personal-flash', '保存しました'), 50);
}

function issueUserId() {
  const input = prompt('職員名またはスタッフコードを入力してください');
  if (!input) return;
  const user = MOCK_DATA.users.find(u => u.name === input || u.staffCode === input);
  if (!user) { alert('該当する職員が見つかりません'); return; }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let tmpPassword = '';
  for (let i = 0; i < 12; i++) tmpPassword += chars[Math.floor(Math.random() * chars.length)];
  alert(`ユーザーID発行完了\n\nログインID: ${user.loginId}\n仮パスワード: ${tmpPassword}\n\n※ 初回ログイン時にパスワード変更が必要です`);
}

function renderSettings(el) {
  const u = MOCK_DATA.currentUser;
  const fullUser = getUserById(u.id);
  const office = MOCK_DATA.office;
  const sec = MOCK_DATA.securitySettings;
  const depts = MOCK_DATA.departments;

  const tabs = [
    { key: 'personal', label: '個人設定' },
    { key: 'staff', label: 'スタッフ管理' },
    { key: 'office', label: 'オフィス管理' },
    { key: 'security', label: 'セキュリティ管理' },
    { key: 'crm', label: 'CRM設定' },
    { key: 'features', label: '機能設定' },
  ];

  const logoutOpts = [5,10,15,30,60,120].map(m =>
    `<option value="${m}" ${office.logoutTime === m ? 'selected' : ''}>${m}分</option>`
  ).join('');

  const inputStyle = 'width:200px;padding:6px 10px;border:1px solid var(--gray-200);border-radius:6px;font-size:13px;';

  const panels = {
    personal: `
      <div class="detail-grid">
        <div class="card">
          <div class="card-header"><h3>マイ設定</h3></div>
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
              <div style="width:64px;height:64px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:600;">${u.name[0]}</div>
              <div>
                <div style="font-size:18px;font-weight:600;">${u.name}</div>
                <div style="font-size:13px;color:var(--gray-500);">${u.email} / ${getRoleBadge(u.role)}</div>
              </div>
            </div>
            <div id="personal-flash"></div>
            <div class="form-group"><label>表示名</label><input type="text" id="set-personal-name" value="${u.name}"></div>
            <div class="form-group"><label>メールアドレス</label><input type="email" id="set-personal-email" value="${u.email}"></div>
            <div class="form-group"><label>所属チーム</label><input type="text" value="${fullUser?.team || '（なし）'}" disabled style="background:var(--gray-50);"></div>
            <button class="btn btn-primary" onclick="savePersonalSettings()">保存</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>パスワード変更</h3></div>
          <div class="card-body">
            <div id="pw-flash"></div>
            <div class="form-group"><label>現在のパスワード</label><input type="password" placeholder="現在のパスワード"></div>
            <div class="form-group"><label>新しいパスワード</label><input type="password" placeholder="新しいパスワード"></div>
            <div class="form-group"><label>新しいパスワード（確認）</label><input type="password" placeholder="もう一度入力"></div>
            <button class="btn btn-primary" onclick="settingsFlash('pw-flash','パスワードを変更しました')">変更する</button>
          </div>
        </div>
      </div>`,

    staff: `
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header"><h3>スタッフ管理</h3></div>
        <div class="card-body">
          <div class="settings-list">
            <div class="settings-row">
              <div><div class="settings-label">職員一覧</div><div class="settings-desc">登録済み職員の一覧を表示</div></div>
              <button class="btn btn-secondary btn-sm" onclick="navigateTo('staff')">職員一覧へ</button>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">ユーザーID発行</div><div class="settings-desc">新しいユーザーIDを発行します</div></div>
              <button class="btn btn-primary btn-sm" onclick="issueUserId()">発行</button>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">ログアウト時間設定</div><div class="settings-desc">無操作時の自動ログアウトまでの時間</div></div>
              <select class="filter-select" style="width:120px;" onchange="MOCK_DATA.office.logoutTime=parseInt(this.value);settingsFlash('logout-flash','保存しました')">${logoutOpts}</select>
              <span id="logout-flash" style="margin-left:8px;"></span>
            </div>
          </div>
        </div>
      </div>`,

    office: `
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header"><h3>オフィス情報</h3></div>
        <div class="card-body">
          <div id="office-flash"></div>
          <div class="form-group"><label>事務所名</label><input type="text" id="set-ao-name" value="${office.aoName}" style="${inputStyle}width:100%;"></div>
          <div class="form-group"><label>住所</label><input type="text" id="set-ao-address" value="${office.address}" style="${inputStyle}width:100%;"></div>
          <div class="form-group"><label>電話番号</label><input type="text" id="set-ao-tel" value="${office.tel}" style="${inputStyle}width:100%;"></div>
          <div class="form-group"><label>メール</label><input type="email" id="set-ao-email" value="${office.email}" style="${inputStyle}width:100%;"></div>
          <button class="btn btn-primary" onclick="saveOfficeInfo()">保存</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <h3>部署一覧</h3>
          <button class="btn btn-primary btn-sm" onclick="addDepartment()">追加</button>
        </div>
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>部署コード</th><th>部署名</th><th>表示順</th><th>状態</th><th>操作</th></tr></thead>
              <tbody>
                ${depts.map(d => `<tr>
                  <td>${d.deptCode}</td><td>${d.deptName}</td><td>${d.sortOrder}</td>
                  <td><span class="status-badge ${d.status === 1 ? 'status-done' : 'status-todo'}">${d.status === 1 ? '有効' : '無効'}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="editDepartment(${d.deptId})">編集</button>
                    <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="deleteDepartment(${d.deptId})">削除</button>
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`,

    security: `
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header"><h3>セキュリティ管理</h3></div>
        <div class="card-body">
          <div id="security-flash"></div>
          <div class="form-group">
            <label>IPアドレス制限</label>
            <textarea id="set-sec-ip" rows="3" placeholder="許可するIPアドレス（改行区切り、空欄＝制限なし）" style="${inputStyle}width:100%;height:auto;">${sec.allowedIpList}</textarea>
          </div>
          <div class="form-group">
            <label>ログイン試行上限（回）</label>
            <input type="number" id="set-sec-attempts" value="${sec.maxLoginAttempts}" min="1" style="${inputStyle}">
          </div>
          <div class="form-group">
            <label>ロックアウト時間（分）</label>
            <input type="number" id="set-sec-lockout" value="${sec.lockoutDuration}" min="1" style="${inputStyle}">
          </div>
          <div class="form-group">
            <label>セッションタイムアウト（分）</label>
            <input type="number" id="set-sec-session" value="${sec.sessionTimeout}" min="1" style="${inputStyle}">
          </div>
          <div class="form-group">
            <label>パスワード最低文字数</label>
            <input type="number" id="set-sec-pwlen" value="${sec.passwordMinLength}" min="1" style="${inputStyle}">
          </div>
          <div class="form-group" style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="set-sec-pwnum" ${sec.passwordRequireNumber ? 'checked' : ''}>
            <label for="set-sec-pwnum" style="margin:0;">数字必須</label>
          </div>
          <div class="form-group" style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="set-sec-pwsym" ${sec.passwordRequireSymbol ? 'checked' : ''}>
            <label for="set-sec-pwsym" style="margin:0;">記号必須</label>
          </div>
          <button class="btn btn-primary" onclick="saveSecuritySettings()">保存</button>
        </div>
      </div>`,

    crm: `
      <div class="card">
        <div class="card-header"><h3>CRM権限設定</h3></div>
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>機能</th><th>管理者</th><th>TL</th><th>メンバー</th></tr></thead>
              <tbody>
                <tr><td>顧客情報 閲覧</td><td>&#10003;</td><td>&#10003;</td><td>&#10003;</td></tr>
                <tr><td>顧客情報 編集</td><td>&#10003;</td><td>&#10003;</td><td>-</td></tr>
                <tr><td>顧客 新規登録</td><td>&#10003;</td><td>&#10003;</td><td>-</td></tr>
                <tr><td>顧客 削除</td><td>&#10003;</td><td>-</td><td>-</td></tr>
                <tr><td>報酬情報 閲覧</td><td>&#10003;</td><td>&#10003;</td><td>担当のみ</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`,

    features: `
      <div class="card">
        <div class="card-header"><h3>機能設定</h3></div>
        <div class="card-body">
          <div class="settings-list">
            <div class="settings-row">
              <div><div class="settings-label">グループウェア</div><div class="settings-desc">社内掲示板・メッセージ機能</div></div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">電子会議室</div><div class="settings-desc">オンライン会議予約・管理</div></div>
              <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">共有フォルダ</div><div class="settings-desc">ファイル共有・ドキュメント管理</div></div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">AI機能</div><div class="settings-desc">AIアシスタント・自動分析</div></div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
          </div>
        </div>
      </div>`,
  };

  const activeKey = tabs[settingsActiveTab]?.key || 'personal';

  el.innerHTML = `
    <div class="tab-bar" id="settings-tabs">
      ${tabs.map((t, i) => `<button class="tab-btn ${i === settingsActiveTab ? 'active' : ''}" data-tab="${t.key}" data-idx="${i}">${t.label}</button>`).join('')}
    </div>
    <div id="settings-panel" style="margin-top:24px;">${panels[activeKey]}</div>
  `;

  document.querySelectorAll('#settings-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settingsActiveTab = parseInt(btn.dataset.idx);
      document.querySelectorAll('#settings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('settings-panel').innerHTML = panels[btn.dataset.tab] || '';
    });
  });
}

registerPage('settings', renderSettings);
