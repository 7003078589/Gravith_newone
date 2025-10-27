'use client';

import type { LucideIcon } from 'lucide-react';
import React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TabItem {
  value: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  tabsContentClassName?: string;
}

export function TabNavigation({
  tabs,
  defaultValue,
  className = 'w-full',
  tabsListClassName = 'grid w-full grid-cols-4 mb-8',
  tabsTriggerClassName = 'flex items-center gap-2',
  tabsContentClassName = 'space-y-6',
}: TabNavigationProps) {
  const defaultTab = defaultValue || tabs[0]?.value;

  return (
    <Tabs defaultValue={defaultTab} className={className}>
      <TabsList className={tabsListClassName}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className={tabsTriggerClassName}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className={tabsContentClassName}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
