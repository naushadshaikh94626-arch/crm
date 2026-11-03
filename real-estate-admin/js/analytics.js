/**
 * REAL ESTATE ADMIN PANEL - SHARE ANALYTICS JAVASCRIPT (analytics.js)
 */

function getAnalyticsTotals() {
  return DataStore.getProperties().reduce((totals, property) => ({
    shares: totals.shares + (Number(property.sharesCount) || 0),
    clicks: totals.clicks + (Number(property.clicksCount) || 0)
  }), { shares: 0, clicks: 0 });
}

function updateAnalyticsStats() {
  const totals = getAnalyticsTotals();
  document.getElementById('statSharesVal').textContent = totals.shares;
  document.getElementById('statClicksVal').textContent = totals.clicks;
}

function renderMostSharedProperties() {
  const container = document.getElementById('mostSharedTableBody');
  if (!container) return;

  const properties = DataStore.getProperties()
    .sort((a, b) => (Number(b.sharesCount) || 0) - (Number(a.sharesCount) || 0))
    .slice(0, 5);

  if (properties.length === 0) {
    container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">No properties available.</td></tr>';
    return;
  }

  container.innerHTML = properties.map(property => `
    <tr>
      <td>
        <div class="mini-prop-item">
          <img class="mini-prop-thumb" src="${property.image}" alt="${property.title}" onerror="this.src='assets/images/property-placeholder.svg'">
          <div>
            <div class="mini-prop-name">${property.title}</div>
            <div class="mini-prop-loc">${property.location}</div>
          </div>
        </div>
      </td>
      <td><strong>${Number(property.sharesCount) || 0}</strong></td>
      <td>${Number(property.clicksCount) || 0}</td>
      <td><span class="badge badge-${property.status.toLowerCase()}">${property.status}</span></td>
      <td>
        <button class="action-icon-btn" onclick="openShareModal('${property.id}')" title="Share link">
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

  const properties = DataStore.getProperties()
    .sort((a, b) => (Number(b.clicksCount) || 0) - (Number(a.clicksCount) || 0))
    .slice(0, 5);

  if (properties.length === 0) {
    container.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 32px; color: var(--text-muted);">No properties available.</td></tr>';
    return;
  }

  container.innerHTML = properties.map(property => `
    <tr>
      <td>
        <div class="mini-prop-name">${property.title}</div>
        <div class="mini-prop-loc">${property.location}</div>
      </td>
      <td><strong>${Number(property.clicksCount) || 0}</strong></td>
      <td><span class="badge badge-${property.status.toLowerCase()}">${property.status}</span></td>
    </tr>
  `).join('');
}

function exportAnalyticsReport() {
  const totals = getAnalyticsTotals();
  const csvContent = [
    'Metric,Value',
    `Total Shares,${totals.shares}`,
    `Total Link Clicks,${totals.clicks}`,
    'Channel Shares,Not tracked'
  ].join('\n');

  const link = document.createElement('a');
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  link.download = `Share_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Analytics CSV report exported successfully!', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  updateAnalyticsStats();
  renderMostSharedProperties();
  renderMostViewedLinks();
});
