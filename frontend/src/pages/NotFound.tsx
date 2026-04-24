import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Page Not Found</h2>
        <p className="text-surface-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <Link to="/">
          <Button size="lg">
            <Home className="w-5 h-5" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
