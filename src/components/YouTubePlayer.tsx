import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  description?: string;
  onWatched?: () => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId, 
  title, 
  description, 
  onWatched 
}) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handleWatchClick = () => {
    window.open(videoUrl, '_blank');
    if (onWatched) {
      setTimeout(() => onWatched(), 1000); // Mark as watched after opening
    }
  };

  return (
    <Card className="llm-video-card">
      <CardContent className="p-4">
        <div className="relative group cursor-pointer" onClick={handleWatchClick}>
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg group-hover:bg-opacity-30 transition-all">
            <Play className="w-16 h-16 text-white" />
          </div>
        </div>
        <h3 className="llm-subtitle mt-3 text-left">{title}</h3>
        {description && (
          <p className="llm-text text-sm mt-2">{description}</p>
        )}
        <Button 
          onClick={handleWatchClick}
          className="llm-button mt-3 w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Watch on YouTube
        </Button>
      </CardContent>
    </Card>
  );
};

export default YouTubePlayer;