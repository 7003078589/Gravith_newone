'use client';

import {
  FileText,
  Plus,
  Edit,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  Trophy,
  AlertCircle,
  IndianRupee,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Upload,
  Download,
  Building2,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

import { formatDate, formatDateShort } from '../lib/utils';

import TenderForm from './forms/TenderForm';
import { defaultDocumentChecklist, mockTenders } from './shared/tenderData';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Tender, TenderDocument } from '@/types';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusIcon = (status: Tender['status']) => {
  switch (status) {
    case 'draft':
      return Edit;
    case 'submitted':
      return FileCheck;
    case 'under-evaluation':
      return Clock;
    case 'won':
      return Trophy;
    case 'lost':
      return XCircle;
    case 'closed':
      return AlertCircle;
    default:
      return FileText;
  }
};

const getStatusColor = (
  status: Tender['status'],
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'draft':
      return 'secondary';
    case 'submitted':
      return 'outline';
    case 'under-evaluation':
      return 'default';
    case 'won':
      return 'default';
    case 'lost':
      return 'destructive';
    case 'closed':
      return 'secondary';
    default:
      return 'default';
  }
};

export function TendersPage() {
  const [tenderData, setTenderData] = useState<Tender[]>(mockTenders);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTenderId, setSelectedTenderId] = useState<string>(mockTenders[0]?.id || '');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Tender detail state
  const [isWonDialogOpen, setIsWonDialogOpen] = useState(false);
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [emdReturnDate, setEmdReturnDate] = useState<Date | undefined>();
  const [emdReturnReference, setEmdReturnReference] = useState('');
  const [newDocumentName, setNewDocumentName] = useState('');

  // Get selected tender
  const currentTender = tenderData.find((t) => t.id === selectedTenderId);

  // Statistics
  const totalTenders = tenderData.length;
  const draftTenders = tenderData.filter((t) => t.status === 'draft').length;
  const submittedTenders = tenderData.filter(
    (t) => t.status === 'submitted' || t.status === 'under-evaluation',
  ).length;
  const wonTenders = tenderData.filter((t) => t.status === 'won').length;
  const lostTenders = tenderData.filter((t) => t.status === 'lost').length;
  const pendingEMDReturns = tenderData.filter((t) => t.emdPaid && !t.emdReturned).length;

  // Filter tenders
  const filteredTenders = tenderData.filter((tender) => {
    const matchesSearch =
      searchQuery === '' ||
      tender.tenderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewTender = () => {
    setEditingTender(null);
    setIsFormDialogOpen(true);
  };

  const handleEditTender = (tender: Tender) => {
    setEditingTender(tender);
    setIsFormDialogOpen(true);
  };

  const handleFormSubmit = (
    formData: Omit<
      Tender,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'documentChecklist'
      | 'convertedToSiteId'
      | 'conversionDate'
    >,
  ) => {
    if (editingTender) {
      // Update existing tender
      const updatedTender: Tender = {
        ...editingTender,
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      setTenderData((prev) => prev.map((t) => (t.id === editingTender.id ? updatedTender : t)));
    } else {
      // Create new tender
      const newTender: Tender = {
        ...formData,
        id: (Math.max(...mockTenders.map((t) => parseInt(t.id))) + 1).toString(),
        documentChecklist: defaultDocumentChecklist.map((doc) => ({ ...doc })),
        convertedToSiteId: null,
        conversionDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTenderData((prev) => [...prev, newTender]);
      setSelectedTenderId(newTender.id);
    }
    setEditingTender(null);
    setIsFormDialogOpen(false);
  };

  const handleFormCancel = () => {
    setEditingTender(null);
    setIsFormDialogOpen(false);
  };

  const updateTender = (updatedTender: Tender) => {
    setTenderData((prev) => prev.map((t) => (t.id === updatedTender.id ? updatedTender : t)));
  };

  const handleMarkAsWon = () => {
    if (!currentTender) return;
    const updatedTender = {
      ...currentTender,
      status: 'won' as const,
      updatedAt: new Date().toISOString(),
    };
    updateTender(updatedTender);
    setIsWonDialogOpen(false);
    toast.success('Tender marked as won!', {
      description: 'You can now convert it to a site.',
    });
  };

  const handleMarkAsLost = () => {
    if (!currentTender) return;
    const updatedTender = {
      ...currentTender,
      status: 'lost' as const,
      notes: `${currentTender.notes}\n\nLost Reason: ${lostReason}`,
      updatedAt: new Date().toISOString(),
    };
    updateTender(updatedTender);
    setIsLostDialogOpen(false);
    setLostReason('');
    toast.success('Tender marked as lost', {
      description: 'Status updated successfully.',
    });
  };

  const handleEmdReturnToggle = () => {
    if (!currentTender) return;
    if (currentTender.emdReturned) {
      const updatedTender = {
        ...currentTender,
        emdReturned: false,
        emdReturnDate: null,
        emdReturnReference: null,
        updatedAt: new Date().toISOString(),
      };
      updateTender(updatedTender);
      toast.success('EMD return status updated');
    } else {
      if (emdReturnDate) {
        const updatedTender = {
          ...currentTender,
          emdReturned: true,
          emdReturnDate: emdReturnDate.toISOString(),
          emdReturnReference: emdReturnReference || null,
          updatedAt: new Date().toISOString(),
        };
        updateTender(updatedTender);
        toast.success('EMD marked as returned');
        setEmdReturnDate(undefined);
        setEmdReturnReference('');
      }
    }
  };

  const handleDocumentToggle = (docId: string) => {
    if (!currentTender) return;
    const updatedDocs = currentTender.documentChecklist.map((doc) =>
      doc.id === docId
        ? {
            ...doc,
            collected: !doc.collected,
            collectedDate: !doc.collected ? new Date().toISOString() : null,
          }
        : doc,
    );
    const updatedTender = {
      ...currentTender,
      documentChecklist: updatedDocs,
      updatedAt: new Date().toISOString(),
    };
    updateTender(updatedTender);
  };

  const handleAddDocument = () => {
    if (!currentTender) return;
    if (!newDocumentName.trim()) {
      toast.error('Please enter document name');
      return;
    }
    const newDoc: TenderDocument = {
      id: `doc-${Date.now()}`,
      name: newDocumentName,
      collected: false,
      collectedDate: null,
      fileUrl: null,
      uploadedBy: null,
    };
    const updatedTender = {
      ...currentTender,
      documentChecklist: [...currentTender.documentChecklist, newDoc],
      updatedAt: new Date().toISOString(),
    };
    updateTender(updatedTender);
    setNewDocumentName('');
    toast.success('Document added to checklist');
  };

  const handleFileUpload = () => {
    toast.info('File upload feature coming soon');
  };

  const handleConvertToSite = () => {
    if (!currentTender) return;
    toast.success('Converting tender to site', {
      description: 'This feature will open the site creation form with pre-filled data.',
    });
    const updatedTender = {
      ...currentTender,
      convertedToSiteId: `site-${Date.now()}`,
      conversionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateTender(updatedTender);
    setIsConvertDialogOpen(false);
  };

  // Horizontal scroller ref for cards
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [frameWidth, setFrameWidth] = useState<number | undefined>(undefined);

  const scrollByFrame = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector('.tender-card') as HTMLElement | null;
    // Keep original card size; scroll exactly 3 cards per click
    const cardWidth = firstCard?.offsetWidth || 360;
    const gapPx = 16; // gap-4
    const distance = (cardWidth + gapPx) * 3;
    el.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  // Measure first card and set a fixed frame width to show exactly 3 cards
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector('.tender-card') as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth || 360;
    const gapPx = 16;
    setFrameWidth(cardWidth * 3 + gapPx * 2);
  }, [filteredTenders.length]);

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Top Section - Tenders List */}
      <div className="h-2/5 min-h-[400px] flex flex-col border-b">
        {/* Statistics Row */}
        <Card className="border-0 shadow-none rounded-none border-b bg-gradient-to-r from-muted/30 to-background">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 w-full">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Total</p>
                      <p className="text-xl md:text-2xl font-bold text-primary">{totalTenders}</p>
                    </div>
                    <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Draft</p>
                      <p className="text-xl md:text-2xl font-bold text-orange-600">
                        {draftTenders}
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <Edit className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Submitted</p>
                      <p className="text-xl md:text-2xl font-bold text-blue-600">
                        {submittedTenders}
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Won</p>
                      <p className="text-xl md:text-2xl font-bold text-green-600">{wonTenders}</p>
                    </div>
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <Trophy className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Lost</p>
                      <p className="text-xl md:text-2xl font-bold text-red-600">{lostTenders}</p>
                    </div>
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">EMD</p>
                      <p className="text-xl md:text-2xl font-bold text-amber-600">
                        {pendingEMDReturns}
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter Controls */}
        <Card className="border-0 shadow-none rounded-none border-b bg-background">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 transition-all focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under-evaluation">Under Evaluation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-3">
                <Button onClick={handleNewTender} className="gap-2 transition-all hover:shadow-md">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Tender</span>
                </Button>
              </div>

              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium ml-auto">
                {filteredTenders.length} tender{filteredTenders.length !== 1 ? 's' : ''} found
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tenders List - horizontal carousel with 3 per frame */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6">
            {(() => {
              const computedFrame = frameWidth ? frameWidth + 32 : undefined; // account for px-4 padding
              return (
                <div className="mx-auto" style={{ width: computedFrame }}>
                  <div
                ref={scrollerRef}
                className="flex gap-4 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scroll-smooth"
              >
              {filteredTenders.map((tender) => {
                const StatusIcon = getStatusIcon(tender.status);
                const statusColor = getStatusColor(tender.status);

                return (
                  <Card
                    key={tender.id}
                    className={`tender-card group relative cursor-pointer transition-shadow duration-300 overflow-visible flex-shrink-0 snap-start min-w-[360px] w-[360px] ${
                      selectedTenderId === tender.id
                        ? 'border-primary shadow-lg ring-2 ring-primary/30'
                        : 'border-border hover:border-primary/40 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTenderId(tender.id)}
                  >
                    <CardContent className="p-5">
                      {/* Header Section */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-3">
                          <h4 className="font-semibold text-lg leading-tight mb-2 truncate group-hover:text-primary transition-colors">
                            {tender.name}
                          </h4>
                          <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-1">
                            <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="font-mono text-xs">{tender.tenderNumber}</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{tender.client}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Badge
                            variant={statusColor}
                            className="flex items-center gap-1.5 px-2.5 py-1"
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span className="font-medium text-xs">
                              {tender.status.charAt(0).toUpperCase() +
                                tender.status.slice(1).replace('-', ' ')}
                            </span>
                          </Badge>
                          {tender.status === 'draft' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTender(tender);
                                    }}
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                                    aria-label="Edit tender"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit tender details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>

                      {/* Financial Overview */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
                          <div className="flex items-center gap-2 mb-1">
                            <IndianRupee className="h-3.5 w-3.5 text-primary" />
                            <p className="text-xs font-medium text-muted-foreground">Tender Amt</p>
                          </div>
                          <p className="font-bold text-sm text-primary">
                            {formatCurrency(tender.tenderAmount)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-500/5 p-3 border border-amber-500/10">
                          <div className="flex items-center gap-2 mb-1">
                            <IndianRupee className="h-3.5 w-3.5 text-amber-600" />
                            <p className="text-xs font-medium text-muted-foreground">EMD</p>
                          </div>
                          <p className="font-bold text-sm text-amber-600">
                            {formatCurrency(tender.emdAmount)}
                          </p>
                        </div>
                      </div>

                      {/* EMD Status */}
                      {tender.emdPaid && (
                        <div className="mb-4">
                          <Badge
                            variant={tender.emdReturned ? 'default' : 'outline'}
                            className="w-full justify-center gap-1.5 py-1.5"
                          >
                            {tender.emdReturned ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                <span className="text-xs">EMD Returned</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-amber-600" />
                                <span className="text-xs">EMD Pending Return</span>
                              </>
                            )}
                          </Badge>
                        </div>
                      )}

                      {/* Timeline & Location */}
                      <div className="space-y-2.5 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Submission: {formatDateShort(tender.submissionDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{tender.location}</span>
                        </div>
                      </div>
                    </CardContent>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-lg transition-colors pointer-events-none" />
                  </Card>
                );
              })}
                  </div>
                  {/* Navigation controls under the row */}
                  <div className="mt-3 flex items-center justify-between px-6">
                    <button
                      type="button"
                      aria-label="Previous tenders"
                      className="h-10 w-10 rounded-full bg-background border shadow hover:bg-muted flex items-center justify-center"
                      onClick={() => scrollByFrame('left')}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      aria-label="Next tenders"
                      className="h-10 w-10 rounded-full bg-background border shadow hover:bg-muted flex items-center justify-center"
                      onClick={() => scrollByFrame('right')}
                    >
                      ›
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Section - Tender Details */}
      <div className="flex-1 flex flex-col">
        <div className="h-full flex flex-col">
          {currentTender ? (
            <>
              {/* Tender Header */}
              <Card className="border-0 shadow-none rounded-none border-b bg-gradient-to-r from-background to-muted/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 bg-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <FileText className="h-7 w-7" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">{currentTender.name}</h1>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {currentTender.tenderNumber}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {currentTender.client}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={getStatusColor(currentTender.status)}
                        className="px-3 py-1 text-sm font-medium"
                      >
                        {currentTender.status.charAt(0).toUpperCase() +
                          currentTender.status.slice(1).replace('-', ' ')}
                      </Badge>
                      {currentTender.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTender(currentTender)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tender Details Tabs */}
              <div className="flex-1 overflow-hidden">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="h-full flex flex-col"
                >
                  <Card className="border-0 shadow-none rounded-none border-b">
                    <CardContent className="px-4 md:px-6 py-3">
                      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 lg:gap-2 bg-muted/50">
                        <TabsTrigger
                          value="overview"
                          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="financial"
                          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <IndianRupee className="h-4 w-4" />
                          <span className="hidden sm:inline">Financial & EMD</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="documents"
                          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <FileCheck className="h-4 w-4" />
                          <span className="hidden sm:inline">Documents</span>
                        </TabsTrigger>
                      </TabsList>
                    </CardContent>
                  </Card>

                  <ScrollArea className="flex-1">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0 p-4 md:p-6">
                      <div className="space-y-6">
                        {/* Status and Actions */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Tender Status & Actions</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {(currentTender.status === 'submitted' ||
                              currentTender.status === 'under-evaluation') && (
                              <div className="flex gap-3">
                                <Button onClick={() => setIsWonDialogOpen(true)} className="gap-2">
                                  <Trophy className="h-4 w-4" />
                                  Mark as Won
                                </Button>
                                <Button
                                  onClick={() => setIsLostDialogOpen(true)}
                                  variant="outline"
                                  className="gap-2"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Mark as Lost
                                </Button>
                              </div>
                            )}
                            {currentTender.status === 'won' && (
                              <div className="space-y-3">
                                {currentTender.convertedToSiteId ? (
                                  <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <div>
                                      <p className="font-medium text-green-900 dark:text-green-100">
                                        Converted to Site
                                      </p>
                                      <p className="text-sm text-green-700 dark:text-green-300">
                                        Site ID: {currentTender.convertedToSiteId} | Converted on{' '}
                                        {currentTender.conversionDate
                                          ? formatDate(currentTender.conversionDate)
                                          : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => setIsConvertDialogOpen(true)}
                                    className="gap-2"
                                  >
                                    <Building2 className="h-4 w-4" />
                                    Convert to Site
                                  </Button>
                                )}
                              </div>
                            )}
                            {currentTender.status === 'lost' && (
                              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="font-medium text-red-900 dark:text-red-100">
                                  Tender Lost
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                  Check EMD return status in Financial tab
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Basic Information */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-muted-foreground">Tender Number</Label>
                              <p className="font-mono font-medium">{currentTender.tenderNumber}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-muted-foreground">Project Type</Label>
                              <p className="font-medium">{currentTender.projectType}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-muted-foreground">Client</Label>
                              <p className="font-medium">{currentTender.client}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Location
                              </Label>
                              <p>{currentTender.location}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <Label className="text-muted-foreground text-xs">
                                  Contact Person
                                </Label>
                                <p className="font-medium">{currentTender.contactPerson}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <Label className="text-muted-foreground text-xs">Email</Label>
                                <p className="font-medium">{currentTender.contactEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <Label className="text-muted-foreground text-xs">Phone</Label>
                                <p className="font-medium">{currentTender.contactPhone}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Important Dates */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Important Dates</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Submission Date
                              </Label>
                              <p className="font-medium">
                                {formatDate(currentTender.submissionDate)}
                              </p>
                            </div>
                            {currentTender.openingDate && (
                              <div className="space-y-1">
                                <Label className="text-muted-foreground flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Opening Date
                                </Label>
                                <p className="font-medium">
                                  {formatDate(currentTender.openingDate)}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Description and Details */}
                        {(currentTender.description ||
                          currentTender.evaluationCriteria ||
                          currentTender.notes) && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Additional Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {currentTender.description && (
                                <div className="space-y-1">
                                  <Label className="text-muted-foreground">Description</Label>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {currentTender.description}
                                  </p>
                                </div>
                              )}
                              {currentTender.evaluationCriteria && (
                                <div className="space-y-1">
                                  <Label className="text-muted-foreground">
                                    Evaluation Criteria
                                  </Label>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {currentTender.evaluationCriteria}
                                  </p>
                                </div>
                              )}
                              {currentTender.notes && (
                                <div className="space-y-1">
                                  <Label className="text-muted-foreground">Notes</Label>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {currentTender.notes}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>

                    {/* Financial & EMD Tab */}
                    <TabsContent value="financial" className="mt-0 p-4 md:p-6">
                      <div className="space-y-6">
                        {/* Financial Overview */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Financial Details</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-muted-foreground flex items-center gap-2">
                                <IndianRupee className="h-4 w-4" />
                                Tender Amount
                              </Label>
                              <p className="text-3xl font-bold">
                                {formatCurrency(currentTender.tenderAmount)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-muted-foreground flex items-center gap-2">
                                <IndianRupee className="h-4 w-4" />
                                EMD Amount
                              </Label>
                              <p className="text-3xl font-bold">
                                {formatCurrency(currentTender.emdAmount)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* EMD Tracking */}
                        <Card>
                          <CardHeader>
                            <CardTitle>EMD Payment Status</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Payment Status */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                  {currentTender.emdPaid ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                  )}
                                  <div>
                                    <p className="font-medium">Payment Status</p>
                                    <p className="text-sm text-muted-foreground">
                                      {currentTender.emdPaid ? 'Paid' : 'Not Paid'}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={currentTender.emdPaid ? 'default' : 'secondary'}>
                                  {currentTender.emdPaid ? 'Completed' : 'Pending'}
                                </Badge>
                              </div>

                              {currentTender.emdPaid && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                                  <div className="space-y-1">
                                    <Label className="text-muted-foreground">Payment Date</Label>
                                    <p className="font-medium">
                                      {currentTender.emdPaidDate
                                        ? formatDate(currentTender.emdPaidDate)
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  {currentTender.emdPaidReference && (
                                    <div className="space-y-1">
                                      <Label className="text-muted-foreground">
                                        Payment Reference
                                      </Label>
                                      <p className="font-medium font-mono">
                                        {currentTender.emdPaidReference}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Return Status */}
                            {currentTender.emdPaid && (
                              <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-semibold">EMD Return Status</h3>
                                  <Badge
                                    variant={currentTender.emdReturned ? 'default' : 'outline'}
                                  >
                                    {currentTender.emdReturned ? 'Returned' : 'Pending'}
                                  </Badge>
                                </div>

                                {!currentTender.emdReturned ? (
                                  <div className="space-y-4 p-4 border rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                      Mark EMD as returned when payment is received back
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Return Date *</Label>
                                        <DatePicker
                                          date={emdReturnDate}
                                          onSelect={setEmdReturnDate}
                                          placeholder="Select return date"
                                          ariaLabel="EMD return date"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Return Reference</Label>
                                        <Input
                                          value={emdReturnReference}
                                          onChange={(e) => setEmdReturnReference(e.target.value)}
                                          placeholder="REMD/2024/001"
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      onClick={handleEmdReturnToggle}
                                      disabled={!emdReturnDate}
                                      className="gap-2"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      Mark as Returned
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-3">
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                      <p className="font-medium text-green-900 dark:text-green-100">
                                        EMD Returned Successfully
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <Label className="text-muted-foreground">Return Date</Label>
                                        <p className="font-medium">
                                          {currentTender.emdReturnDate
                                            ? formatDate(currentTender.emdReturnDate)
                                            : 'N/A'}
                                        </p>
                                      </div>
                                      {currentTender.emdReturnReference && (
                                        <div>
                                          <Label className="text-muted-foreground">
                                            Return Reference
                                          </Label>
                                          <p className="font-medium font-mono">
                                            {currentTender.emdReturnReference}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="mt-0 p-4 md:p-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Document Checklist</CardTitle>
                            <Badge variant="outline">
                              {currentTender.documentChecklist.filter((d) => d.collected).length} /{' '}
                              {currentTender.documentChecklist.length} Collected
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]">Status</TableHead>
                                <TableHead>Document Name</TableHead>
                                <TableHead>Collection Date</TableHead>
                                <TableHead>File</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentTender.documentChecklist.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={5}
                                    className="text-center py-8 text-muted-foreground"
                                  >
                                    No documents in checklist
                                  </TableCell>
                                </TableRow>
                              ) : (
                                currentTender.documentChecklist.map((doc) => (
                                  <TableRow key={doc.id}>
                                    <TableCell>
                                      <Checkbox
                                        checked={doc.collected}
                                        onCheckedChange={() => handleDocumentToggle(doc.id)}
                                        aria-label={`Mark ${doc.name} as collected`}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">{doc.name}</TableCell>
                                    <TableCell>
                                      {doc.collectedDate ? (
                                        formatDate(doc.collectedDate)
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {doc.fileUrl ? (
                                        <Badge variant="outline" className="gap-1">
                                          <FileText className="h-3 w-3" />
                                          Uploaded
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">
                                          No file
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleFileUpload}
                                                aria-label="Upload file"
                                              >
                                                <Upload className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Upload File</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        {doc.fileUrl && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    toast.info('Download feature coming soon')
                                                  }
                                                  aria-label="Download file"
                                                >
                                                  <Download className="h-4 w-4" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Download File</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>

                          {/* Add New Document */}
                          <div className="mt-6 pt-6 border-t">
                            <h3 className="text-sm font-semibold mb-3">Add New Document Type</h3>
                            <div className="flex gap-3">
                              <Input
                                value={newDocumentName}
                                onChange={(e) => setNewDocumentName(e.target.value)}
                                placeholder="Document name..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddDocument();
                                  }
                                }}
                              />
                              <Button onClick={handleAddDocument} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
                <CardContent className="p-12">
                  <div className="text-center">
                    <Avatar className="h-24 w-24 bg-primary/10 mx-auto mb-6">
                      <AvatarFallback className="bg-primary/10">
                        <FileText className="h-12 w-12 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-semibold mb-3">Select a Tender</h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                      Choose a tender from the list above to view detailed information, manage
                      documents, and track progress.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Tender Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTender ? 'Edit Tender' : 'Add New Tender'}</DialogTitle>
          </DialogHeader>
          <TenderForm
            mode={editingTender ? 'edit' : 'new'}
            tender={editingTender || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Mark as Won Dialog */}
      <Dialog open={isWonDialogOpen} onOpenChange={setIsWonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Tender as Won</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this tender as won? You can then convert it to a site.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsWon} className="gap-2">
              <Trophy className="h-4 w-4" />
              Mark as Won
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Lost Dialog */}
      <Dialog open={isLostDialogOpen} onOpenChange={setIsLostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Tender as Lost</DialogTitle>
            <DialogDescription>
              Please provide a reason for losing this tender. This will be added to the notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lost-reason">Reason</Label>
              <Textarea
                id="lost-reason"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="e.g., Higher bid from competitor, technical disqualification..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLostDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsLost} variant="destructive" className="gap-2">
              <XCircle className="h-4 w-4" />
              Mark as Lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Site Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Tender to Site</DialogTitle>
            <DialogDescription>
              This will create a new site with the tender information. The tender data will be
              pre-filled in the site form.
            </DialogDescription>
          </DialogHeader>
          {currentTender && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">
                  The following information will be transferred:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Site Name: {currentTender.name}</li>
                  <li>Location: {currentTender.location}</li>
                  <li>Budget: {formatCurrency(currentTender.tenderAmount)}</li>
                  <li>Client: {currentTender.client}</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvertToSite} className="gap-2">
              <Building2 className="h-4 w-4" />
              Create Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
