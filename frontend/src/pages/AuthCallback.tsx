import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        toast.error('Authentication failed');
        navigate('/login');
        return;
      }

      try {
        // Set the token temporarily to fetch user profile
        // The setAuth will handle the actual storage after we get user data
        const response = await authApi.getMeWithToken(token);
        const user = response.data.data;
        
        // We don't have the refresh token in the URL for security, 
        // it's already set in the HTTP-only cookie by the server.
        setAuth(user, token, ''); 
        
        toast.success(`Welcome, ${user.firstName}!`);
        navigate('/');
      } catch (err) {
        console.error('OAuth callback error:', err);
        toast.error('Failed to complete sign in');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-surface-600 dark:text-surface-400 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
};
