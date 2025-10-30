'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Vendor {
  name: string;
}

interface Material {
  name: string;
}

interface Vehicle {
  registration_number: string;
}

interface PurchaseData {
  organization_id: string;
  site_id: string;
  vendor_id: string;
  vendors?: Vendor;
  material_id: string;
  materials?: Material;
  purchase_id: string;
  purchase_date: string;
  material_name?: string;
  quantity: number;
  unit_of_measure: string;
  unit?: string;
  rate: number;
  value: number;
  total_amount?: number;
  vehicle_id?: string;
  vehicles?: Vehicle;
  filled_weight: number;
  empty_weight: number;
  net_weight: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ExpenseData {
  organization_id: string;
  site_id: string;
  expense_id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number | null;
  quantity: number;
  unit: string;
  rate: number | null;
  vehicle_info: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function RealDataDisplay() {
  const [purchaseData, setPurchaseData] = useState<PurchaseData[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load purchase data from mock API (Next.js serverless route)
        const purchaseResponse = await fetch('/api/db/purchases');
        if (purchaseResponse.ok) {
          const purchaseResult = await purchaseResponse.json();
          if (purchaseResult.success) {
            setPurchaseData(purchaseResult.data);
          }
        }

        // Load expense data from public mock JSON
        const expenseResponse = await fetch('/expense-summary.json');
        if (expenseResponse.ok) {
          const expenseJson = await expenseResponse.json();
          setExpenseData(expenseJson);
        }

        setError(null);
      } catch (err) {
        setError(
          'Failed to load data from API. Make sure the backend server is running on port 3001.',
        );
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPurchaseAmount = purchaseData.reduce(
    (sum, purchase) => sum + (purchase.total_amount || 0),
    0,
  );
  const totalExpenseAmount = expenseData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalPurchaseQuantity = purchaseData.reduce(
    (sum, purchase) => sum + (purchase.quantity || 0),
    0,
  );
  const totalExpenseQuantity = expenseData.reduce(
    (sum, expense) => sum + (expense.quantity || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading real data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gavith Build - Real Data Dashboard
        </h1>
        <p className="text-gray-600">Live data from your CSV files</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{purchaseData.length}</div>
            <p className="text-xs text-gray-500">{formatCurrency(totalPurchaseAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expenseData.length}</div>
            <p className="text-xs text-gray-500">{formatCurrency(totalExpenseAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Materials Purchased</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalPurchaseQuantity.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500">Tons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Diesel Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalExpenseQuantity.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500">Liters</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tabs */}
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases">Purchase Records ({purchaseData.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expense Records ({expenseData.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Material Purchase Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Purchase ID</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Vendor</th>
                      <th className="text-left p-2">Material</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Rate</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Vehicle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseData.slice(0, 20).map((purchase, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-xs">{purchase.purchase_id}</td>
                        <td className="p-2">{formatDate(purchase.purchase_date)}</td>
                        <td className="p-2">
                          <Badge variant="outline">{purchase.vendors?.name || 'N/A'}</Badge>
                        </td>
                        <td className="p-2">
                          {purchase.materials?.name || purchase.material_name}
                        </td>
                        <td className="p-2">
                          {purchase.quantity} {purchase.unit_of_measure || purchase.unit}
                        </td>
                        <td className="p-2">{formatCurrency(purchase.rate)}</td>
                        <td className="p-2 font-semibold">
                          {formatCurrency(purchase.value || purchase.total_amount || 0)}
                        </td>
                        <td className="p-2 text-xs">
                          {purchase.vehicles?.registration_number || purchase.vehicle_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {purchaseData.length > 20 && (
                  <div className="text-center mt-4 text-gray-500">
                    Showing first 20 of {purchaseData.length} records
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Diesel Expense Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Expense ID</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Vehicle</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Rate</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseData.slice(0, 20).map((expense, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-xs">{expense.expense_id}</td>
                        <td className="p-2">{formatDate(expense.expense_date)}</td>
                        <td className="p-2 text-xs">{expense.vehicle_info}</td>
                        <td className="p-2">
                          {expense.quantity} {expense.unit}
                        </td>
                        <td className="p-2">
                          {expense.rate ? formatCurrency(expense.rate) : 'N/A'}
                        </td>
                        <td className="p-2 font-semibold">
                          {expense.amount ? formatCurrency(expense.amount) : 'N/A'}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-green-600">
                            {expense.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {expenseData.length > 20 && (
                  <div className="text-center mt-4 text-gray-500">
                    Showing first 20 of {expenseData.length} records
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
