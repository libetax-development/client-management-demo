// ===========================
// モーダル共通 — フィルター定義・ユーティリティ
// ===========================

// フィルタ条件フィールド定義
var PG_FILTER_FIELDS = [
  { key: 'clientType', label: '種別', options: ['法人', '個人'] },
  { key: 'fiscalMonth', label: '決算月', options: Array.from({length: 12}, function(_, i) { return (i + 1) + '月'; }) },
  { key: 'isActive', label: 'ステータス', options: ['有効', '無効'] },
  { key: 'mainAssignee', label: '主担当者', options: 'users' },
];

// 条件テキストを生成（例: 「種別：個人」AND「ステータス：有効」）
function pgBuildConditionText(conditions, logicName) {
  if (!conditions || conditions.length === 0) return '';
  var logicEl = document.querySelector('input[name="' + (logicName || 'pg-filter-logic') + '"]:checked');
  var logic = logicEl ? logicEl.value : 'AND';
  var parts = conditions.map(function(cond) {
    var field = PG_FILTER_FIELDS.find(function(f) { return f.key === cond.field; });
    var fieldLabel = field ? field.label : cond.field;
    var opLabel = cond.op === '=' ? '' : '≠';
    var valueLabel = cond.value;
    if (field && field.options === 'users') {
      var user = MOCK_DATA.users.find(function(u) { return u.id === cond.value; });
      if (user) valueLabel = user.name;
    }
    return '「' + fieldLabel + (opLabel ? opLabel : '：') + valueLabel + '」';
  });
  return parts.join(' ' + logic + ' ');
}

// 条件テキストを表示エリアに反映
function pgShowConditionText(conditions, logicName, elementId) {
  var el = document.getElementById(elementId || 'pg-filter-condition-text');
  if (!el) return;
  if (!conditions || conditions.length === 0) {
    el.style.display = 'none';
    el.textContent = '';
    return;
  }
  el.textContent = pgBuildConditionText(conditions, logicName);
  el.style.display = '';
}

function pgMatchCondition(client, cond) {
  var field = cond.field;
  var op = cond.op;
  var val = cond.value;
  var actual;
  if (field === 'clientType') {
    actual = client.clientType;
  } else if (field === 'fiscalMonth') {
    actual = client.fiscalMonth + '月';
  } else if (field === 'isActive') {
    actual = client.isActive ? '有効' : '無効';
  } else if (field === 'mainAssignee') {
    actual = getAssigneeUserId(client.id, 'main');
  } else {
    actual = client[field];
  }
  if (op === '=') return actual === val;
  if (op === '!=') return actual !== val;
  return true;
}

function pgRedrawFilterConditions(container, conditions, logicName) {
  container.innerHTML = conditions.map(function(cond, idx) {
    return pgBuildConditionRow(cond, idx, logicName === 'pg-filter-logic' ? 'settings' : 'create');
  }).join('');
}

function pgBuildConditionRow(cond, idx, context) {
  var prefix = context === 'settings' ? 'pgFilterRowChange' : 'pgCreateFilterRowChange';
  var removePrefix = context === 'settings' ? 'pgRemoveFilterCondition' : 'pgRemoveCreateFilterCondition';

  var fieldOpts = PG_FILTER_FIELDS.map(function(f) {
    return '<option value="' + f.key + '"' + (cond.field === f.key ? ' selected' : '') + '>' + f.label + '</option>';
  }).join('');

  var opOpts = ['=', '!='].map(function(op) {
    var label = op === '=' ? '＝（等しい）' : '≠（等しくない）';
    return '<option value="' + op + '"' + (cond.op === op ? ' selected' : '') + '>' + label + '</option>';
  }).join('');

  var field = PG_FILTER_FIELDS.find(function(f) { return f.key === cond.field; });
  var valueOpts = '';
  if (field) {
    var opts = field.options === 'users'
      ? MOCK_DATA.users.filter(function(u) { return u.isActive; }).map(function(u) { return { v: u.id, l: u.name }; })
      : field.options.map(function(o) { return { v: o, l: o }; });
    valueOpts = opts.map(function(o) {
      return '<option value="' + o.v + '"' + (cond.value === o.v ? ' selected' : '') + '>' + escapeHtml(o.l) + '</option>';
    }).join('');
  }

  return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;" data-cond-idx="' + idx + '">' +
    '<select style="padding:5px 8px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;" onchange="' + prefix + '(' + idx + ',\'field\',this.value)">' + fieldOpts + '</select>' +
    '<select style="padding:5px 8px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;min-width:120px;" onchange="' + prefix + '(' + idx + ',\'op\',this.value)">' + opOpts + '</select>' +
    '<select style="padding:5px 8px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;flex:1;" onchange="' + prefix + '(' + idx + ',\'value\',this.value)">' + valueOpts + '</select>' +
    '<button class="btn-icon" onclick="' + removePrefix + '(' + idx + ')" title="削除" style="color:var(--danger);">&times;</button>' +
    '</div>';
}

function pgGetCandidatesByCategory(category) {
  var candidates = MOCK_DATA.progressColumnCandidates || {};
  if (category === 'all') {
    var all = [];
    Object.values(candidates).forEach(function(arr) {
      arr.forEach(function(c) { if (!all.includes(c)) all.push(c); });
    });
    return all;
  }
  return (candidates[category] || []).slice();
}
