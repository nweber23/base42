import { useState, useEffect } from 'react';
import Card from '../components/Card';

interface LoginProps {
  onLogin: (login: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for authentication callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const login = urlParams.get('login');
    const errorMessage = urlParams.get('message');
    
    if (login) {
      // Successfully authenticated, log the user in
      onLogin(login);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorMessage) {
      // Authentication failed
      setError(decodeURIComponent(errorMessage));
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onLogin]);

  const handleLogin = () => {
    setLoading(true);
    setError('');
    
    // Redirect to backend OAuth endpoint
    window.location.href = 'http://localhost:5000/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,206,84,0.1),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.05),transparent_50%)] dark:opacity-60 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-0">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              base42
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Connect with your 42 intranet account
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Redirecting to 42 intra...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-5.085 5.086a.968.968 0 01-1.371 0L6.4 8.534a.968.968 0 010-1.371l.343-.343a.968.968 0 011.371 0l3.2 3.2 4.057-4.057a.968.968 0 011.371 0l.343.343a.968.968 0 01-.517 1.854z"/>
                  </svg>
                  Login with 42 Intranet
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You'll be redirected to the 42 intranet for secure authentication
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;