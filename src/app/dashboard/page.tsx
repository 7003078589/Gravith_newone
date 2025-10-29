'use client';

import { useRouter } from 'next/navigation';

import { Dashboard } from '@/components/Dashboard';

export default function DashboardPage() {
  const router = useRouter();

  const handleNavigate = (section: string) => {
    console.log('Dashboard navigation to:', section);
    router.push(`/${section}`);
  };

  return (
    <main id="main">
      <Dashboard onNavigate={handleNavigate} />
    </main>
  );
}
