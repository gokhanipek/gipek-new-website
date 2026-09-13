import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext.jsx';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Article() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!mounted) return;
      if (error) setError(error.message);
      else setArticle(data);
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

  if (!article) {
    return (
      <div className="px-6 sm:px-10 py-10">
        <p className="text-neutral-500">Article not found.</p>
        <Link to="/articles" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-2xl px-6 sm:px-10 py-10 sm:py-14">
      <Link
        to="/articles"
        className="text-sm text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        ← Blog
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
        <p className="mt-2 text-sm text-neutral-400">{formatDate(article.created_at)}</p>
        {user && (
          <Link
            to={`/admin/articles/${article.id}`}
            className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Edit
          </Link>
        )}
      </header>

      {article.cover_url && (
        <img src={article.cover_url} alt="" className="mt-8 rounded-lg w-full object-cover" />
      )}

      <div
        className="article-content mt-8"
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />
    </article>
  );
}
