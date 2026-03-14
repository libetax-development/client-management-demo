// ===========================
// 外部連携
// ===========================
// ── 外部連携ステート ──
let integrationStates = {
  chatwork: { connected: true, account: 'リベ大税理士法人', date: '2025-05-20', webhookUrl: 'https://api.chatwork.com/v2/webhook/xxxxx', roomId: '300000001', lastSync: '2026-03-11T08:30:00' },
  google: { connected: true, account: 'hiro@libetax.jp', date: '2025-04-01', calendars: [{ name: '業務カレンダー', checked: true }, { name: '面談カレンダー', checked: true }, { name: '期限カレンダー', checked: false }], syncDirection: 'bidirectional', lastSync: '2026-03-11T07:00:00' },
  dropbox: { connected: true, account: 'libetax@dropbox.com', date: '2025-08-15', rootPath: '/リベ大税理士法人/顧客資料', usedStorage: '45.2 GB', totalStorage: '2 TB', autoCreateFolder: true, namingRule: '{顧客コード}_{顧客名}', lastSync: '2026-03-11T06:00:00' },
  zoom: { connected: false, account: '', date: '', lastSync: null },
  freee: { connected: true, account: 'リベ大税理士法人', date: '2025-06-01', lastSync: '2026-03-10T22:00:00' },
  slack: { connected: false },
  eltax: { connected: true, account: '利用者識別番号: 1234567890', date: '2025-09-01', lastSync: '2026-03-10T18:00:00' },
  etax: { connected: true, account: '利用者識別番号: 0987654321', date: '2025-09-01', lastSync: '2026-03-10T18:00:00' },
};

const integrationDefs = [
  { key: 'chatwork', name: 'Chatwork', icon: '\ud83d\udcac', description: '顧客・チーム間メッセージ連携' },
  { key: 'google', name: 'Googleカレンダー', icon: '\ud83d\udcc5', description: 'スケジュール・面談予約連携' },
  { key: 'dropbox', name: 'Dropbox', icon: '\ud83d\udcc1', description: '顧客資料フォルダとの自動連携' },
  { key: 'zoom', name: 'Zoom', icon: '\ud83c\udfa5', description: 'ミーティング予約・録画管理' },
  { key: 'freee', name: 'freee会計', icon: '\ud83d\udcca', description: '仕訳データ・試算表の自動取込' },
  { key: 'slack', name: 'Slack', icon: '\ud83d\udce2', description: 'チーム内通知・アラート配信' },
  { key: 'eltax', name: 'eLTAX', icon: '\ud83c\udfdb\ufe0f', description: '地方税電子申告連携' },
  { key: 'etax', name: 'e-Tax', icon: '\ud83c\udfdb\ufe0f', description: '国税電子申告連携' },
];

// ── 外部連携: mock upcoming events for Google Calendar ──
const mockUpcomingEvents = [
  { date: '2026-03-12', time: '10:00', title: '株式会社サンプル商事 月次面談' },
  { date: '2026-03-14', time: '14:00', title: '株式会社リベ不動産 決算打ち合わせ' },
  { date: '2026-03-15', time: '09:00', title: '確定申告期限（個人）' },
];

const mockZoomMeetings = [
  { date: '2026-03-10', title: '株式会社CRAT zoom面談', duration: '45分', recordingUrl: '#' },
  { date: '2026-03-07', title: '田中一郎 確定申告相談', duration: '30分', recordingUrl: '#' },
  { date: '2026-03-05', title: 'チーム定例ミーティング', duration: '60分', recordingUrl: '#' },
];

let intExpandedCards = {};

function toggleIntegration(key) {
  const st = integrationStates[key];
  if (!st) return;
  if (st.connected) {
    if (!confirm(`${integrationDefs.find(d => d.key === key)?.name || key} の接続を切断しますか？`)) return;
    st.connected = false;
    delete st.account;
    delete st.date;
    st.lastSync = null;
  } else {
    const today = new Date().toISOString().slice(0, 10);
    st.connected = true;
    st.lastSync = new Date().toISOString();
    if (key === 'chatwork') { st.account = 'リベ大税理士法人'; st.webhookUrl = ''; st.roomId = ''; }
    else if (key === 'google') { st.account = 'hiro@libetax.jp'; st.calendars = [{ name: '業務カレンダー', checked: true }, { name: '面談カレンダー', checked: false }, { name: '期限カレンダー', checked: false }]; st.syncDirection = 'bidirectional'; }
    else if (key === 'dropbox') { st.account = 'libetax@dropbox.com'; st.rootPath = ''; st.usedStorage = '45.2 GB'; st.totalStorage = '2 TB'; st.autoCreateFolder = false; st.namingRule = '{顧客コード}_{顧客名}'; }
    else if (key === 'zoom') { st.account = 'hiro@libetax.jp'; }
    else { st.account = key + '@example.com'; }
    st.date = today;
  }
  const content = document.getElementById('page-content');
  if (content) renderIntegrations(content);
}

function toggleIntCard(key) {
  intExpandedCards[key] = !intExpandedCards[key];
  const content = document.getElementById('page-content');
  if (content) renderIntegrations(content);
}

function intFlash(elementId, msg, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const bg = type === 'success' ? '#d1ecf1' : type === 'warning' ? '#fff3cd' : '#d1ecf1';
  const border = type === 'success' ? '#bee5eb' : type === 'warning' ? '#ffeeba' : '#bee5eb';
  const color = type === 'success' ? '#0c5460' : type === 'warning' ? '#856404' : '#0c5460';
  el.innerHTML = `<div style="background:${bg};border:1px solid ${border};border-radius:6px;color:${color};font-size:12px;padding:6px 10px;margin-top:8px;">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 3000);
}

function chatworkTestSend() {
  intFlash('int-flash-chatwork', 'テストメッセージを送信しました', 'success');
}

function saveChatworkSettings() {
  const st = integrationStates.chatwork;
  st.webhookUrl = document.getElementById('int-cw-webhook')?.value || '';
  st.roomId = document.getElementById('int-cw-roomid')?.value || '';
  intFlash('int-flash-chatwork', '設定を保存しました', 'success');
}

function toggleGoogleCalendar(idx) {
  const st = integrationStates.google;
  if (st.calendars && st.calendars[idx]) {
    st.calendars[idx].checked = !st.calendars[idx].checked;
  }
}

function setGoogleSyncDirection(val) {
  integrationStates.google.syncDirection = val;
}

function saveDropboxSettings() {
  const st = integrationStates.dropbox;
  st.rootPath = document.getElementById('int-dbx-root')?.value || '';
  st.namingRule = document.getElementById('int-dbx-naming')?.value || '';
  intFlash('int-flash-dropbox', '設定を保存しました', 'success');
}

function toggleDropboxAutoCreate() {
  integrationStates.dropbox.autoCreateFolder = !integrationStates.dropbox.autoCreateFolder;
  const content = document.getElementById('page-content');
  if (content) renderIntegrations(content);
}

function zoomCreateMeeting() {
  intFlash('int-flash-zoom', '会議を作成しました: https://zoom.us/j/1234567890 (コピー済み)', 'success');
}

function renderIntegrations(el) {
  const connected = integrationDefs.filter(d => integrationStates[d.key]?.connected).length;

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent-green">
        <div class="stat-label">接続済み</div>
        <div class="stat-value">${connected}</div>
        <div class="stat-sub">サービス</div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">未接続</div>
        <div class="stat-value">${integrationDefs.length - connected}</div>
        <div class="stat-sub">サービス</div>
      </div>
    </div>

    <div class="int-grid">
      ${integrationDefs.map(d => {
        const st = integrationStates[d.key] || { connected: false };
        const expanded = intExpandedCards[d.key];
        return `
        <div class="card int-card">
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;cursor:pointer;" onclick="toggleIntCard('${d.key}')">
              <div style="font-size:28px;">${d.icon}</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:15px;">${d.name}</div>
                <div style="font-size:12px;color:var(--gray-500);">${d.description}</div>
              </div>
              <span class="status-badge ${st.connected ? 'status-done' : 'status-todo'}">${st.connected ? '接続済み' : '未接続'}</span>
              <span style="font-size:12px;color:var(--gray-400);transition:transform .2s;display:inline-block;${expanded ? 'transform:rotate(180deg)' : ''}">▼</span>
            </div>
            ${st.connected && st.lastSync ? `<div style="font-size:11px;color:var(--gray-400);margin-bottom:8px;">最終同期: ${formatDateTime(st.lastSync)}</div>` : ''}
            ${expanded ? renderIntegrationDetails(d.key, st) : renderIntegrationSummary(d.key, st)}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function renderIntegrationSummary(key, st) {
  if (!st.connected) {
    return `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('${key}')">接続する</button>`;
  }
  return `
    <div style="background:var(--gray-50);border-radius:6px;padding:8px 12px;font-size:12px;color:var(--gray-600);margin-bottom:8px;">
      アカウント: ${st.account}
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();toggleIntCard('${key}')">詳細設定</button>
      <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('${key}')">切断</button>
    </div>`;
}

function renderIntegrationDetails(key, st) {
  if (key === 'chatwork') return renderChatworkDetails(st);
  if (key === 'google') return renderGoogleDetails(st);
  if (key === 'dropbox') return renderDropboxDetails(st);
  if (key === 'zoom') return renderZoomDetails(st);
  // fallback for other integrations
  if (!st.connected) {
    return `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('${key}')">接続する</button>`;
  }
  return `
    <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
      <div>アカウント: ${st.account}</div>
      <div>接続日: ${formatDate(st.date)}</div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();alert('同期設定画面')">設定</button>
      <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('${key}')">切断</button>
    </div>
    <div id="int-flash-${key}"></div>`;
}

function renderChatworkDetails(st) {
  if (!st.connected) {
    return `
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('chatwork')">接続する</button>`;
  }
  return `
    <div class="int-detail-section">
      <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
        <div style="font-weight:600;margin-bottom:4px;">接続アカウント</div>
        <div>${st.account}</div>
        <div style="margin-top:4px;">接続日: ${formatDate(st.date)}</div>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:12px;">Webhook URL</label>
        <input type="text" id="int-cw-webhook" value="${st.webhookUrl || ''}" placeholder="https://api.chatwork.com/v2/webhook/..." style="font-size:12px;padding:6px 8px;">
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:12px;">通知先ルームID</label>
        <input type="text" id="int-cw-roomid" value="${st.roomId || ''}" placeholder="300000001" style="font-size:12px;padding:6px 8px;">
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();saveChatworkSettings()">設定保存</button>
        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();chatworkTestSend()">テスト送信</button>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('chatwork')">切断</button>
      </div>
      <div id="int-flash-chatwork"></div>
    </div>`;
}

function renderGoogleDetails(st) {
  if (!st.connected) {
    return `
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('google')">Googleアカウント連携</button>`;
  }
  const cals = st.calendars || [];
  const dir = st.syncDirection || 'bidirectional';
  return `
    <div class="int-detail-section">
      <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
        <div style="font-weight:600;margin-bottom:4px;">接続アカウント</div>
        <div>${st.account}</div>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-700);margin-bottom:6px;">カレンダー選択</div>
        ${cals.map((c, i) => `
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:4px;cursor:pointer;">
            <input type="checkbox" ${c.checked ? 'checked' : ''} onchange="event.stopPropagation();toggleGoogleCalendar(${i})"> ${c.name}
          </label>
        `).join('')}
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-700);margin-bottom:6px;">同期方向</div>
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:4px;cursor:pointer;">
          <input type="radio" name="gcal-sync" value="bidirectional" ${dir === 'bidirectional' ? 'checked' : ''} onchange="event.stopPropagation();setGoogleSyncDirection('bidirectional')"> 双方向
        </label>
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:4px;cursor:pointer;">
          <input type="radio" name="gcal-sync" value="readonly" ${dir === 'readonly' ? 'checked' : ''} onchange="event.stopPropagation();setGoogleSyncDirection('readonly')"> 読み取りのみ
        </label>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-700);margin-bottom:6px;">直近の予定</div>
        <div style="border:1px solid var(--gray-200);border-radius:6px;overflow:hidden;">
          ${mockUpcomingEvents.map(e => `
            <div style="padding:8px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;display:flex;gap:8px;">
              <span style="color:var(--primary);font-weight:600;white-space:nowrap;">${e.date.slice(5)} ${e.time}</span>
              <span style="color:var(--gray-700);">${e.title}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('google')">切断</button>
      </div>
    </div>`;
}

function renderDropboxDetails(st) {
  if (!st.connected) {
    return `
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('dropbox')">Dropbox連携</button>`;
  }
  return `
    <div class="int-detail-section">
      <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
        <div style="font-weight:600;margin-bottom:4px;">接続アカウント</div>
        <div>${st.account}</div>
        <div style="margin-top:4px;">使用容量: <span style="font-weight:600;">${st.usedStorage || '0 GB'}</span> / ${st.totalStorage || '2 TB'}</div>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:12px;">ルートフォルダパス</label>
        <div style="display:flex;gap:6px;">
          <input type="text" id="int-dbx-root" value="${st.rootPath || ''}" placeholder="/リベ大税理士法人/顧客資料" style="font-size:12px;padding:6px 8px;flex:1;">
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();alert('フォルダ選択画面（モック）')">参照</button>
        </div>
      </div>
      <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:13px;font-weight:500;color:var(--gray-800);">顧客フォルダ自動作成</div>
          <div style="font-size:11px;color:var(--gray-400);">新規顧客追加時に自動でフォルダを作成</div>
        </div>
        <label class="toggle" onclick="event.stopPropagation();">
          <input type="checkbox" ${st.autoCreateFolder ? 'checked' : ''} onchange="toggleDropboxAutoCreate()">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:12px;">命名規則</label>
        <input type="text" id="int-dbx-naming" value="${st.namingRule || ''}" placeholder="{顧客コード}_{顧客名}" style="font-size:12px;padding:6px 8px;">
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();saveDropboxSettings()">設定保存</button>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('dropbox')">切断</button>
      </div>
      <div id="int-flash-dropbox"></div>
    </div>`;
}

function renderZoomDetails(st) {
  if (!st.connected) {
    return `
      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();toggleIntegration('zoom')">Zoom連携</button>`;
  }
  return `
    <div class="int-detail-section">
      <div style="background:var(--gray-50);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--gray-600);margin-bottom:12px;">
        <div style="font-weight:600;margin-bottom:4px;">接続アカウント</div>
        <div>${st.account}</div>
      </div>
      <div style="margin-bottom:12px;">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();zoomCreateMeeting()">会議作成</button>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:var(--gray-700);margin-bottom:6px;">最近の会議</div>
        <div style="border:1px solid var(--gray-200);border-radius:6px;overflow:hidden;">
          ${mockZoomMeetings.map(m => `
            <div style="padding:8px 12px;border-bottom:1px solid var(--gray-100);font-size:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:500;color:var(--gray-800);">${m.title}</span>
                <span style="color:var(--gray-400);font-size:11px;">${m.duration}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
                <span style="color:var(--gray-500);">${m.date}</span>
                <a href="${m.recordingUrl}" style="font-size:11px;" onclick="event.stopPropagation();event.preventDefault();alert('録画ファイルを開きます（モック）')">録画を見る</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();toggleIntegration('zoom')">切断</button>
      </div>
      <div id="int-flash-zoom"></div>
    </div>`;
}

registerPage('integrations', renderIntegrations);
