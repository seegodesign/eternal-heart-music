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
  useEffect(() => {
    if (!tracks.length || !audioRef.current) return;
    // Don't load the player on mobile
    if (window.matchMedia('(max-width: 640px)').matches) return;
    const idx = Math.floor(Math.random() * tracks.length);
    indexRef.current = idx;
    setTitle(titleFromPath(tracks[idx]));
    audioRef.current.src = tracks[idx];
    audioRef.current.volume = 0.75;
    audioRef.current.load();

    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // Autoplay blocked — start on first user interaction
        const events = ['click', 'keydown', 'touchstart'];
        const startOnInteraction = () => {
          audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
          events.forEach((e) => document.removeEventListener(e, startOnInteraction));
        };
        events.forEach((e) => document.addEventListener(e, startOnInteraction, { once: true }));
      });
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
    if (audioRef.current.paused) {
      try { await audioRef.current.play(); setIsPlaying(true); } catch {}
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

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
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => goToTrack(indexRef.current + 1)}
      />
    </div>
  );
}