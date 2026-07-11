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

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
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

export type Mutation = {
  __typename?: 'Mutation';
  createProperty: Property;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  register: AuthPayload;
};


export type MutationCreatePropertyArgs = {
  input: CreatePropertyInput;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  userType: Scalars['String']['input'];
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
  me?: Maybe<User>;
  myProperties: Array<Property>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  userType: Scalars['String']['output'];
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
  AuthPayload: ResolverTypeWrapper<AuthPayload>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreatePropertyInput: CreatePropertyInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Property: ResolverTypeWrapper<Property>;
  PropertyImages: ResolverTypeWrapper<PropertyImages>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AuthPayload: AuthPayload;
  Boolean: Scalars['Boolean']['output'];
  CreatePropertyInput: CreatePropertyInput;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Mutation: {};
  Property: Property;
  PropertyImages: PropertyImages;
  Query: {};
  String: Scalars['String']['output'];
  User: User;
}>;

export type AuthPayloadResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createProperty?: Resolver<ResolversTypes['Property'], ParentType, ContextType, RequireFields<MutationCreatePropertyArgs, 'input'>>;
  login?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  register?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'firstName' | 'lastName' | 'password' | 'phone' | 'userType'>>;
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
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  myProperties?: Resolver<Array<ResolversTypes['Property']>, ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = AuthContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = AuthContext> = ResolversObject<{
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Property?: PropertyResolvers<ContextType>;
  PropertyImages?: PropertyImagesResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

