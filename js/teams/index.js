// ===========================
// チーム管理
// ===========================
function renderTeams(el) {
  el.innerHTML = `
    <div class="toolbar">
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openTeamCreateModal()">+ 新規チーム</button>
    </div>
    <div id="teams-grid" class="pg-grid"></div>
  `;
  renderTeamCards();
}

function renderTeamCards() {
  const container = document.getElementById('teams-grid');
  if (!container) return;
  const teams = MOCK_DATA.teams;

  if (teams.length === 0) {
    container.innerHTML = renderEmptyState('チームはありません');
    return;
  }

  container.innerHTML = teams.map(team => {
    const members = getTeamMembers(team.id);
    const leader = members.find(m => m.role === 'leader');
    const leaderUser = leader ? getUserById(leader.userId) : null;
    const memberUsers = members.filter(m => m.role === 'member').map(m => getUserById(m.userId)).filter(Boolean);

    return `
      <div class="card">
        <div class="card-header">
          <h3>${escapeHtml(team.name)}</h3>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick="openTeamEditModal('${team.id}')">編集</button>
          </div>
        </div>
        <div class="card-body">
          <div class="detail-row">
            <div class="detail-label">リーダー</div>
            <div class="detail-value">${leaderUser ? escapeHtml(leaderUser.name) : '-'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">メンバー数</div>
            <div class="detail-value">${members.length}名</div>
          </div>
          <div style="margin-top:12px;">
            <div style="font-size:12px;font-weight:600;color:var(--gray-500);margin-bottom:8px;">メンバー一覧</div>
            ${members.map(m => {
              const u = getUserById(m.userId);
              if (!u) return '';
              return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--gray-100);">
                <div style="width:28px;height:28px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">${escapeHtml(u.name[0] || '')}</div>
                <div style="flex:1;font-size:13px;">${escapeHtml(u.name)}</div>
                <span style="font-size:11px;color:var(--gray-500);">${m.role === 'leader' ? 'リーダー' : 'メンバー'}</span>
                <button class="btn-icon" onclick="removeTeamMember('${team.id}','${m.id}')" title="削除" style="font-size:14px;color:var(--gray-400);">&times;</button>
              </div>`;
            }).join('')}
            <div style="display:flex;gap:8px;margin-top:8px;">
              <select id="team-add-member-${team.id}" class="filter-select" style="flex:1;font-size:12px;">
                <option value="">職員を選択...</option>
                ${getActiveUsers().filter(u => !members.some(m => m.userId === u.id)).map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('')}
              </select>
              <select id="team-add-role-${team.id}" class="filter-select" style="font-size:12px;">
                <option value="member">メンバー</option>
                <option value="leader">リーダー</option>
              </select>
              <button class="btn btn-secondary btn-sm" onclick="addTeamMember('${team.id}')">追加</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function removeTeamMember(teamId, memberId) {
  const member = MOCK_DATA.teamMembers.find(m => m.id === memberId);
  const user = member ? getUserById(member.userId) : null;
  if (!confirm(`メンバー「${user ? user.name : memberId}」をチームから削除しますか？\nこの操作は取り消せません。`)) return;
  const idx = MOCK_DATA.teamMembers.findIndex(m => m.id === memberId);
  if (idx >= 0) MOCK_DATA.teamMembers.splice(idx, 1);
  renderTeamCards();
}

function addTeamMember(teamId) {
  const userId = document.getElementById('team-add-member-' + teamId)?.value;
  const role = document.getElementById('team-add-role-' + teamId)?.value || 'member';
  if (!userId) { alert('職員を選択してください'); return; }

  MOCK_DATA.teamMembers.push({
    id: generateId('tm-', MOCK_DATA.teamMembers),
    teamId, userId, role,
  });
  renderTeamCards();
}

// ===========================
// チーム作成/編集モーダル
// ===========================
function openTeamCreateModal() {
  document.getElementById('team-modal-title').textContent = '新規チーム作成';
  document.getElementById('team-edit-id').value = '';
  resetForm(['team-edit-name']);
  showModal('team-edit-modal');
}

function openTeamEditModal(teamId) {
  const team = MOCK_DATA.teams.find(t => t.id === teamId);
  if (!team) return;
  document.getElementById('team-modal-title').textContent = 'チーム編集';
  document.getElementById('team-edit-id').value = team.id;
  document.getElementById('team-edit-name').value = team.name;
  showModal('team-edit-modal');
}

function submitTeam() {
  const id = document.getElementById('team-edit-id').value;
  const name = getValTrim('team-edit-name');
  if (!name) { alert('チーム名を入力してください'); return; }

  if (id) {
    const team = MOCK_DATA.teams.find(t => t.id === id);
    if (team) team.name = name;
  } else {
    MOCK_DATA.teams.push({
      id: generateId('team-', MOCK_DATA.teams),
      name, leaderId: null,
    });
  }
  hideModal('team-edit-modal');
  if (currentPage === 'teams') renderTeamCards();
}

registerPage('teams', renderTeams);
