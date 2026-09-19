import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { useTheme } from '../lib/ThemeContext.jsx';
import { socialLinks } from '../utils/constants';

// Duration (ms) of the sidebar slide. The content slide-in waits for this.
const SLIDE_MS = 600;
// Duration (ms) of the content's own slide-in/out animation.
const CONTENT_SLIDE_MS = 400;

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
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-offset-neutral-900"
    >
      {/* Sliding knob */}
      <span
        style={{ transitionDuration: '200ms' }}
        className={`relative z-10 h-4 w-4 rounded-full bg-neutral-500 dark:bg-neutral-200 shadow transition-transform ease-in-out ${
          isDark ? 'translate-x-[28px]' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function Layout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Home route ("/") shows the intro centered at full width (100/0).
  // Any other route expands into the 20/80 layout with content on the right.
  const collapsed = location.pathname === '/';

  // The content column only becomes visible AFTER the sidebar has finished
  // sliding to the left. Going back home, it hides immediately.
  const [contentVisible, setContentVisible] = useState(!collapsed);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (collapsed) {
      // Hide content right away, then let the sidebar expand back to center.
      setContentVisible(false);
    } else {
      // Wait for the sidebar slide to finish, then reveal the content.
      timerRef.current = setTimeout(() => setContentVisible(true), SLIDE_MS);
    }
    return () => clearTimeout(timerRef.current);
  }, [collapsed]);

  return (
    <div className="min-h-screen lg:flex lg:flex-row">
      {/* Left sidebar — ALWAYS a fixed 364px box (no width animation at all).
          Centered on home purely via a transform: translateX, and pinned to
          the left (translate-x-0, its natural static position) on every
          other route. Transform-only animation avoids layout thrash and the
          "jump" that width/margin transitions caused. */}
      <aside
        style={{
          transitionDuration: `${SLIDE_MS}ms`,
          transform: collapsed ? 'translateX(calc(50vw - 182px))' : undefined,
        }}
        className={`lg:min-h-screen lg:sticky lg:top-0 lg:w-[364px] lg:flex-none flex flex-col transition-transform ease-in-out px-6 sm:px-8 py-10 ${
          collapsed ? 'lg:border-r-0' : 'lg:border-r border-neutral-100 dark:border-neutral-800'
        }`}
      >
        {/* Inner block always has the SAME fixed width — text never
            rewraps, only the outer <aside> box moves. */}
        <div className="w-full lg:w-[300px]">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="font-semibold tracking-tight">
              gokhanipek.dev
            </Link>
            <ThemeToggle />
          </div>

          <p className="mt-6 text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Hi, I&rsquo;m Gokhan and I&rsquo;m a Frontend Developer. I sometimes {' '}
            <Link
              to="/articles"
              className="text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              write
            </Link>{' '}
            and play around with{' '}
            <Link
              to="/games"
              className="text-neutral-900 dark:text-neutral-100 underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              things
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
            {/* <NavLink to="/projects" className={navLinkClass}>
              Projects
            </NavLink> */}
            {user && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="mt-8">
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
        </div>
      </aside>

      {/* Right content — takes the remaining width (calc(100% - sidebar)) via
          flex-1. Once the sidebar finishes sliding, this slides in from the
          right (translate-x) instead of just popping into place.
          TODO(>1920px): content area gets very wide on ultra-wide screens;
          consider capping it or centering. Not urgent. */}
      <main
        style={{ transitionDuration: `${CONTENT_SLIDE_MS}ms` }}
        className={`flex-1 overflow-x-hidden transition-[opacity_transform] ease-out ${
          // Mobile: home has no separate content column at all (sidebar takes
          // the full screen), so it's safe to fully remove it from layout.
          // Desktop: never use `display:none` here — toggling display kills
          // the transition (no previous frame to animate from), which is
          // what caused the "jump" instead of a slide. Use opacity/visibility
          // /pointer-events instead, which the browser can interpolate.
          collapsed ? 'hidden lg:block' : 'block'
        } ${
          contentVisible
            ? 'opacity-100 visible translate-x-0'
            : 'opacity-0 invisible pointer-events-none translate-x-6'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
