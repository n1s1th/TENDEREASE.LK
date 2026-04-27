import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function VendorRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.variable} style={{ "--font-sans": "var(--font-inter)" } as React.CSSProperties}>
      {children}
    </div>
  );
}
