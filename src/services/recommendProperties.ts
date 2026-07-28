import mongoose from 'mongoose';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Application } from '../models/Application';
import { formatProperty } from '../graphql/formatters';

type Prefs = {
  regions: string[];
  districts: string[];
  types: string[];
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: string[];
  amenities: string[];
  onboardingStatus: string;
};

const EARTH_KM = 6371;
const CANDIDATE_LIMIT = 200;
const SIMILAR_TENANT_LIMIT = 40;

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const x of a) {
    if (b.has(x)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(a));
}

function hasContentPrefs(prefs: Prefs): boolean {
  return (
    prefs.regions.length > 0 ||
    prefs.districts.length > 0 ||
    prefs.types.length > 0 ||
    prefs.bedrooms.length > 0 ||
    prefs.amenities.length > 0 ||
    prefs.minPrice != null ||
    prefs.maxPrice != null
  );
}

function contentScore(prop: any, prefs: Prefs): number {
  if (!hasContentPrefs(prefs)) return 0;

  const parts: number[] = [];

  if (prefs.regions.length > 0) {
    parts.push(prefs.regions.some((r) => r.toLowerCase() === prop.region?.toLowerCase()) ? 1 : 0);
  }
  if (prefs.districts.length > 0) {
    parts.push(
      prefs.districts.some((d) => d.toLowerCase() === prop.district?.toLowerCase()) ? 1 : 0.15,
    );
  }
  if (prefs.types.length > 0) {
    parts.push(prefs.types.some((t) => t.toLowerCase() === prop.type?.toLowerCase()) ? 1 : 0);
  }
  if (prefs.bedrooms.length > 0) {
    parts.push(prefs.bedrooms.includes(String(prop.bedrooms)) ? 1 : 0.2);
  }
  if (prefs.minPrice != null || prefs.maxPrice != null) {
    const price = Number(prop.price) || 0;
    const min = prefs.minPrice ?? 0;
    const max = prefs.maxPrice ?? Number.POSITIVE_INFINITY;
    if (price >= min && price <= max) {
      parts.push(1);
    } else if (price < min) {
      const gap = min - price;
      parts.push(Math.max(0, 1 - gap / Math.max(min, 1)));
    } else {
      const gap = price - max;
      parts.push(Math.max(0, 1 - gap / Math.max(max, 1)));
    }
  }
  if (prefs.amenities.length > 0) {
    const propAmenities = new Set<string>(
      (prop.amenities || []).map((a: string) => a.toLowerCase()),
    );
    const prefAmenities = new Set(prefs.amenities.map((a) => a.toLowerCase()));
    parts.push(jaccard(prefAmenities, propAmenities));
  }

  if (parts.length === 0) return 0;
  return parts.reduce((s, x) => s + x, 0) / parts.length;
}

function locationScore(
  prop: any,
  preferredRegions: string[],
  preferredDistricts: string[],
  refLat: number | null,
  refLng: number | null,
): number {
  let score = 0.3; // baseline

  if (preferredDistricts.length > 0) {
    if (preferredDistricts.some((d) => d.toLowerCase() === prop.district?.toLowerCase())) {
      score = 1;
    } else if (preferredRegions.some((r) => r.toLowerCase() === prop.region?.toLowerCase())) {
      score = 0.7;
    } else {
      score = 0.15;
    }
  } else if (preferredRegions.length > 0) {
    score = preferredRegions.some((r) => r.toLowerCase() === prop.region?.toLowerCase())
      ? 0.9
      : 0.2;
  }

  if (
    refLat != null &&
    refLng != null &&
    typeof prop.lat === 'number' &&
    typeof prop.lng === 'number'
  ) {
    const km = haversineKm(refLat, refLng, prop.lat, prop.lng);
    // Soft proximity: full credit within ~5km, fades by ~80km
    const proximity = Math.max(0, 1 - km / 80);
    score = Math.min(1, score * 0.7 + proximity * 0.3);
  }

  return score;
}

function freshnessScore(createdAt: Date | string | undefined): number {
  if (!createdAt) return 0.5;
  const created = new Date(createdAt).getTime();
  const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - ageDays / 90);
}

function meanLatLng(props: any[]): { lat: number | null; lng: number | null } {
  const withGeo = props.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number');
  if (withGeo.length === 0) return { lat: null, lng: null };
  const lat = withGeo.reduce((s, p) => s + p.lat, 0) / withGeo.length;
  const lng = withGeo.reduce((s, p) => s + p.lng, 0) / withGeo.length;
  return { lat, lng };
}

export async function recommendPropertiesForUser(userId: string, limit = 12) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Landlords / non-tenants: newest verified-ish feed
  if (user.userType !== 'TENANT') {
    const props = await Property.find({}).sort({ createdAt: -1 }).limit(limit);
    return props.map(formatProperty);
  }

  const prefs: Prefs = {
    regions: (user as any).preferences?.regions ?? [],
    districts: (user as any).preferences?.districts ?? [],
    types: (user as any).preferences?.types ?? [],
    minPrice: (user as any).preferences?.minPrice ?? null,
    maxPrice: (user as any).preferences?.maxPrice ?? null,
    bedrooms: (user as any).preferences?.bedrooms ?? [],
    amenities: (user as any).preferences?.amenities ?? [],
    onboardingStatus: (user as any).preferences?.onboardingStatus ?? 'PENDING',
  };

  const contentEnabled = hasContentPrefs(prefs) && prefs.onboardingStatus === 'COMPLETED';

  const apps = await Application.find({
    tenant: userId,
    status: { $ne: 'REJECTED' },
  }).select('property');
  const appliedIds = new Set(apps.map((a) => a.property.toString()));
  const savedIds = new Set<string>(
    ((user as any).savedProperties || []).map((id: any) => String(id)),
  );
  const ownInteractions = new Set<string>([...savedIds, ...appliedIds]);

  const candidates = await Property.find({}).sort({ createdAt: -1 }).limit(CANDIDATE_LIMIT);
  const filtered = candidates.filter((p) => !appliedIds.has(p.id));

  // Infer location from prefs or interaction history
  let preferredRegions = [...prefs.regions];
  let preferredDistricts = [...prefs.districts];
  let interactionProps: any[] = [];

  if (ownInteractions.size > 0) {
    interactionProps = await Property.find({
      _id: { $in: [...ownInteractions].map((id) => new mongoose.Types.ObjectId(id)) },
    });
    if (preferredRegions.length === 0) {
      preferredRegions = [
        ...new Set(interactionProps.map((p) => p.region).filter(Boolean) as string[]),
      ];
    }
    if (preferredDistricts.length === 0) {
      preferredDistricts = [
        ...new Set(interactionProps.map((p) => p.district).filter(Boolean) as string[]),
      ];
    }
  }

  if (preferredRegions.length === 0) {
    preferredRegions = ['Greater Accra'];
  }

  const { lat: refLat, lng: refLng } = meanLatLng(interactionProps);

  // Collaborative: similar tenants by interaction Jaccard (+ region overlap)
  const otherTenants = await User.find({
    userType: 'TENANT',
    _id: { $ne: userId },
  })
    .select('savedProperties preferences')
    .limit(300);

  const otherApps = await Application.find({
    tenant: { $in: otherTenants.map((t) => t._id) },
    status: { $ne: 'REJECTED' },
  }).select('tenant property');

  const appsByTenant = new Map<string, Set<string>>();
  for (const app of otherApps) {
    const tid = app.tenant.toString();
    if (!appsByTenant.has(tid)) appsByTenant.set(tid, new Set());
    appsByTenant.get(tid)!.add(app.property.toString());
  }

  type Similar = { id: string; score: number; interactions: Set<string> };
  const similar: Similar[] = [];

  for (const other of otherTenants) {
    const oid = other.id;
    const otherSaved = new Set<string>(
      ((other as any).savedProperties || []).map((id: any) => String(id)),
    );
    const otherApplied = appsByTenant.get(oid) || new Set<string>();
    const otherInteractions = new Set<string>([...otherSaved, ...otherApplied]);

    let sim = jaccard(ownInteractions, otherInteractions);

    const otherRegions: string[] = (other as any).preferences?.regions ?? [];
    if (prefs.regions.length > 0 && otherRegions.length > 0) {
      const regionOverlap = jaccard(
        new Set(prefs.regions.map((r) => r.toLowerCase())),
        new Set(otherRegions.map((r) => r.toLowerCase())),
      );
      sim = Math.max(sim, regionOverlap * 0.6);
    }

    if (sim > 0.05 && otherInteractions.size > 0) {
      similar.push({ id: oid, score: sim, interactions: otherInteractions });
    }
  }

  similar.sort((a, b) => b.score - a.score);
  const topSimilar = similar.slice(0, SIMILAR_TENANT_LIMIT);

  // Popularity: save counts across all tenants
  const saveCounts = new Map<string, number>();
  const allTenantsForPop = await User.find({ userType: 'TENANT' }).select('savedProperties');
  for (const t of allTenantsForPop) {
    for (const pid of (t as any).savedProperties || []) {
      const key = pid.toString();
      saveCounts.set(key, (saveCounts.get(key) || 0) + 1);
    }
  }
  const maxSaves = Math.max(1, ...saveCounts.values(), 1);

  const collabCounts = new Map<string, number>();
  for (const s of topSimilar) {
    for (const pid of s.interactions) {
      if (ownInteractions.has(pid)) continue;
      collabCounts.set(pid, (collabCounts.get(pid) || 0) + s.score);
    }
  }
  const maxCollab = Math.max(1, ...collabCounts.values(), 1);

  const coldStart = ownInteractions.size === 0 && !contentEnabled;

  // Weights by mode
  let wContent = contentEnabled ? 0.45 : 0;
  let wLocation = 0.25;
  let wCollab = contentEnabled ? 0.25 : 0.45;
  let wFresh = 0.05;

  if (coldStart) {
    wContent = 0;
    wLocation = 0.35;
    wCollab = 0.35; // popularity blended into collab slot
    wFresh = 0.3;
  } else if (!contentEnabled && ownInteractions.size > 0) {
    wContent = 0;
    wLocation = 0.35;
    wCollab = 0.5;
    wFresh = 0.15;
  }

  const scored = filtered.map((prop) => {
    const id = prop.id;
    const c = contentScore(prop, prefs);
    const l = locationScore(prop, preferredRegions, preferredDistricts, refLat, refLng);

    let collab = (collabCounts.get(id) || 0) / maxCollab;
    if (coldStart || collab === 0) {
      const popularity = (saveCounts.get(id) || 0) / maxSaves;
      const regionBoost = preferredRegions.some(
        (r) => r.toLowerCase() === prop.region?.toLowerCase(),
      )
        ? 0.3
        : 0;
      const verifiedBoost = prop.verified ? 0.2 : 0;
      collab = Math.min(1, collab * 0.5 + popularity * 0.5 + regionBoost + verifiedBoost);
    }

    const f = freshnessScore((prop as any).createdAt);
    const savedPenalty = savedIds.has(id) ? 0.08 : 0;

    const score = wContent * c + wLocation * l + wCollab * collab + wFresh * f - savedPenalty;

    return { prop, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ prop }) => formatProperty(prop));
}
