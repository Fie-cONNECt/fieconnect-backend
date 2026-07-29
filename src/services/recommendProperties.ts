import mongoose from 'mongoose';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Application } from '../models/Application';
import {
  PropertyInteraction,
  INTERACTION_WEIGHTS,
} from '../models/PropertyInteraction';
import { formatProperty } from '../graphql/formatters';

type Prefs = {
  regions: string[];
  districts: string[];
  types: string[];
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: string[];
  amenities: string[];
  parking: string | null;
  onboardingStatus: string;
};

export type RecommendOptions = {
  limit?: number;
  region?: string | null;
  type?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
};

export type ScoredRecommendation = {
  property: ReturnType<typeof formatProperty>;
  score: number;
  reasons: string[];
};

const EARTH_KM = 6371;
const CANDIDATE_RECENT = 150;
const SIMILAR_TENANT_LIMIT = 40;
const HALF_LIFE_DAYS = 21;
const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'this',
  'that',
  'from',
  'your',
  'into',
  'have',
  'has',
  'are',
  'was',
  'were',
  'will',
  'can',
  'our',
  'you',
  'a',
  'an',
  'of',
  'in',
  'on',
  'to',
  'is',
  'it',
  'as',
  'by',
  'or',
  'at',
]);

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

function timeDecay(createdAt: Date | string | undefined, halfLifeDays = HALF_LIFE_DAYS): number {
  if (!createdAt) return 0.5;
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, ageDays / halfLifeDays);
}

function tokenize(text: string): Set<string> {
  return new Set(
    (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );
}

function textSimilarity(a: string, b: string): number {
  return jaccard(tokenize(a), tokenize(b));
}

function hasContentPrefs(prefs: Prefs): boolean {
  return (
    prefs.regions.length > 0 ||
    prefs.districts.length > 0 ||
    prefs.types.length > 0 ||
    prefs.bedrooms.length > 0 ||
    prefs.amenities.length > 0 ||
    prefs.parking != null ||
    prefs.minPrice != null ||
    prefs.maxPrice != null
  );
}

function contentScore(prop: any, prefs: Prefs): { score: number; reasons: string[] } {
  if (!hasContentPrefs(prefs)) return { score: 0, reasons: [] };

  const parts: number[] = [];
  const reasons: string[] = [];

  if (prefs.regions.length > 0) {
    const hit = prefs.regions.some((r) => r.toLowerCase() === prop.region?.toLowerCase());
    parts.push(hit ? 1 : 0);
    if (hit) reasons.push(`Matches your region (${prop.region})`);
  }
  if (prefs.districts.length > 0) {
    const hit = prefs.districts.some((d) => d.toLowerCase() === prop.district?.toLowerCase());
    parts.push(hit ? 1 : 0.15);
    if (hit) reasons.push(`In ${prop.district}`);
  }
  if (prefs.types.length > 0) {
    const hit = prefs.types.some((t) => t.toLowerCase() === prop.type?.toLowerCase());
    parts.push(hit ? 1 : 0);
    if (hit) reasons.push(`Matches ${prop.type}`);
  }
  if (prefs.bedrooms.length > 0) {
    const hit = prefs.bedrooms.includes(String(prop.bedrooms));
    parts.push(hit ? 1 : 0.2);
    if (hit) reasons.push(`${prop.bedrooms} bedroom${prop.bedrooms === '1' ? '' : 's'}`);
  }
  if (prefs.minPrice != null || prefs.maxPrice != null) {
    const price = Number(prop.price) || 0;
    const min = prefs.minPrice ?? 0;
    const max = prefs.maxPrice ?? Number.POSITIVE_INFINITY;
    if (price >= min && price <= max) {
      parts.push(1);
      reasons.push('Matches your budget');
    } else if (price < min) {
      parts.push(Math.max(0, 1 - (min - price) / Math.max(min, 1)));
    } else {
      parts.push(Math.max(0, 1 - (price - max) / Math.max(max, 1)));
    }
  }
  if (prefs.amenities.length > 0) {
    const propAmenities = new Set<string>(
      (prop.amenities || []).map((a: string) => a.toLowerCase()),
    );
    const prefAmenities = new Set(prefs.amenities.map((a) => a.toLowerCase()));
    const overlap = jaccard(prefAmenities, propAmenities);
    parts.push(overlap);
    if (overlap >= 0.3) reasons.push('Has amenities you like');
  }
  if (prefs.parking) {
    const hit = String(prop.parking).toLowerCase() === prefs.parking.toLowerCase();
    parts.push(hit ? 1 : 0.2);
    if (hit && prefs.parking === 'Yes') reasons.push('Has parking');
  }

  if (parts.length === 0) return { score: 0, reasons: [] };
  return { score: parts.reduce((s, x) => s + x, 0) / parts.length, reasons };
}

function locationScore(
  prop: any,
  preferredRegions: string[],
  preferredDistricts: string[],
  refLat: number | null,
  refLng: number | null,
): { score: number; reasons: string[] } {
  let score = 0.3;
  const reasons: string[] = [];

  if (preferredDistricts.length > 0) {
    if (preferredDistricts.some((d) => d.toLowerCase() === prop.district?.toLowerCase())) {
      score = 1;
      reasons.push(`Near your preferred area (${prop.district})`);
    } else if (preferredRegions.some((r) => r.toLowerCase() === prop.region?.toLowerCase())) {
      score = 0.7;
      reasons.push(`In ${prop.region}`);
    } else {
      score = 0.15;
    }
  } else if (preferredRegions.length > 0) {
    if (preferredRegions.some((r) => r.toLowerCase() === prop.region?.toLowerCase())) {
      score = 0.9;
      reasons.push(`In ${prop.region}`);
    } else {
      score = 0.2;
    }
  }

  if (
    refLat != null &&
    refLng != null &&
    typeof prop.lat === 'number' &&
    typeof prop.lng === 'number'
  ) {
    const km = haversineKm(refLat, refLng, prop.lat, prop.lng);
    const proximity = Math.max(0, 1 - km / 80);
    score = Math.min(1, score * 0.7 + proximity * 0.3);
    if (km <= 15) reasons.push('Close to places you like');
  }

  return { score, reasons };
}

function freshnessScore(createdAt: Date | string | undefined): number {
  if (!createdAt) return 0.5;
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - ageDays / 90);
}

function meanLatLng(props: any[]): { lat: number | null; lng: number | null } {
  const withGeo = props.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number');
  if (withGeo.length === 0) return { lat: null, lng: null };
  return {
    lat: withGeo.reduce((s, p) => s + p.lat, 0) / withGeo.length,
    lng: withGeo.reduce((s, p) => s + p.lng, 0) / withGeo.length,
  };
}

function itemSimilarity(a: any, b: any): number {
  let parts = 0;
  let sum = 0;
  if (a.type && b.type) {
    sum += a.type.toLowerCase() === b.type.toLowerCase() ? 1 : 0;
    parts += 1;
  }
  if (a.region && b.region) {
    sum += a.region.toLowerCase() === b.region.toLowerCase() ? 1 : 0.2;
    parts += 1;
  }
  if (a.district && b.district) {
    sum += a.district.toLowerCase() === b.district.toLowerCase() ? 1 : 0.15;
    parts += 1;
  }
  if (a.bedrooms && b.bedrooms) {
    sum += String(a.bedrooms) === String(b.bedrooms) ? 1 : 0.3;
    parts += 1;
  }
  if (typeof a.price === 'number' && typeof b.price === 'number') {
    const ratio = Math.min(a.price, b.price) / Math.max(a.price, b.price, 1);
    sum += ratio;
    parts += 1;
  }
  const amenitySim = jaccard(
    new Set((a.amenities || []).map((x: string) => x.toLowerCase())),
    new Set((b.amenities || []).map((x: string) => x.toLowerCase())),
  );
  sum += amenitySim;
  parts += 1;
  const aboutSim = textSimilarity(
    `${a.title || ''} ${a.about || ''}`,
    `${b.title || ''} ${b.about || ''}`,
  );
  sum += aboutSim;
  parts += 1;
  return parts === 0 ? 0 : sum / parts;
}

function diversityPenalty(
  candidate: any,
  selected: any[],
): number {
  if (selected.length === 0) return 0;
  let maxSim = 0;
  for (const s of selected) {
    let sim = 0;
    if (candidate.region === s.region) sim += 0.35;
    if (candidate.district === s.district) sim += 0.35;
    if (candidate.type === s.type) sim += 0.2;
    if (String(candidate.bedrooms) === String(s.bedrooms)) sim += 0.1;
    maxSim = Math.max(maxSim, sim);
  }
  return maxSim * 0.35;
}

function diversify(scored: { prop: any; score: number; reasons: string[] }[], limit: number) {
  const remaining = [...scored];
  const picked: typeof scored = [];
  while (picked.length < limit && remaining.length > 0) {
    let bestIdx = 0;
    let bestAdj = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const adj = remaining[i].score - diversityPenalty(remaining[i].prop, picked.map((p) => p.prop));
      if (adj > bestAdj) {
        bestAdj = adj;
        bestIdx = i;
      }
    }
    picked.push(remaining.splice(bestIdx, 1)[0]);
  }
  return picked;
}

function inferColdStartRegion(phone: string | undefined, popularRegion: string | null): string {
  if (phone?.includes('+233') || phone?.startsWith('233') || phone?.startsWith('0')) {
    return popularRegion || 'Greater Accra';
  }
  return popularRegion || 'Greater Accra';
}

function parseIncome(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9.]/g, '');
  const n = parseFloat(digits);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function sessionFilterBoost(
  prop: any,
  opts: RecommendOptions,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  let parts = 0;
  if (opts.region && opts.region !== 'All') {
    parts += 1;
    if (prop.region?.toLowerCase() === opts.region.toLowerCase()) {
      score += 1;
      reasons.push(`Matches your search in ${prop.region}`);
    }
  }
  if (opts.type && opts.type !== 'All') {
    parts += 1;
    if (prop.type?.toLowerCase() === opts.type.toLowerCase()) {
      score += 1;
      reasons.push(`Matches ${prop.type} search`);
    }
  }
  if (opts.minPrice != null || opts.maxPrice != null) {
    parts += 1;
    const price = Number(prop.price) || 0;
    const min = opts.minPrice ?? 0;
    const max = opts.maxPrice ?? Number.POSITIVE_INFINITY;
    if (price >= min && price <= max) {
      score += 1;
      reasons.push('In your search budget');
    }
  }
  return { score: parts === 0 ? 0 : score / parts, reasons };
}

export async function recommendPropertiesForUser(
  userId: string,
  options: RecommendOptions = {},
): Promise<ScoredRecommendation[]> {
  const limit = options.limit ?? 12;
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.userType !== 'TENANT') {
    const props = await Property.find({}).sort({ createdAt: -1 }).limit(limit);
    return props.map((prop) => ({
      property: formatProperty(prop),
      score: 0.5,
      reasons: ['Recently listed'],
    }));
  }

  const prefs: Prefs = {
    regions: (user as any).preferences?.regions ?? [],
    districts: (user as any).preferences?.districts ?? [],
    types: (user as any).preferences?.types ?? [],
    minPrice: (user as any).preferences?.minPrice ?? null,
    maxPrice: (user as any).preferences?.maxPrice ?? null,
    bedrooms: (user as any).preferences?.bedrooms ?? [],
    amenities: (user as any).preferences?.amenities ?? [],
    parking: (user as any).preferences?.parking ?? null,
    onboardingStatus: (user as any).preferences?.onboardingStatus ?? 'PENDING',
  };

  // Partial prefs count even when SKIPPED / PENDING (as long as fields exist)
  const contentEnabled = hasContentPrefs(prefs);

  const apps = await Application.find({ tenant: userId }).select('property status monthlyIncome');
  const appliedIds = new Set(
    apps.filter((a) => a.status !== 'REJECTED').map((a) => a.property.toString()),
  );
  const rejectedPropertyIds = new Set(
    apps.filter((a) => a.status === 'REJECTED').map((a) => a.property.toString()),
  );

  // Infer budget from monthly income when prefs lack price
  if (prefs.minPrice == null && prefs.maxPrice == null) {
    const incomes = apps
      .map((a) => parseIncome((a as any).monthlyIncome))
      .filter((n): n is number => n != null);
    if (incomes.length > 0) {
      const avg = incomes.reduce((s, n) => s + n, 0) / incomes.length;
      prefs.minPrice = Math.round(avg * 0.2);
      prefs.maxPrice = Math.round(avg * 0.4);
    }
  }

  const interactions = await PropertyInteraction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(500);

  const savedIds = new Set<string>(
    ((user as any).savedProperties || []).map((id: any) => String(id)),
  );
  const viewedIds = new Set<string>();
  const recentViewIds = new Set<string>();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const weightedPropertyAffinity = new Map<string, number>();
  for (const ix of interactions) {
    const pid = ix.property.toString();
    const w = (INTERACTION_WEIGHTS[ix.type] ?? 0) * timeDecay((ix as any).createdAt);
    weightedPropertyAffinity.set(pid, (weightedPropertyAffinity.get(pid) || 0) + w);
    if (ix.type === 'VIEW' || ix.type === 'VIEW_LONG') {
      viewedIds.add(pid);
      if (new Date((ix as any).createdAt).getTime() >= sevenDaysAgo) recentViewIds.add(pid);
    }
  }

  // Seed affinity from saves / applies if no interaction docs yet
  for (const id of savedIds) {
    if (!weightedPropertyAffinity.has(id)) weightedPropertyAffinity.set(id, 0.7);
  }
  for (const id of appliedIds) {
    weightedPropertyAffinity.set(id, Math.max(weightedPropertyAffinity.get(id) || 0, 1.0));
  }
  for (const id of rejectedPropertyIds) {
    weightedPropertyAffinity.set(id, (weightedPropertyAffinity.get(id) || 0) - 0.55);
  }

  const ownPositiveIds = new Set(
    [...weightedPropertyAffinity.entries()].filter(([, w]) => w > 0.2).map(([id]) => id),
  );

  // Candidate pool: recent + preferred regions + popular + exploration
  const recent = await Property.find({}).sort({ createdAt: -1 }).limit(CANDIDATE_RECENT);
  let preferredRegions = [...prefs.regions];
  let preferredDistricts = [...prefs.districts];

  // Session search filters as soft prefs
  if (options.region && options.region !== 'All' && !preferredRegions.includes(options.region)) {
    preferredRegions = [...preferredRegions, options.region];
  }
  if (options.type && options.type !== 'All' && !prefs.types.includes(options.type)) {
    prefs.types = [...prefs.types, options.type];
  }
  if (options.minPrice != null && prefs.minPrice == null) prefs.minPrice = options.minPrice;
  if (options.maxPrice != null && prefs.maxPrice == null) prefs.maxPrice = options.maxPrice;

  let interactionProps: any[] = [];
  if (ownPositiveIds.size > 0) {
    interactionProps = await Property.find({
      _id: { $in: [...ownPositiveIds].map((id) => new mongoose.Types.ObjectId(id)) },
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

  // Popularity by region for cold start
  const saveAgg = await User.aggregate([
    { $match: { userType: 'TENANT' } },
    { $unwind: '$savedProperties' },
    { $group: { _id: '$savedProperties', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 80 },
  ]);
  const saveCounts = new Map<string, number>(saveAgg.map((r) => [r._id.toString(), r.count]));
  const popularIds = saveAgg.map((r) => r._id);
  const popularProps =
    popularIds.length > 0 ? await Property.find({ _id: { $in: popularIds } }) : [];

  // Most popular region on platform
  const regionCounts = new Map<string, number>();
  for (const p of popularProps) {
    regionCounts.set(p.region, (regionCounts.get(p.region) || 0) + (saveCounts.get(p.id) || 1));
  }
  let popularRegion: string | null = null;
  let maxRegionCount = 0;
  for (const [r, c] of regionCounts) {
    if (c > maxRegionCount) {
      maxRegionCount = c;
      popularRegion = r;
    }
  }

  if (preferredRegions.length === 0) {
    preferredRegions = [inferColdStartRegion((user as any).phone, popularRegion)];
  }

  const regionProps =
    preferredRegions.length > 0
      ? await Property.find({ region: { $in: preferredRegions } })
          .sort({ createdAt: -1 })
          .limit(100)
      : [];

  // Random exploration slice
  const explore = await Property.aggregate([{ $sample: { size: 25 } }]);

  const byId = new Map<string, any>();
  for (const p of [...recent, ...popularProps, ...regionProps, ...explore, ...interactionProps]) {
    byId.set(p.id || p._id?.toString(), p);
  }
  const filtered = [...byId.values()].filter((p) => !appliedIds.has(p.id));

  const { lat: refLat, lng: refLng } = meanLatLng(interactionProps);

  // Landlord quality: approval rate & dispute burden
  const landlordStats = new Map<string, { apps: number; approved: number; disputes: number }>();
  const allAppsSample = await Application.find({})
    .select('property status')
    .limit(2000)
    .populate('property', 'landlord');
  for (const app of allAppsSample) {
    const landlordId = (app.property as any)?.landlord?.toString?.() || (app.property as any)?.landlord;
    if (!landlordId) continue;
    const key = String(landlordId);
    if (!landlordStats.has(key)) landlordStats.set(key, { apps: 0, approved: 0, disputes: 0 });
    const s = landlordStats.get(key)!;
    s.apps += 1;
    if (app.status === 'APPROVED' || app.status === 'APPROVED_PENDING_SIGNATURE') s.approved += 1;
  }

  // Collaborative: similar tenants by weighted interactions + region overlap
  const otherTenants = await User.find({
    userType: 'TENANT',
    _id: { $ne: userId },
  })
    .select('savedProperties preferences')
    .limit(300);

  const otherApps = await Application.find({
    tenant: { $in: otherTenants.map((t) => t._id) },
    status: { $ne: 'REJECTED' },
  }).select('tenant property createdAt');

  const appsByTenant = new Map<string, Set<string>>();
  for (const app of otherApps) {
    const tid = app.tenant.toString();
    if (!appsByTenant.has(tid)) appsByTenant.set(tid, new Set());
    appsByTenant.get(tid)!.add(app.property.toString());
  }

  const otherIx = await PropertyInteraction.find({
    user: { $in: otherTenants.map((t) => t._id) },
    type: { $in: ['SAVE', 'APPLY', 'VIEW_LONG'] },
  })
    .select('user property type createdAt')
    .limit(5000);

  const ixByTenant = new Map<string, Map<string, number>>();
  for (const ix of otherIx) {
    const tid = ix.user.toString();
    if (!ixByTenant.has(tid)) ixByTenant.set(tid, new Map());
    const m = ixByTenant.get(tid)!;
    const pid = ix.property.toString();
    const w = (INTERACTION_WEIGHTS[ix.type] ?? 0) * timeDecay((ix as any).createdAt);
    m.set(pid, (m.get(pid) || 0) + w);
  }

  type Similar = { id: string; score: number; affinity: Map<string, number> };
  const similar: Similar[] = [];
  const ownSet = new Set(ownPositiveIds);

  for (const other of otherTenants) {
    const oid = other.id;
    const affinity = new Map<string, number>(ixByTenant.get(oid) || []);
    for (const pid of (other as any).savedProperties || []) {
      const key = pid.toString();
      if (!affinity.has(key)) affinity.set(key, 0.7);
    }
    for (const pid of appsByTenant.get(oid) || []) {
      affinity.set(pid, Math.max(affinity.get(pid) || 0, 1.0));
    }
    const otherPos = new Set([...affinity.entries()].filter(([, w]) => w > 0.2).map(([id]) => id));
    let sim = jaccard(ownSet, otherPos);

    const otherRegions: string[] = (other as any).preferences?.regions ?? [];
    if (prefs.regions.length > 0 && otherRegions.length > 0) {
      const regionOverlap = jaccard(
        new Set(prefs.regions.map((r) => r.toLowerCase())),
        new Set(otherRegions.map((r) => r.toLowerCase())),
      );
      sim = Math.max(sim, regionOverlap * 0.6);
    }

    if (sim > 0.05 && otherPos.size > 0) {
      similar.push({ id: oid, score: sim, affinity });
    }
  }
  similar.sort((a, b) => b.score - a.score);
  const topSimilar = similar.slice(0, SIMILAR_TENANT_LIMIT);

  const collabScores = new Map<string, number>();
  for (const s of topSimilar) {
    for (const [pid, w] of s.affinity) {
      if (ownSet.has(pid) || appliedIds.has(pid)) continue;
      collabScores.set(pid, (collabScores.get(pid) || 0) + s.score * Math.max(w, 0));
    }
  }
  const maxCollab = Math.max(1, ...collabScores.values(), 1);
  const maxSaves = Math.max(1, ...saveCounts.values(), 1);

  // Item–item: similarity to positively interacted listings
  const seedProps = interactionProps.filter((p) => (weightedPropertyAffinity.get(p.id) || 0) > 0.2);

  // Negative seeds from rejected applications (same landlord / district soft penalty later)
  const rejectedProps =
    rejectedPropertyIds.size > 0
      ? await Property.find({
          _id: { $in: [...rejectedPropertyIds].map((id) => new mongoose.Types.ObjectId(id)) },
        })
      : [];
  const rejectedLandlords = new Set(
    rejectedProps.map((p) => p.landlord?.toString()).filter(Boolean),
  );
  const rejectedDistricts = new Set(rejectedProps.map((p) => p.district).filter(Boolean));

  const coldStart = ownPositiveIds.size === 0 && !contentEnabled;

  let wContent = contentEnabled ? 0.4 : 0;
  let wLocation = 0.2;
  let wCollab = contentEnabled ? 0.18 : 0.35;
  let wItem = ownPositiveIds.size > 0 ? 0.12 : 0;
  let wFresh = 0.05;
  let wQuality = 0.05;
  let wSession = options.region || options.type || options.minPrice != null ? 0.1 : 0;

  if (coldStart) {
    wContent = 0;
    wLocation = 0.3;
    wCollab = 0.3;
    wItem = 0;
    wFresh = 0.25;
    wQuality = 0.1;
    wSession = Math.max(wSession, 0.05);
  } else if (!contentEnabled && ownPositiveIds.size > 0) {
    wContent = 0;
    wLocation = 0.28;
    wCollab = 0.35;
    wItem = 0.18;
    wFresh = 0.1;
    wQuality = 0.09;
  }

  // Normalize weights
  const wSum = wContent + wLocation + wCollab + wItem + wFresh + wQuality + wSession || 1;
  wContent /= wSum;
  wLocation /= wSum;
  wCollab /= wSum;
  wItem /= wSum;
  wFresh /= wSum;
  wQuality /= wSum;
  wSession /= wSum;

  const scored = filtered.map((prop) => {
    const id = prop.id;
    const content = contentScore(prop, prefs);
    const location = locationScore(prop, preferredRegions, preferredDistricts, refLat, refLng);
    const session = sessionFilterBoost(prop, options);

    let collab = (collabScores.get(id) || 0) / maxCollab;
    const popularity = (saveCounts.get(id) || 0) / maxSaves;
    if (coldStart || collab === 0) {
      const regionBoost = preferredRegions.some(
        (r) => r.toLowerCase() === prop.region?.toLowerCase(),
      )
        ? 0.25
        : 0;
      const verifiedBoost = prop.verified ? 0.15 : 0;
      collab = Math.min(1, collab * 0.5 + popularity * 0.5 + regionBoost + verifiedBoost);
    }

    let item = 0;
    if (seedProps.length > 0) {
      let best = 0;
      for (const seed of seedProps) {
        const sim = itemSimilarity(prop, seed) * Math.min(1, weightedPropertyAffinity.get(seed.id) || 0.5);
        best = Math.max(best, sim);
      }
      item = best;
    }

    const f = freshnessScore((prop as any).createdAt);

    const landlordId = prop.landlord?.toString?.() || String(prop.landlord || '');
    const ls = landlordStats.get(landlordId);
    let quality = prop.verified ? 0.55 : 0.35;
    if (ls && ls.apps > 0) {
      quality = Math.min(1, 0.4 + (ls.approved / ls.apps) * 0.5 + (prop.verified ? 0.1 : 0));
    }

    // Penalties
    let penalty = 0;
    if (savedIds.has(id)) penalty += 0.12;
    if (recentViewIds.has(id)) penalty += 0.2;
    else if (viewedIds.has(id)) penalty += 0.08;
    if (rejectedLandlords.has(landlordId)) penalty += 0.15;
    if (rejectedDistricts.has(prop.district) && rejectedPropertyIds.size > 0) penalty += 0.08;

    const score =
      wContent * content.score +
      wLocation * location.score +
      wCollab * collab +
      wItem * item +
      wFresh * f +
      wQuality * quality +
      wSession * session.score -
      penalty;

    const reasons = [
      ...content.reasons,
      ...location.reasons,
      ...session.reasons,
    ];
    if (item >= 0.55 && seedProps.length > 0) {
      reasons.push('Similar to a listing you liked');
    }
    if (collab >= 0.45 && !coldStart) {
      reasons.push('Popular with tenants like you');
    } else if (popularity >= 0.4) {
      reasons.push('Popular right now');
    }
    if (prop.verified) reasons.push('Verified listing');
    if (f >= 0.75) reasons.push('Newly listed');
    if (quality >= 0.75 && ls && ls.apps >= 2) reasons.push('Responsive landlord');

    // Deduplicate reasons, cap at 3
    const uniqueReasons = [...new Set(reasons)].slice(0, 3);
    if (uniqueReasons.length === 0) uniqueReasons.push('Recommended for you');

    return { prop, score, reasons: uniqueReasons };
  });

  scored.sort((a, b) => b.score - a.score);
  const diversified = diversify(scored, limit);

  return diversified.map(({ prop, score, reasons }) => ({
    property: formatProperty(prop),
    score: Math.round(score * 1000) / 1000,
    reasons,
  }));
}

/** Record a property view; upgrades to VIEW_LONG when duration >= 30s. */
export async function trackPropertyView(
  userId: string,
  propertyId: string,
  durationSec?: number | null,
) {
  const exists = await Property.exists({ _id: propertyId });
  if (!exists) throw new Error('Property not found');

  const type = durationSec != null && durationSec >= 30 ? 'VIEW_LONG' : 'VIEW';
  await PropertyInteraction.create({
    user: userId,
    property: propertyId,
    type,
    durationSec: durationSec ?? null,
  });
  return true;
}
