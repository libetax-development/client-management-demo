// ===========================
// 経営レポート（cm#546/#547 モック）
// ===========================

// メンバー表示トグルON時に「自分」として使うサンプル職員（長谷川 綾・第2チーム）
const MGMT_REPORT_SAMPLE_MEMBER_ID = 'u-006';

// 生成不可理由のツールチップ文言（title属性はhoverから表示まで遅く読みにくいというひろFBを受け、
// CSSの吹き出しツールチップ（.has-tooltip / .tooltip-bubble、style.css参照）に変更）
const MGMT_TOOLTIP_DATA_INSUFFICIENT = 'MF連携済みですが、レポートの元になる月次実績データがまだ取得できていません（同期実行前、またはマネーフォワード側に仕訳入力がない状態です）';
const MGMT_TOOLTIP_CONSENT_MISSING = 'AIレポート生成には顧問先の同意取得が必要です。同意日時はこのセルをクリックして登録できます';

// 吹き出しツールチップ付きのラベルspanを生成する共通ヘルパー
function mgmtTooltipSpan(label, text, extraStyle) {
  return `<span class="has-tooltip" style="${extraStyle || ''}">${escapeHtml(label)}<span class="tooltip-bubble">${escapeHtml(text)}</span></span>`;
}

// 操作列を含む各列を固定幅にする（table-layout:fixedで完了表示・履歴ボタン追加時も列位置がズレないようにする）
const MGMT_REPORT_COLGROUP = `
  <colgroup>
    <col style="width:220px;"><col style="width:110px;"><col style="width:100px;">
    <col style="width:120px;"><col style="width:140px;"><col style="width:190px;">
  </colgroup>
`;

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

  // table-layout:fixed + colgroupで列幅を固定（生成完了表示等でセル内容が変わっても列がズレない）
  container.innerHTML = `
    <div class="table-wrapper">
      <table style="table-layout:fixed;">
        ${MGMT_REPORT_COLGROUP}
        <thead><tr>
          <th>クライアント名/コード</th><th>連携状態</th><th>最新実績月</th><th>提供頻度</th><th>AI同意</th><th>操作</th>
        </tr></thead>
        <tbody>${rows.map(r => mgmtReportRow(r.client, r.settings, r.conn)).join('')}</tbody>
      </table>
    </div>
  `;
}

// 行クリックでの遷移は行わない（ひろFB: 誤クリック時の意図しない画面遷移を避ける）
function mgmtReportRow(client, settings, conn) {
  return `<tr>
    <td><strong>${escapeHtml(client.name)}</strong><div style="font-size:11px;color:var(--gray-500);">${escapeHtml(client.clientCode)}</div></td>
    <td>${mgmtConnBadge(client, conn)}</td>
    <td>${settings?.latestActualMonth ? mgmtFormatMonth(settings.latestActualMonth) : '-'}</td>
    <td>${mgmtFreqCell(client, settings)}</td>
    <td>${mgmtConsentCell(client, settings)}</td>
    <td>${mgmtActionCell(client, settings, conn)}</td>
  </tr>`;
}

// 連携状態バッジ: connected=連携済み(緑・クリック不可) / token_expired=要再認証(赤・クリックで再連携) / 行なし=未連携(灰枠・クリックで連携)
// ひろFB: 右端の「MF連携」ボタンは気づきにくいため、バッジ自体からも連携モーダルを開けるようにする（導線は併存）
// ツールチップはtitle属性ではなくCSS吹き出し（.has-tooltip）で統一（Medium FB対応）。
// mgmt-badge-clickableのpointerカーソル・hover装飾はhas-tooltipのcursor:help/displayと
// クラス併用しても打ち消し合わないため、mgmtConsentCellの同意未取得表示と同じ書き方に揃えている
function mgmtConnBadge(client, conn) {
  if (!conn) {
    return `<span class="status-badge status-outline mgmt-badge-clickable has-tooltip" onclick="mgmtOpenConnectModal('${client.id}','connect')">未連携<span class="tooltip-bubble">クリックでMF連携を開始</span></span>`;
  }
  if (conn.status === 'token_expired') {
    return `<span class="status-badge status-returned mgmt-badge-clickable has-tooltip" onclick="mgmtOpenConnectModal('${client.id}','reconnect')">要再認証<span class="tooltip-bubble">クリックで再連携</span></span>`;
  }
  return `<span class="status-badge status-done">連携済み</span>`;
}

function mgmtFormatMonth(ym) {
  if (!ym) return '-';
  const [y, m] = ym.split('-');
  return `${y}年${parseInt(m, 10)}月`;
}

// 提供頻度セル: 一覧から直接変更できるインラインセレクト（ひろへの操作感モック提示用）
function mgmtFreqCell(client, settings) {
  const current = settings?.reportFrequency || '';
  const opt = (val, label) => `<option value="${val}" ${current === val ? 'selected' : ''}>${label}</option>`;
  return `
    <select class="filter-select" style="font-size:12px;padding:4px 6px;width:100%;" onchange="mgmtChangeFrequency('${client.id}', this.value)">
      ${opt('monthly', '毎月')}${opt('quarterly', '四半期')}${opt('semiannual', '半期')}
    </select>
    <div id="mr-freq-saved-${client.id}" style="font-size:11px;color:#166534;margin-top:2px;height:14px;"></div>
  `;
}

// 提供頻度の変更を即時反映し、「保存しました」を短時間だけ表示する
// settingsが見つからない（データ不整合）場合は保存表示を出さずwarnのみに留める
function mgmtChangeFrequency(clientId, value) {
  const settings = getCompanySettings(clientId);
  if (!settings) {
    console.warn(`mgmtChangeFrequency: companySettingsが見つかりません (clientId=${clientId})`);
    return;
  }
  settings.reportFrequency = value;

  const savedEl = document.getElementById(`mr-freq-saved-${clientId}`);
  if (savedEl) savedEl.textContent = '保存しました';

  setTimeout(() => {
    const savedElNow = document.getElementById(`mr-freq-saved-${clientId}`);
    if (savedElNow) savedElNow.textContent = '';
  }, 1500);
}

// AI同意セル。クリックで登録/取消モーダルを開く（ひろFB: 「AI同意ってどこで変えれるん？」対応）。
// 「同意未取得」はgray-400不可のためwarningトークンで可読色にする
function mgmtConsentCell(client, settings) {
  const hasConsent = !!settings?.aiReportConsentAt;
  const inner = hasConsent
    ? `<span class="mgmt-clickable-text">同意済み</span><div style="font-size:11px;color:var(--gray-500);">${formatDate(settings.aiReportConsentAt)}</div>`
    : `<span class="has-tooltip mgmt-clickable-text" style="font-weight:600;color:var(--warning);">同意未取得<span class="tooltip-bubble">${escapeHtml(MGMT_TOOLTIP_CONSENT_MISSING)}</span></span>`;

  return `
    <button type="button" class="mgmt-clickable-cell" onclick="mgmtOpenConsentModal('${client.id}')" style="background:none;border:none;padding:0;text-align:left;font:inherit;color:inherit;width:100%;cursor:pointer;">
      ${inner}
    </button>
  `;
}

// アクション列: 連携状態×同意×実績月の組み合わせで導線を出し分ける
function mgmtActionCell(client, settings, conn) {
  const hasConsent = !!settings?.aiReportConsentAt;
  const hasData = !!settings?.latestActualMonth;
  const isExpired = conn?.status === 'token_expired';
  const isUnlinked = !conn;

  // 要再認証: その場でMF再連携モーダルを開く（顧客詳細への遷移はしない）
  if (isExpired) {
    return `<button class="btn btn-secondary btn-sm" onclick="mgmtOpenConnectModal('${client.id}','reconnect')">再連携</button>`;
  }

  // 未連携: その場でMF連携モーダルを開く。同意も未取得なら併記（両方欠落表示）
  if (isUnlinked) {
    const consentNote = hasConsent ? '' : `<div style="font-size:11px;margin-top:4px;">${mgmtTooltipSpan('同意未取得', MGMT_TOOLTIP_CONSENT_MISSING, 'color:var(--warning);')}</div>`;
    return `<button class="btn btn-secondary btn-sm" onclick="mgmtOpenConnectModal('${client.id}','connect')">MF連携</button>${consentNote}`;
  }

  // 連携済み・同意未取得: 生成不可（disabledのみでは視覚的に押せそうに見えるためopacityも付与）
  // 不活性ボタン自体のhoverでも理由を出す（ひろFB: 注記テキストだけでなくボタン上でも）。
  // disabledボタンはhoverイベントを拾わないため、ラッパーspan側にhas-tooltipを付ける
  if (!hasConsent) {
    return `<span class="has-tooltip"><button class="btn btn-primary btn-sm" disabled style="opacity:.5;cursor:not-allowed;">生成</button><span class="tooltip-bubble">${escapeHtml(MGMT_TOOLTIP_CONSENT_MISSING)}</span></span><div style="font-size:11px;margin-top:4px;">${mgmtTooltipSpan('同意未取得', MGMT_TOOLTIP_CONSENT_MISSING, 'color:var(--gray-500);')}</div>`;
  }

  // 連携済み・同意済み・実績データ不足: 生成不可
  if (!hasData) {
    return `<span class="has-tooltip"><button class="btn btn-primary btn-sm" disabled style="opacity:.5;cursor:not-allowed;">生成</button><span class="tooltip-bubble">${escapeHtml(MGMT_TOOLTIP_DATA_INSUFFICIENT)}</span></span><div style="font-size:11px;margin-top:4px;">${mgmtTooltipSpan('データ不足', MGMT_TOOLTIP_DATA_INSUFFICIENT, 'color:var(--gray-500);')}</div>`;
  }

  // 生成可能: 生成ボタン + 履歴ボタン（縦積み・固定幅列に収まるコンパクト表示）
  return `
    <div style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;">
      <button class="btn btn-primary btn-sm" id="mr-gen-${client.id}" onclick="mgmtGenerateReport('${client.id}')">生成</button>
      <div id="mr-gen-result-${client.id}"></div>
      <button class="btn btn-secondary btn-sm" onclick="mgmtOpenHistoryModal('${client.id}')">履歴</button>
    </div>
  `;
}

// レポート生成ダミー処理（実レポート/PDF描画は行わない・2秒後に完了表示のみ）
// 完了表示は列幅を押し広げないよう「済みマーク+短い1ボタン」に留める（ひろFB: 列ズレ対応）
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
      <div style="font-size:11px;color:#166534;">&#x2713; 生成済み</div>
      <button class="btn btn-secondary btn-sm" disabled style="margin-top:2px;">表示（準備中）</button>
    `;
  }, 2000);
}

// ── MF連携/再連携モーダル（この画面から離れず連携できるようにする） ──
function mgmtOpenConnectModal(clientId, mode) {
  if (document.getElementById('mr-connect-modal')) return; // 多重起動ガード（連打・バッジ+操作列ボタンの二重クリック対策）
  const client = getClientById(clientId);
  const isReconnect = mode === 'reconnect';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'mr-connect-modal';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${isReconnect ? 'マネーフォワード 再連携' : 'マネーフォワード連携'}</h3>
        <button class="btn-icon" onclick="mgmtCloseConnectModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:13px;color:var(--gray-700);margin-bottom:8px;">
          ${escapeHtml(client?.name || '')} ${isReconnect ? 'の認証が切れています。マネーフォワード連携を再開します。' : 'とマネーフォワード クラウド会計の連携を開始します。'}
        </p>
        <p style="font-size:11px;color:var(--gray-500);">※実運用ではこの後マネーフォワードのOAuth認証画面へリダイレクトされます（本モックではダミー処理のみ）</p>
        <div id="mr-connect-status" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="mgmtCloseConnectModal()">キャンセル</button>
        <button class="btn btn-primary" id="mr-connect-submit" onclick="mgmtSubmitConnect('${clientId}')">連携を開始</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// 連携処理中のタイマーID。モーダルを閉じる（キャンセル/×）際にclearTimeoutして
// 裏で連携完了処理が走らないようにする（キャンセル後に行が連携済みへ書き換わってしまう不具合対策）
let mgmtConnectTimer = null;

function mgmtSubmitConnect(clientId) {
  const btn = document.getElementById('mr-connect-submit');
  const status = document.getElementById('mr-connect-status');
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = '連携中...';
  if (status) status.innerHTML = '<span style="font-size:12px;color:var(--gray-500);">マネーフォワードと通信しています...</span>';

  mgmtConnectTimer = setTimeout(() => {
    mgmtConnectTimer = null;
    mgmtCompleteConnect(clientId);
    mgmtCloseConnectModal();
    renderManagementReportsList();
  }, 1500);
}

// mfConnectionsに connected 状態を反映（既存行は更新、なければ新規追加）
// あわせて clients.mfBusinessNo も整合させる（mock-data.js記載の設計意図: mfBusinessNo有り＝mfConnectionsに行がある、を維持するため）
function mgmtCompleteConnect(clientId) {
  const client = getClientById(clientId);
  const now = mgmtNowJST();
  const conn = getMfConnection(clientId);
  if (conn) {
    conn.status = 'connected';
    conn.lastApiCallAt = now;
  } else {
    MOCK_DATA.mfConnections.push({
      clientId,
      status: 'connected',
      // mfOfficeNameは表示時に必ずescapeHtmlすること（ここでは生文字列のまま格納。既存mfConnectionsデータと形式を揃えている）
      mfOfficeName: `${client?.name || ''}（MFクラウド会計）`,
      connectedAt: now,
      lastApiCallAt: now,
    });
  }

  // 未連携だった顧客（mfBusinessNoが未設定）が新規に連携した場合はダミー事業者番号を採番する
  if (client && !client.mfBusinessNo) {
    client.mfBusinessNo = mgmtDummyMfBusinessNo(client);
  }
}

// 既存の 'MF-xxxxxx'（6桁）形式に合わせたダミー事業者番号。先頭9でモック採番と判別しつつclientCodeベースで一意性を確保
function mgmtDummyMfBusinessNo(client) {
  const codeTail = (client?.clientCode || '00000').slice(-5).padStart(5, '0');
  return `MF-9${codeTail}`;
}

function mgmtCloseConnectModal() {
  if (mgmtConnectTimer) {
    clearTimeout(mgmtConnectTimer);
    mgmtConnectTimer = null;
  }
  document.getElementById('mr-connect-modal')?.remove();
}

// JST基準の現在時刻文字列（YYYY-MM-DDTHH:mm:ss）。toISOString()はUTCになるため使わない
function mgmtNowJST() {
  const d = new Date();
  return d.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace(' ', 'T');
}

// JST基準の今日の日付文字列（YYYY-MM-DD）。date inputの既定値用。toISOString()はUTCになるため使わない
function mgmtTodayJST() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}

// ── AI同意 登録/取消モーダル（ひろFB: 「AI同意ってどこで変えれるん？」対応） ──
// 経営レポート一覧・顧客詳細（js/clients/detail.js）の2箇所から呼ばれる共通モーダル。
// このファイルは経営レポート一覧より後にscriptタグで読み込まれるが、関数はグローバル定義かつ
// 呼び出しはユーザー操作（クリック）時＝全script読み込み後なので、読み込み順に関係なく呼び出せる。
// 連携モーダルと同様、処理中タイマーIDを保持しモーダルクローズ時にclearTimeoutして多重操作・裏実行を防ぐ
let mgmtConsentTimer = null;
// 呼び出し元ページを更新するための任意コールバック。経営レポート一覧から開いた場合は不要（自動でrenderManagementReportsListが走る）が、
// 顧客詳細等の他ページから開いた場合はそのページ自身の再描画関数を渡してもらう
let mgmtConsentOnDone = null;

function mgmtOpenConsentModal(clientId, onDone) {
  if (document.getElementById('mr-consent-modal')) return; // 多重起動ガード
  mgmtConsentOnDone = typeof onDone === 'function' ? onDone : null;
  const client = getClientById(clientId);
  const settings = getCompanySettings(clientId);
  const hasConsent = !!settings?.aiReportConsentAt;
  const dateValue = hasConsent ? settings.aiReportConsentAt.slice(0, 10) : mgmtTodayJST();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'mr-consent-modal';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>AIレポート同意の登録</h3>
        <button class="btn-icon" onclick="mgmtCloseConsentModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:13px;color:var(--gray-700);margin-bottom:12px;">
          <strong>${escapeHtml(client?.name || '')}</strong><br>
          契約書でAI利用の合意を締結した日を記録します。
        </p>
        ${hasConsent ? `<p style="font-size:13px;color:var(--gray-700);margin-bottom:12px;">現在の合意締結日: <strong>${formatDate(settings.aiReportConsentAt)}</strong></p>` : ''}
        <div class="form-group">
          <label for="mr-consent-date">合意締結日</label>
          <input type="date" id="mr-consent-date" value="${escapeHtml(dateValue)}">
        </div>
        <p style="font-size:11px;color:var(--gray-500);margin-top:8px;">※実運用では company_settings.ai_report_consent_at を更新します</p>
        <div id="mr-consent-status" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        ${hasConsent ? `<button class="btn btn-danger btn-sm" id="mr-consent-revoke" style="margin-right:auto;" onclick="mgmtRevokeConsent('${clientId}')">同意を取り消す</button>` : ''}
        <button class="btn btn-secondary" onclick="mgmtCloseConsentModal()">キャンセル</button>
        <button class="btn btn-primary" id="mr-consent-submit" onclick="mgmtSubmitConsent('${clientId}')">登録</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// companySettingsに行がないクライアント（契約解除済み等の旧データ・不整合データ）でも同意登録できるように、
// 行がなければ既定値で新規追加してから返す。実運用ではDB側のupsertに相当する処理
// （High FB対応: これまではsettingsがnullだと何も保存せずモーダルだけ閉じるsilent failだった）
function mgmtEnsureCompanySettings(clientId) {
  let settings = getCompanySettings(clientId);
  if (!settings) {
    settings = { clientId, reportFrequency: 'monthly', latestActualMonth: null, aiReportConsentAt: null };
    MOCK_DATA.companySettings.push(settings);
  }
  return settings;
}

// 同意登録/取消 共通の完了処理（モーダルを閉じて一覧・呼び出し元を更新する）
function mgmtFinishConsentUpdate() {
  const onDone = mgmtConsentOnDone;
  mgmtCloseConsentModal();
  renderManagementReportsList(); // 経営レポート一覧が表示されていなければ何もしない
  if (onDone) onDone();
}

function mgmtSubmitConsent(clientId) {
  const dateInput = document.getElementById('mr-consent-date');
  const submitBtn = document.getElementById('mr-consent-submit');
  const revokeBtn = document.getElementById('mr-consent-revoke');
  const status = document.getElementById('mr-consent-status');
  if (!dateInput || !submitBtn) return;

  const dateValue = dateInput.value;
  if (!dateValue) {
    alert('合意締結日を入力してください');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '登録中...';
  if (revokeBtn) revokeBtn.disabled = true;
  if (status) status.innerHTML = '<span style="font-size:12px;color:var(--gray-500);">登録しています...</span>';

  mgmtConsentTimer = setTimeout(() => {
    mgmtConsentTimer = null;
    const settings = mgmtEnsureCompanySettings(clientId);
    settings.aiReportConsentAt = `${dateValue}T00:00:00`;
    mgmtFinishConsentUpdate();
  }, 800);
}

function mgmtRevokeConsent(clientId) {
  const client = getClientById(clientId);
  if (!confirm(`${client?.name || ''}のAIレポート同意を取り消しますか？\n取り消すとレポート生成ができなくなります。`)) return;

  const submitBtn = document.getElementById('mr-consent-submit');
  const revokeBtn = document.getElementById('mr-consent-revoke');
  const status = document.getElementById('mr-consent-status');
  if (submitBtn) submitBtn.disabled = true;
  if (revokeBtn) {
    revokeBtn.disabled = true;
    revokeBtn.textContent = '取消中...';
  }
  if (status) status.innerHTML = '<span style="font-size:12px;color:var(--gray-500);">取り消しています...</span>';

  mgmtConsentTimer = setTimeout(() => {
    mgmtConsentTimer = null;
    const settings = mgmtEnsureCompanySettings(clientId);
    settings.aiReportConsentAt = null;
    mgmtFinishConsentUpdate();
  }, 800);
}

function mgmtCloseConsentModal() {
  if (mgmtConsentTimer) {
    clearTimeout(mgmtConsentTimer);
    mgmtConsentTimer = null;
  }
  mgmtConsentOnDone = null;
  document.getElementById('mr-consent-modal')?.remove();
}

// ── 過去レポート履歴モーダル ──
function mgmtOpenHistoryModal(clientId) {
  const client = getClientById(clientId);
  const history = getGeneratedReports(clientId);

  const rows = history.length === 0
    ? '<tr><td colspan="3" style="text-align:center;color:var(--gray-500);">履歴なし</td></tr>'
    : history.map(r => `<tr>
        <td>${formatDate(r.generatedAt)}</td>
        <td>${escapeHtml(r.periodLabel)}</td>
        <td><button class="btn btn-secondary btn-sm" disabled>表示（準備中）</button></td>
      </tr>`).join('');

  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'mr-history-modal';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${escapeHtml(client?.name || '')} のレポート履歴</h3>
        <button class="btn-icon" onclick="mgmtCloseHistoryModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>生成日</th><th>対象期間</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="mgmtCloseHistoryModal()">閉じる</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function mgmtCloseHistoryModal() {
  document.getElementById('mr-history-modal')?.remove();
}

registerPage('management-reports', renderManagementReports);
