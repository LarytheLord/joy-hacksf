'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import UploadForm from '@/components/UploadForm';
import Link from 'next/link';

export default function CreateReel() {
  const { user } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">You need to be logged in</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to create a reel</p>
          <Link href="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Create a New Reel</h1>
        <UploadForm />
      </div>
    </div>
  );
}
