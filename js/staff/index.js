// ===========================
// 職員一覧
// ===========================
function getDeptName(deptId) {
  if (!deptId) return '-';
  const dept = MOCK_DATA.departments.find(d => d.deptId === deptId);
  return dept ? dept.deptName : '-';
}

function renderStaff(el) {
  const deptOptions = MOCK_DATA.departments.filter(d => d.status === 1)
    .map(d => `<option value="${d.deptId}">${d.deptName}</option>`).join('');
  const empTypes = [...new Set(MOCK_DATA.users.map(u => u.employmentType).filter(Boolean))];
  const empTypeOptions = empTypes.map(t => `<option value="${t}">${t}</option>`).join('');

  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="氏名・コード・フリガナで検索..." id="staff-search">
      <select class="filter-select" id="staff-role-filter">
        <option value="">全ロール</option>
        <option value="admin">管理者</option>
        <option value="team_leader">チームリーダー</option>
        <option value="member">メンバー</option>
      </select>
      <select class="filter-select" id="staff-dept-filter">
        <option value="">全部署</option>
        ${deptOptions}
      </select>
      <select class="filter-select" id="staff-emptype-filter">
        <option value="">全雇用形態</option>
        ${empTypeOptions}
      </select>
      <div class="spacer"></div>
      <button class="btn btn-csv btn-sm" onclick="exportStaffCSV()">CSV出力</button>
      <button class="btn btn-csv btn-sm" onclick="importStaffCSV()">CSV取り込み</button>
      <button class="btn btn-primary" onclick="openStaffModal()">+ 職員追加</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>コード</th><th>氏名</th><th>フリガナ</th><th>メール</th><th>部署</th><th>役職</th><th>雇用形態</th><th>ステータス</th></tr></thead>
          <tbody id="staff-table-body"></tbody>
        </table>
      </div>
    </div>
  `;
  renderStaffTable();
  bindFilters(['staff-search', 'staff-role-filter', 'staff-dept-filter', 'staff-emptype-filter'], renderStaffTable);
}

function renderStaffTable() {
  const search = (document.getElementById('staff-search')?.value || '').toLowerCase();
  const roleFilter = document.getElementById('staff-role-filter')?.value || '';
  const deptFilter = document.getElementById('staff-dept-filter')?.value || '';
  const empTypeFilter = document.getElementById('staff-emptype-filter')?.value || '';

  let users = MOCK_DATA.users.filter(u => {
    if (search) {
      const kana = ((u.lastNameKana || '') + ' ' + (u.firstNameKana || '')).toLowerCase();
      const fullName = ((u.lastName || '') + ' ' + (u.firstName || '')).toLowerCase();
      if (!u.name.toLowerCase().includes(search) && !u.staffCode.toLowerCase().includes(search) && !kana.includes(search) && !fullName.includes(search)) return false;
    }
    if (roleFilter && u.role !== roleFilter) return false;
    if (deptFilter && String(u.deptId) !== deptFilter) return false;
    if (empTypeFilter && u.employmentType !== empTypeFilter) return false;
    return true;
  });

  renderTableBody('staff-table-body', users, u => {
    const displayName = (u.lastName || '') + (u.firstName ? ' ' + u.firstName : '');
    const displayKana = (u.lastNameKana || '') + (u.firstNameKana ? ' ' + u.firstNameKana : '');
    return `
    <tr class="clickable" onclick="navigateTo('staff-detail',{id:'${u.id}'})">
      <td>${u.staffCode || '-'}</td>
      <td><strong>${displayName || u.name}</strong></td>
      <td>${displayKana || '-'}</td>
      <td>${u.email || '-'}</td>
      <td>${getDeptName(u.deptId)}</td>
      <td>${u.position || '-'}</td>
      <td>${u.employmentType || '-'}</td>
      <td>
        <button class="btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-primary'}" onclick="event.stopPropagation();toggleStaffActive('${u.id}')" style="font-size:11px;padding:3px 8px;">
          ${u.isActive ? '有効 \u2713' : '無効'}
        </button>
      </td>
    </tr>`;
  }, 8);
}

function toggleStaffActive(userId) {
  const u = MOCK_DATA.users.find(x => x.id === userId);
  if (!u) return;
  const action = u.isActive ? '無効' : '有効';
  if (!confirm(`${u.name} を${action}にしますか？`)) return;
  u.isActive = !u.isActive;
  renderStaffTable();
}

// ===========================
// 職員詳細
// ===========================
function renderStaffDetail(el, params) {
  const u = getUserById(params.id);
  if (!u) { el.innerHTML = renderEmptyState('職員が見つかりません'); return; }
  document.getElementById('header-title').textContent = `職員詳細 - ${u.name}`;
  const displayKana = (u.lastNameKana || '') + (u.firstNameKana ? ' ' + u.firstNameKana : '');
  const clients = MOCK_DATA.clients.filter(c => c.mainUserId === u.id || c.subUserId === u.id);

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('staff')">&larr; 職員一覧に戻る</a></div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>基本情報</h3><button class="btn btn-primary btn-sm" onclick="openStaffModal('${u.id}')">編集</button></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">職員コード</div><div class="detail-value">${u.staffCode || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">氏名</div><div class="detail-value">${u.name}</div></div>
          <div class="detail-row"><div class="detail-label">フリガナ</div><div class="detail-value">${displayKana || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">メール</div><div class="detail-value">${u.email || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">電話番号</div><div class="detail-value">${u.tel || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">携帯番号</div><div class="detail-value">${u.mobile || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">部署</div><div class="detail-value">${getDeptName(u.deptId)}</div></div>
          <div class="detail-row"><div class="detail-label">役職</div><div class="detail-value">${u.position || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">雇用形態</div><div class="detail-value">${u.employmentType || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">入社日</div><div class="detail-value">${formatDate(u.joinDate)}</div></div>
          ${u.memo ? `<div class="detail-row"><div class="detail-label">備考</div><div class="detail-value">${u.memo}</div></div>` : ''}
          <div class="detail-row"><div class="detail-label">ステータス</div><div class="detail-value">${u.isActive ? '有効' : '無効'}</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>アカウント情報</h3></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">ログインID</div><div class="detail-value">${u.loginId || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">ロール</div><div class="detail-value"><span class="type-badge type-corp">${getRoleBadge(u.role)}</span></div></div>
          <div class="detail-row"><div class="detail-label">チーム</div><div class="detail-value">${u.team || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">分類</div><div class="detail-value">${u.staffFlag || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">基本比率</div><div class="detail-value">${u.baseRatio != null ? u.baseRatio + '%' : '-'}</div></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:24px">
      <div class="card-header"><h3>担当顧客一覧</h3></div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>コード</th><th>顧客名</th><th>種別</th><th>決算月</th><th>担当区分</th><th>月額報酬</th></tr></thead>
            <tbody>
              ${clients.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:var(--gray-400)">担当顧客なし</td></tr>' : clients.map(c => {
                const role = c.mainUserId === u.id ? '主担当' : '副担当';
                return `<tr class="clickable" onclick="navigateTo('client-detail',{id:'${c.id}'})">
                  <td>${c.clientCode}</td>
                  <td><strong>${c.name}</strong></td>
                  <td>${renderTypeBadge(c.clientType)}</td>
                  <td>${c.fiscalMonth}月</td>
                  <td>${role}</td>
                  <td>${c.monthlySales.toLocaleString()}円</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ===========================
// 職員CSV出力・取り込み
// ===========================
function exportStaffCSV() {
  const search = (document.getElementById('staff-search')?.value || '').toLowerCase();
  const roleFilter = document.getElementById('staff-role-filter')?.value || '';
  const deptFilter = document.getElementById('staff-dept-filter')?.value || '';
  const empTypeFilter = document.getElementById('staff-emptype-filter')?.value || '';

  let users = MOCK_DATA.users.filter(u => {
    if (search) {
      const kana = ((u.lastNameKana || '') + ' ' + (u.firstNameKana || '')).toLowerCase();
      const fullName = ((u.lastName || '') + ' ' + (u.firstName || '')).toLowerCase();
      if (!u.name.toLowerCase().includes(search) && !u.staffCode.toLowerCase().includes(search) && !kana.includes(search) && !fullName.includes(search)) return false;
    }
    if (roleFilter && u.role !== roleFilter) return false;
    if (deptFilter && String(u.deptId) !== deptFilter) return false;
    if (empTypeFilter && u.employmentType !== empTypeFilter) return false;
    return true;
  });

  const header = ['staffCode', 'lastName', 'firstName', 'lastNameKana', 'firstNameKana', 'email', 'tel', 'mobile', 'deptId', 'position', 'employmentType', 'joinDate', 'role', 'staffFlag', 'memo'];
  const rows = users.map(u => [u.staffCode || '', u.lastName || '', u.firstName || '', u.lastNameKana || '', u.firstNameKana || '', u.email || '', u.tel || '', u.mobile || '', u.deptId || '', u.position || '', u.employmentType || '', u.joinDate || '', u.role || '', u.staffFlag || '', u.memo || '']);

  downloadCSV('職員一覧.csv', header, rows);
}

function importStaffCSV() {
  runCSVImport((obj) => {
    const existing = MOCK_DATA.users.find(u => u.staffCode === obj.staffCode);
    if (existing) {
      if (obj.lastName) existing.lastName = obj.lastName;
      if (obj.firstName !== undefined) existing.firstName = obj.firstName;
      if (obj.lastNameKana) existing.lastNameKana = obj.lastNameKana;
      if (obj.firstNameKana !== undefined) existing.firstNameKana = obj.firstNameKana;
      existing.name = (existing.lastName || '') + (existing.firstName ? ' ' + existing.firstName : '');
      if (obj.email) existing.email = obj.email;
      if (obj.tel !== undefined) existing.tel = obj.tel;
      if (obj.mobile !== undefined) existing.mobile = obj.mobile;
      if (obj.deptId) existing.deptId = parseInt(obj.deptId) || existing.deptId;
      if (obj.position !== undefined) existing.position = obj.position;
      if (obj.employmentType) existing.employmentType = obj.employmentType;
      if (obj.joinDate) existing.joinDate = obj.joinDate;
      if (obj.role) existing.role = obj.role;
      if (obj.staffFlag) existing.staffFlag = obj.staffFlag;
      if (obj.memo !== undefined) existing.memo = obj.memo;
      return 'updated';
    } else {
      const newId = generateId('u-', MOCK_DATA.users);
      const code = obj.staffCode || 'A' + String(MOCK_DATA.users.length + 1).padStart(3, '0');
      const lastName = obj.lastName || '名称未設定';
      const firstName = obj.firstName || '';
      const name = firstName ? lastName + ' ' + firstName : lastName;
      MOCK_DATA.users.push({
        id: newId, staffCode: code, lastName, firstName,
        lastNameKana: obj.lastNameKana || '', firstNameKana: obj.firstNameKana || '',
        name, email: obj.email || '', tel: obj.tel || '', mobile: obj.mobile || '',
        role: obj.role || 'member', deptId: obj.deptId ? parseInt(obj.deptId) : null,
        team: null, position: obj.position || '', employmentType: obj.employmentType || '正社員',
        joinDate: obj.joinDate || '', memo: obj.memo || '',
        loginId: (obj.email || '').split('@')[0] || '', isActive: true,
        baseRatio: null, staffFlag: obj.staffFlag || '税務',
      });
      return 'imported';
    }
  }, () => { if (currentPage === 'staff') navigateTo('staff'); });
}

registerPage('staff', renderStaff);
registerPage('staff-detail', renderStaffDetail);
