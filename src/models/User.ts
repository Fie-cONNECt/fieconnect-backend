import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const preferencesSchema = new Schema(
  {
    regions: { type: [String], default: [] },
    districts: { type: [String], default: [] },
    types: { type: [String], default: [] },
    minPrice: { type: Number, default: null },
    maxPrice: { type: Number, default: null },
    bedrooms: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    parking: { type: String, default: null },
    onboardingStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'SKIPPED'],
      default: 'PENDING',
    },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['TENANT', 'LANDLORD'], default: 'TENANT', required: true },
    phone: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: null },
    savedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property', default: [] }],
    preferences: {
      type: preferencesSchema,
      default: () => ({
        regions: [],
        districts: [],
        types: [],
        minPrice: null,
        maxPrice: null,
        bedrooms: [],
        amenities: [],
        parking: null,
        onboardingStatus: 'PENDING',
      }),
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Helper method to compare password
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = model('User', userSchema);
