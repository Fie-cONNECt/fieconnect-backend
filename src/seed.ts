import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { Property } from './models/Property';
import { User } from './models/User';

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
];

const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Townhouse', 'Duplex', 'Penthouse'];

const MAIN_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop',
];

const KITCHEN_IMAGE = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop';
const BEDROOM_IMAGE = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop';
const BATHROOM_IMAGE = 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=600&auto=format&fit=crop';

const DISTRICTS: Record<string, string[]> = {
  'Greater Accra': ['Airport Residential', 'Cantonments', 'East Legon', 'Osu', 'Labone', 'Roman Ridge', 'Tema'],
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

const AMENITIES = [
  'High-speed WiFi',
  'Air Conditioning',
  'Swimming Pool',
  '24/7 Standby Generator',
  'Gated Community with 24/7 Security',
  'Water Reservoir (Polytank)',
  'Fully Fitted Kitchen',
  'Private Parking Garage',
  'Spacious Balcony',
];

const ADJECTIVES = ['Premium', 'Luxury', 'Executive', 'Cozy', 'Elegant', 'Modern', 'Spacious', 'Stunning'];

async function seed() {
  // Connect DB
  await connectDB();

  // Find or create Landlord user
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
    });
    console.log('Landlord user created:', landlord._id);
  }

  // Delete existing properties
  await Property.deleteMany({});
  console.log('Deleted existing properties.');

  const propertiesToInsert = [];

  // Generate 75 properties
  for (let i = 0; i < 75; i++) {
    const region = REGIONS[i % REGIONS.length];
    const type = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
    const distList = DISTRICTS[region] || ['Central District'];
    const district = distList[i % distList.length];
    const location = `${district}, ${region}`;

    const adj = ADJECTIVES[i % ADJECTIVES.length];
    const title = `${adj} ${type} in ${district}`;

    // Pricing from 1500 to 35000 GHC
    const price = Math.floor(15 + Math.random() * 230) * 100 + (i % 2 === 0 ? 50 : 0);

    const bedrooms = ((i % 4) + 1).toString();
    const bathrooms = ((i % 3) + 1).toString();
    const size = `${Math.floor(80 + Math.random() * 200)} sqm`;
    const parking = i % 3 === 0 ? 'No' : 'Yes';

    const about = `This outstanding ${bedrooms}-bedroom ${type.toLowerCase()} situated in ${district} offers exceptional premium living. Featuring beautiful modern architectural details, high-end amenities, and excellent layout design for perfect convenience and accessibility.`;

    // Choose 3-5 random amenities
    const selectedAmenities = AMENITIES.filter((_, idx) => (idx + i) % 3 === 0 || (idx + i) % 4 === 0);

    const image = MAIN_IMAGES[i % MAIN_IMAGES.length];

    propertiesToInsert.push({
      title,
      type,
      location,
      region,
      district,
      price,
      verified: i % 5 !== 0, // 80% verified
      bedrooms,
      bathrooms,
      size,
      parking,
      about,
      amenities: selectedAmenities,
      lat: 5.6037 + (Math.random() - 0.5) * 0.1,
      lng: -0.187 + (Math.random() - 0.5) * 0.1,
      image,
      images: {
        main: image,
        kitchen: KITCHEN_IMAGE,
        bedroom: BEDROOM_IMAGE,
        bathroom: BATHROOM_IMAGE,
      },
      landlord: landlord._id,
    });
  }

  const results = await Property.insertMany(propertiesToInsert);
  console.log(`Successfully seeded ${results.length} properties!`);

  // Close connection
  await mongoose.connection.close();
  console.log('Database connection closed.');
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
