// ===========================
// 自動化設定
// ===========================

function getAutoTypeBadge(type) {
  const map = {
    reminder: { label: 'リマインド', cls: 'auto-type-reminder' },
    auto_create: { label: '自動生成', cls: 'auto-type-create' },
    cleanup: { label: 'クリーンアップ', cls: 'auto-type-cleanup' },
    escalation: { label: 'エスカレーション', cls: 'auto-type-escalation' },
  };
  const m = map[type] || { label: type, cls: '' };
  return `<span class="auto-type-badge ${m.cls}">${m.label}</span>`;
}

function toggleAutomationRule(ruleId) {
  const rule = MOCK_DATA.automationRules.find(r => r.id === ruleId);
  if (rule) {
    rule.enabled = !rule.enabled;
    const content = document.getElementById('page-content');
    if (content) renderAutomation(content);
  }
}

function runAutomationRule(ruleId) {
  const rule = MOCK_DATA.automationRules.find(r => r.id === ruleId);
  if (!rule) return;
  const targetCount = Math.floor(Math.random() * 8) + 1;
  rule.lastRun = new Date().toISOString();
  // Add to log
  const newLog = {
    id: 'al-' + String(MOCK_DATA.automationLog.length + 1).padStart(3, '0'),
    timestamp: rule.lastRun,
    ruleId: rule.id,
    ruleName: rule.name,
    result: '成功',
    targetCount: targetCount,
  };
  MOCK_DATA.automationLog.unshift(newLog);
  const content = document.getElementById('page-content');
  if (content) renderAutomation(content);
  setTimeout(() => {
    intFlash('auto-flash-' + ruleId, `ルール「${rule.name}」を実行しました。対象: ${targetCount}件`, 'success');
  }, 50);
}

function openAutomationModal() {
  setFormValues({ 'new-auto-type': 'reminder' });
  resetForm(['new-auto-name', 'new-auto-trigger', 'new-auto-action', 'new-auto-target']);
  showModal('automation-create-modal');
}

function closeAutomationModal() {
  hideModal('automation-create-modal');
}

function submitNewAutomationRule() {
  const name = getValTrim('new-auto-name');
  const type = getVal('new-auto-type');
  const trigger = getValTrim('new-auto-trigger');
  const action = getValTrim('new-auto-action');
  const target = getValTrim('new-auto-target');
  if (!name) { alert('ルール名を入力してください'); return; }
  if (!trigger) { alert('トリガーを入力してください'); return; }
  if (!action) { alert('アクションを入力してください'); return; }
  const newRule = {
    id: 'ar-' + String(MOCK_DATA.automationRules.length + 1).padStart(3, '0'),
    name, type, enabled: true, trigger, action, target, lastRun: null,
  };
  MOCK_DATA.automationRules.push(newRule);
  closeAutomationModal();
  const content = document.getElementById('page-content');
  if (content) renderAutomation(content);
}

function renderAutomation(el) {
  const rules = MOCK_DATA.automationRules;
  const logs = MOCK_DATA.automationLog;
  const enabledCount = rules.filter(r => r.enabled).length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyRuns = logs.filter(l => l.timestamp && l.timestamp.slice(0, 7) === thisMonth).length;
  const lastRun = logs.length > 0 ? formatDateTime(logs[0].timestamp) : '-';

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card accent-blue">
        <div class="stat-label">有効なルール</div>
        <div class="stat-value">${enabledCount}</div>
        <div class="stat-sub">${rules.length}件中</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-label">今月の実行回数</div>
        <div class="stat-value">${monthlyRuns}</div>
        <div class="stat-sub">回</div>
      </div>
      <div class="stat-card accent-yellow">
        <div class="stat-label">最終実行</div>
        <div class="stat-value" style="font-size:16px;">${lastRun}</div>
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <h3 style="font-size:16px;font-weight:600;">ルール一覧</h3>
      <button class="btn btn-primary btn-sm" onclick="openAutomationModal()">+ ルール追加</button>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>有効</th>
              <th>ルール名</th>
              <th>種別</th>
              <th>トリガー</th>
              <th>アクション</th>
              <th>対象</th>
              <th>最終実行</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${rules.map(r => `
              <tr>
                <td>
                  <label class="toggle">
                    <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="toggleAutomationRule('${r.id}')">
                    <span class="toggle-slider"></span>
                  </label>
                </td>
                <td style="font-weight:500;">${r.name}</td>
                <td>${getAutoTypeBadge(r.type)}</td>
                <td style="font-size:12px;color:var(--gray-600);">${r.trigger}</td>
                <td style="font-size:12px;color:var(--gray-600);">${r.action}</td>
                <td style="font-size:12px;color:var(--gray-600);">${r.target}</td>
                <td style="font-size:12px;color:var(--gray-400);">${r.lastRun ? formatDateTime(r.lastRun) : '-'}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="runAutomationRule('${r.id}')" ${!r.enabled ? 'disabled style="opacity:0.5"' : ''}>今すぐ実行</button>
                  <div id="auto-flash-${r.id}"></div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <h3 style="font-size:16px;font-weight:600;margin-bottom:12px;">実行ログ（直近10件）</h3>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>実行日時</th>
              <th>ルール名</th>
              <th>結果</th>
              <th>対象件数</th>
            </tr>
          </thead>
          <tbody>
            ${logs.slice(0, 10).map(l => `
              <tr>
                <td style="font-size:12px;">${formatDateTime(l.timestamp)}</td>
                <td style="font-weight:500;">${l.ruleName}</td>
                <td><span class="status-badge status-done">${l.result}</span></td>
                <td style="font-size:13px;">${l.targetCount}件</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

registerPage('automation', renderAutomation);
