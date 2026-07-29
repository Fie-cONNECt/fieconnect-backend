/** Shared GraphQL response mappers for User and Property. */

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
