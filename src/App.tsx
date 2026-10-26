import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { About } from './pages/About';
import { Home } from './pages/Home';
import { Library, LibraryLectures, LibraryPrompts, LibraryResources, LibraryTemplates } from './pages/Library';
import { Portfolio } from './pages/Portfolio';
import { Settings } from './pages/Settings';
import { StagePage } from './pages/StagePage';
import { Start } from './pages/Start';
import { Summary } from './pages/Summary';

// Hash-режим: работает на любом статическом хостинге без настройки перенаправлений.
const router = createHashRouter([{
  element: <Layout />,
  children: [
    { path: '/', element: <Home /> },
    { path: '/start', element: <Start /> },
    { path: '/stage/:n', element: <StagePage /> },
    { path: '/summary', element: <Summary /> },
    { path: '/portfolio', element: <Portfolio /> },
    { path: '/library', element: <Library /> },
    { path: '/library/lectures', element: <LibraryLectures /> },
    { path: '/library/prompts', element: <LibraryPrompts /> },
    { path: '/library/templates', element: <LibraryTemplates /> },
    { path: '/library/resources', element: <LibraryResources /> },
    { path: '/about', element: <About /> },
    { path: '/settings', element: <Settings /> },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
}]);

export const App = () => <RouterProvider router={router} />;
