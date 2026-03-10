// ダミーデータ（モック用）
const MOCK_DATA = {
  currentUser: {
    id: 'u-001',
    name: 'ひろ',
    email: 'hiro@libetax.jp',
    role: 'admin',
    staffCode: 'A001',
  },

  users: [
    { id: 'u-001', staffCode: 'A001', name: 'ひろ', email: 'hiro@libetax.jp', role: 'admin', team: null, isActive: true, baseRatio: null, staffFlag: '他', fixedReward: 700000 },
    { id: 'u-002', staffCode: 'A002', name: '岸田 ゆうこ', email: 'kishida@libetax.jp', role: 'team_leader', team: '第1チーム', isActive: true, baseRatio: null, staffFlag: '他', fixedReward: 350000 },
    { id: 'u-003', staffCode: 'A003', name: '齋藤 太郎', email: 'saito@libetax.jp', role: 'member', team: '第1チーム', isActive: true, baseRatio: 38, staffFlag: '税務' },
    { id: 'u-004', staffCode: 'A004', name: '柿島 花子', email: 'kakishima@libetax.jp', role: 'member', team: '第1チーム', isActive: true, baseRatio: 38, staffFlag: '税務' },
    { id: 'u-005', staffCode: 'A005', name: '谷 次郎', email: 'tani@libetax.jp', role: 'member', team: '第2チーム', isActive: true, baseRatio: 35, staffFlag: '税務' },
    { id: 'u-006', staffCode: 'A006', name: '太田 綾', email: 'ota@libetax.jp', role: 'member', team: '第2チーム', isActive: true, baseRatio: 23, staffFlag: '税務' },
    { id: 'u-007', staffCode: 'A007', name: '野村 健', email: 'nomura@libetax.jp', role: 'member', team: '第2チーム', isActive: true, baseRatio: 15, staffFlag: '税務' },
    { id: 'u-008', staffCode: 'A008', name: '加治 美咲', email: 'kaji@libetax.jp', role: 'member', team: '第1チーム', isActive: true, baseRatio: 25, staffFlag: '記帳' },
    { id: 'u-009', staffCode: 'A009', name: '上野 誠', email: 'ueno@libetax.jp', role: 'team_leader', team: '第2チーム', isActive: true, baseRatio: 32, staffFlag: '税務' },
    { id: 'u-010', staffCode: 'A010', name: '前田 浩二', email: 'maeda@libetax.jp', role: 'member', team: '第1チーム', isActive: false, baseRatio: 30, staffFlag: '税務' },
  ],

  teams: [
    { id: 't-001', name: '第1チーム', leaderId: 'u-002' },
    { id: 't-002', name: '第2チーム', leaderId: 'u-009' },
  ],

  clients: [
    { id: 'c-001', clientCode: '030450', name: '株式会社サンプル商事', clientType: '法人', fiscalMonth: 3, isActive: true, mainUserId: 'u-003', subUserId: 'u-007', mgrUserId: 'u-003', monthlySales: 50000 },
    { id: 'c-002', clientCode: '030451', name: '合同会社テスト工業', clientType: '法人', fiscalMonth: 9, isActive: true, mainUserId: 'u-004', subUserId: null, mgrUserId: 'u-004', monthlySales: 30000 },
    { id: 'c-003', clientCode: '030452', name: '田中 一郎', clientType: '個人', fiscalMonth: 12, isActive: true, mainUserId: 'u-005', subUserId: 'u-006', mgrUserId: 'u-005', monthlySales: 20000 },
    { id: 'c-004', clientCode: '030453', name: '株式会社リベ不動産', clientType: '法人', fiscalMonth: 6, isActive: true, mainUserId: 'u-003', subUserId: null, mgrUserId: 'u-003', monthlySales: 80000 },
    { id: 'c-005', clientCode: '030454', name: '佐藤 二郎', clientType: '個人', fiscalMonth: 12, isActive: true, mainUserId: 'u-006', subUserId: null, mgrUserId: 'u-005', monthlySales: 15000 },
    { id: 'c-006', clientCode: '030455', name: '有限会社グリーンファーム', clientType: '法人', fiscalMonth: 8, isActive: true, mainUserId: 'u-007', subUserId: null, mgrUserId: 'u-003', monthlySales: 25000 },
    { id: 'c-007', clientCode: '030456', name: '株式会社デジタルソリューション', clientType: '法人', fiscalMonth: 12, isActive: true, mainUserId: 'u-004', subUserId: 'u-006', mgrUserId: 'u-004', monthlySales: 100000 },
    { id: 'c-008', clientCode: '030457', name: '山田 花子', clientType: '個人', fiscalMonth: 12, isActive: false, mainUserId: 'u-005', subUserId: null, mgrUserId: 'u-005', monthlySales: 10000 },
    { id: 'c-009', clientCode: '030458', name: '株式会社スカイブルー', clientType: '法人', fiscalMonth: 1, isActive: true, mainUserId: 'u-003', subUserId: 'u-005', mgrUserId: 'u-003', monthlySales: 45000 },
    { id: 'c-010', clientCode: '030459', name: 'NPO法人サポートネット', clientType: '法人', fiscalMonth: 3, isActive: true, mainUserId: 'u-006', subUserId: null, mgrUserId: 'u-009', monthlySales: 18000 },
  ],

  tasks: [
    { id: 'tk-001', clientId: 'c-001', assigneeUserId: 'u-003', title: '法人税確定申告書作成', status: '進行中', dueDate: '2026-03-31', createdAt: '2026-02-15' },
    { id: 'tk-002', clientId: 'c-001', assigneeUserId: 'u-007', title: '消費税申告書作成', status: '未着手', dueDate: '2026-03-31', createdAt: '2026-02-15' },
    { id: 'tk-003', clientId: 'c-002', assigneeUserId: 'u-004', title: '月次記帳チェック（3月）', status: '完了', dueDate: '2026-03-15', createdAt: '2026-03-01' },
    { id: 'tk-004', clientId: 'c-003', assigneeUserId: 'u-005', title: '確定申告書作成', status: '進行中', dueDate: '2026-03-15', createdAt: '2026-01-10' },
    { id: 'tk-005', clientId: 'c-004', assigneeUserId: 'u-003', title: '決算前打ち合わせ', status: '完了', dueDate: '2026-03-01', createdAt: '2026-02-20' },
    { id: 'tk-006', clientId: 'c-005', assigneeUserId: 'u-006', title: '確定申告書作成', status: '差戻し', dueDate: '2026-03-15', createdAt: '2026-01-20' },
    { id: 'tk-007', clientId: 'c-007', assigneeUserId: 'u-004', title: '年末調整（修正対応）', status: '未着手', dueDate: '2026-03-20', createdAt: '2026-03-05' },
    { id: 'tk-008', clientId: 'c-006', assigneeUserId: 'u-007', title: '月次記帳代行（3月）', status: '進行中', dueDate: '2026-03-25', createdAt: '2026-03-01' },
    { id: 'tk-009', clientId: 'c-009', assigneeUserId: 'u-003', title: '法人税確定申告書作成', status: '未着手', dueDate: '2026-03-31', createdAt: '2026-02-01' },
    { id: 'tk-010', clientId: 'c-010', assigneeUserId: 'u-006', title: 'NPO法人決算書作成', status: '進行中', dueDate: '2026-03-31', createdAt: '2026-02-28' },
    { id: 'tk-011', clientId: 'c-001', assigneeUserId: 'u-003', title: '決算報告書レビュー', status: '未着手', dueDate: '2026-04-10', createdAt: '2026-03-10' },
    { id: 'tk-012', clientId: 'c-004', assigneeUserId: 'u-003', title: '中間申告準備', status: '未着手', dueDate: '2026-04-30', createdAt: '2026-03-05' },
  ],

  // Phase 1: 工数データ
  timeEntries: [
    { id: 'te-001', userId: 'u-003', clientId: 'c-001', taskId: 'tk-001', date: '2026-03-07', hours: 3.0, description: '法人税申告書 仕訳確認' },
    { id: 'te-002', userId: 'u-003', clientId: 'c-004', taskId: 'tk-005', date: '2026-03-07', hours: 1.5, description: '決算前打ち合わせ準備' },
    { id: 'te-003', userId: 'u-004', clientId: 'c-002', taskId: 'tk-003', date: '2026-03-07', hours: 2.0, description: '月次記帳チェック' },
    { id: 'te-004', userId: 'u-005', clientId: 'c-003', taskId: 'tk-004', date: '2026-03-07', hours: 4.0, description: '確定申告書 下書き作成' },
    { id: 'te-005', userId: 'u-006', clientId: 'c-005', taskId: 'tk-006', date: '2026-03-07', hours: 2.5, description: '確定申告書 修正対応' },
    { id: 'te-006', userId: 'u-007', clientId: 'c-006', taskId: 'tk-008', date: '2026-03-07', hours: 3.0, description: '月次記帳代行' },
    { id: 'te-007', userId: 'u-003', clientId: 'c-001', taskId: 'tk-001', date: '2026-03-08', hours: 4.0, description: '法人税申告書 ドラフト作成' },
    { id: 'te-008', userId: 'u-003', clientId: 'c-009', taskId: 'tk-009', date: '2026-03-08', hours: 2.0, description: '資料整理' },
    { id: 'te-009', userId: 'u-004', clientId: 'c-007', taskId: 'tk-007', date: '2026-03-08', hours: 3.5, description: '年末調整 修正確認' },
    { id: 'te-010', userId: 'u-006', clientId: 'c-010', taskId: 'tk-010', date: '2026-03-08', hours: 5.0, description: 'NPO決算書 作成' },
    { id: 'te-011', userId: 'u-007', clientId: 'c-001', taskId: 'tk-002', date: '2026-03-08', hours: 2.0, description: '消費税申告 資料準備' },
    { id: 'te-012', userId: 'u-005', clientId: 'c-003', taskId: 'tk-004', date: '2026-03-10', hours: 3.0, description: '確定申告書 最終確認' },
    { id: 'te-013', userId: 'u-003', clientId: 'c-001', taskId: 'tk-001', date: '2026-03-10', hours: 5.0, description: '法人税申告書 最終仕上げ' },
    { id: 'te-014', userId: 'u-008', clientId: 'c-002', taskId: null, date: '2026-03-07', hours: 6.0, description: '記帳代行（3月分）' },
    { id: 'te-015', userId: 'u-008', clientId: 'c-007', taskId: null, date: '2026-03-08', hours: 5.5, description: '記帳代行（3月分）' },
  ],

  // Phase 1: 報告書データ
  reports: [
    { id: 'rp-001', title: '第1チーム 週次報告（3/7）', teamId: 't-001', authorId: 'u-002', createdAt: '2026-03-07T17:00:00', content: '今週の進捗：サンプル商事の法人税申告書は仕訳確認が完了し、ドラフト作成に着手。テスト工業の月次記帳チェックは完了。デジタルソリューションの年末調整修正対応を来週着手予定。', status: '確定' },
    { id: 'rp-002', title: '第2チーム 週次報告（3/7）', teamId: 't-002', authorId: 'u-009', createdAt: '2026-03-07T17:30:00', content: '今週の進捗：田中一郎の確定申告書は下書き完了、来週最終確認。佐藤二郎の確定申告書は差戻し対応中。グリーンファームの月次記帳代行は順調。NPO法人サポートネットの決算書作成に着手。', status: '確定' },
    { id: 'rp-003', title: '第1チーム 週次報告（2/28）', teamId: 't-001', authorId: 'u-002', createdAt: '2026-02-28T17:00:00', content: 'リベ不動産の決算前打ち合わせを完了。サンプル商事の申告書準備を開始。テスト工業の記帳チェックは3月上旬対応予定。', status: '確定' },
    { id: 'rp-004', title: '第2チーム 週次報告（2/28）', teamId: 't-002', authorId: 'u-009', createdAt: '2026-02-28T17:30:00', content: '田中一郎・佐藤二郎の確定申告書作成に本格着手。グリーンファームの記帳代行は2月分完了。NPO法人の決算書準備を開始。', status: '確定' },
  ],

  // Phase 1: 報酬データ（月次）
  rewards: [
    { id: 'rw-001', userId: 'u-003', month: '2026-03', clientId: 'c-001', amount: 19000, type: '税務顧問' },
    { id: 'rw-002', userId: 'u-003', month: '2026-03', clientId: 'c-004', amount: 30400, type: '税務顧問' },
    { id: 'rw-003', userId: 'u-003', month: '2026-03', clientId: 'c-009', amount: 17100, type: '税務顧問' },
    { id: 'rw-004', userId: 'u-004', month: '2026-03', clientId: 'c-002', amount: 11400, type: '税務顧問' },
    { id: 'rw-005', userId: 'u-004', month: '2026-03', clientId: 'c-007', amount: 38000, type: '税務顧問' },
    { id: 'rw-006', userId: 'u-005', month: '2026-03', clientId: 'c-003', amount: 7000, type: '税務顧問' },
    { id: 'rw-007', userId: 'u-006', month: '2026-03', clientId: 'c-005', amount: 3450, type: '税務顧問' },
    { id: 'rw-008', userId: 'u-006', month: '2026-03', clientId: 'c-010', amount: 4140, type: '税務顧問' },
    { id: 'rw-009', userId: 'u-007', month: '2026-03', clientId: 'c-001', amount: 7500, type: '税務顧問' },
    { id: 'rw-010', userId: 'u-007', month: '2026-03', clientId: 'c-006', amount: 3750, type: '税務顧問' },
  ],

  notifications: [
    { id: 'n-001', type: 'task_due', message: '株式会社サンプル商事「法人税確定申告書作成」の期限が3日後です', isRead: false, createdAt: '2026-03-10T09:00:00' },
    { id: 'n-002', type: 'task_assigned', message: '新しいタスク「決算報告書レビュー」が割り当てられました', isRead: false, createdAt: '2026-03-10T08:30:00' },
    { id: 'n-003', type: 'report_created', message: '岸田さんが報告書「第1チーム 週次報告（3/7）」を作成しました', isRead: true, createdAt: '2026-03-07T17:00:00' },
    { id: 'n-004', type: 'task_due', message: '佐藤 二郎「確定申告書作成」が差し戻されています', isRead: false, createdAt: '2026-03-09T10:00:00' },
  ],
};

// ヘルパー関数
function getUserById(id) { return MOCK_DATA.users.find(u => u.id === id); }
function getClientById(id) { return MOCK_DATA.clients.find(c => c.id === id); }
function getTasksByClient(clientId) { return MOCK_DATA.tasks.filter(t => t.clientId === clientId); }
function getTasksByAssignee(userId) { return MOCK_DATA.tasks.filter(t => t.assigneeUserId === userId); }

function getRoleBadge(role) {
  const map = { superadmin: 'SA', admin: '管理者', team_leader: 'TL', member: 'メンバー' };
  return map[role] || role;
}

function getStatusClass(status) {
  const map = { '未着手': 'status-todo', '進行中': 'status-progress', '完了': 'status-done', '差戻し': 'status-returned' };
  return map[status] || '';
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}
