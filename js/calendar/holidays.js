// ===========================
// 日本の祝日判定
// ===========================

/**
 * 指定年の日本の祝日マップを返す
 * @param {number} year
 * @returns {Map<string, string>} key: 'YYYY-MM-DD', value: 祝日名
 */
function getJapaneseHolidays(year) {
  const holidays = new Map();

  function add(m, d, name) {
    const key = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    holidays.set(key, name);
  }

  // 月曜日を基準としたハッピーマンデー計算
  function nthMonday(month, n) {
    const first = new Date(year, month - 1, 1);
    const firstDay = first.getDay();
    const offset = firstDay <= 1 ? (1 - firstDay) : (8 - firstDay);
    return 1 + offset + (n - 1) * 7;
  }

  // ── 固定祝日 ──
  add(1, 1, '元日');
  add(2, 11, '建国記念の日');
  add(2, 23, '天皇誕生日');
  add(4, 29, '昭和の日');
  add(5, 3, '憲法記念日');
  add(5, 4, 'みどりの日');
  add(5, 5, 'こどもの日');
  add(8, 11, '山の日');
  add(11, 3, '文化の日');
  add(11, 23, '勤労感謝の日');

  // ── ハッピーマンデー ──
  add(1, nthMonday(1, 2), '成人の日');
  add(7, nthMonday(7, 3), '海の日');
  add(9, nthMonday(9, 3), '敬老の日');
  add(10, nthMonday(10, 2), 'スポーツの日');

  // ── 春分の日（計算式） ──
  const springDay = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  add(3, springDay, '春分の日');

  // ── 秋分の日（計算式） ──
  const autumnDay = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  add(9, autumnDay, '秋分の日');

  // ── 振替休日（祝日が日曜の場合、翌月曜が振替休日） ──
  const sorted = [...holidays.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [dateStr] of sorted) {
    const dt = new Date(dateStr + 'T00:00:00');
    if (dt.getDay() === 0) { // 日曜
      let next = new Date(dt);
      next.setDate(next.getDate() + 1);
      let nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
      // 翌日も祝日ならさらに翌日へ
      while (holidays.has(nextStr)) {
        next.setDate(next.getDate() + 1);
        nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
      }
      holidays.set(nextStr, '振替休日');
    }
  }

  // ── 国民の休日（祝日に挟まれた平日） ──
  const allDates = [...holidays.keys()].sort();
  for (let i = 0; i < allDates.length - 1; i++) {
    const d1 = new Date(allDates[i] + 'T00:00:00');
    const d2 = new Date(allDates[i + 1] + 'T00:00:00');
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    if (diff === 2) {
      const between = new Date(d1);
      between.setDate(between.getDate() + 1);
      if (between.getDay() !== 0) { // 日曜でなければ
        const betweenStr = `${between.getFullYear()}-${String(between.getMonth() + 1).padStart(2, '0')}-${String(between.getDate()).padStart(2, '0')}`;
        if (!holidays.has(betweenStr)) {
          holidays.set(betweenStr, '国民の休日');
        }
      }
    }
  }

  return holidays;
}

// 年ごとにキャッシュ
const _holidayCache = {};
function getHolidayName(dateStr) {
  const year = parseInt(dateStr.slice(0, 4), 10);
  if (!_holidayCache[year]) {
    _holidayCache[year] = getJapaneseHolidays(year);
  }
  return _holidayCache[year].get(dateStr) || null;
}

function isHoliday(dateStr) {
  return getHolidayName(dateStr) !== null;
}
