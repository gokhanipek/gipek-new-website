import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function limitWords(text, max = 24) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text;
  return words.slice(0, max).join(' ') + '…';
}

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (error) setError(error.message);
      else setArticles(data ?? []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="max-w-2xl px-6 sm:px-10 py-10 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight">Blog</h1>

      {loading && <p className="mt-8 text-neutral-400">Loading…</p>}
      {error && <p className="mt-8 text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && articles.length === 0 && (
        <p className="mt-8 text-neutral-400">No articles yet.</p>
      )}

      <ul className="mt-8 space-y-8">
        {articles.map((article) => (
          <li key={article.id}>
            <Link to={`/articles/${article.slug}`} className="group block">
              <h2 className="text-lg font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h2>
              <p className="mt-0.5 text-xs text-neutral-400">
                {formatDate(article.created_at)}
              </p>
              {article.excerpt && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {limitWords(article.excerpt)}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
