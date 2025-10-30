// User and Organization Types for Gavith Build

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
  organizationId: string;
  organizationRole: 'owner' | 'admin' | 'manager' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  isActive: boolean;
  subscription?: 'free' | 'basic' | 'premium' | 'enterprise';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface UserWithOrganization extends User {
  organization: Organization;
}

// Legacy user type for backward compatibility
export interface LegacyUser {
  username: string;
  companyName: string;
  role: string;
}

// Additional types for specific features
export interface Site {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'in-use' | 'maintenance';
  siteId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  category: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialPurchase {
  id: string;
  materialId: string;
  materialName: string;
  siteId?: string;
  siteName?: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalAmount: number;
  vendorInvoiceNumber: string;
  purchaseDate: string;
  filledWeight?: number;
  emptyWeight?: number;
  netWeight?: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'Labour' | 'Materials' | 'Equipment' | 'Transport' | 'Utilities' | 'Other';
  subcategory?: string;
  date: string;
  vendor?: string;
  siteId?: string;
  siteName?: string;
  receipt?: string;
  status: 'paid' | 'pending' | 'overdue';
  approvedBy?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  clientName: string;
  amount: number;
  status: 'pending' | 'completed' | 'overdue';
  dueDate: string;
  paidDate?: string;
  siteId?: string;
  siteName?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialReceipt {
  id: string;
  date: string;
  vehicleNumber: string;
  vendorId?: string;
  vendorName?: string;
  materialId: string;
  materialName: string;
  filledWeight: number;
  emptyWeight: number;
  netWeight: number;
  linkedPurchaseId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenderDocument {
  id: string;
  name: string;
  collected: boolean;
  collectedDate: string | null;
  fileUrl: string | null;
  uploadedBy: string | null;
}

export interface Tender {
  id: string;
  tenderNumber: string;
  name: string;
  client: string;
  organizationId: string;
  tenderAmount: number;
  emdAmount: number;
  emdPaid: boolean;
  emdPaidDate: string | null;
  emdPaidReference: string | null;
  emdReturned: boolean;
  emdReturnDate: string | null;
  emdReturnReference: string | null;
  submissionDate: string;
  openingDate: string | null;
  location: string;
  projectType: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'draft' | 'submitted' | 'under-evaluation' | 'won' | 'lost' | 'closed';
  documentChecklist: TenderDocument[];
  convertedToSiteId: string | null;
  conversionDate: string | null;
  description: string;
  evaluationCriteria: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
