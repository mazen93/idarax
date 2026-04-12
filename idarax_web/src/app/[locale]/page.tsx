import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';
import { getLandingContent, getPlans } from '@/lib/public-api';

export const metadata: Metadata = {
  title: 'Idarax – The All-in-One Restaurant & Retail POS Platform',
  description: 'Manage your tables, kitchen, inventory, and staff from one powerful platform. Start your free trial today.',
  openGraph: {
    title: 'Idarax POS Platform',
    description: 'Enterprise restaurant & retail management in one app.',
    type: 'website',
  },
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let content: Record<string, any> = {};
  let plans: any[] = [];

  try {
    [content, plans] = await Promise.all([getLandingContent(), getPlans()]);
  } catch {
    // If backend is not running, use default content
  }

  return <LandingPage content={content} plans={plans} locale={locale} />;
}
