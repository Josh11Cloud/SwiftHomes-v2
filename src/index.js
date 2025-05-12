import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { FavoritesProvider } from './context/FavoritesContext';
import App from './App';
import FavoritesView from './components/FavoritesView';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    ),
    children: [
      {
        index: true,
        element: null,
      },
      {
        path: 'favoritos',
        element: <FavoritesView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} fallbackElement={<div>Cargando...</div>} />
  </React.StrictMode>
);