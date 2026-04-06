// ===========================
// 顧客詳細
// ===========================
let clientEditMode = false;

function renderClientDetail(el, params) {
  const isNew = params.id === 'new';
  const editing = isNew || clientEditMode;
  const c = isNew ? null : getClientById(params.id);
  if (!isNew && !c) { el.innerHTML = renderEmptyState('顧客が見つかりません'); return; }

  const staffOptions = buildUserOptions('staff');
  const fiscalOptions = Array.from({length: 12}, (_, i) =>
    `<option value="${i + 1}">${i + 1}月</option>`
  ).join('');

  const customFields = (MOCK_DATA.customFields || []).slice().sort((a, b) => a.order - b.order);
  const cfValues = c ? (c.customFieldValues || {}) : {};

  if (isNew) {
    document.getElementById('header-title').textContent = '新規顧客登録';
  } else {
    document.getElementById('header-title').textContent = editing ? `顧客編集 - ${c.name}` : `顧客詳細 - ${c.name}`;
  }

  // ヘルパー: 閲覧モードの値表示
  const val = (v, fallback) => v || `<span style="color:var(--gray-400)">${fallback || '-'}</span>`;
  // ヘルパー: インライン入力
  const inp = (id, v, type, placeholder) => {
    if (type === 'select-staff') return `<select id="${id}" class="inline-edit-input">${'<option value="">なし</option>' + staffOptions}</select>`;
    if (type === 'select-fiscal') return `<select id="${id}" class="inline-edit-input">${fiscalOptions}</select>`;
    if (type === 'select-type') return `<select id="${id}" class="inline-edit-input"><option value="法人">法人</option><option value="個人">個人</option></select>`;
    if (type === 'number') return `<input type="number" id="${id}" class="inline-edit-input" value="${v || ''}" placeholder="${placeholder || ''}" min="0" step="1000">`;
    if (type === 'date') return `<input type="date" id="${id}" class="inline-edit-input" value="${v || ''}">`;
    if (type === 'textarea') return `<textarea id="${id}" class="inline-edit-input" rows="2" placeholder="${placeholder || ''}">${v || ''}</textarea>`;
    return `<input type="text" id="${id}" class="inline-edit-input" value="${v || ''}" placeholder="${placeholder || ''}">`;
  };

  const tasks = c ? getTasksByClient(c.id) : [];

  // 担当者情報（閲覧モード用）— clientAssignments経由
  const main = c ? getAssigneeUser(c.id, 'main') : null;
  const sub = c ? getAssigneeUser(c.id, 'sub') : null;
  const mgr = c ? getAssigneeUser(c.id, 'reviewer') : null;

  // SPOT報酬
  const spotFees = c ? (c.spotFees || []) : [];

  // CWルームURL
  const cwRoomUrls = c ? (c.cwRoomUrls || []) : [];

  // 関連顧客
  const relatedClientIds = c ? (c.relatedClientIds || []) : [];
  const otherClients = c ? MOCK_DATA.clients.filter(oc => oc.id !== c.id && !relatedClientIds.includes(oc.id)) : MOCK_DATA.clients;

  // SPOT報酬ビューHTML
  const spotFeesViewHtml = spotFees.length === 0
    ? '<span style="color:var(--gray-400)">なし</span>'
    : `<table class="spot-fee-table"><thead><tr><th>タイミング</th><th>金額</th><th>内容</th></tr></thead><tbody>${spotFees.map(sf =>
        `<tr><td>${sf.timing}</td><td>${(sf.amount || 0).toLocaleString()}円</td><td>${sf.description || ''}</td></tr>`
      ).join('')}</tbody></table>`;

  // SPOT報酬編集HTML
  const spotFeesEditHtml = `
    <div id="spot-fees-edit-area">
      ${spotFees.map((sf, i) =>
        `<div class="spot-fee-edit-item" data-index="${i}" style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:12px;">
          <span>${sf.timing}</span> <span>${(sf.amount || 0).toLocaleString()}円</span> <span>${sf.description || ''}</span>
          <button class="spot-fee-del" onclick="removeSpotFee(${i},'${c?.id || ''}')">&times;</button>
        </div>`
      ).join('')}
      <div class="spot-fee-add-row">
        <input type="text" id="add-sf-timing" placeholder="2026-05" style="width:90px;">
        <input type="number" id="add-sf-amount" placeholder="金額" min="0" step="1000">
        <input type="text" id="add-sf-desc" class="spot-fee-desc-input" placeholder="内容">
        <button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="addSpotFee('${c?.id || ''}')">追加</button>
      </div>
    </div>`;

  // CWルームURL ビューHTML
  const cwRoomUrlsViewHtml = cwRoomUrls.length === 0
    ? '<span style="color:var(--gray-400)">なし</span>'
    : `<div class="cw-room-list">${cwRoomUrls.map(r =>
        `<div class="cw-room-item"><a href="${r.url}" target="_blank">${r.name || r.url}</a></div>`
      ).join('')}</div>`;

  // CWルームURL 編集HTML
  const cwRoomUrlsEditHtml = `
    <div id="cw-room-urls-edit-area">
      ${cwRoomUrls.map((r, i) =>
        `<div class="cw-room-item" data-index="${i}">
          <span style="font-size:12px;">${r.name || r.url}</span>
          <button class="cw-room-del" onclick="removeCwRoomUrl(${i},'${c?.id || ''}')">&times;</button>
        </div>`
      ).join('')}
      <div class="cw-room-add-row">
        <input type="text" id="add-cwroom-url" class="cw-room-url-input" placeholder="https://www.chatwork.com/#!rid...">
        <input type="text" id="add-cwroom-name" class="cw-room-name-input" placeholder="表示名">
        <button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="addCwRoomUrl('${c?.id || ''}')">追加</button>
      </div>
    </div>`;

  // 関連顧客ビューHTML
  const relatedClientsViewHtml = relatedClientIds.length === 0
    ? '<span style="color:var(--gray-400)">なし</span>'
    : relatedClientIds.map(rid => {
        const rc = getClientById(rid);
        if (!rc) return '';
        return `<div class="related-client-item"><a href="#" onclick="event.preventDefault();navigateTo('client-detail',{id:'${rc.id}'})">${rc.name}</a> ${renderTypeBadge(rc.clientType)}</div>`;
      }).join('');

  // 関連顧客編集HTML
  const relatedClientsEditHtml = `
    <div id="related-clients-edit-area">
      ${relatedClientIds.map((rid, i) => {
        const rc = getClientById(rid);
        if (!rc) return '';
        return `<div class="related-client-item">
          <span style="font-size:12px;">${rc.name} (${rc.clientType})</span>
          <button class="related-client-del" onclick="removeRelatedClient('${c?.id || ''}','${rid}')">&times;</button>
        </div>`;
      }).join('')}
      ${otherClients.length > 0 ? `
        <div class="related-client-add-row">
          <select id="add-related-client-select">
            <option value="">顧客を選択...</option>
            ${otherClients.map(oc => `<option value="${oc.id}">${oc.name} (${oc.clientType})</option>`).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="addRelatedClient('${c?.id || ''}')">追加</button>
        </div>
      ` : ''}
    </div>`;

  // 業種選択肢
  const industryOptions = ['卸売業','製造業','不動産業','不動産賃貸','小売業','サービス業','IT・ソフトウェア','建設業','飲食業','医療・福祉','農業','NPO・福祉','フリーランス（IT）','その他'].map(i =>
    `<option value="${i}" ${c?.industry === i ? 'selected' : ''}>${i}</option>`
  ).join('');

  // 契約ステータス選択肢
  const contractStatusOptions = ['契約中','契約終了','休止中','見込み'].map(s =>
    `<option value="${s}" ${c?.contractStatus === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  // 決算月選択肢（「個人」含む）
  const fiscalOptionsWithPersonal = Array.from({length: 12}, (_, i) =>
    `<option value="${i + 1}">${i + 1}月</option>`
  ).join('') + '<option value="personal">個人（12月）</option>';

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('clients')">&larr; 顧客一覧に戻る</a></div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-header">
        <h3>${isNew ? '新規顧客登録' : '顧客情報'}</h3>
        <div style="display:flex;gap:8px;">
          ${editing
            ? `<button class="btn btn-primary btn-sm" onclick="saveClientInline('${isNew ? 'new' : c.id}')">保存</button>
               <button class="btn btn-secondary btn-sm" onclick="${isNew ? "navigateTo('clients')" : `clientEditMode=false;navigateTo('client-detail',{id:'${c.id}'})`}">キャンセル</button>`
            : `<button class="btn btn-primary btn-sm" onclick="clientEditMode=true;navigateTo('client-detail',{id:'${c.id}'})">編集</button>`
          }
        </div>
      </div>
      <div class="card-body">
        <div class="view-tabs" id="client-detail-tabs" style="margin-bottom:16px;">
          <button class="view-tab active" data-ctab="basic">基本情報</button>
          <button class="view-tab" data-ctab="tax">税務・申告</button>
          <button class="view-tab" data-ctab="contact">連絡先・連携</button>
        </div>

        <div id="ctab-basic">
          <div class="detail-section-title">基本情報</div>
          <div class="detail-row"><div class="detail-label">管理コード</div><div class="detail-value">${editing ? inp('ed-clientCode', c?.clientCode, 'text', '例: 030450') : val(c?.clientCode)}</div></div>
          <div class="detail-row"><div class="detail-label">顧客コード</div><div class="detail-value">${editing ? inp('ed-displayCode', c?.displayCode, 'text', '例: 001') : val(c?.displayCode)}</div></div>
          <div class="detail-row"><div class="detail-label">契約ステータス</div><div class="detail-value">${editing ? `<select id="ed-contractStatus" class="inline-edit-input">${contractStatusOptions}</select>` : val(c?.contractStatus, '未設定')}</div></div>
          <div class="detail-row"><div class="detail-label">顧客名</div><div class="detail-value">${editing ? inp('ed-name', c?.name, 'text', '例: 株式会社サンプル商事') : val(c.name)}</div></div>
          <div class="detail-row"><div class="detail-label">種別</div><div class="detail-value">${editing ? `<select id="ed-type" class="inline-edit-input"><option value="法人">法人</option><option value="個人">個人</option></select>` : renderTypeBadge(c.clientType)}</div></div>
          <div class="detail-row"><div class="detail-label">決算月</div><div class="detail-value">${editing ? `<select id="ed-fiscal" class="inline-edit-input">${fiscalOptionsWithPersonal}</select>` : (c.fiscalMonth === 'personal' ? '個人（12月）' : c.fiscalMonth + '月')}</div></div>
          <div class="detail-row"><div class="detail-label">業種</div><div class="detail-value">${editing ? `<select id="ed-industry-select" class="inline-edit-input" onchange="document.getElementById('ed-industry-wrap').style.display=this.value==='_other'?'':'none'"><option value="">選択...</option>${industryOptions}<option value="_other">その他（手入力）</option></select><div id="ed-industry-wrap" style="display:${c?.industry && !['卸売業','製造業','不動産業','不動産賃貸','小売業','サービス業','IT・ソフトウェア','建設業','飲食業','医療・福祉','農業','NPO・福祉','フリーランス（IT）','その他'].includes(c.industry) ? '' : 'none'};margin-top:6px;"><input type="text" id="ed-industry" class="inline-edit-input" value="${c?.industry && !['卸売業','製造業','不動産業','不動産賃貸','小売業','サービス業','IT・ソフトウェア','建設業','飲食業','医療・福祉','農業','NPO・福祉','フリーランス（IT）','その他'].includes(c.industry) ? (c.industry || '') : ''}" placeholder="業種を入力"></div>` : val(c?.industry)}</div></div>
          <div class="detail-row"><div class="detail-label">郵便番号</div><div class="detail-value">${editing ? inp('ed-postalCode', c?.postalCode, 'text', '例: 100-0004') : val(c?.postalCode)}</div></div>
          <div class="detail-row"><div class="detail-label">住所</div><div class="detail-value">${editing ? inp('ed-address', c?.address, 'text', '例: 東京都千代田区大手町1-1-1') : val(c.address)}</div></div>
          <div class="detail-row"><div class="detail-label">電話番号</div><div class="detail-value">${editing ? inp('ed-tel', c?.tel, 'text', '例: 03-1234-5678') : val(c.tel)}</div></div>
          <div class="detail-row"><div class="detail-label">代表者</div><div class="detail-value">${editing ? inp('ed-representative', c?.representative, 'text', '例: 山本 太郎') : val(c?.representative)}</div></div>
          <div class="detail-row"><div class="detail-label">管轄税務署</div><div class="detail-value">${editing ? inp('ed-taxoffice', c?.taxOffice, 'text', '例: 千代田税務署') : val(c.taxOffice)}</div></div>
          <div class="detail-row"><div class="detail-label">消費税申告区分</div><div class="detail-value">${editing ? `<select id="ed-consumptionTaxCategory" class="inline-edit-input"><option value="免税" ${c?.consumptionTaxCategory === '免税' ? 'selected' : ''}>免税</option><option value="簡易課税" ${c?.consumptionTaxCategory === '簡易課税' ? 'selected' : ''}>簡易課税</option><option value="本則課税" ${c?.consumptionTaxCategory === '本則課税' ? 'selected' : ''}>本則課税</option></select>` : val(c?.consumptionTaxCategory)}</div></div>
          <div class="detail-row"><div class="detail-label">インボイス登録</div><div class="detail-value">${editing ? `<select id="ed-invoiceRegistered" class="inline-edit-input"><option value="あり" ${c?.invoiceRegistered === 'あり' ? 'selected' : ''}>あり</option><option value="なし" ${c?.invoiceRegistered === 'なし' || !c?.invoiceRegistered ? 'selected' : ''}>なし</option></select>` : val(c?.invoiceRegistered)}</div></div>

          <div class="detail-section-title">報酬</div>
          <div class="detail-row"><div class="detail-label">月額報酬（税抜）</div><div class="detail-value">${editing ? inp('ed-sales', c?.monthlySales, 'number', '50000') : (c.monthlySales || 0).toLocaleString() + '円'}</div></div>
          <div class="detail-row"><div class="detail-label">月額記帳代行報酬（税抜）</div><div class="detail-value">${editing ? inp('ed-monthlyBookkeepingFee', c?.monthlyBookkeepingFee, 'number', '10000') : (c?.monthlyBookkeepingFee || 0).toLocaleString() + '円'}</div></div>
          <div class="detail-row"><div class="detail-label">年1申告報酬（税抜）</div><div class="detail-value">${editing ? inp('ed-annualfee', c?.annualFee, 'number', '150000') : (c?.annualFee || 0).toLocaleString() + '円'}</div></div>
          <div class="detail-row"><div class="detail-label">消費税申告報酬（税抜）</div><div class="detail-value">${editing ? inp('ed-consumptionTaxFee', c?.consumptionTaxFee, 'number', '50000') : (c?.consumptionTaxFee || 0).toLocaleString() + '円'}</div></div>
          <div class="detail-row"><div class="detail-label">消費税申告頻度</div><div class="detail-value">${editing ? `<select id="ed-consumptionTaxFreq" class="inline-edit-input"><option value="年1回" ${c?.consumptionTaxFreq === '年1回' ? 'selected' : ''}>年1回</option><option value="四半期" ${c?.consumptionTaxFreq === '四半期' ? 'selected' : ''}>四半期</option><option value="毎月" ${c?.consumptionTaxFreq === '毎月' ? 'selected' : ''}>毎月</option><option value="なし" ${c?.consumptionTaxFreq === 'なし' || !c?.consumptionTaxFreq ? 'selected' : ''}>なし</option></select>` : val(c?.consumptionTaxFreq, 'なし')}</div></div>
          <div class="detail-row"><div class="detail-label">SPOT報酬</div><div class="detail-value">${editing ? spotFeesEditHtml : spotFeesViewHtml}</div></div>

          <div class="detail-section-title">契約期間</div>
          <div class="detail-row"><div class="detail-label">契約開始日</div><div class="detail-value">${editing ? inp('ed-contractStartDate', c?.contractStartDate, 'date') : val(c?.contractStartDate ? formatDate(c.contractStartDate) : '')}</div></div>
          <div class="detail-row"><div class="detail-label">契約終了日</div><div class="detail-value">${editing ? inp('ed-contractEndDate', c?.contractEndDate, 'date') : val(c?.contractEndDate ? formatDate(c.contractEndDate) : '')}</div></div>
          <div class="detail-row"><div class="detail-label">記帳代行契約開始日</div><div class="detail-value">${editing ? inp('ed-bookkeepingStartDate', c?.bookkeepingStartDate, 'date') : val(c?.bookkeepingStartDate ? formatDate(c.bookkeepingStartDate) : '')}</div></div>
          <div class="detail-row"><div class="detail-label">記帳代行契約終了日</div><div class="detail-value">${editing ? inp('ed-bookkeepingEndDate', c?.bookkeepingEndDate, 'date') : val(c?.bookkeepingEndDate ? formatDate(c.bookkeepingEndDate) : '')}</div></div>
          ${!editing && c?.memo ? `<div class="detail-row"><div class="detail-label">備考</div><div class="detail-value">${c.memo}</div></div>` : ''}

          ${!isNew ? `
          <div class="detail-section-title">関連顧客</div>
          <div class="detail-row"><div class="detail-label">関連顧客</div><div class="detail-value">${editing ? relatedClientsEditHtml : relatedClientsViewHtml}</div></div>
          ` : ''}

          <div class="detail-section-title">担当者</div>
          <div class="detail-row"><div class="detail-label">税理士</div><div class="detail-value">${editing ? inp('ed-mgr', '', 'select-staff') : val(mgr?.name)}</div></div>
          <div class="detail-row"><div class="detail-label">主担当</div><div class="detail-value">${editing ? inp('ed-main', '', 'select-staff') : val(main?.name)}</div></div>
          <div class="detail-row"><div class="detail-label">副担当</div><div class="detail-value">${editing ? inp('ed-sub', '', 'select-staff') : val(sub?.name)}</div></div>
          <div class="detail-row"><div class="detail-label">記帳担当者</div><div class="detail-value">${editing ? inp('ed-bookkeeper', '', 'select-staff') : val(c ? getAssigneeUser(c.id, 'bookkeeping_main')?.name : null)}</div></div>
          <div class="detail-row"><div class="detail-label">記帳責任者補佐</div><div class="detail-value">${editing ? inp('ed-bookkeepingSub', '', 'select-staff') : val(c ? getAssigneeUser(c.id, 'bookkeeping_sub')?.name : null)}</div></div>
        </div>

        <div id="ctab-tax" style="display:none;">
          <div class="detail-section-title">税務情報</div>
          <div class="detail-row"><div class="detail-label">日税コード</div><div class="detail-value">${editing ? inp('ed-nichizeiCode', c?.nichizeiCode, 'text', '例: NT-001234') : val(c?.nichizeiCode)}</div></div>
          <div class="detail-row"><div class="detail-label">管理表No</div><div class="detail-value">${editing ? inp('ed-managementNo', c?.managementNo, 'text', '例: M-0450') : val(c?.managementNo)}</div></div>
          <div class="detail-row"><div class="detail-label">MF事業者番号</div><div class="detail-value">${editing ? inp('ed-mfBusinessNo', c?.mfBusinessNo, 'text', '例: MF-001234') : val(c?.mfBusinessNo)}</div></div>
          <div class="detail-row"><div class="detail-label">e-Tax利用者識別番号</div><div class="detail-value">${editing ? inp('ed-etaxId', c?.etaxId, 'text', '例: 0012345678901234') : val(c?.etaxId)}</div></div>
          <div class="detail-row"><div class="detail-label">e-Taxパスワード</div><div class="detail-value">${editing ? '<div style="display:flex;align-items:center;gap:4px;"><input type="password" id="ed-etaxPassword" class="inline-edit-input" value="' + escapeHtml(c?.etaxPassword || '') + '" placeholder="パスワードを入力" style="flex:1;"><button type="button" class="btn btn-ghost btn-xs" onclick="togglePasswordField(\'ed-etaxPassword\', this)" title="表示切替">👁</button></div>' : (c?.etaxPassword ? '<span style="display:inline-flex;align-items:center;gap:6px;"><span class="pw-mask" data-pw="' + escapeHtml(c.etaxPassword) + '">••••••••</span><button type="button" class="btn btn-ghost btn-xs" onclick="togglePasswordMask(this)" title="表示切替">👁</button></span>' : '-')}</div></div>
          <div class="detail-row"><div class="detail-label">eLTAX利用者ID</div><div class="detail-value">${editing ? inp('ed-eltaxId', c?.eltaxId, 'text', '例: LT001234') : val(c?.eltaxId)}</div></div>
          <div class="detail-row"><div class="detail-label">eLTAXパスワード</div><div class="detail-value">${editing ? '<div style="display:flex;align-items:center;gap:4px;"><input type="password" id="ed-eltaxPassword" class="inline-edit-input" value="' + escapeHtml(c?.eltaxPassword || '') + '" placeholder="パスワードを入力" style="flex:1;"><button type="button" class="btn btn-ghost btn-xs" onclick="togglePasswordField(\'ed-eltaxPassword\', this)" title="表示切替">👁</button></div>' : (c?.eltaxPassword ? '<span style="display:inline-flex;align-items:center;gap:6px;"><span class="pw-mask" data-pw="' + escapeHtml(c.eltaxPassword) + '">••••••••</span><button type="button" class="btn btn-ghost btn-xs" onclick="togglePasswordMask(this)" title="表示切替">👁</button></span>' : '-')}</div></div>
          <div class="detail-row"><div class="detail-label">委任登録</div><div class="detail-value">${editing ? `<select id="ed-delegationStatus" class="inline-edit-input"><option value="登録済み" ${c?.delegationStatus === '登録済み' ? 'selected' : ''}>登録済み</option><option value="未登録" ${c?.delegationStatus === '未登録' || !c?.delegationStatus ? 'selected' : ''}>未登録</option></select>` : val(c?.delegationStatus)}</div></div>
          <div class="detail-row"><div class="detail-label">日税登録</div><div class="detail-value">${editing ? `<select id="ed-nichizeiRegistration" class="inline-edit-input"><option value="登録確認済" ${c?.nichizeiRegistration === '登録確認済' ? 'selected' : ''}>登録確認済</option><option value="要登録" ${c?.nichizeiRegistration === '要登録' || !c?.nichizeiRegistration ? 'selected' : ''}>要登録</option></select>` : val(c?.nichizeiRegistration)}</div></div>

          <div class="detail-section-title">申告・法人情報</div>
          <div class="detail-row"><div class="detail-label">資本金</div><div class="detail-value">${editing ? inp('ed-capitalAmount', c?.capitalAmount, 'number', '例: 10000000') : (c?.capitalAmount ? Number(c.capitalAmount).toLocaleString() + '円' : val(''))}</div></div>
          <div class="detail-row"><div class="detail-label">法人番号</div><div class="detail-value">${editing ? inp('ed-corporateNumber', c?.corporateNumber, 'text', '13桁の法人番号') : val(c?.corporateNumber)}</div></div>
          <div class="detail-row"><div class="detail-label">申告区分</div><div class="detail-value">${editing ? `<select id="ed-filingType" class="inline-edit-input"><option value="">未設定</option><option value="青色" ${c?.filingType === '青色' ? 'selected' : ''}>青色</option><option value="白色" ${c?.filingType === '白色' ? 'selected' : ''}>白色</option></select>` : val(c?.filingType)}</div></div>
          <div class="detail-row"><div class="detail-label">年末調整</div><div class="detail-value">${editing ? `<select id="ed-yearEndAdjustment" class="inline-edit-input"><option value="true" ${c?.yearEndAdjustment ? 'selected' : ''}>対応あり</option><option value="false" ${!c?.yearEndAdjustment ? 'selected' : ''}>対応なし</option></select>` : (c?.yearEndAdjustment ? '<span style="color:var(--success)">対応あり</span>' : '<span style="color:var(--gray-400)">対応なし</span>')}</div></div>
          <div class="detail-row"><div class="detail-label">中間申告</div><div class="detail-value">${editing ? `<select id="ed-interimFiling" class="inline-edit-input"><option value="なし" ${c?.interimFiling === 'なし' || !c?.interimFiling ? 'selected' : ''}>なし</option><option value="法人税のみ" ${c?.interimFiling === '法人税のみ' ? 'selected' : ''}>法人税のみ</option><option value="法人税+消費税" ${c?.interimFiling === '法人税+消費税' ? 'selected' : ''}>法人税+消費税</option><option value="消費税のみ" ${c?.interimFiling === '消費税のみ' ? 'selected' : ''}>消費税のみ</option></select>` : val(c?.interimFiling)}</div></div>

          <div class="detail-section-title">納付情報</div>
          <div class="detail-row"><div class="detail-label">ダイレクト納付</div><div class="detail-value">${editing ? `<select id="ed-directDebit" class="inline-edit-input"><option value="true" ${c?.paymentInfo?.directDebit ? 'selected' : ''}>設定済み</option><option value="false" ${!c?.paymentInfo?.directDebit ? 'selected' : ''}>未設定</option></select>` : (c?.paymentInfo?.directDebit ? '<span style="color:var(--success)">設定済み</span>' : '<span style="color:var(--gray-400)">未設定</span>')}</div></div>
          <div class="detail-row"><div class="detail-label">ダイレクト納付書類依頼状況</div><div class="detail-value">${editing ? inp('ed-directDebitStatus', c?.directDebitStatus, 'text', '例: 設定済み / 依頼中 / 未依頼') : val(c?.directDebitStatus)}</div></div>
          <div class="detail-row"><div class="detail-label">振替口座</div><div class="detail-value">${editing ? inp('ed-transferAccount', c?.paymentInfo?.transferAccount, 'text', '例: 三井住友銀行 大手町支店') : val(c?.paymentInfo?.transferAccount)}</div></div>
          <div class="detail-row"><div class="detail-label">引落口座情報（カナ）</div><div class="detail-value">${editing ? inp('ed-transferAccountKana', c?.paymentInfo?.transferAccountKana, 'text', '例: ミツイスミトモギンコウ オオテマチシテン') : val(c?.paymentInfo?.transferAccountKana)}</div></div>
          <div class="detail-row"><div class="detail-label">納付備考</div><div class="detail-value">${editing ? inp('ed-paymentRemarks', c?.paymentInfo?.remarks, 'textarea', '納付に関する備考') : val(c?.paymentInfo?.remarks)}</div></div>
        </div>

        <div id="ctab-contact" style="display:none;">
          <div class="detail-section-title">連絡先</div>
          <div class="detail-row"><div class="detail-label">メールアドレス</div><div class="detail-value">${editing ? inp('ed-email', c?.email, 'text', '例: info@example.com') : val(c?.email)}</div></div>
          <div class="detail-row"><div class="detail-label">シティネーム</div><div class="detail-value">${editing ? inp('ed-cityName', c?.cityName, 'text', '例: やまもとたろう') : val(c?.cityName)}</div></div>
          <div class="detail-row"><div class="detail-label">シティURL</div><div class="detail-value">${editing ? inp('ed-cityUrl', c?.cityUrl, 'text', 'https://libecity.com/user/...') : (c?.cityUrl ? `<a href="${escapeHtml(c.cityUrl)}" target="_blank">${escapeHtml(c.cityUrl)}</a>` : val(''))}</div></div>

          <div class="detail-section-title">Chatwork連携</div>
          <div class="detail-row"><div class="detail-label">CWURL</div><div class="detail-value">${editing ? inp('ed-cwid', c?.cwAccountId, 'text', '例: https://www.chatwork.com/#!rid123456') : val(c?.cwAccountId, '未設定')}</div></div>
        ${!editing ? `
          <div class="detail-row"><div class="detail-label">メンション</div><div class="detail-value">${c.cwAccountId ? '<code style="background:var(--gray-100);padding:2px 6px;border-radius:3px;font-size:12px;">[To:' + c.cwAccountId + ']' + c.name + 'さん</code>' : val('', '-')}</div></div>
        ` : ''}
        <div class="detail-row"><div class="detail-label">CWルームURL</div><div class="detail-value">${editing ? cwRoomUrlsEditHtml : cwRoomUrlsViewHtml}</div></div>

          <div class="detail-section-title">外部サービス</div>
          <div class="detail-row"><div class="detail-label">Dropbox</div><div class="detail-value">${editing ? inp('ed-dropboxPath', c?.dropboxPath, 'text', '例: /リベ税/顧客/顧客名') : (c?.dropboxPath ? `<a href="#" onclick="event.preventDefault();window.open('https://www.dropbox.com','_blank')">${escapeHtml(c.dropboxPath)}</a>` : val(''))}</div></div>

        ${customFields.length > 0 || editing ? `
          <div class="detail-section-title" style="display:flex;align-items:center;justify-content:space-between;">
            カスタム項目
            ${editing ? '<button class="btn btn-secondary btn-sm" style="font-size:11px;" onclick="openCustomFieldModal()">項目設定</button>' : ''}
          </div>
          ${customFields.map(cf => {
            if (editing) {
              return `<div class="detail-row"><div class="detail-label">${cf.name}</div><div class="detail-value">${buildCustomFieldInput(cf, cfValues[cf.id], 'inline-edit-input')}</div></div>`;
            }
            return `<div class="detail-row"><div class="detail-label">${cf.name}</div><div class="detail-value">${val(cfValues[cf.id])}</div></div>`;
          }).join('')}
        ` : ''}
        </div>
      </div>
    </div>

    ${(!isNew && !editing) ? renderTaxScheduleCard(c) : ''}

    ${(!isNew && !editing) ? `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header"><h3>契約書PDF取込</h3></div>
      <div class="card-body">
        <p style="font-size:12px;color:var(--gray-500);margin-bottom:12px;">契約書PDFをアップロードすると、AIが内容を解析して顧客情報を自動入力します。</p>
        <div style="display:flex;gap:12px;align-items:center;">
          <input type="file" id="contract-pdf-input-${c.id}" accept=".pdf" style="font-size:13px;">
          <button class="btn btn-primary btn-sm" onclick="analyzeContractPdf('${c.id}')">解析して反映</button>
        </div>
        <div id="contract-pdf-result-${c.id}" style="margin-top:12px;"></div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
        <h3>CW資料→Dropbox転送</h3>
        <button class="btn btn-secondary btn-sm" onclick="fetchCwFiles('${c.id}')">CWファイル取得</button>
      </div>
      <div class="card-body">
        <p style="font-size:12px;color:var(--gray-500);margin-bottom:12px;">Chatworkルームの共有ファイルを取得し、Dropboxに転送します。</p>
        <div id="cw-files-list-${c.id}"></div>
      </div>
    </div>
    ` : ''}

    ${!isNew ? `
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><h3>関連タスク</h3><button class="btn btn-primary btn-sm" onclick="openTaskModal()">+ タスク追加</button></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>タスク名</th><th>担当者</th><th>期限</th><th>状態</th></tr></thead>
            <tbody>
              ${tasks.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--gray-400)">タスクなし</td></tr>' : tasks.map(t => {
                const assignee = getUserById(t.assigneeUserId);
                return `<tr class="clickable" onclick="navigateTo('task-detail',{id:'${t.id}'})">
                  <td>${t.title}</td>
                  <td>${assignee?.name || '-'}</td>
                  <td>${formatDate(t.dueDate)}</td>
                  <td>${renderStatusBadge(t.status)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><h3>報告書サマリー</h3><span style="font-size:11px;color:var(--gray-400);margin-left:8px;">AI自動生成（準備中）</span></div>
      <div class="card-body">
        ${renderReportSummaryCard(c)}
      </div>
    </div>
    <div style="text-align:right;">
      <button class="btn btn-danger" onclick="deleteClient('${c.id}')" style="background:var(--danger);color:#fff;border:none;">顧客を削除</button>
    </div>
    ` : ''}
  `;

  // タブ切り替え
  document.getElementById('client-detail-tabs')?.addEventListener('click', e => {
    const tab = e.target.dataset?.ctab;
    if (!tab) return;
    document.querySelectorAll('#client-detail-tabs .view-tab').forEach(b => b.classList.toggle('active', b.dataset.ctab === tab));
    ['basic', 'tax', 'contact'].forEach(t => {
      const el = document.getElementById('ctab-' + t);
      if (el) el.style.display = t === tab ? '' : 'none';
    });
  });

  // 編集モード: selectの値をセット（innerHTML後でないと反映されない）
  if (editing) {
    const setVal = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
    setVal('ed-type', c?.clientType || '法人');
    setVal('ed-fiscal', c?.fiscalMonth === 'personal' ? 'personal' : (c?.fiscalMonth || 3));
    setVal('ed-mgr', getAssigneeUserId(c?.id, 'reviewer') || '');
    setVal('ed-main', getAssigneeUserId(c?.id, 'main') || '');
    setVal('ed-sub', getAssigneeUserId(c?.id, 'sub') || '');
    setVal('ed-bookkeeper', getAssigneeUserId(c?.id, 'bookkeeping_main') || '');
    setVal('ed-bookkeepingSub', getAssigneeUserId(c?.id, 'bookkeeping_sub') || '');
  }
}

function saveClientInline(id) {
  const isNew = id === 'new';
  const name = getValTrim('ed-name');
  const clientType = getVal('ed-type', '法人');
  const fiscalRaw = getVal('ed-fiscal', '3');
  const fiscalMonth = fiscalRaw === 'personal' ? 'personal' : parseInt(fiscalRaw) || 3;
  const monthlySales = getValInt('ed-sales');
  const annualFee = getValInt('ed-annualfee');
  const address = getValTrim('ed-address');
  const tel = getValTrim('ed-tel');
  const representative = getValTrim('ed-representative');
  const industrySelect = getVal('ed-industry-select', '');
  const industry = industrySelect === '_other' ? getValTrim('ed-industry') : (industrySelect || getValTrim('ed-industry'));
  const taxOffice = getValTrim('ed-taxoffice');
  const mgrUserId = getVal('ed-mgr', '');
  const mainUserId = getVal('ed-main', '');
  const subUserId = getVal('ed-sub') || null;
  const cwAccountId = getValTrim('ed-cwid');
  // 新規フィールド
  const contractStatus = getVal('ed-contractStatus', '');
  const contractStartDate = getVal('ed-contractStartDate', '');
  const contractEndDate = getVal('ed-contractEndDate', '');
  const nichizeiCode = getValTrim('ed-nichizeiCode');
  const managementNo = getValTrim('ed-managementNo');
  const etaxId = getValTrim('ed-etaxId');
  const etaxPassword = getValTrim('ed-etaxPassword');
  const eltaxId = getValTrim('ed-eltaxId');
  const eltaxPassword = getValTrim('ed-eltaxPassword');
  const directDebitStatus = getValTrim('ed-directDebitStatus');
  const email = getValTrim('ed-email');
  const cityName = getValTrim('ed-cityName');
  const cityUrl = getValTrim('ed-cityUrl');
  const dropboxPath = getValTrim('ed-dropboxPath');
  const consumptionTaxFee = getValInt('ed-consumptionTaxFee');
  const consumptionTaxFreq = getVal('ed-consumptionTaxFreq', 'なし');
  const clientCode = getValTrim('ed-clientCode');
  const postalCode = getValTrim('ed-postalCode');
  const consumptionTaxCategory = getVal('ed-consumptionTaxCategory', '');
  const invoiceRegistered = getVal('ed-invoiceRegistered', 'なし');
  const monthlyBookkeepingFee = getValInt('ed-monthlyBookkeepingFee');
  const bookkeepingStartDate = getVal('ed-bookkeepingStartDate', '');
  const bookkeepingEndDate = getVal('ed-bookkeepingEndDate', '');
  const bookkeeperId = getVal('ed-bookkeeper', '') || null;
  const bookkeepingSubId = getVal('ed-bookkeepingSub', '') || null;
  const mfBusinessNo = getValTrim('ed-mfBusinessNo');
  const delegationStatus = getVal('ed-delegationStatus', '');
  const nichizeiRegistration = getVal('ed-nichizeiRegistration', '');
  const displayCode = getValTrim('ed-displayCode');
  const capitalAmount = getValInt('ed-capitalAmount', 0) || null;
  const corporateNumber = getValTrim('ed-corporateNumber');
  const filingType = getVal('ed-filingType', '');
  const yearEndAdjustment = getVal('ed-yearEndAdjustment', 'false') === 'true';
  const interimFiling = getVal('ed-interimFiling', 'なし');
  const paymentInfo = {
    directDebit: getVal('ed-directDebit', 'false') === 'true',
    transferAccount: getValTrim('ed-transferAccount'),
    transferAccountKana: getValTrim('ed-transferAccountKana'),
    remarks: getValTrim('ed-paymentRemarks'),
  };

  // カスタムフィールド値
  const customFieldValues = {};
  (MOCK_DATA.customFields || []).forEach(cf => {
    const el = document.getElementById('cf-val-' + cf.id);
    if (el && el.value.trim()) customFieldValues[cf.id] = el.value.trim();
  });

  if (!name) { alert('顧客名を入力してください'); return; }

  if (isNew) {
    const resolvedCode = clientCode || (function() { const last = MOCK_DATA.clients.length > 0 ? MOCK_DATA.clients[MOCK_DATA.clients.length - 1].clientCode : '030449'; return String(parseInt(last) + 1).padStart(6, '0'); })();
    const newId = generateId('c-', MOCK_DATA.clients);
    MOCK_DATA.clients.push({
      id: newId, clientCode: resolvedCode, name, clientType, fiscalMonth,
      isActive: true, mainUserId, subUserId, mgrUserId: mgrUserId || mainUserId,
      monthlySales, annualFee, spotFees: [], address, tel, industry, representative, taxOffice,
      memo: '', establishDate: '', cwAccountId, cwRoomUrls: [], relatedClientIds: [], customFieldValues,
      contractStatus, contractStartDate, contractEndDate, nichizeiCode, managementNo, etaxId, etaxPassword, eltaxId, eltaxPassword, directDebitStatus,
      email, cityName, cityUrl, dropboxPath, consumptionTaxFee, consumptionTaxFreq, paymentInfo,
      postalCode, consumptionTaxCategory, invoiceRegistered, monthlyBookkeepingFee,
      bookkeepingStartDate, bookkeepingEndDate, bookkeeperId, bookkeepingSubId,
      mfBusinessNo, delegationStatus, nichizeiRegistration,
      displayCode, capitalAmount, corporateNumber, filingType, yearEndAdjustment, interimFiling,
    });
    // アサインメント登録（多対多）
    if (mainUserId) upsertAssignment(newId, 'main', mainUserId);
    if (subUserId) upsertAssignment(newId, 'sub', subUserId);
    if (mgrUserId || mainUserId) upsertAssignment(newId, 'reviewer', mgrUserId || mainUserId);
    if (bookkeeperId) upsertAssignment(newId, 'bookkeeping_main', bookkeeperId);
    if (bookkeepingSubId) upsertAssignment(newId, 'bookkeeping_sub', bookkeepingSubId);
    clientEditMode = false;
    navigateTo('client-detail', { id: newId });
  } else {
    const c = getClientById(id);
    if (c) {
      if (clientCode) c.clientCode = clientCode;
      c.name = name; c.clientType = clientType; c.fiscalMonth = fiscalMonth;
      c.mgrUserId = mgrUserId || mainUserId; c.mainUserId = mainUserId; c.subUserId = subUserId;
      // アサインメント更新（多対多）
      upsertAssignment(c.id, 'main', mainUserId);
      upsertAssignment(c.id, 'sub', subUserId);
      upsertAssignment(c.id, 'reviewer', mgrUserId || mainUserId);
      upsertAssignment(c.id, 'bookkeeping_main', bookkeeperId);
      upsertAssignment(c.id, 'bookkeeping_sub', bookkeepingSubId);
      c.monthlySales = monthlySales; c.annualFee = annualFee;
      c.address = address; c.tel = tel;
      c.industry = industry; c.representative = representative; c.taxOffice = taxOffice;
      c.cwAccountId = cwAccountId;
      c.customFieldValues = customFieldValues;
      c.contractStatus = contractStatus; c.contractStartDate = contractStartDate; c.contractEndDate = contractEndDate;
      c.nichizeiCode = nichizeiCode; c.managementNo = managementNo;
      c.etaxId = etaxId; c.etaxPassword = etaxPassword; c.eltaxId = eltaxId; c.eltaxPassword = eltaxPassword; c.directDebitStatus = directDebitStatus;
      c.email = email; c.cityName = cityName; c.cityUrl = cityUrl;
      c.dropboxPath = dropboxPath; c.paymentInfo = paymentInfo;
      c.consumptionTaxFee = consumptionTaxFee; c.consumptionTaxFreq = consumptionTaxFreq;
      c.postalCode = postalCode; c.consumptionTaxCategory = consumptionTaxCategory;
      c.invoiceRegistered = invoiceRegistered; c.monthlyBookkeepingFee = monthlyBookkeepingFee;
      c.bookkeepingStartDate = bookkeepingStartDate; c.bookkeepingEndDate = bookkeepingEndDate;
      c.bookkeeperId = bookkeeperId; c.bookkeepingSubId = bookkeepingSubId;
      c.mfBusinessNo = mfBusinessNo; c.delegationStatus = delegationStatus; c.nichizeiRegistration = nichizeiRegistration;
      c.displayCode = displayCode; c.capitalAmount = capitalAmount; c.corporateNumber = corporateNumber;
      c.filingType = filingType; c.yearEndAdjustment = yearEndAdjustment; c.interimFiling = interimFiling;
    }
    clientEditMode = false;
    navigateTo('client-detail', { id });
  }
}

// SPOT報酬の追加・削除
function addSpotFee(clientId) {
  const timing = (document.getElementById('add-sf-timing')?.value || '').trim();
  const amount = parseInt(document.getElementById('add-sf-amount')?.value) || 0;
  const description = (document.getElementById('add-sf-desc')?.value || '').trim();
  if (!timing || !amount) { alert('タイミングと金額を入力してください'); return; }
  const c = getClientById(clientId);
  if (!c) return;
  if (!c.spotFees) c.spotFees = [];
  c.spotFees.push({ id: 'sf-' + Date.now(), timing, amount, description });
  navigateTo('client-detail', { id: clientId });
}

function removeSpotFee(index, clientId) {
  const c = getClientById(clientId);
  if (!c || !c.spotFees) return;
  c.spotFees.splice(index, 1);
  navigateTo('client-detail', { id: clientId });
}

// CWルームURLの追加・削除
function addCwRoomUrl(clientId) {
  const url = (document.getElementById('add-cwroom-url')?.value || '').trim();
  const name = (document.getElementById('add-cwroom-name')?.value || '').trim();
  if (!url) { alert('URLを入力してください'); return; }
  const c = getClientById(clientId);
  if (!c) return;
  if (!c.cwRoomUrls) c.cwRoomUrls = [];
  c.cwRoomUrls.push({ url, name: name || url });
  navigateTo('client-detail', { id: clientId });
}

function removeCwRoomUrl(index, clientId) {
  const c = getClientById(clientId);
  if (!c || !c.cwRoomUrls) return;
  c.cwRoomUrls.splice(index, 1);
  navigateTo('client-detail', { id: clientId });
}

// 関連顧客の追加・削除
function addRelatedClient(clientId) {
  const select = document.getElementById('add-related-client-select');
  if (!select || !select.value) { alert('顧客を選択してください'); return; }
  const targetId = select.value;
  const c = getClientById(clientId);
  const target = getClientById(targetId);
  if (!c || !target) return;
  if (!c.relatedClientIds) c.relatedClientIds = [];
  if (!target.relatedClientIds) target.relatedClientIds = [];
  if (!c.relatedClientIds.includes(targetId)) c.relatedClientIds.push(targetId);
  if (!target.relatedClientIds.includes(clientId)) target.relatedClientIds.push(clientId);
  navigateTo('client-detail', { id: clientId });
}

function removeRelatedClient(clientId, targetId) {
  const c = getClientById(clientId);
  const target = getClientById(targetId);
  if (c && c.relatedClientIds) c.relatedClientIds = c.relatedClientIds.filter(id => id !== targetId);
  if (target && target.relatedClientIds) target.relatedClientIds = target.relatedClientIds.filter(id => id !== clientId);
  navigateTo('client-detail', { id: clientId });
}

// 顧客削除
function deleteClient(clientId) {
  const c = getClientById(clientId);
  if (!c) return;
  if (!confirm(`顧客「${c.name}」を削除しますか？\nこの操作は取り消せません。`)) return;
  MOCK_DATA.clients = MOCK_DATA.clients.filter(x => x.id !== clientId);
  MOCK_DATA.clientAssignments = MOCK_DATA.clientAssignments.filter(a => a.clientId !== clientId);
  navigateTo('clients');
}

registerPage('client-detail', renderClientDetail);
