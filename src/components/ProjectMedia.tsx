import React, { useState } from 'react';
import { ProjectMedia as ProjectMediaType } from '../data/projects';

interface ProjectMediaProps {
  media: ProjectMediaType;
  className?: string;
  priority?: boolean;
  autoPlay?: boolean;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/(?:vimeo\.com\/)(\d+)/);
  return match ? match[1] : null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export function isVideoMedia(media: ProjectMediaType): boolean {
  if (media.type === 'video') return true;
  const url = (media.url || '').toLowerCase();
  return (
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.mov') ||
    url.endsWith('.m4v') ||
    url.includes('vimeo.com') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be')
  );
}

export const ProjectMediaView: React.FC<ProjectMediaProps> = ({
  media,
  className = '',
  priority = false,
  autoPlay = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const isVideo = isVideoMedia(media);
  const vimeoId = isVideo ? getVimeoId(media.url) : null;
  const youTubeId = isVideo ? getYouTubeId(media.url) : null;

  return (
    <div className={`relative w-full overflow-hidden bg-[#0d0d0d] ${className}`}>
      {/* Vimeo Embed */}
      {isVideo && vimeoId && (
        <div className="relative w-full aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&title=0&byline=0&portrait=0`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={media.caption || 'Vimeo video'}
          />
        </div>
      )}

      {/* YouTube Embed */}
      {isVideo && youTubeId && !vimeoId && (
        <div className="relative w-full aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youTubeId}?rel=0`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={media.caption || 'YouTube video'}
          />
        </div>
      )}

      {/* Direct HTML5 Video (Firebase Storage or direct mp4/webm/mov) */}
      {isVideo && !vimeoId && !youTubeId && media.url && (
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <video
            controls
            playsInline
            preload="metadata"
            src={media.url}
            poster={media.posterUrl}
            autoPlay={autoPlay}
            muted={autoPlay}
            loop={autoPlay}
            className="w-full h-full object-contain bg-black"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Image Display */}
      {!isVideo && (
        <div className="relative w-full h-full min-h-[220px] bg-[#f4f4f4] flex items-center justify-center">
          {(!loaded || error) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f4f4f4] text-[#666666] p-6 text-center">
              <div className="w-8 h-8 border border-[#cccccc] mb-2 flex items-center justify-center text-xs font-tabular">
                IMG
              </div>
              <span className="text-xs uppercase tracking-widest text-[#666666]">
                {media.caption || 'Exhibition Artifact'}
              </span>
            </div>
          )}

          {media.url && !error && (
            <img
              src={media.url}
              alt={media.caption || 'Artwork view'}
              referrerPolicy="no-referrer"
              loading={priority ? 'eager' : 'lazy'}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </div>
      )}

      {media.caption && (
        <div className="px-3 py-1.5 bg-[#fbfbfb] border-t border-[#eeeeee] text-[11px] text-[#666666] font-tabular">
          {media.caption}
        </div>
      )}
    </div>
  );
};
