/**
 * REAL ESTATE ADMIN PANEL - ALL PROPERTIES JAVASCRIPT (properties.js)
 */

let currentView = 'grid'; // 'grid' or 'list'
let currentFilter = 'All'; // 'All', 'Draft', 'Published', 'Archived'
let searchQuery = '';
let currentPage = 1;
const itemsPerPage = 8;
let allProperties = [];

function loadPropertiesData() {
  allProperties = DataStore.getProperties();
  updateFilterTabCounts();
}

function updateFilterTabCounts() {
  const countAll = 48; // simulated full pool
  const countDraft = allProperties.filter(p => p.status === 'Draft').length + 4;
  const countPublished = allProperties.filter(p => p.status === 'Published').length + 30;
  const countArchived = allProperties.filter(p => p.status === 'Archived').length + 4;

  const countAllEl = document.getElementById('tabCountAll');
  const countDraftEl = document.getElementById('tabCountDraft');
  const countPubEl = document.getElementById('tabCountPublished');
  const countArchEl = document.getElementById('tabCountArchived');

  if (countAllEl) countAllEl.textContent = `(${countAll})`;
  if (countDraftEl) countDraftEl.textContent = `(${countDraft})`;
  if (countPubEl) countPubEl.textContent = `(${countPublished})`;
  if (countArchEl) countArchEl.textContent = `(${countArchived})`;
}

function getFilteredList() {
  return allProperties.filter(prop => {
    const matchesFilter = currentFilter === 'All' || prop.status.toLowerCase() === currentFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      prop.title.toLowerCase().includes(searchQuery) ||
      prop.location.toLowerCase().includes(searchQuery) ||
      prop.type.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });
}

function renderProperties() {
  const filtered = getFilteredList();
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIdx, startIdx + itemsPerPage);

  const gridContainer = document.getElementById('propertiesGridContainer');
  const listContainer = document.getElementById('propertiesListBody');
  const countLabel = document.getElementById('propertiesCountLabel');

  if (countLabel) {
    countLabel.textContent = `Showing ${filtered.length > 0 ? startIdx + 1 : 0}-${Math.min(startIdx + itemsPerPage, filtered.length)} of 48 properties`;
  }

  // Render Grid View
  if (gridContainer) {
    if (pageItems.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--border-color); color: var(--text-muted);">
          <i data-lucide="building-2" style="width: 48px; height: 48px; margin: 0 auto 12px; color: var(--text-muted);"></i>
          <h3 style="font-size: 16px; color: var(--text-main); font-weight: 600;">No properties found</h3>
          <p style="font-size: 13.5px; margin-top: 4px;">Try adjusting your filter or search query.</p>
        </div>
      `;
    } else {
      gridContainer.innerHTML = pageItems.map(prop => `
        <div class="property-card" data-id="${prop.id}">
          <div class="card-media">
            <img class="card-image" src="${prop.image}" alt="${prop.title}" onerror="this.src='assets/images/property-placeholder.svg'">
            <button class="favourite-btn ${prop.isFavourite ? 'active' : ''}" onclick="toggleFavourite(event, '${prop.id}')" title="Save to Favourites">
              <i data-lucide="heart" style="width: 17px; height: 17px;"></i>
            </button>
            <div class="card-overlay-info">
              <h3 class="card-title">${prop.title}</h3>
              <span class="card-location">
                <i data-lucide="map-pin" style="width: 13px; height: 13px;"></i>
                ${prop.location}
              </span>
            </div>
          </div>
          <div class="card-bottom-bar">
            <span class="card-price-pill">${prop.price}</span>
            <button class="card-share-btn" onclick="openShareModal('${prop.id}')" title="Share Property">
              <i data-lucide="share-2" style="width: 14px; height: 14px;"></i>
              <span>Share</span>
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  // Render List View
  if (listContainer) {
    if (pageItems.length === 0) {
      listContainer.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No properties match your filter.
          </td>
        </tr>
      `;
    } else {
      listContainer.innerHTML = pageItems.map(prop => `
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
              <button class="action-icon-btn" onclick="openShareModal('${prop.id}')" title="View Property">
                <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
              </button>
              <button class="action-icon-btn" onclick="deletePropertyRow('${prop.id}')" title="Delete Property">
                <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  renderPaginationControls(filtered.length);
  if (window.lucide) lucide.createIcons();
}

function renderPaginationControls(totalCount) {
  const container = document.getElementById('propertiesPagination');
  if (!container) return;

  const totalPages = Math.max(5, Math.ceil(totalCount / itemsPerPage));
  let html = `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
      <i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
      <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
    </button>
  `;

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons({ root: container });
}

function goToPage(page) {
  currentPage = page;
  renderProperties();
  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function toggleFavourite(event, propId) {
  event.stopPropagation();
  const prop = DataStore.getPropertyById(propId);
  prop.isFavourite = !prop.isFavourite;
  DataStore.updateProperty(propId, { isFavourite: prop.isFavourite });
  showToast(prop.isFavourite ? 'Added to favourites!' : 'Removed from favourites', 'info');
  renderProperties();
}

function setView(view) {
  currentView = view;
  const gridEl = document.getElementById('propertiesGridContainer');
  const listEl = document.getElementById('propertiesListContainer');
  const btnGrid = document.getElementById('btnViewGrid');
  const btnList = document.getElementById('btnViewList');

  if (view === 'grid') {
    gridEl.classList.remove('hidden');
    listEl.classList.remove('active');
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
  } else {
    gridEl.classList.add('hidden');
    listEl.classList.add('active');
    btnGrid.classList.remove('active');
    btnList.classList.add('active');
  }
}

function setStatusFilter(status, tabElement) {
  currentFilter = status;
  document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
  tabElement.classList.add('active');
  currentPage = 1;
  renderProperties();
}

function editProperty(id) {
  window.location.href = `add-property.html?editId=${id}`;
}

function deletePropertyRow(id) {
  if (confirm('Are you sure you want to delete this property?')) {
    DataStore.deleteProperty(id);
    showToast('Property deleted successfully', 'info');
    loadPropertiesData();
    renderProperties();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadPropertiesData();

  // Check URL query parameters for search
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam) {
    searchQuery = searchParam.toLowerCase();
    const searchInput = document.getElementById('propertiesSearch');
    if (searchInput) searchInput.value = searchParam;
  }

  const searchInput = document.getElementById('propertiesSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      currentPage = 1;
      renderProperties();
    });
  }

  renderProperties();
});

