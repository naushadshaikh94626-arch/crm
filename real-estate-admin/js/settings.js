/**
 * REAL ESTATE ADMIN PANEL - SETTINGS JAVASCRIPT (settings.js)
 */

function loadSettingsData() {
  const settings = DataStore.getSettings();

  // Profile fields
  const nameInput = document.getElementById('setAdminName');
  const emailInput = document.getElementById('setAdminEmail');
  const phoneInput = document.getElementById('setAdminPhone');

  if (nameInput) nameInput.value = settings.adminName || 'Admin';
  if (emailInput) emailInput.value = settings.email || 'admin@realestate.com';
  if (phoneInput) phoneInput.value = settings.phone || '+91 98765 43210';

  // Company fields
  const compNameInput = document.getElementById('setCompanyName');
  const compAddrInput = document.getElementById('setCompanyAddress');
  const compWebInput = document.getElementById('setCompanyWebsite');

  if (compNameInput) compNameInput.value = settings.companyName || 'RealEstate Realty Solutions Pvt Ltd';
  if (compAddrInput) compAddrInput.value = settings.companyAddress || 'Senapati Bapat Road, Shivajinagar, Pune 411016';
  if (compWebInput) compWebInput.value = settings.companyWebsite || 'https://realestate.com';

  // General fields
  const currSelect = document.getElementById('setCurrency');
  const dateSelect = document.getElementById('setDateFormat');
  const tzSelect = document.getElementById('setTimeZone');

  if (currSelect) currSelect.value = settings.currency || 'INR (₹)';
  if (dateSelect) dateSelect.value = settings.dateFormat || 'DD/MM/YYYY';
  if (tzSelect) tzSelect.value = settings.timeZone || 'GMT+05:30 (India Standard Time)';

  // Notification toggles
  const togEnquiry = document.getElementById('togNotifyEnquiry');
  const togProp = document.getElementById('togNotifyProp');
  const togShare = document.getElementById('togNotifyShare');

  if (togEnquiry) togEnquiry.checked = settings.notifyEnquiryPush ?? true;
  if (togProp) togProp.checked = settings.notifyPropertyUpdates ?? true;
  if (togShare) togShare.checked = settings.notifyShareMilestones ?? true;
}

function saveProfileSettings() {
  const adminName = document.getElementById('setAdminName').value.trim();
  const email = document.getElementById('setAdminEmail').value.trim();
  const phone = document.getElementById('setAdminPhone').value.trim();

  const current = DataStore.getSettings();
  current.adminName = adminName;
  current.email = email;
  current.phone = phone;

  DataStore.saveSettings(current);

  // Update top header profile display immediately
  const headerName = document.querySelector('.admin-name');
  if (headerName) headerName.textContent = adminName;

  showToast('Profile settings saved successfully!', 'success');
}

function saveCompanySettings() {
  const compName = document.getElementById('setCompanyName').value.trim();
  const compAddr = document.getElementById('setCompanyAddress').value.trim();
  const compWeb = document.getElementById('setCompanyWebsite').value.trim();

  const current = DataStore.getSettings();
  current.companyName = compName;
  current.companyAddress = compAddr;
  current.companyWebsite = compWeb;

  DataStore.saveSettings(current);
  showToast('Company information updated!', 'success');
}

function saveGeneralSettings() {
  const currency = document.getElementById('setCurrency').value;
  const dateFormat = document.getElementById('setDateFormat').value;
  const timeZone = document.getElementById('setTimeZone').value;

  const current = DataStore.getSettings();
  current.currency = currency;
  current.dateFormat = dateFormat;
  current.timeZone = timeZone;

  DataStore.saveSettings(current);
  showToast('General settings saved!', 'success');
}

function saveNotificationSettings() {
  const togEnquiry = document.getElementById('togNotifyEnquiry').checked;
  const togProp = document.getElementById('togNotifyProp').checked;
  const togShare = document.getElementById('togNotifyShare').checked;

  const current = DataStore.getSettings();
  current.notifyEnquiryPush = togEnquiry;
  current.notifyPropertyUpdates = togProp;
  current.notifyShareMilestones = togShare;

  DataStore.saveSettings(current);
  showToast('Notification preferences updated!', 'success');
}

function saveSecurityPassword() {
  const currentPass = document.getElementById('secCurrentPass').value;
  const newPass = document.getElementById('secNewPass').value;
  const confirmPass = document.getElementById('secConfirmPass').value;

  if (!newPass || !confirmPass) {
    showToast('Please enter a new password', 'error');
    return;
  }

  if (newPass !== confirmPass) {
    showToast('New passwords do not match!', 'error');
    return;
  }

  if (newPass.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  document.getElementById('secCurrentPass').value = '';
  document.getElementById('secNewPass').value = '';
  document.getElementById('secConfirmPass').value = '';

  showToast('Password updated successfully!', 'success');
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const previewContainer = document.getElementById('avatarPreviewContainer');
    if (previewContainer) {
      previewContainer.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
    }
    const headerAvatar = document.querySelector('.admin-avatar');
    if (headerAvatar) {
      headerAvatar.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
    showToast('Profile image updated!', 'success');
  };
  reader.readAsDataURL(file);
}

function removeAvatar() {
  const previewContainer = document.getElementById('avatarPreviewContainer');
  if (previewContainer) {
    previewContainer.innerHTML = 'A';
  }
  const headerAvatar = document.querySelector('.admin-avatar');
  if (headerAvatar) {
    headerAvatar.textContent = 'A';
  }
  showToast('Profile image removed', 'info');
}

function scrollToSection(sectionId, btn) {
  document.querySelectorAll('.settings-nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettingsData();
});

