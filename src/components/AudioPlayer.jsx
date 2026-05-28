import { useState, useEffect, useRef, useCallback } from 'react';

function titleFromPath(path) {
  const name = path.split('/').pop() ?? 'track';
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function PersistentPlayer({ tracks = [] }) {
  const audioRef = useRef(null);
  // Use a ref for the current index to avoid stale closures in event handlers
  const indexRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState('');

  // On mount only — component persists across navigations via transition:persist
  // Only pick a track and display the title; do NOT set src or load audio.
  // Audio is fetched only when the user clicks play.
  useEffect(() => {
    if (!tracks.length || !audioRef.current) return;
    if (window.matchMedia('(max-width: 640px)').matches) return;
    const idx = Math.floor(Math.random() * tracks.length);
    indexRef.current = idx;
    setTitle(titleFromPath(tracks[idx]));
    audioRef.current.volume = 0.75;
  }, []);

  const goToTrack = useCallback(async (nextIdx) => {
    if (!audioRef.current || !tracks.length) return;
    const bounded = ((nextIdx % tracks.length) + tracks.length) % tracks.length;
    const wasPlaying = !audioRef.current.paused;
    indexRef.current = bounded;
    setTitle(titleFromPath(tracks[bounded]));
    audioRef.current.src = tracks[bounded];
    audioRef.current.load();
    if (wasPlaying) {
      try { await audioRef.current.play(); setIsPlaying(true); } catch {}
    }
  }, [tracks]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    // First click: src has not been set yet — load the track now
    if (!audioRef.current.src || audioRef.current.src === window.location.href) {
      audioRef.current.src = tracks[indexRef.current];
      audioRef.current.load();
    }
    if (audioRef.current.paused) {
      try { await audioRef.current.play(); setIsPlaying(true); } catch {}
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [tracks]);

  return (
    <div className="hero__player-layer">
      <div className="hero-player-wrap">
        <p className="hero-player-title" aria-live="polite">
          Now playing: {title}
        </p>
        <div className="hero-player-controls">
          <button
            className="hero-player-side"
            type="button"
            aria-label="Previous track"
            onClick={() => goToTrack(indexRef.current - 1)}
          >
            <span aria-hidden="true">⏮</span>
          </button>
          <button
            className="hero-player-toggle"
            type="button"
            aria-label={isPlaying ? 'Pause ambient track' : 'Play ambient track'}
            onClick={togglePlay}
          >
            <span aria-hidden="true">{isPlaying ? '❚❚' : '▶'}</span>
          </button>
          <button
            className="hero-player-side"
            type="button"
            aria-label="Next track"
            onClick={() => goToTrack(indexRef.current + 1)}
          >
            <span aria-hidden="true">⏭</span>
          </button>
        </div>
      </div>
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => goToTrack(indexRef.current + 1)}
      />
    </div>
  );
}