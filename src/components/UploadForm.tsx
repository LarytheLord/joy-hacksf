'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type ResultType = 'text' | 'image' | 'html_embed' | 'video_url';

interface UploadFormProps {
  onSuccess?: (reelId: string) => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [resultType, setResultType] = useState<ResultType>('text');
  const [resultContent, setResultContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile || !user) throw new Error('No image file selected or user not logged in');
    
    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    // Create a unique file name
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('reel-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });
    
    if (error) throw error;
    
    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('reel-images')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Validate inputs
      if (!title.trim()) throw new Error('Title is required');
      if (!codeSnippet.trim()) throw new Error('Code snippet is required');
      if (!codeLanguage.trim()) throw new Error('Code language is required');
      
      let finalResultContent = resultContent;
      
      // Handle image upload if result type is image
      if (resultType === 'image') {
        if (imageFile) {
          finalResultContent = await uploadImage();
        } else if (!resultContent.trim()) {
          throw new Error('Please either upload an image or provide an image URL');
        }
      } else if (resultType !== 'text' && !resultContent.trim()) {
        throw new Error(`${resultType === 'html_embed' ? 'HTML content' : 'Video URL'} is required`);
      }

      if (!user) throw new Error('You must be logged in to create a reel');

      // Create the reel
      const { data, error: insertError } = await supabase
        .from('reels')
        .insert({
          user_id: user.id,
          title: title.trim(),
          code_snippet: codeSnippet.trim(),
          code_language: codeLanguage.trim(),
          result_type: resultType,
          result_content: finalResultContent.trim(),
        })
        .select();

      if (insertError) throw insertError;

      // Handle success
      if (data && data[0]) {
        if (onSuccess) {
          onSuccess(data[0].id);
        } else {
          router.push(`/reel/${data[0].id}`);
        }
      } else {
        throw new Error('Failed to create reel');
      }
    } catch (err: any) {
      console.error('Error creating reel:', err);
      setError(err.message || 'Failed to create reel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
      <div className="mb-6">
        <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter a title for your reel"
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="code-language" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Code Language
        </label>
        <select
          id="code-language"
          value={codeLanguage}
          onChange={(e) => setCodeLanguage(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="cpp">C++</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="ruby">Ruby</option>
          <option value="php">PHP</option>
          <option value="swift">Swift</option>
          <option value="kotlin">Kotlin</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="markdown">Markdown</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label htmlFor="code-snippet" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Code Snippet
        </label>
        <textarea
          id="code-snippet"
          value={codeSnippet}
          onChange={(e) => setCodeSnippet(e.target.value)}
          rows={8}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline font-mono"
          placeholder="Paste your code here"
          required
        ></textarea>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Result Type
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="text"
              checked={resultType === 'text'}
              onChange={() => setResultType('text')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Text</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="image"
              checked={resultType === 'image'}
              onChange={() => setResultType('image')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Image</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="html_embed"
              checked={resultType === 'html_embed'}
              onChange={() => setResultType('html_embed')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">HTML Embed</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="video_url"
              checked={resultType === 'video_url'}
              onChange={() => setResultType('video_url')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Video URL</span>
          </label>
        </div>
      </div>
      
      <div className="mb-6">
        {resultType === 'text' && (
          <>
            <label htmlFor="result-content" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Result Text
            </label>
            <textarea
              id="result-content"
              value={resultContent}
              onChange={(e) => setResultContent(e.target.value)}
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter the result of your code"
              required
            ></textarea>
          </>
        )}
        
        {resultType === 'image' && (
          <>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Image Upload or URL
            </label>
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="block w-full text-sm text-gray-500 dark:text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  dark:file:bg-blue-900 dark:file:text-blue-200
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
              />
              {imageFile && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected file: {imageFile.name}
                </p>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </div>
            <div className="mb-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
              OR
            </div>
            <input
              type="text"
              value={resultContent}
              onChange={(e) => setResultContent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter image URL"
            />
          </>
        )}
        
        {resultType === 'html_embed' && (
          <>
            <label htmlFor="result-content" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              HTML Content
            </label>
            <textarea
              id="result-content"
              value={resultContent}
              onChange={(e) => setResultContent(e.target.value)}
              rows={6}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline font-mono"
              placeholder="Enter HTML code to embed"
              required
            ></textarea>
          </>
        )}
        
        {resultType === 'video_url' && (
          <>
            <label htmlFor="result-content" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Video URL
            </label>
            <input
              type="text"
              id="result-content"
              value={resultContent}
              onChange={(e) => setResultContent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              required
            />
          </>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      <div className="flex items-center justify-end">
        <Link href="/">
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
          >
            Cancel
          </button>
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Reel'}
        </button>
      </div>
    </form>
  );
}