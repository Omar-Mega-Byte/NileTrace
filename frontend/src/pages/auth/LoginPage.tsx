import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      // Navigation is handled automatically by PublicRoute when isAuthenticated becomes true
      // Adding a small delay to ensure state update
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to login');
      if (error.errors) {
        setErrors(
          Object.fromEntries(
            Object.entries(error.errors).map(([key, value]) => [key, value[0]])
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your NileTrace account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          autoFocus
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="link font-medium">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
