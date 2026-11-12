import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Vehicles',
  robots: { index: false, follow: false },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
