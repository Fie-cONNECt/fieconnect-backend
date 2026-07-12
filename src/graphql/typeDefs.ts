export const typeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    userType: String!
    phone: String!
    savedProperties: [Property!]!
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
    property(id: ID!): Property
    myApplications: [Application!]!
    receivedApplications: [Application!]!
    myNotifications: [Notification!]!
  }

  type Mutation {
    register(firstName: String!, lastName: String!, email: String!, password: String!, userType: String!, phone: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    createProperty(input: CreatePropertyInput!): Property!
    toggleSaveProperty(propertyId: ID!): User!
    createApplication(input: CreateApplicationInput!): Application!
    updateApplicationStatus(id: ID!, status: String!): Application!
    requestFurtherDetails(id: ID!, message: String!): Application!
    submitFurtherDetails(id: ID!, response: String!): Application!
    markNotificationAsRead(id: ID!): Notification!
  }
`;
