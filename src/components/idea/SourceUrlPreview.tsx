import React, { useState, useEffect } from 'react';
import { ExternalLink, Globe, Youtube, FileText, Loader2 } from 'lucide-react';

interface SourceUrlPreviewProps {
  sourceUrl: string;
}

interface UrlMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: 'youtube' | 'article' | 'other';
}

const SourceUrlPreview: React.FC<SourceUrlPreviewProps> = ({ sourceUrl }) => {
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determine URL type based on domain
  const getUrlType = (url: string): 'youtube' | 'article' | 'other' => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        return 'youtube';
      }
      return 'article';
    } catch {
      return 'other';
    }
  };

  // Extract domain name for display
  const getDomainName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Unknown source';
    }
  };

  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
    } catch {
      return null;
    }
    return null;
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      setError(false);

      try {
        const urlType = getUrlType(sourceUrl);
        
        if (urlType === 'youtube') {
          const videoId = getYouTubeVideoId(sourceUrl);
          if (videoId) {
            // For YouTube, we can use a simple approach to get basic info
            // In a real implementation, you might want to use YouTube API
            // Fetch YouTube video title using oEmbed endpoint
            const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await fetch(oEmbedUrl);
            if (!response.ok) throw new Error('Failed to fetch YouTube metadata');
            const data = await response.json();
            setMetadata({
              title: data.title,
              description: data.author_name ? `By ${data.author_name}` : undefined,
              image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              siteName: 'YouTube',
              type: 'youtube'
            });
          }
        } else {
          // For other URLs, we would typically use a service like:
          // - A custom backend endpoint that fetches metadata
          // - A service like Microlink or LinkPreview
          // For now, we'll show basic info
          // Try to fetch the page and extract the <title> tag
          try {
            const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(sourceUrl)}`);
            const html = await response.text();
            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : getDomainName(sourceUrl);
            setMetadata({
              title,
            //   description: 'Article or webpage content',
              siteName: getDomainName(sourceUrl),
              type: 'article'
            });
          } catch {
            setMetadata({
              title: getDomainName(sourceUrl),
            //   description: 'Article or webpage content',
              siteName: getDomainName(sourceUrl),
              type: 'article'
            });
          }
        }
      } catch (err) {
        console.error('Error fetching URL metadata:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (sourceUrl) {
      fetchMetadata();
    }
  }, [sourceUrl]);

  const getIcon = () => {
    if (metadata?.type === 'youtube') {
      return <Youtube className="w-4 h-4 text-red-600" />;
    } else if (metadata?.type === 'article') {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    return <Globe className="w-4 h-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-600">Loading source preview...</span>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
        <Globe className="w-4 h-4 text-gray-500" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            Source URL
          </div>
          <div className="text-xs text-gray-500 truncate">
            {getDomainName(sourceUrl)}
          </div>
        </div>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
      {/* Icon/Thumbnail */}
      <div className="flex-shrink-0">
        {metadata.image && metadata.type === 'youtube' ? (
          <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
            <img
              src={metadata.image}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if thumbnail fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="w-8 h-8 bg-white mt-1 rounded-full flex items-center justify-center border">
            {getIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {metadata.title || 'Web Article'}
        </div>
        {metadata.description && (
          <div className="text-xs text-gray-600 line-clamp-2 mt-1">
            {metadata.description}
          </div>
        )}
        <div className="flex items-center gap-2 mt-0">
          <span className="text-xs text-gray-500">
            {metadata.type === 'youtube' ? '' : metadata.siteName || getDomainName(sourceUrl)}
          </span>
          <span className="text-xs text-gray-400">
            {metadata.type === 'youtube' ? '' : '•'}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {metadata.type === 'youtube' ? '' : 'Article'}
          </span>
        </div>
      </div>

      {/* External link */}
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 transition-colors"
        title="Open in new tab"
      >
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};

export default SourceUrlPreview;