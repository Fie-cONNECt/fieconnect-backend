export const typeDefs = `#graphql
  type UserPreferences {
    regions: [String!]!
    districts: [String!]!
    types: [String!]!
    minPrice: Float
    maxPrice: Float
    bedrooms: [String!]!
    amenities: [String!]!
    parking: String
    onboardingStatus: String!
  }

  input PreferencesInput {
    regions: [String!]
    districts: [String!]
    types: [String!]
    minPrice: Float
    maxPrice: Float
    bedrooms: [String!]
    amenities: [String!]
    parking: String
  }

  type RecommendedProperty {
    property: Property!
    score: Float!
    stars: Int!
    reasons: [String!]!
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    userType: String!
    phone: String!
    avatarUrl: String
    bio: String
    savedProperties: [Property!]!
    preferences: UserPreferences!
    createdAt: String!
    updatedAt: String!
  }

  type PropertyImages {
    main: String!
    kitchen: String!
    bedroom: String!
    bathroom: String!
  }

  type Property {
    id: ID!
    title: String!
    type: String!
    location: String!
    region: String!
    district: String!
    price: Float!
    verified: Boolean!
    bedrooms: String!
    bathrooms: String!
    size: String!
    parking: String!
    about: String!
    amenities: [String!]!
    mapDescription: String
    lat: Float
    lng: Float
    image: String!
    images: PropertyImages!
    agreementUrl: String
    landlord: User!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreatePropertyInput {
    title: String!
    type: String!
    location: String!
    region: String!
    district: String!
    price: Float!
    bedrooms: String!
    bathrooms: String!
    size: String!
    parking: String!
    about: String!
    amenities: [String!]!
    image: String!
    kitchenImage: String!
    bedroomImage: String!
    bathroomImage: String!
    agreementUrl: String
  }

  type Application {
    id: ID!
    property: Property!
    tenant: User!
    nationalIdUrl: String!
    supportingDocsUrl: String
    employerName: String!
    jobTitle: String!
    monthlyIncome: String!
    lengthOfEmployment: String!
    personalStatement: String!
    status: String!
    furtherDetailsRequest: String
    furtherDetailsResponse: String
    agreementUrl: String
    signedAgreementUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type Notification {
    id: ID!
    recipient: User!
    title: String!
    message: String!
    read: Boolean!
    link: String
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    id: ID!
    sender: User!
    text: String!
    createdAt: String!
  }

  type Dispute {
    id: ID!
    tenancy: Application!
    creator: User!
    title: String!
    description: String!
    evidenceUrl: String
    status: String!
    comments: [Comment!]!
    viewedByLandlordAt: String
    viewedByTenantAt: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateApplicationInput {
    propertyId: ID!
    nationalIdUrl: String!
    supportingDocsUrl: String
    employerName: String!
    jobTitle: String!
    monthlyIncome: String!
    lengthOfEmployment: String!
    personalStatement: String!
  }

  type Query {
    me: User
    myProperties: [Property!]!
    properties(region: String, type: String, minPrice: Float, maxPrice: Float): [Property!]!
    recommendedProperties(limit: Int, region: String, type: String, minPrice: Float, maxPrice: Float): [RecommendedProperty!]!
    property(id: ID!): Property
    myApplications: [Application!]!
    receivedApplications: [Application!]!
    myNotifications: [Notification!]!
    myTenancies: [Application!]!
    tenancy(id: ID!): Application
    myDisputes: [Dispute!]!
    dispute(id: ID!): Dispute
  }

  type Mutation {
    register(firstName: String!, lastName: String!, email: String!, password: String!, userType: String!, phone: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    createProperty(input: CreatePropertyInput!): Property!
    toggleSaveProperty(propertyId: ID!): User!
    savePreferences(input: PreferencesInput!): User!
    skipPreferences(input: PreferencesInput): User!
    trackPropertyView(propertyId: ID!, durationSec: Float): Boolean!
    createApplication(input: CreateApplicationInput!): Application!
    updateApplicationStatus(id: ID!, status: String!): Application!
    requestFurtherDetails(id: ID!, message: String!): Application!
    submitFurtherDetails(id: ID!, response: String!): Application!
    markNotificationAsRead(id: ID!): Notification!
    approveApplicationWithAgreement(id: ID!, agreementUrl: String!): Application!
    submitSignedAgreement(id: ID!, signedAgreementUrl: String!): Application!
    createDispute(tenancyId: ID!, title: String!, description: String!, evidenceUrl: String): Dispute!
    addDisputeComment(id: ID!, text: String!): Dispute!
    resolveDispute(id: ID!): Dispute!
    updateProfile(firstName: String, lastName: String, phone: String, bio: String, avatarUrl: String): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
  }
`;
