/** Shared GraphQL response mappers for User and Property. */
import mongoose from 'mongoose';

/**
 * Normalize Mongo ids for queries. Never use ObjectId.id — that property is a
 * 12-byte Buffer and breaks Cast to ObjectId.
 */
export function toIdString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    return mongoose.Types.ObjectId.isValid(value) ? value : null;
  }
  if (Buffer.isBuffer(value)) {
    if (value.length !== 12) return null;
    try {
      return new mongoose.Types.ObjectId(value).toString();
    } catch {
      return null;
    }
  }
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (obj._id != null) return toIdString(obj._id);
    // Prefer toString() on ObjectId-like values (hex), not .id (Buffer)
    if (typeof obj.toString === 'function' && obj.toString !== Object.prototype.toString) {
      const asString = obj.toString();
      if (/^[a-fA-F0-9]{24}$/.test(asString)) return asString;
    }
  }
  return null;
}

export function formatPreferences(prefs: any) {
  return {
    regions: prefs?.regions ?? [],
    districts: prefs?.districts ?? [],
    types: prefs?.types ?? [],
    minPrice: prefs?.minPrice ?? null,
    maxPrice: prefs?.maxPrice ?? null,
    bedrooms: prefs?.bedrooms ?? [],
    amenities: prefs?.amenities ?? [],
    parking: prefs?.parking ?? null,
    onboardingStatus: prefs?.onboardingStatus ?? 'PENDING',
  };
}

export function formatUser(user: any) {
  return {
    id: user.id || user._id?.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
    phone: user.phone,
    avatarUrl: user.avatarUrl || null,
    bio: user.bio || null,
    savedProperties: [],
    preferences: formatPreferences(user.preferences),
    createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString?.() || new Date().toISOString(),
  };
}

export function formatProperty(prop: any) {
  return {
    id: prop.id || prop._id?.toString(),
    title: prop.title,
    type: prop.type,
    location: prop.location,
    region: prop.region,
    district: prop.district,
    price: prop.price,
    verified: prop.verified,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    size: prop.size,
    parking: prop.parking,
    about: prop.about,
    amenities: prop.amenities || [],
    mapDescription: prop.mapDescription || null,
    videoUrl: prop.videoUrl || null,
    lat: prop.lat ?? null,
    lng: prop.lng ?? null,
    image: prop.image,
    images: {
      main: prop.images?.main || prop.image,
      kitchen: prop.images?.kitchen || '',
      bedroom: prop.images?.bedroom || '',
      bathroom: prop.images?.bathroom || '',
    },
    agreementUrl: prop.agreementUrl || null,
    landlord: prop.landlord as any,
    createdAt: prop.createdAt?.toISOString?.() || new Date().toISOString(),
    updatedAt: prop.updatedAt?.toISOString?.() || new Date().toISOString(),
  };
}

/** Placeholder when an application still references a deleted listing (e.g. after reseed). */
export function unavailableProperty(id?: string | null) {
  const now = new Date().toISOString();
  const image =
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop';
  return {
    id: id || 'unavailable',
    title: 'Listing no longer available',
    type: 'Apartment',
    location: 'Unavailable',
    region: 'Unavailable',
    district: 'Unavailable',
    price: 0,
    verified: false,
    bedrooms: '1',
    bathrooms: '1',
    size: '—',
    parking: 'No',
    about: 'This listing was removed or is no longer available.',
    amenities: [] as string[],
    mapDescription: null,
    videoUrl: null,
    lat: null,
    lng: null,
    image,
    images: {
      main: image,
      kitchen: '',
      bedroom: '',
      bathroom: '',
    },
    agreementUrl: null,
    landlord: {
      id: 'unavailable',
      firstName: 'Unknown',
      lastName: 'Landlord',
      email: 'unavailable@fieconnect.app',
      userType: 'LANDLORD',
      phone: '',
      avatarUrl: null,
      bio: null,
      savedProperties: [],
      preferences: formatPreferences(null),
      createdAt: now,
      updatedAt: now,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function unavailableUser(id?: string | null) {
  const now = new Date().toISOString();
  return {
    id: id || 'unavailable',
    firstName: 'Unknown',
    lastName: 'User',
    email: 'unavailable@fieconnect.app',
    userType: 'TENANT',
    phone: '',
    avatarUrl: null,
    bio: null,
    savedProperties: [],
    preferences: formatPreferences(null),
    createdAt: now,
    updatedAt: now,
  };
}
