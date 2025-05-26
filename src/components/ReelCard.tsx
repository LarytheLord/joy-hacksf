'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Database } from '@/types/database.types';

type Reel = Database['public']['Tables']['reels']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ReelCardProps {
  reel: Reel;
  author: Profile;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onCopyCode: () => void;
}

export default function ReelCard({
  reel,
  author,
  likesCount,
  commentsCount,
  isLiked,
  onLike,
  onComment,
  onShare,
  onCopyCode
}: ReelCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="flex flex-col md:flex-row w-full h-[80vh] md:h-[70vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg my-4">
      {/* Code Snippet Side */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gray-100 dark:bg-gray-800 p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{reel.title}</h3>
          {user && (
            <button 
              onClick={onCopyCode}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
          )}
        </div>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
          <code>{reel.code_snippet}</code>
        </pre>
      </div>

      {/* Result Side */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
        <div className="flex-grow p-4 overflow-auto">
          {reel.result_type === 'text' && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg h-full overflow-auto">
              <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {reel.result_content}
              </pre>
            </div>
          )}
          {reel.result_type === 'image' && (
            <div className="h-full flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image 
                  src={reel.result_content} 
                  alt="Result" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </div>
          )}
          {reel.result_type === 'html_embed' && (
            <div className="h-full">
              <iframe 
                srcDoc={reel.result_content} 
                className="w-full h-full border-0" 
                title="Embedded HTML result"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}
          {reel.result_type === 'video_url' && (
            <div className="h-full flex items-center justify-center">
              <iframe 
                src={reel.result_content} 
                className="w-full h-full border-0" 
                title="Video result"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}
        </div>

        {/* Author and Interaction Bar */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                {author.avatar_url ? (
                  <Image 
                    src={author.avatar_url} 
                    alt={author.username} 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <svg className="absolute w-10 h-10 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                )}
              </div>
              <span className="font-medium text-gray-800 dark:text-white">{author.username}</span>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={onLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>{likesCount}</span>
              </button>
              <button 
                onClick={onComment}
                className="flex items-center space-x-1 text-gray-500 dark:text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span>{commentsCount}</span>
              </button>
              <button 
                onClick={onShare}
                className="text-gray-500 dark:text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}