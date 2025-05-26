'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Code2, ArrowRight, Mail, Lock } from 'lucide-react';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  mode: AuthMode;
  redirectPath?: string;
}

export function AuthForm({ mode, redirectPath = '/' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (mode === 'signup') {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      // Validate password strength
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.push(redirectPath);
      } else {
        await signUp(email, password);
        setSuccessMessage('Registration successful! Please check your email to confirm your account.');
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${mode === 'login' ? 'sign in' : 'sign up'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500"></div>
        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {mode === 'login' ? "Don't have an account yet? " : 'Already have an account? '}
              <Link 
                href={mode === 'login' ? '/signup' : '/login'} 
                className="text-blue-600 decoration-2 hover:underline font-medium dark:text-blue-500"
              >
                {mode === 'login' ? 'Sign up here' : 'Sign in here'}
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md dark:bg-red-900/30 dark:border-red-500 dark:text-red-400" role="alert">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md dark:bg-green-900/30 dark:border-green-500 dark:text-green-400" role="alert">
              <p className="font-medium">Success</p>
              <p>{successMessage}</p>
            </div>
          )}

          <div className="mt-5">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="py-3 pl-10 pr-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:focus:ring-blue-500 dark:focus:ring-opacity-40" 
                      required 
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="password" 
                      id="password" 
                      name="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="py-3 pl-10 pr-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:focus:ring-blue-500 dark:focus:ring-opacity-40" 
                      required 
                      placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="password" 
                        id="confirm-password" 
                        name="confirm-password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="py-3 pl-10 pr-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:focus:ring-blue-500 dark:focus:ring-opacity-40" 
                        required 
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex items-center justify-end">
                    <Link 
                      href="/reset-password" 
                      className="text-sm text-blue-600 decoration-2 hover:underline font-medium dark:text-blue-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="gradient"
                  size="lg"
                  className="w-full rounded-lg py-3 font-medium transition-all duration-200 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full mr-2" role="status" aria-label="loading"></span>
                      Loading...
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign in' : 'Create account'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}