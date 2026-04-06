// ===========================
// 契約推移ページ
// ===========================

var trendChartInstance = null;

function renderContractTrends(el) {
  // 過去18ヶ月分のデータを算出
  var data = calcContractTrends(18);

  el.innerHTML = `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header"><div class="card-title">契約件数推移（過去18ヶ月）</div></div>
      <div class="card-body">
        <div style="position:relative;height:320px;">
          <canvas id="contract-trends-chart"></canvas>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">月別詳細</div></div>
      <div class="card-body" style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>月</th><th>契約件数</th><th>新規</th><th>解除</th><th>純増減</th></tr>
          </thead>
          <tbody id="contract-trends-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  // テーブル描画
  var tbody = document.getElementById('contract-trends-tbody');
  tbody.innerHTML = data.map(function(d) {
    var net = d.newCount - d.cancelledCount;
    var netColor = net > 0 ? 'var(--success)' : net < 0 ? 'var(--danger)' : 'var(--gray-400)';
    var netLabel = net > 0 ? '+' + net : String(net);
    return '<tr>' +
      '<td>' + d.month + '</td>' +
      '<td><strong>' + d.activeCount + '</strong></td>' +
      '<td style="color:var(--success);">' + d.newCount + '</td>' +
      '<td style="color:var(--danger);">' + d.cancelledCount + '</td>' +
      '<td style="color:' + netColor + ';font-weight:600;">' + netLabel + '</td>' +
      '</tr>';
  }).join('');

  // Chart.js グラフ描画
  if (typeof Chart !== 'undefined') {
    if (trendChartInstance) trendChartInstance.destroy();
    var ctx = document.getElementById('contract-trends-chart').getContext('2d');
    trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(function(d) { return d.month.replace(/^\d{4}-/, '').replace(/^0/, '') + '月'; }),
        datasets: [
          {
            label: '契約件数',
            data: data.map(function(d) { return d.activeCount; }),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true,
            tension: 0.3,
            yAxisID: 'y',
          },
          {
            label: '新規',
            data: data.map(function(d) { return d.newCount; }),
            borderColor: '#22c55e',
            backgroundColor: 'transparent',
            borderDash: [5, 3],
            tension: 0.3,
            yAxisID: 'y1',
          },
          {
            label: '解除',
            data: data.map(function(d) { return d.cancelledCount; }),
            borderColor: '#ef4444',
            backgroundColor: 'transparent',
            borderDash: [5, 3],
            tension: 0.3,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: '契約件数' },
            beginAtZero: true,
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: '新規/解除' },
            beginAtZero: true,
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  }
}

// MOCK_DATAから月次の契約推移を算出
function calcContractTrends(monthCount) {
  var now = new Date();
  var results = [];

  for (var i = monthCount - 1; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    var monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    var monthEndStr = monthEnd.getFullYear() + '-' + String(monthEnd.getMonth() + 1).padStart(2, '0') + '-' + String(monthEnd.getDate()).padStart(2, '0');
    var monthStartStr = ym + '-01';

    var activeCount = 0;
    var newCount = 0;
    var cancelledCount = 0;

    MOCK_DATA.clients.forEach(function(c) {
      var startDate = c.contractStartDate || '2023-04-01';
      var endDate = c.contractEndDate || '';
      var isActive = (!c.contractEndDate || c.contractEndDate > monthEndStr) && startDate <= monthEndStr;

      if (isActive) activeCount++;
      if (startDate >= monthStartStr && startDate <= monthEndStr) newCount++;
      if (endDate && endDate >= monthStartStr && endDate <= monthEndStr) cancelledCount++;
    });

    results.push({ month: ym, activeCount: activeCount, newCount: newCount, cancelledCount: cancelledCount });
  }

  return results;
}

registerPage('contract-trends', renderContractTrends);
