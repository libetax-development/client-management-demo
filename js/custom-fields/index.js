// ===========================
// カスタムフィールド設定
// ===========================
function openCustomFieldModal() {
  showModal('custom-field-modal');
  renderCustomFieldList();
}

function closeCustomFieldModal() {
  hideModal('custom-field-modal');
  // 詳細ページを再描画
  if (currentPage === 'client-detail') {
    const hash = location.hash.slice(1);
    const [page, id] = hash.split('/');
    if (id) navigateTo('client-detail', { id });
  }
}

function renderCustomFieldList() {
  if (!MOCK_DATA.customFields) MOCK_DATA.customFields = [];
  const fields = MOCK_DATA.customFields.slice().sort((a, b) => a.order - b.order);
  const container = document.getElementById('cf-field-list');
  const typeLabels = { text: 'テキスト', number: '数値', date: '日付', select: '選択肢', textarea: 'テキストエリア' };

  container.innerHTML = fields.length === 0
    ? '<div style="padding:12px;color:var(--gray-400);font-size:13px;">カスタムフィールドがありません</div>'
    : fields.map(cf => `
      <div class="cf-row" draggable="true" data-cf-id="${cf.id}">
        <span class="cf-handle">&#9776;</span>
        <span class="cf-name" id="cf-name-display-${cf.id}">${cf.name}</span>
        <span class="cf-type">${typeLabels[cf.type] || cf.type}</span>
        <div class="cf-actions">
          <button class="btn btn-secondary btn-sm" onclick="editCustomFieldName('${cf.id}')">編集</button>
          <button class="btn btn-sm" style="color:var(--danger);background:none;border:none;cursor:pointer;" onclick="deleteCustomField('${cf.id}')">削除</button>
        </div>
      </div>
    `).join('');

  // ドラッグ&ドロップ設定
  initCustomFieldDragDrop();
}

function initCustomFieldDragDrop() {
  const container = document.getElementById('cf-field-list');
  const rows = container.querySelectorAll('.cf-row');
  let draggedEl = null;

  rows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      draggedEl = row;
      row.classList.add('cf-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', row.dataset.cfId);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('cf-dragging');
      rows.forEach(r => r.classList.remove('cf-drag-over'));
      draggedEl = null;
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedEl && draggedEl !== row) {
        row.classList.add('cf-drag-over');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('cf-drag-over');
    });

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('cf-drag-over');
      if (!draggedEl || draggedEl === row) return;

      const draggedId = draggedEl.dataset.cfId;
      const targetId = row.dataset.cfId;

      // 並び替え
      const fields = MOCK_DATA.customFields.slice().sort((a, b) => a.order - b.order);
      const draggedIdx = fields.findIndex(f => f.id === draggedId);
      const targetIdx = fields.findIndex(f => f.id === targetId);

      if (draggedIdx < 0 || targetIdx < 0) return;

      const [moved] = fields.splice(draggedIdx, 1);
      fields.splice(targetIdx, 0, moved);

      // order を再割り当て
      fields.forEach((f, i) => { f.order = i + 1; });

      renderCustomFieldList();
    });
  });
}

function addCustomField() {
  const nameInput = document.getElementById('cf-new-name');
  const typeSelect = document.getElementById('cf-new-type');
  const name = nameInput.value.trim();
  const type = typeSelect.value;
  if (!name) { alert('フィールド名を入力してください'); return; }

  if (!MOCK_DATA.customFields) MOCK_DATA.customFields = [];
  const maxOrder = MOCK_DATA.customFields.reduce((m, f) => Math.max(m, f.order), 0);
  const maxNum = MOCK_DATA.customFields.reduce((m, f) => {
    const n = parseInt(f.id.replace('cf-', ''));
    return Math.max(m, n);
  }, 0);
  const newId = 'cf-' + String(maxNum + 1).padStart(3, '0');

  MOCK_DATA.customFields.push({ id: newId, name, type, order: maxOrder + 1 });
  nameInput.value = '';
  typeSelect.value = 'text';
  renderCustomFieldList();
}

function editCustomFieldName(cfId) {
  const cf = MOCK_DATA.customFields.find(f => f.id === cfId);
  if (!cf) return;
  const newName = prompt('新しいフィールド名を入力してください', cf.name);
  if (!newName || !newName.trim()) return;
  cf.name = newName.trim();
  renderCustomFieldList();
}

function deleteCustomField(cfId) {
  if (!confirm('このカスタムフィールドを削除しますか？\n全顧客のこの項目の値も削除されます。')) return;
  MOCK_DATA.customFields = MOCK_DATA.customFields.filter(f => f.id !== cfId);
  // 全顧客からこのフィールドの値を削除
  MOCK_DATA.clients.forEach(c => {
    if (c.customFieldValues) delete c.customFieldValues[cfId];
  });
  renderCustomFieldList();
}
