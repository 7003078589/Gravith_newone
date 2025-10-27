'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, ShoppingCart } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { getActiveMaterials } from './materialMasterData';
import { useMaterialReceipts } from './materialReceiptsContext';
import type { SharedMaterial } from './materialsContext';
import { useMaterials } from './materialsContext';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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

interface PurchaseFormProps {
  selectedSite?: string;
  editingMaterial?: SharedMaterial | null;
  onSubmit?: (materialData: Omit<SharedMaterial, 'id'>) => void;
  onCancel?: () => void;
}

// Available sites
const sites = [
  'Rajiv Nagar Residential Complex',
  'Green Valley Commercial Center',
  'Sunshine Apartments Phase II',
  'Metro Heights Tower A',
  'Oakwood Villas',
];

// Available vendors
const availableVendors = [
  {
    name: 'UltraTech Cement Ltd',
    contactPerson: 'Rajesh Kumar',
    category: 'Cement & Binding Materials',
  },
  {
    name: 'JSW Steel',
    contactPerson: 'Anita Sharma',
    category: 'Steel & Metal Works',
  },
  {
    name: 'ACC Concrete',
    contactPerson: 'Mohan Das',
    category: 'Concrete & Ready Mix',
  },
];

// Available units
const units = [
  { value: 'bags', label: 'Bags' },
  { value: 'nos', label: 'Numbers' },
  { value: 'cum', label: 'Cubic Meter' },
  { value: 'sqm', label: 'Square Meter' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'tons', label: 'Tons' },
  { value: 'liter', label: 'Liters' },
  { value: 'meter', label: 'Meters' },
  { value: 'cft', label: 'Cubic Feet' },
];

// Form schema with Zod validation
const purchaseFormSchema = z.object({
  vendor: z.string().min(1, 'Please select a vendor.'),
  site: z.string().min(1, 'Please select a site.'),
  materialName: z.string().min(1, 'Please select a material.'),
  quantity: z.number().positive('Quantity must be greater than zero.'),
  unit: z.string().min(1, 'Please select a unit.'),
  unitRate: z.number().positive('Unit rate must be greater than zero.'),
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  purchaseDate: z.date(),
  linkedReceiptIds: z.array(z.string()).optional(),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

export function PurchaseForm({
  selectedSite,
  editingMaterial,
  onSubmit,
  onCancel,
}: PurchaseFormProps) {
  const { addMaterial, updateMaterial } = useMaterials();
  const { receipts, linkReceiptToPurchase } = useMaterialReceipts();
  const isEditMode = !!editingMaterial;
  const formId = isEditMode ? 'purchase-edit-form' : 'purchase-new-form';
  const [isClient, setIsClient] = React.useState(false);

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      vendor: editingMaterial?.vendor || '',
      site: selectedSite || editingMaterial?.site || '',
      materialName: editingMaterial?.materialName || '',
      quantity: editingMaterial?.quantity || undefined,
      unit: editingMaterial?.unit || '',
      unitRate: editingMaterial?.unitRate || undefined,
      invoiceNumber: editingMaterial?.invoiceNumber || '',
      purchaseDate: editingMaterial?.purchaseDate
        ? new Date(editingMaterial.purchaseDate)
        : undefined,
      linkedReceiptIds: editingMaterial?.linkedReceiptId ? [editingMaterial.linkedReceiptId] : [],
    },
  });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Get unlinked receipts directly from receipts array
  const unlinkedReceipts = React.useMemo(() => {
    return receipts.filter((receipt) => !receipt.linkedPurchaseId);
  }, [receipts]);

  // Format date helper - memoized to prevent recreating on every render
  const formatDate = React.useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  function handleFormSubmit(data: PurchaseFormData) {
    const totalAmount = data.quantity * data.unitRate;

    const materialData: Omit<SharedMaterial, 'id'> = {
      materialName: data.materialName,
      site: data.site,
      quantity: data.quantity,
      unit: data.unit,
      unitRate: data.unitRate,
      costPerUnit: data.unitRate,
      totalAmount,
      vendor: data.vendor,
      invoiceNumber: data.invoiceNumber,
      purchaseDate: data.purchaseDate.toISOString().split('T')[0],
      addedBy: 'Current User',
      consumedQuantity: 0,
      remainingQuantity: data.quantity,
      linkedReceiptId: data.linkedReceiptIds?.[0], // Store first receipt ID for backward compatibility
    };

    let purchaseId: string;
    if (editingMaterial) {
      updateMaterial(editingMaterial.id, materialData);
      purchaseId = editingMaterial.id;
      toast.success('Purchase updated successfully!', {
        description: `${data.materialName} has been updated.`,
      });
    } else {
      addMaterial(materialData);
      // In real app, we'd get the ID back from addMaterial
      purchaseId = 'temp-id'; // Placeholder
      toast.success('Purchase recorded successfully!', {
        description: `${data.materialName} has been added to inventory.`,
      });
    }

    // Link receipts if selected
    if (data.linkedReceiptIds && data.linkedReceiptIds.length > 0 && purchaseId) {
      let linkedCount = 0;
      data.linkedReceiptIds.forEach((receiptId) => {
        if (linkReceiptToPurchase(receiptId, purchaseId)) {
          linkedCount++;
        }
      });
      if (linkedCount > 0) {
        toast.success(`Linked ${linkedCount} receipt(s) to purchase`);
      }
    }

    onSubmit?.(materialData);
  }

  const quantity = form.watch('quantity');
  const unitRate = form.watch('unitRate');
  const totalAmount = quantity && unitRate ? quantity * unitRate : 0;

  const getSubmitButtonText = () =>
    form.formState.isSubmitting
      ? isEditMode
        ? 'Updating Purchase...'
        : 'Recording Purchase...'
      : isEditMode
        ? 'Update Purchase'
        : 'Record Purchase';

  // Prevent hydration issues by only rendering after client-side mount
  if (!isClient) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="px-6 py-6">
        <form id={formId} onSubmit={form.handleSubmit(handleFormSubmit)}>
          <FieldGroup>
            {/* Vendor Row */}
            <Controller
              name="vendor"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-vendor`}>
                    Vendor <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={`${formId}-vendor`} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVendors.map((vendor) => (
                        <SelectItem key={vendor.name} value={vendor.name}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>Supplier of the material.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Site and Material Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="site"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-site`}>
                      Site <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!!selectedSite}
                    >
                      <SelectTrigger
                        id={`${formId}-site`}
                        aria-invalid={fieldState.invalid}
                        className={selectedSite ? 'bg-muted' : ''}
                      >
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map((site) => (
                          <SelectItem key={site} value={site}>
                            {site}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>Delivery destination for this material.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="materialName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-material`}>
                      Material <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={`${formId}-material`} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {getActiveMaterials().map((material) => (
                          <SelectItem key={material.id} value={material.name}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>Choose the material being purchased.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Quantity, Unit, and Unit Rate Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-quantity`}>
                      Quantity <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-quantity`}
                      type="number"
                      step="0.01"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter quantity"
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : Number(value));
                      }}
                      value={field.value ?? ''}
                    />
                    <FieldDescription>Total quantity purchased.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="unit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-unit`}>
                      Unit <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={`${formId}-unit`} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>Unit of measurement.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="unitRate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-unit-rate`}>
                      Unit Rate (₹) <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-unit-rate`}
                      type="number"
                      step="0.01"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter rate"
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : Number(value));
                      }}
                      value={field.value ?? ''}
                    />
                    <FieldDescription>Price per unit.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Invoice and Purchase Date Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="invoiceNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-invoice`}>
                      Invoice Number <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-invoice`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter invoice number"
                      autoComplete="off"
                    />
                    <FieldDescription>Vendor invoice reference number.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="purchaseDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-purchase-date`}>
                      Purchase Date <span className="text-destructive">*</span>
                    </FieldLabel>
                    <DatePicker
                      date={field.value}
                      onSelect={(date) => field.onChange(date)}
                      placeholder="Select purchase date"
                      showClear={!isEditMode}
                      ariaLabel="Purchase date"
                    />
                    <FieldDescription>Date of material purchase.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Link Material Receipts (Optional) */}
            <Controller
              name="linkedReceiptIds"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedIds = field.value || [];

                return (
                  <FieldSet data-invalid={fieldState.invalid}>
                    <FieldLegend>Link Material Receipts (Optional)</FieldLegend>
                    <FieldDescription className="mb-3">
                      Select one or more material receipts to link with this purchase. Click on rows
                      to select.
                    </FieldDescription>

                    {unlinkedReceipts.length === 0 ? (
                      <div className="rounded-md border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No unlinked receipts available
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">
                                  <span className="sr-only">Select</span>
                                </TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Vehicle Number</TableHead>
                                <TableHead>Material</TableHead>
                                <TableHead className="text-right">Net Weight (kg)</TableHead>
                                <TableHead className="text-right">Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {unlinkedReceipts.map((receipt) => {
                                const isSelected = selectedIds.includes(receipt.id);

                                const handleRowClick = () => {
                                  const currentIds = Array.isArray(field.value) ? field.value : [];

                                  if (currentIds.includes(receipt.id)) {
                                    field.onChange(currentIds.filter((id) => id !== receipt.id));
                                  } else {
                                    field.onChange([...currentIds, receipt.id]);
                                  }
                                };

                                return (
                                  <TableRow
                                    key={receipt.id}
                                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                      isSelected ? 'bg-primary/5' : ''
                                    }`}
                                    onClick={handleRowClick}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleRowClick();
                                      }
                                    }}
                                    aria-label={`${isSelected ? 'Deselect' : 'Select'} receipt ${receipt.vehicleNumber}`}
                                  >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          const currentIds = Array.isArray(field.value)
                                            ? field.value
                                            : [];

                                          if (checked) {
                                            field.onChange([...currentIds, receipt.id]);
                                          } else {
                                            field.onChange(
                                              currentIds.filter((id) => id !== receipt.id),
                                            );
                                          }
                                        }}
                                        aria-label={`Select receipt ${receipt.vehicleNumber}`}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      {formatDate(receipt.date)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="font-mono">
                                        {receipt.vehicleNumber}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{receipt.materialName}</TableCell>
                                    <TableCell className="text-right font-medium">
                                      {receipt.netWeight.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                      {formatDate(receipt.createdAt)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        {selectedIds.length > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant="secondary" className="px-3 py-1">
                              {selectedIds.length} receipt(s) selected
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange([])}
                              className="h-7 text-xs"
                            >
                              Clear selection
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldSet>
                );
              }}
            />

            {/* Total Amount Display */}
            {totalAmount > 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
                  <span className="flex items-center gap-1 text-lg font-bold text-primary">
                    <DollarSign className="h-4 w-4" />₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Field orientation="horizontal" className="justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {getSubmitButtonText()}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
