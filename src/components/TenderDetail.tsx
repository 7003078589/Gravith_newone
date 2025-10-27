'use client';

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Edit,
  FileText,
  MapPin,
  Phone,
  Mail,
  User,
  IndianRupee,
  AlertCircle,
  Trophy,
  XCircle,
  Upload,
  Download,
  Plus,
  Building2,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { formatDate } from '../lib/utils';

import { TabNavigation, type TabItem } from './layout/TabNavigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Tender, TenderDocument } from '@/types';

interface TenderDetailProps {
  tender: Tender;
  onBack: () => void;
  onEdit: () => void;
  onUpdateTender: (updatedTender: Tender) => void;
  onConvertToSite?: (tender: Tender) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
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

export function TenderDetail({
  tender: initialTender,
  onBack,
  onEdit,
  onUpdateTender,
  onConvertToSite,
}: TenderDetailProps) {
  const [tender, setTender] = useState<Tender>(initialTender);
  const [isWonDialogOpen, setIsWonDialogOpen] = useState(false);
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [emdReturnDate, setEmdReturnDate] = useState<Date | undefined>();
  const [emdReturnReference, setEmdReturnReference] = useState('');
  const [newDocumentName, setNewDocumentName] = useState('');

  // Update parent when tender changes
  const updateTender = (updatedTender: Tender) => {
    setTender(updatedTender);
    onUpdateTender(updatedTender);
  };

  const handleMarkAsWon = () => {
    const updatedTender = {
      ...tender,
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
    const updatedTender = {
      ...tender,
      status: 'lost' as const,
      notes: `${tender.notes}\n\nLost Reason: ${lostReason}`,
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
    if (tender.emdReturned) {
      // Unreturning EMD
      const updatedTender = {
        ...tender,
        emdReturned: false,
        emdReturnDate: null,
        emdReturnReference: null,
        updatedAt: new Date().toISOString(),
      };
      updateTender(updatedTender);
      toast.success('EMD return status updated');
    } else {
      // Mark as returned - open dialog for date and reference
      if (emdReturnDate) {
        const updatedTender = {
          ...tender,
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
    const updatedDocs = tender.documentChecklist.map((doc) =>
      doc.id === docId
        ? {
            ...doc,
            collected: !doc.collected,
            collectedDate: !doc.collected ? new Date().toISOString() : null,
          }
        : doc,
    );
    const updatedTender = {
      ...tender,
      documentChecklist: updatedDocs,
      updatedAt: new Date().toISOString(),
    };
    updateTender(updatedTender);
  };

  const handleAddDocument = () => {
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
      ...tender,
      documentChecklist: [...tender.documentChecklist, newDoc],
      updatedAt: new Date().toISOString(),
    };
    updateTender(updatedTender);
    setNewDocumentName('');
    toast.success('Document added to checklist');
  };

  const handleFileUpload = () => {
    // Placeholder for file upload
    toast.info('File upload feature coming soon');
  };

  const handleConvertToSite = () => {
    if (onConvertToSite) {
      onConvertToSite(tender);
      setIsConvertDialogOpen(false);
    }
  };

  // Overview Tab
  const overviewTab = (
    <div className="space-y-6">
      {/* Status and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tender Status</CardTitle>
            <Badge variant={getStatusColor(tender.status)} className="text-base">
              {tender.status.charAt(0).toUpperCase() + tender.status.slice(1).replace('-', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(tender.status === 'submitted' || tender.status === 'under-evaluation') && (
            <div className="flex gap-3">
              <Button onClick={() => setIsWonDialogOpen(true)} className="gap-2">
                <Trophy className="h-4 w-4" />
                Mark as Won
              </Button>
              <Button onClick={() => setIsLostDialogOpen(true)} variant="outline" className="gap-2">
                <XCircle className="h-4 w-4" />
                Mark as Lost
              </Button>
            </div>
          )}
          {tender.status === 'won' && (
            <div className="space-y-3">
              {tender.convertedToSiteId ? (
                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Converted to Site
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Site ID: {tender.convertedToSiteId} | Converted on{' '}
                      {tender.conversionDate ? formatDate(tender.conversionDate) : 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setIsConvertDialogOpen(true)} className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Convert to Site
                </Button>
              )}
            </div>
          )}
          {tender.status === 'lost' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-medium text-red-900 dark:text-red-100">Tender Lost</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Check EMD return status below
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
            <p className="font-mono font-medium">{tender.tenderNumber}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Project Type</Label>
            <p className="font-medium">{tender.projectType}</p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-muted-foreground">Tender Name</Label>
            <p className="font-medium">{tender.name}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Client</Label>
            <p className="font-medium">{tender.client}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <p>{tender.location}</p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Details */}
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
            <p className="text-2xl font-bold">{formatCurrency(tender.tenderAmount)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              EMD Amount
            </Label>
            <p className="text-2xl font-bold">{formatCurrency(tender.emdAmount)}</p>
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
              <Label className="text-muted-foreground text-xs">Contact Person</Label>
              <p className="font-medium">{tender.contactPerson}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <p className="font-medium">{tender.contactEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-muted-foreground text-xs">Phone</Label>
              <p className="font-medium">{tender.contactPhone}</p>
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
            <p className="font-medium">{formatDate(tender.submissionDate)}</p>
          </div>
          {tender.openingDate && (
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Opening Date
              </Label>
              <p className="font-medium">{formatDate(tender.openingDate)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description and Details */}
      {(tender.description || tender.evaluationCriteria || tender.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tender.description && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm whitespace-pre-wrap">{tender.description}</p>
              </div>
            )}
            {tender.evaluationCriteria && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Evaluation Criteria</Label>
                <p className="text-sm whitespace-pre-wrap">{tender.evaluationCriteria}</p>
              </div>
            )}
            {tender.notes && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Notes</Label>
                <p className="text-sm whitespace-pre-wrap">{tender.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // EMD Tracking Tab
  const emdTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>EMD Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {tender.emdPaid ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                )}
                <div>
                  <p className="font-medium">Payment Status</p>
                  <p className="text-sm text-muted-foreground">
                    {tender.emdPaid ? 'Paid' : 'Not Paid'}
                  </p>
                </div>
              </div>
              <Badge variant={tender.emdPaid ? 'default' : 'secondary'}>
                {tender.emdPaid ? 'Completed' : 'Pending'}
              </Badge>
            </div>

            {tender.emdPaid && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Payment Date</Label>
                  <p className="font-medium">
                    {tender.emdPaidDate ? formatDate(tender.emdPaidDate) : 'N/A'}
                  </p>
                </div>
                {tender.emdPaidReference && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Payment Reference</Label>
                    <p className="font-medium font-mono">{tender.emdPaidReference}</p>
                  </div>
                )}
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-muted-foreground">Amount Paid</Label>
                  <p className="text-2xl font-bold">{formatCurrency(tender.emdAmount)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Return Status */}
          {tender.emdPaid && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">EMD Return Status</h3>
                <Badge variant={tender.emdReturned ? 'default' : 'outline'}>
                  {tender.emdReturned ? 'Returned' : 'Pending'}
                </Badge>
              </div>

              {!tender.emdReturned ? (
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
                        {tender.emdReturnDate ? formatDate(tender.emdReturnDate) : 'N/A'}
                      </p>
                    </div>
                    {tender.emdReturnReference && (
                      <div>
                        <Label className="text-muted-foreground">Return Reference</Label>
                        <p className="font-medium font-mono">{tender.emdReturnReference}</p>
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
  );

  // Documents Tab
  const documentsTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Document Checklist</CardTitle>
            <Badge variant="outline">
              {tender.documentChecklist.filter((d) => d.collected).length} /{' '}
              {tender.documentChecklist.length} Collected
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
              {tender.documentChecklist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No documents in checklist
                  </TableCell>
                </TableRow>
              ) : (
                tender.documentChecklist.map((doc) => (
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
                        <span className="text-muted-foreground text-sm">No file</span>
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
                                  onClick={() => toast.info('Download feature coming soon')}
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
    </div>
  );

  const tabs: TabItem[] = [
    {
      value: 'overview',
      label: 'Overview',
      icon: FileText,
      content: overviewTab,
    },
    {
      value: 'emd',
      label: 'EMD Tracking',
      icon: IndianRupee,
      content: emdTab,
    },
    {
      value: 'documents',
      label: 'Documents',
      icon: FileText,
      content: documentsTab,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tender.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{tender.tenderNumber}</p>
          </div>
        </div>
        {tender.status === 'draft' && (
          <Button onClick={onEdit} variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Tender
          </Button>
        )}
      </div>

      {/* Tabs */}
      <TabNavigation tabs={tabs} defaultValue="overview" />

      {/* Dialogs */}
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

      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Tender to Site</DialogTitle>
            <DialogDescription>
              This will create a new site with the tender information. The tender data will be
              pre-filled in the site form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">The following information will be transferred:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Site Name: {tender.name}</li>
                <li>Location: {tender.location}</li>
                <li>Budget: {formatCurrency(tender.tenderAmount)}</li>
                <li>Client: {tender.client}</li>
              </ul>
            </div>
          </div>
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
