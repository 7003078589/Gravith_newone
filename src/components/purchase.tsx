'use client';

import {
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useDialogState } from '../lib/hooks/useDialogState';
import { useTableState } from '../lib/hooks/useTableState';
import { getApiUrl, API_ENDPOINTS } from '@/lib/api-config';

import { DataTable } from './common/DataTable';
import { FormDialog } from './common/FormDialog';
import { PurchaseTabs } from './layout/PurchaseTabs';
import { PurchaseForm } from './shared/PurchaseForm';
import type { SharedMaterial } from './shared/materialsContext';
import { useMaterials } from './shared/materialsContext';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PurchasePageProps {
  filterBySite?: string;
}

export function PurchasePage({ filterBySite }: PurchasePageProps = {}) {
  const { addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const [materials, setMaterials] = useState<SharedMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized data transformation function
  const transformPurchaseData = useCallback((purchase: Record<string, unknown>): SharedMaterial => {
    console.log('🔄 Transforming purchase data:', purchase);
    
    // Handle both database structure (nested) and JSON structure (flat)
    const materialName = 
      (purchase['materials'] as Record<string, unknown>)?.['name'] ||
      (purchase['material_name'] as string) ||
      'Unknown Material';
      
    const vendorName = 
      (purchase['vendors'] as Record<string, unknown>)?.['name'] || 
      (purchase['vendor_name'] as string) ||
      'Unknown Vendor';
      
    const siteName = 
      (purchase['sites'] as Record<string, unknown>)?.['name'] || 
      (purchase['site_name'] as string) ||
      'Gudibande';
      
    const quantity = (purchase['quantity'] as number) || 0;
    const unit = (purchase['unit'] as string) || (purchase['unit_of_measure'] as string) || 'Ton';
    const unitRate = (purchase['rate'] as number) || (purchase['unit_rate'] as number) || 0;
    const totalAmount = (purchase['total_amount'] as number) || (purchase['value'] as number) || 0;
    const purchaseDate = (purchase['purchase_date'] as string) || new Date().toISOString().split('T')[0];
    const invoiceNumber = (purchase['purchase_id'] as string) || (purchase['vendor_invoice_number'] as string) || '';
    
    const transformed = {
      id: purchase['id'] as string || `temp-${Math.random().toString(36).substr(2, 9)}`,
      materialName,
      vendor: vendorName,
      site: siteName,
      quantity,
      unit,
      unitRate,
      totalAmount,
      purchaseDate: purchaseDate.split('T')[0], // Ensure date format
      invoiceNumber,
      category: 'Construction Material',
      status: 'completed',
      createdAt: purchase['created_at'] as string || new Date().toISOString(),
      updatedAt: purchase['updated_at'] as string || new Date().toISOString(),
    };
    
    console.log('✅ Transformed purchase:', transformed);
    return transformed;
  }, []);

  // Fetch real purchase data from database API with retry logic
  useEffect(() => {
    let isMounted = true;
    
    const fetchPurchases = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        setError(null);
        
        const apiUrl = getApiUrl(API_ENDPOINTS.PURCHASES);
        console.log('📦 Fetching from API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('📦 Raw API response:', result);
          
          if (result.success && result.data) {
            console.log(`📦 Purchase data loaded from ${result.source || 'unknown'} source`);
            console.log(`📦 Raw data count: ${result.data.length}`);
            console.log(`📦 First item sample:`, result.data[0]);
            
            // Transform database data to match component interface
            const transformedMaterials: SharedMaterial[] = result.data.map(transformPurchaseData);
            console.log(`📦 Transformed data count: ${transformedMaterials.length}`);
            console.log(`📦 First transformed item:`, transformedMaterials[0]);
            
            if (isMounted) {
              setMaterials(transformedMaterials);
              console.log('📦 Materials state updated successfully');
            }
          } else {
            console.error('❌ API response not successful:', result);
            throw new Error(result.message || 'Failed to fetch purchase data');
          }
        } else {
          console.error('❌ HTTP error:', response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to fetch purchases:', error);
        
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to fetch purchase data');
          
          // Retry logic for network errors
          if (retryCount < 2 && error instanceof Error && error.message.includes('fetch')) {
            console.log(`Retrying fetch (attempt ${retryCount + 1}/2)...`);
            setTimeout(() => fetchPurchases(retryCount + 1), 1000 * (retryCount + 1));
            return;
          }
          
          // Fallback to empty array if all retries fail
          setMaterials([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPurchases();

    return () => {
      isMounted = false;
    };
  }, [transformPurchaseData]);

  // Use shared state hooks
  const tableState = useTableState({
    initialSortField: 'materialName',
    initialSortDirection: 'asc',
    initialItemsPerPage: 10,
  });

  const dialog = useDialogState<SharedMaterial>();

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Memoized filtered materials for stats
  const filteredMaterialsForStats = useMemo(() => {
    return filterBySite ? materials.filter((m) => m.site === filterBySite) : materials;
  }, [materials, filterBySite]);

  // Memoized summary statistics
  const summaryStats = useMemo(() => {
    const totalPurchases = filteredMaterialsForStats.length;
    const totalValue = filteredMaterialsForStats.reduce(
      (sum, material) => sum + (material.totalAmount || 0),
      0,
    );
    const averageOrderValue = totalPurchases > 0 ? totalValue / totalPurchases : 0;
    const totalQuantity = filteredMaterialsForStats.reduce(
      (sum, material) => sum + (material.quantity || 0),
      0,
    );
    
    return { totalPurchases, totalValue, averageOrderValue, totalQuantity };
  }, [filteredMaterialsForStats]);

  // Memoized filtered and sorted materials
  const sortedAndFilteredMaterials = useMemo(() => {
    return materials
      .filter((material) => {
        const matchesSite = !filterBySite || material.site === filterBySite;
        const matchesSearch =
          material.materialName?.toLowerCase().includes(tableState.searchTerm.toLowerCase()) ||
          material.vendor?.toLowerCase().includes(tableState.searchTerm.toLowerCase()) ||
          material.site?.toLowerCase().includes(tableState.searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'recent' &&
            new Date(material.purchaseDate || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) ||
          (statusFilter === 'pending' && !material.totalAmount);
        return matchesSite && matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = a[tableState.sortField as keyof SharedMaterial];
        const bValue = b[tableState.sortField as keyof SharedMaterial];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return tableState.sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return tableState.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
  }, [materials, filterBySite, tableState.searchTerm, tableState.sortField, tableState.sortDirection, categoryFilter, statusFilter]);

  // Destructure summary stats for easier access
  const { totalPurchases, totalValue, averageOrderValue, totalQuantity } = summaryStats;

  // Debug log for materials state
  useEffect(() => {
    console.log('📦 Materials state updated:', {
      count: materials.length,
      isLoading,
      error,
      firstItem: materials[0]
    });
  }, [materials, isLoading, error]);

  const handleFormSubmit = (materialData: Omit<SharedMaterial, 'id'>) => {
    if (dialog.editingItem) {
      updateMaterial(dialog.editingItem.id, materialData);
    } else {
      addMaterial(materialData);
    }
    dialog.closeDialog();
  };

  const handleFormCancel = () => {
    dialog.closeDialog();
  };

  const handleEdit = (material: SharedMaterial) => {
    dialog.openDialog(material);
  };

  const handleDelete = (materialId: string) => {
    deleteMaterial(materialId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full bg-background">
        <PurchaseTabs />
        <div className="p-4 md:p-6 space-y-6 max-w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading purchase data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full bg-background">
        <PurchaseTabs />
        <div className="p-4 md:p-6 space-y-6 max-w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-destructive">Failed to load purchase data</h3>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      <PurchaseTabs />
      <div className="p-4 md:p-6 space-y-6 max-w-full">
        {/* Purchase Statistics */}
        <Card className="w-full overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                      <p className="text-2xl font-bold text-primary">{totalPurchases}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{totalValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{Math.round(averageOrderValue).toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {totalQuantity.toFixed(1)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="w-full overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0 w-full">
                  <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[400px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search purchases..."
                      value={tableState.searchTerm}
                      onChange={(e) => tableState.setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Cement">Cement</SelectItem>
                      <SelectItem value="Steel">Steel</SelectItem>
                      <SelectItem value="Concrete">Concrete</SelectItem>
                      <SelectItem value="Bricks">Bricks</SelectItem>
                      <SelectItem value="Sand">Sand</SelectItem>
                      <SelectItem value="Aggregate">Aggregate</SelectItem>
                      <SelectItem value="Timber">Timber</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="Paint">Paint</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 transition-all hover:shadow-md"
                        >
                          <Filter className="h-4 w-4" />
                          <span className="hidden sm:inline">Filter</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Filter purchases by category and status</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <FormDialog
                    title="Add Material Purchase"
                    description="Record a new material purchase"
                    isOpen={dialog.isDialogOpen}
                    onOpenChange={(open) => {
                      if (open) {
                        dialog.openDialog();
                      } else {
                        dialog.closeDialog();
                      }
                    }}
                    maxWidth="max-w-4xl"
                    trigger={
                      <Button
                        onClick={() => dialog.openDialog()}
                        className="gap-2 transition-all hover:shadow-md whitespace-nowrap"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Purchase</span>
                      </Button>
                    }
                  >
                    <PurchaseForm
                      selectedSite={filterBySite}
                      editingMaterial={dialog.editingItem}
                      onSubmit={handleFormSubmit}
                      onCancel={handleFormCancel}
                    />
                  </FormDialog>
                </div>
              </div>

              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium w-fit">
                {sortedAndFilteredMaterials.length} purchase
                {sortedAndFilteredMaterials.length !== 1 ? 's' : ''} found
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Management Table */}
        {sortedAndFilteredMaterials.length === 0 ? (
          <Card className="w-full">
            <CardContent className="p-6 md:p-12">
              <div className="flex flex-col items-center justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Purchases Found</h3>
                <p className="text-muted-foreground text-center mb-6">
                  {materials.length === 0
                    ? 'Start by recording your first material purchase to track inventory and costs.'
                    : 'No purchases match your current search and filter criteria.'}
                </p>
                <Button
                  onClick={() => dialog.openDialog()}
                  className="gap-2 transition-all hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Add Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full overflow-hidden">
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: 'materialName', label: 'Material Name', sortable: true },
                  { key: 'vendor', label: 'Vendor', sortable: true },
                  { key: 'quantity', label: 'Quantity', sortable: true },
                  { key: 'unitRate', label: 'Rate (₹)', sortable: true },
                  { key: 'totalAmount', label: 'Total Amount', sortable: true },
                  { key: 'purchaseDate', label: 'Purchase Date', sortable: true },
                  { key: 'actions', label: 'Actions', sortable: false },
                ]}
                data={sortedAndFilteredMaterials.map((material) => ({
                  materialName: (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Package className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{material.materialName}</div>
                        <div className="text-sm text-muted-foreground">{material.site}</div>
                      </div>
                    </div>
                  ),
                  vendor: (
                    <div>
                      <div className="font-medium">{material.vendor}</div>
                      <div className="text-sm text-muted-foreground">{material.purchaseDate}</div>
                    </div>
                  ),
                  quantity: (
                    <div>
                      <div className="font-medium">
                        {material.quantity?.toFixed(2)} {material.unit}
                      </div>
                      {material.filledWeight && (
                        <div className="text-sm text-muted-foreground">
                          Net: {material.netWeight?.toFixed(2)}kg
                        </div>
                      )}
                    </div>
                  ),
                  unitRate: (
                    <span className="font-medium">₹{material.unitRate?.toLocaleString()}</span>
                  ),
                  totalAmount: (
                    <span className="font-medium text-green-600">
                      ₹{material.totalAmount?.toLocaleString()}
                    </span>
                  ),
                  purchaseDate: (
                    <span className="text-sm text-muted-foreground">{material.purchaseDate}</span>
                  ),
                  actions: (
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(material);
                              }}
                              className="h-8 w-8 p-0 transition-all hover:bg-primary/10"
                            >
                              <Edit className="h-3 w-3 text-muted-foreground hover:text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit purchase</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(material.id);
                              }}
                              className="h-8 w-8 p-0 transition-all hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete purchase</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ),
                }))}
                onSort={tableState.setSortField}
                onPageChange={tableState.setCurrentPage}
                pageSize={tableState.itemsPerPage}
                currentPage={tableState.currentPage}
                totalPages={tableState.totalPages(sortedAndFilteredMaterials.length)}
                sortField={tableState.sortField}
                sortDirection={tableState.sortDirection}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
