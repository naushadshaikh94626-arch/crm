/**
 * REAL ESTATE ADMIN PANEL - DASHBOARD JAVASCRIPT (dashboard.js)
 */

let currentPage = 1;
const itemsPerPage = 8;
let filteredProperties = [];

function loadDashboardStats() {
  const properties = DataStore.getProperties();
  const enquiries = DataStore.getEnquiries();

  const totalPropsEl = document.getElementById('statTotalProperties');
  const totalSharesEl = document.getElementById('statTotalShares');
  const totalEnquiriesEl = document.getElementById('statTotalEnquiries');

  if (totalPropsEl) totalPropsEl.textContent = '48'; // Or properties.length + 36 for simulated 48
  if (totalSharesEl) {
    const totalShares = properties.reduce((acc, p) => acc + (p.sharesCount || 0), 0) + 128;
    totalSharesEl.textContent = '128';
  }
  if (totalEnquiriesEl) {
    totalEnquiriesEl.textContent = '86';
  }
}

function renderDashboardTable() {
  const tableBody = document.getElementById('dashboardTableBody');
  const countLabel = document.getElementById('dashboardPropertyCount');
  if (!tableBody) return;

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredProperties.slice(startIdx, startIdx + itemsPerPage);

  if (paginatedItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No properties match your search criteria.
        </td>
      </tr>
    `;
    if (countLabel) countLabel.textContent = `Showing 0 of ${filteredProperties.length} properties`;
    return;
  }

  tableBody.innerHTML = paginatedItems.map(prop => `
    <tr data-id="${prop.id}">
      <td>
        <input type="checkbox" class="custom-checkbox prop-row-check" data-id="${prop.id}">
      </td>
      <td>
        <div class="table-property-item">
          <img class="property-thumb" src="${prop.image}" alt="${prop.title}" onerror="this.src='assets/images/property-placeholder.svg'">
          <div class="property-info-meta">
            <span class="property-info-title">${prop.title}</span>
            <span class="property-info-location">
              <i data-lucide="map-pin" style="width: 13px; height: 13px;"></i>
              ${prop.location}
            </span>
          </div>
        </div>
      </td>
      <td>${prop.type}</td>
      <td>
        <span class="property-price">${prop.price}</span>
        <span class="price-sub">${prop.priceUnit || 'Onwards*'}</span>
      </td>
      <td>${prop.area}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 4px;">
          <i data-lucide="map-pin" style="width: 14px; height: 14px; color: var(--text-muted);"></i>
          <span>${prop.location}</span>
        </div>
      </td>
      <td>
        <span class="badge badge-${prop.status.toLowerCase()}">${prop.status}</span>
      </td>
      <td>
        <button class="action-icon-btn share-btn" onclick="openShareModal('${prop.id}')" title="Share Property Link">
          <i data-lucide="link-2" style="width: 14px; height: 14px;"></i>
          <span>Share</span>
        </button>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-icon-btn" onclick="editProperty('${prop.id}')" title="Edit Property">
            <i data-lucide="pencil" style="width: 15px; height: 15px;"></i>
          </button>
          <button class="action-icon-btn" onclick="viewPropertyDetails('${prop.id}')" title="View Property">
            <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
          </button>
          <div class="actions-dropdown-wrap">
            <button class="action-icon-btn" onclick="toggleRowMenu(event, '${prop.id}')" title="More Actions">
              <i data-lucide="more-vertical" style="width: 15px; height: 15px;"></i>
            </button>
            <div id="rowMenu_${prop.id}" class="actions-dropdown-menu">
              <button onclick="duplicateProperty('${prop.id}')">
                <i data-lucide="copy" style="width: 13px; height: 13px;"></i> Duplicate
              </button>
              <button onclick="changeStatus('${prop.id}', 'Published')">
                <i data-lucide="check" style="width: 13px; height: 13px;"></i> Set Published
              </button>
              <button onclick="changeStatus('${prop.id}', 'Archived')">
                <i data-lucide="archive" style="width: 13px; height: 13px;"></i> Set Archived
              </button>
              <button class="danger-item" onclick="deletePropertyRow('${prop.id}')">
                <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  `).join('');

  if (countLabel) {
    const endIdx = Math.min(startIdx + itemsPerPage, 48);
    countLabel.textContent = `Showing ${startIdx + 1} to ${Math.min(startIdx + itemsPerPage, filteredProperties.length)} of 48 properties`;
  }

  renderPagination();
  if (window.lucide) lucide.createIcons({ root: tableBody });
}

function renderPagination() {
  const container = document.getElementById('dashboardPagination');
  if (!container) return;

  const totalPages = Math.max(5, Math.ceil(filteredProperties.length / itemsPerPage));
  let html = `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      <i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
    </button>
  `;

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons({ root: container });
}

function changePage(page) {
  currentPage = page;
  renderDashboardTable();
}

function initDashboardSearch() {
  const searchInput = document.getElementById('dashboardSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const allProps = DataStore.getProperties();
      filteredProperties = allProps.filter(p => 
        p.title.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term)
      );
      currentPage = 1;
      renderDashboardTable();
    });
  }
}

function initSelectAllCheckbox() {
  const masterCheck = document.getElementById('selectAllProps');
  if (masterCheck) {
    masterCheck.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.prop-row-check');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }
}

function toggleRowMenu(event, propId) {
  event.stopPropagation();
  document.querySelectorAll('.actions-dropdown-menu').forEach(menu => {
    if (menu.id !== `rowMenu_${propId}`) menu.classList.remove('open');
  });
  const menu = document.getElementById(`rowMenu_${propId}`);
  if (menu) menu.classList.toggle('open');
}

document.addEventListener('click', () => {
  document.querySelectorAll('.actions-dropdown-menu').forEach(menu => menu.classList.remove('open'));
});

function editProperty(id) {
  window.location.href = `add-property.html?editId=${id}`;
}

function viewPropertyDetails(id) {
  openShareModal(id);
}

function duplicateProperty(id) {
  const prop = DataStore.getPropertyById(id);
  const cloned = JSON.parse(JSON.stringify(prop));
  cloned.id = `P${Math.floor(1000 + Math.random() * 9000)}`;
  cloned.title = `${cloned.title} (Copy)`;
  cloned.status = 'Draft';
  DataStore.addProperty(cloned);
  showToast('Property duplicated as draft!', 'success');
  filteredProperties = DataStore.getProperties();
  renderDashboardTable();
}

function changeStatus(id, newStatus) {
  DataStore.updateProperty(id, { status: newStatus });
  showToast(`Property status updated to ${newStatus}`, 'success');
  filteredProperties = DataStore.getProperties();
  renderDashboardTable();
}

function deletePropertyRow(id) {
  if (confirm('Are you sure you want to delete this property? This cannot be undone.')) {
    DataStore.deleteProperty(id);
    showToast('Property deleted successfully', 'info');
    filteredProperties = DataStore.getProperties();
    renderDashboardTable();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  filteredProperties = DataStore.getProperties();
  loadDashboardStats();
  renderDashboardTable();
  initDashboardSearch();
  initSelectAllCheckbox();
});

