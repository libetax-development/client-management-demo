// ダミーデータ（モック用）
const MOCK_DATA = {
  currentUser: {
    id: 'u-001',
    name: 'ひろ',
    email: 'hiro@libetax.jp',
    role: 'admin',
    staffCode: 'A001',
  },

  departments: [
    { deptId: 1, deptName: '税務1課', deptCode: 'TAX1', parentDeptId: null, sortOrder: 1, status: 1 },
    { deptId: 2, deptName: '税務2課', deptCode: 'TAX2', parentDeptId: null, sortOrder: 2, status: 1 },
    { deptId: 3, deptName: '記帳代行課', deptCode: 'BK', parentDeptId: null, sortOrder: 3, status: 1 },
    { deptId: 4, deptName: '管理部', deptCode: 'ADM', parentDeptId: null, sortOrder: 4, status: 1 },
  ],

  office: {
    aoId: 1, aoName: 'リベ大税理士法人', aoCode: 'LIBETAX',
    address: '大阪府大阪市北区梅田1-1-1 リベビル5F', tel: '06-1234-5678', email: 'info@libetax.jp',
    logoPath: '', logoutTime: 30,
  },

  securitySettings: {
    allowedIpList: '', maxLoginAttempts: 5, lockoutDuration: 30,
    sessionTimeout: 30, passwordMinLength: 8, passwordRequireNumber: 1, passwordRequireSymbol: 0,
  },

  users: [
    { id: 'u-001', staffCode: 'A001', lastName: 'ひろ', firstName: '', lastNameKana: 'ヒロ', firstNameKana: '', name: 'ひろ', email: 'hiro@libetax.jp', tel: '06-1234-5678', mobile: '090-1111-0001', role: 'admin', deptId: 4, team: null, position: '代表', employmentType: '正社員', joinDate: '2023-04-01', memo: '', loginId: 'hiro', isActive: true, baseRatio: null, staffFlag: '他', fixedReward: 700000 },
    { id: 'u-002', staffCode: 'A002', lastName: '岸田', firstName: 'ゆうこ', lastNameKana: 'キシダ', firstNameKana: 'ユウコ', name: '岸田 ゆうこ', email: 'kishida@libetax.jp', tel: '', mobile: '090-1111-0002', role: 'team_leader', deptId: 1, team: '第1チーム', position: 'チームリーダー', employmentType: '正社員', joinDate: '2023-06-01', memo: '', loginId: 'kishida', isActive: true, baseRatio: null, staffFlag: '他', fixedReward: 350000 },
    { id: 'u-003', staffCode: 'A003', lastName: '齋藤', firstName: '太郎', lastNameKana: 'サイトウ', firstNameKana: 'タロウ', name: '齋藤 太郎', email: 'saito@libetax.jp', tel: '', mobile: '090-1111-0003', role: 'member', deptId: 1, team: '第1チーム', position: '税理士', employmentType: '正社員', joinDate: '2023-08-01', memo: '', loginId: 'saito', isActive: true, baseRatio: 38, staffFlag: '税務' },
    { id: 'u-004', staffCode: 'A004', lastName: '柿島', firstName: '花子', lastNameKana: 'カキシマ', firstNameKana: 'ハナコ', name: '柿島 花子', email: 'kakishima@libetax.jp', tel: '', mobile: '090-1111-0004', role: 'member', deptId: 1, team: '第1チーム', position: '税理士', employmentType: '正社員', joinDate: '2023-10-01', memo: '', loginId: 'kakishima', isActive: true, baseRatio: 38, staffFlag: '税務' },
    { id: 'u-005', staffCode: 'A005', lastName: '谷', firstName: '次郎', lastNameKana: 'タニ', firstNameKana: 'ジロウ', name: '谷 次郎', email: 'tani@libetax.jp', tel: '', mobile: '090-1111-0005', role: 'member', deptId: 2, team: '第2チーム', position: '税理士', employmentType: '正社員', joinDate: '2024-01-15', memo: '', loginId: 'tani', isActive: true, baseRatio: 35, staffFlag: '税務' },
    { id: 'u-006', staffCode: 'A006', lastName: '太田', firstName: '綾', lastNameKana: 'オオタ', firstNameKana: 'アヤ', name: '太田 綾', email: 'ota@libetax.jp', tel: '', mobile: '090-1111-0006', role: 'member', deptId: 2, team: '第2チーム', position: 'スタッフ', employmentType: 'パート', joinDate: '2024-04-01', memo: '週3日勤務', loginId: 'ota', isActive: true, baseRatio: 23, staffFlag: '税務' },
    { id: 'u-007', staffCode: 'A007', lastName: '野村', firstName: '健', lastNameKana: 'ノムラ', firstNameKana: 'ケン', name: '野村 健', email: 'nomura@libetax.jp', tel: '', mobile: '090-1111-0007', role: 'member', deptId: 2, team: '第2チーム', position: 'スタッフ', employmentType: '正社員', joinDate: '2024-07-01', memo: '', loginId: 'nomura', isActive: true, baseRatio: 15, staffFlag: '税務' },
    { id: 'u-008', staffCode: 'A008', lastName: '加治', firstName: '美咲', lastNameKana: 'カジ', firstNameKana: 'ミサキ', name: '加治 美咲', email: 'kaji@libetax.jp', tel: '', mobile: '090-1111-0008', role: 'member', deptId: 3, team: '第1チーム', position: 'スタッフ', employmentType: '正社員', joinDate: '2024-09-01', memo: '', loginId: 'kaji', isActive: true, baseRatio: 25, staffFlag: '記帳' },
    { id: 'u-009', staffCode: 'A009', lastName: '上野', firstName: '誠', lastNameKana: 'ウエノ', firstNameKana: 'マコト', name: '上野 誠', email: 'ueno@libetax.jp', tel: '', mobile: '090-1111-0009', role: 'team_leader', deptId: 2, team: '第2チーム', position: 'チームリーダー', employmentType: '正社員', joinDate: '2023-06-01', memo: '', loginId: 'ueno', isActive: true, baseRatio: 32, staffFlag: '税務' },
    { id: 'u-010', staffCode: 'A010', lastName: '前田', firstName: '浩二', lastNameKana: 'マエダ', firstNameKana: 'コウジ', name: '前田 浩二', email: 'maeda@libetax.jp', tel: '', mobile: '090-1111-0010', role: 'member', deptId: 1, team: '第1チーム', position: 'スタッフ', employmentType: '正社員', joinDate: '2024-03-01', memo: '2025年12月退職', loginId: 'maeda', isActive: false, baseRatio: 30, staffFlag: '税務' },
  ],

  teams: [
    { id: 't-001', name: '第1チーム', leaderId: 'u-002' },
    { id: 't-002', name: '第2チーム', leaderId: 'u-009' },
  ],

  clients: [
    { id: 'c-001', clientCode: '030450', name: '株式会社サンプル商事', clientType: '法人', fiscalMonth: 3, isActive: true, mainUserId: 'u-003', subUserId: 'u-007', mgrUserId: 'u-003', monthlySales: 50000, annualFee: 150000, spotFees: [{id:'sf-001', timing:'2026-05', amount:100000, description:'株価算定'}], address: '東京都千代田区大手町1-1-1', tel: '03-1234-5001', representative: '山本 太郎', establishDate: '2010-05-20', industry: '卸売業', taxOffice: '千代田税務署', memo: '', cwAccountId: '1234001', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000001', name:'【リベ税】株式会社サンプル商事'}], relatedClientIds: ['c-003'], customFieldValues: { 'cf-001': 'MK-12345', 'cf-002': '2023-04-01', 'cf-003': '優良顧客。毎月定例ミーティングあり。' } },
    { id: 'c-002', clientCode: '030451', name: '合同会社テスト工業', clientType: '法人', fiscalMonth: 9, isActive: true, mainUserId: 'u-004', subUserId: null, mgrUserId: 'u-004', monthlySales: 30000, annualFee: 0, spotFees: [], address: '大阪府大阪市中央区本町2-2-2', tel: '06-1234-5002', representative: '鈴木 一郎', establishDate: '2015-03-10', industry: '製造業', taxOffice: '東税務署', memo: '', cwAccountId: '1234002', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000002', name:'【リベ税】合同会社テスト工業'}], relatedClientIds: [], customFieldValues: { 'cf-001': 'MK-67890', 'cf-002': '2024-01-15' } },
    { id: 'c-003', clientCode: '030452', name: '田中 一郎', clientType: '個人', fiscalMonth: 12, isActive: true, mainUserId: 'u-005', subUserId: 'u-006', mgrUserId: 'u-005', monthlySales: 20000, annualFee: 0, spotFees: [], address: '愛知県名古屋市中区栄3-3-3', tel: '052-1234-5003', representative: '', establishDate: '', industry: '不動産賃貸', taxOffice: '名古屋中税務署', memo: '不動産所得あり', cwAccountId: '1234003', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000003', name:'【リベ税】田中一郎'}], relatedClientIds: ['c-001'] },
    { id: 'c-004', clientCode: '030453', name: '株式会社リベ不動産', clientType: '法人', fiscalMonth: 6, isActive: true, mainUserId: 'u-003', subUserId: null, mgrUserId: 'u-003', monthlySales: 80000, annualFee: 200000, spotFees: [{id:'sf-002', timing:'2026-08', amount:150000, description:'相続税申告'}, {id:'sf-003', timing:'2026-04-15', amount:50000, description:'議事録作成'}], address: '大阪府大阪市北区梅田1-4-4', tel: '06-1234-5004', representative: '高橋 花子', establishDate: '2018-01-15', industry: '不動産業', taxOffice: '北税務署', memo: '', cwAccountId: '1234004', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000004', name:'【リベ税】株式会社リベ不動産'}], relatedClientIds: [], customFieldValues: { 'cf-001': 'MK-11111', 'cf-002': '2023-06-01', 'cf-003': '不動産管理メイン。決算前にヒアリング必要。' } },
    { id: 'c-005', clientCode: '030454', name: '佐藤 二郎', clientType: '個人', fiscalMonth: 12, isActive: true, mainUserId: 'u-006', subUserId: null, mgrUserId: 'u-005', monthlySales: 15000, annualFee: 0, spotFees: [], address: '福岡県福岡市博多区博多駅前5-5-5', tel: '092-1234-5005', representative: '', establishDate: '', industry: 'フリーランス（IT）', taxOffice: '博多税務署', memo: '', cwAccountId: '', cwRoomUrls: [], relatedClientIds: [] },
    { id: 'c-006', clientCode: '030455', name: '有限会社グリーンファーム', clientType: '法人', fiscalMonth: 8, isActive: true, mainUserId: 'u-007', subUserId: null, mgrUserId: 'u-003', monthlySales: 25000, annualFee: 0, spotFees: [], address: '北海道札幌市中央区北1条6-6-6', tel: '011-1234-5006', representative: '田村 健太', establishDate: '2005-09-01', industry: '農業', taxOffice: '札幌中税務署', memo: '', cwAccountId: '1234006', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000005', name:'【リベ税】有限会社グリーンファーム'}], relatedClientIds: [] },
    { id: 'c-007', clientCode: '030456', name: '株式会社デジタルソリューション', clientType: '法人', fiscalMonth: 12, isActive: true, mainUserId: 'u-004', subUserId: 'u-006', mgrUserId: 'u-004', monthlySales: 100000, annualFee: 0, spotFees: [], address: '東京都渋谷区渋谷2-7-7', tel: '03-1234-5007', representative: '中村 誠', establishDate: '2020-02-14', industry: 'IT・ソフトウェア', taxOffice: '渋谷税務署', memo: '顧問契約プレミアムプラン', cwAccountId: '1234007', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000006', name:'【リベ税】デジタルソリューション'}], relatedClientIds: [], customFieldValues: { 'cf-001': 'MK-99999', 'cf-003': 'プレミアムプラン。月2回面談。' } },
    { id: 'c-008', clientCode: '030457', name: '山田 花子', clientType: '個人', fiscalMonth: 12, isActive: false, mainUserId: 'u-005', subUserId: null, mgrUserId: 'u-005', monthlySales: 10000, annualFee: 0, spotFees: [], address: '京都府京都市左京区8-8-8', tel: '075-1234-5008', representative: '', establishDate: '', industry: '小売業', taxOffice: '左京税務署', memo: '2025年解約済み', cwAccountId: '', cwRoomUrls: [], relatedClientIds: [] },
    { id: 'c-009', clientCode: '030458', name: '株式会社スカイブルー', clientType: '法人', fiscalMonth: 1, isActive: true, mainUserId: 'u-003', subUserId: 'u-005', mgrUserId: 'u-003', monthlySales: 45000, annualFee: 0, spotFees: [], address: '神奈川県横浜市西区みなとみらい9-9-9', tel: '045-1234-5009', representative: '木村 翔', establishDate: '2019-11-01', industry: 'サービス業', taxOffice: '横浜中税務署', memo: '', cwAccountId: '1234009', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000007', name:'【リベ税】スカイブルー'}], relatedClientIds: [] },
    { id: 'c-010', clientCode: '030459', name: 'NPO法人サポートネット', clientType: '法人', fiscalMonth: 3, isActive: true, mainUserId: 'u-006', subUserId: null, mgrUserId: 'u-009', monthlySales: 18000, annualFee: 0, spotFees: [], address: '兵庫県神戸市中央区三宮10-10-10', tel: '078-1234-5010', representative: '佐々木 みどり', establishDate: '2012-06-30', industry: 'NPO・福祉', taxOffice: '神戸税務署', memo: '', cwAccountId: '1234010', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000008', name:'【リベ税】NPOサポートネット'}], relatedClientIds: [] },
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

  // Phase 1: 進捗管理表
  progressSheets: [
    {
      id: 'ps-001', name: '年末調整管理表', category: '年末調整', status: '利用中',
      managerId: 'u-002', createdAt: '2025-11-01',
      columns: ['年末調整', '源泉所得税', '総括表（給与支払報告書）', '法定調書', '償却資産'],
      targets: [
        { clientId: 'c-001', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '完了', '償却資産': '完了' }, note: '' },
        { clientId: 'c-002', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '進行中', '償却資産': '未着手' }, note: '法定調書の資料待ち' },
        { clientId: 'c-004', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '完了', '償却資産': '完了' }, note: '' },
        { clientId: 'c-006', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '進行中', '法定調書': '未着手', '償却資産': '未着手' }, note: '' },
        { clientId: 'c-007', steps: { '年末調整': '差戻し', '源泉所得税': '未着手', '総括表（給与支払報告書）': '未着手', '法定調書': '未着手', '償却資産': '未着手' }, note: '修正対応中' },
        { clientId: 'c-009', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '完了', '償却資産': '進行中' }, note: '' },
        { clientId: 'c-010', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '完了', '償却資産': '完了' }, note: '' },
      ],
    },
    {
      id: 'ps-002', name: '確定申告管理表（R7）', category: '確定申告', status: '利用中',
      managerId: 'u-009', createdAt: '2026-01-10',
      columns: ['資料回収', '記帳確認', '申告書作成', 'レビュー', '電子申告', '納品'],
      targets: [
        { clientId: 'c-003', steps: { '資料回収': '完了', '記帳確認': '完了', '申告書作成': '進行中', 'レビュー': '未着手', '電子申告': '未着手', '納品': '未着手' }, note: '3/15期限' },
        { clientId: 'c-005', steps: { '資料回収': '完了', '記帳確認': '完了', '申告書作成': '差戻し', 'レビュー': '未着手', '電子申告': '未着手', '納品': '未着手' }, note: '差戻し対応中' },
        { clientId: 'c-008', steps: { '資料回収': '完了', '記帳確認': '完了', '申告書作成': '完了', 'レビュー': '完了', '電子申告': '完了', '納品': '完了' }, note: '完了済み' },
      ],
    },
    {
      id: 'ps-003', name: '3月決算法人管理表', category: '法人決算', status: '利用中',
      managerId: 'u-002', createdAt: '2026-02-01',
      columns: ['資料回収', '記帳確認', '決算整理', '申告書作成', 'レビュー', '電子申告', '納品'],
      targets: [
        { clientId: 'c-001', steps: { '資料回収': '進行中', '記帳確認': '未着手', '決算整理': '未着手', '申告書作成': '未着手', 'レビュー': '未着手', '電子申告': '未着手', '納品': '未着手' }, note: '5月末期限' },
        { clientId: 'c-010', steps: { '資料回収': '進行中', '記帳確認': '未着手', '決算整理': '未着手', '申告書作成': '未着手', 'レビュー': '未着手', '電子申告': '未着手', '納品': '未着手' }, note: 'NPO法人' },
      ],
    },
    {
      id: 'ps-004', name: '年末調整管理表（R6）', category: '年末調整', status: '終了',
      managerId: 'u-002', createdAt: '2024-11-01',
      columns: ['年末調整', '源泉所得税', '総括表', '法定調書', '償却資産'],
      targets: [],
    },
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
    { id: 'rp-001', createdAt: '2026-03-10T10:30:00', authorId: 'u-008', type: '業務報告書', category: '月次業務', clientName: '合同会社WANT', title: '月次報告／合同会社WANT／月次業務／1月度', rank: 'B', readStatus: '一時保存中', hasAttachment: false },
    { id: 'rp-002', createdAt: '2026-03-09T16:00:00', authorId: 'u-004', type: '業務報告書', category: '確定申告', clientName: '角井 仁', title: '角井 仁／【確定申告】会計チェック', rank: 'B', readStatus: '未読', hasAttachment: false },
    { id: 'rp-003', createdAt: '2026-03-09T15:30:00', authorId: 'u-004', type: '業務報告書', category: '確定申告', clientName: '桑原 健介', title: '桑原 健介／【確定申告】会計チェック', rank: 'B', readStatus: '一時保存中', hasAttachment: false },
    { id: 'rp-004', createdAt: '2026-03-09T15:00:00', authorId: 'u-004', type: '業務報告書', category: '確定申告', clientName: '高見 祐介', title: '高見 祐介／【確定申告】会計チェック', rank: 'B', readStatus: '未読', hasAttachment: false },
    { id: 'rp-005', createdAt: '2026-03-09T14:00:00', authorId: 'u-003', type: '業務報告書', category: 'その他', clientName: '株式会社CRAT', title: '株式会社CRAT／zoom面談', rank: 'A', readStatus: '未読', hasAttachment: false },
    { id: 'rp-006', createdAt: '2026-03-09T11:00:00', authorId: 'u-005', type: '業務報告書', category: '決算業務', clientName: '小松　和幸', title: '【確定申告】会計帳簿チェック／小松　和幸／決算業務／納先生 確定申告書（スポット）チェック', rank: 'A', readStatus: '未読', hasAttachment: false },
    { id: 'rp-007', createdAt: '2026-03-09T10:30:00', authorId: 'u-005', type: '業務報告書', category: '決算業務', clientName: '谷口　哲也', title: '【確定申告】会計帳簿チェック／谷口　哲也／決算業務／納先生 会計帳簿チェック', rank: 'A', readStatus: '未読', hasAttachment: false },
    { id: 'rp-008', createdAt: '2026-03-08T17:00:00', authorId: 'u-003', type: '業務報告書', category: '決算業務', clientName: '豊田奈美　mcストア', title: '【確定申告】会計帳簿チェック／豊田奈美　mcストア／決算業務／むらっち先生に帳簿チェック依頼', rank: 'B', readStatus: '未読', hasAttachment: false },
    { id: 'rp-009', createdAt: '2026-03-08T16:30:00', authorId: 'u-007', type: '業務報告書', category: '決算業務', clientName: '岩井裕之', title: '【確定申告】会計帳簿チェック／岩井裕之／決算業務', rank: 'B', readStatus: '未読', hasAttachment: false },
    { id: 'rp-010', createdAt: '2026-03-08T16:00:00', authorId: 'u-007', type: '業務報告書', category: '決算業務', clientName: '加藤洋一', title: '【確定申告】会計帳簿チェック／加藤洋一／決算業務', rank: 'B', readStatus: '未読', hasAttachment: false },
    { id: 'rp-011', createdAt: '2026-03-08T15:30:00', authorId: 'u-007', type: '業務報告書', category: '決算業務', clientName: '来馬健太', title: '【確定申告】会計帳簿チェック／来馬健太', rank: 'C', readStatus: '未読', hasAttachment: false },
    { id: 'rp-012', createdAt: '2026-03-08T15:00:00', authorId: 'u-006', type: '業務報告書', category: 'その他', clientName: '足助川合自動車株式会社', title: '足助川合自動車株式会社／その他／ 【照井】川合さま　ミーティング', rank: 'A', readStatus: '未読', hasAttachment: false },
    { id: 'rp-013', createdAt: '2026-03-08T14:00:00', authorId: 'u-009', type: '業務報告書', category: '確定申告', clientName: '黄　昭然', title: '【確定申告】会計帳簿チェック／黄　昭然', rank: 'B', readStatus: '未読', hasAttachment: true },
    { id: 'rp-014', createdAt: '2026-03-08T13:30:00', authorId: 'u-009', type: '業務報告書', category: '確定申告', clientName: '山縣雄輔', title: '【確定申告】会計帳簿チェック／山縣雄輔／令和7年分確定申告', rank: 'B', readStatus: '未読', hasAttachment: false },
    { id: 'rp-015', createdAt: '2026-03-08T12:00:00', authorId: 'u-008', type: '業務報告書', category: '決算業務', clientName: 'kurashi-goto合同会社', title: '【新】消費税検討／kurashi-goto合同会社／決算業務／令和９年３月期　消費税検討', rank: 'A', readStatus: '未読', hasAttachment: true },
    { id: 'rp-016', createdAt: '2026-03-07T17:00:00', authorId: 'u-003', type: '業務報告書', category: '決算業務', clientName: '石橋廣樹', title: '【確定申告】会計帳簿チェック／石橋廣樹／決算業務／決算帳簿チェック、仕訳修正等、納先生にチェック依頼', rank: 'B', readStatus: '未読', hasAttachment: false },
    { id: 'rp-017', createdAt: '2026-03-07T16:30:00', authorId: 'u-003', type: '業務報告書', category: '決算業務', clientName: '安永雅史', title: '【確定申告】会計帳簿チェック／安永雅史／決算業務／納先生に帳簿チェック依頼', rank: 'B', readStatus: '未読', hasAttachment: false },
    { id: 'rp-018', createdAt: '2026-03-07T16:00:00', authorId: 'u-007', type: '業務報告書', category: '決算業務', clientName: '北澤聖士', title: '【確定申告】会計帳簿チェック／北澤聖士／決算業務', rank: 'C', readStatus: '一時保存中', hasAttachment: false },
    { id: 'rp-019', createdAt: '2026-03-07T15:30:00', authorId: 'u-007', type: '業務報告書', category: '決算業務', clientName: '山本敬之', title: '【確定申告】会計帳簿チェック／山本敬之／決算業務', rank: 'B', readStatus: '未読', hasAttachment: false },
    { id: 'rp-020', createdAt: '2026-03-07T15:00:00', authorId: 'u-006', type: '業務報告書', category: 'その他', clientName: '庭山 勇気', title: '庭山 勇気／その他／【水谷・照井】庭山さま　ミーティング', rank: 'A', readStatus: '未読', hasAttachment: false },
    { id: 'rp-021', createdAt: '2026-03-07T10:00:00', authorId: 'u-002', type: '日報', category: '日報', clientName: '', title: '3/7 業務日報', rank: '日報', readStatus: '既読', hasAttachment: false },
    { id: 'rp-022', createdAt: '2026-03-06T18:00:00', authorId: 'u-004', type: '業務報告書', category: '月次業務', clientName: '株式会社デジタルソリューション', title: '月次報告／株式会社デジタルソリューション／月次業務／2月度', rank: 'A', readStatus: '既読', hasAttachment: true },
    { id: 'rp-023', createdAt: '2026-03-06T17:00:00', authorId: 'u-005', type: '業務報告書', category: '決算業務', clientName: '田中 一郎', title: '【確定申告】会計帳簿チェック／田中 一郎／決算業務', rank: 'B', readStatus: '既読', hasAttachment: false },
    { id: 'rp-024', createdAt: '2026-03-06T10:00:00', authorId: 'u-009', type: '日報', category: '日報', clientName: '', title: '3/6 業務日報', rank: '日報', readStatus: '既読', hasAttachment: false },
    { id: 'rp-025', createdAt: '2026-03-05T16:00:00', authorId: 'u-003', type: '業務報告書', category: '決算業務', clientName: '株式会社サンプル商事', title: '株式会社サンプル商事／決算業務／法人税申告書 仕訳確認着手', rank: 'A', readStatus: '既読', hasAttachment: false },
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

  // チャットマスタ（Chatworkルーム）
  chatRooms: [
    { id: 'cr-001', roomId: '300000001', roomName: '【リベ税】株式会社サンプル商事', roomUrl: 'https://www.chatwork.com/#!rid300000001', clientIds: ['c-001'], memo: '' },
    { id: 'cr-002', roomId: '300000002', roomName: '【リベ税】合同会社テスト工業', roomUrl: 'https://www.chatwork.com/#!rid300000002', clientIds: ['c-002'], memo: '' },
    { id: 'cr-003', roomId: '300000003', roomName: '【リベ税】田中一郎', roomUrl: 'https://www.chatwork.com/#!rid300000003', clientIds: ['c-003'], memo: '' },
    { id: 'cr-004', roomId: '300000004', roomName: '【リベ税】株式会社リベ不動産', roomUrl: 'https://www.chatwork.com/#!rid300000004', clientIds: ['c-004'], memo: '' },
    { id: 'cr-005', roomId: '300000005', roomName: '【リベ税】有限会社グリーンファーム', roomUrl: 'https://www.chatwork.com/#!rid300000005', clientIds: ['c-006'], memo: '' },
    { id: 'cr-006', roomId: '300000006', roomName: '【リベ税】デジタルソリューション', roomUrl: 'https://www.chatwork.com/#!rid300000006', clientIds: ['c-007'], memo: '' },
    { id: 'cr-007', roomId: '300000007', roomName: '【リベ税】スカイブルー', roomUrl: 'https://www.chatwork.com/#!rid300000007', clientIds: ['c-009'], memo: '' },
    { id: 'cr-008', roomId: '300000008', roomName: '【リベ税】NPOサポートネット', roomUrl: 'https://www.chatwork.com/#!rid300000008', clientIds: ['c-010'], memo: '' },
    { id: 'cr-009', roomId: '300000009', roomName: '【リベ税】セキュリティ連絡', roomUrl: 'https://www.chatwork.com/#!rid300000009', clientIds: ['c-001', 'c-002', 'c-004', 'c-006', 'c-007', 'c-009', 'c-010'], memo: 'セキュリティ関連の一斉連絡用' },
  ],

  // カスタムフィールド定義
  customFields: [
    { id: 'cf-001', name: 'MyKomonコード', type: 'text', order: 1 },
    { id: 'cf-002', name: '契約開始日', type: 'date', order: 2 },
    { id: 'cf-003', name: 'メモ（社内用）', type: 'textarea', order: 3 },
  ],

  // タスクテンプレート
  taskTemplates: [
    {
      id: 'tmpl-001', name: '法人決算テンプレート', category: '法人決算',
      tasks: [
        { title: '資料回収依頼', daysBeforeDue: 90, assigneeRole: 'main' },
        { title: '記帳確認', daysBeforeDue: 60, assigneeRole: 'main' },
        { title: '決算整理仕訳', daysBeforeDue: 45, assigneeRole: 'main' },
        { title: '法人税申告書作成', daysBeforeDue: 30, assigneeRole: 'main' },
        { title: '消費税申告書作成', daysBeforeDue: 30, assigneeRole: 'sub' },
        { title: 'レビュー', daysBeforeDue: 14, assigneeRole: 'mgr' },
        { title: '電子申告', daysBeforeDue: 7, assigneeRole: 'main' },
        { title: '納品・報告', daysBeforeDue: 3, assigneeRole: 'main' },
      ]
    },
    {
      id: 'tmpl-002', name: '確定申告テンプレート', category: '確定申告',
      tasks: [
        { title: '資料回収', daysBeforeDue: 60, assigneeRole: 'main' },
        { title: '記帳確認・修正', daysBeforeDue: 40, assigneeRole: 'main' },
        { title: '申告書作成', daysBeforeDue: 20, assigneeRole: 'main' },
        { title: 'レビュー', daysBeforeDue: 10, assigneeRole: 'mgr' },
        { title: '電子申告', daysBeforeDue: 5, assigneeRole: 'main' },
        { title: '納品', daysBeforeDue: 2, assigneeRole: 'main' },
      ]
    },
    {
      id: 'tmpl-003', name: '年末調整テンプレート', category: '年末調整',
      tasks: [
        { title: '年末調整資料配布', daysBeforeDue: 45, assigneeRole: 'main' },
        { title: '年末調整計算', daysBeforeDue: 20, assigneeRole: 'main' },
        { title: '源泉所得税納付書作成', daysBeforeDue: 10, assigneeRole: 'main' },
        { title: '総括表・法定調書作成', daysBeforeDue: 10, assigneeRole: 'sub' },
        { title: '償却資産申告', daysBeforeDue: 10, assigneeRole: 'sub' },
      ]
    },
    {
      id: 'tmpl-004', name: '月次顧問テンプレート', category: '月次',
      tasks: [
        { title: '月次記帳チェック', daysBeforeDue: 15, assigneeRole: 'main' },
        { title: '月次報告書作成', daysBeforeDue: 10, assigneeRole: 'main' },
      ]
    },
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

function getChatRoomsByClient(clientId) { return MOCK_DATA.chatRooms.filter(r => r.clientIds.includes(clientId)); }
function getChatRoomById(id) { return MOCK_DATA.chatRooms.find(r => r.id === id); }

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
