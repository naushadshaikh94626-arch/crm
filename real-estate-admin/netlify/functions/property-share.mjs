import { randomBytes } from 'node:crypto';
import { getStore } from '@netlify/blobs';

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MAX_REQUEST_SIZE = 2 * 1024 * 1024;
const MAX_TEXT_LENGTH = 10_000;

function jsonResponse(statusCode, body) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function limitedText(value, field, maxLength = MAX_TEXT_LENGTH) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
}

function validateProperty(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('A property object is required');
  }

  const gallery = value.gallery === undefined ? [] : value.gallery;
  const features = value.features === undefined ? [] : value.features;
  const locationAdvantages = value.locationAdvantages === undefined ? [] : value.locationAdvantages;
  if (!Array.isArray(gallery) || gallery.length > 30 ||
      !Array.isArray(features) || features.length > 50 ||
      !Array.isArray(locationAdvantages) || locationAdvantages.length > 50) {
    throw new Error('Property contains too many gallery items, features, or locations');
  }

  return {
    title: limitedText(value.title, 'title', 300),
    type: limitedText(value.type, 'type', 120),
    price: limitedText(value.price, 'price', 120),
    priceUnit: limitedText(value.priceUnit, 'price unit', 80),
    area: limitedText(value.area, 'area', 120),
    location: limitedText(value.location, 'location', 300),
    image: limitedText(value.image, 'image', 1_500_000),
    gallery: gallery.map((image, index) => limitedText(image, `gallery image ${index + 1}`, 1_500_000)),
    description: limitedText(value.description, 'description', 20_000),
    features: features.map((feature, index) => {
      if (!feature || typeof feature !== 'object' || Array.isArray(feature)) {
        throw new Error(`Invalid feature ${index + 1}`);
      }
      return {
        name: limitedText(feature.name, `feature name ${index + 1}`, 200),
        value: limitedText(feature.value, `feature value ${index + 1}`, 500)
      };
    }),
    locationAdvantages: locationAdvantages.map((location, index) =>
      limitedText(location, `location ${index + 1}`, 500)),
    floorPlan: limitedText(value.floorPlan, 'floor plan', 1_500_000)
  };
}

export default async function handler(request) {
  if (request.method === 'POST') {
    try {
      const contentLength = Number(request.headers.get('content-length') || 0);
      if (contentLength > MAX_REQUEST_SIZE) {
        return jsonResponse(413, { error: 'Property data is too large to share.' });
      }

      const bodyText = await request.text();
      if (bodyText.length > MAX_REQUEST_SIZE) {
        return jsonResponse(413, { error: 'Property data is too large to share.' });
      }

      let body;
      try {
        body = JSON.parse(bodyText);
      } catch {
        return jsonResponse(400, { error: 'Request must contain valid JSON.' });
      }

      const property = validateProperty(body.property);
      const token = randomBytes(32).toString('base64url');
      const store = getStore('property-shares');
      await store.setJSON(token, { property, createdAt: new Date().toISOString() });
      return jsonResponse(201, { token });
    } catch (error) {
      if (error instanceof Error && /^(Invalid |A property|Property contains)/.test(error.message)) {
        return jsonResponse(400, { error: error.message });
      }
      console.error('Unable to persist property share:', error);
      return jsonResponse(500, { error: 'Unable to save the property share.' });
    }
  }

  if (request.method === 'GET') {
    const token = new URL(request.url).searchParams.get('token');
    if (!token || !TOKEN_PATTERN.test(token)) {
      return jsonResponse(404, { error: 'Property share not found.' });
    }

    try {
      const store = getStore('property-shares');
      const record = await store.get(token, { type: 'json' });
      if (!record || !record.property || typeof record.property !== 'object') {
        return jsonResponse(404, { error: 'Property share not found.' });
      }
      return jsonResponse(200, { property: record.property });
    } catch (error) {
      console.error('Unable to retrieve property share:', error);
      return jsonResponse(500, { error: 'Unable to load the property share.' });
    }
  }

  return jsonResponse(405, { error: 'Method not allowed.' });
}
