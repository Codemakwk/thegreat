import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email() });

export const ForgotPassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: any) => {
    try {
      await authApi.forgotPassword(data.email);
      toast.success('If an account exists, a reset link has been sent.');
    } catch { toast.error('Something went wrong'); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Forgot Password</h1>
          <p className="text-surface-500">Enter your email and we'll send a reset link</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} error={errors.email?.message as string} {...register('email')} />
            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>Send Reset Link</Button>
          </form>
        </div>
        <p className="text-center text-sm text-surface-500 mt-6">
          <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

const resetSchema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords mismatch', path: ['confirmPassword'] });

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (data: any) => {
    try {
      await authApi.resetPassword({ token, password: data.password });
      toast.success('Password reset! You can now log in.');
      navigate('/login');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Reset failed'); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-surface-500">Enter your new password</p>
        </div>
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="New Password" type="password" placeholder="Min 8 chars" error={errors.password?.message as string} {...register('password')} />
            <Input label="Confirm Password" type="password" placeholder="Confirm" error={errors.confirmPassword?.message as string} {...register('confirmPassword')} />
            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>Reset Password</Button>
          </form>
        </div>
      </div>
    </div>
  );
};
