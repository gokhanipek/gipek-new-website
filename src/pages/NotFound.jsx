import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="px-6 sm:px-10 py-16">
      <h1 className="text-3xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-neutral-500">This page doesn&rsquo;t exist.</p>
      <Link to="/" className="mt-6 inline-block text-blue-600 dark:text-blue-400 hover:underline">
        ← Home
      </Link>
    </section>
  );
}
