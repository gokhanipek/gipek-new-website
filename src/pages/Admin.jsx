import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Admin() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, published, created_at')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setArticles(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this article? This cannot be undone.')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <section className="max-w-2xl px-6 sm:px-10 py-10 sm:py-14">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
        <Link
          to="/admin/articles/new"
          className="rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          New article
        </Link>
      </div>

      {loading && <p className="mt-8 text-neutral-400">Loading…</p>}
      {error && <p className="mt-8 text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="mt-8 divide-y divide-neutral-100 dark:divide-neutral-800">
          {articles.length === 0 && (
            <li className="py-6 text-neutral-400">No articles yet.</li>
          )}
          {articles.map((article) => (
            <li key={article.id} className="py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{article.title}</p>
                <p className="text-sm text-neutral-400">
                  {article.published ? 'Published' : 'Draft'} · /{article.slug}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm shrink-0">
                <Link
                  to={`/admin/articles/${article.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove(article.id)}
                  className="text-red-600 dark:text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
