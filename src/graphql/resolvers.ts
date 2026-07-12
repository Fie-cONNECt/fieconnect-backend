import { User } from '../models/User';
import { Property } from '../models/Property';
import jwt from 'jsonwebtoken';
import { Resolvers } from './__generated__/resolvers-types';
import mongoose from 'mongoose';

const generateToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

export const resolvers: Resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.userId) {
        return null;
      }
      const user = await User.findById(context.userId);
      if (!user) return null;
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
        savedProperties: [],
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },
    myProperties: async (_, __, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const properties = await Property.find({ landlord: context.userId });
      return properties.map((prop) => ({
        id: prop.id,
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
        amenities: prop.amenities,
        lat: prop.lat,
        lng: prop.lng,
        image: prop.image,
        images: {
          main: prop.images?.main || prop.image,
          kitchen: prop.images?.kitchen || '',
          bedroom: prop.images?.bedroom || '',
          bathroom: prop.images?.bathroom || '',
        },
        agreementUrl: prop.agreementUrl || null,
        landlord: prop.landlord as any,
        createdAt: (prop as any).createdAt.toISOString(),
        updatedAt: (prop as any).updatedAt.toISOString(),
      }));
    },
    property: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      const prop = await Property.findById(id).populate('landlord');
      if (!prop) return null;
      const landlord = prop.landlord as any;
      return {
        id: prop.id,
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
        amenities: prop.amenities,
        mapDescription: (prop as any).mapDescription || null,
        lat: prop.lat,
        lng: prop.lng,
        image: prop.image,
        images: {
          main: prop.images?.main || prop.image,
          kitchen: prop.images?.kitchen || '',
          bedroom: prop.images?.bedroom || '',
          bathroom: prop.images?.bathroom || '',
        },
        agreementUrl: prop.agreementUrl || null,
        landlord: landlord
          ? {
              id: landlord._id?.toString() || landlord.id,
              firstName: landlord.firstName,
              lastName: landlord.lastName,
              email: landlord.email,
              userType: landlord.userType,
              phone: landlord.phone,
              savedProperties: [],
              createdAt: landlord.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt: landlord.updatedAt?.toISOString() || new Date().toISOString(),
            }
          : {
              id: '',
              firstName: 'Unknown',
              lastName: 'Landlord',
              email: '',
              userType: 'LANDLORD',
              phone: '',
              savedProperties: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
        createdAt: (prop as any).createdAt.toISOString(),
        updatedAt: (prop as any).updatedAt.toISOString(),
      };
    },
  },
  Mutation: {
    register: async (_, { firstName, lastName, email, password, userType, phone }, context) => {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        userType,
        phone,
      });
      await user.save();

      const token = generateToken(user.id, user.email);

      if (context.res) {
        context.res.setHeader(
          'Set-Cookie',
          `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
        );
      }

      return {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
          savedProperties: [],
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },
    login: async (_, { email, password }, context) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken(user.id, user.email);

      if (context.res) {
        context.res.setHeader(
          'Set-Cookie',
          `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
        );
      }

      return {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
          savedProperties: [],
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },
    logout: async (_, __, context) => {
      if (context.res) {
        context.res.setHeader(
          'Set-Cookie',
          `token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
        );
      }
      return true;
    },
    createProperty: async (_, { input }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      let lat = 5.5786;
      let lng = -0.1704;
      if (input.region === 'Ashanti') {
        lat = 6.6666;
        lng = -1.6244;
      } else if (input.region === 'Western') {
        lat = 4.9016;
        lng = -1.7831;
      } else if (input.region === 'Eastern') {
        lat = 6.0944;
        lng = -0.2591;
      }

      const property = new Property({
        title: input.title,
        type: input.type,
        location: input.location,
        region: input.region,
        district: input.district,
        price: input.price,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        size: input.size,
        parking: input.parking,
        about: input.about,
        amenities: input.amenities,
        lat,
        lng,
        image: input.image,
        images: {
          main: input.image,
          kitchen: input.kitchenImage,
          bedroom: input.bedroomImage,
          bathroom: input.bathroomImage,
        },
        agreementUrl: input.agreementUrl,
        landlord: context.userId,
      });

      await property.save();

      return {
        id: property.id,
        title: property.title,
        type: property.type,
        location: property.location,
        region: property.region,
        district: property.district,
        price: property.price,
        verified: property.verified,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size,
        parking: property.parking,
        about: property.about,
        amenities: property.amenities,
        lat: property.lat,
        lng: property.lng,
        image: property.image,
        images: {
          main: property.images?.main || property.image,
          kitchen: property.images?.kitchen || '',
          bedroom: property.images?.bedroom || '',
          bathroom: property.images?.bathroom || '',
        },
        agreementUrl: property.agreementUrl || null,
        landlord: property.landlord as any,
        createdAt: (property as any).createdAt.toISOString(),
        updatedAt: (property as any).updatedAt.toISOString(),
      };
    },
    toggleSaveProperty: async (_, { propertyId }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const user = await User.findById(context.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const propertyExists = await Property.exists({ _id: propertyId });
      if (!propertyExists) {
        throw new Error('Property not found');
      }

      const index = (user as any).savedProperties.indexOf(propertyId);
      if (index === -1) {
        (user as any).savedProperties.push(propertyId);
      } else {
        (user as any).savedProperties.splice(index, 1);
      }

      await user.save();

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
        savedProperties: [],
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },
  },
  Property: {
    landlord: async (parent) => {
      const landlordVal = (parent as any).landlord;
      if (landlordVal && typeof landlordVal === 'object') {
        const id = landlordVal.id || landlordVal._id?.toString();
        if (id && landlordVal.firstName) {
          return {
            id,
            firstName: landlordVal.firstName,
            lastName: landlordVal.lastName,
            email: landlordVal.email,
            userType: landlordVal.userType,
            phone: landlordVal.phone,
            savedProperties: [],
            createdAt: typeof landlordVal.createdAt === 'string' ? landlordVal.createdAt : (landlordVal.createdAt?.toISOString() || new Date().toISOString()),
            updatedAt: typeof landlordVal.updatedAt === 'string' ? landlordVal.updatedAt : (landlordVal.updatedAt?.toISOString() || new Date().toISOString()),
          };
        }
      }

      const user = await User.findById(landlordVal);
      if (!user) {
        throw new Error('Landlord user not found');
      }
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
        savedProperties: [],
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },
  },
  User: {
    savedProperties: async (parent) => {
      const userId = parent.id || (parent as any)._id;
      const user = await User.findById(userId);
      if (!user || !user.savedProperties) return [];
      const properties = await Property.find({ _id: { $in: user.savedProperties } });
      return properties.map((prop) => ({
        id: prop.id,
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
        amenities: prop.amenities,
        lat: prop.lat,
        lng: prop.lng,
        image: prop.image,
        images: {
          main: prop.images?.main || prop.image,
          kitchen: prop.images?.kitchen || '',
          bedroom: prop.images?.bedroom || '',
          bathroom: prop.images?.bathroom || '',
        },
        agreementUrl: prop.agreementUrl || null,
        landlord: prop.landlord as any,
        createdAt: (prop as any).createdAt.toISOString(),
        updatedAt: (prop as any).updatedAt.toISOString(),
      }));
    },
  },
};
