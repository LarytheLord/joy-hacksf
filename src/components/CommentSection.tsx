'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
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

interface CommentSectionProps {
  reelId: string;
  initialComments: Comment[];
}

export default function CommentSection({ reelId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          reel_id: reelId,
          user_id: user.id,
          content: newComment.trim()
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

  return (
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
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}