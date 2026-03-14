// ===========================
// チャットマスタ
// ===========================
function renderChatRooms(el) {
  el.innerHTML = `
    <div class="toolbar">
      <input type="text" class="search-input" placeholder="ルーム名・顧客名で検索..." id="cr-search">
      <div class="spacer"></div>
      <button class="btn btn-primary" onclick="openChatRoomModal()">+ ルーム追加</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>ルーム名</th><th>ルームID</th><th>紐づけ顧客</th><th>備考</th><th style="width:60px"></th></tr></thead>
          <tbody id="cr-table-body"></tbody>
        </table>
      </div>
    </div>
    <div class="card" style="margin-top:24px">
      <div class="card-header"><h3>メンション一括コピー</h3></div>
      <div class="card-body">
        <p style="font-size:13px;color:var(--gray-500);margin-bottom:12px;">ルームを選択すると、そのルームに紐づく顧客のChatworkメンションを一括コピーできます。</p>
        <div style="display:flex;gap:12px;align-items:flex-end;">
          <div class="form-group" style="flex:1;margin-bottom:0;">
            <label>対象ルーム</label>
            <select id="cr-mention-room" style="width:100%;padding:8px 12px;border:1px solid var(--gray-300);border-radius:6px;font-size:13px;">
              <option value="">-- ルームを選択 --</option>
              ${MOCK_DATA.chatRooms.map(r => `<option value="${r.id}">${r.roomName}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-secondary" onclick="copyMentions()">メンションをコピー</button>
        </div>
        <pre id="cr-mention-preview" style="margin-top:12px;padding:12px;background:var(--gray-50);border-radius:6px;font-size:12px;white-space:pre-wrap;display:none;"></pre>
      </div>
    </div>
  `;
  renderChatRoomTable();
  bindFilters(['cr-search'], renderChatRoomTable);
  document.getElementById('cr-mention-room').addEventListener('change', previewMentions);
}

function renderChatRoomTable() {
  const search = (document.getElementById('cr-search')?.value || '').toLowerCase();
  let rooms = MOCK_DATA.chatRooms;
  if (search) {
    rooms = rooms.filter(r => {
      if (r.roomName.toLowerCase().includes(search)) return true;
      return r.clientIds.some(cid => {
        const c = getClientById(cid);
        return c && c.name.toLowerCase().includes(search);
      });
    });
  }

  renderTableBody('cr-table-body', rooms, r => {
    const clientNames = r.clientIds.map(cid => {
      const c = getClientById(cid);
      return c ? `<a href="#" onclick="event.preventDefault();navigateTo('client-detail',{id:'${cid}'})">${c.name}</a>` : cid;
    }).join(', ');
    return `<tr>
      <td><strong>${r.roomName}</strong></td>
      <td style="font-family:monospace;font-size:12px;">${r.roomId}</td>
      <td>${clientNames}</td>
      <td style="color:var(--gray-500);font-size:12px;">${r.memo || '-'}</td>
      <td><button class="btn btn-secondary btn-sm" onclick="openChatRoomModal('${r.id}')">編集</button></td>
    </tr>`;
  }, 5);
}

function previewMentions() {
  const roomId = document.getElementById('cr-mention-room').value;
  const pre = document.getElementById('cr-mention-preview');
  if (!roomId) { pre.style.display = 'none'; return; }

  const room = getChatRoomById(roomId);
  if (!room) { pre.style.display = 'none'; return; }

  const mentions = room.clientIds.map(cid => {
    const c = getClientById(cid);
    if (!c || !c.cwAccountId) return null;
    return `[To:${c.cwAccountId}]${c.name}さん`;
  }).filter(Boolean);

  if (mentions.length === 0) {
    pre.textContent = '（CWアカウントIDが設定されている顧客がいません）';
  } else {
    pre.textContent = mentions.join('\n');
  }
  pre.style.display = 'block';
}

function copyMentions() {
  const pre = document.getElementById('cr-mention-preview');
  if (!pre || pre.style.display === 'none' || !pre.textContent) {
    alert('ルームを選択してください');
    return;
  }
  navigator.clipboard.writeText(pre.textContent).then(() => {
    alert('メンションをクリップボードにコピーしました');
  });
}

let editingChatRoomId = null;

function openChatRoomModal(roomId) {
  editingChatRoomId = roomId || null;
  const modal = document.getElementById('chatroom-create-modal');
  const title = document.getElementById('chatroom-modal-title');
  const deleteBtn = document.getElementById('cr-delete-btn');

  // 顧客チェックボックスを生成
  const checkboxes = document.getElementById('cr-client-checkboxes');
  checkboxes.innerHTML = MOCK_DATA.clients.filter(c => c.isActive).map(c =>
    `<label style="display:flex;align-items:center;gap:6px;font-size:13px;padding:4px 0;cursor:pointer;">
      <input type="checkbox" value="${c.id}" class="cr-client-cb"> ${c.name}
      ${c.cwAccountId ? '<span style="font-size:11px;color:var(--gray-400);">(CW: ' + c.cwAccountId + ')</span>' : '<span style="font-size:11px;color:var(--warning);">(CW未設定)</span>'}
    </label>`
  ).join('');

  if (editingChatRoomId) {
    title.textContent = 'チャットルーム編集';
    deleteBtn.style.display = '';
    const r = getChatRoomById(editingChatRoomId);
    if (r) {
      document.getElementById('edit-chatroom-id').value = r.id;
      document.getElementById('new-cr-name').value = r.roomName;
      document.getElementById('new-cr-roomid').value = r.roomId;
      document.getElementById('new-cr-url').value = r.roomUrl;
      document.getElementById('new-cr-memo').value = r.memo || '';
      document.querySelectorAll('.cr-client-cb').forEach(cb => {
        cb.checked = r.clientIds.includes(cb.value);
      });
    }
  } else {
    title.textContent = 'チャットルーム登録';
    deleteBtn.style.display = 'none';
    document.getElementById('edit-chatroom-id').value = '';
    document.getElementById('new-cr-name').value = '';
    document.getElementById('new-cr-roomid').value = '';
    document.getElementById('new-cr-url').value = '';
    document.getElementById('new-cr-memo').value = '';
    document.querySelectorAll('.cr-client-cb').forEach(cb => { cb.checked = false; });
  }

  showModal('chatroom-create-modal');
}

function closeChatRoomModal() {
  hideModal('chatroom-create-modal');
  editingChatRoomId = null;
}

function submitChatRoom() {
  const roomName = getValTrim('new-cr-name');
  const roomId = getValTrim('new-cr-roomid');
  const roomUrl = getValTrim('new-cr-url');
  const memo = getValTrim('new-cr-memo');
  const clientIds = [...document.querySelectorAll('.cr-client-cb:checked')].map(cb => cb.value);

  if (!roomName) { alert('ルーム名を入力してください'); return; }
  if (!roomId) { alert('ルームIDを入力してください'); return; }

  if (editingChatRoomId) {
    const r = getChatRoomById(editingChatRoomId);
    if (r) {
      r.roomName = roomName;
      r.roomId = roomId;
      r.roomUrl = roomUrl || `https://www.chatwork.com/#!rid${roomId}`;
      r.clientIds = clientIds;
      r.memo = memo;
    }
  } else {
    const newId = generateId('cr-', MOCK_DATA.chatRooms);
    MOCK_DATA.chatRooms.push({
      id: newId,
      roomId,
      roomName,
      roomUrl: roomUrl || `https://www.chatwork.com/#!rid${roomId}`,
      clientIds,
      memo,
    });
  }

  closeChatRoomModal();
  if (currentPage === 'chatrooms') navigateTo('chatrooms');
}

function deleteChatRoom() {
  if (!editingChatRoomId) return;
  if (!confirm('このチャットルームを削除しますか？')) return;
  const idx = MOCK_DATA.chatRooms.findIndex(r => r.id === editingChatRoomId);
  if (idx >= 0) MOCK_DATA.chatRooms.splice(idx, 1);
  closeChatRoomModal();
  navigateTo('chatrooms');
}

// ===========================
// 顧客詳細からのルーム紐づけ/解除
// ===========================
function linkRoomToClient(clientId) {
  const select = document.getElementById('link-room-select');
  if (!select || !select.value) { alert('ルームを選択してください'); return; }
  const room = getChatRoomById(select.value);
  if (!room) return;
  if (!room.clientIds.includes(clientId)) {
    room.clientIds.push(clientId);
  }
  navigateTo('client-detail', { id: clientId });
}

function unlinkRoomFromClient(roomId, clientId) {
  const room = getChatRoomById(roomId);
  if (!room) return;
  room.clientIds = room.clientIds.filter(id => id !== clientId);
  navigateTo('client-detail', { id: clientId });
}

registerPage('chatrooms', renderChatRooms);
