// ===========================
// AIアシスタント
// ===========================
let aiActiveTab = 'qa';
let aiChatMessages = [];
let aiSuggestions = [];

function renderAI(el) {
  const tabs = [
    { key: 'qa', label: '社内Q&A' },
    { key: 'draft', label: '顧客対応下書き' },
    { key: 'suggest', label: 'タスク提案' },
  ];

  el.innerHTML = `
    <div class="tab-bar" id="ai-tabs">
      ${tabs.map(t => `<button class="tab-btn ${t.key === aiActiveTab ? 'active' : ''}" data-tab="${t.key}">${t.label}</button>`).join('')}
    </div>
    <div id="ai-panel"></div>
  `;

  document.querySelectorAll('#ai-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      aiActiveTab = btn.dataset.tab;
      document.querySelectorAll('#ai-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAIPanel();
    });
  });

  if (aiChatMessages.length === 0) {
    aiChatMessages = [
      { role: 'user', text: '法人の決算期変更の手続きを教えてください' },
      { role: 'ai', text: '法人の決算期変更の手続きについてご説明します。\n\n**1. 株主総会の決議**\n定款変更が必要なため、株主総会の特別決議（議決権の2/3以上）を行います。\n\n**2. 定款の変更**\n事業年度に関する条項を新しい決算月に変更します。\n\n**3. 税務署への届出**\n「異動届出書」を所轄税務署に提出します。届出期限は変更後遅滞なく提出が必要です。\n\n**4. 都道府県・市区町村への届出**\n地方税の届出も必要です。各自治体の窓口に届出書を提出してください。\n\n**5. その他の届出**\n- 社会保険事務所への届出\n- 取引先への通知\n- 会計システムの設定変更\n\n**注意点:**\n- 変更初年度は事業年度が1年未満になる場合があります\n- 消費税の課税期間にも影響するため、慎重にご検討ください' },
      { role: 'user', text: '確定申告の電子申告の手順は？' },
      { role: 'ai', text: '確定申告の電子申告（e-Tax）の手順をご案内します。\n\n**事前準備:**\n1. 利用者識別番号の取得（初回のみ）\n2. 電子証明書の取得（マイナンバーカード等）\n3. ICカードリーダーの準備（またはスマートフォン）\n4. e-Taxソフトのインストール\n\n**申告手順:**\n1. **e-Taxソフトを起動**し、利用者識別番号でログイン\n2. **申告書の作成** - 所得税、消費税等の該当する申告書を選択\n3. **各項目を入力** - 収入金額、所得金額、控除額等\n4. **電子署名の付与** - マイナンバーカード等で署名\n5. **送信** - 申告データをe-Taxサーバーに送信\n6. **受信通知の確認** - 送信完了後、受信通知で受付番号を確認\n\n**当事務所での運用:**\n- 税理士の電子署名で代理送信を行います\n- 送信前にレビュー担当者の確認を必ず受けてください\n- 送信完了後は報告書に受付番号を記載してください' },
    ];
  }

  renderAIPanel();
}

function renderAIPanel() {
  const panel = document.getElementById('ai-panel');
  if (!panel) return;

  if (aiActiveTab === 'qa') renderAIQA(panel);
  else if (aiActiveTab === 'draft') renderAIDraft(panel);
  else if (aiActiveTab === 'suggest') renderAISuggest(panel);
}

function renderAIQA(panel) {
  panel.innerHTML = `
    <div class="card" style="display:flex;flex-direction:column;height:calc(100vh - 220px);min-height:400px;">
      <div class="ai-chat-area" id="ai-chat-area"></div>
      <div class="ai-chat-input-area">
        <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="質問を入力してください..." autocomplete="off">
        <button class="btn btn-primary" id="ai-chat-send">送信</button>
      </div>
    </div>
  `;

  renderAIChatMessages();

  const input = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');

  sendBtn.addEventListener('click', () => sendAIChat());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) sendAIChat();
  });
}

function renderAIChatMessages() {
  const area = document.getElementById('ai-chat-area');
  if (!area) return;

  area.innerHTML = aiChatMessages.map(m => {
    if (m.role === 'user') {
      return `<div class="ai-msg ai-msg-user"><div class="ai-msg-bubble ai-msg-bubble-user">${escapeHtml(m.text)}</div></div>`;
    } else if (m.role === 'typing') {
      return `<div class="ai-msg ai-msg-ai"><div class="ai-msg-avatar">AI</div><div class="ai-msg-bubble ai-msg-bubble-ai"><span class="ai-typing"><span>.</span><span>.</span><span>.</span></span> AIが考えています...</div></div>`;
    } else {
      return `<div class="ai-msg ai-msg-ai"><div class="ai-msg-avatar">AI</div><div class="ai-msg-bubble ai-msg-bubble-ai">${formatAIText(m.text)}</div></div>`;
    }
  }).join('');

  area.scrollTop = area.scrollHeight;
}

function sendAIChat() {
  const input = document.getElementById('ai-chat-input');
  const text = input.value.trim();
  if (!text) return;

  aiChatMessages.push({ role: 'user', text });
  input.value = '';
  renderAIChatMessages();

  setTimeout(() => {
    aiChatMessages.push({ role: 'typing', text: '' });
    renderAIChatMessages();

    setTimeout(() => {
      aiChatMessages = aiChatMessages.filter(m => m.role !== 'typing');
      const response = getAIMockResponse(text);
      aiChatMessages.push({ role: 'ai', text: response });
      renderAIChatMessages();
    }, 1500);
  }, 500);
}

function getAIMockResponse(question) {
  const q = question.toLowerCase();

  if (q.includes('決算')) {
    return '決算に関するご質問ですね。\n\n**決算業務の基本フロー:**\n1. 資料回収（請求書・領収書・通帳コピー等）\n2. 記帳確認・仕訳修正\n3. 決算整理仕訳の入力\n4. 勘定科目内訳書の作成\n5. 法人税・地方税・消費税の申告書作成\n6. レビュー担当者による確認\n7. 電子申告\n8. 納品（申告書控え・決算書の送付）\n\n**期限について:**\n- 法人税の申告期限は事業年度終了日の翌日から2ヶ月以内です\n- 延長届出を提出している場合は3ヶ月以内となります\n\n詳細な手順は社内マニュアル「決算業務フロー」をご確認ください。';
  }

  if (q.includes('確定申告')) {
    return '確定申告に関するご質問ですね。\n\n**確定申告の主なスケジュール:**\n- 1月：資料回収開始\n- 2月16日〜3月15日：所得税の確定申告期間\n- 3月31日：消費税の確定申告期限\n\n**当事務所での対応フロー:**\n1. 顧客へ資料依頼メール送信\n2. 資料回収・不足資料の催促\n3. 会計帳簿のチェック\n4. 申告書の作成\n5. レビュー担当者による確認\n6. 電子申告（税理士代理送信）\n7. 申告完了報告・控えの送付\n\n**注意事項:**\n- 医療費控除、ふるさと納税等の資料を忘れずに回収\n- 不動産所得がある場合は減価償却の確認を\n- 青色申告特別控除の要件を満たしているか確認';
  }

  if (q.includes('年末調整')) {
    return '年末調整に関するご質問ですね。\n\n**年末調整の業務フロー:**\n1. **11月上旬** - 顧客へ年末調整資料の配布依頼\n2. **11月中旬〜12月上旬** - 資料回収\n   - 扶養控除等申告書\n   - 保険料控除申告書\n   - 住宅ローン控除申告書\n3. **12月中旬** - 年末調整計算の実施\n4. **12月下旬** - 源泉所得税の納付（1/10期限）\n5. **1月** - 関連書類の作成・提出\n   - 給与支払報告書（市区町村へ）\n   - 法定調書合計表（税務署へ）\n   - 償却資産申告書（市区町村へ）\n\n**進捗管理表について:**\n当事務所では「年末調整管理表」で各顧客の進捗を管理しています。\n各工程のステータスを随時更新してください。';
  }

  if (q.includes('インボイス') || q.includes('適格請求書')) {
    return 'インボイス制度についてのご案内です。\n\n**インボイス制度の概要:**\n- 2023年10月1日から開始された適格請求書等保存方式\n- 適格請求書発行事業者の登録が必要\n\n**当事務所での確認ポイント:**\n1. 顧客が適格請求書発行事業者に登録済みか確認\n2. 発行するインボイスの記載事項が正しいか確認\n3. 受領したインボイスの保存が適切か確認\n4. 免税事業者との取引の経過措置の適用確認\n\n**経過措置:**\n- 2026年9月30日まで：80%控除可能\n- 2029年9月30日まで：50%控除可能\n\n詳細は社内マニュアル「インボイス制度対応ガイド」をご確認ください。';
  }

  if (q.includes('消費税')) {
    return '消費税に関するご質問ですね。\n\n**消費税の基本:**\n- 基準期間の課税売上高が1,000万円を超える場合に課税事業者\n- 簡易課税制度の選択も検討（基準期間の課税売上高5,000万円以下）\n\n**申告期限:**\n- 法人：事業年度終了日の翌日から2ヶ月以内\n- 個人：翌年3月31日\n\n**当事務所でのチェックポイント:**\n1. 課税区分の確認（課税・非課税・免税・不課税）\n2. 仕入税額控除の要件確認\n3. 簡易課税の場合は事業区分の確認\n4. 中間申告の要否確認';
  }

  return '申し訳ございません、その質問についてはまだ学習中です。社内マニュアルをご確認ください。\n\nお急ぎの場合は、以下をお試しください：\n- 社内Wiki（SharePoint）で関連キーワードを検索\n- チームリーダーに直接ご確認\n- 税務相談窓口（内線: 201）にお問い合わせ';
}

function renderAIDraft(panel) {
  const activeClients = MOCK_DATA.clients.filter(c => c.isActive);

  panel.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="form-group">
            <label>顧客</label>
            <select id="ai-draft-client">
              <option value="">-- 顧客を選択 --</option>
              ${activeClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>テンプレート</label>
            <select id="ai-draft-template">
              <option value="資料依頼メール">資料依頼メール</option>
              <option value="決算報告メール">決算報告メール</option>
              <option value="確定申告完了報告">確定申告完了報告</option>
              <option value="面談日程調整">面談日程調整</option>
              <option value="請求書送付案内">請求書送付案内</option>
              <option value="フリーテキスト">フリーテキスト</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>補足情報（任意）</label>
          <textarea id="ai-draft-notes" rows="3" placeholder="追加で含めたい内容があれば入力してください..." style="width:100%;padding:10px 12px;border:1px solid var(--gray-300);border-radius:6px;font-size:14px;resize:vertical;"></textarea>
        </div>
        <button class="btn btn-primary" id="ai-draft-generate">下書き生成</button>
      </div>
    </div>

    <div id="ai-draft-result" style="display:none;margin-top:16px;">
      <div class="card">
        <div class="card-header">
          <h3>生成された下書き</h3>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" id="ai-draft-copy">コピー</button>
            <button class="btn btn-primary btn-sm" id="ai-draft-cw">Chatworkに送信</button>
          </div>
        </div>
        <div class="card-body">
          <div class="ai-draft-output" id="ai-draft-output"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('ai-draft-generate').addEventListener('click', generateAIDraft);
  document.getElementById('ai-draft-copy').addEventListener('click', copyAIDraft);
  document.getElementById('ai-draft-cw').addEventListener('click', () => {
    alert('下書きをChatworkに送信しました');
  });
}

function generateAIDraft() {
  const clientId = document.getElementById('ai-draft-client').value;
  const template = document.getElementById('ai-draft-template').value;
  const notes = document.getElementById('ai-draft-notes').value.trim();

  if (!clientId) {
    alert('顧客を選択してください');
    return;
  }

  const client = getClientById(clientId);
  if (!client) return;

  const resultDiv = document.getElementById('ai-draft-result');
  const outputDiv = document.getElementById('ai-draft-output');
  const generateBtn = document.getElementById('ai-draft-generate');

  generateBtn.disabled = true;
  generateBtn.textContent = '生成中...';
  resultDiv.style.display = 'none';

  setTimeout(() => {
    const draft = generateMockDraft(client, template, notes);
    outputDiv.innerHTML = formatAIText(draft);
    resultDiv.style.display = '';
    generateBtn.disabled = false;
    generateBtn.textContent = '下書き生成';
  }, 1000);
}

function generateMockDraft(client, template, notes) {
  const mention = client.cwAccountId ? `[To:${client.cwAccountId}]${client.name}様\n\n` : '';
  const mainUser = getUserById(client.mainUserId);
  const senderName = mainUser ? mainUser.name : 'ひろ';
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  const drafts = {
    '資料依頼メール': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${client.clientType === '法人' ? `${client.fiscalMonth}月決算` : '確定申告'}に向けまして、以下の資料のご準備をお願いいたします。\n\n**ご準備いただきたい資料:**\n${client.clientType === '法人' ? '1. 総勘定元帳（会計ソフトからの出力）\n2. 請求書・領収書の綴り\n3. 預金通帳のコピー（全口座）\n4. 売掛金・買掛金の残高明細\n5. 固定資産の取得・売却に関する資料\n6. 借入金の返済予定表' : '1. 源泉徴収票\n2. 医療費の明細書・領収書\n3. 社会保険料控除証明書\n4. 生命保険料控除証明書\n5. ふるさと納税の寄附金受領証明書\n6. 不動産収入に関する資料（該当する場合）'}\n\n**ご送付期限:** ${dateStr}から2週間以内\n\n資料は郵送またはChatworkでのデータ送付のいずれでも構いません。\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    '決算報告メール': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${client.name}様の${client.fiscalMonth}月期決算につきまして、ご報告申し上げます。\n\n**決算概要:**\n- 事業年度: 令和7年${client.fiscalMonth}月期\n- 申告書の提出: 完了\n- 納税額: 後日改めてご案内いたします\n\n**今後のスケジュール:**\n1. 決算報告書の送付（1週間以内）\n2. 納税のご案内\n3. 来期の税務スケジュールの確認\n\n決算報告書は準備でき次第お送りいたします。\nご確認いただき、ご不明な点がございましたらお知らせください。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    '確定申告完了報告': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${client.name}様の令和7年分確定申告につきまして、電子申告が完了いたしましたのでご報告申し上げます。\n\n**申告内容:**\n- 申告種別: 所得税確定申告\n- 申告日: ${dateStr}\n- 申告方法: 電子申告（e-Tax）\n\n**今後の対応:**\n- 申告書の控えは後日郵送いたします\n- 納税がある場合は別途ご案内いたします\n- 還付がある場合は1〜2ヶ月程度で振込されます\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    '面談日程調整': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${client.clientType === '法人' ? `${client.fiscalMonth}月期の決算` : '確定申告'}に関しまして、面談のお時間をいただきたくご連絡いたしました。\n\n**面談の目的:**\n${client.clientType === '法人' ? '- 決算前の確認事項の整理\n- 来期の税務対策のご相談\n- 経営に関するご質問への対応' : '- 申告内容の最終確認\n- 控除漏れがないかの確認\n- 来年に向けたアドバイス'}\n\n**候補日時:**\n1. ○月○日（○） 10:00〜11:00\n2. ○月○日（○） 14:00〜15:00\n3. ○月○日（○） 16:00〜17:00\n\n面談方法はZoom、対面のいずれも対応可能です。\nご都合のよい日時をお知らせいただけますと幸いです。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    '請求書送付案内': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${today.getMonth() + 1}月分の請求書をお送りいたします。\n\n**請求内容:**\n- 月額顧問料: ${(client.monthlySales || 0).toLocaleString()}円（税抜）\n- 消費税: ${Math.floor((client.monthlySales || 0) * 0.1).toLocaleString()}円\n- 合計: ${Math.floor((client.monthlySales || 0) * 1.1).toLocaleString()}円（税込）\n\n**お支払期限:** 翌月末日\n\n請求書はPDFにて添付しております。\nお振込先は請求書に記載の口座宛にお願いいたします。\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n${notes ? `**補足:** ${notes}\n\n` : ''}よろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,

    'フリーテキスト': `${mention}いつもお世話になっております。\nリベ大税理士法人の${senderName}です。\n\n${notes || 'ここにメッセージ本文を入力してください。'}\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nよろしくお願いいたします。\n\nリベ大税理士法人\n${senderName}`,
  };

  return drafts[template] || drafts['フリーテキスト'];
}

function copyAIDraft() {
  const output = document.getElementById('ai-draft-output');
  if (!output) return;
  const text = output.innerText || output.textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('下書きをクリップボードにコピーしました');
  });
}

function renderAISuggest(panel) {
  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
      <button class="btn btn-primary" id="ai-suggest-run">分析実行</button>
      <span id="ai-suggest-status" style="font-size:13px;color:var(--gray-500);"></span>
    </div>
    <div id="ai-suggest-summary" style="display:none;margin-bottom:20px;"></div>
    <div id="ai-suggest-list"></div>
  `;

  document.getElementById('ai-suggest-run').addEventListener('click', runAISuggestions);

  if (aiSuggestions.length > 0) {
    renderAISuggestionResults();
  }
}

function runAISuggestions() {
  const btn = document.getElementById('ai-suggest-run');
  const status = document.getElementById('ai-suggest-status');
  btn.disabled = true;
  btn.textContent = '分析中...';
  status.textContent = 'AIがデータを分析しています...';

  setTimeout(() => {
    aiSuggestions = generateAISuggestions();
    btn.disabled = false;
    btn.textContent = '分析実行';
    status.textContent = '';
    renderAISuggestionResults();
  }, 1500);
}

function generateAISuggestions() {
  const suggestions = [];
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  MOCK_DATA.clients.filter(c => c.isActive).forEach(client => {
    const fiscalMonth = client.fiscalMonth;
    const currentMonth = today.getMonth() + 1;
    let monthsUntilFiscal = fiscalMonth - currentMonth;
    if (monthsUntilFiscal < 0) monthsUntilFiscal += 12;
    if (monthsUntilFiscal <= 3 && monthsUntilFiscal > 0 && client.clientType === '法人') {
      const existingTasks = MOCK_DATA.tasks.filter(t => t.clientId === client.id && t.title.includes('決算'));
      if (existingTasks.length === 0) {
        suggestions.push({
          id: 'sg-' + suggestions.length,
          title: `${client.name}の${fiscalMonth}月決算準備が必要です`,
          description: `決算月まで${monthsUntilFiscal}ヶ月です。法人決算テンプレートの適用をお勧めします。資料回収や記帳確認を早めに開始しましょう。`,
          priority: monthsUntilFiscal <= 1 ? '高' : '中',
          clientId: client.id,
          taskTitle: `${fiscalMonth}月決算 資料回収・準備`,
          type: 'fiscal',
        });
      }
    }
  });

  MOCK_DATA.clients.filter(c => c.isActive).forEach(client => {
    const tasks = MOCK_DATA.tasks.filter(t => t.clientId === client.id);
    if (tasks.length === 0) {
      suggestions.push({
        id: 'sg-' + suggestions.length,
        title: `${client.name}にタスクが未登録です`,
        description: `この顧客にはタスクが1件も登録されていません。月次業務や年次業務のタスクを作成することをお勧めします。`,
        priority: '低',
        clientId: client.id,
        taskTitle: '月次記帳チェック',
        type: 'no_task',
      });
    }
  });

  MOCK_DATA.tasks.filter(t => t.status !== '完了' && t.dueDate < todayStr).forEach(task => {
    const client = getClientById(task.clientId);
    const assignee = getUserById(task.assigneeUserId);
    if (client) {
      suggestions.push({
        id: 'sg-' + suggestions.length,
        title: `${client.name}「${task.title}」が期限超過です`,
        description: `期限${formatDate(task.dueDate)}を過ぎています。担当: ${assignee ? assignee.name : '未割当'}。フォローアップタスクの作成または期限の延長を検討してください。`,
        priority: '高',
        clientId: task.clientId,
        taskTitle: `${task.title}（フォローアップ）`,
        type: 'overdue',
      });
    }
  });

  MOCK_DATA.tasks.filter(t => t.status === '差戻し').forEach(task => {
    const client = getClientById(task.clientId);
    const assignee = getUserById(task.assigneeUserId);
    if (client) {
      suggestions.push({
        id: 'sg-' + suggestions.length,
        title: `${client.name}「${task.title}」が差戻し中です`,
        description: `差戻しされたタスクが未対応です。担当: ${assignee ? assignee.name : '未割当'}。早急に修正対応を行ってください。`,
        priority: '高',
        clientId: task.clientId,
        taskTitle: `${task.title}（修正対応）`,
        type: 'returned',
      });
    }
  });

  MOCK_DATA.progressSheets.filter(ps => ps.status === '利用中').forEach(sheet => {
    sheet.targets.forEach(target => {
      const unfinishedSteps = Object.values(target.steps).filter(s => s === '未着手').length;
      const totalSteps = Object.keys(target.steps).length;
      if (unfinishedSteps > totalSteps / 2) {
        const client = getClientById(target.clientId);
        if (client) {
          const alreadySuggested = suggestions.some(s => s.clientId === target.clientId && s.type === 'progress');
          if (!alreadySuggested) {
            suggestions.push({
              id: 'sg-' + suggestions.length,
              title: `${client.name}の「${sheet.name}」進捗が遅れています`,
              description: `${totalSteps}工程中${unfinishedSteps}工程が未着手です。進捗管理表の更新と作業の着手を検討してください。`,
              priority: '中',
              clientId: target.clientId,
              taskTitle: `${sheet.name} 進捗対応`,
              type: 'progress',
            });
          }
        }
      }
    });
  });

  return suggestions;
}

function renderAISuggestionResults() {
  const summaryDiv = document.getElementById('ai-suggest-summary');
  const listDiv = document.getElementById('ai-suggest-list');

  if (!summaryDiv || !listDiv) return;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const overdueTasks = MOCK_DATA.tasks.filter(t => t.status !== '完了' && t.dueDate < todayStr).length;
  const currentMonth = today.getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextMonthClients = MOCK_DATA.clients.filter(c => c.isActive && c.clientType === '法人' && c.fiscalMonth === nextMonth).length;

  summaryDiv.style.display = '';
  summaryDiv.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent-blue">
        <div class="stat-label">提案数</div>
        <div class="stat-value">${aiSuggestions.length}<span style="font-size:14px;font-weight:400;color:var(--gray-500);">件</span></div>
      </div>
      <div class="stat-card accent-red">
        <div class="stat-label">期限超過タスク</div>
        <div class="stat-value">${overdueTasks}<span style="font-size:14px;font-weight:400;color:var(--gray-500);">件</span></div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">来月決算の顧客</div>
        <div class="stat-value">${nextMonthClients}<span style="font-size:14px;font-weight:400;color:var(--gray-500);">社</span></div>
      </div>
    </div>
  `;

  if (aiSuggestions.length === 0) {
    listDiv.innerHTML = renderEmptyState('現在、AIからの提案はありません。すべて順調です。', '&#x2705;');
    return;
  }

  listDiv.innerHTML = aiSuggestions.map(sg => {
    const priorityColors = { '高': 'var(--danger)', '中': 'var(--warning)', '低': 'var(--gray-400)' };
    const priorityBg = { '高': 'var(--danger-light)', '中': 'var(--warning-light)', '低': 'var(--gray-100)' };
    return `
      <div class="ai-suggestion-card" id="ai-sg-${sg.id}">
        <div class="ai-sg-icon">&#x1f4a1;</div>
        <div class="ai-sg-content">
          <div class="ai-sg-header">
            <div class="ai-sg-title">${escapeHtml(sg.title)}</div>
            <span class="ai-sg-priority" style="background:${priorityBg[sg.priority]};color:${priorityColors[sg.priority]};">${sg.priority}</span>
          </div>
          <div class="ai-sg-desc">${escapeHtml(sg.description)}</div>
          <div class="ai-sg-actions">
            <button class="btn btn-primary btn-sm" onclick="createSuggestedTask('${sg.id}')">タスク作成</button>
            <button class="btn btn-secondary btn-sm" onclick="dismissSuggestion('${sg.id}')">無視する</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function createSuggestedTask(sgId) {
  const sg = aiSuggestions.find(s => s.id === sgId);
  if (!sg) return;

  const client = getClientById(sg.clientId);
  if (!client) return;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateStr = dueDate.toISOString().slice(0, 10);

  const newTask = {
    id: generateId('tk-', MOCK_DATA.tasks),
    clientId: sg.clientId,
    assigneeUserId: client.mainUserId || 'u-003',
    title: sg.taskTitle,
    status: '未着手',
    dueDate: dueDateStr,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  MOCK_DATA.tasks.push(newTask);
  aiSuggestions = aiSuggestions.filter(s => s.id !== sgId);

  const card = document.getElementById('ai-sg-' + sgId);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateX(20px)';
    setTimeout(() => {
      card.remove();
      renderAISuggestionResults();
    }, 300);
  }

  alert(`タスク「${sg.taskTitle}」を作成しました（期限: ${formatDate(dueDateStr)}）`);
}

function dismissSuggestion(sgId) {
  aiSuggestions = aiSuggestions.filter(s => s.id !== sgId);
  const card = document.getElementById('ai-sg-' + sgId);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateX(20px)';
    setTimeout(() => {
      card.remove();
      renderAISuggestionResults();
    }, 300);
  }
}

registerPage('ai', renderAI);
