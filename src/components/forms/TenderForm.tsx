'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { projectTypes } from '../shared/tenderData';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Tender } from '@/types';

interface TenderFormProps {
  mode: 'new' | 'edit';
  tender?: Tender;
  onSubmit: (
    tenderData: Omit<
      Tender,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'documentChecklist'
      | 'convertedToSiteId'
      | 'conversionDate'
    >,
  ) => void;
  onCancel: () => void;
}

// Form schema with Zod validation
const tenderFormSchema = z
  .object({
    tenderNumber: z
      .string()
      .min(3, 'Tender number must be at least 3 characters.')
      .max(50, 'Tender number must be at most 50 characters.'),
    name: z
      .string()
      .min(3, 'Tender name must be at least 3 characters.')
      .max(200, 'Tender name must be at most 200 characters.'),
    client: z
      .string()
      .min(3, 'Client name must be at least 3 characters.')
      .max(100, 'Client name must be at most 100 characters.'),
    projectType: z.string().min(1, 'Project type is required.'),
    location: z
      .string()
      .min(3, 'Location must be at least 3 characters.')
      .max(300, 'Location must be at most 300 characters.'),
    contactPerson: z
      .string()
      .min(2, 'Contact person name must be at least 2 characters.')
      .max(100, 'Contact person name must be at most 100 characters.'),
    contactEmail: z.string().email('Please enter a valid email address.'),
    contactPhone: z
      .string()
      .min(10, 'Phone number must be at least 10 characters.')
      .max(15, 'Phone number must be at most 15 characters.'),
    tenderAmount: z
      .number()
      .positive('Tender amount must be greater than zero.')
      .min(10000, 'Tender amount must be at least ₹10,000.'),
    emdAmount: z
      .number()
      .positive('EMD amount must be greater than zero.')
      .min(100, 'EMD amount must be at least ₹100.'),
    emdPaid: z.boolean().default(false),
    emdPaidDate: z.date().nullable().optional(),
    emdPaidReference: z.string().max(100).optional(),
    submissionDate: z.date(),
    openingDate: z.date().nullable().optional(),
    description: z.string().max(1000, 'Description must be at most 1000 characters.').optional(),
    evaluationCriteria: z
      .string()
      .max(500, 'Evaluation criteria must be at most 500 characters.')
      .optional(),
    status: z.enum(['draft', 'submitted']),
    notes: z.string().max(500, 'Notes must be at most 500 characters.').optional(),
  })
  .refine(
    (data) => {
      if (data.openingDate && data.submissionDate) {
        return data.openingDate > data.submissionDate;
      }
      return true;
    },
    {
      message: 'Opening date must be after the submission date.',
      path: ['openingDate'],
    },
  )
  .refine((data) => data.emdAmount < data.tenderAmount, {
    message: 'EMD amount must be less than tender amount.',
    path: ['emdAmount'],
  })
  .refine(
    (data) => {
      if (data.emdPaid && !data.emdPaidDate) {
        return false;
      }
      return true;
    },
    {
      message: 'EMD payment date is required when EMD is marked as paid.',
      path: ['emdPaidDate'],
    },
  );

type TenderFormData = z.infer<typeof tenderFormSchema>;

export default function TenderForm({ mode, tender, onSubmit, onCancel }: TenderFormProps) {
  const isEditMode = mode === 'edit';
  const formId = isEditMode ? 'tender-edit-form' : 'tender-new-form';
  const [isClient, setIsClient] = React.useState(false);

  // Generate tender number suggestion
  const generateTenderNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `TND-${year}-${randomNum}`;
  };

  const form = useForm<TenderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tenderFormSchema) as any,
    defaultValues: {
      tenderNumber: tender?.tenderNumber || generateTenderNumber(),
      name: tender?.name || '',
      client: tender?.client || '',
      projectType: tender?.projectType || '',
      location: tender?.location || '',
      contactPerson: tender?.contactPerson || '',
      contactEmail: tender?.contactEmail || '',
      contactPhone: tender?.contactPhone || '',
      tenderAmount: undefined,
      emdAmount: undefined,
      emdPaid: tender?.emdPaid || false,
      emdPaidDate: tender?.emdPaidDate ? new Date(tender.emdPaidDate) : null,
      emdPaidReference: tender?.emdPaidReference || '',
      submissionDate: tender?.submissionDate ? new Date(tender.submissionDate) : undefined,
      openingDate: tender?.openingDate ? new Date(tender.openingDate) : null,
      description: tender?.description || '',
      evaluationCriteria: tender?.evaluationCriteria || '',
      status: (tender?.status as 'draft' | 'submitted') || 'draft',
      notes: tender?.notes || '',
    },
  });

  const watchEmdPaid = form.watch('emdPaid');

  React.useEffect(() => {
    setIsClient(true);
    // Set the numeric values only on the client side
    if (tender?.tenderAmount) {
      form.setValue('tenderAmount', tender.tenderAmount);
    }
    if (tender?.emdAmount) {
      form.setValue('emdAmount', tender.emdAmount);
    }
  }, [tender, form]);

  // Update form values when tender data changes in edit mode
  React.useEffect(() => {
    if (isEditMode && tender) {
      form.reset({
        tenderNumber: tender.tenderNumber,
        name: tender.name,
        client: tender.client,
        projectType: tender.projectType,
        location: tender.location,
        contactPerson: tender.contactPerson,
        contactEmail: tender.contactEmail,
        contactPhone: tender.contactPhone,
        tenderAmount: tender.tenderAmount,
        emdAmount: tender.emdAmount,
        emdPaid: tender.emdPaid,
        emdPaidDate: tender.emdPaidDate ? new Date(tender.emdPaidDate) : null,
        emdPaidReference: tender.emdPaidReference || '',
        submissionDate: new Date(tender.submissionDate),
        openingDate: tender.openingDate ? new Date(tender.openingDate) : null,
        description: tender.description,
        evaluationCriteria: tender.evaluationCriteria,
        status: tender.status as 'draft' | 'submitted',
        notes: tender.notes,
      });
    }
  }, [tender, isEditMode, form]);

  function handleFormSubmit(data: TenderFormData) {
    // Transform the data to match the expected Tender interface
    const tenderData: Omit<
      Tender,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'documentChecklist'
      | 'convertedToSiteId'
      | 'conversionDate'
    > = {
      tenderNumber: data.tenderNumber,
      name: data.name,
      client: data.client,
      organizationId: 'org1', // TODO: Get from context
      tenderAmount: data.tenderAmount,
      emdAmount: data.emdAmount,
      emdPaid: data.emdPaid,
      emdPaidDate: data.emdPaidDate ? data.emdPaidDate.toISOString() : null,
      emdPaidReference: data.emdPaidReference || null,
      emdReturned: false,
      emdReturnDate: null,
      emdReturnReference: null,
      submissionDate: data.submissionDate.toISOString(),
      openingDate: data.openingDate ? data.openingDate.toISOString() : null,
      location: data.location,
      projectType: data.projectType,
      contactPerson: data.contactPerson,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      status: data.status,
      description: data.description || '',
      evaluationCriteria: data.evaluationCriteria || '',
      notes: data.notes || '',
    };

    onSubmit(tenderData);

    // Show appropriate success message
    if (isEditMode) {
      toast.success('Tender updated successfully!', {
        description: `${data.tenderNumber} has been updated.`,
      });
    } else {
      toast.success('Tender created successfully!', {
        description: `${data.tenderNumber} has been added to your tenders.`,
      });
    }
  }

  const getSubmitButtonText = () =>
    form.formState.isSubmitting
      ? isEditMode
        ? 'Updating Tender...'
        : 'Adding Tender...'
      : isEditMode
        ? 'Update Tender'
        : 'Add Tender';

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
      <CardContent className="pt-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form id={formId} onSubmit={form.handleSubmit(handleFormSubmit) as any}>
          <FieldGroup>
            {/* Section 1: Basic Information */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="tenderNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-tender-number`}>
                        Tender Number <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${formId}-tender-number`}
                        aria-invalid={fieldState.invalid}
                        placeholder="TND-2024-001"
                        autoComplete="off"
                      />
                      <FieldDescription>Unique tender identification number.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="status"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-status`}>
                        Status <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id={`${formId}-status`} aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>Current status of the tender.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-name`}>
                      Tender Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-name`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Construction of Residential Complex"
                      autoComplete="off"
                    />
                    <FieldDescription>Enter the full name of the tender project.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="client"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-client`}>
                        Client Name <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${formId}-client`}
                        aria-invalid={fieldState.invalid}
                        placeholder="Municipal Corporation"
                        autoComplete="off"
                      />
                      <FieldDescription>Name of the tendering organization.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="projectType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-project-type`}>
                        Project Type <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id={`${formId}-project-type`}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>Category of the construction project.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Section 2: Location & Contact */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="text-lg font-semibold">Location & Contact Information</h3>
              <Controller
                name="location"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-location`}>
                      Location <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-location`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Andheri West, Mumbai, Maharashtra"
                      autoComplete="off"
                    />
                    <FieldDescription>Complete address of the project site.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  name="contactPerson"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-contact-person`}>
                        Contact Person <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${formId}-contact-person`}
                        aria-invalid={fieldState.invalid}
                        placeholder="Rajesh Kumar"
                        autoComplete="off"
                      />
                      <FieldDescription>Client&apos;s point of contact.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="contactEmail"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-contact-email`}>
                        Contact Email <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${formId}-contact-email`}
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="contact@client.com"
                        autoComplete="email"
                      />
                      <FieldDescription>Email for tender correspondence.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="contactPhone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-contact-phone`}>
                        Contact Phone <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${formId}-contact-phone`}
                        type="tel"
                        aria-invalid={fieldState.invalid}
                        placeholder="+91-9876543210"
                        autoComplete="tel"
                      />
                      <FieldDescription>Phone number for contact.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Section 3: Financial Details */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="text-lg font-semibold">Financial Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="tenderAmount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-tender-amount`}>
                        Tender Amount (₹) <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${formId}-tender-amount`}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        placeholder="50000000"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        value={field.value ?? ''}
                        style={{ appearance: 'textfield', MozAppearance: 'textfield' }}
                      />
                      <FieldDescription>Total estimated tender amount.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="emdAmount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-emd-amount`}>
                        EMD Amount (₹) <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${formId}-emd-amount`}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        placeholder="1000000"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        value={field.value ?? ''}
                        style={{ appearance: 'textfield', MozAppearance: 'textfield' }}
                      />
                      <FieldDescription>Earnest Money Deposit amount.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-4">
                <Controller
                  name="emdPaid"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${formId}-emd-paid`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor={`${formId}-emd-paid`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        EMD Payment Completed
                      </label>
                    </div>
                  )}
                />

                {watchEmdPaid && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pl-6 border-l-2 border-primary/20">
                    <Controller
                      name="emdPaidDate"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`${formId}-emd-paid-date`}>
                            EMD Payment Date <span className="text-destructive">*</span>
                          </FieldLabel>
                          <DatePicker
                            date={field.value || undefined}
                            onSelect={(date) => field.onChange(date)}
                            placeholder="Select payment date"
                            ariaLabel="EMD payment date"
                          />
                          <FieldDescription>Date when EMD was paid.</FieldDescription>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <Controller
                      name="emdPaidReference"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`${formId}-emd-paid-reference`}>
                            Payment Reference
                          </FieldLabel>
                          <Input
                            {...field}
                            id={`${formId}-emd-paid-reference`}
                            aria-invalid={fieldState.invalid}
                            placeholder="EMD/2024/001"
                            autoComplete="off"
                          />
                          <FieldDescription>Transaction or reference number.</FieldDescription>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Important Dates */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="text-lg font-semibold">Important Dates</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="submissionDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-submission-date`}>
                        Submission Date <span className="text-destructive">*</span>
                      </FieldLabel>
                      <DatePicker
                        date={field.value}
                        onSelect={(date) => field.onChange(date)}
                        placeholder="Select submission date"
                        ariaLabel="Tender submission date"
                      />
                      <FieldDescription>Last date for tender submission.</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="openingDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`${formId}-opening-date`}>Opening Date</FieldLabel>
                      <DatePicker
                        date={field.value || undefined}
                        onSelect={(date) => field.onChange(date)}
                        placeholder="Select opening date"
                        minDate={form.watch('submissionDate')}
                        showClear={true}
                        ariaLabel="Tender opening date"
                      />
                      <FieldDescription>
                        Date when tender will be opened (optional).
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Section 5: Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Details</h3>
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-description`}>Description</FieldLabel>
                    <Textarea
                      {...field}
                      id={`${formId}-description`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Detailed description of the tender project..."
                      rows={4}
                    />
                    <FieldDescription>
                      Additional details about the project (optional, max 1000 characters).
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="evaluationCriteria"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-evaluation-criteria`}>
                      Evaluation Criteria
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={`${formId}-evaluation-criteria`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Technical capability (40%), Financial bid (40%), Past experience (20%)"
                      rows={3}
                    />
                    <FieldDescription>
                      Tender evaluation criteria (optional, max 500 characters).
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="notes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-notes`}>Notes</FieldLabel>
                    <Textarea
                      {...field}
                      id={`${formId}-notes`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Internal notes..."
                      rows={3}
                    />
                    <FieldDescription>
                      Internal notes or remarks (optional, max 500 characters).
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t">
        <Field orientation="horizontal" className="justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={form.formState.isSubmitting}>
            {getSubmitButtonText()}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
