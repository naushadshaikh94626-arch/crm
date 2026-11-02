function showShareError(message) {
  const errorText = document.getElementById('shareErrorText');
  errorText.textContent = message;
  document.getElementById('shareError').hidden = false;
  document.title = 'Property unavailable';
}

function appendFeature(container, feature) {
  if (!feature || !feature.name || !feature.value) return;

  const item = document.createElement('div');
  item.className = 'feature-item';
  const value = document.createElement('strong');
  value.textContent = feature.value;
  const name = document.createElement('span');
  name.textContent = feature.name;
  item.append(value, name);
  container.appendChild(item);
}

function loadSharedProperty() {
  const params = new URLSearchParams(window.location.search);
  const previewToken = params.get('preview');
  if (previewToken) {
    loadClientPreview(previewToken);
    return;
  }

  const token = params.get('token');
  if (!token || !/^[A-Za-z0-9_-]{40,}$/.test(token)) {
    showShareError('This sharing link is invalid.');
    return;
  }

  try {
    const shares = JSON.parse(localStorage.getItem('re_property_shares') || '{}');
    const properties = JSON.parse(localStorage.getItem('re_properties') || '[]');
    if (!shares || typeof shares !== 'object' || Array.isArray(shares) || !Array.isArray(properties)) {
      showShareError('This link is invalid or this browser has no saved property data.');
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(shares, token)) {
      showShareError('This link is invalid or was created in another browser.');
      return;
    }

    const propertyId = shares[token];
    const property = properties.find(item => item && item.id === propertyId);
    if (!property) {
      showShareError('This property is no longer available.');
      return;
    }

    renderSharedProperty(property);
  } catch (error) {
    console.error('Unable to load shared property:', error);
    showShareError('Property details could not be loaded from this browser.');
  }
}

function loadClientPreview(token) {
  if (!/^[A-Za-z0-9_-]{40,}$/.test(token)) {
    showShareError('This preview link is invalid.');
    return;
  }

  try {
    const rawProperty = sessionStorage.getItem(`re_property_preview_${token}`);
    if (!rawProperty) {
      showShareError('This preview is unavailable. Reopen it from the property editor.');
      return;
    }

    const property = JSON.parse(rawProperty);
    if (!property || typeof property !== 'object' || Array.isArray(property)) {
      showShareError('The preview data is invalid.');
      return;
    }

    renderSharedProperty(property);
  } catch (error) {
    console.error('Unable to load client preview:', error);
    showShareError('The client preview could not be loaded from this browser.');
  }
}

function renderSharedProperty(property) {
  const article = document.getElementById('sharedProperty');
  const propertyImage = document.getElementById('propertyImage');
  const images = Array.isArray(property.gallery) && property.gallery.length
    ? property.gallery
    : [property.image];

  document.title = `${property.title || 'Property'} | Property Details`;
  document.getElementById('propertyType').textContent = property.type || '';
  document.getElementById('propertyTitle').textContent = property.title || 'Property';
  document.getElementById('propertyLocation').textContent = property.location || '';
  document.getElementById('propertyPrice').textContent = property.price || '';
  document.getElementById('propertyArea').textContent = property.area || '';

  propertyImage.src = images[0] || 'assets/images/property-placeholder.svg';
  propertyImage.alt = property.title ? `${property.title} property` : 'Property';
  propertyImage.onerror = () => {
    propertyImage.onerror = null;
    propertyImage.src = 'assets/images/property-placeholder.svg';
  };

  const gallery = document.getElementById('propertyGallery');
  images.filter(Boolean).forEach((image, index) => {
    const thumbnail = document.createElement('button');
    thumbnail.type = 'button';
    thumbnail.className = `gallery-thumbnail${index === 0 ? ' active' : ''}`;
    thumbnail.setAttribute('aria-label', `Show property photo ${index + 1}`);

    const thumbnailImage = document.createElement('img');
    thumbnailImage.src = image;
    thumbnailImage.alt = '';
    thumbnailImage.onerror = () => thumbnail.remove();
    thumbnail.addEventListener('click', () => {
      propertyImage.src = image;
      gallery.querySelectorAll('.gallery-thumbnail').forEach(button => button.classList.remove('active'));
      thumbnail.classList.add('active');
    });

    thumbnail.appendChild(thumbnailImage);
    gallery.appendChild(thumbnail);
  });

  if (property.description) {
    document.getElementById('propertyDescription').textContent = property.description;
    document.getElementById('descriptionSection').hidden = false;
  }

  const features = Array.isArray(property.features) ? property.features : [];
  const featureContainer = document.getElementById('propertyFeatures');
  features.forEach(feature => appendFeature(featureContainer, feature));
  if (featureContainer.childElementCount) {
    document.getElementById('featuresSection').hidden = false;
  }

  if (property.floorPlan) {
    const floorPlan = document.getElementById('propertyFloorPlan');
    floorPlan.src = property.floorPlan;
    floorPlan.onerror = () => {
      floorPlan.onerror = null;
      document.getElementById('floorPlanSection').hidden = true;
    };
    document.getElementById('floorPlanSection').hidden = false;
  }

  const locationContainer = document.getElementById('propertyLocations');
  const locationAdvantages = Array.isArray(property.locationAdvantages) ? property.locationAdvantages : [];
  locationAdvantages.filter(Boolean).forEach(location => {
    const item = document.createElement('li');
    item.textContent = location;
    locationContainer.appendChild(item);
  });
  if (locationContainer.childElementCount) {
    document.getElementById('locationsSection').hidden = false;
  }

  document.getElementById('shareError').hidden = true;
  article.hidden = false;
}

document.addEventListener('DOMContentLoaded', loadSharedProperty);
