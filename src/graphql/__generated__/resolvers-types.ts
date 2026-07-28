import { GraphQLResolveInfo } from 'graphql';
import { AuthContext } from '../../middleware/auth';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Application = {
  __typename?: 'Application';
  agreementUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  employerName: Scalars['String']['output'];
  furtherDetailsRequest?: Maybe<Scalars['String']['output']>;
  furtherDetailsResponse?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  jobTitle: Scalars['String']['output'];
  lengthOfEmployment: Scalars['String']['output'];
  monthlyIncome: Scalars['String']['output'];
  nationalIdUrl: Scalars['String']['output'];
  personalStatement: Scalars['String']['output'];
  property: Property;
  signedAgreementUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  supportingDocsUrl?: Maybe<Scalars['String']['output']>;
  tenant: User;
  updatedAt: Scalars['String']['output'];
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type Comment = {
  __typename?: 'Comment';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  sender: User;
  text: Scalars['String']['output'];
};

export type CreateApplicationInput = {
  employerName: Scalars['String']['input'];
  jobTitle: Scalars['String']['input'];
  lengthOfEmployment: Scalars['String']['input'];
  monthlyIncome: Scalars['String']['input'];
  nationalIdUrl: Scalars['String']['input'];
  personalStatement: Scalars['String']['input'];
  propertyId: Scalars['ID']['input'];
  supportingDocsUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePropertyInput = {
  about: Scalars['String']['input'];
  agreementUrl?: InputMaybe<Scalars['String']['input']>;
  amenities: Array<Scalars['String']['input']>;
  bathroomImage: Scalars['String']['input'];
  bathrooms: Scalars['String']['input'];
  bedroomImage: Scalars['String']['input'];
  bedrooms: Scalars['String']['input'];
  district: Scalars['String']['input'];
  image: Scalars['String']['input'];
  kitchenImage: Scalars['String']['input'];
  location: Scalars['String']['input'];
  parking: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  region: Scalars['String']['input'];
  size: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type Dispute = {
  __typename?: 'Dispute';
  comments: Array<Comment>;
  createdAt: Scalars['String']['output'];
  creator: User;
  description: Scalars['String']['output'];
  evidenceUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  tenancy: Application;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  viewedByLandlordAt?: Maybe<Scalars['String']['output']>;
  viewedByTenantAt?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addDisputeComment: Dispute;
  approveApplicationWithAgreement: Application;
  changePassword: Scalars['Boolean']['output'];
  createApplication: Application;
  createDispute: Dispute;
  createProperty: Property;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  markNotificationAsRead: Notification;
  register: AuthPayload;
  requestFurtherDetails: Application;
  resolveDispute: Dispute;
  savePreferences: User;
  skipPreferences: User;
  submitFurtherDetails: Application;
  submitSignedAgreement: Application;
  toggleSaveProperty: User;
  updateApplicationStatus: Application;
  updateProfile: User;
};


export type MutationAddDisputeCommentArgs = {
  id: Scalars['ID']['input'];
  text: Scalars['String']['input'];
};


export type MutationApproveApplicationWithAgreementArgs = {
  agreementUrl: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationCreateApplicationArgs = {
  input: CreateApplicationInput;
};


export type MutationCreateDisputeArgs = {
  description: Scalars['String']['input'];
  evidenceUrl?: InputMaybe<Scalars['String']['input']>;
  tenancyId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};


export type MutationCreatePropertyArgs = {
  input: CreatePropertyInput;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  userType: Scalars['String']['input'];
};


export type MutationRequestFurtherDetailsArgs = {
  id: Scalars['ID']['input'];
  message: Scalars['String']['input'];
};


export type MutationResolveDisputeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSavePreferencesArgs = {
  input: PreferencesInput;
};


export type MutationSubmitFurtherDetailsArgs = {
  id: Scalars['ID']['input'];
  response: Scalars['String']['input'];
};


export type MutationSubmitSignedAgreementArgs = {
  id: Scalars['ID']['input'];
  signedAgreementUrl: Scalars['String']['input'];
};


export type MutationToggleSavePropertyArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationUpdateApplicationStatusArgs = {
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationUpdateProfileArgs = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  link?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  read: Scalars['Boolean']['output'];
  recipient: User;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type PreferencesInput = {
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  bedrooms?: InputMaybe<Array<Scalars['String']['input']>>;
  districts?: InputMaybe<Array<Scalars['String']['input']>>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  regions?: InputMaybe<Array<Scalars['String']['input']>>;
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Property = {
  __typename?: 'Property';
  about: Scalars['String']['output'];
  agreementUrl?: Maybe<Scalars['String']['output']>;
  amenities: Array<Scalars['String']['output']>;
  bathrooms: Scalars['String']['output'];
  bedrooms: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  district: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image: Scalars['String']['output'];
  images: PropertyImages;
  landlord: User;
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  location: Scalars['String']['output'];
  mapDescription?: Maybe<Scalars['String']['output']>;
  parking: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  region: Scalars['String']['output'];
  size: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
};

export type PropertyImages = {
  __typename?: 'PropertyImages';
  bathroom: Scalars['String']['output'];
  bedroom: Scalars['String']['output'];
  kitchen: Scalars['String']['output'];
  main: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  dispute?: Maybe<Dispute>;
  me?: Maybe<User>;
  myApplications: Array<Application>;
  myDisputes: Array<Dispute>;
  myNotifications: Array<Notification>;
  myProperties: Array<Property>;
  myTenancies: Array<Application>;
  properties: Array<Property>;
  property?: Maybe<Property>;
  receivedApplications: Array<Application>;
  tenancy?: Maybe<Application>;
};


export type QueryDisputeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPropertiesArgs = {
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPropertyArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTenancyArgs = {
  id: Scalars['ID']['input'];
};

export type User = {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  preferences: UserPreferences;
  savedProperties: Array<Property>;
  updatedAt: Scalars['String']['output'];
  userType: Scalars['String']['output'];
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  amenities: Array<Scalars['String']['output']>;
  bedrooms: Array<Scalars['String']['output']>;
  districts: Array<Scalars['String']['output']>;
  maxPrice?: Maybe<Scalars['Float']['output']>;
  minPrice?: Maybe<Scalars['Float']['output']>;
  onboardingStatus: Scalars['String']['output'];
  regions: Array<Scalars['String']['output']>;
  types: Array<Scalars['String']['output']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Application: ResolverTypeWrapper<Application>;
  AuthPayload: ResolverTypeWrapper<AuthPayload>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Comment: ResolverTypeWrapper<Comment>;
  CreateApplicationInput: CreateApplicationInput;
  CreatePropertyInput: CreatePropertyInput;
  Dispute: ResolverTypeWrapper<Dispute>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Notification: ResolverTypeWrapper<Notification>;
  PreferencesInput: PreferencesInput;
  Property: ResolverTypeWrapper<Property>;
  PropertyImages: ResolverTypeWrapper<PropertyImages>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<User>;
  UserPreferences: ResolverTypeWrapper<UserPreferences>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Application: Application;
  AuthPayload: AuthPayload;
  Boolean: Scalars['Boolean']['output'];
  Comment: Comment;
  CreateApplicationInput: CreateApplicationInput;
  CreatePropertyInput: CreatePropertyInput;
  Dispute: Dispute;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Mutation: {};
  Notification: Notification;
  PreferencesInput: PreferencesInput;
  Property: Property;
  PropertyImages: PropertyImages;
  Query: {};
  String: Scalars['String']['output'];
  User: User;
  UserPreferences: UserPreferences;
}>;

export type ApplicationResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Application'] = ResolversParentTypes['Application']> = ResolversObject<{
  agreementUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  employerName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  furtherDetailsRequest?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  furtherDetailsResponse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  jobTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lengthOfEmployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  monthlyIncome?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nationalIdUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  personalStatement?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  property?: Resolver<ResolversTypes['Property'], ParentType, ContextType>;
  signedAgreementUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  supportingDocsUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenant?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthPayloadResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommentResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DisputeResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Dispute'] = ResolversParentTypes['Dispute']> = ResolversObject<{
  comments?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  creator?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  evidenceUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenancy?: Resolver<ResolversTypes['Application'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  viewedByLandlordAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  viewedByTenantAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addDisputeComment?: Resolver<ResolversTypes['Dispute'], ParentType, ContextType, RequireFields<MutationAddDisputeCommentArgs, 'id' | 'text'>>;
  approveApplicationWithAgreement?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationApproveApplicationWithAgreementArgs, 'agreementUrl' | 'id'>>;
  changePassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'currentPassword' | 'newPassword'>>;
  createApplication?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationCreateApplicationArgs, 'input'>>;
  createDispute?: Resolver<ResolversTypes['Dispute'], ParentType, ContextType, RequireFields<MutationCreateDisputeArgs, 'description' | 'tenancyId' | 'title'>>;
  createProperty?: Resolver<ResolversTypes['Property'], ParentType, ContextType, RequireFields<MutationCreatePropertyArgs, 'input'>>;
  login?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  markNotificationAsRead?: Resolver<ResolversTypes['Notification'], ParentType, ContextType, RequireFields<MutationMarkNotificationAsReadArgs, 'id'>>;
  register?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'firstName' | 'lastName' | 'password' | 'phone' | 'userType'>>;
  requestFurtherDetails?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationRequestFurtherDetailsArgs, 'id' | 'message'>>;
  resolveDispute?: Resolver<ResolversTypes['Dispute'], ParentType, ContextType, RequireFields<MutationResolveDisputeArgs, 'id'>>;
  savePreferences?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationSavePreferencesArgs, 'input'>>;
  skipPreferences?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  submitFurtherDetails?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationSubmitFurtherDetailsArgs, 'id' | 'response'>>;
  submitSignedAgreement?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationSubmitSignedAgreementArgs, 'id' | 'signedAgreementUrl'>>;
  toggleSaveProperty?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationToggleSavePropertyArgs, 'propertyId'>>;
  updateApplicationStatus?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationUpdateApplicationStatusArgs, 'id' | 'status'>>;
  updateProfile?: Resolver<ResolversTypes['User'], ParentType, ContextType, Partial<MutationUpdateProfileArgs>>;
}>;

export type NotificationResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  link?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  read?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  recipient?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PropertyResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Property'] = ResolversParentTypes['Property']> = ResolversObject<{
  about?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  agreementUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  amenities?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  bathrooms?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bedrooms?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  district?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  images?: Resolver<ResolversTypes['PropertyImages'], ParentType, ContextType>;
  landlord?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mapDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parking?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PropertyImagesResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['PropertyImages'] = ResolversParentTypes['PropertyImages']> = ResolversObject<{
  bathroom?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bedroom?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  kitchen?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  main?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  dispute?: Resolver<Maybe<ResolversTypes['Dispute']>, ParentType, ContextType, RequireFields<QueryDisputeArgs, 'id'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  myApplications?: Resolver<Array<ResolversTypes['Application']>, ParentType, ContextType>;
  myDisputes?: Resolver<Array<ResolversTypes['Dispute']>, ParentType, ContextType>;
  myNotifications?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType>;
  myProperties?: Resolver<Array<ResolversTypes['Property']>, ParentType, ContextType>;
  myTenancies?: Resolver<Array<ResolversTypes['Application']>, ParentType, ContextType>;
  properties?: Resolver<Array<ResolversTypes['Property']>, ParentType, ContextType, Partial<QueryPropertiesArgs>>;
  property?: Resolver<Maybe<ResolversTypes['Property']>, ParentType, ContextType, RequireFields<QueryPropertyArgs, 'id'>>;
  receivedApplications?: Resolver<Array<ResolversTypes['Application']>, ParentType, ContextType>;
  tenancy?: Resolver<Maybe<ResolversTypes['Application']>, ParentType, ContextType, RequireFields<QueryTenancyArgs, 'id'>>;
}>;

export type UserResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  preferences?: Resolver<ResolversTypes['UserPreferences'], ParentType, ContextType>;
  savedProperties?: Resolver<Array<ResolversTypes['Property']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserPreferencesResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['UserPreferences'] = ResolversParentTypes['UserPreferences']> = ResolversObject<{
  amenities?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  bedrooms?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  districts?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  maxPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  minPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  onboardingStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  regions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  types?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = AuthContext> = ResolversObject<{
  Application?: ApplicationResolvers<ContextType>;
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  Dispute?: DisputeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  Property?: PropertyResolvers<ContextType>;
  PropertyImages?: PropertyImagesResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserPreferences?: UserPreferencesResolvers<ContextType>;
}>;

