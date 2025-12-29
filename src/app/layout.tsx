import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pumpkin Carving Contest',
  description: 'Annual pumpkin carving contest with voting and results',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
