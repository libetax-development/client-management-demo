// ===========================
// 進捗管理表 設定変更モーダル
// ===========================

function openProgressSettingsModal(sheetId) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;

  document.getElementById('edit-pg-id').value = s.id;
  document.getElementById('edit-pg-name').value = s.name;
  document.getElementById('edit-pg-status').value = s.status;
  document.getElementById('edit-pg-category').value = s.category || '';

  document.getElementById('edit-pg-manager').innerHTML = MOCK_DATA.users
    .filter(u => u.isActive && (u.role === 'admin' || u.role === 'team_leader'))
    .map(u => `<option value="${u.id}" ${u.id === s.managerId ? 'selected' : ''}>${escapeHtml(u.name)}</option>`)
    .join('');

  // タブ切替ロジック
  const tabsEl = document.getElementById('pg-settings-tabs');
  function activatePgTab(tab) {
    tabsEl.querySelectorAll('.view-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.getElementById('pg-settings-tab-basic').style.display = tab === 'basic' ? '' : 'none';
    document.getElementById('pg-settings-tab-columns').style.display = tab === 'columns' ? '' : 'none';
    document.getElementById('pg-settings-tab-targets').style.display = tab === 'targets' ? '' : 'none';
    if (tab === 'columns') { pgInitSettingsColumnDualList(s.id); }
    if (tab === 'targets') { pgRenderTargetsList(s.id); pgRenderTargetsTab(s.id); }
  }
  // 既存リスナーをクリーン化するためにcloneで置き換え
  const newTabsEl = tabsEl.cloneNode(true);
  tabsEl.parentNode.replaceChild(newTabsEl, tabsEl);
  newTabsEl.addEventListener('click', e => {
    if (e.target.dataset.tab) activatePgTab(e.target.dataset.tab);
  });
  // 基本設定タブをアクティブに戻す
  activatePgTab('basic');

  showModal('progress-settings-modal');
}

// 工程リスト描画
function pgRenderColumnsList(sheetId) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const container = document.getElementById('pg-settings-columns-list');
  if (!s.columns || s.columns.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--gray-400);padding:8px 0;">工程がありません</p>';
    return;
  }
  container.innerHTML = s.columns.map((col, idx) => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray-100);">
      <span style="font-size:12px;color:var(--gray-400);min-width:20px;text-align:right;">${idx + 1}</span>
      <input type="text" value="${escapeHtml(col)}" data-col-idx="${idx}"
        style="flex:1;padding:6px 10px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;"
        onchange="pgUpdateColumnName('${sheetId}',${idx},this.value)">
      <button class="btn btn-secondary btn-sm" onclick="pgMoveColumn('${sheetId}',${idx},-1)" ${idx === 0 ? 'disabled' : ''} title="上へ" style="padding:4px 8px;">&#8593;</button>
      <button class="btn btn-secondary btn-sm" onclick="pgMoveColumn('${sheetId}',${idx},1)" ${idx === s.columns.length - 1 ? 'disabled' : ''} title="下へ" style="padding:4px 8px;">&#8595;</button>
      <button class="btn btn-secondary btn-sm" onclick="pgRemoveSheetColumn('${sheetId}',${idx})" title="削除" style="padding:4px 8px;color:var(--danger);">&times;</button>
    </div>
  `).join('');
}

// 工程名の即時更新
window.pgUpdateColumnName = function(sheetId, idx, newName) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const trimmed = newName.trim();
  if (!trimmed) return;
  const oldName = s.columns[idx];
  if (oldName === trimmed) return;
  // columns更新
  s.columns[idx] = trimmed;
  // targets.stepsのキー名を連動更新
  s.targets.forEach(t => {
    if (t.steps && Object.prototype.hasOwnProperty.call(t.steps, oldName)) {
      t.steps[trimmed] = t.steps[oldName];
      delete t.steps[oldName];
    }
    if (t.completedDates && Object.prototype.hasOwnProperty.call(t.completedDates, oldName)) {
      t.completedDates[trimmed] = t.completedDates[oldName];
      delete t.completedDates[oldName];
    }
  });
};

// 工程の並べ替え
window.pgMoveColumn = function(sheetId, idx, dir) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= s.columns.length) return;
  // columns配列の入れ替え（stepsはオブジェクトなのでキー順不問）
  const tmp = s.columns[idx];
  s.columns[idx] = s.columns[newIdx];
  s.columns[newIdx] = tmp;
  pgRenderColumnsList(sheetId);
};

// 工程の削除（設定変更モーダル用）
window.pgRemoveSheetColumn = function(sheetId, idx) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const colName = s.columns[idx];
  // 完了データがある場合のみ確認
  const hasData = s.targets.some(t => t.steps && t.steps[colName] && t.steps[colName] !== '未着手');
  if (hasData) {
    if (!confirm(`工程「${colName}」には進捗データがあります。削除してもよろしいですか？`)) return;
  }
  s.columns.splice(idx, 1);
  // targets.stepsからも削除
  s.targets.forEach(t => {
    if (t.steps) delete t.steps[colName];
    if (t.completedDates) delete t.completedDates[colName];
  });
  pgRenderColumnsList(sheetId);
  pgSettingsRenderCandidates();
  pgSettingsRenderDisplay(s.columns);
};

// 工程の追加（設定変更モーダル 直接入力）
window.pgAddColumn = function() {
  const id = document.getElementById('edit-pg-id').value;
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const input = document.getElementById('pg-new-col-name');
  const name = input.value.trim();
  if (!name) { alert('工程名を入力してください'); return; }
  if (s.columns.includes(name)) { alert('同名の工程がすでに存在します'); return; }
  s.columns.push(name);
  // 既存targetsに新キーを「未着手」で追加
  s.targets.forEach(t => {
    if (t.steps) t.steps[name] = '未着手';
  });
  input.value = '';
  // 新UIのデュアルリストを更新
  pgSettingsRenderCandidates();
  pgSettingsRenderDisplay(s.columns);
};

// 対象顧客リスト描画
function pgRenderTargetsList(sheetId) {
  const s = MOCK_DATA.progressSheets.find(x => x.id === sheetId);
  if (!s) return;
  const container = document.getElementById('pg-targets-list');

  if (!s.targets || s.targets.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--gray-400);padding:8px 0;">対象顧客がいません</p>';
  } else {
    container.innerHTML = `
      <div style="max-height:260px;overflow-y:auto;border:1px solid var(--gray-200);border-radius:6px;">
        ${s.targets.map(t => {
          const c = getClientById(t.clientId);
          if (!c) return '';
          return `<label style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--gray-100);cursor:pointer;font-size:13px;">
            <input type="checkbox" class="pg-target-chk" value="${t.clientId}">
            <span style="color:var(--gray-500);min-width:60px;font-size:12px;">${c.clientCode}</span>
            <span>${escapeHtml(c.name)}</span>
          </label>`;
        }).join('')}
      </div>
    `;
  }

  // 未追加顧客のドロップダウン構築
  const existingIds = new Set(s.targets.map(t => t.clientId));
  const available = getActiveClients().filter(c => !existingIds.has(c.id));
  const sel = document.getElementById('pg-add-target-client');
  if (available.length === 0) {
    sel.innerHTML = '<option value="">-- 追加できる顧客がありません --</option>';
  } else {
    sel.innerHTML = '<option value="">-- 顧客を選択 --</option>' +
      available.map(c => `<option value="${c.id}">[${c.clientCode}] ${escapeHtml(c.name)}</option>`).join('');
  }
}

// 顧客の追加
window.pgAddTarget = function() {
  const id = document.getElementById('edit-pg-id').value;
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const clientId = document.getElementById('pg-add-target-client').value;
  if (!clientId) { alert('追加する顧客を選択してください'); return; }
  if (s.targets.some(t => t.clientId === clientId)) return;
  // 全工程を「未着手」で初期化
  const steps = {};
  const completedDates = {};
  s.columns.forEach(col => { steps[col] = '未着手'; });
  s.targets.push({ clientId, steps, completedDates, note: '' });
  pgRenderTargetsList(id);
};

// 選択した顧客を削除
window.pgRemoveSelectedTargets = function() {
  const id = document.getElementById('edit-pg-id').value;
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const checked = Array.from(document.querySelectorAll('.pg-target-chk:checked')).map(el => el.value);
  if (checked.length === 0) { alert('削除する顧客を選択してください'); return; }
  if (!confirm(`${checked.length}件の顧客を対象から削除しますか？`)) return;
  s.targets = s.targets.filter(t => !checked.includes(t.clientId));
  pgRenderTargetsList(id);
};

function submitEditProgress() {
  const id = getVal('edit-pg-id');
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const name = getValTrim('edit-pg-name');
  if (!name) { alert('管理表名を入力してください'); return; }
  s.name = name;
  s.status = getVal('edit-pg-status');
  s.managerId = getVal('edit-pg-manager');

  // 対象顧客モードを保存して反映
  var modeEl = document.querySelector('input[name="pg-target-mode"]:checked');
  var mode = modeEl ? modeEl.value : 'manual';
  s.targetMode = mode;
  if (mode === 'all') {
    // アクティブ全顧客でtargetsを再構築
    var activeIds = getActiveClients().map(function(c) { return c.id; });
    activeIds.forEach(function(clientId) {
      if (!s.targets.some(function(t) { return t.clientId === clientId; })) {
        var steps = {}; var completedDates = {};
        s.columns.forEach(function(col) { steps[col] = '未着手'; });
        s.targets.push({ clientId: clientId, steps: steps, completedDates: completedDates, note: '' });
      }
    });
  } else if (mode === 'filter') {
    // フィルタ条件にマッチする顧客でtargetsを再構築
    // 対象顧客タブ未開封時はpgFilterConditionsが空のため、既存条件を保持
    var effectiveConditions = pgFilterConditions.length > 0 ? pgFilterConditions : (s.filterConditions || []);
    s.filterConditions = effectiveConditions.slice();
    var matched = pgApplyFilterConditions(effectiveConditions);
    matched.forEach(function(c) {
      if (!s.targets.some(function(t) { return t.clientId === c.id; })) {
        var steps = {}; var completedDates = {};
        s.columns.forEach(function(col) { steps[col] = '未着手'; });
        s.targets.push({ clientId: c.id, steps: steps, completedDates: completedDates, note: '' });
      }
    });
  }

  hideModal('progress-settings-modal');
  if (currentPage === 'progress') navigateTo('progress');
  else if (currentPage === 'progress-detail') navigateTo('progress-detail', { id });
}

function saveAsProgressTemplate(sheetId) {
  const id = sheetId || getVal('edit-pg-id');
  const s = MOCK_DATA.progressSheets.find(x => x.id === id);
  if (!s) return;
  const tplName = prompt('テンプレート名を入力してください:', s.name + '（テンプレート）');
  if (!tplName || !tplName.trim()) return;
  MOCK_DATA.progressTemplates.push({
    id: generateId('pt-', MOCK_DATA.progressTemplates),
    name: tplName.trim(),
    category: s.category,
    columns: s.columns.slice(),
    isCustom: true,
  });
  alert('マイテンプレート「' + tplName.trim() + '」として保存しました');
}

// ============================================================
// 候補⇔表示リスト（設定変更モーダル 工程設定タブ）
// ============================================================

var pgSettingsSelectedCandidateIdx = null;
var pgSettingsSelectedDisplayIdx = null;

// 工程設定タブを開いたときに初期化
function pgInitSettingsColumnDualList(sheetId) {
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s) return;
  pgSettingsSelectedCandidateIdx = null;
  pgSettingsSelectedDisplayIdx = null;
  pgSettingsRenderCandidates();
  pgSettingsRenderDisplay(s.columns);
}

window.pgSettingsRenderCandidates = function() {
  var category = document.getElementById('pg-settings-col-category').value;
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = sheetId ? MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; }) : null;
  var displayCols = s ? s.columns : [];

  var candidates = pgGetCandidatesByCategory(category);
  // 既に表示リストにある項目を除外
  candidates = candidates.filter(function(c) { return !displayCols.includes(c); });

  var container = document.getElementById('pg-settings-col-candidates');
  if (candidates.length === 0) {
    container.innerHTML = '<div style="padding:8px;font-size:12px;color:var(--gray-400);">候補がありません</div>';
    return;
  }
  container.innerHTML = candidates.map(function(c, idx) {
    return '<div class="pg-dual-list-item" data-idx="' + idx + '" data-name="' + escapeHtml(c) + '" onclick="pgSettingsSelectCandidate(' + idx + ', this)" style="padding:6px 10px;font-size:13px;cursor:pointer;border-radius:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(c) + '</div>';
  }).join('');
};

window.pgSettingsSelectCandidate = function(idx, el) {
  pgSettingsSelectedCandidateIdx = idx;
  pgSettingsSelectedDisplayIdx = null;
  document.querySelectorAll('#pg-settings-col-candidates .pg-dual-list-item').forEach(function(item) {
    item.style.background = '';
    item.style.color = '';
  });
  document.querySelectorAll('#pg-settings-col-display .pg-dual-list-item').forEach(function(item) {
    item.style.background = '';
    item.style.color = '';
  });
  el.style.background = 'var(--primary)';
  el.style.color = '#fff';
};

window.pgSettingsSelectDisplay = function(idx, el) {
  pgSettingsSelectedDisplayIdx = idx;
  pgSettingsSelectedCandidateIdx = null;
  document.querySelectorAll('#pg-settings-col-candidates .pg-dual-list-item').forEach(function(item) {
    item.style.background = '';
    item.style.color = '';
  });
  document.querySelectorAll('#pg-settings-col-display .pg-dual-list-item').forEach(function(item) {
    item.style.background = '';
    item.style.color = '';
  });
  el.style.background = 'var(--primary)';
  el.style.color = '#fff';
};

function pgSettingsRenderDisplay(columns) {
  var container = document.getElementById('pg-settings-col-display');
  if (!columns || columns.length === 0) {
    container.innerHTML = '<div style="padding:8px;font-size:12px;color:var(--gray-400);">工程がありません</div>';
    return;
  }
  container.innerHTML = columns.map(function(c, idx) {
    return '<div class="pg-dual-list-item" data-idx="' + idx + '" data-name="' + escapeHtml(c) + '" onclick="pgSettingsSelectDisplay(' + idx + ', this)" style="padding:6px 10px;font-size:13px;cursor:pointer;border-radius:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(c) + '</div>';
  }).join('');
}

window.pgSettingsColAdd = function() {
  var selectedEl = document.querySelector('#pg-settings-col-candidates .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) {
    alert('候補から追加する工程を選択してください');
    return;
  }
  var name = selectedEl.dataset.name;
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s) return;
  if (s.columns.includes(name)) return;
  s.columns.push(name);
  s.targets.forEach(function(t) {
    if (t.steps) t.steps[name] = '未着手';
  });
  pgSettingsSelectedCandidateIdx = null;
  pgSettingsRenderCandidates();
  pgSettingsRenderDisplay(s.columns);
};

window.pgSettingsColRemove = function() {
  var selectedEl = document.querySelector('#pg-settings-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) {
    alert('削除する工程を選択してください');
    return;
  }
  var name = selectedEl.dataset.name;
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s) return;
  var idx = s.columns.indexOf(name);
  if (idx < 0) return;
  var hasData = s.targets.some(function(t) { return t.steps && t.steps[name] && t.steps[name] !== '未着手'; });
  if (hasData && !confirm('工程「' + name + '」には進捗データがあります。削除してもよろしいですか？')) return;
  s.columns.splice(idx, 1);
  s.targets.forEach(function(t) {
    if (t.steps) delete t.steps[name];
    if (t.completedDates) delete t.completedDates[name];
  });
  pgSettingsSelectedDisplayIdx = null;
  pgSettingsRenderCandidates();
  pgSettingsRenderDisplay(s.columns);
};

window.pgSettingsColMoveUp = function() {
  var selectedEl = document.querySelector('#pg-settings-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) return;
  var idx = parseInt(selectedEl.dataset.idx);
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s || idx <= 0) return;
  var tmp = s.columns[idx]; s.columns[idx] = s.columns[idx - 1]; s.columns[idx - 1] = tmp;
  pgSettingsRenderDisplay(s.columns);
  // 移動後に選択状態を維持
  var items = document.querySelectorAll('#pg-settings-col-display .pg-dual-list-item');
  if (items[idx - 1]) { items[idx - 1].style.background = 'var(--primary)'; items[idx - 1].style.color = '#fff'; }
};

window.pgSettingsColMoveDown = function() {
  var selectedEl = document.querySelector('#pg-settings-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) return;
  var idx = parseInt(selectedEl.dataset.idx);
  var sheetId = document.getElementById('edit-pg-id').value;
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s || idx >= s.columns.length - 1) return;
  var tmp = s.columns[idx]; s.columns[idx] = s.columns[idx + 1]; s.columns[idx + 1] = tmp;
  pgSettingsRenderDisplay(s.columns);
  var items = document.querySelectorAll('#pg-settings-col-display .pg-dual-list-item');
  if (items[idx + 1]) { items[idx + 1].style.background = 'var(--primary)'; items[idx + 1].style.color = '#fff'; }
};
