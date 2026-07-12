import { User } from '../models/User';
import { Property } from '../models/Property';
import { Application } from '../models/Application';
import { Notification } from '../models/Notification';
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
    myApplications: async (_, __, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const apps = await Application.find({ tenant: context.userId }).sort({ createdAt: -1 });
      return apps.map((app) => ({
        id: app.id,
        property: app.property as any,
        tenant: app.tenant as any,
        nationalIdUrl: app.nationalIdUrl,
        supportingDocsUrl: app.supportingDocsUrl || null,
        employerName: app.employerName,
        jobTitle: app.jobTitle,
        monthlyIncome: app.monthlyIncome,
        lengthOfEmployment: app.lengthOfEmployment,
        personalStatement: app.personalStatement,
        status: app.status,
        furtherDetailsRequest: app.furtherDetailsRequest || null,
        furtherDetailsResponse: app.furtherDetailsResponse || null,
        agreementUrl: app.agreementUrl || null,
        signedAgreementUrl: app.signedAgreementUrl || null,
        createdAt: (app as any).createdAt.toISOString(),
        updatedAt: (app as any).updatedAt.toISOString(),
      }));
    },
    receivedApplications: async (_, __, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const properties = await Property.find({ landlord: context.userId });
      const propertyIds = properties.map((p) => p._id);
      
      const apps = await Application.find({ property: { $in: propertyIds } }).sort({ createdAt: -1 });
      return apps.map((app) => ({
        id: app.id,
        property: app.property as any,
        tenant: app.tenant as any,
        nationalIdUrl: app.nationalIdUrl,
        supportingDocsUrl: app.supportingDocsUrl || null,
        employerName: app.employerName,
        jobTitle: app.jobTitle,
        monthlyIncome: app.monthlyIncome,
        lengthOfEmployment: app.lengthOfEmployment,
        personalStatement: app.personalStatement,
        status: app.status,
        furtherDetailsRequest: app.furtherDetailsRequest || null,
        furtherDetailsResponse: app.furtherDetailsResponse || null,
        agreementUrl: app.agreementUrl || null,
        signedAgreementUrl: app.signedAgreementUrl || null,
        createdAt: (app as any).createdAt.toISOString(),
        updatedAt: (app as any).updatedAt.toISOString(),
      }));
    },
    myNotifications: async (_, __, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const notifications = await Notification.find({ recipient: context.userId }).sort({ createdAt: -1 });
      return notifications.map((n) => ({
        id: n.id,
        recipient: n.recipient as any,
        title: n.title,
        message: n.message,
        read: n.read,
        link: n.link || null,
        createdAt: (n as any).createdAt.toISOString(),
        updatedAt: (n as any).updatedAt.toISOString(),
      }));
    },
    myTenancies: async (_: any, __: any, context: any) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const properties = await Property.find({ landlord: context.userId });
      const propertyIds = properties.map((p) => p._id);

      const apps = await Application.find({
        status: 'APPROVED',
        $or: [
          { tenant: context.userId },
          { property: { $in: propertyIds } }
        ]
      }).sort({ updatedAt: -1 });

      return apps.map((app) => ({
        id: app.id,
        property: app.property as any,
        tenant: app.tenant as any,
        nationalIdUrl: app.nationalIdUrl,
        supportingDocsUrl: app.supportingDocsUrl || null,
        employerName: app.employerName,
        jobTitle: app.jobTitle,
        monthlyIncome: app.monthlyIncome,
        lengthOfEmployment: app.lengthOfEmployment,
        personalStatement: app.personalStatement,
        status: app.status,
        furtherDetailsRequest: app.furtherDetailsRequest || null,
        furtherDetailsResponse: app.furtherDetailsResponse || null,
        agreementUrl: app.agreementUrl || null,
        signedAgreementUrl: app.signedAgreementUrl || null,
        createdAt: (app as any).createdAt.toISOString(),
        updatedAt: (app as any).updatedAt.toISOString(),
      }));
    },
    tenancy: async (_: any, { id }: any, context: any) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const app = await Application.findById(id).populate('property');
      if (!app) {
        throw new Error('Tenancy application not found');
      }
      const property = app.property as any;
      if (app.tenant.toString() !== context.userId && property.landlord.toString() !== context.userId) {
        throw new Error('Unauthorized');
      }
      return {
        id: app.id,
        property: app.property as any,
        tenant: app.tenant as any,
        nationalIdUrl: app.nationalIdUrl,
        supportingDocsUrl: app.supportingDocsUrl || null,
        employerName: app.employerName,
        jobTitle: app.jobTitle,
        monthlyIncome: app.monthlyIncome,
        lengthOfEmployment: app.lengthOfEmployment,
        personalStatement: app.personalStatement,
        status: app.status,
        furtherDetailsRequest: app.furtherDetailsRequest || null,
        furtherDetailsResponse: app.furtherDetailsResponse || null,
        agreementUrl: app.agreementUrl || null,
        signedAgreementUrl: app.signedAgreementUrl || null,
        createdAt: (app as any).createdAt.toISOString(),
        updatedAt: (app as any).updatedAt.toISOString(),
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
    createApplication: async (_, { input }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const property = await Property.findById(input.propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      const application = new Application({
        property: input.propertyId,
        tenant: context.userId,
        nationalIdUrl: input.nationalIdUrl,
        supportingDocsUrl: input.supportingDocsUrl,
        employerName: input.employerName,
        jobTitle: input.jobTitle,
        monthlyIncome: input.monthlyIncome,
        lengthOfEmployment: input.lengthOfEmployment,
        personalStatement: input.personalStatement,
        status: 'PENDING',
      });

      await application.save();

      // Create notification for landlord
      const tenantUser = await User.findById(context.userId);
      const landlordNotification = new Notification({
        recipient: property.landlord,
        title: 'New Tenancy Application',
        message: `You have received a new tenancy application from ${tenantUser?.firstName || 'a tenant'} for ${property.title}.`,
        link: '/app/applications',
      });
      await landlordNotification.save();

      return {
        id: application.id,
        property: application.property as any,
        tenant: application.tenant as any,
        nationalIdUrl: application.nationalIdUrl,
        supportingDocsUrl: application.supportingDocsUrl || null,
        employerName: application.employerName,
        jobTitle: application.jobTitle,
        monthlyIncome: application.monthlyIncome,
        lengthOfEmployment: application.lengthOfEmployment,
        personalStatement: application.personalStatement,
        status: application.status,
        furtherDetailsRequest: null,
        furtherDetailsResponse: null,
        createdAt: (application as any).createdAt.toISOString(),
        updatedAt: (application as any).updatedAt.toISOString(),
      };
    },
    updateApplicationStatus: async (_, { id, status }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const app = await Application.findById(id).populate('property');
      if (!app) {
        throw new Error('Application not found');
      }
      const property = app.property as any;
      if (property.landlord.toString() !== context.userId) {
        throw new Error('Unauthorized');
      }
      app.status = status as any;
      await app.save();

      // Create notification for tenant
      const tenantNotification = new Notification({
        recipient: app.tenant,
        title: `Tenancy Application ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        message: `Your tenancy application for ${property.title} was ${status.toLowerCase()} by the landlord.`,
        link: '/app/applications',
      });
      await tenantNotification.save();

      return {
        id: app.id,
        property: app.property as any,
        tenant: app.tenant as any,
        nationalIdUrl: app.nationalIdUrl,
        supportingDocsUrl: app.supportingDocsUrl || null,
        employerName: app.employerName,
        jobTitle: app.jobTitle,
        monthlyIncome: app.monthlyIncome,
        lengthOfEmployment: app.lengthOfEmployment,
        personalStatement: app.personalStatement,
        status: app.status,
        furtherDetailsRequest: app.furtherDetailsRequest || null,
        furtherDetailsResponse: app.furtherDetailsResponse || null,
        createdAt: (app as any).createdAt.toISOString(),
        updatedAt: (app as any).updatedAt.toISOString(),
      };
    },
    requestFurtherDetails: async (_, { id, message }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const app = await Application.findById(id).populate('property');
      if (!app) {
        throw new Error('Application not found');
      }
      const property = app.property as any;
      if (property.landlord.toString() !== context.userId) {
        throw new Error('Unauthorized');
      }
      app.status = 'INFORMATION_REQUESTED';
      app.furtherDetailsRequest = message;
      app.furtherDetailsResponse = '';
      await app.save();

      // Create notification for tenant
      const tenantNotification = new Notification({
        recipient: app.tenant,
        title: 'Information Requested for Tenancy',
        message: `The landlord for ${property.title} has requested further details: "${message.substring(0, 60)}..."`,
        link: '/app/applications',
      });
      await tenantNotification.save();

      return {
        id: app.id,
        property: app.property as any,
        tenant: app.tenant as any,
        nationalIdUrl: app.nationalIdUrl,
        supportingDocsUrl: app.supportingDocsUrl || null,
        employerName: app.employerName,
        jobTitle: app.jobTitle,
        monthlyIncome: app.monthlyIncome,
        lengthOfEmployment: app.lengthOfEmployment,
        personalStatement: app.personalStatement,
        status: app.status,
        furtherDetailsRequest: app.furtherDetailsRequest || null,
        furtherDetailsResponse: app.furtherDetailsResponse || null,
        createdAt: (app as any).createdAt.toISOString(),
        updatedAt: (app as any).updatedAt.toISOString(),
      };
    },
    submitFurtherDetails: async (_, { id, response }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const app = await Application.findById(id).populate('property');
      if (!app) {
        throw new Error('Application not found');
      }
      if (app.tenant.toString() !== context.userId) {
        throw new Error('Unauthorized');
      }
      app.status = 'PENDING';
      app.furtherDetailsResponse = response;
      await app.save();

      // Create notification for landlord
      const tenantUser = await User.findById(context.userId);
      const property = app.property as any;
      const landlordNotification = new Notification({
        recipient: property.landlord,
        title: 'Application Details Submitted',
        message: `${tenantUser?.firstName || 'A tenant'} has responded to your information request for ${property.title}.`,
        link: '/app/applications',
      });
      await landlordNotification.save();

      return {
        id: app.id,
        property: app.property as any,
        tenant: app.tenant as any,
        nationalIdUrl: app.nationalIdUrl,
        supportingDocsUrl: app.supportingDocsUrl || null,
        employerName: app.employerName,
        jobTitle: app.jobTitle,
        monthlyIncome: app.monthlyIncome,
        lengthOfEmployment: app.lengthOfEmployment,
        personalStatement: app.personalStatement,
        status: app.status,
        furtherDetailsRequest: app.furtherDetailsRequest || null,
        furtherDetailsResponse: app.furtherDetailsResponse || null,
        createdAt: (app as any).createdAt.toISOString(),
        updatedAt: (app as any).updatedAt.toISOString(),
      };
    },
    markNotificationAsRead: async (_, { id }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const n = await Notification.findById(id);
      if (!n) {
        throw new Error('Notification not found');
      }
      if (n.recipient.toString() !== context.userId) {
        throw new Error('Unauthorized');
      }
      n.read = true;
      await n.save();
      return {
        id: n.id,
        recipient: n.recipient as any,
        title: n.title,
        message: n.message,
        read: n.read,
        link: n.link || null,
        createdAt: (n as any).createdAt.toISOString(),
        updatedAt: (n as any).updatedAt.toISOString(),
      };
    },
    approveApplicationWithAgreement: async (_, { id, agreementUrl }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const app = await Application.findById(id).populate('property');
      if (!app) {
        throw new Error('Application not found');
      }
      const property = app.property as any;
      if (property.landlord.toString() !== context.userId) {
        throw new Error('Unauthorized');
      }
      app.status = 'APPROVED_PENDING_SIGNATURE';
      app.agreementUrl = agreementUrl;
      await app.save();

      const tenantNotification = new Notification({
        recipient: app.tenant,
        title: 'Application Approved (Pending Signature)',
        message: `Your tenancy application for ${property.title} was approved! Please sign the tenancy agreement.`,
        link: '/app/applications',
      });
      await tenantNotification.save();

      return {
        id: app.id,
        property: app.property as any,
        tenant: app.tenant as any,
        nationalIdUrl: app.nationalIdUrl,
        supportingDocsUrl: app.supportingDocsUrl || null,
        employerName: app.employerName,
        jobTitle: app.jobTitle,
        monthlyIncome: app.monthlyIncome,
        lengthOfEmployment: app.lengthOfEmployment,
        personalStatement: app.personalStatement,
        status: app.status,
        furtherDetailsRequest: app.furtherDetailsRequest || null,
        furtherDetailsResponse: app.furtherDetailsResponse || null,
        agreementUrl: app.agreementUrl || null,
        signedAgreementUrl: app.signedAgreementUrl || null,
        createdAt: (app as any).createdAt.toISOString(),
        updatedAt: (app as any).updatedAt.toISOString(),
      };
    },
    submitSignedAgreement: async (_, { id, signedAgreementUrl }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }
      const app = await Application.findById(id).populate('property');
      if (!app) {
        throw new Error('Application not found');
      }
      if (app.tenant.toString() !== context.userId) {
        throw new Error('Unauthorized');
      }
      app.status = 'APPROVED';
      app.signedAgreementUrl = signedAgreementUrl;
      await app.save();

      const tenantUser = await User.findById(context.userId);
      const property = app.property as any;
      const landlordNotification = new Notification({
        recipient: property.landlord,
        title: 'Agreement Signed & Completed',
        message: `${tenantUser?.firstName || 'A tenant'} has signed the tenancy agreement for ${property.title}. Approval is now complete!`,
        link: '/app/applications',
      });
      await landlordNotification.save();

      return {
        id: app.id,
        property: app.property as any,
        tenant: app.tenant as any,
        nationalIdUrl: app.nationalIdUrl,
        supportingDocsUrl: app.supportingDocsUrl || null,
        employerName: app.employerName,
        jobTitle: app.jobTitle,
        monthlyIncome: app.monthlyIncome,
        lengthOfEmployment: app.lengthOfEmployment,
        personalStatement: app.personalStatement,
        status: app.status,
        furtherDetailsRequest: app.furtherDetailsRequest || null,
        furtherDetailsResponse: app.furtherDetailsResponse || null,
        agreementUrl: app.agreementUrl || null,
        signedAgreementUrl: app.signedAgreementUrl || null,
        createdAt: (app as any).createdAt.toISOString(),
        updatedAt: (app as any).updatedAt.toISOString(),
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
            createdAt:
              typeof landlordVal.createdAt === 'string'
                ? landlordVal.createdAt
                : landlordVal.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt:
              typeof landlordVal.updatedAt === 'string'
                ? landlordVal.updatedAt
                : landlordVal.updatedAt?.toISOString() || new Date().toISOString(),
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
  Application: {
    property: async (parent) => {
      const propId = (parent as any).property;
      if (propId && typeof propId === 'object' && 'title' in propId) {
        return propId;
      }
      const prop = await Property.findById(propId).populate('landlord');
      if (!prop) {
        throw new Error('Property not found');
      }
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
      };
    },
    tenant: async (parent) => {
      const tenantVal = (parent as any).tenant;
      if (tenantVal && typeof tenantVal === 'object') {
        const id = tenantVal.id || tenantVal._id?.toString();
        if (id && tenantVal.firstName) {
          return {
            id,
            firstName: tenantVal.firstName,
            lastName: tenantVal.lastName,
            email: tenantVal.email,
            userType: tenantVal.userType,
            phone: tenantVal.phone,
            savedProperties: [],
            createdAt:
              typeof tenantVal.createdAt === 'string'
                ? tenantVal.createdAt
                : tenantVal.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt:
              typeof tenantVal.updatedAt === 'string'
                ? tenantVal.updatedAt
                : tenantVal.updatedAt?.toISOString() || new Date().toISOString(),
          };
        }
      }

      const user = await User.findById(tenantVal);
      if (!user) {
        throw new Error('Tenant user not found');
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
  Notification: {
    recipient: async (parent) => {
      const recipientVal = (parent as any).recipient;
      if (recipientVal && typeof recipientVal === 'object') {
        const id = recipientVal.id || recipientVal._id?.toString();
        if (id && recipientVal.firstName) {
          return {
            id,
            firstName: recipientVal.firstName,
            lastName: recipientVal.lastName,
            email: recipientVal.email,
            userType: recipientVal.userType,
            phone: recipientVal.phone,
            savedProperties: [],
            createdAt: typeof recipientVal.createdAt === 'string' ? recipientVal.createdAt : (recipientVal.createdAt?.toISOString() || new Date().toISOString()),
            updatedAt: typeof recipientVal.updatedAt === 'string' ? recipientVal.updatedAt : (recipientVal.updatedAt?.toISOString() || new Date().toISOString()),
          };
        }
      }

      const user = await User.findById(recipientVal);
      if (!user) {
        throw new Error('Notification recipient user not found');
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
};
