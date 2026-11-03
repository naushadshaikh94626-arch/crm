/**
 * REAL ESTATE ADMIN PANEL - ADD PROPERTY JAVASCRIPT (add-property.js)
 * Manages two-way reactive live preview, image uploads, dynamic highlights,
 * location advantages, floor plan previews, and draft/publish actions.
 */

// Initial Form State
let propertyFormState = {
  id: '',
  title: '',
  type: '',
  price: '',
  googleFormUrl: '',
  carpetArea: '',
  description: '',
  images: [],
  currentHeroIndex: 0,
  features: [],
  floorPlan: '',
  locationAdvantages: [],
  brochureName: '',
  brochureSize: ''
};

const MAX_GALLERY_DATA_URL_SIZE = 1_000_000;

// Check if Editing existing property
function checkEditMode() {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('editId');
  if (editId) {
    const existing = DataStore.getPropertyById(editId);
    if (existing) {
      propertyFormState.id = existing.id;
      propertyFormState.title = existing.title;
      propertyFormState.type = existing.type;
      propertyFormState.price = existing.price;
      propertyFormState.googleFormUrl = existing.googleFormUrl || '';
      propertyFormState.carpetArea = existing.carpetArea || '';
      propertyFormState.description = existing.description || '';
      propertyFormState.floorPlan = existing.floorPlan || '';
      if (existing.gallery && existing.gallery.length > 0) {
        propertyFormState.images = [...existing.gallery];
      } else if (existing.image) {
        propertyFormState.images = [existing.image];
      }
      if (existing.features && existing.features.length > 0) {
        propertyFormState.features = [...existing.features];
      }
      if (existing.locationAdvantages && existing.locationAdvantages.length > 0) {
        propertyFormState.locationAdvantages = [...existing.locationAdvantages];
      }
      const floorPlanThumb = document.getElementById('floorPlanThumbImg');
      if (floorPlanThumb) floorPlanThumb.src = propertyFormState.floorPlan;
      document.querySelector('.add-prop-title-wrap h1').textContent = `Edit Property: #${existing.id}`;
    }
  } else {
    propertyFormState.id = `P${Math.floor(1000 + Math.random() * 9000)}`;
  }
}

// Populate Inputs with Current State
function populateFormFields() {
  const titleInput = document.getElementById('inputPropertyTitle');
  const typeSelect = document.getElementById('selectPropertyType');
  const priceInput = document.getElementById('inputPropertyPrice');
  const googleFormInput = document.getElementById('inputGoogleFormUrl');
  const carpetInput = document.getElementById('inputCarpetArea');
  const descInput = document.getElementById('inputPropertyDesc');

  if (titleInput) titleInput.value = propertyFormState.title;
  if (typeSelect) typeSelect.value = propertyFormState.type;
  if (priceInput) priceInput.value = propertyFormState.price.replace(/[^0-9,.]/g, '');
  if (googleFormInput) googleFormInput.value = propertyFormState.googleFormUrl;
  if (carpetInput) carpetInput.value = propertyFormState.carpetArea;
  if (descInput) descInput.value = propertyFormState.description;

  renderImageGallery();
  renderFeaturesList();
  renderLocationList();
  updateLivePreview();
}

// Real-Time Live Preview Synchronization
function updateLivePreview() {
  const prevTitle = document.getElementById('prevPropTitle');
  const prevDesc = document.getElementById('prevPropDesc');
  const prevHero = document.getElementById('prevHeroImage');
  const prevCarouselNav = document.getElementById('prevCarouselNav');
  const prevThumbs = document.getElementById('prevCarouselThumbs');
  const prevHighlights = document.getElementById('prevHighlightsGrid');
  const prevLocations = document.getElementById('prevLocationList');
  const floorPlanThumb = document.getElementById('floorPlanThumb');
  const prevFloor = document.getElementById('prevFloorImg');
  const previewBookingButton = document.getElementById('previewBookingButton');
  const googleFormUrl = getValidGoogleFormUrl(propertyFormState.googleFormUrl);

  if (prevTitle) prevTitle.textContent = propertyFormState.title || 'Property title';
  if (prevDesc) prevDesc.textContent = propertyFormState.description || 'Property description will appear here...';
  if (previewBookingButton) {
    previewBookingButton.hidden = !googleFormUrl;
    if (googleFormUrl) previewBookingButton.href = googleFormUrl;
    else previewBookingButton.removeAttribute('href');
  }
  document.getElementById('previewFloorSection').hidden = !propertyFormState.floorPlan;
  if (floorPlanThumb) floorPlanThumb.hidden = !propertyFormState.floorPlan;
  if (propertyFormState.floorPlan) {
    if (floorPlanThumb) floorPlanThumb.querySelector('img').src = propertyFormState.floorPlan;
    if (prevFloor) prevFloor.src = propertyFormState.floorPlan;
  }

  // Hero Image
  if (prevHero) {
    const curImg = propertyFormState.images[propertyFormState.currentHeroIndex] || propertyFormState.images[0];
    prevHero.src = curImg || 'assets/images/property-placeholder.svg';
  }

  // Mini carousel thumbs
  if (prevThumbs) {
    if (prevCarouselNav) prevCarouselNav.hidden = propertyFormState.images.length === 0;
    prevThumbs.innerHTML = propertyFormState.images.slice(0, 5).map((img, idx) => `
      <img class="carousel-mini-thumb ${idx === propertyFormState.currentHeroIndex ? 'active' : ''}" 
           src="${img}" alt="Preview thumb" 
           onclick="selectHeroImage(${idx})"
           onerror="this.src='assets/images/property-placeholder.svg'">
    `).join('');
  }

  // Highlights Grid in Live Preview
  if (prevHighlights) {
    const icons = ['maximize', 'arrow-up-down', 'home', 'trending-up', 'check-circle-2'];
    prevHighlights.hidden = propertyFormState.features.length === 0;
    prevHighlights.innerHTML = propertyFormState.features.slice(0, 5).map((feat, idx) => `
      <div class="preview-highlight-item">
        <i data-lucide="${icons[idx % icons.length]}"></i>
        <span class="preview-highlight-val">${feat.value}</span>
        <span class="preview-highlight-name">${feat.name}</span>
      </div>
    `).join('');
  }

  // Location Highlights in Live Preview
  if (prevLocations) {
    document.getElementById('previewLocationSection').hidden = propertyFormState.locationAdvantages.length === 0;
    prevLocations.innerHTML = propertyFormState.locationAdvantages.map(loc => `
      <div class="preview-location-item">
        <i data-lucide="map-pin"></i>
        <span>${loc}</span>
      </div>
    `).join('');
  }

  if (window.lucide) lucide.createIcons();
}

// Carousel Controls
function selectHeroImage(index) {
  propertyFormState.currentHeroIndex = index;
  updateLivePreview();
}

function prevHero() {
  if (propertyFormState.images.length === 0) return;
  propertyFormState.currentHeroIndex = (propertyFormState.currentHeroIndex - 1 + propertyFormState.images.length) % propertyFormState.images.length;
  updateLivePreview();
}

function nextHero() {
  if (propertyFormState.images.length === 0) return;
  propertyFormState.currentHeroIndex = (propertyFormState.currentHeroIndex + 1) % propertyFormState.images.length;
  updateLivePreview();
}

// Image Gallery Management
function renderImageGallery() {
  const thumbsContainer = document.getElementById('imageThumbsGrid');
  if (!thumbsContainer) return;

  let html = propertyFormState.images.map((img, idx) => `
    <div class="thumb-item">
      <img src="${img}" alt="Uploaded image ${idx + 1}" onerror="this.src='assets/images/property-placeholder.svg'">
      <button class="thumb-remove-btn" onclick="removeImage(${idx})" title="Remove image">
        <i data-lucide="x" style="width: 12px; height: 12px;"></i>
      </button>
    </div>
  `).join('');

  html += `
    <div class="add-more-box" onclick="triggerImagePicker()">
      <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
      <span>Add More</span>
    </div>
  `;

  thumbsContainer.innerHTML = html;
  if (window.lucide) lucide.createIcons({ root: thumbsContainer });
}

function removeImage(index) {
  propertyFormState.images.splice(index, 1);
  if (propertyFormState.currentHeroIndex >= propertyFormState.images.length) {
    propertyFormState.currentHeroIndex = 0;
  }
  renderImageGallery();
  updateLivePreview();
}

function triggerImagePicker() {
  const fileInput = document.getElementById('hiddenImageUpload');
  if (fileInput) fileInput.click();
}

function compressPropertyImage(file, maxDataUrlSize) {
  return new Promise((resolve, reject) => {
    const objectUrl = typeof file === 'string' ? '' : URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Your browser could not process this image.');

        let scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
        let dataUrl = '';
        while (scale >= 0.25) {
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          for (let quality = 0.8; quality >= 0.45; quality -= 0.1) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            if (dataUrl.length <= maxDataUrlSize) {
              resolve(dataUrl);
              return;
            }
          }
          scale *= 0.8;
        }
        reject(new Error('This image is too large to add. Choose a smaller image.'));
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to read image "${typeof file === 'string' ? 'from this property' : file.name}".`));
    };
    image.src = objectUrl || file;
  });
}

async function optimizePropertyImages() {
  let remainingSpace = MAX_GALLERY_DATA_URL_SIZE;
  const optimizedImages = [];

  for (const image of propertyFormState.images) {
    if (image.startsWith('data:')) {
      const optimizedImage = await compressPropertyImage(image, remainingSpace);
      remainingSpace -= optimizedImage.length;
      optimizedImages.push(optimizedImage);
    } else {
      optimizedImages.push(image);
    }
  }

  propertyFormState.images = optimizedImages;
  renderImageGallery();
  updateLivePreview();
}

async function handleImageFiles(event) {
  const files = Array.from(event.target.files || []);
  if (!files || files.length === 0) return;

  let uploadedCount = 0;
  for (const file of files) {
    const usedSpace = propertyFormState.images
      .filter(image => image.startsWith('data:'))
      .reduce((total, image) => total + image.length, 0);
    const remainingSpace = MAX_GALLERY_DATA_URL_SIZE - usedSpace;
    if (remainingSpace <= 0) {
      showToast('Image upload limit reached. Remove an image before adding another.', 'error');
      break;
    }

    try {
      const imageData = await compressPropertyImage(file, remainingSpace);
      propertyFormState.images.push(imageData);
      uploadedCount += 1;
      renderImageGallery();
      updateLivePreview();
    } catch (error) {
      console.error('Unable to add property image:', error);
      showToast(error.message, 'error');
    }
  }

  if (uploadedCount > 0) {
    showToast(`${uploadedCount} image(s) uploaded and optimized.`, 'success');
  }
  event.target.value = '';
}

// Dynamic Features / Highlights Management
function renderFeaturesList() {
  const container = document.getElementById('featuresDynamicList');
  if (!container) return;

  const icons = ['maximize', 'arrow-up-down', 'home', 'trending-up', 'check-circle-2'];

  container.innerHTML = propertyFormState.features.map((feat, idx) => `
    <div class="dynamic-row" data-index="${idx}">
      <div class="dynamic-row-icon">
        <i data-lucide="${icons[idx % icons.length]}" style="width: 16px; height: 16px;"></i>
      </div>
      <input type="text" class="dynamic-input" value="${feat.name}" placeholder="Feature Name" oninput="updateFeatureName(${idx}, this.value)">
      <input type="text" class="dynamic-val-input" value="${feat.value}" placeholder="Value" oninput="updateFeatureValue(${idx}, this.value)">
      <button class="dynamic-remove-btn" onclick="removeFeature(${idx})" title="Remove feature">
        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons({ root: container });
}

function updateFeatureName(idx, val) {
  propertyFormState.features[idx].name = val;
  updateLivePreview();
}

function updateFeatureValue(idx, val) {
  propertyFormState.features[idx].value = val;
  updateLivePreview();
}

function addFeatureRow() {
  propertyFormState.features.push({ name: '', value: '' });
  renderFeaturesList();
  updateLivePreview();
}

function removeFeature(idx) {
  propertyFormState.features.splice(idx, 1);
  renderFeaturesList();
  updateLivePreview();
}

// Dynamic Location Advantages Management
function renderLocationList() {
  const container = document.getElementById('locationDynamicList');
  if (!container) return;

  container.innerHTML = propertyFormState.locationAdvantages.map((loc, idx) => `
    <div class="dynamic-row" data-index="${idx}">
      <div class="dynamic-row-icon">
        <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i>
      </div>
      <input type="text" class="dynamic-input" value="${loc}" placeholder="e.g. 5 Mins - Highway" oninput="updateLocationAdvantage(${idx}, this.value)">
      <button class="dynamic-remove-btn" onclick="removeLocation(${idx})" title="Remove location advantage">
        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons({ root: container });
}

function updateLocationAdvantage(idx, val) {
  propertyFormState.locationAdvantages[idx] = val;
  updateLivePreview();
}

function addLocationRow() {
  propertyFormState.locationAdvantages.push('');
  renderLocationList();
  updateLivePreview();
}

function removeLocation(idx) {
  propertyFormState.locationAdvantages.splice(idx, 1);
  renderLocationList();
  updateLivePreview();
}

// Floor Plan & Brochure Handlers
function handleFloorPlanUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    propertyFormState.floorPlan = e.target.result;
    const imgEl = document.getElementById('floorPlanThumbImg');
    const prevFloor = document.getElementById('prevFloorImg');
    if (imgEl) imgEl.src = e.target.result;
    if (prevFloor) prevFloor.src = e.target.result;
    document.getElementById('floorPlanThumb').hidden = false;
    document.getElementById('previewFloorSection').hidden = false;
    showToast('Floor plan uploaded!', 'success');
  };
  reader.readAsDataURL(file);
}

function removeFloorPlan() {
  propertyFormState.floorPlan = '';
  const imgEl = document.getElementById('floorPlanThumbImg');
  const prevFloor = document.getElementById('prevFloorImg');
  if (imgEl) imgEl.removeAttribute('src');
  if (prevFloor) prevFloor.removeAttribute('src');
  document.getElementById('floorPlanThumb').hidden = true;
  document.getElementById('previewFloorSection').hidden = true;
}

function handleBrochureUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  propertyFormState.brochureName = file.name;
  propertyFormState.brochureSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

  const nameEl = document.getElementById('brochureFileName');
  const sizeEl = document.getElementById('brochureFileSize');
  if (nameEl) nameEl.textContent = propertyFormState.brochureName;
  if (sizeEl) sizeEl.textContent = propertyFormState.brochureSize;
  document.getElementById('uploadedBrochureCard').hidden = false;
  document.getElementById('previewBrochureButton').hidden = false;

  showToast('Brochure PDF uploaded successfully!', 'success');
}

function removeBrochure() {
  propertyFormState.brochureName = '';
  propertyFormState.brochureSize = '';
  const nameEl = document.getElementById('brochureFileName');
  const sizeEl = document.getElementById('brochureFileSize');
  if (nameEl) nameEl.textContent = '';
  if (sizeEl) sizeEl.textContent = '';
  document.getElementById('uploadedBrochureCard').hidden = true;
  document.getElementById('previewBrochureButton').hidden = true;
}

function getGoogleFormUrl() {
  const input = document.getElementById('inputGoogleFormUrl');
  const value = input ? input.value.trim() : '';
  if (!value) {
    showToast('Enter a Google Form link first.', 'error');
    return '';
  }

  const url = getValidGoogleFormUrl(value);
  if (url) return url;
  else {
    showToast('Enter a valid Google Form link.', 'error');
    return '';
  }
}

function getValidGoogleFormUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    const isGoogleForm = url.protocol === 'https:' &&
      (url.hostname === 'forms.gle' ||
        (url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms/')));
    return isGoogleForm ? url.href : '';
  } catch {
    return '';
  }
}

function copyGoogleFormLink() {
  const url = getGoogleFormUrl();
  if (url) copyToClipboard(url, document.getElementById('copyGoogleFormLinkButton'));
}

function shareGoogleFormViaWhatsApp() {
  const url = getGoogleFormUrl();
  if (!url) return;

  const title = document.getElementById('inputPropertyTitle').value.trim();
  const message = title
    ? `Please fill out this form about ${title}: ${url}`
    : `Please fill out this form: ${url}`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

// Form Submission: Save Draft & Publish
function collectFormData(status = 'Published') {
  const title = document.getElementById('inputPropertyTitle').value.trim();
  const type = document.getElementById('selectPropertyType').value;
  const rawPrice = document.getElementById('inputPropertyPrice').value.trim();
  const price = rawPrice ? (rawPrice.startsWith('₹') ? rawPrice : `₹ ${rawPrice}`) : '';
  const carpetArea = document.getElementById('inputCarpetArea').value.trim();
  const desc = document.getElementById('inputPropertyDesc').value.trim();

  const propObj = {
    id: propertyFormState.id || `P${Math.floor(1000 + Math.random() * 9000)}`,
    title: title,
    type: type,
    price: price,
    googleFormUrl: document.getElementById('inputGoogleFormUrl').value.trim(),
    priceUnit: 'Onwards*',
    area: carpetArea ? `${carpetArea} Sq.ft` : '',
    carpetArea: carpetArea,
    location: '',
    status: status,
    image: propertyFormState.images[0] || 'assets/images/property-placeholder.svg',
    gallery: [...propertyFormState.images],
    features: [...propertyFormState.features],
    floorPlan: propertyFormState.floorPlan,
    locationAdvantages: [...propertyFormState.locationAdvantages],
    description: desc,
    sharesCount: 0,
    clicksCount: 0,
    isFavourite: false
  };

  return propObj;
}

function openClientPreview(event) {
  event.preventDefault();

  try {
    if (!window.crypto || !window.crypto.getRandomValues) {
      throw new Error('Secure random number generation is unavailable');
    }

    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    const token = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const storageKey = `re_property_preview_${token}`;

    sessionStorage.setItem(storageKey, JSON.stringify(collectFormData('Published')));
    const previewUrl = new URL('share.html', window.location.href);
    previewUrl.searchParams.set('preview', token);

    const previewWindow = window.open(previewUrl.href, '_blank');
    if (!previewWindow) {
      sessionStorage.removeItem(storageKey);
      showToast('Preview was blocked. Allow pop-ups and try again.', 'error');
      return false;
    }

    previewWindow.opener = null;
  } catch (error) {
    console.error('Unable to open client preview:', error);
    showToast('Unable to open the client preview. Check browser storage and try again.', 'error');
  }

  return false;
}

function saveDraft() {
  const prop = collectFormData('Draft');
  const existing = DataStore.getPropertyById(prop.id);
  if (existing && existing.id === prop.id) {
    DataStore.updateProperty(prop.id, prop);
  } else {
    DataStore.addProperty(prop);
  }
  showToast('Property saved as Draft!', 'success');
}

async function publishAndGenerateLink() {
  try {
    await optimizePropertyImages();
  } catch (error) {
    console.error('Unable to prepare property images for publishing:', error);
    showToast(error.message || 'Unable to prepare property images for publishing.', 'error');
    return;
  }

  const prop = collectFormData('Published');
  const existing = DataStore.getPropertyById(prop.id);
  if (existing && existing.id === prop.id) {
    DataStore.updateProperty(prop.id, prop);
  } else {
    DataStore.addProperty(prop);
  }

  showToast('Property published. Preparing the share link...', 'success');

  // Open the exact Share Modal with this new property's generated link
  setTimeout(() => {
    openShareModal(prop.id);
  }, 400);
}

// Bind live listeners
document.addEventListener('DOMContentLoaded', () => {
  checkEditMode();
  populateFormFields();

  // Input live listeners
  const titleInput = document.getElementById('inputPropertyTitle');
  const descInput = document.getElementById('inputPropertyDesc');
  const typeSelect = document.getElementById('selectPropertyType');
  const priceInput = document.getElementById('inputPropertyPrice');
  const googleFormInput = document.getElementById('inputGoogleFormUrl');
  const carpetInput = document.getElementById('inputCarpetArea');

  if (titleInput) {
    titleInput.addEventListener('input', (e) => {
      propertyFormState.title = e.target.value;
      updateLivePreview();
    });
  }

  if (descInput) {
    descInput.addEventListener('input', (e) => {
      propertyFormState.description = e.target.value;
      updateLivePreview();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      propertyFormState.type = e.target.value;
      updateLivePreview();
    });
  }

  if (googleFormInput) {
    googleFormInput.addEventListener('input', (e) => {
      propertyFormState.googleFormUrl = e.target.value.trim();
    });
  }

  if (carpetInput) {
    carpetInput.addEventListener('input', (e) => {
      propertyFormState.carpetArea = e.target.value;
      if (propertyFormState.features[0] && propertyFormState.features[0].name.toLowerCase().includes('carpet')) {
        propertyFormState.features[0].value = `${e.target.value} Sq.ft`;
        renderFeaturesList();
      }
      updateLivePreview();
    });
  }
});
