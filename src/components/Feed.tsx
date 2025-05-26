'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import ReelItem from './ReelItem';
import { useAuth } from '@/context/AuthContext';

type Reel = Database['public']['Tables']['reels']['Row'];

interface FeedProps {
  initialReels?: any[];
  userId?: string;
  limit?: number;
}

export default function Feed({ initialReels = [], userId, limit = 10 }: FeedProps) {
  const [reels, setReels] = useState<any[]>(initialReels);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const lastReelRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();
  const { user } = useAuth();
  const supabase = createClient();

  // Fetch user likes
  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!user) return;

      try {
        const { data: likes } = await supabase
          .from('likes')
          .select('reel_id')
          .eq('user_id', user.id);
        
        if (likes) {
          const likesMap = likes.reduce((acc, like) => {
            acc[like.reel_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
          setUserLikes(likesMap);
        }
      } catch (err) {
        console.error('Error fetching user likes:', err);
      }
    };

    fetchUserLikes();
  }, [user]);

  // Load more reels when scrolling
  const loadMoreReels = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const lastReel = reels[reels.length - 1];
      const lastCreatedAt = lastReel?.created_at || new Date().toISOString();

      let query = supabase
        .from('reels')
        .select(`
          *,
          profiles:user_id(id, username, avatar_url),
          likes:likes(count),
          comments:comments(count)
        `)
        .order('created_at', { ascending: false })
        .lt('created_at', lastCreatedAt)
        .limit(limit);

      // Filter by user if userId is provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        setReels(prevReels => [...prevReels, ...data]);
        setHasMore(data.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load more reels');
      console.error('Error loading more reels:', err);
    } finally {
      setLoading(false);
    }
  }, [reels, loading, hasMore, limit, userId]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreReels();
      }
    };

    observer.current = new IntersectionObserver(callback, {
      rootMargin: '100px',
    });

    if (lastReelRef.current) {
      observer.current.observe(lastReelRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMoreReels]);

  // Handle like/unlike
  const handleLike = async (reelId: string) => {
    if (!user) return;

    try {
      if (userLikes[reelId]) {
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
        setReels(prevReels =>
          prevReels.map(reel =>
            reel.id === reelId
              ? { ...reel, likes: reel.likes.filter((like: any) => like.user_id !== user.id) }
              : reel
          )
        );
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
        setReels(prevReels =>
          prevReels.map(reel =>
            reel.id === reelId
              ? { ...reel, likes: [...reel.likes, { user_id: user.id }] }
              : reel
          )
        );
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {reels.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">No reels found</h3>
          <p className="text-gray-600 dark:text-gray-400">Be the first to share your code!</p>
        </div>
      )}

      {reels.map((reel, index) => {
        const isLastReel = index === reels.length - 1;
        return (
          <div key={reel.id} ref={isLastReel ? lastReelRef : null}>
            <ReelItem
              reel={reel}
              author={reel.profiles}
              likesCount={reel.likes.length}
              commentsCount={reel.comments.length}
              isLiked={!!userLikes[reel.id]}
              onLike={() => handleLike(reel.id)}
              onComment={() => {}}
              onShare={() => {
                navigator.clipboard.writeText(`${window.location.origin}/reel/${reel.id}`);
                alert('Link copied to clipboard!');
              }}
            />
          </div>
        );
      })}

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}