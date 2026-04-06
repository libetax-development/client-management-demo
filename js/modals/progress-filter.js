// ===========================
// 進捗管理 フィルタ条件（設定変更モーダル用 + 共通ロジック）
// ===========================

// 設定変更モーダル用 フィルタ条件の状態
var pgFilterConditions = [];
var pgFilterApplied = false; // 確定済みかどうか

// 「対象顧客」タブを開くときに呼ばれる（sheetIdを引数で受け取れるよう拡張）
function pgRenderTargetsTab(sheetId) {
  var s = MOCK_DATA.progressSheets.find(function(x) { return x.id === sheetId; });
  if (!s) return;

  // モードをリセット（シートにtargetModeが保存されている場合は復元）
  var mode = s.targetMode || 'manual';
  var radios = document.querySelectorAll('input[name="pg-target-mode"]');
  radios.forEach(function(r) { r.checked = r.value === mode; });

  pgFilterConditions = (s.filterConditions || []).slice();
  pgFilterApplied = (s.filterConditions && s.filterConditions.length > 0);

  // AND/ORロジックを復元
  if (s.filterLogic) {
    var logicRadios = document.querySelectorAll('input[name="pg-filter-logic"]');
    logicRadios.forEach(function(r) { r.checked = r.value === s.filterLogic; });
  }

  pgTargetModeChanged(mode, sheetId);
}

// モード変更時
window.pgTargetModeChanged = function(mode, sheetId) {
  var manualUI = document.getElementById('pg-manual-targets-ui');
  var filterPreview = document.getElementById('pg-filter-preview');
  var allPreview = document.getElementById('pg-all-preview');
  var filterBtn = document.getElementById('pg-filter-condition-btn');
  var conditionText = document.getElementById('pg-filter-condition-text');

  manualUI.style.display = 'none';
  filterPreview.style.display = 'none';
  if (conditionText) conditionText.style.display = 'none';
  allPreview.style.display = 'none';
  if (filterBtn) filterBtn.style.display = 'none';

  if (mode === 'all') {
    allPreview.style.display = '';
    var activeClients = MOCK_DATA.clients.filter(function(c) { return c.isActive; });
    document.getElementById('pg-all-count').textContent = 'アクティブな全顧客: ' + activeClients.length + '件';
    document.getElementById('pg-all-list').innerHTML = activeClients.map(function(c) {
      var main = getAssigneeUser(c.id, 'main');
      return '<div style="padding:4px 6px;font-size:13px;display:flex;align-items:center;gap:8px;">' +
        '<span style="color:var(--gray-500);font-size:11px;min-width:60px;">' + escapeHtml(c.clientCode) + '</span>' +
        '<span>' + escapeHtml(c.name) + '</span>' +
        '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
        '</div>';
    }).join('');

  } else if (mode === 'filter') {
    if (filterBtn) filterBtn.style.display = '';
    filterPreview.style.display = '';
    if (pgFilterApplied && pgFilterConditions.length > 0) {
      pgRenderFilterPreview();
      pgShowConditionText(pgFilterConditions, 'pg-filter-logic', 'pg-filter-condition-text');
    } else {
      document.getElementById('pg-filter-match-count').textContent = '条件が設定されていません。「条件設定」ボタンで条件を設定してください。';
      document.getElementById('pg-filter-match-list').innerHTML = '';
      pgShowConditionText([], null, 'pg-filter-condition-text');
    }

  } else {
    // manual
    manualUI.style.display = '';
    var id = document.getElementById('edit-pg-id').value;
    if (id) pgRenderTargetsList(id);
  }
};

function pgRenderFilterPreview() {
  var matched = pgApplyFilterConditions(pgFilterConditions);
  document.getElementById('pg-filter-match-count').textContent = '条件にマッチする顧客: ' + matched.length + '件';
  document.getElementById('pg-filter-match-list').innerHTML = matched.length === 0
    ? '<div style="font-size:12px;color:var(--gray-400);padding:4px;">該当する顧客がありません</div>'
    : matched.map(function(c) {
        var main = getAssigneeUser(c.id, 'main');
        return '<div style="padding:4px 6px;font-size:13px;display:flex;align-items:center;gap:8px;">' +
          '<span style="color:var(--gray-500);font-size:11px;min-width:60px;">' + escapeHtml(c.clientCode) + '</span>' +
          '<span>' + escapeHtml(c.name) + '</span>' +
          '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
          '</div>';
      }).join('');
}

// フィルタ条件を MOCK_DATA.clients に適用
function pgApplyFilterConditions(conditions) {
  if (!conditions || conditions.length === 0) return [];
  var logicEl = document.querySelector('input[name="pg-filter-logic"]:checked');
  var logic = logicEl ? logicEl.value : 'AND';
  return MOCK_DATA.clients.filter(function(c) {
    if (logic === 'AND') {
      return conditions.every(function(cond) { return pgMatchCondition(c, cond); });
    } else {
      return conditions.some(function(cond) { return pgMatchCondition(c, cond); });
    }
  });
}

function pgApplyCreateFilterConditions(conditions) {
  if (!conditions || conditions.length === 0) return [];
  var logicEl = document.querySelector('input[name="pg-create-filter-logic"]:checked');
  var logic = logicEl ? logicEl.value : 'AND';
  return MOCK_DATA.clients.filter(function(c) {
    if (logic === 'AND') {
      return conditions.every(function(cond) { return pgMatchCondition(c, cond); });
    } else {
      return conditions.some(function(cond) { return pgMatchCondition(c, cond); });
    }
  });
}

// 条件設定ダイアログを開く（設定変更モーダル用）
window.openPgFilterDialog = function() {
  pgRenderFilterConditionsUI();
  showModal('pg-filter-dialog');
};

window.closePgFilterDialog = function() {
  hideModal('pg-filter-dialog');
};

function pgRenderFilterConditionsUI() {
  var container = document.getElementById('pg-filter-conditions');
  if (pgFilterConditions.length === 0) {
    pgFilterConditions.push({ field: 'clientType', op: '=', value: '法人' });
  }
  pgRedrawFilterConditions(container, pgFilterConditions, 'pg-filter-logic');
}

window.pgFilterRowChange = function(idx, prop, val) {
  if (!pgFilterConditions[idx]) return;
  pgFilterConditions[idx][prop] = val;
  // フィールドが変わったら値を初期値にリセット
  if (prop === 'field') {
    var field = PG_FILTER_FIELDS.find(function(f) { return f.key === val; });
    if (field) {
      var opts = field.options === 'users'
        ? MOCK_DATA.users.filter(function(u) { return u.isActive; })
        : null;
      pgFilterConditions[idx].value = opts
        ? opts[0].id
        : (field.options[0] || '');
    }
    pgRedrawFilterConditions(document.getElementById('pg-filter-conditions'), pgFilterConditions, 'pg-filter-logic');
  }
};

window.pgAddFilterCondition = function() {
  pgFilterConditions.push({ field: 'clientType', op: '=', value: '法人' });
  pgRedrawFilterConditions(document.getElementById('pg-filter-conditions'), pgFilterConditions, 'pg-filter-logic');
};

window.pgRemoveFilterCondition = function(idx) {
  pgFilterConditions.splice(idx, 1);
  pgRedrawFilterConditions(document.getElementById('pg-filter-conditions'), pgFilterConditions, 'pg-filter-logic');
};

window.pgCheckFilterCount = function() {
  var matched = pgApplyFilterConditions(pgFilterConditions);
  document.getElementById('pg-filter-count-result').textContent = matched.length + '件の顧客が対象です';
};

window.applyPgFilter = function() {
  pgFilterApplied = true;
  closePgFilterDialog();
  // 設定変更モーダルのフィルタプレビューを更新
  pgRenderFilterPreview();
  pgShowConditionText(pgFilterConditions, 'pg-filter-logic', 'pg-filter-condition-text');
  // シートに条件を保存（次回モーダル開時に復元するため）
  var id = document.getElementById('edit-pg-id').value;
  var s = id ? MOCK_DATA.progressSheets.find(function(x) { return x.id === id; }) : null;
  if (s) {
    s.filterConditions = pgFilterConditions.slice();
    s.targetMode = 'filter';
    var logicEl = document.querySelector('input[name="pg-filter-logic"]:checked');
    s.filterLogic = logicEl ? logicEl.value : 'AND';
  }
};
