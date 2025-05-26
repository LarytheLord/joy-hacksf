'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Code2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  if (user && typeof window !== 'undefined' && window.location.pathname === '/') {
    window.location.href = '/explore';
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 dark:bg-gray-900/90 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Joy Hacks</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/explore"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium dark:text-gray-300 dark:hover:text-white"
            >
              Explore
            </Link>
            <Link
              href="/community"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium dark:text-gray-300 dark:hover:text-white"
            >
              Community
            </Link>
            
            {user ? (
              <div className="relative">
                <button 
                  type="button" 
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <div className="relative w-8 h-8 overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      href="/create" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Reel
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-4 transition-all duration-200 hover:scale-105"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            type="button" 
            className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-1 px-2">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/explore"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/community"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Community
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/create"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Reel
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="mt-4 space-y-2">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-2 text-center font-medium text-blue-600 bg-gray-50 hover:bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full px-4 py-2 text-center font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}