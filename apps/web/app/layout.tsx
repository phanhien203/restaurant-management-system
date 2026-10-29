import type { ReactNode } from 'react';

// Skeleton root layout; i18n (next-intl), Tailwind and route groups arrive with US-05.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
