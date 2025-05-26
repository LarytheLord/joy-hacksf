'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function EditProfilePage() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setUsername(data.username || '');
          setFullName(data.full_name || '');
          setAvatarUrl(data.avatar_url || '');
          setBio(data.bio || '');
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // Validate username (required)
      if (!username.trim()) {
        throw new Error('Username is required');
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          bio: bio.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-md mx-auto text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2.5"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Edit Profile</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="full-name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="avatar-url" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Avatar URL
            </label>
            <input
              type="text"
              id="avatar-url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter URL for your avatar image"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="bio" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Tell us about yourself"
            ></textarea>
          </div>
          
          <div className="flex items-center justify-between">
            <Link href="/profile">
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}