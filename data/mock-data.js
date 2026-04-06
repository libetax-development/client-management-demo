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
    { id: 'u-001', staffCode: 'A001', lastName: 'ひろ', firstName: '', lastNameKana: 'ヒロ', firstNameKana: '', name: 'ひろ', email: 'hiro@libetax.jp', tel: '06-1234-5678', mobile: '090-1111-0001', role: 'admin', deptId: 4, team: null, position: '代表', employmentType: '正社員', joinDate: '2023-04-01', memo: '', loginId: 'hiro', isActive: true, baseRatio: null, staffFlag: '他', fixedReward: 700000, cwAccountId: '4115870' },
    { id: 'u-002', staffCode: 'A002', lastName: '朝倉', firstName: 'ゆうこ', lastNameKana: 'アサクラ', firstNameKana: 'ユウコ', name: '朝倉 ゆうこ', email: 'asakura@libetax.jp', tel: '', mobile: '090-1111-0002', role: 'team_leader', deptId: 1, team: '第1チーム', position: 'チームリーダー', employmentType: '正社員', joinDate: '2023-06-01', memo: '', loginId: 'asakura', isActive: true, baseRatio: null, staffFlag: '他', fixedReward: 350000, cwAccountId: '5001001' },
    { id: 'u-003', staffCode: 'A003', lastName: '望月', firstName: '太郎', lastNameKana: 'モチヅキ', firstNameKana: 'タロウ', name: '望月 太郎', email: 'mochizuki@libetax.jp', tel: '', mobile: '090-1111-0003', role: 'member', deptId: 1, team: '第1チーム', position: '税理士', employmentType: '正社員', joinDate: '2023-08-01', memo: '', loginId: 'mochizuki', isActive: true, baseRatio: 30, staffFlag: '税務', cwAccountId: '5001002' },
    { id: 'u-004', staffCode: 'A004', lastName: '八木', firstName: '花子', lastNameKana: 'ヤギ', firstNameKana: 'ハナコ', name: '八木 花子', email: 'yagi@libetax.jp', tel: '', mobile: '090-1111-0004', role: 'member', deptId: 1, team: '第1チーム', position: '税理士', employmentType: '正社員', joinDate: '2023-10-01', memo: '', loginId: 'yagi', isActive: true, baseRatio: 25, staffFlag: '税務' },
    { id: 'u-005', staffCode: 'A005', lastName: '宮本', firstName: '次郎', lastNameKana: 'ミヤモト', firstNameKana: 'ジロウ', name: '宮本 次郎', email: 'miyamoto@libetax.jp', tel: '', mobile: '090-1111-0005', role: 'member', deptId: 2, team: '第2チーム', position: '税理士', employmentType: '正社員', joinDate: '2024-01-15', memo: '', loginId: 'miyamoto', isActive: true, baseRatio: 30, staffFlag: '税務' },
    { id: 'u-006', staffCode: 'A006', lastName: '長谷川', firstName: '綾', lastNameKana: 'ハセガワ', firstNameKana: 'アヤ', name: '長谷川 綾', email: 'hasegawa@libetax.jp', tel: '', mobile: '090-1111-0006', role: 'member', deptId: 2, team: '第2チーム', position: 'スタッフ', employmentType: 'パート', joinDate: '2024-04-01', memo: '週3日勤務', loginId: 'hasegawa', isActive: true, baseRatio: 20, staffFlag: '税務' },
    { id: 'u-007', staffCode: 'A007', lastName: '桜井', firstName: '健', lastNameKana: 'サクライ', firstNameKana: 'ケン', name: '桜井 健', email: 'sakurai@libetax.jp', tel: '', mobile: '090-1111-0007', role: 'member', deptId: 2, team: '第2チーム', position: 'スタッフ', employmentType: '正社員', joinDate: '2024-07-01', memo: '', loginId: 'sakurai', isActive: true, baseRatio: 20, staffFlag: '税務' },
    { id: 'u-008', staffCode: 'A008', lastName: '三浦', firstName: '美咲', lastNameKana: 'ミウラ', firstNameKana: 'ミサキ', name: '三浦 美咲', email: 'miura@libetax.jp', tel: '', mobile: '090-1111-0008', role: 'member', deptId: 3, team: '第1チーム', position: 'スタッフ', employmentType: '正社員', joinDate: '2024-09-01', memo: '', loginId: 'miura', isActive: true, baseRatio: 25, staffFlag: '記帳' },
    { id: 'u-009', staffCode: 'A009', lastName: '藤原', firstName: '誠', lastNameKana: 'フジワラ', firstNameKana: 'マコト', name: '藤原 誠', email: 'fujiwara@libetax.jp', tel: '', mobile: '090-1111-0009', role: 'team_leader', deptId: 2, team: '第2チーム', position: 'チームリーダー', employmentType: '正社員', joinDate: '2023-06-01', memo: '', loginId: 'fujiwara', isActive: true, baseRatio: 30, staffFlag: '税務' },
    { id: 'u-010', staffCode: 'A010', lastName: '黒木', firstName: '浩二', lastNameKana: 'クロキ', firstNameKana: 'コウジ', name: '黒木 浩二', email: 'kuroki@libetax.jp', tel: '', mobile: '090-1111-0010', role: 'member', deptId: 1, team: '第1チーム', position: 'スタッフ', employmentType: '正社員', joinDate: '2024-03-01', memo: '2025年12月退職', loginId: 'kuroki', isActive: false, baseRatio: 25, staffFlag: '税務' },
  ],

  teams: [
    { id: 'team-001', name: '第1チーム', leaderId: 'u-002' },
    { id: 'team-002', name: '第2チーム', leaderId: 'u-009' },
  ],

  clients: [
    { id: 'c-001', clientCode: '030450', name: '株式会社サンプル商事', clientType: '法人', fiscalMonth: 3, isActive: true, mainUserId: 'u-003', subUserId: 'u-007', mgrUserId: 'u-003', monthlySales: 50000, annualFee: 150000, spotFees: [{id:'sf-001', timing:'2026-05', amount:100000, description:'株価算定'}], address: '東京都千代田区大手町1-1-1', tel: '03-1234-5001', representative: '山本 太郎', establishDate: '2010-05-20', industry: '卸売業', taxOffice: '千代田税務署', memo: '', cwAccountId: '1234001', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000001', name:'【リベ税】株式会社サンプル商事'}], relatedClientIds: ['c-003'], customFieldValues: { 'cf-001': 'MK-12345', 'cf-002': '2023-04-01', 'cf-003': '優良顧客。毎月定例ミーティングあり。' }, contractStatus: '契約中', nichizeiCode: 'NT-001234', managementNo: 'M-0450', cityName: 'やまもとたろう', cityUrl: 'https://libecity.com/user/yamamoto', email: 'yamamoto@sample.co.jp', directDebitStatus: '設定済み', etaxId: '0012345678901234', eltaxId: 'LT001234', dropboxPath: '/リベ税/顧客/株式会社サンプル商事', contractEndDate: '', consumptionTaxFee: 50000, consumptionTaxFreq: '年1回', contractStartDate: '2023-04-01', etaxPassword: 'etax1234', eltaxPassword: 'eltax5678', paymentInfo: { directDebit: true, transferAccount: '三井住友銀行 大手町支店', transferAccountKana: 'ミツイスミトモギンコウ オオテマチシテン', remarks: '法人税・消費税ともにダイレクト納付' }, postalCode: '100-0004', consumptionTaxCategory: '本則課税', invoiceRegistered: 'あり', monthlyBookkeepingFee: 15000, bookkeepingStartDate: '2023-04-01', bookkeepingEndDate: '', bookkeeperId: 'u-008', bookkeepingSubId: null, mfBusinessNo: 'MF-001234', delegationStatus: '登録済み', nichizeiRegistration: '登録確認済', displayCode: '001', capitalAmount: 10000000, corporateNumber: '1234567890123', yearEndAdjustment: true, interimFiling: 'なし', filingType: '青色' },
    { id: 'c-002', clientCode: '030451', name: '合同会社テスト工業', clientType: '法人', fiscalMonth: 9, isActive: true, mainUserId: 'u-004', subUserId: null, mgrUserId: 'u-004', monthlySales: 30000, annualFee: 0, spotFees: [{id:'sf-010', timing:'2026-03', amount:55000, description:'年末調整追加作業'}], address: '大阪府大阪市中央区本町2-2-2', tel: '06-1234-5002', representative: '鈴木 一郎', establishDate: '2015-03-10', industry: '製造業', taxOffice: '東税務署', memo: '', cwAccountId: '1234002', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000002', name:'【リベ税】合同会社テスト工業'}], relatedClientIds: [], customFieldValues: { 'cf-001': 'MK-67890', 'cf-002': '2024-01-15' }, consumptionTaxFee: 0, consumptionTaxFreq: 'なし', contractStartDate: '2024-01-15', postalCode: '541-0053', consumptionTaxCategory: '簡易課税', invoiceRegistered: 'あり', monthlyBookkeepingFee: 10000, bookkeepingStartDate: '2024-01-15', bookkeepingEndDate: '', bookkeeperId: 'u-008', bookkeepingSubId: null, mfBusinessNo: 'MF-005678', delegationStatus: '登録済み', nichizeiRegistration: '登録確認済', displayCode: '002', capitalAmount: 5000000, corporateNumber: '2345678901234', yearEndAdjustment: true, interimFiling: 'なし', filingType: '青色' },
    { id: 'c-003', clientCode: '030452', name: '田中 一郎', clientType: '個人', fiscalMonth: 12, isActive: true, mainUserId: 'u-005', subUserId: 'u-006', mgrUserId: 'u-005', monthlySales: 20000, annualFee: 0, spotFees: [], address: '愛知県名古屋市中区栄3-3-3', tel: '052-1234-5003', representative: '', establishDate: '', industry: '不動産賃貸', taxOffice: '名古屋中税務署', memo: '不動産所得あり', cwAccountId: '1234003', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000003', name:'【リベ税】田中一郎'}], relatedClientIds: ['c-001'], postalCode: '460-0008', consumptionTaxCategory: '免税', invoiceRegistered: 'なし', monthlyBookkeepingFee: 0, bookkeepingStartDate: '', bookkeepingEndDate: '', bookkeeperId: null, bookkeepingSubId: null, mfBusinessNo: '', delegationStatus: '登録済み', nichizeiRegistration: '登録確認済', displayCode: '003', capitalAmount: null, corporateNumber: '', yearEndAdjustment: false, interimFiling: 'なし', filingType: '青色' },
    { id: 'c-004', clientCode: '030453', name: '株式会社リベ不動産', clientType: '法人', fiscalMonth: 6, isActive: true, mainUserId: 'u-003', subUserId: null, mgrUserId: 'u-003', monthlySales: 80000, annualFee: 200000, spotFees: [{id:'sf-002', timing:'2026-08', amount:150000, description:'相続税申告'}, {id:'sf-003', timing:'2026-04-15', amount:50000, description:'議事録作成'}], address: '大阪府大阪市北区梅田1-4-4', tel: '06-1234-5004', representative: '高橋 花子', establishDate: '2018-01-15', industry: '不動産業', taxOffice: '北税務署', memo: '', cwAccountId: '1234004', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000004', name:'【リベ税】株式会社リベ不動産'}], relatedClientIds: [], customFieldValues: { 'cf-001': 'MK-11111', 'cf-002': '2023-06-01', 'cf-003': '不動産管理メイン。決算前にヒアリング必要。' }, postalCode: '530-0001', consumptionTaxCategory: '本則課税', invoiceRegistered: 'あり', monthlyBookkeepingFee: 20000, bookkeepingStartDate: '2023-06-01', bookkeepingEndDate: '', bookkeeperId: 'u-008', bookkeepingSubId: 'u-006', mfBusinessNo: 'MF-003456', delegationStatus: '登録済み', nichizeiRegistration: '登録確認済', displayCode: '004', capitalAmount: 30000000, corporateNumber: '3456789012345', yearEndAdjustment: true, interimFiling: '法人税のみ', filingType: '青色' },
    { id: 'c-005', clientCode: '030454', name: '佐藤 二郎', clientType: '個人', fiscalMonth: 12, isActive: true, mainUserId: 'u-006', subUserId: null, mgrUserId: 'u-005', monthlySales: 15000, annualFee: 0, spotFees: [], address: '福岡県福岡市博多区博多駅前5-5-5', tel: '092-1234-5005', representative: '', establishDate: '', industry: 'フリーランス（IT）', taxOffice: '博多税務署', memo: '', cwAccountId: '', cwRoomUrls: [], relatedClientIds: [], postalCode: '812-0011', consumptionTaxCategory: '免税', invoiceRegistered: 'なし', monthlyBookkeepingFee: 8000, bookkeepingStartDate: '2024-06-01', bookkeepingEndDate: '', bookkeeperId: 'u-008', bookkeepingSubId: null, mfBusinessNo: '', delegationStatus: '未登録', nichizeiRegistration: '要登録', displayCode: '005', capitalAmount: null, corporateNumber: '', yearEndAdjustment: false, interimFiling: 'なし', filingType: '青色' },
    { id: 'c-006', clientCode: '030455', name: '有限会社グリーンファーム', clientType: '法人', fiscalMonth: 8, isActive: true, mainUserId: 'u-007', subUserId: null, mgrUserId: 'u-003', monthlySales: 25000, annualFee: 0, spotFees: [], address: '北海道札幌市中央区北1条6-6-6', tel: '011-1234-5006', representative: '田村 健太', establishDate: '2005-09-01', industry: '農業', taxOffice: '札幌中税務署', memo: '', cwAccountId: '1234006', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000005', name:'【リベ税】有限会社グリーンファーム'}], relatedClientIds: [], postalCode: '060-0001', consumptionTaxCategory: '簡易課税', invoiceRegistered: 'あり', monthlyBookkeepingFee: 10000, bookkeepingStartDate: '2024-03-01', bookkeepingEndDate: '', bookkeeperId: 'u-008', bookkeepingSubId: null, mfBusinessNo: 'MF-007890', delegationStatus: '登録済み', nichizeiRegistration: '登録確認済', displayCode: '006', capitalAmount: 3000000, corporateNumber: '5678901234567', yearEndAdjustment: true, interimFiling: 'なし', filingType: '青色' },
    { id: 'c-007', clientCode: '030456', name: '株式会社デジタルソリューション', clientType: '法人', fiscalMonth: 12, isActive: true, mainUserId: 'u-004', subUserId: 'u-006', mgrUserId: 'u-004', monthlySales: 100000, annualFee: 0, spotFees: [], address: '東京都渋谷区渋谷2-7-7', tel: '03-1234-5007', representative: '中村 誠', establishDate: '2020-02-14', industry: 'IT・ソフトウェア', taxOffice: '渋谷税務署', memo: '顧問契約プレミアムプラン', cwAccountId: '1234007', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000006', name:'【リベ税】デジタルソリューション'}], relatedClientIds: [], customFieldValues: { 'cf-001': 'MK-99999', 'cf-003': 'プレミアムプラン。月2回面談。' }, postalCode: '150-0002', consumptionTaxCategory: '本則課税', invoiceRegistered: 'あり', monthlyBookkeepingFee: 25000, bookkeepingStartDate: '2024-01-01', bookkeepingEndDate: '', bookkeeperId: 'u-008', bookkeepingSubId: 'u-006', mfBusinessNo: 'MF-009012', delegationStatus: '登録済み', nichizeiRegistration: '登録確認済', displayCode: '007', capitalAmount: 50000000, corporateNumber: '6789012345678', yearEndAdjustment: true, interimFiling: '法人税+消費税', filingType: '青色' },
    { id: 'c-008', clientCode: '030457', name: '山田 花子', clientType: '個人', fiscalMonth: 12, isActive: false, mainUserId: 'u-005', subUserId: null, mgrUserId: 'u-005', monthlySales: 10000, annualFee: 0, spotFees: [], address: '京都府京都市左京区8-8-8', tel: '075-1234-5008', representative: '', establishDate: '', industry: '小売業', taxOffice: '左京税務署', memo: '2025年解約済み', cwAccountId: '', cwRoomUrls: [], relatedClientIds: [], postalCode: '606-8001', consumptionTaxCategory: '免税', invoiceRegistered: 'なし', monthlyBookkeepingFee: 0, bookkeepingStartDate: '', bookkeepingEndDate: '2025-12-31', bookkeeperId: null, bookkeepingSubId: null, mfBusinessNo: '', delegationStatus: '未登録', nichizeiRegistration: '要登録', displayCode: '008', capitalAmount: null, corporateNumber: '', yearEndAdjustment: false, interimFiling: 'なし', filingType: '白色' },
    { id: 'c-009', clientCode: '030458', name: '株式会社スカイブルー', clientType: '法人', fiscalMonth: 1, isActive: true, mainUserId: 'u-003', subUserId: 'u-005', mgrUserId: 'u-003', monthlySales: 45000, annualFee: 0, spotFees: [], address: '神奈川県横浜市西区みなとみらい9-9-9', tel: '045-1234-5009', representative: '木村 翔', establishDate: '2019-11-01', industry: 'サービス業', taxOffice: '横浜中税務署', memo: '', cwAccountId: '1234009', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000007', name:'【リベ税】スカイブルー'}], relatedClientIds: [], postalCode: '220-0012', consumptionTaxCategory: '簡易課税', invoiceRegistered: 'あり', monthlyBookkeepingFee: 12000, bookkeepingStartDate: '2024-04-01', bookkeepingEndDate: '', bookkeeperId: 'u-008', bookkeepingSubId: null, mfBusinessNo: 'MF-004567', delegationStatus: '登録済み', nichizeiRegistration: '登録確認済', displayCode: '009', capitalAmount: 20000000, corporateNumber: '7890123456789', yearEndAdjustment: true, interimFiling: 'なし', filingType: '青色' },
    { id: 'c-010', clientCode: '030459', name: 'NPO法人サポートネット', clientType: '法人', fiscalMonth: 3, isActive: true, mainUserId: 'u-006', subUserId: null, mgrUserId: 'u-009', monthlySales: 18000, annualFee: 0, spotFees: [], address: '兵庫県神戸市中央区三宮10-10-10', tel: '078-1234-5010', representative: '佐々木 みどり', establishDate: '2012-06-30', industry: 'NPO・福祉', taxOffice: '神戸税務署', memo: '', cwAccountId: '1234010', cwRoomUrls: [{url:'https://www.chatwork.com/#!rid300000008', name:'【リベ税】NPOサポートネット'}], relatedClientIds: [], postalCode: '650-0021', consumptionTaxCategory: '免税', invoiceRegistered: 'なし', monthlyBookkeepingFee: 8000, bookkeepingStartDate: '2025-01-01', bookkeepingEndDate: '', bookkeeperId: 'u-008', bookkeepingSubId: null, mfBusinessNo: 'MF-010234', delegationStatus: '登録済み', nichizeiRegistration: '要登録', displayCode: '010', capitalAmount: null, corporateNumber: '8901234567890', yearEndAdjustment: false, interimFiling: 'なし', filingType: '青色' },
  ],

  // 担当者アサインメント（多対多・履歴管理）
  // role: 'main' | 'sub' | 'reviewer' | 'bookkeeping_main' | 'bookkeeping_sub'
  // endDate: null = 現在担当中
  clientAssignments: [],

  tasks: [
    { id: 'tk-001', clientId: 'c-001', assigneeUserId: 'u-003', title: '法人税確定申告書作成', description: '株式会社サンプル商事の3月決算に伴う法人税確定申告書の作成', status: '進行中', dueDate: '2026-03-31', createdAt: '2026-02-15', completedAt: null, templateRunId: null, checklist: [
      { id: 'cl-001', text: '必要書類の確認', checked: true },
      { id: 'cl-002', text: '仕訳データの確認', checked: true },
      { id: 'cl-003', text: '申告書ドラフト作成', checked: false },
      { id: 'cl-004', text: 'レビュー依頼', checked: false },
      { id: 'cl-005', text: '電子申告', checked: false },
      { id: 'cl-006', text: '納品', checked: false },
    ] },
    { id: 'tk-002', clientId: 'c-001', assigneeUserId: 'u-007', title: '消費税申告書作成', status: '未着手', dueDate: '2026-03-31', createdAt: '2026-02-15', checklist: [
      { id: 'cl-007', text: '必要書類の確認', checked: false },
      { id: 'cl-008', text: '仕訳データの確認', checked: false },
      { id: 'cl-009', text: '申告書ドラフト作成', checked: false },
      { id: 'cl-010', text: 'レビュー依頼', checked: false },
      { id: 'cl-011', text: '電子申告', checked: false },
      { id: 'cl-012', text: '納品', checked: false },
    ] },
    { id: 'tk-003', clientId: 'c-002', assigneeUserId: 'u-004', title: '月次記帳チェック（3月）', description: '', status: '完了', dueDate: '2026-03-15', createdAt: '2026-03-01', completedAt: '2026-03-14T17:00:00', templateRunId: null, checklist: [
      { id: 'cl-013', text: '資料受領', checked: true },
      { id: 'cl-014', text: '仕訳入力', checked: true },
      { id: 'cl-015', text: '残高確認', checked: true },
      { id: 'cl-016', text: 'チェック完了', checked: true },
    ] },
    { id: 'tk-004', clientId: 'c-003', assigneeUserId: 'u-005', title: '確定申告書作成', status: '進行中', dueDate: '2026-03-15', createdAt: '2026-01-10', checklist: [
      { id: 'cl-017', text: '資料回収確認', checked: true },
      { id: 'cl-018', text: '記帳内容チェック', checked: true },
      { id: 'cl-019', text: '所得計算', checked: true },
      { id: 'cl-020', text: '申告書作成', checked: false },
      { id: 'cl-021', text: 'レビュー依頼', checked: false },
      { id: 'cl-022', text: '電子申告', checked: false },
      { id: 'cl-023', text: '納品', checked: false },
    ] },
    { id: 'tk-005', clientId: 'c-004', assigneeUserId: 'u-003', title: '決算前打ち合わせ', status: '完了', dueDate: '2026-03-01', createdAt: '2026-02-20', checklist: [
      { id: 'cl-024', text: '議題整理', checked: true },
      { id: 'cl-025', text: '資料準備', checked: true },
      { id: 'cl-026', text: '打ち合わせ実施', checked: true },
      { id: 'cl-027', text: '議事録作成', checked: true },
      { id: 'cl-028', text: 'タスク反映', checked: true },
    ] },
    { id: 'tk-006', clientId: 'c-005', assigneeUserId: 'u-006', title: '確定申告書作成', status: '差戻し', dueDate: '2026-03-15', createdAt: '2026-01-20', checklist: [
      { id: 'cl-029', text: '資料回収確認', checked: true },
      { id: 'cl-030', text: '記帳内容チェック', checked: true },
      { id: 'cl-031', text: '所得計算', checked: true },
      { id: 'cl-032', text: '申告書作成', checked: false },
      { id: 'cl-033', text: 'レビュー依頼', checked: false },
      { id: 'cl-034', text: '電子申告', checked: false },
      { id: 'cl-035', text: '納品', checked: false },
    ] },
    { id: 'tk-007', clientId: 'c-007', assigneeUserId: 'u-004', title: '年末調整（修正対応）', status: '未着手', dueDate: '2026-03-20', createdAt: '2026-03-05', checklist: [
      { id: 'cl-036', text: '扶養控除申告書回収', checked: false },
      { id: 'cl-037', text: '保険料控除申告書回収', checked: false },
      { id: 'cl-038', text: '給与データ確認', checked: false },
      { id: 'cl-039', text: '年末調整計算', checked: false },
      { id: 'cl-040', text: '源泉徴収票作成', checked: false },
      { id: 'cl-041', text: '法定調書作成', checked: false },
    ] },
    { id: 'tk-008', clientId: 'c-006', assigneeUserId: 'u-007', title: '月次記帳代行（3月）', status: '進行中', dueDate: '2026-03-25', createdAt: '2026-03-01', checklist: [
      { id: 'cl-042', text: '資料受領', checked: true },
      { id: 'cl-043', text: '仕訳入力', checked: true },
      { id: 'cl-044', text: '残高確認', checked: false },
      { id: 'cl-045', text: 'チェック完了', checked: false },
    ] },
    { id: 'tk-009', clientId: 'c-009', assigneeUserId: 'u-003', title: '法人税確定申告書作成', status: '未着手', dueDate: '2026-03-31', createdAt: '2026-02-01', checklist: [
      { id: 'cl-046', text: '必要書類の確認', checked: false },
      { id: 'cl-047', text: '仕訳データの確認', checked: false },
      { id: 'cl-048', text: '申告書ドラフト作成', checked: false },
      { id: 'cl-049', text: 'レビュー依頼', checked: false },
      { id: 'cl-050', text: '電子申告', checked: false },
      { id: 'cl-051', text: '納品', checked: false },
    ] },
    { id: 'tk-010', clientId: 'c-010', assigneeUserId: 'u-006', title: 'NPO法人決算書作成', status: '進行中', dueDate: '2026-03-31', createdAt: '2026-02-28', checklist: [
      { id: 'cl-052', text: '必要書類の確認', checked: true },
      { id: 'cl-053', text: '仕訳データの確認', checked: true },
      { id: 'cl-054', text: '申告書ドラフト作成', checked: false },
      { id: 'cl-055', text: 'レビュー依頼', checked: false },
      { id: 'cl-056', text: '電子申告', checked: false },
      { id: 'cl-057', text: '納品', checked: false },
    ] },
    { id: 'tk-011', clientId: 'c-001', assigneeUserId: 'u-003', title: '決算報告書レビュー', status: '未着手', dueDate: '2026-04-10', createdAt: '2026-03-10', checklist: [] },
    { id: 'tk-012', clientId: 'c-004', assigneeUserId: 'u-003', title: '中間申告準備', status: '未着手', dueDate: '2026-04-30', createdAt: '2026-03-05', checklist: [] },
  ],

  // チェックリストテンプレート
  checklistTemplates: [
    { id: 'clt-001', name: '法人税申告', items: ['必要書類の確認', '仕訳データの確認', '申告書ドラフト作成', 'レビュー依頼', '電子申告', '納品'] },
    { id: 'clt-002', name: '確定申告', items: ['資料回収確認', '記帳内容チェック', '所得計算', '申告書作成', 'レビュー依頼', '電子申告', '納品'] },
    { id: 'clt-003', name: '月次記帳', items: ['資料受領', '仕訳入力', '残高確認', 'チェック完了'] },
    { id: 'clt-004', name: '年末調整', items: ['扶養控除申告書回収', '保険料控除申告書回収', '給与データ確認', '年末調整計算', '源泉徴収票作成', '法定調書作成'] },
    { id: 'clt-005', name: '決算前打ち合わせ', items: ['議題整理', '資料準備', '打ち合わせ実施', '議事録作成', 'タスク反映'] },
  ],

  // 進捗管理表テンプレート
  progressTemplates: [
    { id: 'pt-001', name: '法人決算（標準）', category: '法人決算', columns: ['資料回収', '記帳確認', '決算整理', '申告書作成', 'レビュー', '電子申告', '納品'], isCustom: false, showReportLink: true },
    { id: 'pt-002', name: '確定申告（標準）', category: '確定申告', columns: ['資料回収', '記帳確認', '所得計算', '申告書作成', 'レビュー', '電子申告', '納品'], isCustom: false, showReportLink: true },
    { id: 'pt-003', name: '年末調整（標準）', category: '年末調整', columns: ['年末調整', '源泉所得税', '総括表（給与支払報告書）', '法定調書', '償却資産'], isCustom: false, showReportLink: true },
    { id: 'pt-004', name: '中間申告・予定納付', category: '中間申告', columns: ['資料回収', '中間計算', '申告書作成', 'レビュー', '電子申告'], isCustom: false, showReportLink: true },
    { id: 'pt-005', name: '新規契約セットアップ', category: 'その他', columns: ['契約書回収', '口座作成', 'ダイレクト納付設定', 'CWルーム作成', 'Dropboxフォルダ作成', '顧客情報登録'], isCustom: false, showReportLink: true },
  ],

  // Phase 1: 進捗管理表
  progressSheets: [
    {
      id: 'ps-001', name: '年末調整管理表', category: '年末調整', status: '利用中',
      managerId: 'u-002', createdAt: '2025-11-01', showReportLink: true,
      columns: ['年末調整', '源泉所得税', '総括表（給与支払報告書）', '法定調書', '償却資産'],
      targets: [
        { clientId: 'c-001', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '完了', '償却資産': '完了' }, completedDates: { '年末調整': '11/30', '源泉所得税': '12/05', '総括表（給与支払報告書）': '12/10', '法定調書': '01/10', '償却資産': '01/15' }, note: '' },
        { clientId: 'c-002', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '進行中', '償却資産': '未着手' }, completedDates: { '年末調整': '12/02', '源泉所得税': '12/08', '総括表（給与支払報告書）': '12/15' }, note: '法定調書の資料待ち' },
        { clientId: 'c-004', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '完了', '償却資産': '完了' }, completedDates: { '年末調整': '11/28', '源泉所得税': '12/03', '総括表（給与支払報告書）': '12/08', '法定調書': '01/08', '償却資産': '01/12' }, note: '' },
        { clientId: 'c-006', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '進行中', '法定調書': '未着手', '償却資産': '未着手' }, completedDates: { '年末調整': '12/05', '源泉所得税': '12/12' }, note: '' },
        { clientId: 'c-007', steps: { '年末調整': '差戻し', '源泉所得税': '未着手', '総括表（給与支払報告書）': '未着手', '法定調書': '未着手', '償却資産': '未着手' }, completedDates: {}, note: '修正対応中' },
        { clientId: 'c-009', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '完了', '償却資産': '進行中' }, completedDates: { '年末調整': '11/25', '源泉所得税': '12/01', '総括表（給与支払報告書）': '12/06', '法定調書': '01/05' }, note: '' },
        { clientId: 'c-010', steps: { '年末調整': '完了', '源泉所得税': '完了', '総括表（給与支払報告書）': '完了', '法定調書': '完了', '償却資産': '完了' }, completedDates: { '年末調整': '12/01', '源泉所得税': '12/07', '総括表（給与支払報告書）': '12/12', '法定調書': '01/09', '償却資産': '01/14' }, note: '' },
      ],
    },
    {
      id: 'ps-002', name: '確定申告管理表（R7）', category: '確定申告', status: '利用中',
      managerId: 'u-009', createdAt: '2026-01-10', showReportLink: true,
      columns: ['資料回収', '記帳確認', '申告書作成', 'レビュー', '電子申告', '納品'],
      targets: [
        { clientId: 'c-003', steps: { '資料回収': '完了', '記帳確認': '完了', '申告書作成': '進行中', 'レビュー': '未着手', '電子申告': '未着手', '納品': '未着手' }, completedDates: { '資料回収': '01/20', '記帳確認': '02/05' }, note: '3/15期限' },
        { clientId: 'c-005', steps: { '資料回収': '完了', '記帳確認': '完了', '申告書作成': '差戻し', 'レビュー': '未着手', '電子申告': '未着手', '納品': '未着手' }, completedDates: { '資料回収': '01/25', '記帳確認': '02/10' }, note: '差戻し対応中' },
        { clientId: 'c-008', steps: { '資料回収': '完了', '記帳確認': '完了', '申告書作成': '完了', 'レビュー': '完了', '電子申告': '完了', '納品': '完了' }, completedDates: { '資料回収': '01/15', '記帳確認': '01/28', '申告書作成': '02/15', 'レビュー': '02/20', '電子申告': '03/01', '納品': '03/05' }, note: '完了済み' },
      ],
    },
    {
      id: 'ps-003', name: '2025.10月決算', category: '法人決算', status: '利用中',
      managerId: 'u-002', createdAt: '2025-10-01', showReportLink: true,
      columns: ['決算日', '月次', '決算予告', '資料回収', '開始', '会社法計算', '税金計算', '法人税', '消費税', '地方税', '事業概況', '報告書', '電子申告', '納品', '事後処理'],
      targets: [
        {
          clientId: 'c-001',
          steps: { '決算日': '完了', '月次': '完了', '決算予告': '完了', '資料回収': '完了', '開始': '完了', '会社法計算': '完了', '税金計算': '完了', '法人税': '完了', '消費税': '完了', '地方税': '完了', '事業概況': '完了', '報告書': '完了', '電子申告': '完了', '納品': '完了', '事後処理': '進行中' },
          completedDates: { '決算日': '10/31', '月次': '11/08', '決算予告': '11/10', '資料回収': '11/15', '開始': '11/20', '会社法計算': '11/25', '税金計算': '11/28', '法人税': '12/01', '消費税': '12/03', '地方税': '12/05', '事業概況': '12/08', '報告書': '12/10', '電子申告': '12/12', '納品': '12/15' },
          note: '',
        },
        {
          clientId: 'c-002',
          steps: { '決算日': '完了', '月次': '完了', '決算予告': '完了', '資料回収': '完了', '開始': '完了', '会社法計算': '完了', '税金計算': '完了', '法人税': '完了', '消費税': '完了', '地方税': '完了', '事業概況': '完了', '報告書': '完了', '電子申告': '完了', '納品': '完了', '事後処理': '完了' },
          completedDates: { '決算日': '10/31', '月次': '11/05', '決算予告': '11/07', '資料回収': '11/10', '開始': '11/12', '会社法計算': '11/18', '税金計算': '11/22', '法人税': '11/25', '消費税': '11/27', '地方税': '11/28', '事業概況': '12/02', '報告書': '12/04', '電子申告': '12/06', '納品': '12/08', '事後処理': '12/10' },
          note: '',
        },
        {
          clientId: 'c-004',
          steps: { '決算日': '完了', '月次': '完了', '決算予告': '完了', '資料回収': '完了', '開始': '完了', '会社法計算': '完了', '税金計算': '完了', '法人税': '完了', '消費税': '差戻し', '地方税': '未着手', '事業概況': '未着手', '報告書': '未着手', '電子申告': '未着手', '納品': '未着手', '事後処理': '未着手' },
          completedDates: { '決算日': '10/31', '月次': '11/12', '決算予告': '11/14', '資料回収': '11/20', '開始': '11/22', '会社法計算': '11/30', '税金計算': '12/05', '法人税': '12/08' },
          note: '消費税申告書 修正中',
        },
        {
          clientId: 'c-006',
          steps: { '決算日': '完了', '月次': '完了', '決算予告': '完了', '資料回収': '完了', '開始': '進行中', '会社法計算': '未着手', '税金計算': '未着手', '法人税': '未着手', '消費税': '未着手', '地方税': '未着手', '事業概況': '未着手', '報告書': '未着手', '電子申告': '未着手', '納品': '未着手', '事後処理': '未着手' },
          completedDates: { '決算日': '10/31', '月次': '11/20', '決算予告': '11/25', '資料回収': '12/01' },
          note: '資料揃い次第開始予定',
        },
        {
          clientId: 'c-007',
          steps: { '決算日': '完了', '月次': '完了', '決算予告': '未着手', '資料回収': '未着手', '開始': '未着手', '会社法計算': '未着手', '税金計算': '未着手', '法人税': '未着手', '消費税': '未着手', '地方税': '未着手', '事業概況': '未着手', '報告書': '未着手', '電子申告': '未着手', '納品': '未着手', '事後処理': '未着手' },
          completedDates: { '決算日': '10/31', '月次': '11/30' },
          note: '資料未着',
        },
        {
          clientId: 'c-009',
          steps: { '決算日': '完了', '月次': '完了', '決算予告': '完了', '資料回収': '完了', '開始': '完了', '会社法計算': '完了', '税金計算': '完了', '法人税': '完了', '消費税': '完了', '地方税': '完了', '事業概況': '完了', '報告書': '完了', '電子申告': '完了', '納品': '完了', '事後処理': '完了' },
          completedDates: { '決算日': '10/31', '月次': '11/10', '決算予告': '11/12', '資料回収': '11/18', '開始': '11/20', '会社法計算': '11/26', '税金計算': '11/29', '法人税': '12/02', '消費税': '12/04', '地方税': '12/06', '事業概況': '12/09', '報告書': '12/11', '電子申告': '12/13', '納品': '12/16', '事後処理': '12/18' },
          note: '',
        },
        {
          clientId: 'c-010',
          steps: { '決算日': '完了', '月次': '完了', '決算予告': '完了', '資料回収': '完了', '開始': '完了', '会社法計算': '進行中', '税金計算': '未着手', '法人税': '未着手', '消費税': '未着手', '地方税': '未着手', '事業概況': '未着手', '報告書': '未着手', '電子申告': '未着手', '納品': '未着手', '事後処理': '未着手' },
          completedDates: { '決算日': '10/31', '月次': '11/15', '決算予告': '11/18', '資料回収': '11/28', '開始': '12/02' },
          note: 'NPO法人',
        },
      ],
    },
    {
      id: 'ps-004', name: '年末調整管理表（R6）', category: '年末調整', status: '終了',
      managerId: 'u-002', createdAt: '2024-11-01', showReportLink: false,
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
    { id: 'cf-003', name: 'メモ（社内用）', type: 'textarea', order: 1 },
  ],

  automationRules: [
    { id: 'ar-001', name: '期限7日前リマインド', type: 'reminder', enabled: true, trigger: 'タスク期限の7日前', action: 'Chatworkに通知', target: '担当者', lastRun: '2026-03-10T09:00:00' },
    { id: 'ar-002', name: '期限当日アラート', type: 'reminder', enabled: true, trigger: 'タスク期限当日', action: 'Chatworkに通知 + ダッシュボード警告', target: '担当者 + チームリーダー', lastRun: '2026-03-11T09:00:00' },
    { id: 'ar-003', name: '月次タスク自動生成', type: 'auto_create', enabled: true, trigger: '毎月1日', action: '月次顧問テンプレートからタスク自動生成', target: '全アクティブ顧客', lastRun: '2026-03-01T00:00:00' },
    { id: 'ar-004', name: '完了タスクアーカイブ', type: 'cleanup', enabled: false, trigger: '完了から30日経過', action: 'タスクを非表示化', target: '全タスク', lastRun: null },
    { id: 'ar-005', name: '差戻しエスカレーション', type: 'escalation', enabled: true, trigger: '差戻し後3日未対応', action: 'チームリーダーに通知', target: '差戻しタスクの担当者', lastRun: '2026-03-09T09:00:00' },
    { id: 'ar-006', name: '決算期限自動算出', type: 'auto_create', enabled: true, trigger: '決算月の2ヶ月前', action: '法人決算テンプレートからタスク自動生成', target: '該当決算月の法人顧客', lastRun: '2026-02-01T00:00:00' },
  ],

  automationLog: [
    { id: 'al-001', timestamp: '2026-03-11T09:00:00', ruleId: 'ar-002', ruleName: '期限当日アラート', result: '成功', targetCount: 3 },
    { id: 'al-002', timestamp: '2026-03-10T09:00:00', ruleId: 'ar-001', ruleName: '期限7日前リマインド', result: '成功', targetCount: 5 },
    { id: 'al-003', timestamp: '2026-03-10T09:00:00', ruleId: 'ar-002', ruleName: '期限当日アラート', result: '成功', targetCount: 2 },
    { id: 'al-004', timestamp: '2026-03-09T09:00:00', ruleId: 'ar-005', ruleName: '差戻しエスカレーション', result: '成功', targetCount: 1 },
    { id: 'al-005', timestamp: '2026-03-09T09:00:00', ruleId: 'ar-001', ruleName: '期限7日前リマインド', result: '成功', targetCount: 4 },
    { id: 'al-006', timestamp: '2026-03-08T09:00:00', ruleId: 'ar-001', ruleName: '期限7日前リマインド', result: '成功', targetCount: 6 },
    { id: 'al-007', timestamp: '2026-03-08T09:00:00', ruleId: 'ar-002', ruleName: '期限当日アラート', result: '成功', targetCount: 1 },
    { id: 'al-008', timestamp: '2026-03-07T09:00:00', ruleId: 'ar-001', ruleName: '期限7日前リマインド', result: '成功', targetCount: 3 },
    { id: 'al-009', timestamp: '2026-03-01T00:00:00', ruleId: 'ar-003', ruleName: '月次タスク自動生成', result: '成功', targetCount: 9 },
    { id: 'al-010', timestamp: '2026-02-01T00:00:00', ruleId: 'ar-006', ruleName: '決算期限自動算出', result: '成功', targetCount: 2 },
  ],

  // タスクコメント
  taskComments: [
    { id: 'tc-001', taskId: 'tk-001', authorId: 'u-003', body: '仕訳データの確認が完了しました。申告書のドラフトに着手します。', createdAt: '2026-03-08T14:30:00' },
    { id: 'tc-002', taskId: 'tk-001', authorId: 'u-002', body: '資料の追加が必要です。決算整理仕訳の根拠資料を確認してください。', createdAt: '2026-03-09T10:15:00' },
    { id: 'tc-003', taskId: 'tk-001', authorId: 'u-003', body: '承知しました。本日中に確認して追記します。', createdAt: '2026-03-09T11:00:00' },
    { id: 'tc-004', taskId: 'tk-004', authorId: 'u-005', body: '医療費控除の明細書が未提出です。顧客に連絡済み。', createdAt: '2026-03-07T16:00:00' },
    { id: 'tc-005', taskId: 'tk-004', authorId: 'u-009', body: '3/10までに届かなければ先に他の部分を進めてください。', createdAt: '2026-03-08T09:00:00' },
    { id: 'tc-006', taskId: 'tk-006', authorId: 'u-002', body: '売上計上のタイミングに誤りがあります。修正をお願いします。', createdAt: '2026-03-06T15:30:00' },
    { id: 'tc-007', taskId: 'tk-006', authorId: 'u-006', body: '修正しました。再度レビューをお願いいたします。', createdAt: '2026-03-07T11:00:00' },
    { id: 'tc-008', taskId: 'tk-008', authorId: 'u-007', body: '入力完了。売上仕訳の確認待ちです。', createdAt: '2026-03-10T17:00:00' },
    { id: 'tc-009', taskId: 'tk-010', authorId: 'u-006', body: 'NPO法人の活動計算書フォーマットで作成中です。', createdAt: '2026-03-09T13:00:00' },
  ],

  // カレンダーイベント（面談・MTG等）
  calendarEvents: [
    { id: 'ev-001', title: '株式会社サンプル商事 決算打ち合わせ', date: '2026-03-18', time: '10:00', duration: 60, type: 'meeting', userId: 'u-003', clientId: 'c-001', location: 'Zoom' },
    { id: 'ev-002', title: '田中一郎 確定申告面談', date: '2026-03-14', time: '14:00', duration: 30, type: 'meeting', userId: 'u-005', clientId: 'c-003', location: '来所' },
    { id: 'ev-003', title: '全体ミーティング', date: '2026-03-17', time: '09:00', duration: 60, type: 'internal', userId: null, clientId: null, location: 'Zoom' },
    { id: 'ev-004', title: '株式会社リベ不動産 月次報告', date: '2026-03-20', time: '15:00', duration: 45, type: 'meeting', userId: 'u-003', clientId: 'c-004', location: 'Zoom' },
    { id: 'ev-005', title: 'デジタルソリューション 月次面談', date: '2026-03-14', time: '10:00', duration: 60, type: 'meeting', userId: 'u-004', clientId: 'c-007', location: 'Zoom' },
    { id: 'ev-006', title: '新人研修（税務基礎）', date: '2026-03-19', time: '13:00', duration: 120, type: 'internal', userId: null, clientId: null, location: '会議室A' },
    { id: 'ev-007', title: 'NPOサポートネット 決算説明', date: '2026-03-25', time: '11:00', duration: 60, type: 'meeting', userId: 'u-006', clientId: 'c-010', location: '来所' },
    { id: 'ev-008', title: '佐藤二郎 確定申告最終確認', date: '2026-03-12', time: '16:00', duration: 30, type: 'meeting', userId: 'u-006', clientId: 'c-005', location: '電話' },
    { id: 'ev-009', title: 'チームリーダー定例', date: '2026-03-21', time: '09:00', duration: 30, type: 'internal', userId: null, clientId: null, location: 'Zoom' },
    { id: 'ev-010', title: '確定申告期限', date: '2026-03-16', time: null, duration: null, type: 'deadline', userId: null, clientId: null, location: null },
    { id: 'ev-011', title: 'スカイブルー 法人税相談', date: '2026-03-26', time: '14:00', duration: 45, type: 'meeting', userId: 'u-003', clientId: 'c-009', location: 'Zoom' },
    { id: 'ev-012', title: 'グリーンファーム 記帳確認', date: '2026-03-13', time: '11:00', duration: 30, type: 'meeting', userId: 'u-007', clientId: 'c-006', location: '電話' },
  ],

  reportTemplates: [
    { id: 'rt-001', name: '確定申告 帳簿チェック', body: '■ 作業内容\n{タイトル}\n\n■ 実施事項\n・会計帳簿のチェック（仕訳内容・勘定科目の確認）\n・前年度との比較分析\n・不明点の洗い出しと顧客への確認事項整理\n\n■ 確認事項\n・\n\n■ 次のアクション\n・' },
    { id: 'rt-002', name: '決算業務 決算整理', body: '■ 作業内容\n{タイトル}\n\n■ 実施事項\n・決算整理仕訳の確認\n・減価償却費の計算\n・引当金の計上確認\n\n■ 確認事項\n・\n\n■ 次のアクション\n・' },
    { id: 'rt-003', name: '月次業務 月次報告', body: '■ 作業内容\n{タイトル}\n\n■ 実施事項\n・月次試算表の作成\n・前月比較分析\n・資金繰り表の更新\n\n■ 確認事項\n・\n\n■ 次のアクション\n・' },
    { id: 'rt-004', name: '日報', body: '■ 本日の業務内容\n・\n\n■ 明日の予定\n・\n\n■ 所感・連絡事項\n・' },
    { id: 'rt-005', name: '面談記録', body: '■ 作業内容\n{タイトル}\n\n■ 面談日時\n{日付}\n\n■ 参加者\n・{顧客名}\n・\n\n■ 議題・内容\n・\n\n■ 決定事項\n・\n\n■ 次のアクション\n・' },
  ],

  taxAlertSettings: {
    enabled: true,
    leadMonths: 1,
    types: {
      settlement: true,
      interim1: true,
      interimPayment: true,
      interim2: true,
      consumptionTaxReview: true,
    }
  },

  externalLinks: [
    { id: 'el-001', title: '顧客管理表（スポット報酬リスト）', url: 'https://docs.google.com/spreadsheets/d/XXXXXXXXXX', category: '報酬', description: 'SPOT報酬の入力・管理用スプレッドシート' },
    { id: 'el-002', title: '【リベ税】新規スタッフマニュアル', url: 'https://docs.google.com/document/d/XXXXXXXXXX', category: 'マニュアル', description: '新規入社スタッフ向けマニュアル' },
    { id: 'el-003', title: '達人シリーズ', url: 'https://www.tatsuzin.info/', category: 'ツール', description: '税務申告ソフト' },
    { id: 'el-004', title: 'マネーフォワードクラウド', url: 'https://biz.moneyforward.com/', category: 'ツール', description: '会計ソフト' },
    { id: 'el-005', title: 'e-Tax (国税)', url: 'https://www.e-tax.nta.go.jp/', category: 'ツール', description: '国税電子申告・納税システム' },
    { id: 'el-006', title: 'eLTAX (地方税)', url: 'https://www.eltax.lta.go.jp/', category: 'ツール', description: '地方税電子申告システム' },
  ],

  // テンプレート
  templates: [
    { id: 'tmpl-001', name: '月次顧問テンプレート', description: '毎月の顧問業務タスクを一括生成', category: '月次', createdBy: 'u-001', isActive: true, createdAt: '2026-03-01' },
    { id: 'tmpl-002', name: '決算・申告テンプレート', description: '決算期のタスクを一括生成', category: '決算', createdBy: 'u-001', isActive: true, createdAt: '2026-03-01' },
  ],

  templateTaskDefinitions: [
    { id: 'ttd-001', templateId: 'tmpl-001', title: '記帳確認', relativeDueDays: 10, sortOrder: 1, checklistItems: ['仕訳確認', '残高確認'] },
    { id: 'ttd-002', templateId: 'tmpl-001', title: '月次報告書作成', relativeDueDays: 15, sortOrder: 2, checklistItems: ['試算表確認', '報告書作成'] },
    { id: 'ttd-003', templateId: 'tmpl-002', title: '決算整理仕訳', relativeDueDays: 30, sortOrder: 1, checklistItems: [] },
    { id: 'ttd-004', templateId: 'tmpl-002', title: '申告書作成', relativeDueDays: 45, sortOrder: 2, checklistItems: [] },
  ],

  templateRuns: [],

  // アーカイブ
  clientArchives: [
    { id: 'arch-001', clientId: 'c-001', title: 'MyKomon 顧客データ（2026年3月エクスポート）', url: 'https://dropbox.com/example/archive1', description: '解約前の全データバックアップ', createdAt: '2026-03-15' },
  ],

  // チームメンバー
  teamMembers: [
    { id: 'tm-001', teamId: 'team-001', userId: 'u-001', role: 'leader' },
    { id: 'tm-002', teamId: 'team-001', userId: 'u-003', role: 'member' },
    { id: 'tm-003', teamId: 'team-001', userId: 'u-006', role: 'member' },
    { id: 'tm-004', teamId: 'team-002', userId: 'u-002', role: 'leader' },
    { id: 'tm-005', teamId: 'team-002', userId: 'u-004', role: 'member' },
  ],

  // 監査ログ
  auditLogs: [
    { id: 'al-001', userId: 'u-001', eventType: 'client_created', tableName: 'clients', recordId: 'c-001', createdAt: '2026-03-10T09:00:00' },
    { id: 'al-002', userId: 'u-001', eventType: 'task_created', tableName: 'tasks', recordId: 'tk-001', createdAt: '2026-03-10T10:00:00' },
    { id: 'al-003', userId: 'u-002', eventType: 'login_success', tableName: null, recordId: null, createdAt: '2026-03-11T08:30:00' },
    { id: 'al-004', userId: 'u-003', eventType: 'task_updated', tableName: 'tasks', recordId: 'tk-001', createdAt: '2026-03-11T14:00:00' },
    { id: 'al-005', userId: 'u-001', eventType: 'client_updated', tableName: 'clients', recordId: 'c-002', createdAt: '2026-03-12T09:30:00' },
    { id: 'al-006', userId: 'u-004', eventType: 'login_success', tableName: null, recordId: null, createdAt: '2026-03-12T08:00:00' },
  ],

  // タスクファイル
  taskFiles: [
    { id: 'tf-001', taskId: 'tk-001', fileName: '月次報告書_3月.pdf', fileUrl: 'https://dropbox.com/example/report.pdf', uploadedBy: 'u-001', createdAt: '2026-03-12T10:00:00' },
  ],

  // 進捗管理表 工程候補マスター
  progressColumnCandidates: {
    '決算': ['決算日', '月次', '決算予告', '資料回収', '開始', '会社法計算', '税金計算', '決算整理'],
    '申告': ['法人税', '消費税', '地方税', '事業概況', '電子申告', '所得税'],
    '年末調整': ['年末調整', '源泉所得税', '総括表（給与支払報告書）', '法定調書', '償却資産'],
    'その他': ['報告書', '納品', '事後処理', 'レビュー', '記帳確認', '資料回収'],
  },

  notifications: [
    { id: 'n-001', type: 'task_due', message: '株式会社サンプル商事「法人税確定申告書作成」の期限が3日後です', isRead: false, createdAt: '2026-03-10T09:00:00', linkPage: 'task-detail', linkParams: { id: 'tk-001' } },
    { id: 'n-002', type: 'task_assigned', message: '新しいタスク「決算報告書レビュー」が割り当てられました', isRead: false, createdAt: '2026-03-10T08:30:00', linkPage: 'task-detail', linkParams: { id: 'tk-011' } },
    { id: 'n-003', type: 'report_created', message: '朝倉さんが報告書「第1チーム 週次報告（3/7）」を作成しました', isRead: true, createdAt: '2026-03-07T17:00:00', linkPage: 'report-detail', linkParams: { id: 'rp-021' } },
    { id: 'n-004', type: 'task_due', message: '佐藤 二郎「確定申告書作成」が差し戻されています', isRead: false, createdAt: '2026-03-09T10:00:00', linkPage: 'task-detail', linkParams: { id: 'tk-006' } },
  ],
};

// ヘルパー関数
function getUserById(id) { return MOCK_DATA.users.find(u => u.id === id); }
function getClientById(id) { return MOCK_DATA.clients.find(c => c.id === id); }
function getTasksByClient(clientId) { return MOCK_DATA.tasks.filter(t => t.clientId === clientId); }
function getTasksByAssignee(userId) { return MOCK_DATA.tasks.filter(t => t.assigneeUserId === userId); }

function getChatRoomsByClient(clientId) { return MOCK_DATA.chatRooms.filter(r => r.clientIds.includes(clientId)); }
function getChatRoomById(id) { return MOCK_DATA.chatRooms.find(r => r.id === id); }
function getTaskComments(taskId) { return MOCK_DATA.taskComments.filter(c => c.taskId === taskId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)); }
function getCalendarEvents(dateStr) { return MOCK_DATA.calendarEvents.filter(e => e.date === dateStr); }
function getTeamById(id) { return MOCK_DATA.teams.find(t => t.id === id); }
function getTeamMembers(teamId) { return MOCK_DATA.teamMembers.filter(m => m.teamId === teamId); }
function getTaskFiles(taskId) { return MOCK_DATA.taskFiles.filter(f => f.taskId === taskId); }
function getTemplateDefinitions(templateId) { return MOCK_DATA.templateTaskDefinitions.filter(d => d.templateId === templateId).sort((a, b) => a.sortOrder - b.sortOrder); }
function getArchivesByClient(clientId) { return MOCK_DATA.clientArchives.filter(a => a.clientId === clientId); }

function getRoleBadge(role) {
  const map = { superadmin: 'SA', admin: '管理者', team_leader: 'TL', member: 'メンバー' };
  return map[role] || role;
}


function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}
