'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import ReelCard from '@/components/ReelCard';
import Image from 'next/image';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export default function ReelPage() {
  const [reel, setReel] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const reelId = params.id as string;

  useEffect(() => {
    if (!reelId) return;
    
    const fetchReel = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch reel with author profile
        const { data: reelData, error: reelError } = await supabase
          .from('reels')
          .select(`
            *,
            profiles:user_id(id, username, avatar_url)
          `)
          .eq('id', reelId)
          .single();

        if (reelError) throw reelError;
        if (!reelData) throw new Error('Reel not found');

        setReel(reelData);

        // Fetch comments with user profiles
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            user:user_id(id, username, avatar_url)
          `)
          .eq('reel_id', reelId)
          .order('created_at', { ascending: false })

        if (commentsError) throw commentsError;
        setComments(commentsData || []);

        // Fetch likes count
        const { count, error: likesCountError } = await supabase
          .from('likes')
          .select('id', { count: 'exact' })
          .eq('reel_id', reelId);

        if (likesCountError) throw likesCountError;
        setLikesCount(count || 0);

        // Check if current user has liked this reel
        if (user) {
          const { data: likeData, error: likeError } = await supabase
            .from('likes')
            .select('id')
            .eq('reel_id', reelId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (likeError) throw likeError;
          setIsLiked(!!likeData);
        }
      } catch (err: any) {
        console.error('Error fetching reel:', err);
        setError(err.message || 'Failed to load reel');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReel();
  }, [reelId, user]);

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('reel_id', reelId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            reel_id: reelId,
            user_id: user.id
          })

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          reel_id: reelId,
          user_id: user.id,
          content: newComment.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          id,
          content,
          created_at,
          user:user_id(id, username, avatar_url)
        `);

      if (error) throw error;

      if (data && data[0]) {
        setComments([data[0], ...comments]);
        setNewComment('');
      }
    } catch (err: any) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (reel?.code_snippet) {
      navigator.clipboard.writeText(reel.code_snippet);
      alert('Code copied to clipboard!');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Reel Card */}
        <ReelCard
          key={reel.id}
          reel={reel}
          author={reel.profiles}
          likesCount={likesCount}
          commentsCount={comments.length}
          isLiked={isLiked}
          onLike={handleLike}
          onComment={() => document.getElementById('comment-input')?.focus()}
          onShare={handleShare}
          onCopyCode={handleCopyCode}
        />
        
        {/* Comments Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Comments ({comments.length})</h3>
          
          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex items-start space-x-4">
                <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                  {user.user_metadata?.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt={user.user_metadata?.username || 'User'} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </div>
                <div className="flex-grow">
                  <textarea
                    id="comment-input"
                    rows={3}
                    className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Sign in to join the conversation</p>
              <Link href="/login">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Sign In
                </button>
              </Link>
            </div>
          )}
          
          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0">
                    {comment.user.avatar_url ? (
                      <Image 
                        src={comment.user.avatar_url} 
                        alt={comment.user.username} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mr-2">{comment.user.username}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

if (error || !reel) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
  );
  }

  if (error || !reel) {
    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Reel Card */}
        <ReelCard
          key={reel.id}
          reel={reel}
          author={reel.profiles}
          likesCount={likesCount}
          commentsCount={comments.length}
          isLiked={isLiked}
          onLike={handleLike}
          onComment={() => document.getElementById('comment-input')?.focus()}
          onShare={handleShare}
          onCopyCode={handleCopyCode}
        />
        
        {/* Comments Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Comments ({comments.length})</h3>
          
          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex items-start space-x-4">
                <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                  {user.user_metadata?.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt={user.user_metadata?.username || 'User'} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </div>
                <div className="flex-grow">
                  <textarea
                    id="comment-input"
                    rows={3}
                    className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Sign in to join the conversation</p>
              <Link href="/login">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Sign In
                </button>
              </Link>
            </div>
          )}
          
          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0">
                    {comment.user.avatar_url ? (
                      <Image 
                        src={comment.user.avatar_url} 
                        alt={comment.user.username} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mr-2">{comment.user.username}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

if (error || !reel) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error || 'Reel not found'}</span>
          </div>
          <div className="mt-4">
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Reel Card */}
        <ReelCard
          key={reel.id}
          reel={reel}
          author={reel.profiles}
          likesCount={likesCount}
          commentsCount={comments.length}
          isLiked={isLiked}
          onLike={handleLike}
          onComment={() => document.getElementById('comment-input')?.focus()}
          onShare={handleShare}
          onCopyCode={handleCopyCode}
        />
        
        {/* Comments Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Comments ({comments.length})</h3>
          
          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex items-start space-x-4">
                <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                  {user.user_metadata?.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt={user.user_metadata?.username || 'User'} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </div>
                <div className="flex-grow">
                  <textarea
                    id="comment-input"
                    rows={3}
                    className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Sign in to join the conversation</p>
              <Link href="/login">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Sign In
                </button>
              </Link>
            </div>
          )}
          
          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0">
                    {comment.user.avatar_url ? (
                      <Image 
                        src={comment.user.avatar_url} 
                        alt={comment.user.username} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mr-2">{comment.user.username}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}