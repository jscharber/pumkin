'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn, user } = useAuthContext();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.push('/admin');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      showToast('Successfully logged in', 'success');
      router.push('/admin');
    } catch (error) {
      console.error('Login error:', error);
      showToast(
        error instanceof Error ? error.message : 'Invalid email or password',
        'error'
      );
      setLoading(false);
    }
  };

  return (
    <Container className="py-12">
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
            <p className="text-gray-600">
              Sign in to manage the pumpkin carving contest
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-primary hover:text-secondary transition-colors"
            >
              ← Back to contest
            </a>
          </div>
        </Card>
      </div>
    </Container>
  );
}
