import { PropertyInteraction } from '../models/PropertyInteraction';
import { Application } from '../models/Application';
import { Dispute } from '../models/Dispute';

export type ActivityType =
  | 'VIEWED_PROPERTY'
  | 'SAVED_PROPERTY'
  | 'APPLIED'
  | 'APPLICATION_UPDATED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_UPDATED';

export interface ActivityPropertySummary {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string | null;
  status: string | null;
  link: string;
  createdAt: string;
  property: ActivityPropertySummary | null;
}

function toIso(value: Date | string | undefined | null): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  return value.toISOString();
}

function summarizeProperty(prop: any): ActivityPropertySummary | null {
  if (!prop) return null;
  const id = prop.id || prop._id?.toString();
  if (!id) return null;
  return {
    id,
    title: prop.title || 'Property',
    location: prop.location || prop.district || prop.region || '',
    image: prop.image || prop.images?.main || '',
    price: typeof prop.price === 'number' ? prop.price : 0,
  };
}

function applicationStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending review';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'INFORMATION_REQUESTED':
      return 'More info requested';
    case 'APPROVED_PENDING_SIGNATURE':
      return 'Awaiting your signature';
    case 'CANCELLED':
      return 'Cancelled by you';
    default:
      return status;
  }
}
/**
 * Build a time-ordered activity feed for a tenant from interactions,
 * applications, and disputes. Views are deduped per property; unsaved
 * listings are omitted from the saved stream.
 */
export async function getRecentActivityForUser(
  userId: string,
  limit = 12,
): Promise<ActivityItem[]> {
  const capped = Math.min(Math.max(limit || 12, 1), 40);
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const items: ActivityItem[] = [];

  const [interactions, applications, tenantTenancies] = await Promise.all([
    PropertyInteraction.find({
      user: userId,
      type: { $in: ['VIEW', 'VIEW_LONG', 'SAVE', 'UNSAVE'] },
      createdAt: { $gte: since },
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('property')
      .lean(),
    Application.find({ tenant: userId })
      .sort({ updatedAt: -1 })
      .limit(40)
      .populate('property')
      .lean(),
    Application.find({
      tenant: userId,
      status: { $in: ['APPROVED', 'APPROVED_PENDING_SIGNATURE'] },
    })
      .select('_id')
      .lean(),
  ]);

  const tenancyIds = tenantTenancies.map((t) => t._id);
  const disputes =
    tenancyIds.length === 0
      ? []
      : await Dispute.find({ tenancy: { $in: tenancyIds } })
          .sort({ updatedAt: -1 })
          .limit(30)
          .populate({ path: 'tenancy', populate: { path: 'property' } })
          .lean();

  // ── Views & saves (deduped) ──────────────────────────────────────────
  const latestViewByProperty = new Map<string, any>();
  const latestSaveSignalByProperty = new Map<string, any>();

  for (const row of interactions) {
    const propId = (row.property as any)?._id?.toString?.() || (row.property as any)?.toString?.();
    if (!propId) continue;

    if (row.type === 'VIEW' || row.type === 'VIEW_LONG') {
      // Interactions are newest-first; keep the first (latest) per property.
      if (!latestViewByProperty.has(propId)) {
        latestViewByProperty.set(propId, row);
      }
      continue;
    }

    if (row.type === 'SAVE' || row.type === 'UNSAVE') {
      if (!latestSaveSignalByProperty.has(propId)) {
        latestSaveSignalByProperty.set(propId, row);
      }
    }
  }

  for (const [propId, row] of latestViewByProperty) {
    const property = summarizeProperty(row.property);
    const title = property?.title || 'a property';
    const longView = row.type === 'VIEW_LONG';
    items.push({
      id: `view-${propId}-${toIso(row.createdAt)}`,
      type: 'VIEWED_PROPERTY',
      title: `Viewed ${title}`,
      subtitle: longView
        ? 'Spent time reviewing this listing'
        : property?.location || 'Browsed listing details',
      status: longView ? 'VIEWED' : 'VIEWED',
      link: `/app/property/${propId}`,
      createdAt: toIso(row.createdAt),
      property,
    });
  }

  for (const [propId, row] of latestSaveSignalByProperty) {
    if (row.type !== 'SAVE') continue;
    const property = summarizeProperty(row.property);
    const title = property?.title || 'a property';
    items.push({
      id: `save-${propId}-${toIso(row.createdAt)}`,
      type: 'SAVED_PROPERTY',
      title: `Saved ${title}`,
      subtitle: property?.location || 'Added to your saved listings',
      status: 'SAVED',
      link: `/app/property/${propId}`,
      createdAt: toIso(row.createdAt),
      property,
    });
  }

  // ── Applications ─────────────────────────────────────────────────────
  for (const app of applications) {
    const property = summarizeProperty(app.property);
    const propTitle = property?.title || 'a property';
    const appId = (app as any)._id?.toString() || (app as any).id;
    const createdAt = toIso((app as any).createdAt);
    const updatedAt = toIso((app as any).updatedAt);
    const status = app.status || 'PENDING';

    items.push({
      id: `apply-${appId}`,
      type: 'APPLIED',
      title: `Applied to ${propTitle}`,
      subtitle: `Application ${applicationStatusLabel(status).toLowerCase()}`,
      status,
      link: '/app/applications',
      createdAt,
      property,
    });

    const updatedMs = new Date(updatedAt).getTime();
    const createdMs = new Date(createdAt).getTime();
    if (status !== 'PENDING' && updatedMs - createdMs > 60_000) {
      items.push({
        id: `app-update-${appId}-${updatedAt}`,
        type: 'APPLICATION_UPDATED',
        title: `Application update · ${propTitle}`,
        subtitle: applicationStatusLabel(status),
        status,
        link: '/app/applications',
        createdAt: updatedAt,
        property,
      });
    }
  }

  // ── Disputes ─────────────────────────────────────────────────────────
  for (const dispute of disputes) {
    const tenancy = dispute.tenancy as any;
    const property = summarizeProperty(tenancy?.property);
    const disputeId = (dispute as any)._id?.toString() || (dispute as any).id;
    const createdAt = toIso((dispute as any).createdAt);
    const updatedAt = toIso((dispute as any).updatedAt);
    const status = dispute.status || 'OPEN';

    items.push({
      id: `dispute-${disputeId}`,
      type: 'DISPUTE_OPENED',
      title: `Dispute opened · ${dispute.title}`,
      subtitle: property?.title || 'Related to your tenancy',
      status,
      link: `/app/disputes/${disputeId}`,
      createdAt,
      property,
    });

    const updatedMs = new Date(updatedAt).getTime();
    const createdMs = new Date(createdAt).getTime();
    if (updatedMs - createdMs > 60_000) {
      items.push({
        id: `dispute-update-${disputeId}-${updatedAt}`,
        type: 'DISPUTE_UPDATED',
        title: `Dispute update · ${dispute.title}`,
        subtitle: status === 'RESOLVED' ? 'Marked as resolved' : 'New activity on this dispute',
        status,
        link: `/app/disputes/${disputeId}`,
        createdAt: updatedAt,
        property,
      });
    }
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items.slice(0, capped);
}
