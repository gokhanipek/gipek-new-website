import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Game() {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View modes: 'normal' (aspect-video card), 'fullsize' (fills the content
  // area), or 'fullscreen' (browser Fullscreen API on the game container).
  const [mode, setMode] = useState('normal');
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (!mounted) return;
      if (error) setError(error.message);
      else setGame(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const enterFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      setMode('fullscreen');
    } catch {
      // If the browser blocks it, fall back to fullsize so the game is still
      // usable at max size.
      setMode('fullsize');
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    setMode('normal');
  }, []);

  // Keep our state in sync when the user exits fullscreen via Esc or the
  // browser chrome rather than our button.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Only drop out of the fullscreen mode; leave 'fullsize' untouched.
        setMode((m) => (m === 'fullscreen' ? 'normal' : m));
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // Esc leaves fullsize (browser handles Esc for real fullscreen itself).
  useEffect(() => {
    if (mode !== 'fullsize') return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMode('normal');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode]);

  if (loading) {
    return <div className="px-6 sm:px-10 py-10 text-neutral-400">Loading…</div>;
  }
  if (error) {
    return <div className="px-6 sm:px-10 py-10 text-red-600 dark:text-red-400">{error}</div>;
  }
  if (!game) {
    return (
      <div className="px-6 sm:px-10 py-10">
        <p className="text-neutral-500">Game not found.</p>
        <Link to="/games" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to games
        </Link>
      </div>
    );
  }

  const btnClass =
    'inline-flex items-center gap-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors';

  // The iframe is rendered once and reused across all modes so the game does
  // not reload when switching views.
  const gameFrame = game.embed_url ? (
    <iframe
      src={game.embed_url}
      title={game.title}
      className="w-full h-full"
      allow="fullscreen; autoplay; gamepad"
      allowFullScreen
    />
  ) : null;

  // Container wrapper class changes with the mode. In fullsize it is fixed to
  // the viewport minus nothing (it overlays the content area); in fullscreen
  // the browser sizes it, so we just make sure it fills 100%.
  const containerClass =
    mode === 'normal'
      ? 'mt-8 aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900'
      : mode === 'fullsize'
      ? 'fixed inset-0 z-50 bg-black'
      : 'w-full h-full bg-black'; // fullscreen

  return (
    <section className="px-6 sm:px-10 py-10 sm:py-14">
      {/* Header is hidden while in fullsize/fullscreen so the game has the
          whole area to itself. */}
      {mode === 'normal' && (
        <>
          <Link
            to="/games"
            className="text-sm text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ← Games
          </Link>

          <h1 className="mt-6 text-2xl font-bold tracking-tight">{game.title}</h1>
          {game.description && (
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">{game.description}</p>
          )}
        </>
      )}

      {game.embed_url ? (
        <>
          {mode === 'normal' && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => setMode('fullsize')} className={btnClass}>
                ⤢ Fullsize
              </button>
              <button type="button" onClick={enterFullscreen} className={btnClass}>
                ⛶ Fullscreen
              </button>
            </div>
          )}

          {/* Mobile-only notice: these games are built for desktop. Point
              players at the standalone game page so they can play it directly
              (and use the browser's own fullscreen / rotation) instead of the
              cramped inline embed. */}
          {mode === 'normal' && (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300 sm:hidden">
              <p>This game isn&rsquo;t optimized for mobile devices and may not play well here.</p>
              <a
                href={game.embed_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-medium underline underline-offset-2"
              >
                Open the game in its own page →
              </a>
            </div>
          )}

          <div ref={containerRef} className={containerClass}>
            {/* Exit button overlays the game in fullsize/fullscreen modes. */}
            {mode !== 'normal' && (
              <button
                type="button"
                onClick={mode === 'fullscreen' ? exitFullscreen : () => setMode('normal')}
                className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-3 py-1.5 text-sm text-white backdrop-blur hover:bg-black/80 transition-colors"
              >
                ← Back
              </button>
            )}
            {gameFrame}
          </div>
        </>
      ) : (
        <p className="mt-8 text-neutral-400">This game has no playable embed yet.</p>
      )}
    </section>
  );
}
