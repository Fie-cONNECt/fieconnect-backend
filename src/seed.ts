import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { Property } from './models/Property';
import { User } from './models/User';
import { Application } from './models/Application';
import { PropertyInteraction } from './models/PropertyInteraction';
import { Dispute } from './models/Dispute';

const REGIONS = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'Northern',
  'North East',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
] as const;

const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Studio',
  'Villa',
  'Townhouse',
  'Duplex',
  'Penthouse',
] as const;

/** Matches onboarding / recommender bedroom preference values */
const BEDROOM_OPTIONS = ['1', '2', '3', '4', '5+'] as const;
const BATHROOM_OPTIONS = ['1', '2', '3', '4'] as const;
const PARKING_OPTIONS = ['Yes', 'No'] as const;

/** Representative prices across every rent-range bucket used in the UI */
const PRICE_SAMPLES = [
  1200,
  1800,
  2500, // 1k–3k
  3200,
  4000,
  4800, // 3k–5k
  5500,
  7200,
  9500, // 5k–10k
  11000,
  15000,
  18500, // 10k–20k
  22000,
  28000,
  35000, // 20k+
];

const MAIN_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop',
];

const KITCHEN_IMAGE =
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop';
const BEDROOM_IMAGE =
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop';
const BATHROOM_IMAGE =
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=600&auto=format&fit=crop';

const DISTRICTS: Record<string, string[]> = {
  'Greater Accra': [
    'Airport Residential',
    'Cantonments',
    'East Legon',
    'Osu',
    'Labone',
    'Roman Ridge',
    'Tema',
  ],
  Ashanti: ['Kumasi Nhyiaeso', 'Adum', 'Patasi', 'Ahodwo'],
  Western: ['Takoradi Anaji', 'Effiakuma', 'Kwesimintin'],
  Eastern: ['Koforidua', 'Aburi', 'Nkawkaw'],
  Northern: ['Tamale', 'Sagnarigu'],
  Central: ['Cape Coast', 'Elmina', 'Winneba'],
  Ahafo: ['Goaso', 'Duayaw Nkwanta'],
  Bono: ['Sunyani', 'Berekum'],
  'Bono East': ['Techiman', 'Kintampo'],
  'North East': ['Nalerigu', 'Walewale'],
  Oti: ['Dambai', 'Kete Krachi'],
  Savannah: ['Damongo', 'Buipe'],
  'Upper East': ['Bolgatanga', 'Navrongo'],
  'Upper West': ['Wa', 'Jirapa'],
  Volta: ['Ho', 'Keta', 'Aflao'],
  'Western North': ['Sefwi Wiawso', 'Bibiani'],
};

/** Approximate centroids for Ghana regions (degrees) */
const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  'Greater Accra': { lat: 5.6037, lng: -0.187 },
  Ashanti: { lat: 6.6885, lng: -1.6244 },
  Western: { lat: 4.9016, lng: -1.7831 },
  Eastern: { lat: 6.0944, lng: -0.2591 },
  Northern: { lat: 9.4034, lng: -0.8424 },
  Central: { lat: 5.1053, lng: -1.2466 },
  Ahafo: { lat: 7.0, lng: -2.45 },
  Bono: { lat: 7.3349, lng: -2.3123 },
  'Bono East': { lat: 7.5833, lng: -1.9333 },
  'North East': { lat: 10.525, lng: -0.369 },
  Oti: { lat: 8.05, lng: 0.2 },
  Savannah: { lat: 9.0833, lng: -1.8167 },
  'Upper East': { lat: 10.787, lng: -0.85 },
  'Upper West': { lat: 10.0601, lng: -2.51 },
  Volta: { lat: 6.6008, lng: 0.47 },
  'Western North': { lat: 6.2, lng: -2.48 },
};

const AMENITIES = [
  'High-speed WiFi',
  'Air Conditioning',
  'Private Parking Garage',
  'Gated Community with 24/7 Security',
  '24/7 Standby Generator',
  'Water Reservoir (Polytank)',
  'Fully Fitted Kitchen',
  'Swimming Pool',
  'Spacious Balcony',
];

const ADJECTIVES = [
  'Premium',
  'Luxury',
  'Executive',
  'Cozy',
  'Elegant',
  'Modern',
  'Spacious',
  'Stunning',
];

/** Tour clips from https://www.tiktok.com/@ellathrivy (Tankoz Thrive) — rent listings first, then other property tours. */
const SAMPLE_VIDEO_URLS: Array<string | null> = [
  // For rent
  'https://www.tiktok.com/@ellathrivy/video/7664718339280866580',
  'https://www.tiktok.com/@ellathrivy/video/7661030653525298453',
  'https://www.tiktok.com/@ellathrivy/video/7654735713157532949',
  'https://www.tiktok.com/@ellathrivy/video/7644303203252686100',
  'https://www.tiktok.com/@ellathrivy/video/7633024467442076949',
  'https://www.tiktok.com/@ellathrivy/video/7629762799236861204',
  'https://www.tiktok.com/@ellathrivy/video/7627065785038556437',
  'https://www.tiktok.com/@ellathrivy/video/7623007076960275732',
  'https://www.tiktok.com/@ellathrivy/video/7620366938409291029',
  'https://www.tiktok.com/@ellathrivy/video/7618729317199056148',
  'https://www.tiktok.com/@ellathrivy/video/7618662179369127189',
  'https://www.tiktok.com/@ellathrivy/video/7615873804333600021',
  'https://www.tiktok.com/@ellathrivy/video/7614913799161679124',
  'https://www.tiktok.com/@ellathrivy/video/7611178017359940884',
  'https://www.tiktok.com/@ellathrivy/video/7603002382036913429',
  'https://www.tiktok.com/@ellathrivy/video/7598167138540522764',
  // Other property tours from the same account
  'https://www.tiktok.com/@ellathrivy/video/7655099302024432916',
  'https://www.tiktok.com/@ellathrivy/video/7654360643218230549',
  'https://www.tiktok.com/@ellathrivy/video/7652873917517892884',
  'https://www.tiktok.com/@ellathrivy/video/7652502420001410325',
  'https://www.tiktok.com/@ellathrivy/video/7650645437363293460',
  'https://www.tiktok.com/@ellathrivy/video/7649025372054408469',
  'https://www.tiktok.com/@ellathrivy/video/7647851391322459413',
  'https://www.tiktok.com/@ellathrivy/video/7647108641568328981',
  'https://www.tiktok.com/@ellathrivy/video/7646766126604635412',
  'https://www.tiktok.com/@ellathrivy/video/7646370605394267412',
  'https://www.tiktok.com/@ellathrivy/video/7643515498960801044',
  'https://www.tiktok.com/@ellathrivy/video/7643060556500307221',
  'https://www.tiktok.com/@ellathrivy/video/7635953121738411285',
  'https://www.tiktok.com/@ellathrivy/video/7634703637897284884',
  'https://www.tiktok.com/@ellathrivy/video/7634699631640808725',
  'https://www.tiktok.com/@ellathrivy/video/7634698370707098900',
  'https://www.tiktok.com/@ellathrivy/video/7634698189353913620',
  'https://www.tiktok.com/@ellathrivy/video/7633594172347288852',
  'https://www.tiktok.com/@ellathrivy/video/7633022962500766997',
  'https://www.tiktok.com/@ellathrivy/video/7632687496287096084',
  'https://www.tiktok.com/@ellathrivy/video/7631573500729330964',
  'https://www.tiktok.com/@ellathrivy/video/7630057023052205333',
  'https://www.tiktok.com/@ellathrivy/video/7627972132680764693',
  'https://www.tiktok.com/@ellathrivy/video/7627420501387906324',
  'https://www.tiktok.com/@ellathrivy/video/7625959316629048596',
  'https://www.tiktok.com/@ellathrivy/video/7624973560066444565',
  'https://www.tiktok.com/@ellathrivy/video/7624175930961087765',
  'https://www.tiktok.com/@ellathrivy/video/7622988390866242837',
  'https://www.tiktok.com/@ellathrivy/video/7622206088007437588',
  'https://www.tiktok.com/@ellathrivy/video/7622205461105839381',
  'https://www.tiktok.com/@ellathrivy/video/7617861223522110740',
  'https://www.tiktok.com/@ellathrivy/video/7617612289947995413',
  'https://www.tiktok.com/@ellathrivy/video/7616421113161420053',
  'https://www.tiktok.com/@ellathrivy/video/7614294344572341524',
  'https://www.tiktok.com/@ellathrivy/video/7610737778317364500',
  'https://www.tiktok.com/@ellathrivy/video/7608605151573675284',
  'https://www.tiktok.com/@ellathrivy/video/7607559115405135124',
  'https://www.tiktok.com/@ellathrivy/video/7605647361716522261',
  'https://www.tiktok.com/@ellathrivy/video/7604799234864319764',
  'https://www.tiktok.com/@ellathrivy/video/7603747959435463957',
  'https://www.tiktok.com/@ellathrivy/video/7602573548598676757',
  'https://www.tiktok.com/@ellathrivy/video/7601152629997079829',
  'https://www.tiktok.com/@ellathrivy/video/7601151177614576916',
  'https://www.tiktok.com/@ellathrivy/video/7600053639738166549',
  'https://www.tiktok.com/@ellathrivy/video/7600052029855108373',
  'https://www.tiktok.com/@ellathrivy/video/7598168368960523576',
  'https://www.tiktok.com/@ellathrivy/video/7597487871347428619',
  'https://www.tiktok.com/@ellathrivy/video/7597055053991644428',
  'https://www.tiktok.com/@ellathrivy/video/7597053621586382092',
  'https://www.tiktok.com/@ellathrivy/video/7596323518938172728',
  'https://www.tiktok.com/@ellathrivy/video/7595937253445111096',
  'https://www.tiktok.com/@ellathrivy/video/7595279394973748491',
  'https://www.tiktok.com/@ellathrivy/video/7595277033270381880',
  'https://www.tiktok.com/@ellathrivy/video/7594628165029465400',
  'https://www.tiktok.com/@ellathrivy/video/7594627971315485963',
  'https://www.tiktok.com/@ellathrivy/video/7594434833707830540',
  'https://www.tiktok.com/@ellathrivy/video/7594433492671401272',
  null,
  null,
];

function pickAmenities(seed: number): string[] {
  const count = 3 + (seed % 3); // 3–5
  const start = seed % AMENITIES.length;
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(AMENITIES[(start + i) % AMENITIES.length]);
  }
  return [...new Set(selected)];
}

function jitter(base: number, amount = 0.08): number {
  return base + (Math.random() - 0.5) * amount;
}

async function seed() {
  await connectDB();

  let landlord = await User.findOne({ userType: 'LANDLORD' });
  if (!landlord) {
    console.log('No landlord found. Creating a default landlord user...');
    landlord = await User.create({
      firstName: 'Kwame',
      lastName: 'Asante',
      email: 'landlord@fieconnect.com',
      password: 'password123',
      userType: 'LANDLORD',
      phone: '+233 24 456 7890',
      preferences: {
        regions: [],
        districts: [],
        types: [],
        minPrice: null,
        maxPrice: null,
        bedrooms: [],
        amenities: [],
        parking: null,
        onboardingStatus: 'COMPLETED',
      },
    });
    console.log('Landlord user created:', landlord._id);
  } else {
    // Keep landlord prefs consistent with current schema
    if (!(landlord as any).preferences?.onboardingStatus) {
      (landlord as any).preferences = {
        ...((landlord as any).preferences?.toObject?.() ?? (landlord as any).preferences),
        onboardingStatus: 'COMPLETED',
      };
      await landlord.save();
    }
  }

  // Clear listings and dependent records so apps/interactions don't point at deleted IDs.
  const oldPropertyIds = (await Property.find({}).select('_id').lean()).map((p) => p._id);
  const orphanApps = await Application.find({ property: { $in: oldPropertyIds } }).select('_id');
  const orphanAppIds = orphanApps.map((a) => a._id);
  if (orphanAppIds.length > 0) {
    await Dispute.deleteMany({ tenancy: { $in: orphanAppIds } });
  }
  await Application.deleteMany({ property: { $in: oldPropertyIds } });
  await PropertyInteraction.deleteMany({ property: { $in: oldPropertyIds } });
  await Property.deleteMany({});
  console.log(
    `Deleted existing properties and related applications/interactions/disputes (${oldPropertyIds.length} listings).`,
  );

  const propertiesToInsert: Record<string, unknown>[] = [];
  let index = 0;

  // Full cartesian coverage: every region × every property type (16 × 7 = 112)
  for (const region of REGIONS) {
    for (const type of PROPERTY_TYPES) {
      const distList = DISTRICTS[region] || ['Central District'];
      const district = distList[index % distList.length];
      const location = `${district}, ${region}`;
      const adj = ADJECTIVES[index % ADJECTIVES.length];
      const title = `${adj} ${type} in ${district}`;

      const bedrooms = BEDROOM_OPTIONS[index % BEDROOM_OPTIONS.length];
      const bathrooms = BATHROOM_OPTIONS[index % BATHROOM_OPTIONS.length];
      const parking = PARKING_OPTIONS[index % PARKING_OPTIONS.length];
      const price = PRICE_SAMPLES[index % PRICE_SAMPLES.length];
      const sizeSqm = 60 + ((index * 17) % 220);
      const size = `${sizeSqm} sqm`;
      const amenities = pickAmenities(index);
      const image = MAIN_IMAGES[index % MAIN_IMAGES.length];
      const coords = REGION_COORDS[region] || REGION_COORDS['Greater Accra'];
      const videoUrl = SAMPLE_VIDEO_URLS[index % SAMPLE_VIDEO_URLS.length];

      const about = `This ${bedrooms === '1' ? '1-bedroom' : `${bedrooms}-bedroom`} ${type.toLowerCase()} in ${district}, ${region} offers comfortable living with modern finishes. Ideal for tenants looking for a ${type.toLowerCase()} near key amenities in the area.`;

      const mapDescription = `Located in ${district} within ${region}. Close to main roads, markets, and everyday services. Coordinates are approximate for discovery.`;

      // Stagger createdAt so freshness scoring has variety (0–90 days ago)
      const ageDays = index % 91;
      const createdAt = new Date(Date.now() - ageDays * 24 * 60 * 60 * 1000);

      propertiesToInsert.push({
        title,
        type,
        location,
        region,
        district,
        price,
        verified: index % 5 !== 0,
        bedrooms,
        bathrooms,
        size,
        parking,
        about,
        amenities,
        mapDescription,
        videoUrl,
        lat: jitter(coords.lat),
        lng: jitter(coords.lng),
        image,
        images: {
          main: image,
          kitchen: KITCHEN_IMAGE,
          bedroom: BEDROOM_IMAGE,
          bathroom: BATHROOM_IMAGE,
        },
        landlord: landlord!._id,
        createdAt,
        updatedAt: createdAt,
      });

      index += 1;
    }
  }

  const results = await Property.insertMany(propertiesToInsert);
  console.log(`Successfully seeded ${results.length} properties.`);
  console.log(
    `Coverage: ${REGIONS.length} regions × ${PROPERTY_TYPES.length} types = ${REGIONS.length * PROPERTY_TYPES.length} listings.`,
  );
  console.log(
    `Also cycles bedrooms [${BEDROOM_OPTIONS.join(', ')}], parking, rent bands, amenities, mapDescription, and optional videoUrl.`,
  );

  await mongoose.connection.close();
  console.log('Database connection closed.');
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
