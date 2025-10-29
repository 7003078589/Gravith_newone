'use client';

import {
  Plus,
  Package,
  Building2,
  Edit,
  Trash2,
  Search,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Activity,
  Target,
  Wrench,
  FileText,
  Filter,
  AlertCircle,
  X,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState, useRef } from 'react';

import { DataTable } from '@/components/common/DataTable';
import { FormDialog } from '@/components/common/FormDialog';
import { useMaterials } from '@/components/shared/materialsContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDialogState } from '@/lib/hooks/useDialogState';
import { useTableState } from '@/lib/hooks/useTableState';
import { formatDateShort } from '@/lib/utils';
import { getApiUrl, API_ENDPOINTS } from '@/lib/api-config';

interface WorkProgressEntry {
  id: string;
  siteId: string;
  siteName: string;
  workType: string;
  description: string;
  date: string;
  unit: string;
  length?: number;
  breadth?: number;
  thickness?: number;
  totalQuantity: number;
  materialsUsed: {
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
    balanceStock: number;
  }[];
  laborHours: number;
  progressPercentage: number;
  notes: string;
  photos: string[];
  status: 'In Progress' | 'Completed' | 'On Hold';
}

interface WorkProgressProps {
  selectedSite?: string;
  onSiteSelect?: (siteId: string) => void;
  filterBySite?: string;
}

export function WorkProgressPage({ filterBySite }: WorkProgressProps) {
  const { materials, updateMaterial } = useMaterials();

  // Use shared state hooks
  const tableState = useTableState({
    initialSortField: 'date',
    initialSortDirection: 'desc',
    initialItemsPerPage: 10,
  });

  const dialog = useDialogState<WorkProgressEntry>();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('all');

  // Mock sites data
  const mockSites = [
    { id: '1', name: 'Rajiv Nagar Residential Complex' },
    { id: '2', name: 'Green Valley Commercial Center' },
    { id: '3', name: 'Sunshine Apartments Phase II' },
  ];

  // State for work progress entries
  const [workProgressEntries, setWorkProgressEntries] = useState<WorkProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform work progress data from API to component interface
  const transformWorkProgressData = useCallback((workProgress: Record<string, unknown>): WorkProgressEntry => {
    console.log('🔄 Transforming work progress data:', workProgress);
    
    return {
      id: workProgress['id'] as string || `temp-${Math.random().toString(36).substr(2, 9)}`,
      siteId: workProgress['site_id'] as string || '',
      siteName: workProgress['site_name'] as string || 'Unknown Site',
      workType: workProgress['work_type'] as string || 'General Work',
      description: workProgress['description'] as string || '',
      date: (workProgress['work_date'] as string) || (workProgress['date'] as string) || new Date().toISOString().split('T')[0],
      unit: workProgress['unit'] as string || 'unit',
      length: workProgress['length'] as number || undefined,
      breadth: workProgress['breadth'] as number || undefined,
      thickness: workProgress['thickness'] as number || undefined,
      totalQuantity: workProgress['total_quantity'] as number || 0,
      materialsUsed: [], // Will be populated from materials_used if available
      laborHours: workProgress['labor_hours'] as number || 0,
      progressPercentage: workProgress['progress_percentage'] as number || 0,
      notes: workProgress['notes'] as string || '',
      photos: (workProgress['photos'] as string[]) || [],
      status: (workProgress['status'] as 'In Progress' | 'Completed' | 'On Hold') || 'In Progress',
    };
  }, []);

  // Fetch work progress data from API
  useEffect(() => {
    let isMounted = true;
    
    const fetchWorkProgress = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        setError(null);
        
        const apiUrl = getApiUrl(API_ENDPOINTS.WORK_PROGRESS);
        console.log('🏗️ Fetching work progress from API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('🏗️ Raw work progress API response:', result);
          
          if (result.success && result.data) {
            console.log(`🏗️ Work progress data loaded from database`);
            console.log(`🏗️ Raw data count: ${result.data.length}`);
            console.log(`🏗️ First item sample:`, result.data[0]);
            
            // Transform database data to match component interface
            const transformedEntries: WorkProgressEntry[] = result.data.map(transformWorkProgressData);
            console.log(`🏗️ Transformed data count: ${transformedEntries.length}`);
            console.log(`🏗️ First transformed item:`, transformedEntries[0]);
            
            if (isMounted) {
              setWorkProgressEntries(transformedEntries);
              console.log('🏗️ Work progress entries state updated successfully');
            }
          } else {
            console.error('❌ Work progress API response not successful:', result);
            throw new Error(result.message || 'Failed to fetch work progress data');
          }
        } else {
          console.error('❌ Work progress HTTP error:', response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to fetch work progress:', error);
        
        if (retryCount < 2) {
          console.log(`🔄 Retrying work progress fetch (attempt ${retryCount + 2}/3)...`);
          setTimeout(() => fetchWorkProgress(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          console.log('🔄 Using mock work progress data as fallback');
          if (isMounted) {
            setWorkProgressEntries(mockWorkProgressEntries);
            setError('Using offline data - API unavailable');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWorkProgress();

    return () => {
      isMounted = false;
    };
  }, [transformWorkProgressData]);

  // Mock data for work progress entries (fallback)
  const mockWorkProgressEntries: WorkProgressEntry[] = [
    {
      id: '1',
      siteId: '1',
      siteName: 'Rajiv Nagar Residential Complex',
      workType: 'Foundation',
      description: 'Concrete foundation work for Building A',
      date: '2024-01-15',
      unit: 'cum',
      length: 10,
      breadth: 8,
      thickness: 0.5,
      totalQuantity: 40,
      materialsUsed: [
        {
          materialId: '1',
          materialName: 'Ordinary Portland Cement (OPC 53)',
          quantity: 50,
          unit: 'bags',
          balanceStock: 35,
        },
        {
          materialId: '2',
          materialName: 'TMT Steel Bars (12mm)',
          quantity: 2,
          unit: 'tons',
          balanceStock: 18,
        },
      ],
      laborHours: 40,
      progressPercentage: 75,
      notes: 'Foundation work progressing well',
      photos: [],
      status: 'In Progress',
    },
    {
      id: '2',
      siteId: '1',
      siteName: 'Rajiv Nagar Residential Complex',
      workType: 'Plumbing',
      description: 'Water supply installation',
      date: '2024-01-20',
      unit: 'meters',
      totalQuantity: 100,
      materialsUsed: [
        {
          materialId: '3',
          materialName: 'PVC Pipes',
          quantity: 100,
          unit: 'meters',
          balanceStock: 50,
        },
      ],
      laborHours: 24,
      progressPercentage: 100,
      notes: 'Plumbing work completed',
      photos: [],
      status: 'Completed',
    },
  ];

  const [workProgressForm, setWorkProgressForm] = useState({
    siteId: '',
    siteName: '',
    workType: '',
    description: '',
    date: '',
    unit: '',
    length: 0,
    breadth: 0,
    thickness: 0,
    totalQuantity: 0,
    materialsUsed: [] as {
      materialId: string;
      materialName: string;
      quantity: number;
      unit: string;
      balanceStock: number;
    }[],
    laborHours: 0,
    progressPercentage: 0,
    notes: '',
    photos: [] as string[],
    status: 'In Progress' as WorkProgressEntry['status'],
  });

  // Material selection state
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState(0);

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form ref for submission
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch work progress data from API
  React.useEffect(() => {
    const fetchWorkProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('🏗️ Fetching work progress from:', getApiUrl(API_ENDPOINTS.WORK_PROGRESS));
        const response = await fetch(getApiUrl(API_ENDPOINTS.WORK_PROGRESS), {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        console.log('🏗️ Work progress response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('🏗️ Work progress API result:', result);
          
          if (result.success) {
            // Transform database data to match component interface
            const transformedEntries: WorkProgressEntry[] = result.data.map(
              (entry: Record<string, unknown>) => ({
                id: entry['id'] as string,
                siteId: entry['site_id'] as string,
                siteName: 'Gudibande', // From existing site data
                workType: 'Construction', // Default work type
                description: entry['description'] as string,
                date: entry['work_date'] as string,
                unit: (entry['unit'] as string) || 'cum',
                length: (entry['length'] as number) || 0,
                breadth: (entry['width'] as number) || 0,
                thickness: (entry['thickness'] as number) || 0,
                totalQuantity: (entry['quantity'] as number) || 0,
                materialsUsed: [], // Will be populated based on steel/cement data
                laborHours: 0, // Not available in CSV
                progressPercentage: 100, // All entries are completed
                notes: (entry['remarks'] as string) || '',
                photos: [],
                status: 'Completed' as WorkProgressEntry['status'],
              }),
            );
            setWorkProgressEntries(transformedEntries);
          } else {
            console.error('❌ API returned error:', result.message);
            setError(result.message || 'Failed to fetch work progress data');
            // Fallback to mock data
            setWorkProgressEntries(mockWorkProgressEntries);
          }
        } else {
          console.error('❌ Failed to fetch work progress:', response.status);
          setError(`HTTP ${response.status}: ${response.statusText}`);
          // Fallback to mock data
          setWorkProgressEntries(mockWorkProgressEntries);
        }
      } catch (error) {
        console.error('❌ Error fetching work progress:', error);
        setError('Network error - using offline data');
        // Fallback to mock data
        setWorkProgressEntries(mockWorkProgressEntries);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkProgress();
  }, []);

  // Filter work progress entries
  const filteredEntries = workProgressEntries.filter((entry) => {
    const matchesSite = !filterBySite || entry.siteName === filterBySite;
    const matchesSearch =
      tableState.searchTerm === '' ||
      entry.description.toLowerCase().includes(tableState.searchTerm.toLowerCase()) ||
      entry.workType.toLowerCase().includes(tableState.searchTerm.toLowerCase()) ||
      entry.siteName.toLowerCase().includes(tableState.searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesWorkType = workTypeFilter === 'all' || entry.workType === workTypeFilter;
    return matchesSite && matchesSearch && matchesStatus && matchesWorkType;
  });

  // Calculate statistics (filtered by site if applicable)
  const entriesForStats = filterBySite
    ? workProgressEntries.filter((e) => e.siteName === filterBySite)
    : workProgressEntries;
  const totalEntries = entriesForStats.length;
  const completedEntries = entriesForStats.filter((entry) => entry.status === 'Completed').length;
  const inProgressEntries = entriesForStats.filter(
    (entry) => entry.status === 'In Progress',
  ).length;
  const totalLaborHours = entriesForStats.reduce((sum, entry) => sum + entry.laborHours, 0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 Form submission started:', workProgressForm);

    // Clear previous errors
    setFormErrors({});

    // Validation
    const errors: Record<string, string> = {};

    if (!workProgressForm.workType) {
      errors['workType'] = 'Please select a work type';
    }
    if (!workProgressForm.siteId) {
      errors['siteId'] = 'Please select a site';
    }
    if (!workProgressForm.description.trim()) {
      errors['description'] = 'Please enter a description';
    }
    if (!workProgressForm.date) {
      errors['date'] = 'Please select a date';
    }
    if (!workProgressForm.unit) {
      errors['unit'] = 'Please select a unit';
    }
    if (!workProgressForm.totalQuantity || workProgressForm.totalQuantity <= 0) {
      errors['totalQuantity'] = 'Please enter a valid total quantity';
    }

    // If there are validation errors, show them and stop submission
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.log('❌ Form validation failed:', errors);
      return;
    }

    if (dialog.editingItem) {
      // Update existing entry
      const updatedEntries = workProgressEntries.map((entry) =>
        entry.id === dialog.editingItem!.id
          ? {
              ...entry,
              ...workProgressForm,
            }
          : entry,
      );
      setWorkProgressEntries(updatedEntries);
    } else {
      // Add new entry
      const newEntry: WorkProgressEntry = {
        id: (workProgressEntries.length + 1).toString(),
        ...workProgressForm,
      };
      setWorkProgressEntries([...workProgressEntries, newEntry]);
    }

    // Deduct materials from inventory
    workProgressForm.materialsUsed.forEach((material) => {
      const existingMaterial = materials.find((m) => m.id === material.materialId);
      if (existingMaterial) {
        const newConsumedQuantity = (existingMaterial.consumedQuantity || 0) + material.quantity;
        const newRemainingQuantity = (existingMaterial.quantity || 0) - newConsumedQuantity;

        updateMaterial(existingMaterial.id, {
          ...existingMaterial,
          consumedQuantity: newConsumedQuantity,
          remainingQuantity: Math.max(0, newRemainingQuantity),
        });
      }
    });

    dialog.closeDialog();
    setWorkProgressForm({
      siteId: '',
      siteName: '',
      workType: '',
      description: '',
      date: '',
      unit: '',
      length: 0,
      breadth: 0,
      thickness: 0,
      totalQuantity: 0,
      materialsUsed: [],
      laborHours: 0,
      progressPercentage: 0,
      notes: '',
      photos: [],
      status: 'In Progress',
    });
    setSelectedMaterial('');
    setMaterialQuantity(0);

    console.log('✅ Form submitted successfully');
    alert(
      dialog.editingItem ? 'Work entry updated successfully!' : 'Work entry added successfully!',
    );
  };

  const handleEdit = (entry: WorkProgressEntry) => {
    dialog.openDialog(entry);
    setWorkProgressForm({
      siteId: entry.siteId,
      siteName: entry.siteName,
      workType: entry.workType,
      description: entry.description,
      date: entry.date,
      unit: entry.unit,
      length: entry.length || 0,
      breadth: entry.breadth || 0,
      thickness: entry.thickness || 0,
      totalQuantity: entry.totalQuantity,
      materialsUsed: entry.materialsUsed,
      laborHours: entry.laborHours,
      progressPercentage: entry.progressPercentage,
      notes: entry.notes,
      photos: entry.photos,
      status: entry.status,
    });
  };

  // Handle adding material to the work entry
  const handleAddMaterial = () => {
    if (!selectedMaterial || materialQuantity <= 0) return;

    const material = materials.find((m) => m.id === selectedMaterial);
    if (!material) return;

    const balanceStock = material.remainingQuantity || 0;

    if (materialQuantity > balanceStock) {
      alert(`Insufficient stock! Available: ${balanceStock} ${material.unit}`);
      return;
    }

    const newMaterialEntry = {
      materialId: material.id,
      materialName: material.materialName,
      quantity: materialQuantity,
      unit: material.unit,
      balanceStock: balanceStock - materialQuantity,
    };

    setWorkProgressForm((prev) => ({
      ...prev,
      materialsUsed: [...prev.materialsUsed, newMaterialEntry],
    }));

    setSelectedMaterial('');
    setMaterialQuantity(0);
  };

  // Handle removing material from the work entry
  const handleRemoveMaterial = (index: number) => {
    setWorkProgressForm((prev) => ({
      ...prev,
      materialsUsed: prev.materialsUsed.filter((_, i) => i !== index),
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In production, upload to cloud storage and get URLs
    // For now, create local URLs
    const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));

    setWorkProgressForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };

  // Handle photo removal
  const handleRemovePhoto = (index: number) => {
    setWorkProgressForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Get available materials for selected site
  const getAvailableMaterials = () => {
    if (!workProgressForm.siteName) return [];
    return materials.filter(
      (m) => m.site === workProgressForm.siteName && (m.remainingQuantity || 0) > 0,
    );
  };

  const handleDelete = (entryId: string) => {
    setWorkProgressEntries(workProgressEntries.filter((entry) => entry.id !== entryId));
  };

  const getWorkTypeIcon = (workType: string) => {
    switch (workType) {
      case 'Foundation':
        return Building2;
      case 'Plumbing':
        return Wrench;
      case 'Electrical':
        return Activity;
      case 'Painting':
        return FileText;
      default:
        return Target;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full bg-background">
        <div className="p-4 md:p-6 space-y-6 max-w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading work progress data...</p>
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
        <div className="p-4 md:p-6 space-y-6 max-w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-destructive">Failed to load work progress data</h3>
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
      <div className="p-4 md:p-6 space-y-6 max-w-full">
        {/* Work Progress Statistics */}
        <Card className="w-full overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                      <p className="text-2xl font-bold text-primary">{totalEntries}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{completedEntries}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold text-blue-600">{inProgressEntries}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Labor Hours</p>
                      <p className="text-2xl font-bold text-orange-600">{totalLaborHours}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-orange-600" />
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
                      placeholder="Search work entries..."
                      value={tableState.searchTerm}
                      onChange={(e) => tableState.setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Work Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Painting">Painting</SelectItem>
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
                        <p>Filter work entries by status and criteria</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <FormDialog
                    title={dialog.editingItem ? 'Edit Work Entry' : 'Add New Work Entry'}
                    description={
                      dialog.editingItem
                        ? 'Update work progress details'
                        : 'Record new work progress and material usage'
                    }
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
                        onClick={() => {
                          dialog.openDialog();
                          setWorkProgressForm({
                            siteId: '',
                            siteName: '',
                            workType: '',
                            description: '',
                            date: '',
                            unit: '',
                            length: 0,
                            breadth: 0,
                            thickness: 0,
                            totalQuantity: 0,
                            materialsUsed: [],
                            laborHours: 0,
                            progressPercentage: 0,
                            notes: '',
                            photos: [],
                            status: 'In Progress',
                          });
                          setSelectedMaterial('');
                          setMaterialQuantity(0);
                          setFormErrors({}); // Clear any previous errors
                        }}
                        className="gap-2 transition-all hover:shadow-md whitespace-nowrap"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Entry</span>
                      </Button>
                    }
                  >
                    <div className="flex flex-col max-h-[80vh]">
                      <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
                        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
                          {/* Basic Information */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">
                              Basic Information
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Work Type</Label>
                                <Select
                                  value={workProgressForm.workType}
                                  onValueChange={(value) => {
                                    console.log('🔧 Work type changed:', value);
                                    setWorkProgressForm((prev) => ({ ...prev, workType: value }));
                                    // Clear error when user makes a selection
                                    if (formErrors['workType']) {
                                      setFormErrors((prev) => ({ ...prev, workType: '' }));
                                    }
                                  }}
                                >
                                  <SelectTrigger
                                    className={formErrors['workType'] ? 'border-red-500' : ''}
                                  >
                                    <SelectValue placeholder="Select work type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Foundation">Foundation</SelectItem>
                                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                                    <SelectItem value="Electrical">Electrical</SelectItem>
                                    <SelectItem value="Painting">Painting</SelectItem>
                                    <SelectItem value="Roofing">Roofing</SelectItem>
                                    <SelectItem value="Flooring">Flooring</SelectItem>
                                    <SelectItem value="Masonry">Masonry</SelectItem>
                                    <SelectItem value="Plastering">Plastering</SelectItem>
                                  </SelectContent>
                                </Select>
                                {formErrors['workType'] && (
                                  <p className="text-sm text-red-500">{formErrors['workType']}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Date</Label>
                                <DatePicker
                                  date={
                                    workProgressForm.date
                                      ? new Date(workProgressForm.date)
                                      : undefined
                                  }
                                  onSelect={(date) =>
                                    setWorkProgressForm((prev) => ({
                                      ...prev,
                                      date: date ? date.toISOString().split('T')[0] : '',
                                    }))
                                  }
                                  placeholder="Select work date"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Site</Label>
                              <Select
                                value={workProgressForm.siteId}
                                onValueChange={(value) => {
                                  console.log('🏗️ Site changed:', value);
                                  const site = mockSites.find((s) => s.id === value);
                                  setWorkProgressForm((prev) => ({
                                    ...prev,
                                    siteId: value,
                                    siteName: site?.name || '',
                                    materialsUsed: [], // Reset materials when site changes
                                  }));
                                  setSelectedMaterial('');
                                  setMaterialQuantity(0);
                                  // Clear error when user makes a selection
                                  if (formErrors['siteId']) {
                                    setFormErrors((prev) => ({ ...prev, siteId: '' }));
                                  }
                                }}
                              >
                                <SelectTrigger
                                  className={formErrors['siteId'] ? 'border-red-500' : ''}
                                >
                                  <SelectValue placeholder="Select site" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockSites.map((site) => (
                                    <SelectItem key={site.id} value={site.id}>
                                      {site.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {formErrors['siteId'] && (
                                <p className="text-sm text-red-500">{formErrors['siteId']}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                placeholder="Describe the work performed"
                                value={workProgressForm.description}
                                onChange={(e) => {
                                  setWorkProgressForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }));
                                  // Clear error when user types
                                  if (formErrors['description']) {
                                    setFormErrors((prev) => ({ ...prev, description: '' }));
                                  }
                                }}
                                className={formErrors['description'] ? 'border-red-500' : ''}
                                required
                                rows={3}
                              />
                              {formErrors['description'] && (
                                <p className="text-sm text-red-500">{formErrors['description']}</p>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Measurements */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">Measurements</h3>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Unit</Label>
                                <Select
                                  value={workProgressForm.unit}
                                  onValueChange={(value) => {
                                    setWorkProgressForm((prev) => ({ ...prev, unit: value }));
                                    // Clear error when user makes a selection
                                    if (formErrors['unit']) {
                                      setFormErrors((prev) => ({ ...prev, unit: '' }));
                                    }
                                  }}
                                >
                                  <SelectTrigger
                                    className={formErrors['unit'] ? 'border-red-500' : ''}
                                  >
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cum">Cubic Meter (cum)</SelectItem>
                                    <SelectItem value="sqm">Square Meter (sqm)</SelectItem>
                                    <SelectItem value="rmt">Running Meter (rmt)</SelectItem>
                                    <SelectItem value="nos">Numbers (nos)</SelectItem>
                                    <SelectItem value="sqft">Square Feet (sqft)</SelectItem>
                                    <SelectItem value="cft">Cubic Feet (cft)</SelectItem>
                                  </SelectContent>
                                </Select>
                                {formErrors['unit'] && (
                                  <p className="text-sm text-red-500">{formErrors['unit']}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Total Quantity</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={workProgressForm.totalQuantity || ''}
                                  onChange={(e) => {
                                    setWorkProgressForm((prev) => ({
                                      ...prev,
                                      totalQuantity: parseFloat(e.target.value) || 0,
                                    }));
                                    // Clear error when user types
                                    if (formErrors['totalQuantity']) {
                                      setFormErrors((prev) => ({ ...prev, totalQuantity: '' }));
                                    }
                                  }}
                                  className={formErrors['totalQuantity'] ? 'border-red-500' : ''}
                                  required
                                />
                                {formErrors['totalQuantity'] && (
                                  <p className="text-sm text-red-500">
                                    {formErrors['totalQuantity']}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Length (m)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={workProgressForm.length || ''}
                                  onChange={(e) =>
                                    setWorkProgressForm((prev) => ({
                                      ...prev,
                                      length: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Breadth (m)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={workProgressForm.breadth || ''}
                                  onChange={(e) =>
                                    setWorkProgressForm((prev) => ({
                                      ...prev,
                                      breadth: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Thickness (m)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={workProgressForm.thickness || ''}
                                  onChange={(e) =>
                                    setWorkProgressForm((prev) => ({
                                      ...prev,
                                      thickness: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Material Consumption */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">
                              Material Consumption
                            </h3>

                            {!workProgressForm.siteId ? (
                              <div className="p-4 bg-muted rounded-lg text-center">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Please select a site first to add materials
                                </p>
                              </div>
                            ) : getAvailableMaterials().length === 0 ? (
                              <div className="p-4 bg-muted rounded-lg text-center">
                                <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  No materials available for this site
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <div className="flex-1 space-y-2">
                                    <Label>Select Material</Label>
                                    <Select
                                      value={selectedMaterial}
                                      onValueChange={setSelectedMaterial}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Choose material" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getAvailableMaterials().map((material) => (
                                          <SelectItem key={material.id} value={material.id}>
                                            {material.materialName} (Balance:{' '}
                                            {material.remainingQuantity} {material.unit})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="w-32 space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0"
                                      value={materialQuantity || ''}
                                      onChange={(e) =>
                                        setMaterialQuantity(parseFloat(e.target.value) || 0)
                                      }
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <Button
                                      type="button"
                                      onClick={handleAddMaterial}
                                      size="sm"
                                      className="h-10"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {selectedMaterial && (
                                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                      <span className="font-medium">Balance Stock:</span>{' '}
                                      {materials.find((m) => m.id === selectedMaterial)
                                        ?.remainingQuantity || 0}{' '}
                                      {materials.find((m) => m.id === selectedMaterial)?.unit}
                                    </p>
                                  </div>
                                )}

                                {workProgressForm.materialsUsed.length > 0 && (
                                  <div className="space-y-2">
                                    <Label>Added Materials</Label>
                                    <div className="space-y-2">
                                      {workProgressForm.materialsUsed.map((material, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                        >
                                          <div className="flex-1">
                                            <p className="text-sm font-medium">
                                              {material.materialName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Quantity: {material.quantity} {material.unit} |
                                              Balance after: {material.balanceStock} {material.unit}
                                            </p>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMaterial(index)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <X className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Labor & Progress */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">
                              Labor & Progress
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Labor Hours</Label>
                                <Input
                                  type="number"
                                  step="0.5"
                                  placeholder="0"
                                  value={workProgressForm.laborHours || ''}
                                  onChange={(e) =>
                                    setWorkProgressForm((prev) => ({
                                      ...prev,
                                      laborHours: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Progress Percentage</Label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  min="0"
                                  max="100"
                                  value={workProgressForm.progressPercentage || ''}
                                  onChange={(e) =>
                                    setWorkProgressForm((prev) => ({
                                      ...prev,
                                      progressPercentage: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={workProgressForm.status}
                                onValueChange={(value) =>
                                  setWorkProgressForm((prev) => ({
                                    ...prev,
                                    status: value as WorkProgressEntry['status'],
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="On Hold">On Hold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Separator />

                          {/* Photo Attachments */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">
                              Photo Attachments
                            </h3>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor="photo-upload"
                                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                                >
                                  <Upload className="h-4 w-4" />
                                  <span>Upload Photos</span>
                                </Label>
                                <Input
                                  id="photo-upload"
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handlePhotoUpload}
                                  className="hidden"
                                />
                              </div>

                              {workProgressForm.photos.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                  {workProgressForm.photos.map((photo, index) => (
                                    <div key={index} className="relative group">
                                      <div className="relative w-full h-24 rounded-lg border overflow-hidden">
                                        <Image
                                          src={photo}
                                          alt={`Work progress ${index + 1}`}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemovePhoto(index)}
                                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {workProgressForm.photos.length === 0 && (
                                <div className="p-6 bg-muted rounded-lg text-center">
                                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    No photos attached. Upload images to document work progress.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Notes */}
                          <div className="space-y-2">
                            <Label>Additional Notes</Label>
                            <Textarea
                              placeholder="Additional notes or observations"
                              value={workProgressForm.notes}
                              onChange={(e) =>
                                setWorkProgressForm((prev) => ({ ...prev, notes: e.target.value }))
                              }
                              rows={3}
                            />
                          </div>
                        </form>
                      </ScrollArea>

                      <div className="flex justify-end gap-2 pt-4 border-t bg-background mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => dialog.closeDialog()}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (formRef.current) {
                              formRef.current.requestSubmit();
                            }
                          }}
                          className="min-w-[100px]"
                        >
                          {dialog.editingItem ? 'Update Entry' : 'Add Entry'}
                        </Button>
                      </div>
                    </div>
                  </FormDialog>
                </div>
              </div>

              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium w-fit">
                {filteredEntries.length} entr{filteredEntries.length !== 1 ? 'ies' : 'y'} found
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Work Progress Entries Table */}
        {filteredEntries.length === 0 ? (
          <Card className="w-full">
            <CardContent className="p-6 md:p-12">
              <div className="flex flex-col items-center justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Work Entries Found</h3>
                <p className="text-muted-foreground text-center mb-6">
                  {workProgressEntries.length === 0
                    ? 'Start by recording your first work progress entry to track construction activities.'
                    : 'No work entries match your current search and filter criteria.'}
                </p>
                <Button
                  onClick={() => dialog.openDialog()}
                  className="gap-2 transition-all hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Add Work Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full overflow-hidden">
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: 'workType', label: 'Work Type', sortable: true },
                  { key: 'siteName', label: 'Site', sortable: true },
                  { key: 'progressPercentage', label: 'Progress', sortable: true },
                  { key: 'laborHours', label: 'Labor Hours', sortable: true },
                  { key: 'date', label: 'Date', sortable: true },
                  { key: 'status', label: 'Status', sortable: true },
                  { key: 'actions', label: 'Actions', sortable: false },
                ]}
                data={filteredEntries.map((entry) => {
                  const IconComponent = getWorkTypeIcon(entry.workType);
                  return {
                    workType: (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <IconComponent className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{entry.workType}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {entry.description}
                          </div>
                        </div>
                      </div>
                    ),
                    siteName: (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{entry.siteName}</span>
                      </div>
                    ),
                    progressPercentage: (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{entry.progressPercentage}%</span>
                        </div>
                        <Progress value={entry.progressPercentage} className="h-2" />
                      </div>
                    ),
                    laborHours: (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{entry.laborHours}h</span>
                      </div>
                    ),
                    date: (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDateShort(entry.date)}</span>
                      </div>
                    ),
                    status: (
                      <Badge
                        variant={
                          entry.status === 'Completed'
                            ? 'default'
                            : entry.status === 'In Progress'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="text-xs flex items-center gap-1 w-fit"
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            entry.status === 'Completed'
                              ? 'bg-green-500'
                              : entry.status === 'In Progress'
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                          }`}
                        />
                        {entry.status}
                      </Badge>
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
                                  handleEdit(entry);
                                }}
                                className="h-8 w-8 p-0 transition-all hover:bg-primary/10"
                              >
                                <Edit className="h-3 w-3 text-muted-foreground hover:text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit work entry</p>
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
                                  handleDelete(entry.id);
                                }}
                                className="h-8 w-8 p-0 transition-all hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete work entry</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ),
                  };
                })}
                onSort={tableState.setSortField}
                onPageChange={tableState.setCurrentPage}
                pageSize={tableState.itemsPerPage}
                currentPage={tableState.currentPage}
                totalPages={tableState.totalPages(filteredEntries.length)}
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
