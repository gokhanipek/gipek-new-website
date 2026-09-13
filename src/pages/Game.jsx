import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Game() {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <section className="px-6 sm:px-10 py-10 sm:py-14">
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

      {game.embed_url ? (
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <iframe
            src={game.embed_url}
            title={game.title}
            className="w-full h-full"
            allow="fullscreen; autoplay; gamepad"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="mt-8 text-neutral-400">This game has no playable embed yet.</p>
      )}
    </section>
  );
}
