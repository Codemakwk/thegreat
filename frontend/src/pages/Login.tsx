import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await authApi.login(data);
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-surface-500">Sign in to your account to continue</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-surface-400 hover:text-surface-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-surface-600 dark:text-surface-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Sign In
            </Button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-surface-200 dark:border-surface-700"></span>
              </div>
              <span className="relative bg-white dark:bg-surface-800 px-4 text-xs text-surface-500 uppercase font-medium">Or continue with</span>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/auth/google`}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700 transition-all font-medium shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};
