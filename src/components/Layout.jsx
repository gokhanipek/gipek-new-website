import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { useTheme } from '../lib/ThemeContext.jsx';
import { socialLinks } from '../utils/constants';

const navLinkClass = ({ isActive }) =>
  `block py-1 text-sm transition-colors ${
    isActive
      ? 'text-neutral-900 dark:text-neutral-100 font-medium'
      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
  }`;

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-lg leading-none"
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-full flex flex-col lg:flex-row">
      {/* Left sidebar — 30% */}
      <aside className="lg:w-[30%] lg:min-h-screen lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r border-neutral-100 dark:border-neutral-800 px-6 sm:px-8 py-10 flex flex-col">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="font-semibold tracking-tight">
              gokhanipek.dev
            </Link>
            <ThemeToggle />
          </div>

          <p className="mt-6 text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Hi, I&rsquo;m Gokhan and I&rsquo;m a Frontend Developer. I sometimes write{' '}
            <Link
              to="/articles"
              className="text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              articles
            </Link>{' '}
            and play around with{' '}
            <Link
              to="/games"
              className="text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              games
            </Link>
            .
          </p>

          <nav className="mt-8">
            <NavLink to="/articles" className={navLinkClass}>
              Blog
            </NavLink>
            <NavLink to="/games" className={navLinkClass}>
              Games
            </NavLink>
            <NavLink to="/projects" className={navLinkClass}>
              Projects
            </NavLink>
            {user && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="mt-8 lg:mt-auto pt-8">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {socialLinks.map((item) => (
              <a
                key={item.text}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                {item.text}
              </a>
            ))}
          </div>
          {user && (
            <button
              onClick={() => signOut()}
              className="mt-3 text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Right content — 70% */}
      <main className="lg:w-[70%] flex-1">
        <Outlet />
      </main>
    </div>
  );
}
