/**
 * REAL ESTATE ADMIN PANEL - ENQUIRIES JAVASCRIPT (enquiries.js)
 */

let activeStatusFilter = 'All';
let searchKeyword = '';
let activeEnquiries = [];

function loadEnquiries() {
  activeEnquiries = DataStore.getEnquiries();
  updateEnquiriesStats();
  renderEnquiriesTable();
}

function updateEnquiriesStats() {
  const all = activeEnquiries;
  const countTotal = 86;
  const countNew = 12;
  const countContacted = 34;
  const countInterested = 28;
  const countConverted = 12;

  document.getElementById('enqStatTotal').textContent = countTotal;
  document.getElementById('enqStatNew').textContent = countNew;
  document.getElementById('enqStatContacted').textContent = countContacted;
  document.getElementById('enqStatInterested').textContent = countInterested;
  document.getElementById('enqStatConverted').textContent = countConverted;
}

function getFilteredEnquiries() {
  return activeEnquiries.filter(item => {
    const matchesStatus = activeStatusFilter === 'All' || item.status.toLowerCase() === activeStatusFilter.toLowerCase();
    const matchesSearch = !searchKeyword ||
      item.clientName.toLowerCase().includes(searchKeyword) ||
      item.email.toLowerCase().includes(searchKeyword) ||
      item.phone.toLowerCase().includes(searchKeyword) ||
      item.propertyName.toLowerCase().includes(searchKeyword);
    return matchesStatus && matchesSearch;
  });
}

function renderEnquiriesTable() {
  const tbody = document.getElementById('enquiriesTableBody');
  const countLabel = document.getElementById('enquiriesResultCount');
  if (!tbody) return;

  const filtered = getFilteredEnquiries();

  if (countLabel) {
    countLabel.textContent = `Showing ${filtered.length} of 86 enquiries`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 48px; color: var(--text-muted);">
          <i data-lucide="inbox" style="width: 40px; height: 40px; margin: 0 auto 10px; color: var(--text-muted);"></i>
          <p style="font-size: 14px; font-weight: 500; color: var(--text-main);">No enquiries match your search.</p>
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons({ root: tbody });
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const initials = item.clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const cleanPhone = item.phone.replace(/[^0-9]/g, '');

    return `
      <tr data-id="${item.id}">
        <td>
          <div class="client-info-cell">
            <div class="client-avatar">${initials}</div>
            <div>
              <div class="client-name-bold">${item.clientName}</div>
              <div class="client-date-sub">ID: ${item.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div>
            <div style="font-weight: 500; color: var(--text-main); font-size: 13px;">${item.phone}</div>
            <div class="contact-links-group">
              <a href="tel:${cleanPhone}" class="direct-call-btn" title="Call Client">
                <i data-lucide="phone" style="width: 12px; height: 12px;"></i>
              </a>
              <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(item.clientName)},%20regarding%20your%20enquiry%20for%20${encodeURIComponent(item.propertyName)}" target="_blank" class="direct-wa-btn" title="WhatsApp Message">
                <i data-lucide="message-circle" style="width: 12px; height: 12px;"></i>
              </a>
            </div>
          </div>
        </td>
        <td>
          <a href="mailto:${item.email}" style="color: var(--text-secondary); text-decoration: underline;" title="Send Email">
            ${item.email}
          </a>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 13.5px;">${item.propertyName}</div>
          <div style="font-size: 11.5px; color: var(--text-muted);">Budget: ${item.budget || 'Flexible'}</div>
        </td>
        <td>
          <div style="font-size: 13px; color: var(--text-main);">${item.date}</div>
          <div style="font-size: 11.5px; color: var(--text-muted);">${item.time}</div>
        </td>
        <td>
          <span style="font-size: 12.5px; background: #F1F5F9; padding: 4px 10px; border-radius: var(--radius-sm); font-weight: 500;">
            ${item.source}
          </span>
        </td>
        <td>
          <select class="status-select-badge" style="${getStatusStyle(item.status)}" onchange="updateRowStatus('${item.id}', this.value)">
            <option value="New" ${item.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Contacted" ${item.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Interested" ${item.status === 'Interested' ? 'selected' : ''}>Interested</option>
            <option value="Converted" ${item.status === 'Converted' ? 'selected' : ''}>Converted</option>
            <option value="Closed" ${item.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
        <td>
          <div class="table-actions">
            <button class="action-icon-btn" onclick="openEnquiryModal('${item.id}')" title="View Enquiry Details">
              <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
            </button>
            <button class="action-icon-btn" onclick="deleteEnquiryRow('${item.id}')" title="Delete Enquiry">
              <i data-lucide="trash-2" style="width: 15px; height: 15px; color: #EF4444;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons({ root: tbody });
}

function getStatusStyle(status) {
  switch (status.toLowerCase()) {
    case 'new': return 'background-color: #FEF2F2; color: #EF4444;';
    case 'contacted': return 'background-color: #FEF3C7; color: #D97706;';
    case 'interested': return 'background-color: #E0E7FF; color: #4F46E5;';
    case 'converted': return 'background-color: #ECFDF5; color: #10B981;';
    default: return 'background-color: #F1F5F9; color: #64748B;';
  }
}

function updateRowStatus(id, newStatus) {
  DataStore.updateEnquiryStatus(id, newStatus);
  showToast(`Enquiry #${id} marked as ${newStatus}`, 'success');
  loadEnquiries();
}

function filterByStatusTab(status, tabBtn) {
  activeStatusFilter = status;
  document.querySelectorAll('.enquiry-tab').forEach(t => t.classList.remove('active'));
  tabBtn.classList.add('active');
  renderEnquiriesTable();
}

function openEnquiryModal(id) {
  const item = activeEnquiries.find(e => e.id === id);
  if (!item) return;

  document.getElementById('modalEnqClient').textContent = item.clientName;
  document.getElementById('modalEnqPhone').textContent = item.phone;
  document.getElementById('modalEnqEmail').textContent = item.email;
  document.getElementById('modalEnqProperty').textContent = item.propertyName;
  document.getElementById('modalEnqBudget').textContent = item.budget || 'Flexible';
  document.getElementById('modalEnqSource').textContent = item.source;
  document.getElementById('modalEnqDate').textContent = `${item.date} at ${item.time}`;
  document.getElementById('modalEnqNotes').textContent = item.notes || 'No specific notes recorded.';

  const modal = document.getElementById('enquiryDetailModal');
  if (modal) {
    modal.classList.add('open');
    modal.onclick = (e) => { if (e.target === modal) closeEnquiryModal(); };
  }
}

function closeEnquiryModal() {
  const modal = document.getElementById('enquiryDetailModal');
  if (modal) modal.classList.remove('open');
}

function deleteEnquiryRow(id) {
  if (confirm(`Are you sure you want to delete enquiry #${id}?`)) {
    DataStore.deleteEnquiry(id);
    showToast('Enquiry deleted successfully', 'info');
    loadEnquiries();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadEnquiries();

  const searchInput = document.getElementById('enquirySearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchKeyword = e.target.value.toLowerCase().trim();
      renderEnquiriesTable();
    });
  }
});

