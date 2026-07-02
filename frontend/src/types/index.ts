export type Role = 'MEMBER' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  role: Role;
  profilePhotoUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IndustrySegment =
  | 'TEXTILE'
  | 'CHEMICAL'
  | 'MECHANICAL_ENGINEERING'
  | 'DIAMOND_JEWELLERY'
  | 'PLASTICS'
  | 'CERAMICS'
  | 'PHARMA'
  | 'FOOD_PROCESSING'
  | 'IT_SERVICES'
  | 'REAL_ESTATE'
  | 'LOGISTICS'
  | 'AUTOMOBILE_PARTS'
  | 'HANDICRAFTS'
  | 'OTHERS';

export interface Business {
  id: string;
  ownerId: string;
  owner?: User;
  businessName: string;
  segment: IndustrySegment;
  description: string;
  city: string;
  state: string;
  address: string;
  contactPhone: string;
  whatsappNumber?: string;
  contactEmail?: string;
  logoUrl?: string;
  gstNumber?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface IndustryProduct {
  id: string;
  businessId: string;
  business?: Business;
  name: string;
  description: string;
  category: string;
  priceRange: string;
  unit: string;
  images: string[];
  moq?: string;
  isActive: boolean;
  createdAt: string;
}

export type CropCategory = 'VEGETABLE' | 'FRUIT' | 'GRAIN' | 'DAIRY' | 'OTHER';
export type ProduceUnit = 'KG' | 'DOZEN' | 'QUINTAL';

export interface FarmerProduce {
  id: string;
  ownerId: string;
  owner?: User;
  cropName: string;
  category: CropCategory;
  pricePerUnit: number;
  unit: ProduceUnit;
  quantityAvailable: number;
  harvestDate: string;
  village: string;
  city: string;
  images: string[];
  isOrganic: boolean;
  isActive: boolean;
  createdAt: string;
}

export type WomenProductCategory =
  | 'HANDICRAFTS'
  | 'FOOD_PICKLES'
  | 'CLOTHING_BOUTIQUE'
  | 'JEWELLERY_ACCESSORIES'
  | 'BEAUTY_WELLNESS'
  | 'HOME_DECOR'
  | 'OTHERS';

export interface WomenProduct {
  id: string;
  ownerId: string;
  owner?: User;
  name: string;
  description: string;
  category: WomenProductCategory;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
}

export type ProviderType = 'INDIVIDUAL' | 'NGO';
export type SocialServiceCategory =
  | 'EDUCATION_TUITION'
  | 'HEALTHCARE_CAMP'
  | 'SKILL_TRAINING'
  | 'COUNSELING'
  | 'LEGAL_AID'
  | 'OTHERS';

export interface SocialService {
  id: string;
  ownerId: string;
  owner?: User;
  providerType: ProviderType;
  serviceName: string;
  category: SocialServiceCategory;
  description: string;
  schedule: string;
  city: string;
  address: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
}

export type EnquiryListingType = 'INDUSTRY_PRODUCT' | 'SOCIAL_SERVICE';
export type EnquiryStatus = 'PENDING' | 'CONTACTED' | 'CLOSED';

export interface Enquiry {
  id: string;
  listingType: EnquiryListingType;
  listingId: string;
  listingName?: string; // resolved locally or from server
  buyerId: string;
  buyer?: User;
  sellerId: string;
  seller?: User;
  message: string;
  contactPhone: string;
  status: EnquiryStatus;
  createdAt: string;
}

export type CartItemType = 'FARMER_PRODUCE' | 'WOMEN_PRODUCT';

export interface CartItem {
  id: string;
  userId: string;
  itemType: CartItemType;
  itemId: string;
  quantity: number;
  // Filled in by service/client
  farmerProduce?: FarmerProduce;
  womenProduct?: WomenProduct;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  user?: User;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  orderItems?: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemType: CartItemType;
  itemId: string;
  itemNameSnapshot: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Family {
  id: string;
  headOfFamilyUserId: string;
  headOfFamily?: User;
  familyName: string;
  nativePlace: string;
  currentCity: string;
  currentState: string;
  currentAddress: string;
  contactPhone: string;
  contactEmail?: string;
  isPublic: boolean;
  members?: FamilyMember[];
  _count?: {
    members: number;
  };
  createdAt: string;
}

export type Relation = 'SELF' | 'SPOUSE' | 'SON' | 'DAUGHTER' | 'FATHER' | 'MOTHER' | 'OTHER';
export type Gender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'ENGAGED' | 'DIVORCED' | 'WIDOWED';

export interface FamilyMember {
  id: string;
  familyId: string;
  fullName: string;
  relation: Relation;
  gender: Gender;
  dob: string;
  education?: string;
  profession?: string;
  companyName?: string;
  maritalStatus: MaritalStatus;
  photoUrl?: string;
  bio?: string;
  createdAt: string;
}

// ─── API Envelope Types ──────────────────────────────────

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
