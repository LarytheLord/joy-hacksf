'use client';
import Image from 'next/image';

type ResultType = 'text' | 'image' | 'html_embed' | 'video_url';

interface ResultViewerProps {
  type: ResultType;
  content: string;
  className?: string;
}

export default function ResultViewer({ type, content, className = '' }: ResultViewerProps) {
  return (
    <div className={`w-full h-full overflow-auto ${className}`}>
      {type === 'text' && (
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg h-full overflow-auto">
          <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {content}
          </pre>
        </div>
      )}
      
      {type === 'image' && (
        <div className="h-full flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image 
              src={content} 
              alt="Result" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
      )}
      
      {type === 'html_embed' && (
        <div className="h-full">
          <iframe 
            srcDoc={content} 
            className="w-full h-full border-0" 
            title="Embedded HTML result"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
      
      {type === 'video_url' && (
        <div className="h-full flex items-center justify-center">
          <iframe 
            src={content} 
            className="w-full h-full border-0" 
            title="Video result"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
    </div>
  );
}