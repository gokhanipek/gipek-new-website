import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Project() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (!mounted) return;
      if (error) setError(error.message);
      else setProject(data);
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
  if (!project) {
    return (
      <div className="px-6 sm:px-10 py-10">
        <p className="text-neutral-500">Project not found.</p>
        <Link to="/projects" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-2xl px-6 sm:px-10 py-10 sm:py-14">
      <Link
        to="/projects"
        className="text-sm text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        ← Projects
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">{project.title}</h1>
      {project.description && (
        <p className="mt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {project.description}
        </p>
      )}

      {project.thumbnail_url && (
        <img
          src={project.thumbnail_url}
          alt=""
          className="mt-8 w-full rounded-lg border border-neutral-100 dark:border-neutral-800 object-cover"
        />
      )}

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Live →
          </a>
        )}
        {project.repo_url && (
          <a
            href={project.repo_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Source →
          </a>
        )}
      </div>
    </section>
  );
}
