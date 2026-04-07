// ===========================
// 職員一覧
// ===========================
let staffPage = 1;
const staffPerPage = 20;

function getDeptName(deptId) {
  if (!deptId) return '-';
  const dept = MOCK_DATA.departments.find(d => d.deptId === deptId);
  return dept ? dept.deptName : '-';
}

function renderStaff(el) {
  const empTypes = [...new Set(MOCK_DATA.users.map(u => u.employmentType).filter(Boolean))];
  const empTypeOptions = empTypes.map(t => `<option value="${t}">${t}</option>`).join('');

  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="氏名・コード・フリガナで検索..." id="staff-search">
      <select class="filter-select" id="staff-role-filter">
        <option value="">全ロール</option>
        <option value="admin">管理者</option>
        <option value="member">メンバー</option>
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
          <thead><tr><th>コード</th><th>氏名</th><th>メール</th><th>CW ID</th><th>役職</th><th>雇用形態</th><th>ロール</th><th>状態</th></tr></thead>
          <tbody id="staff-table-body"></tbody>
        </table>
      </div>
      <div id="staff-pagination" class="rp-pagination"></div>
    </div>
  `;
  staffPage = 1;
  renderStaffTable();
  bindFilters(['staff-search', 'staff-role-filter', 'staff-emptype-filter'], () => { staffPage = 1; renderStaffTable(); });
}

function getFilteredStaff() {
  const search = (document.getElementById('staff-search')?.value || '').toLowerCase();
  const roleFilter = document.getElementById('staff-role-filter')?.value || '';
  const empTypeFilter = document.getElementById('staff-emptype-filter')?.value || '';

  return MOCK_DATA.users.filter(u => {
    if (search) {
      const kana = ((u.lastNameKana || '') + ' ' + (u.firstNameKana || '')).toLowerCase();
      const fullName = ((u.lastName || '') + ' ' + (u.firstName || '')).toLowerCase();
      if (!u.name.toLowerCase().includes(search) && !u.staffCode.toLowerCase().includes(search) && !kana.includes(search) && !fullName.includes(search)) return false;
    }
    if (roleFilter === 'admin' && u.role !== 'admin') return false;
    if (roleFilter === 'member' && u.role === 'admin') return false;
    if (empTypeFilter && u.employmentType !== empTypeFilter) return false;
    return true;
  });
}

function renderStaffTable() {
  let users = getFilteredStaff();

  const total = users.length;
  const totalPages = Math.max(1, Math.ceil(total / staffPerPage));
  const start = (staffPage - 1) * staffPerPage;
  const pageItems = users.slice(start, start + staffPerPage);

  renderTableBody('staff-table-body', pageItems, u => {
    const displayName = (u.lastName || '') + (u.firstName ? ' ' + u.firstName : '');
    const roleBadge = u.role === 'admin' ? '<span class="status-badge status-done" style="font-size:11px;">管理者</span>'
      : '<span class="status-badge status-todo" style="font-size:11px;">メンバー</span>';
    return `
    <tr class="clickable" onclick="navigateTo('staff-detail',{id:'${u.id}'})">
      <td style="font-family:monospace;font-size:12px;">${u.staffCode || '-'}</td>
      <td><strong>${escapeHtml(displayName || u.name)}</strong></td>
      <td>${u.email || '-'}</td>
      <td>${u.cwAccountId || '-'}</td>
      <td>${u.position || '-'}</td>
      <td>${u.employmentType || '-'}</td>
      <td>${roleBadge}</td>
      <td>
        <button class="btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-primary'}" onclick="event.stopPropagation();toggleStaffActive('${u.id}')" style="font-size:11px;padding:3px 8px;">
          ${u.isActive ? '有効 ✓' : '無効'}
        </button>
      </td>
    </tr>`;
  }, 8);

  const pag = document.getElementById('staff-pagination');
  if (pag && total > staffPerPage) {
    pag.innerHTML = `
      <button onclick="staffPage=Math.max(1,staffPage-1);renderStaffTable()" ${staffPage <= 1 ? 'disabled' : ''}>← 前</button>
      <span class="page-info">${staffPage} / ${totalPages}</span>
      <button onclick="staffPage=Math.min(${totalPages},staffPage+1);renderStaffTable()" ${staffPage >= totalPages ? 'disabled' : ''}>次 →</button>
      <span style="margin-left:8px;font-size:11px;">(全${total}件)</span>
    `;
  } else if (pag) {
    pag.innerHTML = '';
  }
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
  const clients = MOCK_DATA.clients.filter(c => getAssigneeUserId(c.id, 'main') === u.id || getAssigneeUserId(c.id, 'sub') === u.id);

  el.innerHTML = `
    <div style="margin-bottom:16px"><a href="#" onclick="event.preventDefault();navigateTo('staff')">&larr; 職員一覧に戻る</a></div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-header"><h3>基本情報</h3><button class="btn btn-primary btn-sm" onclick="openStaffModal('${u.id}')">編集</button></div>
        <div class="card-body">
          ${u.photoUrl ? `<div style="text-align:center;margin-bottom:16px;"><img src="${escapeHtml(u.photoUrl)}" alt="${escapeHtml(u.name)}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--gray-200);"></div>` : ''}
          <div class="detail-row"><div class="detail-label">職員コード</div><div class="detail-value">${u.staffCode || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">氏名</div><div class="detail-value">${escapeHtml(u.name)}</div></div>
          <div class="detail-row"><div class="detail-label">フリガナ</div><div class="detail-value">${displayKana || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">メール</div><div class="detail-value">${u.email || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">電話番号</div><div class="detail-value">${u.tel || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">携帯番号</div><div class="detail-value">${u.mobile || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">部署</div><div class="detail-value">${getDeptName(u.deptId)}</div></div>
          <div class="detail-row"><div class="detail-label">役職</div><div class="detail-value">${u.position || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">雇用形態</div><div class="detail-value">${u.employmentType || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">入社日</div><div class="detail-value">${formatDate(u.joinDate)}</div></div>
          ${u.memo ? `<div class="detail-row"><div class="detail-label">備考</div><div class="detail-value">${escapeHtml(u.memo)}</div></div>` : ''}
          <div class="detail-row"><div class="detail-label">ステータス</div><div class="detail-value">${u.isActive ? '有効' : '無効'}</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>プロフィール</h3></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">リベシティURL</div><div class="detail-value">${u.libeProfileUrl ? `<a href="${escapeHtml(u.libeProfileUrl)}" target="_blank">${escapeHtml(u.libeProfileUrl)}</a>` : '-'}</div></div>
          <div class="detail-row"><div class="detail-label">自己紹介</div><div class="detail-value" style="white-space:pre-wrap;">${u.selfIntro ? escapeHtml(u.selfIntro) : '-'}</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>アカウント情報</h3></div>
        <div class="card-body">
          <div class="detail-row"><div class="detail-label">ログインID</div><div class="detail-value">${u.loginId || '-'}</div></div>
          <div class="detail-row"><div class="detail-label">CWID</div><div class="detail-value">${u.cwAccountId || '-'}</div></div>
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
                const role = getAssigneeUserId(c.id, 'main') === u.id ? '主担当' : '副担当';
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
  let users = getFilteredStaff();

  const header = ['職員コード', '姓', '名', '姓カナ', '名カナ', '表示名', 'メールアドレス', '電話番号', '携帯番号', 'ロール', '役職', '雇用形態', '入社日', '基準割合', '月額固定報酬', '住所', '生年月日', '顔写真URL'];
  const rows = users.map(u => [u.staffCode || '', u.lastName || '', u.firstName || '', u.lastNameKana || '', u.firstNameKana || '', u.name || '', u.email || '', u.tel || '', u.mobile || '', u.role || '', u.position || '', u.employmentType || '', u.joinDate || '', u.baseRatio ?? '', u.fixedReward ?? '', u.address || '', u.birthDate || '', u.photoUrl || '']);

  downloadCSV('職員一覧.csv', header, rows);
}

function importStaffCSV() {
  // 日本語ヘッダー→内部フィールド名マッピング
  const keyMap = {
    '職員コード': 'staffCode', '姓': 'lastName', '名': 'firstName',
    '姓カナ': 'lastNameKana', '名カナ': 'firstNameKana', '表示名': 'name',
    'メールアドレス': 'email', '電話番号': 'tel', '携帯番号': 'mobile',
    'ロール': 'role', '役職': 'position', '雇用形態': 'employmentType',
    '入社日': 'joinDate', '基準割合': 'baseRatio', '月額固定報酬': 'fixedReward',
    '住所': 'address', '生年月日': 'birthDate', '顔写真URL': 'photoUrl',
  };

  runCSVImport((rawObj) => {
    const obj = {};
    Object.entries(rawObj).forEach(([k, v]) => { obj[keyMap[k] || k] = v; });

    const existing = MOCK_DATA.users.find(u => u.staffCode === obj.staffCode);
    if (existing) {
      if (obj.lastName) existing.lastName = obj.lastName;
      if (obj.firstName !== undefined) existing.firstName = obj.firstName;
      if (obj.lastNameKana) existing.lastNameKana = obj.lastNameKana;
      if (obj.firstNameKana !== undefined) existing.firstNameKana = obj.firstNameKana;
      if (obj.name) existing.name = obj.name;
      else existing.name = (existing.lastName || '') + (existing.firstName ? ' ' + existing.firstName : '');
      if (obj.email) existing.email = obj.email;
      if (obj.tel !== undefined) existing.tel = obj.tel;
      if (obj.mobile !== undefined) existing.mobile = obj.mobile;
      if (obj.position !== undefined) existing.position = obj.position;
      if (obj.employmentType) existing.employmentType = obj.employmentType;
      if (obj.joinDate) existing.joinDate = obj.joinDate;
      if (obj.role) existing.role = obj.role;
      if (obj.baseRatio !== undefined) existing.baseRatio = obj.baseRatio ? parseFloat(obj.baseRatio) : existing.baseRatio;
      if (obj.fixedReward !== undefined) existing.fixedReward = obj.fixedReward ? parseInt(obj.fixedReward) : existing.fixedReward;
      if (obj.address !== undefined) existing.address = obj.address;
      if (obj.birthDate !== undefined) existing.birthDate = obj.birthDate;
      if (obj.photoUrl !== undefined) existing.photoUrl = obj.photoUrl;
      return 'updated';
    } else {
      const newId = generateId('u-', MOCK_DATA.users);
      const code = obj.staffCode || 'A' + String(MOCK_DATA.users.length + 1).padStart(3, '0');
      const lastName = obj.lastName || '名称未設定';
      const firstName = obj.firstName || '';
      const name = obj.name || (firstName ? lastName + ' ' + firstName : lastName);
      MOCK_DATA.users.push({
        id: newId, staffCode: code, lastName, firstName,
        lastNameKana: obj.lastNameKana || '', firstNameKana: obj.firstNameKana || '',
        name, email: obj.email || '', tel: obj.tel || '', mobile: obj.mobile || '',
        role: obj.role || 'member', deptId: null,
        team: null, position: obj.position || '', employmentType: obj.employmentType || '正社員',
        joinDate: obj.joinDate || '', memo: '',
        loginId: (obj.email || '').split('@')[0] || '', isActive: true,
        baseRatio: obj.baseRatio ? parseFloat(obj.baseRatio) : null,
        fixedReward: obj.fixedReward ? parseInt(obj.fixedReward) : null,
        address: obj.address || '', birthDate: obj.birthDate || '',
        photoUrl: obj.photoUrl || '', staffFlag: '税務',
      });
      return 'imported';
    }
  }, () => { if (currentPage === 'staff') navigateTo('staff'); });
}

registerPage('staff', renderStaff);
registerPage('staff-detail', renderStaffDetail);
