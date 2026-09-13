import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import RichTextEditor from '../components/RichTextEditor.jsx';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) return;
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        setError(error.message);
      } else if (data) {
        setTitle(data.title || '');
        setSlug(data.slug || '');
        setSlugTouched(true);
        setExcerpt(data.excerpt || '');
        setCoverUrl(data.cover_url || '');
        setContent(data.content || '');
        setPublished(Boolean(data.published));
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id, isEditing]);

  const handleTitleChange = (value) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const finalSlug = slug.trim() || slugify(title);

    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      cover_url: coverUrl.trim() || null,
      content,
      published,
    };

    let result;
    if (isEditing) {
      result = await supabase.from('articles').update(payload).eq('id', id).select().maybeSingle();
    } else {
      result = await supabase.from('articles').insert(payload).select().maybeSingle();
    }

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    navigate('/admin');
  };

  if (loading) {
    return <div className="px-6 sm:px-10 py-10 text-neutral-400">Loading…</div>;
  }

  const inputClass =
    'w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-3 py-2 focus:border-neutral-900 dark:focus:border-neutral-100 focus:outline-none';
  const labelClass = 'block text-sm text-neutral-600 dark:text-neutral-400 mb-1';

  return (
    <section className="max-w-2xl px-6 sm:px-10 py-10 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight">
        {isEditing ? 'Edit article' : 'New article'}
      </h1>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>

        <div>
          <label className={labelClass}>Excerpt (short summary for the list)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Cover image URL (optional)</label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>

        <div>
          <label className={labelClass}>Content</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published (visible to everyone)
        </label>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-md border border-neutral-200 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
