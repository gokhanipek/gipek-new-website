import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Articles from './pages/Articles.jsx';
import Article from './pages/Article.jsx';
import Games from './pages/Games.jsx';
import Game from './pages/Game.jsx';
import Projects from './pages/Projects.jsx';
import Project from './pages/Project.jsx';
import Login from './pages/Login.jsx';
import Admin from './pages/Admin.jsx';
import ArticleEditor from './pages/ArticleEditor.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Articles />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:slug" element={<Article />} />
        <Route path="games" element={<Games />} />
        <Route path="games/:slug" element={<Game />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<Project />} />
        <Route path="login" element={<Login />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/articles/new"
          element={
            <ProtectedRoute>
              <ArticleEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/articles/:id"
          element={
            <ProtectedRoute>
              <ArticleEditor />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
