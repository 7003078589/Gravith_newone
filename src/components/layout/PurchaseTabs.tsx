'use client';

import { FileText, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { cn } from '@/lib/utils';

export function PurchaseTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      label: 'Purchase Bills',
      href: '/purchase',
      icon: FileText,
      active: pathname === '/purchase',
    },
    {
      label: 'Material Receipts',
      href: '/purchase/receipt',
      icon: Receipt,
      active: pathname === '/purchase/receipt',
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex gap-1 px-4" aria-label="Purchase navigation tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                tab.active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300',
              )}
              aria-current={tab.active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
