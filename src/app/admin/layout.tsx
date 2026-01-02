'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuthContext();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, pathname, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </Container>
    );
  }

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Redirect if not authenticated (will happen in useEffect)
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <Container>
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <nav className="flex gap-4">
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded transition-colors ${
                    pathname === '/admin'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/contests"
                  className={`px-3 py-2 rounded transition-colors ${
                    pathname === '/admin/contests'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Contests
                </Link>
                <Link
                  href="/admin/categories"
                  className={`px-3 py-2 rounded transition-colors ${
                    pathname === '/admin/categories'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Categories
                </Link>
                <Link
                  href="/admin/entries"
                  className={`px-3 py-2 rounded transition-colors ${
                    pathname === '/admin/entries'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Entries
                </Link>
                <Link
                  href="/admin/submit"
                  className={`px-3 py-2 rounded transition-colors ${
                    pathname === '/admin/submit'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Test Submit
                </Link>
                <Link
                  href="/admin/inspiration"
                  className={`px-3 py-2 rounded transition-colors ${
                    pathname === '/admin/inspiration'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Upload
                </Link>
                <Link
                  href="/admin/inspiration/manage"
                  className={`px-3 py-2 rounded transition-colors ${
                    pathname === '/admin/inspiration/manage'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Manage
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">{children}</Container>
    </div>
  );
}
