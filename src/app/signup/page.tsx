'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';
import { Code2 } from 'lucide-react';

export default function SignUp() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Joy Hacks</span>
        </Link>
      </div>
      
      <AuthForm mode="signup" redirectPath="/login?message=Account created successfully. Please sign in." />
    </div>
  );


}