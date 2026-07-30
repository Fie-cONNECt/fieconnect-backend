import { Schema, model } from 'mongoose';

const propertySchema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      required: true,
    },
    location: { type: String, required: true },
    region: {
      type: String,
      required: true,
    },
    district: { type: String, required: true },
    price: { type: Number, required: true },
    verified: { type: Boolean, default: false },
    bedrooms: { type: String, required: true },
    bathrooms: { type: String, required: true },
    size: { type: String, required: true },
    parking: { type: String, required: true },
    about: { type: String, required: true },
    amenities: { type: [String], default: [] },
    mapDescription: { type: String },
    videoUrl: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    image: { type: String, required: true },
    images: {
      main: { type: String, required: true },
      kitchen: { type: String, required: true },
      bedroom: { type: String, required: true },
      bathroom: { type: String, required: true },
    },
    agreementUrl: { type: String },
    landlord: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
);

export const Property = model('Property', propertySchema);
