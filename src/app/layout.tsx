import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'WattWise — Energieverbrauch im Blick',
  description:
    'Verfolge deinen Stromverbrauch, behalte Kosten im Blick und erkenne Einsparpotenziale mit WattWise.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-background text-text antialiased">
        <a href="#main-content" className="skip-nav">
          Zum Inhalt springen
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
