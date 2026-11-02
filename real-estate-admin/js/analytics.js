/**
 * REAL ESTATE ADMIN PANEL - SHARE ANALYTICS JAVASCRIPT (analytics.js)
 */

const ANALYTICS_DATA = {
  '30days': {
    totalShares: '1,428',
    totalClicks: '9,842',
    whatsapp: '846',
    facebook: '324',
    linkedin: '258',
    months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    sharesData: [180, 240, 290, 360, 420, 510],
    clicksData: [1100, 1450, 1900, 2300, 2800, 3400]
  },
  '7days': {
    totalShares: '342',
    totalClicks: '2,150',
    whatsapp: '198',
    facebook: '82',
    linkedin: '62',
    months: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    sharesData: [35, 42, 58, 64, 48, 52, 43],
    clicksData: [240, 290, 380, 420, 310, 360, 290]
  },
  'today': {
    totalShares: '48',
    totalClicks: '312',
    whatsapp: '28',
    facebook: '12',
    linkedin: '8',
    months: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
    sharesData: [4, 8, 14, 11, 7, 4],
    clicksData: [22, 58, 94, 76, 42, 20]
  },
  'thisMonth': {
    totalShares: '890',
    totalClicks: '6,210',
    whatsapp: '520',
    facebook: '210',
    linkedin: '160',
    months: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    sharesData: [190, 240, 280, 180],
    clicksData: [1300, 1650, 1920, 1340]
  }
};

let currentPeriod = '30days';

function updateAnalyticsStats(periodKey) {
  const data = ANALYTICS_DATA[periodKey] || ANALYTICS_DATA['30days'];

  document.getElementById('statSharesVal').textContent = data.totalShares;
  document.getElementById('statClicksVal').textContent = data.totalClicks;
  document.getElementById('statWaVal').textContent = data.whatsapp;
  document.getElementById('statFbVal').textContent = data.facebook;
  document.getElementById('statLiVal').textContent = data.linkedin;

  drawSharingChart(data.months, data.sharesData, data.clicksData);
}

// Interactive Smooth Canvas Chart (Guaranteed to work offline without external CDN dependencies)
function drawSharingChart(labels, shares, clicks) {
  const canvas = document.getElementById('sharingTrendCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth;
  const height = canvas.parentElement.clientHeight || 260;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...shares) * 1.25;

  // Draw Grid Lines
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'right';

  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const y = paddingTop + (chartH / gridCount) * i;
    const val = Math.round(maxVal - (maxVal / gridCount) * i);
    
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();

    ctx.fillText(val, paddingLeft - 8, y + 4);
  }

  // Calculate points
  const points = labels.map((lbl, idx) => {
    const x = paddingLeft + (chartW / (labels.length - 1)) * idx;
    const y = paddingTop + chartH - (shares[idx] / maxVal) * chartH;
    return { x, y, label: lbl, val: shares[idx] };
  });

  // Draw X axis labels
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  points.forEach(p => {
    ctx.fillText(p.label, p.x, height - 12);
  });

  // Draw Area Gradient Fill
  const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  gradient.addColorStop(0, 'rgba(244, 81, 11, 0.35)');
  gradient.addColorStop(1, 'rgba(244, 81, 11, 0.0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
  ctx.lineTo(points[0].x, height - paddingBottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw Smooth Line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.strokeStyle = '#F4510B';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw Point Circles
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#F4510B';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });
}

function renderMostSharedProperties() {
  const container = document.getElementById('mostSharedTableBody');
  if (!container) return;

  const props = DataStore.getProperties();
  const sorted = [...props].sort((a, b) => (b.sharesCount || 0) - (a.sharesCount || 0)).slice(0, 5);

  container.innerHTML = sorted.map((p, idx) => `
    <tr>
      <td>
        <div class="mini-prop-item">
          <img class="mini-prop-thumb" src="${p.image}" alt="${p.title}" onerror="this.src='assets/images/property-placeholder.svg'">
          <div>
            <div class="mini-prop-name">${p.title}</div>
            <div class="mini-prop-loc">${p.location}</div>
          </div>
        </div>
      </td>
      <td><strong>${p.sharesCount || (120 - idx * 18)}</strong></td>
      <td>${p.clicksCount || (950 - idx * 120)}</td>
      <td>
        <span class="badge badge-${p.status.toLowerCase()}">${p.status}</span>
      </td>
      <td>
        <button class="action-icon-btn" onclick="openShareModal('${p.id}')" title="Share link">
          <i data-lucide="share-2" style="width: 14px; height: 14px;"></i>
        </button>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons({ root: container });
}

function renderMostViewedLinks() {
  const container = document.getElementById('mostViewedLinksBody');
  if (!container) return;

  const props = DataStore.getProperties().slice(0, 5);

  container.innerHTML = props.map(p => {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const link = `realestate.com/p/${slug}-${p.id}`;
    return `
      <tr>
        <td>
          <div class="link-cell-wrap">
            <span>${link}</span>
            <button class="copy-mini-btn" onclick="copyToClipboard('https://${link}', this)" title="Copy Link">
              <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </td>
        <td><strong>${p.clicksCount || 820}</strong></td>
        <td>
          <span style="color: #10B981; font-weight: 600;">+${Math.floor(12 + Math.random() * 15)}%</span>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons({ root: container });
}

function exportAnalyticsReport() {
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Metric,Value,Period\n"
    + "Total Shares,1428,Last 30 Days\n"
    + "Total Link Clicks,9842,Last 30 Days\n"
    + "WhatsApp Shares,846,Last 30 Days\n"
    + "Facebook Shares,324,Last 30 Days\n"
    + "LinkedIn Shares,258,Last 30 Days\n";

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Share_Analytics_Report_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Analytics CSV report exported successfully!', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  updateAnalyticsStats('30days');
  renderMostSharedProperties();
  renderMostViewedLinks();

  const filterSelect = document.getElementById('analyticsDateRange');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      currentPeriod = e.target.value;
      updateAnalyticsStats(currentPeriod);
      showToast(`Showing analytics for: ${filterSelect.options[filterSelect.selectedIndex].text}`, 'info');
    });
  }

  window.addEventListener('resize', () => {
    const data = ANALYTICS_DATA[currentPeriod] || ANALYTICS_DATA['30days'];
    drawSharingChart(data.months, data.sharesData, data.clicksData);
  });
});

