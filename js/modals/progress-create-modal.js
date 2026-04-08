// ===========================
// 進捗管理表 作成モーダル（ステップ式）
// ===========================

let pgCurrentStep = 1;
let pgSelectedColumns = [];
let pgSelectedTemplateId = null;

function openProgressCreateModal() {
  pgCurrentStep = 1;
  pgSelectedColumns = [];
  pgSelectedTemplateId = null;

  // Step 2 の初期化
  document.getElementById('new-pg-manager').innerHTML = buildUserOptions('leaders');
  resetForm(['new-pg-name', 'pg-new-column-input', 'pg-template-save-name']);
  document.getElementById('new-pg-category').value = '法人決算';

  // 報告書リンク列チェックボックスの初期値
  document.getElementById('pg-show-report-link').checked = true;

  // 決算月フィルタ
  const fiscalSel = document.getElementById('pg-filter-fiscal');
  fiscalSel.innerHTML = '<option value="">全決算月</option>' +
    Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${i + 1}月</option>`).join('');

  // 主担当フィルタ
  document.getElementById('pg-filter-main').innerHTML = '<option value="">全担当者</option>' + buildUserOptions();

  // テンプレート保存チェック
  document.getElementById('pg-save-template').checked = false;
  document.getElementById('pg-template-name-area').style.display = 'none';

  // テンプレート一覧を描画
  renderProgressTemplateList();

  // ステップ表示を初期化
  pgShowStep(1);
  showModal('progress-create-modal');
}

function renderProgressTemplateList() {
  const templates = MOCK_DATA.progressTemplates || [];
  const presets = templates.filter(t => !t.isCustom);
  const customs = templates.filter(t => t.isCustom);

  let html = '';

  // 「空から作成」カード
  html += '<div class="pg-tpl-card" onclick="pgSelectTemplate(null)" style="display:flex;align-items:center;justify-content:center;min-height:80px;border-style:dashed;">';
  html += '<div style="text-align:center;"><div style="font-size:24px;color:var(--gray-400);margin-bottom:4px;">+</div><div style="font-size:13px;color:var(--gray-500);">空から作成</div></div>';
  html += '</div>';

  // プリセット
  presets.forEach(function(t) {
    html += '<div class="pg-tpl-card" onclick="pgSelectTemplate(\'' + t.id + '\')">';
    html += '<div style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:4px;">' + escapeHtml(t.name) + '</div>';
    html += '<div style="font-size:11px;color:var(--gray-500);">' + escapeHtml(t.category) + ' / ' + t.columns.length + '工程</div>';
    html += '<div style="font-size:11px;color:var(--gray-400);margin-top:4px;">' + t.columns.map(function(c) { return escapeHtml(c); }).join(', ') + '</div>';
    html += '</div>';
  });

  // マイテンプレート
  if (customs.length > 0) {
    html += '<div style="grid-column:1/-1;font-size:12px;font-weight:600;color:var(--gray-500);margin-top:8px;">マイテンプレート</div>';
    customs.forEach(function(t) {
      html += '<div class="pg-tpl-card pg-tpl-custom" onclick="pgSelectTemplate(\'' + t.id + '\')">';
      html += '<div style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:4px;">' + escapeHtml(t.name) + '</div>';
      html += '<div style="font-size:11px;color:var(--gray-500);">' + escapeHtml(t.category) + ' / ' + t.columns.length + '工程</div>';
      html += '<div style="font-size:11px;color:var(--gray-400);margin-top:4px;">' + t.columns.map(function(c) { return escapeHtml(c); }).join(', ') + '</div>';
      html += '</div>';
    });
  }

  document.getElementById('pg-template-list').innerHTML = html;
}

function pgSelectTemplate(templateId) {
  pgSelectedTemplateId = templateId;
  if (templateId) {
    var tpl = (MOCK_DATA.progressTemplates || []).find(function(t) { return t.id === templateId; });
    if (tpl) {
      pgSelectedColumns = tpl.columns.slice();
      document.getElementById('new-pg-category').value = tpl.category;
      document.getElementById('pg-show-report-link').checked = tpl.showReportLink !== false;
    }
  } else {
    pgSelectedColumns = [];
  }
  pgCurrentStep = 2;
  pgShowStep(2);
  renderPgColumnsList();
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
  pgFilterClients();
  pgBindClientFilters();
  // 作成モーダルのターゲットモードをリセット
  var radios = document.querySelectorAll('input[name="pg-create-target-mode"]');
  radios.forEach(function(r) { r.checked = r.value === 'manual'; });
  pgCreateTargetModeChanged('manual');
  pgCreateFilterConditions = [];
  pgCreateFilterApplied = false;
}

function pgShowStep(step) {
  pgCurrentStep = step;
  document.getElementById('pg-step-1').style.display = step === 1 ? '' : 'none';
  document.getElementById('pg-step-2').style.display = step === 2 ? '' : 'none';
  document.getElementById('pg-step-3').style.display = step === 3 ? '' : 'none';

  // ステップインジケーター更新
  document.querySelectorAll('#pg-step-indicator .pg-step-dot').forEach(function(dot) {
    var s = parseInt(dot.dataset.step);
    dot.classList.remove('pg-step-active', 'pg-step-done');
    if (s === step) dot.classList.add('pg-step-active');
    else if (s < step) dot.classList.add('pg-step-done');
  });

  // ボタン表示切り替え
  document.getElementById('pg-btn-back').style.display = step > 1 ? '' : 'none';
  document.getElementById('pg-btn-next').style.display = step < 3 ? '' : 'none';
  document.getElementById('pg-btn-create').style.display = step === 3 ? '' : 'none';
}

function pgStepNext() {
  if (pgCurrentStep === 1) {
    // Step 1 → 空から作成として進む
    pgSelectTemplate(null);
  } else if (pgCurrentStep === 2) {
    // バリデーション
    var name = getValTrim('new-pg-name');
    if (!name) { alert('管理表名を入力してください'); return; }
    if (pgSelectedColumns.length === 0) { alert('工程を1つ以上追加してください'); return; }

    // 対象顧客モードに応じてselectedClientsを決定（サマリー表示用）
    var createModeEl = document.querySelector('input[name="pg-create-target-mode"]:checked');
    var createModeVal = createModeEl ? createModeEl.value : 'manual';
    var selectedClients;
    if (createModeVal === 'all') {
      selectedClients = getActiveClients().map(function(c) { return c.id; });
    } else if (createModeVal === 'filter') {
      selectedClients = pgApplyCreateFilterConditions(pgCreateFilterConditions).map(function(c) { return c.id; });
    } else {
      selectedClients = pgGetSelectedClientIds();
    }
    var mgr = getUserById(getVal('new-pg-manager'));
    var showReportLink = document.getElementById('pg-show-report-link').checked;
    document.getElementById('pg-confirm-summary').innerHTML =
      '<div class="card"><div class="card-body">' +
      '<div class="detail-grid" style="grid-template-columns:120px 1fr;gap:8px 16px;">' +
      '<div style="font-size:12px;color:var(--gray-500);">管理表名</div><div style="font-size:13px;font-weight:600;">' + escapeHtml(name) + '</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">カテゴリ</div><div style="font-size:13px;">' + escapeHtml(getVal('new-pg-category')) + '</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">管理者</div><div style="font-size:13px;">' + (mgr ? escapeHtml(mgr.name) : '-') + '</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">工程数</div><div style="font-size:13px;">' + pgSelectedColumns.length + '工程（' + pgSelectedColumns.map(function(c) { return escapeHtml(c); }).join(' → ') + '）</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">対象顧客数</div><div style="font-size:13px;">' + selectedClients.length + '件</div>' +
      '<div style="font-size:12px;color:var(--gray-500);">報告書リンク</div><div style="font-size:13px;">' + (showReportLink ? 'あり' : 'なし') + '</div>' +
      '</div></div></div>';

    pgShowStep(3);
  }
}

function pgStepBack() {
  if (pgCurrentStep === 2) {
    pgShowStep(1);
    renderProgressTemplateList();
  } else if (pgCurrentStep === 3) {
    pgShowStep(2);
  }
}

// カラム一覧レンダリング
function renderPgColumnsList() {
  var container = document.getElementById('pg-columns-list');
  if (pgSelectedColumns.length === 0) {
    container.innerHTML = '<div style="font-size:12px;color:var(--gray-400);padding:8px;">工程が設定されていません</div>';
    return;
  }
  container.innerHTML = pgSelectedColumns.map(function(col, idx) {
    return '<div class="pg-col-item">' +
      '<span style="font-size:11px;color:var(--gray-400);min-width:20px;">' + (idx + 1) + '</span>' +
      '<span class="pg-col-name" contenteditable="true" data-idx="' + idx + '" onblur="pgRenameColumn(' + idx + ', this.textContent)">' + escapeHtml(col) + '</span>' +
      '<button class="pg-col-remove" onclick="pgRemoveColumn(' + idx + ')" title="削除">&times;</button>' +
      '</div>';
  }).join('');
}

function addProgressColumn() {
  var input = document.getElementById('pg-new-column-input');
  var name = input.value.trim();
  if (!name) return;
  if (pgSelectedColumns.includes(name)) { alert('同名の工程がすでに存在します'); return; }
  pgSelectedColumns.push(name);
  input.value = '';
  renderPgColumnsList();
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
}

function pgRemoveColumn(idx) {
  pgSelectedColumns.splice(idx, 1);
  renderPgColumnsList();
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
}

function pgRenameColumn(idx, newName) {
  var trimmed = newName.trim();
  if (trimmed && idx >= 0 && idx < pgSelectedColumns.length) {
    pgSelectedColumns[idx] = trimmed;
  }
  renderPgColumnsList();
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
}

// 顧客フィルタ + チェックボックス
function pgBindClientFilters() {
  ['pg-filter-fiscal', 'pg-filter-type', 'pg-filter-main', 'pg-filter-active'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', pgFilterClients);
  });

  // テンプレート保存チェックボックス
  document.getElementById('pg-save-template').addEventListener('change', function() {
    document.getElementById('pg-template-name-area').style.display = this.checked ? '' : 'none';
  });
}

function pgFilterClients() {
  var fiscal = getVal('pg-filter-fiscal');
  var cType = getVal('pg-filter-type');
  var mainUser = getVal('pg-filter-main');
  var activeOnly = getVal('pg-filter-active') === 'active';

  var clients = MOCK_DATA.clients.filter(function(c) {
    if (activeOnly && !c.isActive) return false;
    if (fiscal && String(c.fiscalMonth) !== fiscal) return false;
    if (cType && c.clientType !== cType) return false;
    if (mainUser && getAssigneeUserId(c.id, 'main') !== mainUser) return false;
    return true;
  });

  var container = document.getElementById('pg-client-list');
  if (clients.length === 0) {
    container.innerHTML = '<div style="font-size:12px;color:var(--gray-400);padding:8px;">該当する顧客がありません</div>';
  } else {
    container.innerHTML = clients.map(function(c) {
      var main = getAssigneeUser(c.id, 'main');
      return '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer;">' +
        '<input type="checkbox" class="pg-client-cb" value="' + c.id + '">' +
        '<span>' + escapeHtml(c.name) + '</span>' +
        '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + ' / ' + (c.fiscalMonth === 'personal' ? '個人' : c.fiscalMonth + '月決算') + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
        '</label>';
    }).join('');
  }

  // チェック変更時のカウント更新
  container.querySelectorAll('.pg-client-cb').forEach(function(cb) {
    cb.addEventListener('change', pgUpdateSelectedCount);
  });
  pgUpdateSelectedCount();
}

function pgSelectAllClients(select) {
  document.querySelectorAll('#pg-client-list .pg-client-cb').forEach(function(cb) {
    cb.checked = select;
  });
  pgUpdateSelectedCount();
}

function pgUpdateSelectedCount() {
  var count = document.querySelectorAll('#pg-client-list .pg-client-cb:checked').length;
  document.getElementById('pg-selected-count').textContent = count + '件選択中';
}

function pgGetSelectedClientIds() {
  var ids = [];
  document.querySelectorAll('#pg-client-list .pg-client-cb:checked').forEach(function(cb) {
    ids.push(cb.value);
  });
  return ids;
}

function submitNewProgress() {
  var name = getValTrim('new-pg-name');
  var category = getVal('new-pg-category');
  var managerId = getVal('new-pg-manager');
  var columns = pgSelectedColumns.slice();
  var selectedClientIds = pgGetSelectedClientIds();

  if (!name) { alert('管理表名を入力してください'); return; }
  if (columns.length === 0) { alert('工程を1つ以上追加してください'); return; }

  var showReportLink = document.getElementById('pg-show-report-link').checked;

  // 対象顧客モードに応じてselectedClientIdsを決定
  var createMode = document.querySelector('input[name="pg-create-target-mode"]:checked');
  createMode = createMode ? createMode.value : 'manual';
  if (createMode === 'all') {
    selectedClientIds = getActiveClients().map(function(c) { return c.id; });
  } else if (createMode === 'filter') {
    var filtered = pgApplyCreateFilterConditions(pgCreateFilterConditions);
    selectedClientIds = filtered.map(function(c) { return c.id; });
  }

  // マイテンプレート保存
  if (document.getElementById('pg-save-template').checked) {
    var tplName = getValTrim('pg-template-save-name');
    if (!tplName) { alert('テンプレート名を入力してください'); return; }
    MOCK_DATA.progressTemplates.push({
      id: generateId('pt-', MOCK_DATA.progressTemplates),
      name: tplName,
      category: category,
      columns: columns.slice(),
      isCustom: true,
      showReportLink: showReportLink,
    });
  }

  // 対象顧客の targets を構築
  var targets = selectedClientIds.map(function(clientId) {
    var steps = {};
    columns.forEach(function(col) { steps[col] = '未着手'; });
    return { clientId: clientId, steps: steps, note: '' };
  });

  MOCK_DATA.progressSheets.push({
    id: generateId('ps-', MOCK_DATA.progressSheets),
    name: name,
    category: category,
    status: '利用中',
    managerId: managerId,
    createdAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }),
    columns: columns,
    targets: targets,
    showReportLink: showReportLink,
  });

  hideModal('progress-create-modal');
  if (currentPage === 'progress') navigateTo('progress');
  else alert('進捗管理表「' + name + '」を作成しました');
}

// ============================================================
// 作成モーダル用 フィルタ条件
// ============================================================

var pgCreateFilterConditions = [];
var pgCreateFilterApplied = false;

window.pgCreateTargetModeChanged = function(mode) {
  var manualArea = document.getElementById('pg-create-manual-area');
  var autoPreview = document.getElementById('pg-create-auto-preview');
  var filterBtn = document.getElementById('pg-create-filter-btn');
  var filterSummary = document.getElementById('pg-create-filter-summary');

  manualArea.style.display = 'none';
  autoPreview.style.display = 'none';
  if (filterBtn) filterBtn.style.display = 'none';
  if (filterSummary) filterSummary.style.display = 'none';

  if (mode === 'all') {
    autoPreview.style.display = '';
    var activeClients = getActiveClients();
    document.getElementById('pg-create-auto-count').textContent = 'アクティブな全顧客: ' + activeClients.length + '件が対象になります';
    document.getElementById('pg-create-auto-list').innerHTML = activeClients.map(function(c) {
      var main = getAssigneeUser(c.id, 'main');
      return '<div style="padding:3px 6px;font-size:12px;display:flex;align-items:center;gap:8px;">' +
        '<span style="color:var(--gray-500);font-size:11px;min-width:60px;">' + escapeHtml(c.clientCode) + '</span>' +
        '<span>' + escapeHtml(c.name) + '</span>' +
        '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
        '</div>';
    }).join('');
    // pg-selected-count を更新（submitNewProgress で参照するため）
    document.getElementById('pg-selected-count').textContent = activeClients.length + '件選択中';

  } else if (mode === 'filter') {
    autoPreview.style.display = '';
    if (filterBtn) filterBtn.style.display = '';
    if (pgCreateFilterApplied && pgCreateFilterConditions.length > 0) {
      pgRenderCreateFilterPreview();
      if (filterSummary) {
        filterSummary.style.display = '';
        filterSummary.textContent = pgCreateFilterConditions.length + '件の条件';
      }
    } else {
      document.getElementById('pg-create-auto-count').textContent = '条件が設定されていません。「条件設定」ボタンで条件を設定してください。';
      document.getElementById('pg-create-auto-list').innerHTML = '';
    }

  } else {
    // manual
    manualArea.style.display = '';
  }
};

function pgRenderCreateFilterPreview() {
  var matched = pgApplyCreateFilterConditions(pgCreateFilterConditions);
  document.getElementById('pg-create-auto-count').textContent = '条件にマッチする顧客: ' + matched.length + '件が対象になります';
  document.getElementById('pg-create-auto-list').innerHTML = matched.length === 0
    ? '<div style="font-size:12px;color:var(--gray-400);padding:4px;">該当する顧客がありません</div>'
    : matched.map(function(c) {
        var main = getAssigneeUser(c.id, 'main');
        return '<div style="padding:3px 6px;font-size:12px;display:flex;align-items:center;gap:8px;">' +
          '<span style="color:var(--gray-500);font-size:11px;min-width:60px;">' + escapeHtml(c.clientCode) + '</span>' +
          '<span>' + escapeHtml(c.name) + '</span>' +
          '<span style="font-size:11px;color:var(--gray-400);margin-left:auto;">' + escapeHtml(c.clientType) + (main ? ' / ' + escapeHtml(main.name) : '') + '</span>' +
          '</div>';
      }).join('');
  // pg-selected-count を更新
  document.getElementById('pg-selected-count').textContent = matched.length + '件選択中';
}

window.openPgCreateFilterDialog = function() {
  pgRenderCreateFilterConditionsUI();
  showModal('pg-create-filter-dialog');
};

window.closePgCreateFilterDialog = function() {
  hideModal('pg-create-filter-dialog');
};

function pgRenderCreateFilterConditionsUI() {
  var container = document.getElementById('pg-create-filter-conditions');
  if (pgCreateFilterConditions.length === 0) {
    pgCreateFilterConditions.push({ field: 'clientType', op: '=', value: '法人' });
  }
  pgRedrawFilterConditions(container, pgCreateFilterConditions, 'pg-create-filter-logic');
}

window.pgCreateFilterRowChange = function(idx, prop, val) {
  if (!pgCreateFilterConditions[idx]) return;
  pgCreateFilterConditions[idx][prop] = val;
  if (prop === 'field') {
    var field = PG_FILTER_FIELDS.find(function(f) { return f.key === val; });
    if (field) {
      var opts = field.options === 'users'
        ? MOCK_DATA.users.filter(function(u) { return u.isActive; })
        : null;
      pgCreateFilterConditions[idx].value = opts
        ? opts[0].id
        : (field.options[0] || '');
    }
    pgRedrawFilterConditions(document.getElementById('pg-create-filter-conditions'), pgCreateFilterConditions, 'pg-create-filter-logic');
  }
};

window.pgAddCreateFilterCondition = function() {
  pgCreateFilterConditions.push({ field: 'clientType', op: '=', value: '法人' });
  pgRedrawFilterConditions(document.getElementById('pg-create-filter-conditions'), pgCreateFilterConditions, 'pg-create-filter-logic');
};

window.pgRemoveCreateFilterCondition = function(idx) {
  pgCreateFilterConditions.splice(idx, 1);
  pgRedrawFilterConditions(document.getElementById('pg-create-filter-conditions'), pgCreateFilterConditions, 'pg-create-filter-logic');
};

window.pgCheckCreateFilterCount = function() {
  var matched = pgApplyCreateFilterConditions(pgCreateFilterConditions);
  document.getElementById('pg-create-filter-count-result').textContent = matched.length + '件の顧客が対象です';
};

window.applyPgCreateFilter = function() {
  pgCreateFilterApplied = true;
  closePgCreateFilterDialog();
  pgRenderCreateFilterPreview();
  var filterSummary = document.getElementById('pg-create-filter-summary');
  if (filterSummary) {
    filterSummary.style.display = '';
    filterSummary.textContent = pgCreateFilterConditions.length + '件の条件';
  }
};

// ============================================================
// 候補⇔表示リスト（作成モーダル 工程列）
// ============================================================

window.pgCreateRenderCandidates = function() {
  var category = document.getElementById('pg-col-category').value;
  var displayCols = pgSelectedColumns.slice();
  var candidates = pgGetCandidatesByCategory(category).filter(function(c) { return !displayCols.includes(c); });

  var container = document.getElementById('pg-col-candidates');
  if (candidates.length === 0) {
    container.innerHTML = '<div style="padding:8px;font-size:12px;color:var(--gray-400);">候補がありません</div>';
    return;
  }
  container.innerHTML = candidates.map(function(c, idx) {
    return '<div class="pg-dual-list-item" data-idx="' + idx + '" data-name="' + escapeHtml(c) + '" onclick="pgCreateSelectCandidate(this)" style="padding:5px 8px;font-size:12px;cursor:pointer;border-radius:4px;">' + escapeHtml(c) + '</div>';
  }).join('');
};

window.pgCreateSelectCandidate = function(el) {
  document.querySelectorAll('#pg-col-candidates .pg-dual-list-item').forEach(function(item) { item.style.background = ''; item.style.color = ''; });
  document.querySelectorAll('#pg-col-display .pg-dual-list-item').forEach(function(item) { item.style.background = ''; item.style.color = ''; });
  el.style.background = 'var(--primary)'; el.style.color = '#fff';
};

window.pgCreateSelectDisplay = function(el) {
  document.querySelectorAll('#pg-col-candidates .pg-dual-list-item').forEach(function(item) { item.style.background = ''; item.style.color = ''; });
  document.querySelectorAll('#pg-col-display .pg-dual-list-item').forEach(function(item) { item.style.background = ''; item.style.color = ''; });
  el.style.background = 'var(--primary)'; el.style.color = '#fff';
};

function pgCreateRenderDisplay() {
  var container = document.getElementById('pg-col-display');
  if (!pgSelectedColumns || pgSelectedColumns.length === 0) {
    container.innerHTML = '<div style="padding:8px;font-size:12px;color:var(--gray-400);">工程がありません</div>';
    return;
  }
  container.innerHTML = pgSelectedColumns.map(function(c, idx) {
    return '<div class="pg-dual-list-item" data-idx="' + idx + '" data-name="' + escapeHtml(c) + '" onclick="pgCreateSelectDisplay(this)" style="padding:5px 8px;font-size:12px;cursor:pointer;border-radius:4px;">' + escapeHtml(c) + '</div>';
  }).join('');
}

window.pgCreateColAdd = function() {
  var selectedEl = document.querySelector('#pg-col-candidates .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) { alert('候補から追加する工程を選択してください'); return; }
  var name = selectedEl.dataset.name;
  if (pgSelectedColumns.includes(name)) return;
  pgSelectedColumns.push(name);
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
};

window.pgCreateColRemove = function() {
  var selectedEl = document.querySelector('#pg-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) { alert('削除する工程を選択してください'); return; }
  var name = selectedEl.dataset.name;
  var idx = pgSelectedColumns.indexOf(name);
  if (idx >= 0) pgSelectedColumns.splice(idx, 1);
  pgCreateRenderDisplay();
  pgCreateRenderCandidates();
};

window.pgCreateColMoveUp = function() {
  var selectedEl = document.querySelector('#pg-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) return;
  var idx = parseInt(selectedEl.dataset.idx);
  if (idx <= 0) return;
  var tmp = pgSelectedColumns[idx]; pgSelectedColumns[idx] = pgSelectedColumns[idx - 1]; pgSelectedColumns[idx - 1] = tmp;
  pgCreateRenderDisplay();
  var items = document.querySelectorAll('#pg-col-display .pg-dual-list-item');
  if (items[idx - 1]) { items[idx - 1].style.background = 'var(--primary)'; items[idx - 1].style.color = '#fff'; }
};

window.pgCreateColMoveDown = function() {
  var selectedEl = document.querySelector('#pg-col-display .pg-dual-list-item[style*="primary"]');
  if (!selectedEl) return;
  var idx = parseInt(selectedEl.dataset.idx);
  if (idx >= pgSelectedColumns.length - 1) return;
  var tmp = pgSelectedColumns[idx]; pgSelectedColumns[idx] = pgSelectedColumns[idx + 1]; pgSelectedColumns[idx + 1] = tmp;
  pgCreateRenderDisplay();
  var items = document.querySelectorAll('#pg-col-display .pg-dual-list-item');
  if (items[idx + 1]) { items[idx + 1].style.background = 'var(--primary)'; items[idx + 1].style.color = '#fff'; }
};
