import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('games')
        .select('id, title, slug, description, thumbnail_url')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (error) setError(error.message);
      else setGames(data ?? []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="max-w-3xl px-6 sm:px-10 py-10 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight">Games</h1>

      {loading && <p className="mt-8 text-neutral-400">Loading…</p>}
      {error && <p className="mt-8 text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && games.length === 0 && (
        <p className="mt-8 text-neutral-400">No games yet.</p>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
        {games.map((game) => (
          <Link key={game.id} to={`/games/${game.slug}`} className="group block">
            {game.thumbnail_url && (
              <img
                src={game.thumbnail_url}
                alt=""
                className="w-full aspect-video object-cover rounded-lg border border-neutral-100 dark:border-neutral-800"
              />
            )}
            <h2 className="mt-3 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {game.title}
            </h2>
            {game.description && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {game.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
