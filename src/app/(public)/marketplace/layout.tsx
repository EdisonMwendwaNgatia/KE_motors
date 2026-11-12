import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Cars for Sale in Kenya',
  description: 'Search verified vehicles for sale across Kenya by make, model, price, year, and listing source.',
  alternates: { canonical: '/marketplace' },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
