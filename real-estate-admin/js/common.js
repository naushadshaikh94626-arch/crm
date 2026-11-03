/**
 * REAL ESTATE ADMIN PANEL - COMMON JAVASCRIPT (common.js)
 * Manages shared state, localStorage initialization, sidebar navigation,
 * Share Modal, Toast notifications, and global search.
 */

// Initial Settings Dataset
const DEFAULT_SETTINGS = {
  adminName: "Admin",
  email: "admin@realestate.com",
  phone: "+91 98765 43210",
  companyName: "RealEstate Realty Solutions Pvt Ltd",
  companyAddress: "Senapati Bapat Road, Shivajinagar, Pune 411016",
  companyWebsite: "https://realestate.com",
  currency: "INR (₹)",
  dateFormat: "DD/MM/YYYY",
  timeZone: "GMT+05:30 (India Standard Time)",
  notifyEnquiryEmail: true,
  notifyEnquiryPush: true,
  notifyPropertyUpdates: true,
  notifyShareMilestones: true
};

const LEGACY_DEMO_PROPERTY_TITLES = new Map([
  ['P1001', 'Premium Office Space'],
  ['P1002', 'Retail Shop Space'],
  ['P1003', 'Residential Plot'],
  ['P1004', 'Industrial Land'],
  ['P1005', 'IT Office Space'],
  ['P1006', 'High Street Shop'],
  ['P1007', 'Luxury Villa Plot'],
  ['P1008', 'Co-Working Space'],
  ['P1009', 'Executive Penthouse'],
  ['P1010', 'Smart Tech Park'],
  ['P1011', 'Warehousing Hub'],
  ['P1012', 'Boulevard Showroom']
]);
const LEGACY_DEMO_ENQUIRY_NAMES = new Map([
  ['ENQ-701', 'Rahul Sharma'],
  ['ENQ-702', 'Ananya Deshmukh'],
  ['ENQ-703', 'Vikram Malhotra'],
  ['ENQ-704', 'Dr. Sunita Kulkarni'],
  ['ENQ-705', 'Sanjay Patel'],
  ['ENQ-706', 'Kavita Rathi'],
  ['ENQ-707', 'Amitabh Sen'],
  ['ENQ-708', 'Pooja Varma']
]);

function updateEnquiryBadges() {
  const newEnquiryCount = DataStore.getEnquiries()
    .filter(enquiry => String(enquiry.status || '').toLowerCase() === 'new').length;
  document.querySelectorAll('[data-enquiry-count]').forEach(badge => {
    badge.textContent = newEnquiryCount;
  });
}

// Data Store Helper Functions
const DataStore = {
  getProperties() {
    const raw = localStorage.getItem('re_properties');
    if (!raw) {
      this.saveProperties([]);
      localStorage.setItem('re_properties_demo_migrated', 'true');
      return [];
    }
    try {
      const properties = JSON.parse(raw);
      if (!Array.isArray(properties)) throw new TypeError('Stored properties must be an array.');
      if (localStorage.getItem('re_properties_demo_migrated') !== 'true') {
        const currentProperties = properties.filter(property =>
          LEGACY_DEMO_PROPERTY_TITLES.get(property.id) !== property.title
        );
        if (currentProperties.length !== properties.length) this.saveProperties(currentProperties);
        localStorage.setItem('re_properties_demo_migrated', 'true');
        return currentProperties;
      }
      return properties;
    } catch (error) {
      console.error('Unable to load stored properties.', error);
      throw error;
    }
  },

  saveProperties(properties) {
    localStorage.setItem('re_properties', JSON.stringify(properties));
  },

  getPropertyById(id) {
    const props = this.getProperties();
    return props.find(p => p.id === id) || props[0];
  },

  addProperty(newProp) {
    const props = this.getProperties();
    props.unshift(newProp);
    this.saveProperties(props);
    return newProp;
  },

  updateProperty(id, updatedFields) {
    const props = this.getProperties();
    const idx = props.findIndex(p => p.id === id);
    if (idx !== -1) {
      props[idx] = { ...props[idx], ...updatedFields };
      this.saveProperties(props);
      return props[idx];
    }
    return null;
  },

  deleteProperty(id) {
    let props = this.getProperties();
    props = props.filter(p => p.id !== id);
    this.saveProperties(props);
    return props;
  },

  getEnquiries() {
    const raw = localStorage.getItem('re_enquiries');
    if (!raw) {
      this.saveEnquiries([]);
      localStorage.setItem('re_enquiries_demo_migrated', 'true');
      return [];
    }
    try {
      const enquiries = JSON.parse(raw);
      if (!Array.isArray(enquiries)) throw new TypeError('Stored enquiries must be an array.');
      if (localStorage.getItem('re_enquiries_demo_migrated') !== 'true') {
        const currentEnquiries = enquiries.filter(enquiry =>
          LEGACY_DEMO_ENQUIRY_NAMES.get(enquiry.id) !== enquiry.clientName
        );
        if (currentEnquiries.length !== enquiries.length) this.saveEnquiries(currentEnquiries);
        localStorage.setItem('re_enquiries_demo_migrated', 'true');
        return currentEnquiries;
      }
      return enquiries;
    } catch (error) {
      console.error('Unable to load stored enquiries.', error);
      throw error;
    }
  },

  saveEnquiries(enquiries) {
    localStorage.setItem('re_enquiries', JSON.stringify(enquiries));
  },

  updateEnquiryStatus(id, newStatus) {
    const enqs = this.getEnquiries();
    const idx = enqs.findIndex(e => e.id === id);
    if (idx !== -1) {
      enqs[idx].status = newStatus;
      this.saveEnquiries(enqs);
      return enqs[idx];
    }
    return null;
  },

  deleteEnquiry(id) {
    let enqs = this.getEnquiries();
    enqs = enqs.filter(e => e.id !== id);
    this.saveEnquiries(enqs);
    return enqs;
  },

  getSettings() {
    const raw = localStorage.getItem('re_settings');
    if (!raw) {
      localStorage.setItem('re_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem('re_settings', JSON.stringify(settings));
  }
};

// Global Toast Notification Helper
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconHtml = '<i data-lucide="info"></i>';
  if (type === 'success') iconHtml = '<i data-lucide="check-circle-2"></i>';
  if (type === 'error') iconHtml = '<i data-lucide="alert-circle"></i>';

  toast.innerHTML = `
    ${iconHtml}
    <span>${message}</span>
  `;

  container.appendChild(toast);
  
  if (window.lucide) {
    lucide.createIcons({ root: toast });
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Global Copy to Clipboard Helper
function copyToClipboard(text, triggerBtn = null) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      onCopySuccess(triggerBtn);
    }).catch(() => fallbackCopy(text, triggerBtn));
  } else {
    fallbackCopy(text, triggerBtn);
  }
}

function fallbackCopy(text, triggerBtn) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    onCopySuccess(triggerBtn);
  } catch (err) {
    showToast('Failed to copy link', 'error');
  }
  document.body.removeChild(ta);
}

function onCopySuccess(triggerBtn) {
  showToast('Link copied to clipboard!', 'success');
  if (triggerBtn) {
    const originalHtml = triggerBtn.innerHTML;
    triggerBtn.innerHTML = '<i data-lucide="check"></i>';
    if (window.lucide) lucide.createIcons({ root: triggerBtn });
    setTimeout(() => {
      triggerBtn.innerHTML = originalHtml;
      if (window.lucide) lucide.createIcons({ root: triggerBtn });
    }, 2000);
  }
}

// Global Share Modal Controller
let activeModalProperty = null;
let activeModalShareUrl = '';
let activeModalShareRequest = 0;

function initShareModal() {
  if (document.getElementById('sharePropertyModal')) return;

  const modalHtml = `
    <div id="sharePropertyModal" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-group">
            <i data-lucide="share-2"></i>
            <h2 class="modal-title">Share Property</h2>
          </div>
          <button class="modal-close-btn" onclick="closeShareModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="modal-property-card">
          <img id="modalPropImage" class="modal-property-thumb" src="" alt="Property Thumbnail" onerror="this.src='assets/images/property-placeholder.svg'">
          <div class="modal-property-details">
            <div class="modal-prop-header">
              <h3 id="modalPropTitle" class="modal-property-title">Property Name</h3>
              <span id="modalPropStatus" class="badge badge-published">Published</span>
            </div>
            <div class="modal-property-location">
              <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
              <span id="modalPropLocation">Location</span>
            </div>
            <div id="modalPropId" class="modal-property-id">ID: #P1001</div>
          </div>
        </div>

        <div class="share-section-title-row">
          <div class="share-section-title">
            <i data-lucide="link-2" style="width: 16px; height: 16px; color: var(--primary);"></i>
            <span>Property Share Link</span>
          </div>
          <div class="share-status-pill">
            <span class="status-dot-active"></span>
            <span id="modalShareStatusLabel">Preparing link…</span>
          </div>
        </div>

        <div class="share-link-input-wrapper">
          <input type="text" id="modalShareLinkInput" class="share-link-input" readonly value="">
          <button id="modalCopyBtn" class="copy-link-btn" title="Copy Link" onclick="copyModalLink()">
            <i data-lucide="copy" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
        <p class="share-demo-note">Anyone with this link can view this property. Links open across devices.</p>

        <div class="share-via-heading">
          <i data-lucide="share" style="width: 16px; height: 16px;"></i>
          <span>Share via</span>
        </div>

        <div class="social-share-grid">
          <button class="social-share-btn whatsapp" onclick="shareToSocial('whatsapp')" title="Share to WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.35C9.33 7.35 9 7.42 8.72 7.73C8.44 8.04 7.65 8.78 7.65 10.28C7.65 11.78 8.74 13.23 8.89 13.43C9.05 13.63 11.05 16.71 14.1 18.03C14.83 18.35 15.4 18.54 15.85 18.68C16.58 18.91 17.25 18.88 17.78 18.8C18.37 18.71 19.6 18.05 19.86 17.33C20.11 16.61 20.11 15.99 20.03 15.86C19.96 15.74 19.76 15.67 19.46 15.52C19.15 15.37 17.68 14.65 17.41 14.55C17.14 14.45 16.94 14.4 16.74 14.71C16.54 15.01 15.96 15.7 15.78 15.9C15.61 16.11 15.43 16.13 15.13 15.98C14.83 15.83 13.84 15.51 12.68 14.47C11.78 13.66 11.17 12.67 11 12.37C10.82 12.07 10.98 11.9 11.13 11.75C11.27 11.62 11.43 11.4 11.58 11.23C11.74 11.05 11.79 10.93 11.89 10.72C11.99 10.52 11.94 10.35 11.87 10.2C11.79 10.05 11.21 8.62 10.97 8.04C10.74 7.47 10.5 7.55 10.33 7.54C10.16 7.54 9.96 7.54 9.76 7.54C9.56 7.54 9.53 7.35 9.53 7.35Z"/>
            </svg>
            <span>WhatsApp</span>
          </button>
          
          <button class="social-share-btn telegram" onclick="shareToSocial('telegram')" title="Share to Telegram">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2M16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.98C15.37 16.73 15.1 16.98 14.83 17C14.25 17.06 13.81 16.62 13.25 16.25C12.37 15.67 11.87 15.31 11.02 14.75C10.03 14.1 10.67 13.74 11.24 13.16C11.39 13.01 13.98 10.65 14.03 10.44C14.04 10.41 14.04 10.3 13.97 10.24C13.9 10.18 13.8 10.2 13.73 10.22C13.62 10.24 11.9 11.38 8.56 13.64C8.07 13.98 7.63 14.14 7.23 14.13C6.79 14.12 5.95 13.88 5.32 13.68C4.55 13.43 3.94 13.3 4 12.87C4.03 12.65 4.34 12.42 4.93 12.18C8.59 10.59 11.04 9.54 12.27 9.03C15.78 7.57 16.51 7.32 16.98 7.31C17.09 7.31 17.33 7.34 17.49 7.47C17.62 7.58 17.66 7.73 17.67 7.84C17.67 7.92 17.66 8.35 16.64 8.8Z"/>
            </svg>
            <span>Telegram</span>
          </button>

          <button class="social-share-btn facebook" onclick="shareToSocial('facebook')" title="Share to Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
            </svg>
            <span>Facebook</span>
          </button>

          <button class="social-share-btn linkedin" onclick="shareToSocial('linkedin')" title="Share to LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2C18.5 10.36 16.98 9.04 14.95 9.04C13.31 9.04 12.57 9.94 12.16 10.58V9.24H9.37V18.5H12.16V13.6C12.16 12.3 12.41 11.04 14.02 11.04C15.6 11.04 15.63 12.52 15.63 13.69V18.5H18.5M6.88 8.04C7.77 8.04 8.5 7.31 8.5 6.42C8.5 5.53 7.77 4.8 6.88 4.8C5.99 4.8 5.26 5.53 5.26 6.42C5.26 7.31 5.99 8.04 6.88 8.04M5.48 18.5H8.28V9.24H5.48V18.5Z"/>
            </svg>
            <span>LinkedIn</span>
          </button>

          <button class="social-share-btn email" onclick="shareToSocial('email')" title="Share via Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <span>Email</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (window.lucide) lucide.createIcons();
}

async function openShareModal(propertyId) {
  initShareModal();
  const prop = DataStore.getProperties().find(property => property.id === propertyId);
  if (!prop) {
    showToast('Unable to share: property not found.', 'error');
    return;
  }

  const requestId = ++activeModalShareRequest;
  activeModalProperty = prop;
  activeModalShareUrl = '';

  const modal = document.getElementById('sharePropertyModal');
  const img = document.getElementById('modalPropImage');
  const title = document.getElementById('modalPropTitle');
  const loc = document.getElementById('modalPropLocation');
  const idEl = document.getElementById('modalPropId');
  const statusEl = document.getElementById('modalPropStatus');
  const shareStatusLabel = document.getElementById('modalShareStatusLabel');
  const linkInput = document.getElementById('modalShareLinkInput');

  img.src = prop.image;
  title.textContent = prop.title;
  loc.textContent = prop.location;
  idEl.textContent = `ID: #${prop.id}`;

  statusEl.textContent = prop.status;
  statusEl.className = `badge badge-${prop.status.toLowerCase()}`;

  linkInput.value = '';
  linkInput.placeholder = 'Preparing secure share link…';
  shareStatusLabel.textContent = 'Preparing link…';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) closeShareModal();
  };

  try {
    const sharedProperty = { ...prop };
    if (Array.isArray(sharedProperty.gallery) && sharedProperty.gallery[0] === sharedProperty.image) {
      delete sharedProperty.image;
    }
    const requestBody = JSON.stringify({ property: sharedProperty });
    if (new Blob([requestBody]).size > 1_900_000) {
      throw new Error('Property images or details are too large to share. Remove an image and try again.');
    }

    const response = await fetch('/.netlify/functions/property-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody
    });
    const result = await response.json();
    if (!response.ok || !result.token) {
      throw new Error(result.error || `Share service returned ${response.status}`);
    }

    const shareUrl = new URL('share.html', window.location.href);
    shareUrl.searchParams.set('token', result.token);
    if (requestId !== activeModalShareRequest) return;

    activeModalShareUrl = shareUrl.href;
    linkInput.value = activeModalShareUrl;
    linkInput.placeholder = '';
    shareStatusLabel.textContent = 'Active';

    prop.sharesCount = (prop.sharesCount || 0) + 1;
    DataStore.updateProperty(prop.id, { sharesCount: prop.sharesCount });
    if (typeof loadDashboardStats === 'function') loadDashboardStats();
  } catch (error) {
    console.error('Unable to create cross-device property share link:', error);
    if (requestId !== activeModalShareRequest) return;
    linkInput.placeholder = 'Unable to create share link';
    shareStatusLabel.textContent = 'Unavailable';
    showToast(error instanceof Error ? error.message : 'Could not create a share link.', 'error');
  }
}

function closeShareModal() {
  const modal = document.getElementById('sharePropertyModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function copyModalLink() {
  const linkInput = document.getElementById('modalShareLinkInput');
  const btn = document.getElementById('modalCopyBtn');
  if (linkInput && linkInput.value) {
    copyToClipboard(linkInput.value, btn);
  } else {
    showToast('Wait for the share link to finish generating.', 'info');
  }
}

function shareToSocial(platform) {
  if (!activeModalProperty || !activeModalShareUrl) return;
  const url = activeModalShareUrl;
  const formLink = activeModalProperty.googleFormUrl
    ? `\n\nPlease fill out this form: ${activeModalProperty.googleFormUrl}`
    : '';
  const title = `Check out this property: ${activeModalProperty.title} (${activeModalProperty.location}) - Price: ${activeModalProperty.price}`;
  const message = `${title}\n${url}${formLink}`;

  let targetUrl = '';
  switch (platform) {
    case 'whatsapp':
      targetUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      break;
    case 'telegram':
      targetUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
      break;
    case 'facebook':
      targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      break;
    case 'linkedin':
      targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      break;
    case 'email':
      targetUrl = `mailto:?subject=${encodeURIComponent(activeModalProperty.title)}&body=${encodeURIComponent(message)}`;
      break;
  }

  if (targetUrl) {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    showToast(`Shared via ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`, 'info');
  }
}

// Sidebar Navigation Active Item Detection
function highlightActiveNav() {
  const path = window.location.pathname.toLowerCase();
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (!href) return;
    const cleanHref = href.toLowerCase();

    // Check if the current URL ends with this href or is equivalent
    if (path.endsWith(cleanHref) || (cleanHref === 'dashboard.html' && (path.endsWith('/') || path.endsWith('index.html')))) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Mobile Sidebar Handler
function initMobileMenu() {
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (mobileBtn && sidebar && overlay) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

// Admin Profile Dropdown
function initProfileDropdown() {
  const profile = document.querySelector('.admin-profile');
  const menu = document.querySelector('.profile-menu');

  if (profile && menu) {
    profile.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      menu.classList.remove('open');
    });
  }
}

// Global Search Redirection / Filtering
function initGlobalSearch() {
  const searchInput = document.querySelector('.global-search input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `all-properties.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }
}

// Safe Lucide initialization with SVG fallback support
function renderLucideSafely(root = document) {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try {
      window.lucide.createIcons({ root: root });
      return;
    } catch (e) {
      console.warn('Lucide icon render error:', e);
    }
  }

  // Standalone offline SVG icon fallback map
  const svgMap = {
    'layout-dashboard': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    'building-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
    'plus-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
    'share-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    'settings': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    'log-out': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    'chevron-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    'chevron-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    'chevron-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'link-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    'map-pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
    'copy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    'pencil': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
    'eye': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    'trash-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    'more-vertical': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
    'filter': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    'plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    'x': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    'menu': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>'
  };

  const icons = root.querySelectorAll('[data-lucide]');
  icons.forEach(el => {
    const iconName = el.getAttribute('data-lucide');
    if (svgMap[iconName]) {
      el.outerHTML = svgMap[iconName];
    }
  });
}

// Global initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  DataStore.getProperties();
  DataStore.getEnquiries();
  DataStore.getSettings();

  updateEnquiryBadges();

  highlightActiveNav();
  initMobileMenu();
  initProfileDropdown();
  initGlobalSearch();
  initShareModal();

  renderLucideSafely();
});
