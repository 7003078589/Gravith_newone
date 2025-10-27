import type { Tender, TenderDocument } from '@/types';

// Mock tender documents
const commonDocuments: TenderDocument[] = [
  {
    id: '1',
    name: 'Technical Bid',
    collected: true,
    collectedDate: '2024-01-15T00:00:00Z',
    fileUrl: null,
    uploadedBy: 'admin',
  },
  {
    id: '2',
    name: 'Financial Bid',
    collected: true,
    collectedDate: '2024-01-15T00:00:00Z',
    fileUrl: null,
    uploadedBy: 'admin',
  },
  {
    id: '3',
    name: 'Company Registration Certificate',
    collected: true,
    collectedDate: '2024-01-10T00:00:00Z',
    fileUrl: null,
    uploadedBy: 'admin',
  },
  {
    id: '4',
    name: 'GST Certificate',
    collected: true,
    collectedDate: '2024-01-10T00:00:00Z',
    fileUrl: null,
    uploadedBy: 'admin',
  },
  {
    id: '5',
    name: 'PAN Card',
    collected: true,
    collectedDate: '2024-01-10T00:00:00Z',
    fileUrl: null,
    uploadedBy: 'admin',
  },
  {
    id: '6',
    name: 'EMD Payment Receipt',
    collected: false,
    collectedDate: null,
    fileUrl: null,
    uploadedBy: null,
  },
];

export const mockTenders: Tender[] = [
  {
    id: '1',
    tenderNumber: 'TND-2024-001',
    name: 'Construction of 50 Low-Cost Housing Units',
    client: 'Municipal Corporation of Greater Mumbai',
    organizationId: 'org1',
    tenderAmount: 45000000,
    emdAmount: 900000,
    emdPaid: true,
    emdPaidDate: '2024-01-10T00:00:00Z',
    emdPaidReference: 'EMD/2024/001',
    emdReturned: true,
    emdReturnDate: '2024-03-15T00:00:00Z',
    emdReturnReference: 'REMD/2024/001',
    submissionDate: '2024-01-20T00:00:00Z',
    openingDate: '2024-01-25T00:00:00Z',
    location: 'Andheri West, Mumbai, Maharashtra',
    projectType: 'Building',
    contactPerson: 'Rajesh Kumar',
    contactEmail: 'rajesh.kumar@mcgm.gov.in',
    contactPhone: '+91-9876543210',
    status: 'won',
    documentChecklist: commonDocuments.map((doc) => ({ ...doc })),
    convertedToSiteId: '1',
    conversionDate: '2024-03-20T00:00:00Z',
    description:
      'Construction of 50 affordable housing units with modern amenities for economically weaker sections. Project includes infrastructure development, water supply, and electricity connections.',
    evaluationCriteria: 'Technical capability (40%), Financial bid (40%), Past experience (20%)',
    notes: 'Tender awarded on March 15, 2024. Project commenced on March 20, 2024.',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-03-20T00:00:00Z',
  },
  {
    id: '2',
    tenderNumber: 'TND-2024-002',
    name: 'Highway Expansion Project - Phase 2',
    client: 'National Highways Authority of India',
    organizationId: 'org1',
    tenderAmount: 125000000,
    emdAmount: 2500000,
    emdPaid: true,
    emdPaidDate: '2024-02-01T00:00:00Z',
    emdPaidReference: 'EMD/2024/002',
    emdReturned: false,
    emdReturnDate: null,
    emdReturnReference: null,
    submissionDate: '2024-02-15T00:00:00Z',
    openingDate: '2024-02-20T00:00:00Z',
    location: 'Mumbai-Pune Expressway, Maharashtra',
    projectType: 'Road',
    contactPerson: 'Priya Sharma',
    contactEmail: 'priya.sharma@nhai.gov.in',
    contactPhone: '+91-9876543211',
    status: 'under-evaluation',
    documentChecklist: commonDocuments.map((doc) => ({ ...doc })),
    convertedToSiteId: null,
    conversionDate: null,
    description:
      'Expansion and strengthening of existing 4-lane highway to 6-lane configuration. Includes bridge construction, drainage systems, and road safety measures.',
    evaluationCriteria:
      'Technical qualification (35%), Financial proposal (45%), Timeline commitment (20%)',
    notes: 'Technical evaluation in progress. Expected decision by April 2024.',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z',
  },
  {
    id: '3',
    tenderNumber: 'TND-2024-003',
    name: 'Commercial Complex Development',
    client: 'Pune Smart City Development Corporation',
    organizationId: 'org1',
    tenderAmount: 85000000,
    emdAmount: 1700000,
    emdPaid: true,
    emdPaidDate: '2024-01-25T00:00:00Z',
    emdPaidReference: 'EMD/2024/003',
    emdReturned: true,
    emdReturnDate: '2024-03-01T00:00:00Z',
    emdReturnReference: 'REMD/2024/003',
    submissionDate: '2024-02-05T00:00:00Z',
    openingDate: '2024-02-10T00:00:00Z',
    location: 'Hinjewadi IT Park, Pune, Maharashtra',
    projectType: 'Building',
    contactPerson: 'Amit Deshmukh',
    contactEmail: 'amit.deshmukh@punesmartcity.in',
    contactPhone: '+91-9876543212',
    status: 'lost',
    documentChecklist: commonDocuments.map((doc) => ({ ...doc })),
    convertedToSiteId: null,
    conversionDate: null,
    description:
      'Development of multi-storey commercial complex with retail spaces, office areas, and parking facilities. Total built-up area: 50,000 sq.ft.',
    evaluationCriteria:
      'Technical score (40%), Financial bid (40%), Green building compliance (20%)',
    notes:
      'Tender lost to competitor. Lower financial bid was the deciding factor. EMD returned on March 1, 2024.',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '4',
    tenderNumber: 'TND-2024-004',
    name: 'Metro Station Construction',
    client: 'Mumbai Metro Rail Corporation',
    organizationId: 'org1',
    tenderAmount: 95000000,
    emdAmount: 1900000,
    emdPaid: true,
    emdPaidDate: '2024-03-01T00:00:00Z',
    emdPaidReference: 'EMD/2024/004',
    emdReturned: false,
    emdReturnDate: null,
    emdReturnReference: null,
    submissionDate: '2024-03-20T00:00:00Z',
    openingDate: '2024-03-25T00:00:00Z',
    location: 'Goregaon East, Mumbai, Maharashtra',
    projectType: 'Infrastructure',
    contactPerson: 'Suresh Patel',
    contactEmail: 'suresh.patel@mmrc.gov.in',
    contactPhone: '+91-9876543213',
    status: 'submitted',
    documentChecklist: [
      ...commonDocuments.map((doc) => ({ ...doc })),
      {
        id: '7',
        name: 'Safety Compliance Certificate',
        collected: false,
        collectedDate: null,
        fileUrl: null,
        uploadedBy: null,
      },
    ],
    convertedToSiteId: null,
    conversionDate: null,
    description:
      'Construction of elevated metro station including platform, concourse, and connecting pedestrian bridges. Includes electrical and mechanical systems installation.',
    evaluationCriteria:
      'Metro experience (30%), Technical capability (30%), Financial bid (30%), Safety record (10%)',
    notes: 'Tender submitted. Awaiting technical evaluation.',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-03-20T00:00:00Z',
  },
  {
    id: '5',
    tenderNumber: 'TND-2024-005',
    name: 'Bridge Construction over River Ulhas',
    client: 'Maharashtra Public Works Department',
    organizationId: 'org1',
    tenderAmount: 65000000,
    emdAmount: 1300000,
    emdPaid: false,
    emdPaidDate: null,
    emdPaidReference: null,
    emdReturned: false,
    emdReturnDate: null,
    emdReturnReference: null,
    submissionDate: '2024-04-15T00:00:00Z',
    openingDate: '2024-04-20T00:00:00Z',
    location: 'Ulhasnagar, Thane District, Maharashtra',
    projectType: 'Bridge',
    contactPerson: 'Vidya Kulkarni',
    contactEmail: 'vidya.kulkarni@mahapwd.gov.in',
    contactPhone: '+91-9876543214',
    status: 'draft',
    documentChecklist: [
      {
        id: '1',
        name: 'Technical Bid',
        collected: false,
        collectedDate: null,
        fileUrl: null,
        uploadedBy: null,
      },
      {
        id: '2',
        name: 'Financial Bid',
        collected: false,
        collectedDate: null,
        fileUrl: null,
        uploadedBy: null,
      },
      {
        id: '3',
        name: 'Company Registration Certificate',
        collected: true,
        collectedDate: '2024-01-10T00:00:00Z',
        fileUrl: null,
        uploadedBy: 'admin',
      },
      {
        id: '4',
        name: 'GST Certificate',
        collected: true,
        collectedDate: '2024-01-10T00:00:00Z',
        fileUrl: null,
        uploadedBy: 'admin',
      },
    ],
    convertedToSiteId: null,
    conversionDate: null,
    description:
      'Construction of RCC bridge across River Ulhas with approach roads. Total length: 250 meters. Design load: 70R tracked vehicle.',
    evaluationCriteria:
      'Bridge construction experience (35%), Technical proposal (30%), Financial bid (35%)',
    notes: 'Draft tender. Preparing technical documents.',
    createdAt: '2024-03-20T00:00:00Z',
    updatedAt: '2024-03-20T00:00:00Z',
  },
  {
    id: '6',
    tenderNumber: 'TND-2024-006',
    name: 'Industrial Warehouse Complex',
    client: 'Bhiwandi Logistics Park Pvt Ltd',
    organizationId: 'org1',
    tenderAmount: 55000000,
    emdAmount: 1100000,
    emdPaid: true,
    emdPaidDate: '2024-02-10T00:00:00Z',
    emdPaidReference: 'EMD/2024/006',
    emdReturned: false,
    emdReturnDate: null,
    emdReturnReference: null,
    submissionDate: '2024-02-25T00:00:00Z',
    openingDate: '2024-03-01T00:00:00Z',
    location: 'Bhiwandi, Thane District, Maharashtra',
    projectType: 'Infrastructure',
    contactPerson: 'Rahul Mehta',
    contactEmail: 'rahul.mehta@bhiwandilogistics.com',
    contactPhone: '+91-9876543215',
    status: 'under-evaluation',
    documentChecklist: commonDocuments.map((doc) => ({ ...doc })),
    convertedToSiteId: null,
    conversionDate: null,
    description:
      'Construction of Grade-A warehouse facility with loading docks, office space, and utilities. Total area: 75,000 sq.ft.',
    evaluationCriteria: 'Warehouse experience (25%), Technical design (30%), Financial bid (45%)',
    notes: 'Financial bid opened. Awaiting final evaluation.',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '7',
    tenderNumber: 'TND-2024-007',
    name: 'School Building Renovation',
    client: 'Navi Mumbai Municipal Corporation',
    organizationId: 'org1',
    tenderAmount: 15000000,
    emdAmount: 300000,
    emdPaid: true,
    emdPaidDate: '2024-03-05T00:00:00Z',
    emdPaidReference: 'EMD/2024/007',
    emdReturned: false,
    emdReturnDate: null,
    emdReturnReference: null,
    submissionDate: '2024-03-15T00:00:00Z',
    openingDate: null,
    location: 'Vashi, Navi Mumbai, Maharashtra',
    projectType: 'Building',
    contactPerson: 'Kavita Singh',
    contactEmail: 'kavita.singh@nmmc.gov.in',
    contactPhone: '+91-9876543216',
    status: 'submitted',
    documentChecklist: commonDocuments.map((doc) => ({ ...doc })),
    convertedToSiteId: null,
    conversionDate: null,
    description:
      'Comprehensive renovation of existing government school including structural repairs, painting, electrical works, and sanitation upgrades.',
    evaluationCriteria:
      'Past renovation experience (30%), Technical approach (30%), Financial bid (40%)',
    notes: 'Tender submitted. Opening date to be announced.',
    createdAt: '2024-02-25T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
  },
];

// Helper functions
export const getActiveTenders = (): Tender[] => {
  return mockTenders.filter((tender) => tender.status !== 'closed');
};

export const getTendersByStatus = (status: Tender['status']): Tender[] => {
  return mockTenders.filter((tender) => tender.status === status);
};

export const getTenderById = (id: string): Tender | undefined => {
  return mockTenders.find((tender) => tender.id === id);
};

export const getTenderByNumber = (tenderNumber: string): Tender | undefined => {
  return mockTenders.find((tender) => tender.tenderNumber === tenderNumber);
};

export const getWonTenders = (): Tender[] => {
  return mockTenders.filter((tender) => tender.status === 'won');
};

export const getLostTenders = (): Tender[] => {
  return mockTenders.filter((tender) => tender.status === 'lost');
};

export const getTendersWithPendingEMD = (): Tender[] => {
  return mockTenders.filter((tender) => tender.emdPaid && !tender.emdReturned);
};

export const getConvertedTenders = (): Tender[] => {
  return mockTenders.filter((tender) => tender.convertedToSiteId !== null);
};

export const projectTypes = [
  'Building',
  'Infrastructure',
  'Road',
  'Bridge',
  'Industrial',
  'Residential',
  'Commercial',
  'Renovation',
  'Other',
];

export const defaultDocumentChecklist: TenderDocument[] = [
  {
    id: 'doc-1',
    name: 'Technical Bid',
    collected: false,
    collectedDate: null,
    fileUrl: null,
    uploadedBy: null,
  },
  {
    id: 'doc-2',
    name: 'Financial Bid',
    collected: false,
    collectedDate: null,
    fileUrl: null,
    uploadedBy: null,
  },
  {
    id: 'doc-3',
    name: 'Company Registration Certificate',
    collected: false,
    collectedDate: null,
    fileUrl: null,
    uploadedBy: null,
  },
  {
    id: 'doc-4',
    name: 'GST Certificate',
    collected: false,
    collectedDate: null,
    fileUrl: null,
    uploadedBy: null,
  },
  {
    id: 'doc-5',
    name: 'PAN Card',
    collected: false,
    collectedDate: null,
    fileUrl: null,
    uploadedBy: null,
  },
  {
    id: 'doc-6',
    name: 'EMD Payment Receipt',
    collected: false,
    collectedDate: null,
    fileUrl: null,
    uploadedBy: null,
  },
];
