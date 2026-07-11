export const typeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    userType: String!
    phone: String!
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

  type Query {
    me: User
    myProperties: [Property!]!
  }

  type Mutation {
    register(firstName: String!, lastName: String!, email: String!, password: String!, userType: String!, phone: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    createProperty(input: CreatePropertyInput!): Property!
  }
`;
