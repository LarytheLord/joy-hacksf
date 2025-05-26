'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import ReelCard from '@/components/ReelCard';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [reels, setReels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  
  const router = useRouter();
  const { user } = useAuth();
  

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfileAndReels = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's reels with likes and comments count
        const { data: reelsData, error: reelsError } = await supabase
          .from('reels')
          .select(`
            *,
            profiles:user_id(id, username, avatar_url),
            likes:likes(count),
            comments:comments(count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (reelsError) throw reelsError;
        setReels(reelsData || []);

        // Fetch likes by current user
        const { data: likesData, error: likesError } = await supabase
          .from('likes')
          .select('reel_id')
          .eq('user_id', user.id);
        
        if (likesError) throw likesError;
        
        if (likesData) {
          const likes = likesData.reduce((acc, like) => {
            acc[like.reel_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
          setUserLikes(likes);
        }
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndReels();
  }, [user, router]);

  const handleLike = async (reelId: string) => {
    if (!user) return;

    try {
      const isLiked = userLikes[reelId];
      
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('reel_id', reelId)
          .eq('user_id', user.id);

        setUserLikes(prev => {
          const newLikes = { ...prev };
          delete newLikes[reelId];
          return newLikes;
        });

        // Update likes count in UI
        setReels(prev => prev.map(reel => {
          if (reel.id === reelId) {
            return {
              ...reel,
              likes: reel.likes.filter((like: any) => like.user_id !== user.id)
            };
          }
          return reel;
        }));
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            reel_id: reelId,
            user_id: user.id
          });

        setUserLikes(prev => ({ ...prev, [reelId]: true }));

        // Update likes count in UI
        setReels(prev => prev.map(reel => {
          if (reel.id === reelId) {
            return {
              ...reel,
              likes: [...reel.likes, { user_id: user.id }]
            };
          }
          return reel;
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const navigateToReel = (reelId: string) => {
    router.push(`/reel/${reelId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-32 w-32 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2.5"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-6"></div>
            <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2.5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <Link href="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Go Home
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
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="relative w-24 h-24 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 mb-4 sm:mb-0 sm:mr-6">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt={profile.username} 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <svg className="absolute w-28 h-28 text-gray-400 -left-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.username}</h2>
              {profile?.full_name && (
                <p className="text-gray-600 dark:text-gray-300">{profile.full_name}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Joined {new Date(profile?.created_at).toLocaleDateString()}</p>
              {profile?.bio && (
                <p className="text-gray-700 dark:text-gray-300 mt-2">{profile.bio}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => router.push('/profile/edit')} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* User's Reels */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Reels</h3>
        
        {reels.length > 0 ? (
          <div className="space-y-8">
            {reels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                author={reel.profiles}
                likesCount={reel.likes.length}
                commentsCount={reel.comments.length}
                isLiked={!!userLikes[reel.id]}
                onLike={() => handleLike(reel.id)}
                onComment={() => navigateToReel(reel.id)}
                onShare={() => navigateToReel(reel.id)}
                onCopyCode={() => handleCopyCode(reel.code_snippet)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">No reels yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Share your first code snippet!</p>
            <Link href="/create">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create Reel
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}